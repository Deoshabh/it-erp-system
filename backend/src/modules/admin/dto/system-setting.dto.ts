import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  Length,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { SettingType, SettingCategory } from '../entities/system-setting.entity';

export class CreateSystemSettingDto {
  @ApiProperty({ description: 'Setting key (unique identifier)', maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  key: string;

  @ApiProperty({ description: 'Setting value' })
  @IsNotEmpty()
  @IsString()
  value: string;

  @ApiProperty({ enum: SettingType, description: 'Type of the setting value' })
  @IsOptional()
  @IsEnum(SettingType)
  type?: SettingType;

  @ApiProperty({ enum: SettingCategory, description: 'Category of the setting' })
  @IsOptional()
  @IsEnum(SettingCategory)
  category?: SettingCategory;

  @ApiProperty({ description: 'Display name of the setting', maxLength: 200 })
  @IsNotEmpty()
  @IsString()
  @Length(1, 200)
  name: string;

  @ApiPropertyOptional({ description: 'Description of the setting' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Default value for the setting' })
  @IsOptional()
  @IsString()
  defaultValue?: string;

  @ApiPropertyOptional({ description: 'Whether the setting value is secret' })
  @IsOptional()
  @IsBoolean()
  isSecret?: boolean;

  @ApiPropertyOptional({ description: 'Whether the setting can be edited' })
  @IsOptional()
  @IsBoolean()
  isEditable?: boolean;

  @ApiPropertyOptional({ description: 'Whether changing this setting requires system restart' })
  @IsOptional()
  @IsBoolean()
  requiresRestart?: boolean;

  @ApiPropertyOptional({ description: 'Validation rules for the setting value' })
  @IsOptional()
  @IsString()
  validationRules?: string;

  @ApiPropertyOptional({ description: 'Sort order for display', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

export class UpdateSystemSettingDto extends PartialType(CreateSystemSettingDto) {}

export class UpdateSettingValueDto {
  @ApiProperty({ description: 'New value for the setting' })
  @IsNotEmpty()
  @IsString()
  value: string;
}

export class SystemSettingFilterDto {
  @ApiPropertyOptional({ description: 'Search in key, name, description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: SettingCategory, description: 'Filter by category' })
  @IsOptional()
  @IsEnum(SettingCategory)
  category?: SettingCategory;

  @ApiPropertyOptional({ enum: SettingType, description: 'Filter by type' })
  @IsOptional()
  @IsEnum(SettingType)
  type?: SettingType;

  @ApiPropertyOptional({ description: 'Show only editable settings' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  editableOnly?: boolean;

  @ApiPropertyOptional({ description: 'Show only secret settings' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  secretOnly?: boolean;

  @ApiPropertyOptional({ description: 'Page number for pagination', minimum: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Sort by field', default: 'category' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'category';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
