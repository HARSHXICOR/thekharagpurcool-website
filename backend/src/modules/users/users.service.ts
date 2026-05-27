import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        defaultRole: true,
        status: true,
        createdAt: true,
        memberships: {
          select: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            role: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        defaultRole: true,
      },
    });

    return user;
  }

  async getSessions(userId: string) {
    return this.prisma.session.findMany({
      where: {
        userId,
        revokedAt: null,
      },
      select: {
        id: true,
        deviceName: true,
        ip: true,
        userAgent: true,
        lastSeenAt: true,
        createdAt: true,
      },
      orderBy: {
        lastSeenAt: 'desc',
      },
    });
  }

  async revokeSession(userId: string, sessionIdToRevoke: string) {
    const session = await this.prisma.session.findFirst({
      where: {
        id: sessionIdToRevoke,
        userId,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found or does not belong to this user.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.session.update({
        where: { id: sessionIdToRevoke },
        data: { revokedAt: new Date() },
      });

      await tx.refreshToken.updateMany({
        where: { sessionId: sessionIdToRevoke },
        data: { revokedAt: new Date() },
      });
    });

    return { success: true };
  }
}
