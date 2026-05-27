import { Module } from '@nestjs/common';
import { InquiriesService } from './inquiries.service';
import { InquiriesController } from './inquiries.controller';
import { InquiriesListener } from './inquiries.listener';

@Module({
  controllers: [InquiriesController],
  providers: [InquiriesService, InquiriesListener],
  exports: [InquiriesService],
})
export class InquiriesModule {}
