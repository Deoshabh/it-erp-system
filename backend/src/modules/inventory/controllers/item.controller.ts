import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ItemService } from '../services/item.service';
import { CreateItemDto, UpdateItemDto } from '../dto/item.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Controller('inventory/items')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemService.create(createItemDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE)
  findAll(
    @Query('isActive') isActive?: string,
    @Query('category') category?: string,
  ) {
    const activeFilter = isActive !== undefined ? isActive === 'true' : undefined;
    return this.itemService.findAll(activeFilter, category);
  }

  @Get('low-stock')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getLowStockItems() {
    return this.itemService.getLowStockItems();
  }

  @Get('categories')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE)
  getItemsByCategory() {
    return this.itemService.getItemsByCategory();
  }

  @Get('valuation')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.FINANCE)
  getInventoryValuation() {
    return this.itemService.getInventoryValuation();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE)
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(id);
  }

  @Get('code/:itemCode')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE)
  findByCode(@Param('itemCode') itemCode: string) {
    return this.itemService.findByCode(itemCode);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    return this.itemService.update(id, updateItemDto);
  }

  @Patch(':id/stock')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  updateStock(
    @Param('id') id: string,
    @Body() stockUpdate: { quantity: number; operation: 'add' | 'subtract' }
  ) {
    return this.itemService.updateStock(id, stockUpdate.quantity, stockUpdate.operation);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.itemService.remove(id);
  }
}
