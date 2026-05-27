import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../auth/guards/org-membership.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('analytics/dashboard/cards')
  async getDashboardCards(
    @Query('orgId') orgId: string,
    @GetUser() user: any,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    if (!orgId) {
      throw new ForbiddenException('orgId query parameter is required.');
    }

    // Tenant check
    if (user.defaultRole === 'client_user') {
      const belongs = user.memberships.some((m: any) => m.organizationId === orgId);
      if (!belongs) {
        throw new ForbiddenException('Access denied.');
      }
    }

    return this.analyticsService.getDashboardCards(orgId, dateFrom, dateTo);
  }

  @UseGuards(OrgMembershipGuard)
  @Get('organizations/:orgId/reports')
  async getReportsList(@Param('orgId') orgId: string) {
    return this.analyticsService.getReportsList(orgId);
  }

  @Post('campaigns/:id/reports/export')
  @HttpCode(HttpStatus.ACCEPTED) // 202 Accepted as specified
  async exportReport(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser() user: any,
    @Body('format') format: string,
    @Body('dateFrom') dateFrom: string,
    @Body('dateTo') dateTo: string,
  ) {
    // Basic date validations
    const start = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const end = dateTo || new Date().toISOString();

    const report = await this.analyticsService.exportReport(
      id,
      format || 'pdf',
      start,
      end,
      userId,
    );

    return {
      message: 'Report export job queued.',
      reportId: report.id,
      status: report.status,
      downloadUrl: `https://cdn.example.com/${report.storageKey}`,
    };
  }
}
