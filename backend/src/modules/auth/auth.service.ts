import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registers a new user. If organizationName is supplied, creates the Organization
   * and links the user as owner of the organization.
   */
  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email address is already in use.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          fullName: dto.fullName,
          phone: dto.phone,
          defaultRole: 'client_user',
          status: 'active',
        },
      });

      if (dto.organizationName) {
        // Create organization
        const slug = dto.organizationName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

        const organization = await tx.organization.create({
          data: {
            name: dto.organizationName,
            slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
            status: 'active',
          },
        });

        // Create membership
        await tx.organizationMembership.create({
          data: {
            organizationId: organization.id,
            userId: user.id,
            role: 'org_owner',
            status: 'active',
          },
        });
      }

      const { passwordHash: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  /**
   * Logins a user and issues short-lived access and long-lived rotating refresh tokens.
   */
  async login(dto: LoginDto, ip: string, userAgent: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('User account is suspended or inactive.');
    }

    // Create session
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        deviceName: dto.deviceName || 'Unknown Device',
        deviceFingerprint: dto.deviceFingerprint,
        ip,
        userAgent,
        lastSeenAt: new Date(),
      },
    });

    // Generate tokens
    const accessToken = await this.generateAccessToken(user.id, user.defaultRole, session.id);
    const rawRefreshToken = this.generateOpaqueToken();
    const tokenHash = this.hashToken(rawRefreshToken);

    // Save refresh token
    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 30); // 30 days

    await this.prisma.refreshToken.create({
      data: {
        sessionId: session.id,
        userId: user.id,
        tokenHash,
        expiresAt: refreshExpiry,
      },
    });

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: 900, // 15 minutes
    };
  }

  /**
   * Refreshes access token and rotates refresh token using rotating refresh token flow.
   * Performs reuse detection and revokes full session chain if reuse is detected.
   */
  async refresh(dto: RefreshDto, ip: string, userAgent: string) {
    const tokenHash = this.hashToken(dto.refreshToken);

    // Look up refresh token in the DB
    const dbToken = await this.prisma.refreshToken.findFirst({
      where: { tokenHash },
      include: {
        session: true,
        user: true,
      },
    });

    // 1. Reuse detection: If token was already revoked or session is revoked/revokedAt set
    if (!dbToken || dbToken.revokedAt || dbToken.session.revokedAt) {
      if (dbToken) {
        // Reuse detected: Revoke all refresh tokens and the session
        await this.prisma.$transaction(async (tx) => {
          await tx.session.update({
            where: { id: dbToken.sessionId },
            data: { revokedAt: new Date() },
          });
          await tx.refreshToken.updateMany({
            where: { sessionId: dbToken.sessionId },
            data: { revokedAt: new Date() },
          });
        });
      }
      throw new UnauthorizedException('Compromised refresh token chain. Session has been fully revoked.');
    }

    // Check expiry
    if (dbToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token is expired.');
    }

    // 2. Rotate the Refresh Token
    const rawRefreshToken = this.generateOpaqueToken();
    const newHash = this.hashToken(rawRefreshToken);

    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + 30); // 30 days

    let accessToken = '';

    await this.prisma.$transaction(async (tx) => {
      // Invalidate current refresh token
      await tx.refreshToken.update({
        where: { id: dbToken.id },
        data: { revokedAt: new Date() },
      });

      // Create new rotating refresh token
      await tx.refreshToken.create({
        data: {
          sessionId: dbToken.sessionId,
          userId: dbToken.userId,
          tokenHash: newHash,
          expiresAt: refreshExpiry,
          rotatedFromId: dbToken.id,
        },
      });

      // Update session last seen
      await tx.session.update({
        where: { id: dbToken.sessionId },
        data: {
          lastSeenAt: new Date(),
          ip,
          userAgent,
        },
      });

      accessToken = await this.generateAccessToken(
        dbToken.userId,
        dbToken.user.defaultRole,
        dbToken.sessionId,
      );
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: 900,
    };
  }

  /**
   * Logouts current user by revoking the session.
   */
  async logout(sessionId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.session.update({
        where: { id: sessionId },
        data: { revokedAt: new Date() },
      });
      await tx.refreshToken.updateMany({
        where: { sessionId },
        data: { revokedAt: new Date() },
      });
    });
    return { success: true };
  }

  /**
   * Logouts all active devices for the user by revoking all user sessions.
   */
  async logoutAll(userId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await tx.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });
    return { success: true };
  }

  /**
   * Generates a password reset single-use token in the database.
   */
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException('User with this email address does not exist.');
    }

    const rawToken = this.generateOpaqueToken();
    const tokenHash = this.hashToken(rawToken);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // In local development, we return the token directly so developers can verify forgot-reset flow easily
    return {
      success: true,
      message: 'Password reset token generated successfully.',
      token: rawToken,
    };
  }

  /**
   * Verifies reset token, updates password, and revokes all user sessions.
   */
  async resetPassword(token: string, newPassword: string) {
    const tokenHash = this.hashToken(token);

    const resetRecord = await this.prisma.passwordReset.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gte: new Date() },
      },
    });

    if (!resetRecord) {
      throw new UnauthorizedException('Reset token is invalid or has expired.');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.$transaction(async (tx) => {
      // 1. Update user password
      await tx.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash: newPasswordHash },
      });

      // 2. Mark reset token as used
      await tx.passwordReset.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      });

      // 3. Security Boundary: Revoke all device sessions and refresh tokens on password reset!
      await tx.session.updateMany({
        where: { userId: resetRecord.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await tx.refreshToken.updateMany({
        where: { userId: resetRecord.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });

    return { success: true, message: 'Password reset successful.' };
  }

  /**
   * Verifies email using verification token hashes.
   */
  async verifyEmail(token: string) {
    const tokenHash = this.hashToken(token);

    const verifyRecord = await this.prisma.emailVerification.findFirst({
      where: {
        tokenHash,
        verifiedAt: null,
        expiresAt: { gte: new Date() },
      },
    });

    if (!verifyRecord) {
      throw new UnauthorizedException('Email verification token is invalid or has expired.');
    }

    await this.prisma.$transaction(async (tx) => {
      // Mark user email as verified
      await tx.user.update({
        where: { id: verifyRecord.userId },
        data: { emailVerifiedAt: new Date() },
      });

      // Mark verification record as verified
      await tx.emailVerification.update({
        where: { id: verifyRecord.id },
        data: { verifiedAt: new Date() },
      });
    });

    return { success: true, message: 'Email address verified successfully.' };
  }

  // ==========================================
  // Helper Cryptography & Generation Methods
  // ==========================================

  private async generateAccessToken(userId: string, role: string, sessionId: string): Promise<string> {
    const payload = {
      sub: userId,
      role: role,
      sid: sessionId,
    };
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'tgw-super-secret-access-token-key-2026-very-secure',
      expiresIn: (process.env.JWT_ACCESS_EXPIRY || '15m') as any,
    });
  }

  private generateOpaqueToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
