import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  IsBoolean,
  Length,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { AuditAction, AuditEntityType } from '../entities/audit-log.entity';

export class CreateAuditLogDto {
  @ApiProperty({ enum: AuditAction, description: 'Audit action performed' })
  @IsNotEmpty()
  @IsEnum(AuditAction)
  action: AuditAction;

  @ApiProperty({ enum: AuditEntityType, description: 'Type of entity affected' })
  @IsNotEmpty()
  @IsEnum(AuditEntityType)
  entityType: AuditEntityType;

  @ApiPropertyOptional({ description: 'ID of the affected entity' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Name of the affected entity', maxLength: 200 })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  entityName?: string;

  @ApiPropertyOptional({ description: 'Description of the action performed' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Previous values before the action' })
  @IsOptional()
  oldValues?: any;

  @ApiPropertyOptional({ description: 'New values after the action' })
  @IsOptional()
  newValues?: any;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: any;

  @ApiPropertyOptional({ description: 'IP address of the user' })
  @IsOptional()
  @IsString()
  @Length(0, 45)
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User agent string' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Session ID' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({ description: 'User ID who performed the action' })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

export class AuditLogFilterDto {
  @ApiPropertyOptional({ description: 'Search in description, entity name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: AuditAction, description: 'Filter by action' })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({ enum: AuditEntityType, description: 'Filter by entity type' })
  @IsOptional()
  @IsEnum(AuditEntityType)
  entityType?: AuditEntityType;

  @ApiPropertyOptional({ description: 'Filter by entity ID' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter from this date' })
  @IsOptional()
  @IsDateString()
  dateFrom?: Date;

  @ApiPropertyOptional({ description: 'Filter until this date' })
  @IsOptional()
  @IsDateString()
  dateTo?: Date;

  @ApiPropertyOptional({ description: 'Filter by IP address' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'Show only system actions' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  systemActionsOnly?: boolean;

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

  @ApiPropertyOptional({ description: 'Sort by field', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
