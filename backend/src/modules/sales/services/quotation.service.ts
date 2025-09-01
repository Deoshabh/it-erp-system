import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quotation, QuotationStatus } from '../entities/quotation.entity';
import { CreateQuotationDto, UpdateQuotationDto } from '../dto/quotation.dto';

@Injectable()
export class QuotationService {
  constructor(
    @InjectRepository(Quotation)
    private quotationRepository: Repository<Quotation>,
  ) {}

  async create(createQuotationDto: CreateQuotationDto): Promise<Quotation> {
    const quotationCount = await this.quotationRepository.count();
    const quotationNo = `QT${String(quotationCount + 1).padStart(6, '0')}`;

    const quotation = this.quotationRepository.create({
      ...createQuotationDto,
      quotationNo,
    });

    return this.quotationRepository.save(quotation);
  }

  async findAll(page: number = 1, limit: number = 10, search?: string): Promise<{ data: Quotation[], total: number }> {
    const queryBuilder = this.quotationRepository.createQueryBuilder('quotation')
      .leftJoinAndSelect('quotation.customer', 'customer')
      .leftJoinAndSelect('quotation.enquiry', 'enquiry')
      .orderBy('quotation.createdAt', 'DESC');

    if (search) {
      queryBuilder.where(
        'quotation.quotationNo ILIKE :search OR customer.name ILIKE :search OR customer.phone ILIKE :search',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Quotation> {
    const quotation = await this.quotationRepository.findOne({
      where: { id },
      relations: ['customer', 'enquiry', 'salesOrders'],
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    return quotation;
  }

  async update(id: string, updateQuotationDto: UpdateQuotationDto): Promise<Quotation> {
    const quotation = await this.findOne(id);
    Object.assign(quotation, updateQuotationDto);
    return this.quotationRepository.save(quotation);
  }

  async remove(id: string): Promise<void> {
    const quotation = await this.findOne(id);
    await this.quotationRepository.remove(quotation);
  }

  async confirm(id: string): Promise<Quotation> {
    const quotation = await this.findOne(id);
    quotation.status = QuotationStatus.CONFIRMED;
    return this.quotationRepository.save(quotation);
  }

  async findPendingConfirmations(page: number = 1, limit: number = 10): Promise<{ data: Quotation[], total: number }> {
    const [data, total] = await this.quotationRepository.findAndCount({
      where: { status: QuotationStatus.PENDING },
      relations: ['customer'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async getStatistics(): Promise<any> {
    const total = await this.quotationRepository.count();
    const pending = await this.quotationRepository.count({ where: { status: QuotationStatus.PENDING } });
    const confirmed = await this.quotationRepository.count({ where: { status: QuotationStatus.CONFIRMED } });
    const rejected = await this.quotationRepository.count({ where: { status: QuotationStatus.REJECTED } });
    
    return {
      total,
      pending,
      confirmed,
      rejected,
      confirmationRate: total > 0 ? (confirmed / total) * 100 : 0,
    };
  }
}
