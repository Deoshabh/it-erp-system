import { IsNotEmpty, IsString, IsEnum, IsOptional, IsBoolean, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateZoneDto {
  @IsNotEmpty()
  @IsString()
  zoneCode: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEnum(['receiving', 'storage', 'picking', 'packing', 'shipping', 'quarantine'])
  type: string;

  @IsNumber()
  @Min(0)
  capacity: number;

  @IsNotEmpty()
  @IsUUID()
  warehouseId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateZoneDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['receiving', 'storage', 'picking', 'packing', 'shipping', 'quarantine'])
  type?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  capacity?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
