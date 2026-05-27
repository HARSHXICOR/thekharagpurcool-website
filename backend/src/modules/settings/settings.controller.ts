import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../auth/guards/org-membership.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('me')
  async getMySettings(@GetUser('id') userId: string) {
    return this.settingsService.getMySettings(userId);
  }

  @Patch('me')
  async updateMySettings(
    @GetUser('id') userId: string,
    @Body() dto: any,
  ) {
    return this.settingsService.updateMySettings(userId, dto);
  }

  @UseGuards(OrgMembershipGuard)
  @Get('organizations/:orgId')
  async getOrgSettings(@Param('orgId') orgId: string) {
    return this.settingsService.getOrgSettings(orgId);
  }

  @UseGuards(OrgMembershipGuard)
  @Patch('organizations/:orgId')
  async updateOrgSettings(
    @Param('orgId') orgId: string,
    @Body() dto: any,
  ) {
    return this.settingsService.updateOrgSettings(orgId, dto);
  }
}
