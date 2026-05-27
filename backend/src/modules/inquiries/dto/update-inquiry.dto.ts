import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateInquiryDto {
  @IsString()
  @IsOptional()
  status?: string; // e.g. new, qualified, lost, in_progress

  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  organizationId?: string;
}
