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
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerFilterDto } from '../dto/customer.dto';
import { Customer, CustomerStatus, CustomerType } from '../entities/customer.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@ApiTags('sales/customers')
@ApiBearerAuth()
@Controller('sales/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Customer created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Customer with email already exists' })
  async create(@Body() createCustomerDto: CreateCustomerDto, @Request() req): Promise<Customer> {
    return await this.customerService.create(createCustomerDto, req.user.sub);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER, UserRole.HR, UserRole.FINANCE)
  @ApiOperation({ summary: 'Get all customers with filtering and pagination' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in name, email, industry' })
  @ApiQuery({ name: 'type', required: false, enum: CustomerType, description: 'Filter by type' })
  @ApiQuery({ name: 'status', required: false, enum: CustomerStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Customers retrieved successfully' })
  async findAll(@Query() filters: CustomerFilterDto) {
    return await this.customerService.findAll(filters);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER, UserRole.FINANCE)
  @ApiOperation({ summary: 'Get customer statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Customer statistics retrieved successfully' })
  async getStatistics() {
    return await this.customerService.getCustomerStatistics();
  }

  @Get('by-account-manager/:managerId')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get customers by account manager' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Customers retrieved successfully' })
  async getCustomersByAccountManager(@Param('managerId', ParseUUIDPipe) managerId: string): Promise<Customer[]> {
    return await this.customerService.getCustomersByAccountManager(managerId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER, UserRole.HR, UserRole.FINANCE)
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Customer retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Customer not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Customer> {
    return await this.customerService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update customer' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Customer updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Customer not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCustomerDto: UpdateCustomerDto
  ): Promise<Customer> {
    return await this.customerService.update(id, updateCustomerDto);
  }

  @Patch(':id/purchase')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.FINANCE)
  @ApiOperation({ summary: 'Update customer purchase information' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Customer purchase info updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Customer not found' })
  async updatePurchaseInfo(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('amount') amount: number
  ): Promise<Customer> {
    return await this.customerService.updatePurchaseInfo(id, amount);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete customer' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Customer deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Customer not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.customerService.remove(id);
    return { message: 'Customer deleted successfully' };
  }

  @Post('bulk-delete')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER)
  @ApiOperation({ summary: 'Bulk delete customers' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Customers deleted successfully' })
  async bulkDelete(@Body('ids') ids: string[]): Promise<{ message: string }> {
    await this.customerService.bulkDelete(ids);
    return { message: `${ids.length} customers deleted successfully` };
  }

  @Patch('bulk-status')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.MANAGER)
  @ApiOperation({ summary: 'Bulk update customer status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Customer statuses updated successfully' })
  async bulkUpdateStatus(
    @Body('ids') ids: string[],
    @Body('status') status: CustomerStatus
  ): Promise<{ message: string }> {
    await this.customerService.bulkUpdateStatus(ids, status);
    return { message: `${ids.length} customers status updated successfully` };
  }
}
