import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesDispatch, DispatchStatus } from '../entities/sales-dispatch.entity';
import { CreateSalesDispatchDto, UpdateSalesDispatchDto } from '../dto/sales-dispatch.dto';

@Injectable()
export class SalesDispatchService {
  constructor(
    @InjectRepository(SalesDispatch)
    private salesDispatchRepository: Repository<SalesDispatch>,
  ) {}

  async create(createSalesDispatchDto: CreateSalesDispatchDto): Promise<SalesDispatch> {
    const dispatchCount = await this.salesDispatchRepository.count();
    const dispatchNo = `SD${String(dispatchCount + 1).padStart(6, '0')}`;

    const salesDispatch = this.salesDispatchRepository.create({
      ...createSalesDispatchDto,
      dispatchNo,
    });

    return this.salesDispatchRepository.save(salesDispatch);
  }

  async findAll(page: number = 1, limit: number = 10, search?: string): Promise<{ data: SalesDispatch[], total: number }> {
    const queryBuilder = this.salesDispatchRepository.createQueryBuilder('salesDispatch')
      .leftJoinAndSelect('salesDispatch.salesOrder', 'salesOrder')
      .leftJoinAndSelect('salesOrder.customer', 'customer')
      .orderBy('salesDispatch.createdAt', 'DESC');

    if (search) {
      queryBuilder.where(
        'salesDispatch.dispatchNo ILIKE :search OR salesDispatch.trackingNo ILIKE :search OR customer.name ILIKE :search',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<SalesDispatch> {
    const salesDispatch = await this.salesDispatchRepository.findOne({
      where: { id },
      relations: ['salesOrder', 'salesOrder.customer'],
    });

    if (!salesDispatch) {
      throw new NotFoundException(`Sales Dispatch with ID ${id} not found`);
    }

    return salesDispatch;
  }

  async update(id: string, updateSalesDispatchDto: UpdateSalesDispatchDto): Promise<SalesDispatch> {
    const salesDispatch = await this.findOne(id);
    Object.assign(salesDispatch, updateSalesDispatchDto);
    return this.salesDispatchRepository.save(salesDispatch);
  }

  async remove(id: string): Promise<void> {
    const salesDispatch = await this.findOne(id);
    await this.salesDispatchRepository.remove(salesDispatch);
  }

  async updateStatus(id: string, status: DispatchStatus): Promise<SalesDispatch> {
    const salesDispatch = await this.findOne(id);
    salesDispatch.status = status;
    return this.salesDispatchRepository.save(salesDispatch);
  }

  async getStatistics(): Promise<any> {
    const total = await this.salesDispatchRepository.count();
    const pending = await this.salesDispatchRepository.count({ where: { status: DispatchStatus.PENDING } });
    const dispatched = await this.salesDispatchRepository.count({ where: { status: DispatchStatus.DISPATCHED } });
    const inTransit = await this.salesDispatchRepository.count({ where: { status: DispatchStatus.IN_TRANSIT } });
    const delivered = await this.salesDispatchRepository.count({ where: { status: DispatchStatus.DELIVERED } });
    
    return {
      total,
      pending,
      dispatched,
      inTransit,
      delivered,
      deliveryRate: total > 0 ? (delivered / total) * 100 : 0,
    };
  }
}
