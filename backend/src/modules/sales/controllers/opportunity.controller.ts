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
import { OpportunityService } from '../services/opportunity.service';
import { CreateOpportunityDto, UpdateOpportunityDto, OpportunityFilterDto } from '../dto/opportunity.dto';
import { Opportunity, OpportunityStage } from '../entities/opportunity.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@ApiTags('sales/opportunities')
@ApiBearerAuth()
@Controller('sales/opportunities')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class OpportunityController {
  constructor(private readonly opportunityService: OpportunityService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new opportunity' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Opportunity created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async create(@Body() createOpportunityDto: CreateOpportunityDto, @Request() req): Promise<Opportunity> {
    return await this.opportunityService.create(createOpportunityDto, req.user.sub);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: 'Get all opportunities with filtering and pagination' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in name, description' })
  @ApiQuery({ name: 'stage', required: false, enum: OpportunityStage, description: 'Filter by stage' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Opportunities retrieved successfully' })
  async findAll(@Query() filters: OpportunityFilterDto) {
    return await this.opportunityService.findAll(filters);
  }

  @Get('pipeline')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get sales pipeline data' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pipeline data retrieved successfully' })
  async getSalesPipeline() {
    return await this.opportunityService.getSalesPipeline();
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: 'Get opportunity statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Opportunity statistics retrieved successfully' })
  async getStatistics() {
    return await this.opportunityService.getOpportunityStatistics();
  }

  @Get('forecast')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: 'Get sales forecast' })
  @ApiQuery({ name: 'ownerId', required: false, description: 'Filter by opportunity owner' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sales forecast retrieved successfully' })
  async getForecast(@Query('ownerId') ownerId?: string) {
    return await this.opportunityService.getForecast(ownerId);
  }

  @Get('by-owner/:ownerId')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get opportunities by owner' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Opportunities retrieved successfully' })
  async getOpportunitiesByOwner(@Param('ownerId', ParseUUIDPipe) ownerId: string): Promise<Opportunity[]> {
    return await this.opportunityService.getOpportunitiesByOwner(ownerId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: 'Get opportunity by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Opportunity retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Opportunity not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Opportunity> {
    return await this.opportunityService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update opportunity' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Opportunity updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Opportunity not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOpportunityDto: UpdateOpportunityDto
  ): Promise<Opportunity> {
    return await this.opportunityService.update(id, updateOpportunityDto);
  }

  @Patch(':id/close-won')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER)
  @ApiOperation({ summary: 'Close opportunity as won' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Opportunity closed as won successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Opportunity not found' })
  async closeWon(@Param('id', ParseUUIDPipe) id: string): Promise<Opportunity> {
    return await this.opportunityService.closeWon(id);
  }

  @Patch(':id/close-lost')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER)
  @ApiOperation({ summary: 'Close opportunity as lost' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Opportunity closed as lost successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Opportunity not found' })
  async closeLost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('lossReason') lossReason?: string
  ): Promise<Opportunity> {
    return await this.opportunityService.closeLost(id, lossReason);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete opportunity' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Opportunity deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Opportunity not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.opportunityService.remove(id);
    return { message: 'Opportunity deleted successfully' };
  }

  @Post('bulk-delete')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER)
  @ApiOperation({ summary: 'Bulk delete opportunities' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Opportunities deleted successfully' })
  async bulkDelete(@Body('ids') ids: string[]): Promise<{ message: string }> {
    await this.opportunityService.bulkDelete(ids);
    return { message: `${ids.length} opportunities deleted successfully` };
  }

  @Patch('bulk-stage')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER)
  @ApiOperation({ summary: 'Bulk update opportunity stage' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Opportunity stages updated successfully' })
  async bulkUpdateStage(
    @Body('ids') ids: string[],
    @Body('stage') stage: OpportunityStage
  ): Promise<{ message: string }> {
    await this.opportunityService.bulkUpdateStage(ids, stage);
    return { message: `${ids.length} opportunities stage updated successfully` };
  }
}
