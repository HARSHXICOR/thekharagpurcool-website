import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';

export class FeatureItemDto {
  @IsString()
  @IsNotEmpty()
  featureText: string;

  @IsString()
  @IsNotEmpty()
  featureType: 'included' | 'excluded';

  @IsOptional()
  displayOrder?: number;
}

export class PricingPlanDto {
  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  tagline?: string;

  @IsString()
  @IsNotEmpty()
  billingModel: 'campaign' | 'monthly' | 'annual' | 'custom';

  @IsNumber()
  @IsOptional()
  monthlyPrice?: number;

  @IsNumber()
  @IsOptional()
  annualPrice?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsOptional()
  features?: FeatureItemDto[];
}
