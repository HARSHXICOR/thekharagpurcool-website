import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../auth/guards/org-membership.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get('me')
  async getMyOrganizations(@GetUser('id') userId: string) {
    return this.organizationsService.getMyOrganizations(userId);
  }

  @UseGuards(OrgMembershipGuard)
  @Get(':orgId/dashboard-summary')
  async getDashboardSummary(@Param('orgId') orgId: string) {
    return this.organizationsService.getDashboardSummary(orgId);
  }
}
