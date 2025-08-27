import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  Patch, 
  UseGuards,
  Request 
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateInvoiceDto, CreateExpenseDto } from './dto/create-finance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('finance')
@ApiBearerAuth()
@Controller('api/v1/finance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // Invoice endpoints
  @Post('invoices')
  @Roles(UserRole.ADMIN, UserRole.FINANCE, UserRole.SALES)
  createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.financeService.createInvoice(createInvoiceDto);
  }

  @Get('invoices')
  @Roles(UserRole.ADMIN, UserRole.FINANCE, UserRole.HR, UserRole.MANAGER, UserRole.SALES)
  findAllInvoices() {
    return this.financeService.findAllInvoices();
  }

  @Patch('invoices/:id/status')
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  updateInvoiceStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.financeService.updateInvoiceStatus(id, status);
  }

  @Delete('invoices/:id')
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  removeInvoice(@Param('id') id: string) {
    return this.financeService.removeInvoice(id);
  }

  // Expense endpoints
  @Post('expenses')
  @Roles(UserRole.ADMIN, UserRole.FINANCE, UserRole.HR, UserRole.MANAGER, UserRole.SALES, UserRole.EMPLOYEE)
  createExpense(@Body() createExpenseDto: CreateExpenseDto) {
    return this.financeService.createExpense(createExpenseDto);
  }

  @Get('expenses')
  findAllExpenses() {
    return this.financeService.findAllExpenses();
  }

  @Patch('expenses/:id/status')
  updateExpenseStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.financeService.updateExpenseStatus(id, status);
  }

  @Delete('expenses/:id')
  removeExpense(@Param('id') id: string) {
    return this.financeService.removeExpense(id);
  }

  // Analytics
  @Get('summary')
  getFinancialSummary() {
    return this.financeService.getFinancialSummary();
  }
}
