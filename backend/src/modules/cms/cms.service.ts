import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ServiceDto } from './dto/service.dto';
import { PricingPlanDto } from './dto/pricing-plan.dto';
import { BlogPostDto } from './dto/blog-post.dto';
import { CaseStudyDto } from './dto/case-study.dto';
import { TestimonialDto } from './dto/testimonial.dto';

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // 1. Services
  // ==========================================

  async getPublicServices() {
    return this.prisma.service.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async getServiceBySlug(slug: string) {
    const service = await this.prisma.service.findFirst({
      where: { slug, deletedAt: null },
    });
    if (!service) {
      throw new NotFoundException('Service not found.');
    }
    return service;
  }

  async upsertService(dto: ServiceDto) {
    return this.prisma.service.upsert({
      where: { slug: dto.slug },
      update: {
        name: dto.name,
        shortDescription: dto.shortDescription,
        description: dto.description,
        category: dto.category,
        displayOrder: dto.displayOrder || 0,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        metadata: dto.metadata ? JSON.parse(JSON.stringify(dto.metadata)) : undefined,
      },
      create: {
        slug: dto.slug,
        name: dto.name,
        shortDescription: dto.shortDescription,
        description: dto.description,
        category: dto.category,
        displayOrder: dto.displayOrder || 0,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        metadata: dto.metadata ? JSON.parse(JSON.stringify(dto.metadata)) : undefined,
      },
    });
  }

  // ==========================================
  // 2. Pricing Plans
  // ==========================================

  async getPublicPricingPlans() {
    return this.prisma.pricingPlan.findMany({
      where: { isActive: true, deletedAt: null },
      include: {
        features: {
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { isFeatured: 'desc' },
    });
  }

  async upsertPricingPlan(dto: PricingPlanDto) {
    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.pricingPlan.upsert({
        where: { slug: dto.slug },
        update: {
          name: dto.name,
          tagline: dto.tagline,
          billingModel: dto.billingModel,
          monthlyPrice: dto.monthlyPrice,
          annualPrice: dto.annualPrice,
          currency: dto.currency || 'INR',
          isFeatured: dto.isFeatured || false,
          isActive: dto.isActive !== undefined ? dto.isActive : true,
        },
        create: {
          slug: dto.slug,
          name: dto.name,
          tagline: dto.tagline,
          billingModel: dto.billingModel,
          monthlyPrice: dto.monthlyPrice,
          annualPrice: dto.annualPrice,
          currency: dto.currency || 'INR',
          isFeatured: dto.isFeatured || false,
          isActive: dto.isActive !== undefined ? dto.isActive : true,
        },
      });

      if (dto.features) {
        // Clear old features
        await tx.planFeature.deleteMany({
          where: { planId: plan.id },
        });

        // Insert new features
        if (dto.features.length > 0) {
          await tx.planFeature.createMany({
            data: dto.features.map((f, index) => ({
              planId: plan.id,
              featureText: f.featureText,
              featureType: f.featureType,
              displayOrder: f.displayOrder || index,
            })),
          });
        }
      }

      return tx.pricingPlan.findUnique({
        where: { id: plan.id },
        include: { features: true },
      });
    });
  }

  // ==========================================
  // 3. Blog Posts
  // ==========================================

  async getPublicBlogPosts(query: { category?: string; search?: string }) {
    const where: any = { status: 'published', deletedAt: null };

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { excerpt: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      include: {
        author: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
    });
  }

  async getBlogPostBySlug(slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { slug, deletedAt: null },
      include: {
        author: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Blog post not found.');
    }

    // Atomic view increment
    return this.prisma.blogPost.update({
      where: { id: post.id },
      data: {
        viewCount: { increment: 1 },
      },
      include: {
        author: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
    });
  }

  async createBlogPost(dto: BlogPostDto, authorId: string) {
    return this.prisma.blogPost.create({
      data: {
        slug: dto.slug,
        title: dto.title,
        excerpt: dto.excerpt,
        content: JSON.parse(JSON.stringify(dto.content)),
        featuredImageUrl: dto.featuredImageUrl,
        category: dto.category,
        tags: dto.tags || [],
        authorId,
        status: dto.status || 'draft',
        publishedAt: dto.status === 'published' ? new Date() : null,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        readTimeMinutes: dto.readTimeMinutes || 0,
      },
    });
  }

  async updateBlogPost(id: string, dto: BlogPostDto) {
    return this.prisma.blogPost.update({
      where: { id },
      data: {
        title: dto.title,
        slug: dto.slug,
        excerpt: dto.excerpt,
        content: dto.content ? JSON.parse(JSON.stringify(dto.content)) : undefined,
        featuredImageUrl: dto.featuredImageUrl,
        category: dto.category,
        tags: dto.tags,
        status: dto.status,
        publishedAt: dto.status === 'published' ? new Date() : undefined,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        readTimeMinutes: dto.readTimeMinutes,
      },
    });
  }

  async publishBlogPost(id: string) {
    return this.prisma.blogPost.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    });
  }

  // ==========================================
  // 4. Case Studies
  // ==========================================

  async getPublicCaseStudies() {
    return this.prisma.caseStudy.findMany({
      where: { status: 'published', deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getCaseStudyBySlug(slug: string) {
    const study = await this.prisma.caseStudy.findFirst({
      where: { slug, deletedAt: null },
    });
    if (!study) {
      throw new NotFoundException('Case study not found.');
    }
    return study;
  }

  async createCaseStudy(dto: CaseStudyDto) {
    return this.prisma.caseStudy.create({
      data: {
        slug: dto.slug,
        title: dto.title,
        clientDisplayName: dto.clientDisplayName,
        industry: dto.industry,
        challenge: dto.challenge,
        solution: dto.solution,
        results: dto.results ? JSON.parse(JSON.stringify(dto.results)) : null,
        durationLabel: dto.durationLabel,
        featuredImageUrl: dto.featuredImageUrl,
        status: dto.status || 'draft',
        sortOrder: dto.sortOrder || 0,
      },
    });
  }

  // ==========================================
  // 5. Testimonials
  // ==========================================

  async getPublicTestimonials() {
    return this.prisma.testimonial.findMany({
      where: { status: 'published', deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTestimonial(dto: TestimonialDto) {
    return this.prisma.testimonial.create({
      data: {
        clientName: dto.clientName,
        clientRole: dto.clientRole,
        organizationName: dto.organizationName,
        avatarUrl: dto.avatarUrl,
        rating: dto.rating,
        quote: dto.quote,
        hasVideo: dto.hasVideo || false,
        videoUrl: dto.videoUrl,
        status: dto.status || 'draft',
      },
    });
  }
}
