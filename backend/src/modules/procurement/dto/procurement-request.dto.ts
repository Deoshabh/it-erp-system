import { IsString, IsEnum, IsOptional, IsNumber, IsDateString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ProcurementCategory, ProcurementPriority, ProcurementStatus } from '../entities/procurement-request.entity';

export class CreateProcurementRequestDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(ProcurementCategory)
  category: ProcurementCategory;

  @IsEnum(ProcurementPriority)
  @IsOptional()
  priority?: ProcurementPriority;

  @IsNumber()
  @Type(() => Number)
  estimatedAmount: number;

  @IsString()
  @IsOptional()
  vendor?: string;

  @IsString()
  @IsOptional()
  vendorContact?: string;

  @IsDateString()
  @IsOptional()
  requiredBy?: string;

  @IsString()
  department: string;

  @IsArray()
  @IsOptional()
  attachments?: string[];
}

export class UpdateProcurementRequestDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProcurementCategory)
  @IsOptional()
  category?: ProcurementCategory;

  @IsEnum(ProcurementPriority)
  @IsOptional()
  priority?: ProcurementPriority;

  @IsEnum(ProcurementStatus)
  @IsOptional()
  status?: ProcurementStatus;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  estimatedAmount?: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  actualAmount?: number;

  @IsString()
  @IsOptional()
  vendor?: string;

  @IsString()
  @IsOptional()
  vendorContact?: string;

  @IsDateString()
  @IsOptional()
  requiredBy?: string;

  @IsString()
  @IsOptional()
  approvalNotes?: string;

  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @IsArray()
  @IsOptional()
  attachments?: string[];
}
