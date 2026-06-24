import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/create-campaign.dto';
import { CreateDeliverableDto } from './dto/create-deliverable.dto';
import { UpdateDeliverableDto } from './dto/update-deliverable.dto';
import { AddMetricDto } from './dto/add-metric.dto';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // 1. Campaign Core CRUD
  // ==========================================

  async findAll(query: { orgId?: string; orgIds?: string[]; status?: string }) {
    const where: any = { deletedAt: null };

    if (query.orgIds && query.orgIds.length > 0) {
      where.organizationId = { in: query.orgIds };
    } else if (query.orgId) {
      where.organizationId = query.orgId;
    }
    if (query.status) {
      where.status = query.status;
    }

    return this.prisma.campaign.findMany({
      where,
      orderBy: { startDate: 'desc' },
      include: {
        organization: {
          select: { id: true, name: true, slug: true, industry: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        organization: {
          select: { id: true, name: true, slug: true, industry: true },
        },
        deliverables: {
          where: { deletedAt: null },
          orderBy: { scheduledAt: 'asc' },
        },
        owner: {
          select: { id: true, fullName: true },
        },
      },
    });

    if (!campaign || campaign.deletedAt) {
      throw new NotFoundException('Campaign not found.');
    }

    return campaign;
  }

  async create(dto: CreateCampaignDto, creatorId?: string) {
    const baseSlug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    let slug = baseSlug;
    let counter = 0;
    while (true) {
      const existing = await this.prisma.campaign.findUnique({
        where: { slug },
      });
      if (!existing) {
        break;
      }
      counter++;
      slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
      // Safety breakout to prevent infinite loops
      if (counter > 10) {
        slug = `${baseSlug}-${Date.now()}`;
        break;
      }
    }

    const targetOwnerId = dto.ownerId || creatorId || null;

    const campaign = await this.prisma.campaign.create({
      data: {
        organizationId: dto.organizationId,
        inquiryId: dto.inquiryId,
        name: dto.name,
        slug,
        campaignType: dto.campaignType,
        status: dto.status,
        objective: dto.objective,
        budget: dto.budget,
        currency: dto.currency || 'INR',
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        brief: dto.brief,
        internalNotes: dto.internalNotes,
        ownerId: targetOwnerId,
      },
    });

    if (dto.ownerId) {
      await this.autoProvisionMembership(dto.organizationId, dto.ownerId);
    }

    return this.findOne(campaign.id);
  }

  async update(id: string, dto: UpdateCampaignDto) {
    const campaign = await this.findOne(id);

    const updated = await this.prisma.campaign.update({
      where: { id },
      data: {
        name: dto.name,
        campaignType: dto.campaignType,
        status: dto.status,
        objective: dto.objective,
        budget: dto.budget,
        currency: dto.currency,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        brief: dto.brief,
        internalNotes: dto.internalNotes,
        ownerId: dto.ownerId,
      },
    });

    if (dto.ownerId) {
      await this.autoProvisionMembership(campaign.organizationId, dto.ownerId);
    }

    return this.findOne(updated.id);
  }

  private async autoProvisionMembership(organizationId: string, userId: string) {
    const existing = await this.prisma.organizationMembership.findFirst({
      where: {
        organizationId,
        userId,
      },
    });

    if (!existing) {
      await this.prisma.organizationMembership.create({
        data: {
          organizationId,
          userId,
          role: 'org_member',
          status: 'active',
        },
      });
    }
  }

  // ==========================================
  // 2. Deliverables Tracker
  // ==========================================

  async addDeliverable(campaignId: string, dto: CreateDeliverableDto) {
    await this.findOne(campaignId);

    return this.prisma.campaignDeliverable.create({
      data: {
        campaignId,
        deliverableType: dto.deliverableType,
        title: dto.title,
        status: dto.status,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        platform: dto.platform,
        linkUrl: dto.linkUrl,
        notes: dto.notes,
      },
    });
  }

  async updateDeliverable(
    campaignId: string,
    deliverableId: string,
    dto: UpdateDeliverableDto,
  ) {
    const deliverable = await this.prisma.campaignDeliverable.findFirst({
      where: { id: deliverableId, campaignId, deletedAt: null },
    });

    if (!deliverable) {
      throw new NotFoundException('Deliverable not found for this campaign.');
    }

    return this.prisma.campaignDeliverable.update({
      where: { id: deliverableId },
      data: {
        status: dto.status,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
        linkUrl: dto.linkUrl,
        notes: dto.notes,
      },
    });
  }

  // ==========================================
  // 3. Campaign Metrics (Ingestion & Timeseries)
  // ==========================================

  async addMetric(campaignId: string, dto: AddMetricDto) {
    await this.findOne(campaignId);

    const source = dto.source || 'manual';
    const metricDate = new Date(dto.metricDate);

    // Dynamic upsert on campaignId_metricDate_source composite unique constraint
    return this.prisma.campaignMetric.upsert({
      where: {
        campaignId_metricDate_source: {
          campaignId,
          metricDate,
          source,
        },
      },
      update: {
        reach: dto.reach,
        impressions: dto.impressions,
        likes: dto.likes,
        comments: dto.comments,
        shares: dto.shares,
        saves: dto.saves,
        profileVisits: dto.profileVisits,
        linkClicks: dto.linkClicks,
        followerGrowth: dto.followerGrowth,
        footfallEstimate: dto.footfallEstimate,
        revenueEstimate: dto.revenueEstimate,
      },
      create: {
        campaignId,
        metricDate,
        source,
        reach: dto.reach || 0,
        impressions: dto.impressions || 0,
        likes: dto.likes || 0,
        comments: dto.comments || 0,
        shares: dto.shares || 0,
        saves: dto.saves || 0,
        profileVisits: dto.profileVisits || 0,
        linkClicks: dto.linkClicks || 0,
        followerGrowth: dto.followerGrowth || 0,
        footfallEstimate: dto.footfallEstimate,
        revenueEstimate: dto.revenueEstimate,
      },
    });
  }

  async getMetricsSeries(
    campaignId: string,
    query: { dateFrom?: string; dateTo?: string; granularity?: 'day' | 'week' | 'month' },
  ) {
    await this.findOne(campaignId);

    const granularity = query.granularity || 'day';
    const where: any = { campaignId };

    if (query.dateFrom || query.dateTo) {
      where.metricDate = {};
      if (query.dateFrom) {
        where.metricDate.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.metricDate.lte = new Date(query.dateTo);
      }
    }

    const metrics = await this.prisma.campaignMetric.findMany({
      where,
      orderBy: { metricDate: 'asc' },
    });

    if (granularity === 'day') {
      return metrics.map((m) => ({
        date: m.metricDate.toISOString().split('T')[0],
        reach: m.reach,
        impressions: m.impressions,
        likes: m.likes,
        comments: m.comments,
        shares: m.shares,
        saves: m.saves,
        profileVisits: m.profileVisits,
        linkClicks: m.linkClicks,
      }));
    }

    // Grouping for 'week' or 'month'
    const groups: Record<string, any> = {};

    for (const m of metrics) {
      let key = '';
      const date = m.metricDate;

      if (granularity === 'month') {
        // YYYY-MM
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        // YYYY-W[weekNumber]
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        key = `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
      }

      if (!groups[key]) {
        groups[key] = {
          period: key,
          reach: 0,
          impressions: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0,
          profileVisits: 0,
          linkClicks: 0,
          count: 0,
        };
      }

      groups[key].reach += m.reach;
      groups[key].impressions += m.impressions;
      groups[key].likes += m.likes;
      groups[key].comments += m.comments;
      groups[key].shares += m.shares;
      groups[key].saves += m.saves;
      groups[key].profileVisits += m.profileVisits;
      groups[key].linkClicks += m.linkClicks;
      groups[key].count += 1;
    }

    return Object.values(groups);
  }
}
