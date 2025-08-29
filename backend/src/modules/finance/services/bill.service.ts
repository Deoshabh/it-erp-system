import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between, Not, In, LessThan } from 'typeorm';
import { Bill, BillItem, BillPayment } from '../entities/bill.entity';
import { CreateBillDto, UpdateBillDto, CreateBillPaymentDto, BillFilterDto } from '../dto/bill.dto';

@Injectable()
export class BillService {
  constructor(
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
    @InjectRepository(BillItem)
    private billItemRepository: Repository<BillItem>,
    @InjectRepository(BillPayment)
    private billPaymentRepository: Repository<BillPayment>,
  ) {}

  async create(createBillDto: CreateBillDto, createdBy?: string): Promise<Bill> {
    // Check if bill number already exists
    const existingBill = await this.billRepository.findOne({
      where: { billNumber: createBillDto.billNumber }
    });

    if (existingBill) {
      throw new BadRequestException(`Bill with number ${createBillDto.billNumber} already exists`);
    }

    // Calculate bill totals
    const calculationResult = this.calculateBillTotals(createBillDto.billItems, createBillDto.discountAmount || 0, createBillDto.tdsAmount || 0);
    const calculatedTotals = calculationResult.calculatedTotals;
    const processedBillItems = calculationResult.billItems;

    // Create bill entity
    const bill = this.billRepository.create({
      ...createBillDto,
      ...calculatedTotals,
      createdBy
    });

    const savedBill = await this.billRepository.save(bill);

    // Create bill items
    for (const item of processedBillItems) {
      const billItemEntity = this.billItemRepository.create({
        ...item,
        bill: savedBill
      });
      await this.billItemRepository.save(billItemEntity);
    }

    return this.findOne(savedBill.id);
  }

