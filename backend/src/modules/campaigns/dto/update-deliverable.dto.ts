import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateDeliverableDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  publishedAt?: string;

  @IsString()
  @IsOptional()
  linkUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
