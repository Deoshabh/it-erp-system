import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditLogService } from '../services/audit-log.service';
import { CreateAuditLogDto, AuditLogFilterDto } from '../dto/audit-log.dto';
import { AuditLog, AuditAction, AuditEntityType } from '../entities/audit-log.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@ApiTags('admin/audit-logs')
@ApiBearerAuth()
@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@UsePipes(new ValidationPipe({ transform: true }))
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Post()
  @ApiOperation({ summary: 'Create audit log entry' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Audit log created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async create(@Body() createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    return await this.auditLogService.create(createAuditLogDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in description, entity name' })
  @ApiQuery({ name: 'action', required: false, enum: AuditAction, description: 'Filter by action' })
  @ApiQuery({ name: 'entityType', required: false, enum: AuditEntityType, description: 'Filter by entity type' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Filter from date' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Filter to date' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Audit logs retrieved successfully' })
  async findAll(@Query() filters: AuditLogFilterDto) {
    return await this.auditLogService.findAll(filters);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get audit log statistics' })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Statistics from date' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Statistics to date' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Audit statistics retrieved successfully' })
  async getStatistics(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    const fromDate = dateFrom ? new Date(dateFrom) : undefined;
    const toDate = dateTo ? new Date(dateTo) : undefined;
    return await this.auditLogService.getAuditStatistics(fromDate, toDate);
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get audit history for specific entity' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Entity audit history retrieved successfully' })
  async getEntityHistory(
    @Param('entityType') entityType: AuditEntityType,
    @Param('entityId') entityId: string
  ): Promise<AuditLog[]> {
    return await this.auditLogService.getEntityHistory(entityType, entityId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user activity logs' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit number of results' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User activity retrieved successfully' })
  async getUserActivity(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('limit') limit?: number
  ): Promise<AuditLog[]> {
    return await this.auditLogService.getUserActivity(userId, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Audit log retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Audit log not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AuditLog> {
    return await this.auditLogService.findOne(id);
  }

  @Delete('cleanup/:daysOld')
  @ApiOperation({ summary: 'Delete old audit logs' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Old audit logs deleted successfully' })
  async cleanupOldLogs(@Param('daysOld') daysOld: number): Promise<{ deletedCount: number }> {
    return await this.auditLogService.deleteOldLogs(daysOld);
  }
}
