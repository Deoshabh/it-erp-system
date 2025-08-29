import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsDateString,
  IsNumber,
  IsOptional,
  IsArray,
  IsUUID,
  IsBoolean,
  Length,
  Min,
  Max,
  IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ProjectStatus, ProjectPriority, ProjectType } from '../entities/project.entity';

export class CreateProjectDto {
  @ApiProperty({ description: 'Project name', maxLength: 200 })
  @IsNotEmpty()
  @IsString()
  @Length(1, 200)
  name: string;

  @ApiPropertyOptional({ description: 'Project description', maxLength: 500 })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiPropertyOptional({ description: 'Project objectives' })
  @IsOptional()
  @IsString()
  objectives?: string;

  @ApiProperty({ enum: ProjectStatus, description: 'Project status' })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiProperty({ enum: ProjectPriority, description: 'Project priority' })
  @IsOptional()
  @IsEnum(ProjectPriority)
  priority?: ProjectPriority;

  @ApiProperty({ enum: ProjectType, description: 'Project type' })
  @IsOptional()
  @IsEnum(ProjectType)
  type?: ProjectType;

  @ApiProperty({ description: 'Project start date' })
  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @ApiProperty({ description: 'Project end date' })
  @IsNotEmpty()
  @IsDateString()
  endDate: Date;

  @ApiPropertyOptional({ description: 'Actual start date' })
  @IsOptional()
  @IsDateString()
  actualStartDate?: Date;

  @ApiPropertyOptional({ description: 'Actual end date' })
  @IsOptional()
  @IsDateString()
  actualEndDate?: Date;

  @ApiPropertyOptional({ description: 'Project budget' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  budget?: number;

  @ApiPropertyOptional({ description: 'Actual cost', default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  actualCost?: number;

  @ApiPropertyOptional({ description: 'Project progress percentage', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @ApiPropertyOptional({ description: 'Client name', maxLength: 200 })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  clientName?: string;

  @ApiPropertyOptional({ description: 'Project notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Project manager ID' })
  @IsNotEmpty()
  @IsUUID()
  managerId: string;

  @ApiPropertyOptional({ description: 'Team member IDs' })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  teamMemberIds?: string[];
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class ProjectFilterDto {
  @ApiPropertyOptional({ description: 'Search in name, description, client name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ProjectStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ enum: ProjectPriority, description: 'Filter by priority' })
  @IsOptional()
  @IsEnum(ProjectPriority)
  priority?: ProjectPriority;

  @ApiPropertyOptional({ enum: ProjectType, description: 'Filter by type' })
  @IsOptional()
  @IsEnum(ProjectType)
  type?: ProjectType;

  @ApiPropertyOptional({ description: 'Filter by manager ID' })
  @IsOptional()
  @IsUUID()
  managerId?: string;

  @ApiPropertyOptional({ description: 'Filter by team member ID' })
  @IsOptional()
  @IsUUID()
  teamMemberId?: string;

  @ApiPropertyOptional({ description: 'Filter by client name' })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({ description: 'Filter projects starting from this date' })
  @IsOptional()
  @IsDateString()
  startDateFrom?: Date;

  @ApiPropertyOptional({ description: 'Filter projects starting until this date' })
  @IsOptional()
  @IsDateString()
  startDateTo?: Date;

  @ApiPropertyOptional({ description: 'Filter projects ending from this date' })
  @IsOptional()
  @IsDateString()
  endDateFrom?: Date;

  @ApiPropertyOptional({ description: 'Filter projects ending until this date' })
  @IsOptional()
  @IsDateString()
  endDateTo?: Date;

  @ApiPropertyOptional({ description: 'Filter by minimum budget' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMin?: number;

  @ApiPropertyOptional({ description: 'Filter by maximum budget' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMax?: number;

  @ApiPropertyOptional({ description: 'Filter overdue projects only' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isOverdue?: boolean;

  @ApiPropertyOptional({ description: 'Include inactive projects' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeInactive?: boolean;

  @ApiPropertyOptional({ description: 'Page number for pagination', minimum: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', minimum: 1, maximum: 100, default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Sort by field', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class AddTeamMemberDto {
  @ApiProperty({ description: 'User ID to add to team' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}

export class RemoveTeamMemberDto {
  @ApiProperty({ description: 'User ID to remove from team' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}

export class UpdateProjectProgressDto {
  @ApiProperty({ description: 'Project progress percentage', minimum: 0, maximum: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @ApiPropertyOptional({ description: 'Progress notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
