import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import * as crypto from 'crypto';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async createUploadUrl(dto: CreateUploadUrlDto, userId: string) {
    const fileExtension = dto.fileName.split('.').pop() || 'bin';
    const uniqueId = crypto.randomUUID();
    const storageKey = `${dto.kind}s/${uniqueId}.${fileExtension}`;

    // Standard high-fidelity mock S3/R2 signed upload URL
    const uploadUrl = `https://s3.amazonaws.com/tgw-assets/${storageKey}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=mock-credentials&X-Amz-Date=20260525T120000Z&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature=mock-signature-12345`;
    const publicBaseUrl = `https://cdn.example.com/${storageKey}`;

    // Create Campaign lookup to associate organization if applicable
    let organizationId: string | null = null;
    if (dto.campaignId) {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: dto.campaignId },
      });
      if (campaign) {
        organizationId = campaign.organizationId;
      }
    }

    const asset = await this.prisma.mediaAsset.create({
      data: {
        organizationId,
        campaignId: dto.campaignId,
        uploadedById: userId,
        storageKey,
        publicUrl: publicBaseUrl,
        mimeType: dto.mimeType,
        sizeBytes: 0, // In production, this would be updated on callback/complete
        checksumSha256: crypto.createHash('sha256').update(storageKey).digest('hex'),
        processingStatus: 'uploaded', // Staged for completion
        kind: dto.kind,
      },
    });

    return {
      assetId: asset.id,
      uploadUrl,
      publicBaseUrl,
    };
  }

  async completeUpload(assetId: string, userId: string) {
    const asset = await this.prisma.mediaAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException('Media asset not found.');
    }

    if (asset.uploadedById !== userId) {
      throw new ForbiddenException('You do not have permission to modify this media asset.');
    }

    return this.prisma.mediaAsset.update({
      where: { id: assetId },
      data: {
        processingStatus: 'ready',
        sizeBytes: 1548200, // Simulating a mock file size in bytes
      },
    });
  }

  async findOne(assetId: string) {
    const asset = await this.prisma.mediaAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset || asset.deletedAt) {
      throw new NotFoundException('Media asset not found.');
    }

    return asset;
  }
}
