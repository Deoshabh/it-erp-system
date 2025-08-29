import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { StockMovement } from '../entities/stock-movement.entity';
import { CreateStockMovementDto, UpdateStockMovementDto } from '../dto/stock-movement.dto';
import { ItemService } from './item.service';

@Injectable()
export class StockMovementService {
  constructor(
    @InjectRepository(StockMovement)
    private stockMovementRepository: Repository<StockMovement>,
    private itemService: ItemService,
  ) {}

  async create(createStockMovementDto: CreateStockMovementDto): Promise<StockMovement> {
    // Calculate total value
    const totalValue = createStockMovementDto.quantity * createStockMovementDto.unitCost;
    
    const stockMovement = this.stockMovementRepository.create({
      ...createStockMovementDto,
      totalValue
    });

    const savedMovement = await this.stockMovementRepository.save(stockMovement);

    // Update item stock based on movement type
    if (createStockMovementDto.type === 'in' || createStockMovementDto.type === 'adjustment') {
      await this.itemService.updateStock(createStockMovementDto.itemId, createStockMovementDto.quantity, 'add');
    } else if (createStockMovementDto.type === 'out') {
      await this.itemService.updateStock(createStockMovementDto.itemId, createStockMovementDto.quantity, 'subtract');
    }

    return savedMovement;
  }

  async findAll(
    warehouseId?: string,
    itemId?: string,
    type?: string,
    status?: string
  ): Promise<StockMovement[]> {
    const where: FindOptionsWhere<StockMovement> = {};
    
    if (warehouseId) where.warehouseId = warehouseId;
    if (itemId) where.itemId = itemId;
    if (type) where.type = type as any;
    if (status) where.status = status as any;

    return await this.stockMovementRepository.find({
      where,
      relations: ['item', 'warehouse', 'zone'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<StockMovement> {
    const stockMovement = await this.stockMovementRepository.findOne({
      where: { id },
      relations: ['item', 'warehouse', 'zone']
    });

    if (!stockMovement) {
      throw new NotFoundException(`Stock movement with ID ${id} not found`);
    }

    return stockMovement;
  }

  async update(id: string, updateStockMovementDto: UpdateStockMovementDto): Promise<StockMovement> {
    const stockMovement = await this.findOne(id);

    Object.assign(stockMovement, updateStockMovementDto);
    return await this.stockMovementRepository.save(stockMovement);
  }

  async remove(id: string): Promise<void> {
    const stockMovement = await this.findOne(id);

    if (stockMovement.status === 'completed') {
      throw new BadRequestException('Cannot delete completed stock movement');
    }

    await this.stockMovementRepository.remove(stockMovement);
  }

  async complete(id: string): Promise<StockMovement> {
    const stockMovement = await this.findOne(id);
    
    if (stockMovement.status === 'completed') {
      throw new BadRequestException('Stock movement is already completed');
    }

    stockMovement.status = 'completed';
    return await this.stockMovementRepository.save(stockMovement);
  }

  async cancel(id: string): Promise<StockMovement> {
    const stockMovement = await this.findOne(id);
    
    if (stockMovement.status === 'completed') {
      throw new BadRequestException('Cannot cancel completed stock movement');
    }

    stockMovement.status = 'cancelled';
    return await this.stockMovementRepository.save(stockMovement);
  }

  async getMovementsByDateRange(startDate: Date, endDate: Date): Promise<StockMovement[]> {
    return await this.stockMovementRepository
      .createQueryBuilder('movement')
      .where('movement.createdAt >= :startDate', { startDate })
      .andWhere('movement.createdAt <= :endDate', { endDate })
      .leftJoinAndSelect('movement.item', 'item')
      .leftJoinAndSelect('movement.warehouse', 'warehouse')
      .orderBy('movement.createdAt', 'DESC')
      .getMany();
  }

  async getStockMovementSummary(): Promise<any> {
    const result = await this.stockMovementRepository
      .createQueryBuilder('movement')
      .select([
        'movement.type',
        'COUNT(*) as count',
        'SUM(movement.totalValue) as totalValue'
      ])
      .where('movement.status = :status', { status: 'completed' })
      .groupBy('movement.type')
      .getRawMany();

    return result;
  }
}
