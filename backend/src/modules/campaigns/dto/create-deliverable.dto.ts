import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDeliverableDto {
  @IsString()
  @IsNotEmpty()
  deliverableType: string; // reel, story, carousel, event_coverage

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  status: string; // planned, in_progress, review, published, archived

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsString()
  @IsNotEmpty()
  platform: string; // instagram, youtube, website, offline

  @IsString()
  @IsOptional()
  linkUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
