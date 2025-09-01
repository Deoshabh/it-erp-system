import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesReturn, ReturnStatus } from '../entities/sales-return.entity';
import { CreateSalesReturnDto, UpdateSalesReturnDto } from '../dto/sales-return.dto';

@Injectable()
export class SalesReturnService {
  constructor(
    @InjectRepository(SalesReturn)
    private salesReturnRepository: Repository<SalesReturn>,
  ) {}

  async create(createSalesReturnDto: CreateSalesReturnDto): Promise<SalesReturn> {
    const returnCount = await this.salesReturnRepository.count();
    const creditNoteNo = `CN${String(returnCount + 1).padStart(6, '0')}`;

    const salesReturn = this.salesReturnRepository.create({
      ...createSalesReturnDto,
      creditNoteNo,
    });

    return this.salesReturnRepository.save(salesReturn);
  }

  async findAll(page: number = 1, limit: number = 10, search?: string): Promise<{ data: SalesReturn[], total: number }> {
    const queryBuilder = this.salesReturnRepository.createQueryBuilder('salesReturn')
      .leftJoinAndSelect('salesReturn.customer', 'customer')
      .leftJoinAndSelect('salesReturn.invoice', 'invoice')
      .orderBy('salesReturn.createdAt', 'DESC');

    if (search) {
      queryBuilder.where(
        'salesReturn.creditNoteNo ILIKE :search OR customer.name ILIKE :search OR invoice.invoiceNo ILIKE :search',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<SalesReturn> {
    const salesReturn = await this.salesReturnRepository.findOne({
      where: { id },
      relations: ['customer', 'invoice'],
    });

    if (!salesReturn) {
      throw new NotFoundException(`Sales Return with ID ${id} not found`);
    }

    return salesReturn;
  }

  async update(id: string, updateSalesReturnDto: UpdateSalesReturnDto): Promise<SalesReturn> {
    const salesReturn = await this.findOne(id);
    Object.assign(salesReturn, updateSalesReturnDto);
    return this.salesReturnRepository.save(salesReturn);
  }

  async remove(id: string): Promise<void> {
    const salesReturn = await this.findOne(id);
    await this.salesReturnRepository.remove(salesReturn);
  }

  async updateStatus(id: string, status: ReturnStatus): Promise<SalesReturn> {
    const salesReturn = await this.findOne(id);
    salesReturn.status = status;
    return this.salesReturnRepository.save(salesReturn);
  }

  async getStatistics(): Promise<any> {
    const total = await this.salesReturnRepository.count();
    const pending = await this.salesReturnRepository.count({ where: { status: ReturnStatus.PENDING } });
    const approved = await this.salesReturnRepository.count({ where: { status: ReturnStatus.APPROVED } });
    const completed = await this.salesReturnRepository.count({ where: { status: ReturnStatus.COMPLETED } });
    
    const totalValue = await this.salesReturnRepository
      .createQueryBuilder('salesReturn')
      .select('SUM(salesReturn.totalReturnAmount)', 'total')
      .getRawOne();
    
    return {
      total,
      pending,
      approved,
      completed,
      totalValue: totalValue?.total || 0,
    };
  }
}
