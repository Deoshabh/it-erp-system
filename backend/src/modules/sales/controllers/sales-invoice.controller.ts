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
} from '@nestjs/common';
import { SalesInvoiceService } from '../services/sales-invoice.service';
import { CreateSalesInvoiceDto, UpdateSalesInvoiceDto } from '../dto/sales-invoice.dto';
import { InvoiceStatus } from '../entities/sales-invoice.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('sales/invoices')
@UseGuards(JwtAuthGuard)
export class SalesInvoiceController {
  constructor(private readonly salesInvoiceService: SalesInvoiceService) {}

  @Post()
  create(@Body() createSalesInvoiceDto: CreateSalesInvoiceDto) {
    return this.salesInvoiceService.create(createSalesInvoiceDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.salesInvoiceService.findAll(pageNum, limitNum, search);
  }

  @Get('statistics')
  getStatistics() {
    return this.salesInvoiceService.getStatistics();
  }

  @Get('pending-einvoices')
  getPendingEInvoices() {
    return this.salesInvoiceService.getPendingEInvoices();
  }

  @Get('pending-ewaybills')
  getPendingEWayBills() {
    return this.salesInvoiceService.getPendingEWayBills();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesInvoiceService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSalesInvoiceDto: UpdateSalesInvoiceDto) {
    return this.salesInvoiceService.update(id, updateSalesInvoiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesInvoiceService.remove(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: InvoiceStatus) {
    return this.salesInvoiceService.updateStatus(id, status);
  }

  @Patch(':id/generate-einvoice')
  generateEInvoice(@Param('id') id: string) {
    return this.salesInvoiceService.generateEInvoice(id);
  }

  @Patch(':id/generate-ewaybill')
  generateEWayBill(@Param('id') id: string) {
    return this.salesInvoiceService.generateEWayBill(id);
  }
}
