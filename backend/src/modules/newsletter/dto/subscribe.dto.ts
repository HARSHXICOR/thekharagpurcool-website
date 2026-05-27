import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubscribeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  source?: string; // e.g. blog, footer, popup
}
