import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
  IsInt,
} from 'class-validator';

export class BlogPostDto {
  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsNotEmpty()
  content: any; // Rich text JSON blocks

  @IsString()
  @IsOptional()
  featuredImageUrl?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  status?: string; // draft, scheduled, published, archived

  @IsString()
  @IsOptional()
  seoTitle?: string;

  @IsString()
  @IsOptional()
  seoDescription?: string;

  @IsInt()
  @IsOptional()
  readTimeMinutes?: number;
}
export class UpdateBlogPostDto extends BlogPostDto {}
