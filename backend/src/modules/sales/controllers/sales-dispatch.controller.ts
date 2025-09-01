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
import { SalesDispatchService } from '../services/sales-dispatch.service';
import { CreateSalesDispatchDto, UpdateSalesDispatchDto } from '../dto/sales-dispatch.dto';
import { DispatchStatus } from '../entities/sales-dispatch.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('sales/dispatches')
@UseGuards(JwtAuthGuard)
export class SalesDispatchController {
  constructor(private readonly salesDispatchService: SalesDispatchService) {}

  @Post()
  create(@Body() createSalesDispatchDto: CreateSalesDispatchDto) {
    return this.salesDispatchService.create(createSalesDispatchDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.salesDispatchService.findAll(pageNum, limitNum, search);
  }

  @Get('statistics')
  getStatistics() {
    return this.salesDispatchService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesDispatchService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSalesDispatchDto: UpdateSalesDispatchDto) {
    return this.salesDispatchService.update(id, updateSalesDispatchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesDispatchService.remove(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: DispatchStatus) {
    return this.salesDispatchService.updateStatus(id, status);
  }
}
