import { IsString, IsOptional, IsEnum, IsUUID, IsNumber, IsDateString } from 'class-validator';
import { QuotationStatus } from '../entities/quotation.entity';

export class CreateQuotationDto {
  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsUUID()
  enquiryId?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @IsNumber()
  taxAmount: number;

  @IsNumber()
  grandTotal: number;

  @IsOptional()
  @IsEnum(QuotationStatus)
  status?: QuotationStatus;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsString()
  terms?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}

export class UpdateQuotationDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsUUID()
  enquiryId?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @IsOptional()
  @IsNumber()
  taxAmount?: number;

  @IsOptional()
  @IsNumber()
  grandTotal?: number;

  @IsOptional()
  @IsEnum(QuotationStatus)
  status?: QuotationStatus;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsString()
  terms?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}
