import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/summary')
  @Roles('super_admin', 'admin', 'account_manager')
  async getDashboardSummary() {
    return this.adminService.getDashboardSummary();
  }

  @Get('audit-logs')
  @Roles('super_admin', 'admin')
  async getAuditLogs(
    @Query('actorUserId') actorUserId?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getAuditLogs({ actorUserId, entityType, entityId, page, limit });
  }

  @Post('users/invite')
  @Roles('super_admin', 'admin')
  @HttpCode(HttpStatus.OK)
  async inviteUser(
    @Body('email') email: string,
    @Body('fullName') fullName: string,
    @Body('organizationId') organizationId: string,
    @Body('role') role: string,
  ) {
    return this.adminService.inviteUser({ email, fullName, organizationId, role });
  }

  @Patch('users/:id/role')
  @Roles('super_admin', 'admin')
  async updateUserRole(
    @Param('id') id: string,
    @Body('role') role: string,
  ) {
    return this.adminService.updateUserRole(id, role);
  }

  @Get('users/clients')
  @Roles('super_admin', 'admin', 'account_manager')
  async getClientUsers() {
    return this.adminService.listClientUsers();
  }
}
