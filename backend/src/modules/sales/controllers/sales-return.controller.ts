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
import { SalesReturnService } from '../services/sales-return.service';
import { CreateSalesReturnDto, UpdateSalesReturnDto } from '../dto/sales-return.dto';
import { ReturnStatus } from '../entities/sales-return.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('sales/returns')
@UseGuards(JwtAuthGuard)
export class SalesReturnController {
  constructor(private readonly salesReturnService: SalesReturnService) {}

  @Post()
  create(@Body() createSalesReturnDto: CreateSalesReturnDto) {
    return this.salesReturnService.create(createSalesReturnDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.salesReturnService.findAll(pageNum, limitNum, search);
  }

  @Get('statistics')
  getStatistics() {
    return this.salesReturnService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesReturnService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSalesReturnDto: UpdateSalesReturnDto) {
    return this.salesReturnService.update(id, updateSalesReturnDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesReturnService.remove(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: ReturnStatus) {
    return this.salesReturnService.updateStatus(id, status);
  }
}
