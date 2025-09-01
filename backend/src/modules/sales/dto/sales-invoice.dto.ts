import { IsString, IsOptional, IsEnum, IsUUID, IsNumber, IsDateString } from 'class-validator';
import { InvoiceStatus, EInvoiceStatus, EWayBillStatus } from '../entities/sales-invoice.entity';

export class CreateSalesInvoiceDto {
  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsUUID()
  salesOrderId?: string;

  @IsDateString()
  invoiceDate: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsNumber()
  subtotal: number;

  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @IsNumber()
  taxAmount: number;

  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsNumber()
  paidAmount?: number;

  @IsNumber()
  balanceAmount: number;

  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsOptional()
  @IsEnum(EInvoiceStatus)
  eInvoiceStatus?: EInvoiceStatus;

  @IsOptional()
  @IsString()
  eInvoiceNo?: string;

  @IsOptional()
  @IsEnum(EWayBillStatus)
  eWayBillStatus?: EWayBillStatus;

  @IsOptional()
  @IsString()
  eWayBillNo?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}

export class UpdateSalesInvoiceDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsUUID()
  salesOrderId?: string;

  @IsOptional()
  @IsDateString()
  invoiceDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsNumber()
  subtotal?: number;

  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @IsOptional()
  @IsNumber()
  taxAmount?: number;

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsNumber()
  paidAmount?: number;

  @IsOptional()
  @IsNumber()
  balanceAmount?: number;

  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsOptional()
  @IsEnum(EInvoiceStatus)
  eInvoiceStatus?: EInvoiceStatus;

  @IsOptional()
  @IsString()
  eInvoiceNo?: string;

  @IsOptional()
  @IsEnum(EWayBillStatus)
  eWayBillStatus?: EWayBillStatus;

  @IsOptional()
  @IsString()
  eWayBillNo?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}
