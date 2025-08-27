import { IsString, IsDecimal, IsDateString, IsOptional } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  invoiceNumber: string;

  @IsString()
  clientName: string;

  @IsDecimal()
  amount: number;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateExpenseDto {
  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsDecimal()
  amount: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  status?: string;
}
