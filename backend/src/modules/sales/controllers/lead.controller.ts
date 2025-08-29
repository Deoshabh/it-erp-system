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
import { LeadService } from '../services/lead.service';
import { CreateLeadDto, UpdateLeadDto, LeadFilterDto } from '../dto/lead.dto';
import { Lead, LeadStatus } from '../entities/lead.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@ApiTags('sales/leads')
@ApiBearerAuth()
@Controller('sales/leads')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new lead' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Lead created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Lead with email already exists' })
  async create(@Body() createLeadDto: CreateLeadDto, @Request() req): Promise<Lead> {
    return await this.leadService.create(createLeadDto, req.user.sub);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER, UserRole.HR)
  @ApiOperation({ summary: 'Get all leads with filtering and pagination' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in name, email, company' })
  @ApiQuery({ name: 'status', required: false, enum: LeadStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Leads retrieved successfully' })
  async findAll(@Query() filters: LeadFilterDto) {
    return await this.leadService.findAll(filters);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get lead statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lead statistics retrieved successfully' })
  async getStatistics() {
    return await this.leadService.getLeadStatistics();
  }

  @Get('by-assignee/:assigneeId')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get leads by assignee' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Leads retrieved successfully' })
  async getLeadsByAssignee(@Param('assigneeId', ParseUUIDPipe) assigneeId: string): Promise<Lead[]> {
    return await this.leadService.getLeadsByAssignee(assigneeId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER, UserRole.HR)
  @ApiOperation({ summary: 'Get lead by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lead retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Lead not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Lead> {
    return await this.leadService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update lead' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lead updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Lead not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLeadDto: UpdateLeadDto
  ): Promise<Lead> {
    return await this.leadService.update(id, updateLeadDto);
  }

  @Patch(':id/convert')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER)
  @ApiOperation({ summary: 'Convert lead to customer' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lead converted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Lead not found' })
  async convertToCustomer(@Param('id', ParseUUIDPipe) id: string): Promise<Lead> {
    return await this.leadService.convertToCustomer(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete lead' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lead deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Lead not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.leadService.remove(id);
    return { message: 'Lead deleted successfully' };
  }

  @Post('bulk-delete')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER)
  @ApiOperation({ summary: 'Bulk delete leads' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Leads deleted successfully' })
  async bulkDelete(@Body('ids') ids: string[]): Promise<{ message: string }> {
    await this.leadService.bulkDelete(ids);
    return { message: `${ids.length} leads deleted successfully` };
  }

  @Patch('bulk-status')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER)
  @ApiOperation({ summary: 'Bulk update lead status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lead statuses updated successfully' })
  async bulkUpdateStatus(
    @Body('ids') ids: string[],
    @Body('status') status: LeadStatus
  ): Promise<{ message: string }> {
    await this.leadService.bulkUpdateStatus(ids, status);
    return { message: `${ids.length} leads status updated successfully` };
  }
}
