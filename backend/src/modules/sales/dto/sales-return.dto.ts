import { IsString, IsOptional, IsEnum, IsUUID, IsNumber, IsDateString } from 'class-validator';
import { ReturnStatus, ReturnReason } from '../entities/sales-return.entity';

export class CreateSalesReturnDto {
  @IsUUID()
  customerId: string;

  @IsUUID()
  invoiceId: string;

  @IsDateString()
  returnDate: string;

  @IsNumber()
  returnAmount: number;

  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @IsNumber()
  taxAmount: number;

  @IsNumber()
  totalReturnAmount: number;

  @IsOptional()
  @IsEnum(ReturnStatus)
  status?: ReturnStatus;

  @IsOptional()
  @IsEnum(ReturnReason)
  reason?: ReturnReason;

  @IsOptional()
  @IsString()
  reasonDescription?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}

export class UpdateSalesReturnDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsUUID()
  invoiceId?: string;

  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @IsOptional()
  @IsNumber()
  returnAmount?: number;

  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @IsOptional()
  @IsNumber()
  taxAmount?: number;

  @IsOptional()
  @IsNumber()
  totalReturnAmount?: number;

  @IsOptional()
  @IsEnum(ReturnStatus)
  status?: ReturnStatus;

  @IsOptional()
  @IsEnum(ReturnReason)
  reason?: ReturnReason;

  @IsOptional()
  @IsString()
  reasonDescription?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}
