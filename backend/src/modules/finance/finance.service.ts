import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, Expense } from './entities/finance.entity';
import { CreateInvoiceDto, CreateExpenseDto } from './dto/create-finance.dto';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  // Invoice operations
  async createInvoice(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const invoice = this.invoiceRepository.create(createInvoiceDto);
    return await this.invoiceRepository.save(invoice);
  }

  async findAllInvoices(): Promise<Invoice[]> {
    return await this.invoiceRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async updateInvoiceStatus(id: string, status: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({ where: { id } });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    invoice.status = status;
    return await this.invoiceRepository.save(invoice);
  }

  async removeInvoice(id: string): Promise<void> {
    const result = await this.invoiceRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
  }

  // Expense operations
  async createExpense(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const expense = this.expenseRepository.create(createExpenseDto);
    return await this.expenseRepository.save(expense);
  }

  async findAllExpenses(): Promise<Expense[]> {
    return await this.expenseRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async updateExpenseStatus(id: string, status: string): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({ where: { id } });
    if (!expense) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
    expense.status = status;
    return await this.expenseRepository.save(expense);
  }

  async removeExpense(id: string): Promise<void> {
    const result = await this.expenseRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Expense with ID ${id} not found`);
    }
  }

  // Analytics
  async getFinancialSummary(): Promise<any> {
    const totalRevenue = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.amount)', 'total')
      .getRawOne();

    const totalExpenses = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .getRawOne();

    const paidInvoices = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .where('invoice.status = :status', { status: 'paid' })
      .select('SUM(invoice.amount)', 'total')
      .getRawOne();

    return {
      totalRevenue: parseFloat(totalRevenue.total) || 0,
      totalExpenses: parseFloat(totalExpenses.total) || 0,
      paidRevenue: parseFloat(paidInvoices.total) || 0,
      netProfit: (parseFloat(paidInvoices.total) || 0) - (parseFloat(totalExpenses.total) || 0),
    };
  }
}
