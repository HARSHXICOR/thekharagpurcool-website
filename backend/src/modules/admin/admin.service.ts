import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardSummary() {
    const [totalInquiries, totalCampaigns, totalOrgs, recentLogs] = await Promise.all([
      this.prisma.inquiry.count({ where: { deletedAt: null } }),
      this.prisma.campaign.count({ where: { status: 'active', deletedAt: null } }),
      this.prisma.organization.count({ where: { status: 'active', deletedAt: null } }),
      this.prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: { id: true, fullName: true, email: true },
          },
        },
      }),
    ]);

    return {
      totalInquiries,
      totalCampaigns,
      totalOrgs,
      recentLogs: recentLogs.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        actorEmail: log.actor?.email || 'system',
        actorName: log.actor?.fullName || 'System',
        createdAt: log.createdAt,
      })),
    };
  }

  async getAuditLogs(query: {
    actorUserId?: string;
    entityType?: string;
    entityId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 15;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.actorUserId) {
      where.actorUserId = query.actorUserId;
    }
    if (query.entityType) {
      where.entityType = query.entityType;
    }
    if (query.entityId) {
      where.entityId = query.entityId;
    }

    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: { id: true, fullName: true, email: true },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: logs,
    };
  }

  async inviteUser(dto: {
    email: string;
    fullName: string;
    organizationId: string;
    role: string; // e.g. org_admin, org_member
  }) {
    const normalizedEmail = dto.email.toLowerCase();

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      // Check if they are already in the organization
      const existingMembership = await this.prisma.organizationMembership.findFirst({
        where: {
          organizationId: dto.organizationId,
          userId: existingUser.id,
        },
      });

      if (existingMembership) {
        throw new ConflictException('User is already a member of this organization.');
      }

      // Add them to the organization membership
      await this.prisma.organizationMembership.create({
        data: {
          organizationId: dto.organizationId,
          userId: existingUser.id,
          role: dto.role || 'org_member',
          status: 'active',
        },
      });

      return {
        message: 'Existing user associated with organization membership.',
        userId: existingUser.id,
        organizationId: dto.organizationId,
      };
    }

    // Provision new user as pending
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          fullName: dto.fullName,
          defaultRole: 'client_user',
          status: 'pending', // Pending invite acceptance
        },
      });

      await tx.organizationMembership.create({
        data: {
          organizationId: dto.organizationId,
          userId: user.id,
          role: dto.role || 'org_member',
          status: 'active',
        },
      });

      return {
        message: 'Onboarding client user invited successfully.',
        userId: user.id,
        email: normalizedEmail,
        status: user.status,
      };
    });
  }

  async updateUserRole(id: string, role: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.prisma.user.update({
      where: { id },
      data: { defaultRole: role },
      select: {
        id: true,
        email: true,
        fullName: true,
        defaultRole: true,
      },
    });
  }

  async listClientUsers() {
    return this.prisma.user.findMany({
      where: {
        defaultRole: 'client_user',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        memberships: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });
  }
}
