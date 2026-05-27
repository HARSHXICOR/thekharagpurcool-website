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
import { CmsService } from './cms.service';
import { ServiceDto } from './dto/service.dto';
import { PricingPlanDto } from './dto/pricing-plan.dto';
import { BlogPostDto } from './dto/blog-post.dto';
import { CaseStudyDto } from './dto/case-study.dto';
import { TestimonialDto } from './dto/testimonial.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // ==========================================
  // Public CMS Endpoints
  // ==========================================

  @Public()
  @Get('services')
  async listServices() {
    return this.cmsService.getPublicServices();
  }

  @Public()
  @Get('services/:slug')
  async getService(@Param('slug') slug: string) {
    return this.cmsService.getServiceBySlug(slug);
  }

  @Public()
  @Get('pricing-plans')
  async listPricingPlans() {
    return this.cmsService.getPublicPricingPlans();
  }

  @Public()
  @Get('blog-posts')
  async listBlogPosts(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.cmsService.getPublicBlogPosts({ category, search });
  }

  @Public()
  @Get('blog-posts/:slug')
  async getBlogPost(@Param('slug') slug: string) {
    return this.cmsService.getBlogPostBySlug(slug);
  }

  @Public()
  @Get('case-studies')
  async listCaseStudies() {
    return this.cmsService.getPublicCaseStudies();
  }

  @Public()
  @Get('case-studies/:slug')
  async getCaseStudy(@Param('slug') slug: string) {
    return this.cmsService.getCaseStudyBySlug(slug);
  }

  @Public()
  @Get('testimonials')
  async listTestimonials() {
    return this.cmsService.getPublicTestimonials();
  }

  // ==========================================
  // Admin CMS Endpoints
  // ==========================================

  @Roles('super_admin', 'admin', 'content_manager')
  @Post('admin/services')
  @HttpCode(HttpStatus.OK)
  async upsertService(@Body() dto: ServiceDto) {
    return this.cmsService.upsertService(dto);
  }

  @Roles('super_admin', 'admin', 'content_manager')
  @Post('admin/pricing-plans')
  @HttpCode(HttpStatus.OK)
  async upsertPricingPlan(@Body() dto: PricingPlanDto) {
    return this.cmsService.upsertPricingPlan(dto);
  }

  @Roles('super_admin', 'admin', 'content_manager')
  @Post('admin/blog-posts')
  @HttpCode(HttpStatus.CREATED)
  async createBlogPost(
    @Body() dto: BlogPostDto,
    @GetUser('id') authorId: string,
  ) {
    return this.cmsService.createBlogPost(dto, authorId);
  }

  @Roles('super_admin', 'admin', 'content_manager')
  @Patch('admin/blog-posts/:id')
  async updateBlogPost(@Param('id') id: string, @Body() dto: BlogPostDto) {
    return this.cmsService.updateBlogPost(id, dto);
  }

  @Roles('super_admin', 'admin', 'content_manager')
  @Post('admin/blog-posts/:id/publish')
  @HttpCode(HttpStatus.OK)
  async publishBlogPost(@Param('id') id: string) {
    return this.cmsService.publishBlogPost(id);
  }

  @Roles('super_admin', 'admin', 'content_manager')
  @Post('admin/case-studies')
  @HttpCode(HttpStatus.CREATED)
  async createCaseStudy(@Body() dto: CaseStudyDto) {
    return this.cmsService.createCaseStudy(dto);
  }

  @Roles('super_admin', 'admin', 'content_manager')
  @Post('admin/testimonials')
  @HttpCode(HttpStatus.CREATED)
  async createTestimonial(@Body() dto: TestimonialDto) {
    return this.cmsService.createTestimonial(dto);
  }
}
