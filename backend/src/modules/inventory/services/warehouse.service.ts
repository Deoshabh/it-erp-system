import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Warehouse } from '../entities/warehouse.entity';
import { CreateWarehouseDto, UpdateWarehouseDto } from '../dto/warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
  ) {}

  async create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
    // Check if warehouse code already exists
    const existingWarehouse = await this.warehouseRepository.findOne({
      where: { warehouseCode: createWarehouseDto.warehouseCode }
    });

    if (existingWarehouse) {
      throw new ConflictException(`Warehouse with code ${createWarehouseDto.warehouseCode} already exists`);
    }

    const warehouse = this.warehouseRepository.create(createWarehouseDto);
    return await this.warehouseRepository.save(warehouse);
  }

  async findAll(isActive?: boolean): Promise<Warehouse[]> {
    const where: FindOptionsWhere<Warehouse> = {};
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return await this.warehouseRepository.find({
      where,
      relations: ['zones'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id },
      relations: ['zones', 'stockMovements']
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    return warehouse;
  }

  async findByCode(warehouseCode: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { warehouseCode },
      relations: ['zones']
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with code ${warehouseCode} not found`);
    }

    return warehouse;
  }

  async update(id: string, updateWarehouseDto: UpdateWarehouseDto): Promise<Warehouse> {
    const warehouse = await this.findOne(id);

    Object.assign(warehouse, updateWarehouseDto);
    return await this.warehouseRepository.save(warehouse);
  }

  async remove(id: string): Promise<void> {
    const warehouse = await this.findOne(id);

    // Check if warehouse has active zones
    if (warehouse.zones && warehouse.zones.length > 0) {
      const activeZones = warehouse.zones.filter(zone => zone.isActive);
      if (activeZones.length > 0) {
        throw new BadRequestException('Cannot delete warehouse with active zones. Please deactivate or remove zones first.');
      }
    }

    await this.warehouseRepository.remove(warehouse);
  }

  async activate(id: string): Promise<Warehouse> {
    const warehouse = await this.findOne(id);
    warehouse.isActive = true;
    return await this.warehouseRepository.save(warehouse);
  }

  async deactivate(id: string): Promise<Warehouse> {
    const warehouse = await this.findOne(id);
    warehouse.isActive = false;
    return await this.warehouseRepository.save(warehouse);
  }

  async getWarehouseStats(id: string): Promise<any> {
    const warehouse = await this.findOne(id);
    
    const stats = {
      totalZones: warehouse.zones ? warehouse.zones.length : 0,
      activeZones: warehouse.zones ? warehouse.zones.filter(zone => zone.isActive).length : 0,
      totalCapacity: warehouse.totalCapacity || 0,
      usedCapacity: warehouse.usedCapacity || 0,
      capacityUtilization: warehouse.totalCapacity ? ((warehouse.usedCapacity || 0) / warehouse.totalCapacity * 100).toFixed(2) : 0,
      recentMovements: warehouse.stockMovements ? warehouse.stockMovements.slice(0, 10) : []
    };

    return stats;
  }
}
