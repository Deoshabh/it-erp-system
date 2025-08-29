import { IsNotEmpty, IsString, IsEnum, IsOptional, IsBoolean, IsNumber, IsObject, Min, Max } from 'class-validator';

export class CreateItemDto {
  @IsNotEmpty()
  @IsString()
  itemCode: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['product', 'service', 'asset'])
  type: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsNotEmpty()
  @IsString()
  unit: string;

  @IsNumber()
  @Min(0)
  standardCost: number;

  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumStock?: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumStock?: number = 0;

  @IsOptional()
  @IsBoolean()
  isBatchTracked?: boolean = false;

  @IsOptional()
  @IsBoolean()
  isSerialTracked?: boolean = false;

  @IsOptional()
  @IsObject()
  specifications?: any;

  @IsOptional()
  @IsString()
  hsnCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(28)
  gstRate?: number = 0;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['product', 'service', 'asset'])
  type?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  standardCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumStock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumStock?: number;

  @IsOptional()
  @IsBoolean()
  isBatchTracked?: boolean;

  @IsOptional()
  @IsBoolean()
  isSerialTracked?: boolean;

  @IsOptional()
  @IsObject()
  specifications?: any;

  @IsOptional()
  @IsString()
  hsnCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(28)
  gstRate?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
