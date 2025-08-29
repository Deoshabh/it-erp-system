import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { StockMovementService } from '../services/stock-movement.service';
import { CreateStockMovementDto, UpdateStockMovementDto } from '../dto/stock-movement.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Controller('inventory/stock-movements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockMovementController {
  constructor(private readonly stockMovementService: StockMovementService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() createStockMovementDto: CreateStockMovementDto) {
    return this.stockMovementService.create(createStockMovementDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE)
  findAll(
    @Query('warehouseId') warehouseId?: string,
    @Query('itemId') itemId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.stockMovementService.findAll(warehouseId, itemId, type, status);
  }

  @Get('summary')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getSummary() {
    return this.stockMovementService.getStockMovementSummary();
  }

  @Get('date-range')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.stockMovementService.getMovementsByDateRange(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE)
  findOne(@Param('id') id: string) {
    return this.stockMovementService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() updateStockMovementDto: UpdateStockMovementDto) {
    return this.stockMovementService.update(id, updateStockMovementDto);
  }

  @Patch(':id/complete')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  complete(@Param('id') id: string) {
    return this.stockMovementService.complete(id);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  cancel(@Param('id') id: string) {
    return this.stockMovementService.cancel(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.stockMovementService.remove(id);
  }
}
