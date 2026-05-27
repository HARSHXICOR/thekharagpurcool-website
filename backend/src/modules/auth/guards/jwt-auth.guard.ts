import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token is missing.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'tgw-super-secret-access-token-key-2026-very-secure',
      });

      // Load user and their organization memberships from DB to ensure they exist and are active
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          memberships: {
            select: {
              organizationId: true,
              role: true,
              status: true,
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException('User no longer exists.');
      }

      if (user.status !== 'active') {
        throw new UnauthorizedException('User account is suspended or inactive.');
      }

      // Attach user object to the request
      request.user = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        defaultRole: user.defaultRole,
        memberships: user.memberships,
        sessionId: payload.sid,
      };
    } catch (error) {
      throw new UnauthorizedException('Access token is invalid or expired.');
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
