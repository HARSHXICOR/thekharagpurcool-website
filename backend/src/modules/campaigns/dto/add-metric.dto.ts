import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class AddMetricDto {
  @IsDateString()
  @IsNotEmpty()
  metricDate: string;

  @IsInt()
  @IsOptional()
  reach?: number;

  @IsInt()
  @IsOptional()
  impressions?: number;

  @IsInt()
  @IsOptional()
  likes?: number;

  @IsInt()
  @IsOptional()
  comments?: number;

  @IsInt()
  @IsOptional()
  shares?: number;

  @IsInt()
  @IsOptional()
  saves?: number;

  @IsInt()
  @IsOptional()
  profileVisits?: number;

  @IsInt()
  @IsOptional()
  linkClicks?: number;

  @IsInt()
  @IsOptional()
  followerGrowth?: number;

  @IsInt()
  @IsOptional()
  footfallEstimate?: number;

  @IsNumber()
  @IsOptional()
  revenueEstimate?: number;

  @IsString()
  @IsOptional()
  source?: string; // manual, api, import
}
export class AddMultipleMetricsDto {
  metrics: AddMetricDto[];
}
