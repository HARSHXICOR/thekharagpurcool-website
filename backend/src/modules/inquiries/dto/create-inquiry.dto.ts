import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
  Length,
} from 'class-validator';

export class CreateInquiryDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 120)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  instagramHandle?: string;

  @IsString()
  @IsOptional()
  serviceSlug?: string;

  @IsString()
  @IsNotEmpty()
  budgetBand: string; // e.g. standard, growth, scale

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsNotEmpty()
  source: string; // e.g. contact_form, pricing

  @IsObject()
  @IsOptional()
  utm?: Record<string, any>;

  @IsString()
  @IsOptional()
  honeypot?: string; // Anti-spam honeypot
}
