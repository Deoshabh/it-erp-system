import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, IsDateString, IsArray, ValidateNested, IsObject, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class BillItemDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  hsnCode?: string;

  @IsNumber()
  @Min(0.001)
  quantity: number;

  @IsNotEmpty()
  @IsString()
  unit: string;

  @IsNumber()
  @Min(0)
  rate: number;

  @IsNumber()
  @Min(0)
  @Max(28)
  gstRate: number;
}

export class CreateBillDto {
  @IsNotEmpty()
  @IsString()
  billNumber: string;

  @IsEnum(['purchase_bill', 'sales_bill', 'service_bill', 'debit_note', 'credit_note'])
  billType: string;

  @IsNotEmpty()
  @IsString()
  vendorName: string;

  @IsOptional()
  @IsString()
  vendorGstin?: string;

  @IsOptional()
  @IsString()
  vendorEmail?: string;

  @IsOptional()
  @IsString()
  vendorPhone?: string;

  @IsObject()
  vendorAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };

  @IsDateString()
  billDate: string;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tdsAmount?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillItemDto)
  billItems: BillItemDto[];

  @IsOptional()
  @IsEnum(['draft', 'pending', 'approved'])
  status?: string = 'draft';
}

export class UpdateBillDto {
  @IsOptional()
  @IsString()
  vendorName?: string;

  @IsOptional()
  @IsString()
  vendorGstin?: string;

  @IsOptional()
  @IsString()
  vendorEmail?: string;

  @IsOptional()
  @IsString()
  vendorPhone?: string;

  @IsOptional()
  @IsObject()
  vendorAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };

  @IsOptional()
  @IsDateString()
  billDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tdsAmount?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillItemDto)
  billItems?: BillItemDto[];

  @IsOptional()
  @IsEnum(['draft', 'pending', 'approved', 'paid', 'partially_paid', 'overdue', 'cancelled'])
  status?: string;
}

export class CreateBillPaymentDto {
  @IsNotEmpty()
  @IsString()
  billId: string;

  @IsNotEmpty()
  @IsString()
  paymentReference: string;

  @IsNumber()
  @Min(0.01)
  paidAmount: number;

  @IsDateString()
  paymentDate: string;

  @IsEnum(['cash', 'cheque', 'bank_transfer', 'upi', 'credit_card', 'debit_card'])
  paymentMethod: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class BillFilterDto {
  @IsOptional()
  @IsEnum(['purchase_bill', 'sales_bill', 'service_bill', 'debit_note', 'credit_note'])
  billType?: string;

  @IsOptional()
  @IsEnum(['draft', 'pending', 'approved', 'paid', 'partially_paid', 'overdue', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsString()
  vendorName?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAmount?: number;
}