  async findAll(filters?: BillFilterDto): Promise<Bill[]> {
    const where: FindOptionsWhere<Bill> = {};

    if (filters?.billType) where.billType = filters.billType as any;
    if (filters?.status) where.status = filters.status as any;
    if (filters?.vendorName) where.vendorName = filters.vendorName;
    
    if (filters?.fromDate && filters?.toDate) {
      where.billDate = Between(new Date(filters.fromDate), new Date(filters.toDate));
    }

    return await this.billRepository.find({
      where,
      relations: ['billItems', 'payments'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Bill> {
    const bill = await this.billRepository.findOne({
      where: { id },
      relations: ['billItems', 'payments']
    });

    if (!bill) {
      throw new NotFoundException(`Bill with ID ${id} not found`);
    }

    return bill;
  }

  async findByBillNumber(billNumber: string): Promise<Bill> {
    const bill = await this.billRepository.findOne({
      where: { billNumber },
      relations: ['billItems', 'payments']
    });

    if (!bill) {
      throw new NotFoundException(`Bill with number ${billNumber} not found`);
    }

    return bill;
  }

  async update(id: string, updateBillDto: UpdateBillDto): Promise<Bill> {
    const bill = await this.findOne(id);

    if (bill.status === 'paid' || bill.status === 'cancelled') {
      throw new BadRequestException(`Cannot update ${bill.status} bill`);
    }

    // If bill items are being updated, recalculate totals
    if (updateBillDto.billItems) {
      const calculationResult = this.calculateBillTotals(
        updateBillDto.billItems, 
        updateBillDto.discountAmount || bill.discountAmount, 
        updateBillDto.tdsAmount || bill.tdsAmount
      );

      // Remove existing bill items
      await this.billItemRepository.delete({ billId: id });

      // Create new bill items
      for (const item of calculationResult.billItems) {
        const billItemEntity = this.billItemRepository.create({ 
          ...item, 
          billId: id 
        });
        await this.billItemRepository.save(billItemEntity);
      }

      Object.assign(bill, updateBillDto, calculationResult.calculatedTotals);
      await this.billRepository.save(bill);

      return this.findOne(id);
    } else {
      Object.assign(bill, updateBillDto);
      return await this.billRepository.save(bill);
    }
  }

  async remove(id: string): Promise<void> {
    const bill = await this.findOne(id);

    if (bill.status === 'paid' || bill.status === 'approved') {
      throw new BadRequestException(`Cannot delete ${bill.status} bill`);
    }

    await this.billRepository.remove(bill);
  }

  async approveBill(id: string, approvedBy: string): Promise<Bill> {
    const bill = await this.findOne(id);

    if (bill.status !== 'pending') {
      throw new BadRequestException('Only pending bills can be approved');
    }

    bill.status = 'approved';
    bill.approvedBy = approvedBy;
    bill.approvedAt = new Date();

    return await this.billRepository.save(bill);
  }

  async addPayment(billId: string, createPaymentDto: CreateBillPaymentDto): Promise<BillPayment> {
    const bill = await this.findOne(billId);

    if (bill.status === 'cancelled') {
      throw new BadRequestException('Cannot add payment to cancelled bill');
    }

    // Calculate total paid amount
    const existingPayments = await this.billPaymentRepository.find({
      where: { billId }
    });

    const totalPaid = existingPayments.reduce((sum, payment) => sum + Number(payment.paidAmount), 0);
    const newTotalPaid = totalPaid + Number(createPaymentDto.paidAmount);

    if (newTotalPaid > Number(bill.totalAmount)) {
      throw new BadRequestException('Payment amount exceeds bill total');
    }

    // Create payment
    const payment = this.billPaymentRepository.create({
      ...createPaymentDto,
      billId
    });

    const savedPayment = await this.billPaymentRepository.save(payment);

    // Update bill status
    if (newTotalPaid >= Number(bill.totalAmount)) {
      bill.status = 'paid';
    } else if (newTotalPaid > 0) {
      bill.status = 'partially_paid';
    }

    await this.billRepository.save(bill);

    return savedPayment;
  }

  async getBillSummary(): Promise<any> {
    const summary = await this.billRepository
      .createQueryBuilder('bill')
      .select([
        'bill.status',
        'COUNT(*) as count',
        'SUM(bill.totalAmount) as totalAmount'
      ])
      .groupBy('bill.status')
      .getRawMany();

    const gstSummary = await this.billRepository
      .createQueryBuilder('bill')
      .select([
        'SUM(bill.cgstAmount + bill.sgstAmount + bill.igstAmount) as totalGst',
        'SUM(bill.tdsAmount) as totalTds'
      ])
      .where('bill.status != :status', { status: 'cancelled' })
      .getRawOne();

    return {
      statusSummary: summary,
      gstAndTds: gstSummary
    };
  }

  async getOverdueBills(): Promise<Bill[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await this.billRepository
      .createQueryBuilder('bill')
      .where('bill.dueDate < :today', { today })
      .andWhere('bill.status IN (:...statuses)', { statuses: ['pending', 'approved', 'partially_paid'] })
      .getMany();
  }

  async getGSTReport(fromDate: Date, toDate: Date): Promise<any> {
    const bills = await this.billRepository
      .createQueryBuilder('bill')
      .leftJoinAndSelect('bill.billItems', 'items')
      .where('bill.billDate BETWEEN :fromDate AND :toDate', { fromDate, toDate })
      .andWhere('bill.status != :status', { status: 'cancelled' })
      .getMany();

    const gstSummary = {
      cgst: 0,
      sgst: 0,
      igst: 0,
      cess: 0,
      totalGst: 0,
      billCount: bills.length
    };

    bills.forEach(bill => {
      gstSummary.cgst += Number(bill.cgstAmount);
      gstSummary.sgst += Number(bill.sgstAmount);
      gstSummary.igst += Number(bill.igstAmount);
      gstSummary.cess += Number(bill.cessAmount);
    });

    gstSummary.totalGst = gstSummary.cgst + gstSummary.sgst + gstSummary.igst + gstSummary.cess;

    return { gstSummary, bills };
  }

  private calculateBillTotals(billItems: any[], discountAmount: number = 0, tdsAmount: number = 0): {
    calculatedTotals: {
      subtotal: number;
      cgstAmount: number;
      sgstAmount: number;
      igstAmount: number;
      cessAmount: number;
      discountAmount: number;
      tdsAmount: number;
      totalAmount: number;
    };
    billItems: any[];
  } {
    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let totalCess = 0;

    const calculatedItems = billItems.map(item => {
      const amount = item.quantity * item.rate;
      const gstAmount = (amount * item.gstRate) / 100;
      
      // For simplicity, treating all as CGST + SGST (intra-state)
      // In real implementation, this should check state to determine CGST+SGST vs IGST
      const cgstAmount = gstAmount / 2;
      const sgstAmount = gstAmount / 2;
      const igstAmount = 0; // Would be gstAmount for inter-state
      const cessAmount = 0; // Cess calculation based on item type
      
      const totalAmount = amount + cgstAmount + sgstAmount + igstAmount + cessAmount;

      subtotal += amount;
      totalCgst += cgstAmount;
      totalSgst += sgstAmount;
      totalIgst += igstAmount;
      totalCess += cessAmount;

      return {
        ...item,
        amount,
        cgstAmount,
        sgstAmount,
        igstAmount,
        cessAmount,
        totalAmount
      };
    });

    const totalAmountBeforeDiscountAndTds = subtotal + totalCgst + totalSgst + totalIgst + totalCess;
    const finalTotalAmount = totalAmountBeforeDiscountAndTds - discountAmount - tdsAmount;

    return {
      calculatedTotals: {
        subtotal,
        cgstAmount: totalCgst,
        sgstAmount: totalSgst,
        igstAmount: totalIgst,
        cessAmount: totalCess,
        discountAmount,
        tdsAmount,
        totalAmount: finalTotalAmount
      },
      billItems: calculatedItems
    };
  }

  async getGSTReportData(fromDate: Date, toDate: Date): Promise<Bill[]> {
    return this.billRepository.find({
      where: {
        billDate: Between(fromDate, toDate),
        status: Not('cancelled')
      },
      relations: ['billItems', 'payments'],
      order: { billDate: 'ASC' }
    });
  }

  async getBillsSummary(): Promise<any> {
    const totalBills = await this.billRepository.count();
    const pendingBills = await this.billRepository.count({
      where: { status: 'pending' }
    });
    const overdueBills = await this.billRepository.count({
      where: { 
        status: In(['pending', 'approved']),
        dueDate: LessThan(new Date())
      }
    });
    const paidBills = await this.billRepository.count({
      where: { status: 'paid' }
    });

    const totalAmount = await this.billRepository
      .createQueryBuilder('bill')
      .select('SUM(bill.totalAmount)', 'total')
      .where('bill.status != :status', { status: 'cancelled' })
      .getRawOne();

    const pendingAmount = await this.billRepository
      .createQueryBuilder('bill')
      .select('SUM(bill.totalAmount)', 'total')
      .where('bill.status IN (:...statuses)', { statuses: ['pending', 'approved'] })
      .getRawOne();

    return {
      totalBills,
      pendingBills,
      overdueBills,
      paidBills,
      totalAmount: parseFloat(totalAmount?.total || '0'),
      pendingAmount: parseFloat(pendingAmount?.total || '0')
    };
  }

  async duplicateBill(id: string): Promise<Bill> {
    const originalBill = await this.findOne(id);
    
    const duplicatedBill = this.billRepository.create({
      ...originalBill,
      id: undefined,
      billNumber: `COPY-${originalBill.billNumber}`,
      billDate: new Date(),
      status: 'draft',
      billItems: originalBill.billItems.map(item => ({
        ...item,
        id: undefined,
        bill: undefined
      })),
      payments: []
    });

    return this.billRepository.save(duplicatedBill);
  }

  async findByVendor(vendorName: string): Promise<Bill[]> {
    return this.billRepository.find({
      where: { vendorName },
      relations: ['billItems', 'payments'],
      order: { billDate: 'DESC' }
    });
  }

  async getMonthlyBillAnalytics(year: number): Promise<any[]> {
    const result = await this.billRepository
      .createQueryBuilder('bill')
      .select([
        'EXTRACT(MONTH FROM bill.billDate) as month',
        'COUNT(*) as count',
        'SUM(bill.totalAmount) as totalAmount'
      ])
      .where('EXTRACT(YEAR FROM bill.billDate) = :year', { year })
      .andWhere('bill.status != :status', { status: 'cancelled' })
      .groupBy('EXTRACT(MONTH FROM bill.billDate)')
      .orderBy('month', 'ASC')
      .getRawMany();

    return result.map(item => ({
      month: parseInt(item.month),
      count: parseInt(item.count),
      totalAmount: parseFloat(item.totalAmount)
    }));
  }

  async getBillStatusBreakdown(): Promise<any[]> {
    const result = await this.billRepository
      .createQueryBuilder('bill')
      .select([
        'bill.status as status',
        'COUNT(*) as count',
        'SUM(bill.totalAmount) as totalAmount'
      ])
      .groupBy('bill.status')
      .getRawMany();

    return result.map(item => ({
      status: item.status,
      count: parseInt(item.count),
      totalAmount: parseFloat(item.totalAmount)
    }));
  }
}
