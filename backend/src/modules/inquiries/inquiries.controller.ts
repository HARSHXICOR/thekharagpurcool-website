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
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Public()
  @Post('inquiries')
  @HttpCode(HttpStatus.CREATED)
  async createInquiry(@Body() createInquiryDto: CreateInquiryDto) {
    return this.inquiriesService.create(createInquiryDto);
  }

  @Roles('super_admin', 'admin', 'account_manager')
  @Get('admin/inquiries')
  async listInquiries(
    @Query('status') status?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.inquiriesService.findAll({ status, assignedTo, page, limit, search });
  }

  @Roles('super_admin', 'admin', 'account_manager')
  @Get('admin/inquiries/:id')
  async getInquiry(@Param('id') id: string) {
    return this.inquiriesService.findOne(id);
  }

  @Roles('super_admin', 'admin', 'account_manager')
  @Patch('admin/inquiries/:id')
  async updateInquiry(
    @Param('id') id: string,
    @Body() updateInquiryDto: UpdateInquiryDto,
  ) {
    return this.inquiriesService.update(id, updateInquiryDto);
  }
}
