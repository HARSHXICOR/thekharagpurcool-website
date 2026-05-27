import {
  Injectable,
  ConflictException,
  UnprocessableEntityException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';

@Injectable()
export class InquiriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Public creation of an inquiry with anti-spam / rate-limiting validations.
   */
  async create(dto: CreateInquiryDto) {
    // 1. Honeypot check for spam bots
    if (dto.honeypot) {
      throw new UnprocessableEntityException('Spam detected.');
    }

    const email = dto.email.toLowerCase();

    // 2. Duplicate submission rate limit (5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentInquiry = await this.prisma.inquiry.findFirst({
      where: {
        OR: [
          { email },
          { phone: dto.phone },
        ],
        createdAt: { gte: fiveMinutesAgo },
      },
    });

    if (recentInquiry) {
      throw new ConflictException(
        'A recent inquiry was already submitted. Please wait 5 minutes.',
      );
    }

    // 3. Resolve service from slug if provided
    let serviceId: string | null = null;
    if (dto.serviceSlug) {
      const service = await this.prisma.service.findUnique({
        where: { slug: dto.serviceSlug },
      });
      if (service) {
        serviceId = service.id;
      }
    }

    // 4. Create inquiry
    const inquiry = await this.prisma.inquiry.create({
      data: {
        name: dto.name,
        email,
        phone: dto.phone,
        companyName: dto.companyName,
        instagramHandle: dto.instagramHandle,
        serviceId,
        budgetBand: dto.budgetBand,
        message: dto.message,
        source: dto.source,
        status: 'new',
        utm: dto.utm ? JSON.parse(JSON.stringify(dto.utm)) : null,
      },
    });

    // 5. Asynchronously trigger background notifications
    this.eventEmitter.emit('lead.created', inquiry);

    return inquiry;
  }

  /**
   * Admin offset pagination list.
   */
  async findAll(query: {
    status?: string;
    assignedTo?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (query.status) {
      where.status = query.status;
    }
    if (query.assignedTo) {
      where.assignedToId = query.assignedTo;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { companyName: { contains: query.search, mode: 'insensitive' } },
        { instagramHandle: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.inquiry.count({ where }),
      this.prisma.inquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          service: {
            select: { id: true, name: true, slug: true },
          },
          assignedTo: {
            select: { id: true, fullName: true, email: true },
          },
          organization: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data,
    };
  }

  async findOne(id: string) {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id },
      include: {
        service: true,
        assignedTo: {
          select: { id: true, fullName: true, email: true },
        },
        organization: true,
        campaigns: {
          select: { id: true, name: true },
        },
      },
    });

    if (!inquiry || inquiry.deletedAt) {
      throw new NotFoundException('Inquiry not found.');
    }

    return inquiry;
  }

  /**
   * Updates an inquiry. Auto-provisions an Organization when a lead is qualified.
   */
  async update(id: string, dto: UpdateInquiryDto) {
    const inquiry = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      let organizationId = dto.organizationId || inquiry.organizationId;

      // Auto-provision brand Organization on qualified, confirmed, running or completed state transition
      if (
        (dto.status === 'qualified' || dto.status === 'confirmed' || dto.status === 'running' || dto.status === 'completed') &&
        !organizationId
      ) {
        const baseName = inquiry.companyName || `${inquiry.name} Brand`;
        const orgSlug = baseName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

        const organization = await tx.organization.create({
          data: {
            name: baseName,
            slug: `${orgSlug}-${Math.floor(1000 + Math.random() * 9000)}`,
            status: 'active',
          },
        });

        organizationId = organization.id;
      }

      return tx.inquiry.update({
        where: { id },
        data: {
          status: dto.status,
          assignedToId: dto.assignedToId,
          organizationId: organizationId || undefined,
          notes: dto.notes,
        },
        include: {
          service: true,
          assignedTo: {
            select: { id: true, fullName: true },
          },
          organization: true,
        },
      });
    });
  }
}
