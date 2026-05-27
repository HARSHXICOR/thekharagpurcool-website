import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class OrgMembershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User is not authenticated.');
    }

    // Staff roles have global permission to read/write across organizations
    const staffRoles = ['super_admin', 'admin', 'account_manager', 'analyst'];
    if (staffRoles.includes(user.defaultRole)) {
      return true;
    }

    // Extract orgId from route parameters, query parameters, or request body
    const orgId = request.params.orgId || request.query.orgId || request.body.organizationId;

    if (!orgId) {
      // If there's no orgId in the request scope, let it pass (or handle globally)
      return true;
    }

    // Check if the user belongs to the requested organization and their membership is active
    const membership = user.memberships.find(
      (m: any) => m.organizationId === orgId && m.status === 'active',
    );

    if (!membership) {
      throw new ForbiddenException('Access denied. You do not belong to this organization.');
    }

    return true;
  }
}
