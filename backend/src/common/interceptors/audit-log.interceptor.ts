import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, ip, headers } = request;

    // Only audit mutations (POST, PATCH, DELETE, PUT) and skip public auth/login routes
    const isMutation = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);
    const isAuth = url.includes('/auth/');

    return next.handle().pipe(
      tap(async (response) => {
        if (isMutation && !isAuth && request.user) {
          try {
            const actorUserId = request.user.id;
            const userAgent = headers['user-agent'] || 'unknown';

            // Deduce entityType and entityId from URL
            // e.g. /api/v1/admin/inquiries/some-uuid -> entityType: inquiries, entityId: some-uuid
            const urlParts = url.split('/').filter(Boolean);
            const entityType = urlParts[urlParts.length - 2] || 'system';
            let entityId = urlParts[urlParts.length - 1] || 'global';

            // Validate if entityId is a valid UUID or use database generated IDs from response
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(entityId) && response?.id && uuidRegex.test(response.id)) {
              entityId = response.id;
            }

            const action = `${method}_${urlParts[urlParts.length - 1] ? 'ITEM' : 'COLLECTION'}`;

            await this.prisma.auditLog.create({
              data: {
                actorUserId,
                entityType: entityType.substring(0, 60),
                entityId: uuidRegex.test(entityId) ? entityId : '00000000-0000-0000-0000-000000000000',
                action: action.substring(0, 40),
                after: body ? JSON.parse(JSON.stringify(body)) : null,
                ip: ip || '127.0.0.1',
                userAgent,
              },
            });
          } catch (e) {
            // Silently catch audit log writing failures to prevent blocking main controller actions
            console.error('Failed to write audit log:', e);
          }
        }
      }),
    );
  }
}
