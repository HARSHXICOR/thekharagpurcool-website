import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
  IsInt,
} from 'class-validator';

export class CaseStudyDto {
  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  clientDisplayName: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  challenge?: string;

  @IsString()
  @IsOptional()
  solution?: string;

  @IsObject()
  @IsOptional()
  results?: Record<string, any>;

  @IsString()
  @IsOptional()
  durationLabel?: string;

  @IsString()
  @IsOptional()
  featuredImageUrl?: string;

  @IsString()
  @IsOptional()
  status?: string; // draft, published, archived

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}
export class UpdateCaseStudyDto extends CaseStudyDto {}
