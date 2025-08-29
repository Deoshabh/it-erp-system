import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  Length,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { DashboardWidgetType, ChartType } from '../entities/dashboard-widget.entity';

export class CreateDashboardWidgetDto {
  @ApiProperty({ description: 'Widget title', maxLength: 200 })
  @IsNotEmpty()
  @IsString()
  @Length(1, 200)
  title: string;

  @ApiPropertyOptional({ description: 'Widget description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: DashboardWidgetType, description: 'Type of widget' })
  @IsNotEmpty()
  @IsEnum(DashboardWidgetType)
  type: DashboardWidgetType;

  @ApiPropertyOptional({ enum: ChartType, description: 'Chart type (for chart widgets)' })
  @IsOptional()
  @IsEnum(ChartType)
  chartType?: ChartType;

  @ApiProperty({ description: 'Widget configuration object' })
  @IsNotEmpty()
  configuration: any;

  @ApiProperty({ description: 'Data source for the widget' })
  @IsNotEmpty()
  @IsString()
  dataSource: string;

  @ApiPropertyOptional({ description: 'Filters to apply to the data' })
  @IsOptional()
  filters?: any;

  @ApiPropertyOptional({ description: 'Widget width (1-12)', minimum: 1, maximum: 12, default: 12 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  width?: number;

  @ApiPropertyOptional({ description: 'Widget height', minimum: 1, default: 6 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  height?: number;

  @ApiPropertyOptional({ description: 'X position in grid', minimum: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  xPosition?: number;

  @ApiPropertyOptional({ description: 'Y position in grid', minimum: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  yPosition?: number;

  @ApiPropertyOptional({ description: 'Refresh interval in seconds', minimum: 30, default: 300 })
  @IsOptional()
  @IsNumber()
  @Min(30)
  refreshInterval?: number;

  @ApiPropertyOptional({ description: 'Whether the widget is visible', default: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @ApiPropertyOptional({ description: 'Widget category', default: 'default' })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  category?: string;
}

export class UpdateDashboardWidgetDto extends PartialType(CreateDashboardWidgetDto) {}

export class DashboardWidgetFilterDto {
  @ApiPropertyOptional({ description: 'Search in title, description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: DashboardWidgetType, description: 'Filter by widget type' })
  @IsOptional()
  @IsEnum(DashboardWidgetType)
  type?: DashboardWidgetType;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Show only visible widgets' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  visibleOnly?: boolean;

  @ApiPropertyOptional({ description: 'Show only active widgets' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  activeOnly?: boolean;

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

  @ApiPropertyOptional({ description: 'Sort by field', default: 'yPosition' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'yPosition';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

export class UpdateWidgetPositionDto {
  @ApiProperty({ description: 'X position in grid', minimum: 0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  xPosition: number;

  @ApiProperty({ description: 'Y position in grid', minimum: 0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  yPosition: number;

  @ApiPropertyOptional({ description: 'Widget width (1-12)', minimum: 1, maximum: 12 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  width?: number;

  @ApiPropertyOptional({ description: 'Widget height', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  height?: number;
}
