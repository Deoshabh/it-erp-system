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
import { QuotationService } from '../services/quotation.service';
import { CreateQuotationDto, UpdateQuotationDto } from '../dto/quotation.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('sales/quotations')
@UseGuards(JwtAuthGuard)
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) {}

  @Post()
  create(@Body() createQuotationDto: CreateQuotationDto) {
    return this.quotationService.create(createQuotationDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.quotationService.findAll(pageNum, limitNum, search);
  }

  @Get('pending-confirmations')
  findPendingConfirmations(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.quotationService.findPendingConfirmations(pageNum, limitNum);
  }

  @Get('statistics')
  getStatistics() {
    return this.quotationService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotationService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuotationDto: UpdateQuotationDto) {
    return this.quotationService.update(id, updateQuotationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quotationService.remove(id);
  }

  @Patch(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.quotationService.confirm(id);
  }
}
