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
  ForbiddenException,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/create-campaign.dto';
import { CreateDeliverableDto } from './dto/create-deliverable.dto';
import { UpdateDeliverableDto } from './dto/update-deliverable.dto';
import { AddMetricDto } from './dto/add-metric.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  async listCampaigns(
    @GetUser() user: any,
    @Query('orgId') orgId?: string,
    @Query('status') status?: string,
  ) {
    // Multi-tenant boundary check: client users are restricted to their own organization campaigns
    if (user.defaultRole === 'client_user') {
      if (orgId) {
        const belongs = user.memberships.some((m: any) => m.organizationId === orgId);
        if (!belongs) {
          throw new ForbiddenException('Access denied. You do not belong to this organization.');
        }
        return this.campaignsService.findAll({ orgId, status });
      }

      // Query campaigns for all organization memberships the user belongs to
      const orgIds = user.memberships.map((m: any) => m.organizationId);
      return this.campaignsService.findAll({ orgIds, status });
    }

    return this.campaignsService.findAll({ orgId, status });
  }

  @Post()
  @Roles('super_admin', 'admin', 'account_manager')
  @HttpCode(HttpStatus.CREATED)
  async createCampaign(
    @Body() dto: CreateCampaignDto,
    @GetUser('id') ownerId: string,
  ) {
    return this.campaignsService.create(dto, ownerId);
  }

  @Get(':id')
  async getCampaign(@Param('id') id: string, @GetUser() user: any) {
    const campaign = await this.campaignsService.findOne(id);

    // Multi-tenant boundary check for individual campaign access
    if (user.defaultRole === 'client_user') {
      const belongs = user.memberships.some(
        (m: any) => m.organizationId === campaign.organizationId,
      );
      if (!belongs) {
        throw new ForbiddenException('Access denied to this campaign.');
      }
    }

    return campaign;
  }

  @Patch(':id')
  @Roles('super_admin', 'admin', 'account_manager')
  async updateCampaign(
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(id, dto);
  }

  // ==========================================
  // Deliverables Endpoints
  // ==========================================

  @Post(':id/deliverables')
  @Roles('super_admin', 'admin', 'account_manager')
  @HttpCode(HttpStatus.CREATED)
  async addDeliverable(
    @Param('id') id: string,
    @Body() dto: CreateDeliverableDto,
  ) {
    return this.campaignsService.addDeliverable(id, dto);
  }

  @Patch(':id/deliverables/:deliverableId')
  async updateDeliverable(
    @Param('id') id: string,
    @Param('deliverableId') deliverableId: string,
    @Body() dto: UpdateDeliverableDto,
    @GetUser() user: any,
  ) {
    const campaign = await this.campaignsService.findOne(id);

    // Multi-tenant boundary check: client users can only update deliverables in their campaigns (e.g. approve/give feedback)
    if (user.defaultRole === 'client_user') {
      const belongs = user.memberships.some(
        (m: any) => m.organizationId === campaign.organizationId,
      );
      if (!belongs) {
        throw new ForbiddenException('Access denied.');
      }
    }

    return this.campaignsService.updateDeliverable(id, deliverableId, dto);
  }

  // ==========================================
  // Metrics Endpoints
  // ==========================================

  @Post(':id/metrics')
  @Roles('super_admin', 'admin', 'account_manager', 'analyst')
  @HttpCode(HttpStatus.OK)
  async addMetric(@Param('id') id: string, @Body() dto: AddMetricDto) {
    return this.campaignsService.addMetric(id, dto);
  }

  @Get(':id/metrics')
  async getMetricsSeries(
    @Param('id') id: string,
    @GetUser() user: any,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('granularity') granularity?: 'day' | 'week' | 'month',
  ) {
    const campaign = await this.campaignsService.findOne(id);

    if (user.defaultRole === 'client_user') {
      const belongs = user.memberships.some(
        (m: any) => m.organizationId === campaign.organizationId,
      );
      if (!belongs) {
        throw new ForbiddenException('Access denied.');
      }
    }

    return this.campaignsService.getMetricsSeries(id, {
      dateFrom,
      dateTo,
      granularity,
    });
  }
}
