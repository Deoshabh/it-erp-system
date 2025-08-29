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
import { SystemSettingService } from '../services/system-setting.service';
import { CreateSystemSettingDto, UpdateSystemSettingDto, UpdateSettingValueDto, SystemSettingFilterDto } from '../dto/system-setting.dto';
import { SystemSetting, SettingCategory, SettingType } from '../entities/system-setting.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@ApiTags('admin/settings')
@ApiBearerAuth()
@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@UsePipes(new ValidationPipe({ transform: true }))
export class SystemSettingController {
  constructor(private readonly systemSettingService: SystemSettingService) {}

  @Post()
  @ApiOperation({ summary: 'Create system setting' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'System setting created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data or key already exists' })
  async create(
    @Body() createSystemSettingDto: CreateSystemSettingDto,
    @Request() req
  ): Promise<SystemSetting> {
    return await this.systemSettingService.create(createSystemSettingDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get system settings' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in key, name, description' })
  @ApiQuery({ name: 'category', required: false, enum: SettingCategory, description: 'Filter by category' })
  @ApiQuery({ name: 'type', required: false, enum: SettingType, description: 'Filter by type' })
  @ApiQuery({ name: 'editableOnly', required: false, type: Boolean, description: 'Show only editable settings' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiResponse({ status: HttpStatus.OK, description: 'System settings retrieved successfully' })
  async findAll(@Query() filters: SystemSettingFilterDto) {
    return await this.systemSettingService.findAll(filters);
  }

  @Get('public')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.HR, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get public system settings' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Public settings retrieved successfully' })
  async getPublicSettings(): Promise<{ [key: string]: any }> {
    return await this.systemSettingService.getPublicSettings();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get settings by category' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Category settings retrieved successfully' })
  async getByCategory(@Param('category') category: SettingCategory): Promise<SystemSetting[]> {
    return await this.systemSettingService.getSettingsByCategory(category);
  }

  @Get('key/:key')
  @ApiOperation({ summary: 'Get setting by key' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Setting retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Setting not found' })
  async findByKey(@Param('key') key: string): Promise<SystemSetting> {
    return await this.systemSettingService.findByKey(key);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get system setting by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'System setting retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'System setting not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<SystemSetting> {
    return await this.systemSettingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update system setting' })
  @ApiResponse({ status: HttpStatus.OK, description: 'System setting updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'System setting not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data or setting not editable' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSystemSettingDto: UpdateSystemSettingDto,
    @Request() req
  ): Promise<SystemSetting> {
    return await this.systemSettingService.update(id, updateSystemSettingDto, req.user.sub);
  }

  @Patch(':id/value')
  @ApiOperation({ summary: 'Update setting value only' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Setting value updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'System setting not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid value or setting not editable' })
  async updateValue(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateValueDto: UpdateSettingValueDto,
    @Request() req
  ): Promise<SystemSetting> {
    return await this.systemSettingService.updateValue(id, updateValueDto, req.user.sub);
  }

  @Patch('key/:key/value')
  @ApiOperation({ summary: 'Update setting value by key' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Setting value updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'System setting not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid value or setting not editable' })
  async updateByKey(
    @Param('key') key: string,
    @Body() updateValueDto: UpdateSettingValueDto,
    @Request() req
  ): Promise<SystemSetting> {
    return await this.systemSettingService.updateByKey(key, updateValueDto.value, req.user.sub);
  }

  @Patch(':id/reset')
  @ApiOperation({ summary: 'Reset setting to default value' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Setting reset successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'System setting not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'No default value or setting not editable' })
  async resetToDefault(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req
  ): Promise<SystemSetting> {
    return await this.systemSettingService.resetToDefault(id, req.user.sub);
  }

  @Post('bulk-update')
  @ApiOperation({ summary: 'Bulk update settings' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Settings updated successfully' })
  async bulkUpdate(
    @Body() updates: { key: string; value: string }[],
    @Request() req
  ): Promise<SystemSetting[]> {
    return await this.systemSettingService.bulkUpdate(updates, req.user.sub);
  }

  @Post('initialize-defaults')
  @ApiOperation({ summary: 'Initialize default system settings' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Default settings initialized successfully' })
  async initializeDefaults(): Promise<{ message: string }> {
    await this.systemSettingService.initializeDefaultSettings();
    return { message: 'Default settings initialized successfully' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete system setting' })
  @ApiResponse({ status: HttpStatus.OK, description: 'System setting deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'System setting not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.systemSettingService.remove(id);
    return { message: 'System setting deleted successfully' };
  }
}
