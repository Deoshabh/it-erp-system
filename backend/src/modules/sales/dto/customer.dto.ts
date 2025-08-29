import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, IsDateString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { CustomerType, CustomerStatus } from '../entities/customer.entity';

export class CreateCustomerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsEnum(CustomerType)
  type?: CustomerType;

  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @IsOptional()
  @IsNumber()
  employeeCount?: number;

  @IsOptional()
  @IsNumber()
  annualRevenue?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  billingAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  billingCity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  billingState?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  billingZipCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  billingCountry?: string;

  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  shippingCity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  shippingState?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  shippingZipCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  shippingCountry?: string;

  @IsOptional()
  @IsUUID()
  accountManagerId?: string;
}

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsEnum(CustomerType)
  type?: CustomerType;

  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @IsOptional()
  @IsNumber()
  employeeCount?: number;

  @IsOptional()
  @IsNumber()
  annualRevenue?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  billingAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  billingCity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  billingState?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  billingZipCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  billingCountry?: string;

  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  shippingCity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  shippingState?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  shippingZipCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  shippingCountry?: string;

  @IsOptional()
  @IsUUID()
  accountManagerId?: string;
}

export class CustomerFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(CustomerType)
  type?: CustomerType;

  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsUUID()
  accountManagerId?: string;

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
