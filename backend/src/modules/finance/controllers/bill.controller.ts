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
  Res,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
  UsePipes
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { BillService } from '../services/bill.service';
import { PdfService } from '../services/pdf.service';
import {
  CreateBillDto,
  UpdateBillDto,
  BillFilterDto,
  CreateBillPaymentDto
} from '../dto/bill.dto';

@ApiTags('bills')
@ApiBearerAuth()
@Controller('bills')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillController {
  constructor(
    private readonly billService: BillService,
    private readonly pdfService: PdfService
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createBillDto: CreateBillDto) {
    return this.billService.create(createBillDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.FINANCE, UserRole.HR, UserRole.MANAGER)
  async findAll(@Query() filterDto: BillFilterDto) {
    return this.billService.findAll(filterDto);
  }

  @Get('overdue')
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  async getOverdueBills() {
    return this.billService.getOverdueBills();
  }

  @Get('gst-report')
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  async getGSTReport(
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string
  ) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    return this.billService.getGSTReport(from, to);
  }

  @Get('gst-report/pdf')
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  async downloadGSTReportPdf(
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Res() res: Response
  ) {
    try {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const bills = await this.billService.getGSTReportData(from, to);
      const pdfBuffer = await this.pdfService.generateGSTReport(bills, from, to);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="gst-report-${fromDate}-to-${toDate}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      res.send(pdfBuffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error generating GST report PDF',
        error: error.message
      });
    }
  }

  @Get('summary')
  @Roles(UserRole.ADMIN, UserRole.FINANCE, UserRole.HR, UserRole.MANAGER)
  async getBillsSummary() {
    return this.billService.getBillsSummary();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.FINANCE, UserRole.HR, UserRole.MANAGER)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.billService.findOne(id);
  }

  @Get(':id/pdf')
  @Roles(UserRole.ADMIN, UserRole.FINANCE, UserRole.HR, UserRole.MANAGER)
  async downloadPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response
  ) {
    try {
      const bill = await this.billService.findOne(id);
      const pdfBuffer = await this.pdfService.generateBillPdf(bill);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="bill-${bill.billNumber}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      res.send(pdfBuffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error generating bill PDF',
        error: error.message
      });
    }
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBillDto: UpdateBillDto
  ) {
    return this.billService.update(id, updateBillDto);
  }

  @Patch(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  async approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.billService.approveBill(id, 'system'); // You can get user from request if needed
  }

  @Post(':id/payments')
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async addPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() paymentDto: CreateBillPaymentDto
  ) {
    return this.billService.addPayment(id, paymentDto);
  }

  @Get(':id/payments')
  @Roles(UserRole.ADMIN, UserRole.FINANCE, UserRole.HR, UserRole.MANAGER)
  async getPayments(@Param('id', ParseUUIDPipe) id: string) {
    const bill = await this.billService.findOne(id);
    return bill.payments;
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.billService.remove(id);
  }

  @Post(':id/duplicate')
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  async duplicate(@Param('id', ParseUUIDPipe) id: string) {
    return this.billService.duplicateBill(id);
  }

  @Get('vendor/:vendorName')
  @Roles(UserRole.ADMIN, UserRole.FINANCE, UserRole.HR, UserRole.MANAGER)
  async getBillsByVendor(@Param('vendorName') vendorName: string) {
    return this.billService.findByVendor(vendorName);
  }

  @Get('analytics/monthly')
  @Roles(UserRole.ADMIN, UserRole.FINANCE, UserRole.HR, UserRole.MANAGER)
  async getMonthlyAnalytics(@Query('year') year?: string) {
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    return this.billService.getMonthlyBillAnalytics(targetYear);
  }

  @Get('analytics/status-breakdown')
  @Roles(UserRole.ADMIN, UserRole.FINANCE, UserRole.HR, UserRole.MANAGER)
  async getStatusBreakdown() {
    return this.billService.getBillStatusBreakdown();
  }
}
