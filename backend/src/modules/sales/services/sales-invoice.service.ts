import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesInvoice, InvoiceStatus, EInvoiceStatus, EWayBillStatus } from '../entities/sales-invoice.entity';
import { CreateSalesInvoiceDto, UpdateSalesInvoiceDto } from '../dto/sales-invoice.dto';

@Injectable()
export class SalesInvoiceService {
  constructor(
    @InjectRepository(SalesInvoice)
    private salesInvoiceRepository: Repository<SalesInvoice>,
  ) {}

  async create(createSalesInvoiceDto: CreateSalesInvoiceDto): Promise<SalesInvoice> {
    const invoiceCount = await this.salesInvoiceRepository.count();
    const invoiceNo = `INV${String(invoiceCount + 1).padStart(6, '0')}`;

    const salesInvoice = this.salesInvoiceRepository.create({
      ...createSalesInvoiceDto,
      invoiceNo,
    });

    return this.salesInvoiceRepository.save(salesInvoice);
  }

  async findAll(page: number = 1, limit: number = 10, search?: string): Promise<{ data: SalesInvoice[], total: number }> {
    const queryBuilder = this.salesInvoiceRepository.createQueryBuilder('salesInvoice')
      .leftJoinAndSelect('salesInvoice.customer', 'customer')
      .leftJoinAndSelect('salesInvoice.salesOrder', 'salesOrder')
      .orderBy('salesInvoice.createdAt', 'DESC');

    if (search) {
      queryBuilder.where(
        'salesInvoice.invoiceNo ILIKE :search OR customer.name ILIKE :search OR salesInvoice.eInvoiceNo ILIKE :search',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<SalesInvoice> {
    const salesInvoice = await this.salesInvoiceRepository.findOne({
      where: { id },
      relations: ['customer', 'salesOrder', 'returns'],
    });

    if (!salesInvoice) {
      throw new NotFoundException(`Sales Invoice with ID ${id} not found`);
    }

    return salesInvoice;
  }

  async update(id: string, updateSalesInvoiceDto: UpdateSalesInvoiceDto): Promise<SalesInvoice> {
    const salesInvoice = await this.findOne(id);
    Object.assign(salesInvoice, updateSalesInvoiceDto);
    return this.salesInvoiceRepository.save(salesInvoice);
  }

  async remove(id: string): Promise<void> {
    const salesInvoice = await this.findOne(id);
    await this.salesInvoiceRepository.remove(salesInvoice);
  }

  async updateStatus(id: string, status: InvoiceStatus): Promise<SalesInvoice> {
    const salesInvoice = await this.findOne(id);
    salesInvoice.status = status;
    return this.salesInvoiceRepository.save(salesInvoice);
  }

  async generateEInvoice(id: string): Promise<SalesInvoice> {
    const salesInvoice = await this.findOne(id);
    salesInvoice.eInvoiceStatus = EInvoiceStatus.GENERATED;
    salesInvoice.eInvoiceNo = `E${salesInvoice.invoiceNo}`;
    return this.salesInvoiceRepository.save(salesInvoice);
  }

  async generateEWayBill(id: string): Promise<SalesInvoice> {
    const salesInvoice = await this.findOne(id);
    salesInvoice.eWayBillStatus = EWayBillStatus.GENERATED;
    salesInvoice.eWayBillNo = `EWB${salesInvoice.invoiceNo}`;
    return this.salesInvoiceRepository.save(salesInvoice);
  }

  async getPendingEInvoices(): Promise<number> {
    return this.salesInvoiceRepository.count({ 
      where: { eInvoiceStatus: EInvoiceStatus.PENDING }
    });
  }

  async getPendingEWayBills(): Promise<number> {
    return this.salesInvoiceRepository.count({ 
      where: { eWayBillStatus: EWayBillStatus.PENDING }
    });
  }

  async getStatistics(): Promise<any> {
    const total = await this.salesInvoiceRepository.count();
    const paid = await this.salesInvoiceRepository.count({ where: { status: InvoiceStatus.PAID } });
    const overdue = await this.salesInvoiceRepository.count({ where: { status: InvoiceStatus.OVERDUE } });
    const pendingEInvoices = await this.getPendingEInvoices();
    const pendingEWayBills = await this.getPendingEWayBills();
    
    const totalValue = await this.salesInvoiceRepository
      .createQueryBuilder('salesInvoice')
      .select('SUM(salesInvoice.totalAmount)', 'total')
      .getRawOne();

    const paidValue = await this.salesInvoiceRepository
      .createQueryBuilder('salesInvoice')
      .select('SUM(salesInvoice.paidAmount)', 'total')
      .getRawOne();
    
    return {
      total,
      paid,
      overdue,
      pendingEInvoices,
      pendingEWayBills,
      totalValue: totalValue?.total || 0,
      paidValue: paidValue?.total || 0,
      outstandingValue: (totalValue?.total || 0) - (paidValue?.total || 0),
    };
  }
}
