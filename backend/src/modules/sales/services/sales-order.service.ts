import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesOrder, SalesOrderStatus } from '../entities/sales-order.entity';
import { CreateSalesOrderDto, UpdateSalesOrderDto } from '../dto/sales-order.dto';

@Injectable()
export class SalesOrderService {
  constructor(
    @InjectRepository(SalesOrder)
    private salesOrderRepository: Repository<SalesOrder>,
  ) {}

  async create(createSalesOrderDto: CreateSalesOrderDto): Promise<SalesOrder> {
    const orderCount = await this.salesOrderRepository.count();
    const orderNo = `SO${String(orderCount + 1).padStart(6, '0')}`;

    const salesOrder = this.salesOrderRepository.create({
      ...createSalesOrderDto,
      orderNo,
    });

    return this.salesOrderRepository.save(salesOrder);
  }

  async findAll(page: number = 1, limit: number = 10, search?: string): Promise<{ data: SalesOrder[], total: number }> {
    const queryBuilder = this.salesOrderRepository.createQueryBuilder('salesOrder')
      .leftJoinAndSelect('salesOrder.customer', 'customer')
      .leftJoinAndSelect('salesOrder.quotation', 'quotation')
      .orderBy('salesOrder.createdAt', 'DESC');

    if (search) {
      queryBuilder.where(
        'salesOrder.orderNo ILIKE :search OR customer.name ILIKE :search OR customer.phone ILIKE :search',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<SalesOrder> {
    const salesOrder = await this.salesOrderRepository.findOne({
      where: { id },
      relations: ['customer', 'quotation', 'invoices'],
    });

    if (!salesOrder) {
      throw new NotFoundException(`Sales Order with ID ${id} not found`);
    }

    return salesOrder;
  }

  async update(id: string, updateSalesOrderDto: UpdateSalesOrderDto): Promise<SalesOrder> {
    const salesOrder = await this.findOne(id);
    Object.assign(salesOrder, updateSalesOrderDto);
    return this.salesOrderRepository.save(salesOrder);
  }

  async remove(id: string): Promise<void> {
    const salesOrder = await this.findOne(id);
    await this.salesOrderRepository.remove(salesOrder);
  }

  async updateStatus(id: string, status: SalesOrderStatus): Promise<SalesOrder> {
    const salesOrder = await this.findOne(id);
    salesOrder.status = status;
    return this.salesOrderRepository.save(salesOrder);
  }

  async getStatistics(): Promise<any> {
    const total = await this.salesOrderRepository.count();
    const confirmed = await this.salesOrderRepository.count({ where: { status: SalesOrderStatus.CONFIRMED } });
    const inProduction = await this.salesOrderRepository.count({ where: { status: SalesOrderStatus.IN_PRODUCTION } });
    const dispatched = await this.salesOrderRepository.count({ where: { status: SalesOrderStatus.DISPATCHED } });
    const completed = await this.salesOrderRepository.count({ where: { status: SalesOrderStatus.COMPLETED } });
    
    const totalValue = await this.salesOrderRepository
      .createQueryBuilder('salesOrder')
      .select('SUM(salesOrder.grandTotal)', 'total')
      .getRawOne();
    
    return {
      total,
      confirmed,
      inProduction,
      dispatched,
      completed,
      totalValue: totalValue?.total || 0,
    };
  }
}
