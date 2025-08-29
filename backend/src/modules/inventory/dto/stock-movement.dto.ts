import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, IsUUID, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStockMovementDto {
  @IsNotEmpty()
  @IsString()
  referenceNumber: string;

  @IsEnum(['in', 'out', 'transfer', 'adjustment'])
  type: string;

  @IsNumber()
  @Min(0.001)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitCost: number;

  @IsNotEmpty()
  @IsUUID()
  itemId: string;

  @IsNotEmpty()
  @IsUUID()
  warehouseId: string;

  @IsNotEmpty()
  @IsUUID()
  zoneId: string;

  @IsOptional()
  @IsString()
  batchNumber?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiryDate?: Date;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed', 'cancelled'])
  status?: string = 'pending';
}

export class UpdateStockMovementDto {
  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
