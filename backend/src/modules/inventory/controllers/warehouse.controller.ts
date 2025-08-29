import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { WarehouseService } from '../services/warehouse.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from '../dto/warehouse.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Controller('inventory/warehouses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() createWarehouseDto: CreateWarehouseDto) {
    return this.warehouseService.create(createWarehouseDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE)
  findAll(@Query('isActive') isActive?: string) {
    const activeFilter = isActive !== undefined ? isActive === 'true' : undefined;
    return this.warehouseService.findAll(activeFilter);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE)
  findOne(@Param('id') id: string) {
    return this.warehouseService.findOne(id);
  }

  @Get('code/:warehouseCode')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE)
  findByCode(@Param('warehouseCode') warehouseCode: string) {
    return this.warehouseService.findByCode(warehouseCode);
  }

  @Get(':id/stats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getStats(@Param('id') id: string) {
    return this.warehouseService.getWarehouseStats(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() updateWarehouseDto: UpdateWarehouseDto) {
    return this.warehouseService.update(id, updateWarehouseDto);
  }

  @Patch(':id/activate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  activate(@Param('id') id: string) {
    return this.warehouseService.activate(id);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  deactivate(@Param('id') id: string) {
    return this.warehouseService.deactivate(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.warehouseService.remove(id);
  }
}
