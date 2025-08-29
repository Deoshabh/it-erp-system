import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Customer, CustomerStatus } from '../entities/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto, CustomerFilterDto } from '../dto/customer.dto';

export interface PaginatedCustomers {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, createdById: string): Promise<Customer> {
    // Check if email already exists
    const existingCustomer = await this.customerRepository.findOne({
      where: { email: createCustomerDto.email }
    });

    if (existingCustomer) {
      throw new ConflictException('Customer with this email already exists');
    }

    const customer = this.customerRepository.create({
      ...createCustomerDto,
      createdById,
    });

    return await this.customerRepository.save(customer);
  }

  async findAll(filters: CustomerFilterDto): Promise<PaginatedCustomers> {
    const {
      search = '',
      type,
      status,
      industry,
      accountManagerId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filters;

    const queryBuilder = this.customerRepository.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.accountManager', 'accountManager')
      .leftJoinAndSelect('customer.createdBy', 'createdBy');

    // Search functionality
    if (search) {
      queryBuilder.where(
        '(customer.name ILIKE :search OR customer.email ILIKE :search OR customer.industry ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply filters
    if (type) {
      queryBuilder.andWhere('customer.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('customer.status = :status', { status });
    }

    if (industry) {
      queryBuilder.andWhere('customer.industry ILIKE :industry', { industry: `%${industry}%` });
    }

    if (accountManagerId) {
      queryBuilder.andWhere('customer.accountManagerId = :accountManagerId', { accountManagerId });
    }

    // Sorting
    const validSortFields = ['name', 'email', 'type', 'status', 'industry', 'totalPurchaseValue', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`customer.${sortField}`, sortOrder);

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['accountManager', 'createdBy'],
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);

    // Check email uniqueness if email is being updated
    if (updateCustomerDto.email && updateCustomerDto.email !== customer.email) {
      const existingCustomer = await this.customerRepository.findOne({
        where: { email: updateCustomerDto.email }
      });

      if (existingCustomer) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    Object.assign(customer, updateCustomerDto);
    return await this.customerRepository.save(customer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepository.remove(customer);
  }

  async updatePurchaseInfo(id: string, amount: number): Promise<Customer> {
    const customer = await this.findOne(id);
    
    if (!customer.firstPurchaseDate) {
      customer.firstPurchaseDate = new Date();
    }
    
    customer.lastPurchaseDate = new Date();
    customer.totalPurchaseValue = (customer.totalPurchaseValue || 0) + amount;
    
    return await this.customerRepository.save(customer);
  }

  async getCustomerStatistics(): Promise<any> {
    const totalCustomers = await this.customerRepository.count();
    
    const typeDistribution = await this.customerRepository
      .createQueryBuilder('customer')
      .select('customer.type, COUNT(*) as count')
      .groupBy('customer.type')
      .getRawMany();

    const statusDistribution = await this.customerRepository
      .createQueryBuilder('customer')
      .select('customer.status, COUNT(*) as count')
      .groupBy('customer.status')
      .getRawMany();

    const industryDistribution = await this.customerRepository
      .createQueryBuilder('customer')
      .select('customer.industry, COUNT(*) as count')
      .where('customer.industry IS NOT NULL')
      .groupBy('customer.industry')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const totalRevenue = await this.customerRepository
      .createQueryBuilder('customer')
      .select('SUM(customer.totalPurchaseValue)', 'total')
      .getRawOne();

    const averageRevenue = await this.customerRepository
      .createQueryBuilder('customer')
      .select('AVG(customer.totalPurchaseValue)', 'average')
      .getRawOne();

    const activeCustomers = await this.customerRepository.count({
      where: { status: CustomerStatus.ACTIVE }
    });

    return {
      totalCustomers,
      activeCustomers,
      typeDistribution,
      statusDistribution,
      industryDistribution,
      totalRevenue: parseFloat(totalRevenue.total) || 0,
      averageRevenue: parseFloat(averageRevenue.average) || 0,
    };
  }

  async getCustomersByAccountManager(accountManagerId: string): Promise<Customer[]> {
    return await this.customerRepository.find({
      where: { accountManagerId },
      relations: ['accountManager', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await this.customerRepository.delete(ids);
  }

  async bulkUpdateStatus(ids: string[], status: CustomerStatus): Promise<void> {
    await this.customerRepository.update(ids, { status });
  }
}
