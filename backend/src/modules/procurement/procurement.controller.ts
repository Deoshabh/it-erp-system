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
  Request 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProcurementService } from './procurement.service';
import { CreateProcurementRequestDto, UpdateProcurementRequestDto } from './dto/procurement-request.dto';
import { ProcurementStatus } from './entities/procurement-request.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('procurement')
@ApiBearerAuth()
@Controller('api/v1/procurement')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.FINANCE, UserRole.SALES, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Create a new procurement request' })
  @ApiResponse({ status: 201, description: 'Request created successfully' })
  async create(
    @Body() createDto: CreateProcurementRequestDto,
    @Request() req: any,
  ) {
    return await this.procurementService.createRequest(createDto, req.user?.id || req.user?.sub);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.FINANCE, UserRole.SALES, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Get all procurement requests with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Requests retrieved successfully' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: ProcurementStatus,
    @Query('category') category?: string,
    @Query('department') department?: string,
    @Query('priority') priority?: string,
    @Query('sortBy') sortBy: string = 'createdAt',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    return await this.procurementService.findAll(
      +page,
      +limit,
      search,
      status,
      category,
      department,
      priority,
      sortBy,
      sortOrder,
    );
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get procurement statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStatistics(@Query('department') department?: string) {
    return await this.procurementService.getStatistics(department);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a procurement request by ID' })
  @ApiResponse({ status: 200, description: 'Request retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return await this.procurementService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a procurement request' })
  @ApiResponse({ status: 200, description: 'Request updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProcurementRequestDto,
    @Request() req: any,
  ) {
    return await this.procurementService.updateRequest(
      id,
      updateDto,
      req.user?.id || 'mock-user-id',
      req.user?.role || 'employee',
    );
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit request for approval' })
  @ApiResponse({ status: 200, description: 'Request submitted for approval' })
  async submitForApproval(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return await this.procurementService.submitForApproval(id, req.user?.id || 'mock-user-id');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a procurement request' })
  @ApiResponse({ status: 200, description: 'Request deleted successfully' })
  async remove(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    await this.procurementService.deleteRequest(
      id,
      req.user?.id || 'mock-user-id',
      req.user?.role || 'employee',
    );
    return { message: 'Request deleted successfully' };
  }
}
