import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMySettings(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true, avatarUrl: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // Return standard preferences (simulate or pull from a metadata block)
    return {
      notificationsEnabled: true,
      emailNotifications: true,
      pushNotifications: false,
      timezone: 'Asia/Kolkata',
      language: 'en',
      phone: user.phone,
      avatarUrl: user.avatarUrl,
    };
  }

  async updateMySettings(userId: string, dto: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        phone: dto.phone,
        avatarUrl: dto.avatarUrl,
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
      },
    });
  }

  async getOrgSettings(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found.');
    }

    return {
      organizationId: org.id,
      name: org.name,
      slug: org.slug,
      industry: org.industry,
      timezone: org.timezone,
      status: org.status,
      billingEmail: org.billingEmail,
      instagramHandle: org.instagramHandle,
    };
  }

  async updateOrgSettings(orgId: string, dto: any) {
    return this.prisma.organization.update({
      where: { id: orgId },
      data: {
        name: dto.name,
        industry: dto.industry,
        timezone: dto.timezone,
        billingEmail: dto.billingEmail,
        instagramHandle: dto.instagramHandle,
      },
    });
  }
}
