import { Body, Controller, Get, Param, Post, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { MediaService } from './media.service';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload-url')
  @HttpCode(HttpStatus.OK)
  async createUploadUrl(
    @Body() createUploadUrlDto: CreateUploadUrlDto,
    @GetUser('id') userId: string,
  ) {
    return this.mediaService.createUploadUrl(createUploadUrlDto, userId);
  }

  @Post(':assetId/complete')
  @HttpCode(HttpStatus.OK)
  async completeUpload(
    @Param('assetId') assetId: string,
    @GetUser('id') userId: string,
  ) {
    return this.mediaService.completeUpload(assetId, userId);
  }

  @Get(':assetId')
  async getMediaAsset(@Param('assetId') assetId: string) {
    return this.mediaService.findOne(assetId);
  }
}
