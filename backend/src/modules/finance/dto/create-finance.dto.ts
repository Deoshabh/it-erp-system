import { IsString, IsDecimal, IsDateString, IsOptional, IsArray, IsEmail } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  invoiceNumber: string;

  @IsString()
  clientName: string;

  @IsOptional()
  @IsEmail()
  clientEmail?: string;

  @IsDecimal()
  amount: number;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  items?: any[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateExpenseDto {
  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsDecimal()
  amount: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
