import { IsNotEmpty, IsString, IsEnum, IsOptional, IsBoolean, IsNumber, IsUUID, IsObject, Min, Max } from 'class-validator';

export class CreateWarehouseDto {
  @IsNotEmpty()
  @IsString()
  warehouseCode: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEnum(['main', 'branch', 'transit', 'virtual'])
  type: string;

  @IsObject()
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };

  @IsNotEmpty()
  @IsString()
  managerName: string;

  @IsNotEmpty()
  @IsString()
  contactNumber: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNumber()
  @Min(0)
  totalCapacity: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateWarehouseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['main', 'branch', 'transit', 'virtual'])
  type?: string;

  @IsOptional()
  @IsObject()
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };

  @IsOptional()
  @IsString()
  managerName?: string;

  @IsOptional()
  @IsString()
  contactNumber?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalCapacity?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
