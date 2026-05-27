import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsString()
  @IsNotEmpty()
  kind: 'image' | 'video' | 'document';

  @IsUUID()
  @IsOptional()
  campaignId?: string;
}
