import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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
import { DashboardWidgetService } from '../services/dashboard-widget.service';
import { CreateDashboardWidgetDto, UpdateDashboardWidgetDto, DashboardWidgetFilterDto, UpdateWidgetPositionDto } from '../dto/dashboard-widget.dto';
import { DashboardWidget, DashboardWidgetType } from '../entities/dashboard-widget.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@ApiTags('admin/dashboard')
@ApiBearerAuth()
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class DashboardWidgetController {
  constructor(private readonly dashboardWidgetService: DashboardWidgetService) {}

  @Post('widgets')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create dashboard widget' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Dashboard widget created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async createWidget(@Body() createDashboardWidgetDto: CreateDashboardWidgetDto): Promise<DashboardWidget> {
    return await this.dashboardWidgetService.create(createDashboardWidgetDto);
  }

  @Get('widgets')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HR, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get dashboard widgets' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in title, description' })
  @ApiQuery({ name: 'type', required: false, enum: DashboardWidgetType, description: 'Filter by widget type' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'visibleOnly', required: false, type: Boolean, description: 'Show only visible widgets' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dashboard widgets retrieved successfully' })
  async findAllWidgets(@Query() filters: DashboardWidgetFilterDto) {
    return await this.dashboardWidgetService.findAll(filters);
  }

  @Get('layout')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HR, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get default dashboard layout' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dashboard layout retrieved successfully' })
  async getDefaultLayout(): Promise<DashboardWidget[]> {
    return await this.dashboardWidgetService.getDefaultDashboardLayout();
  }

  @Get('widgets/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HR, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get dashboard widget by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dashboard widget retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Dashboard widget not found' })
  async findOneWidget(@Param('id', ParseUUIDPipe) id: string): Promise<DashboardWidget> {
    return await this.dashboardWidgetService.findOne(id);
  }

  @Get('widgets/:id/data')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HR, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get dashboard widget data' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Widget data retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Widget not found or not available' })
  async getWidgetData(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req
  ): Promise<any> {
    return await this.dashboardWidgetService.getWidgetData(id, req.user.sub);
  }

  @Patch('widgets/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update dashboard widget' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dashboard widget updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Dashboard widget not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async updateWidget(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDashboardWidgetDto: UpdateDashboardWidgetDto
  ): Promise<DashboardWidget> {
    return await this.dashboardWidgetService.update(id, updateDashboardWidgetDto);
  }

  @Patch('widgets/:id/position')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update widget position and size' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Widget position updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Dashboard widget not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid position data' })
  async updateWidgetPosition(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePositionDto: UpdateWidgetPositionDto
  ): Promise<DashboardWidget> {
    return await this.dashboardWidgetService.updatePosition(id, updatePositionDto);
  }

  @Post('initialize-defaults')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Initialize default dashboard widgets' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Default widgets initialized successfully' })
  async initializeDefaultWidgets(): Promise<{ message: string }> {
    await this.dashboardWidgetService.createDefaultWidgets();
    return { message: 'Default dashboard widgets initialized successfully' };
  }

  @Delete('widgets/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete dashboard widget (soft delete)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dashboard widget deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Dashboard widget not found' })
  async removeWidget(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.dashboardWidgetService.remove(id);
    return { message: 'Dashboard widget deleted successfully' };
  }
}
