import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Item } from '../entities/item.entity';
import { CreateItemDto, UpdateItemDto } from '../dto/item.dto';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
  ) {}

  async create(createItemDto: CreateItemDto): Promise<Item> {
    // Check if item code already exists
    const existingItem = await this.itemRepository.findOne({
      where: { itemCode: createItemDto.itemCode }
    });

    if (existingItem) {
      throw new ConflictException(`Item with code ${createItemDto.itemCode} already exists`);
    }

    const item = this.itemRepository.create(createItemDto);
    return await this.itemRepository.save(item);
  }

  async findAll(isActive?: boolean, category?: string): Promise<Item[]> {
    const where: FindOptionsWhere<Item> = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (category) {
      where.category = category;
    }

    return await this.itemRepository.find({
      where,
      relations: ['stockMovements', 'batches', 'serials'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['stockMovements', 'batches', 'serials']
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    return item;
  }

  async findByCode(itemCode: string): Promise<Item> {
    const item = await this.itemRepository.findOne({
      where: { itemCode },
      relations: ['stockMovements', 'batches', 'serials']
    });

    if (!item) {
      throw new NotFoundException(`Item with code ${itemCode} not found`);
    }

    return item;
  }

  async update(id: string, updateItemDto: UpdateItemDto): Promise<Item> {
    const item = await this.findOne(id);

    Object.assign(item, updateItemDto);
    return await this.itemRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);

    // Check if item has stock movements
    if (item.stockMovements && item.stockMovements.length > 0) {
      throw new BadRequestException('Cannot delete item with existing stock movements. Please remove all stock movements first.');
    }

    await this.itemRepository.remove(item);
  }

  async updateStock(itemId: string, quantity: number, operation: 'add' | 'subtract'): Promise<Item> {
    const item = await this.findOne(itemId);
    
    if (operation === 'add') {
      item.currentStock = Number(item.currentStock) + Number(quantity);
    } else {
      const newStock = Number(item.currentStock) - Number(quantity);
      if (newStock < 0) {
        throw new BadRequestException('Insufficient stock available');
      }
      item.currentStock = newStock;
    }

    return await this.itemRepository.save(item);
  }

  async getLowStockItems(): Promise<Item[]> {
    return await this.itemRepository
      .createQueryBuilder('item')
      .where('item.currentStock <= item.minimumStock')
      .andWhere('item.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async getItemsByCategory(): Promise<any> {
    const result = await this.itemRepository
      .createQueryBuilder('item')
      .select(['item.category', 'COUNT(*) as count'])
      .where('item.isActive = :isActive', { isActive: true })
      .groupBy('item.category')
      .getRawMany();

    return result;
  }

  async getInventoryValuation(): Promise<any> {
    const result = await this.itemRepository
      .createQueryBuilder('item')
      .select(['SUM(item.currentStock * item.standardCost) as totalValue'])
      .where('item.isActive = :isActive', { isActive: true })
      .getRawOne();

    return {
      totalInventoryValue: result.totalValue || 0
    };
  }
}
