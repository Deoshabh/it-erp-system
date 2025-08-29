import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindManyOptions } from 'typeorm';
import { Lead, LeadStatus } from '../entities/lead.entity';
import { CreateLeadDto, UpdateLeadDto, LeadFilterDto } from '../dto/lead.dto';

export interface PaginatedLeads {
  data: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
  ) {}

  async create(createLeadDto: CreateLeadDto, createdById: string): Promise<Lead> {
    // Check if email already exists
    const existingLead = await this.leadRepository.findOne({
      where: { email: createLeadDto.email }
    });

    if (existingLead) {
      throw new ConflictException('Lead with this email already exists');
    }

    const lead = this.leadRepository.create({
      ...createLeadDto,
      createdById,
      lastContactDate: createLeadDto.lastContactDate ? new Date(createLeadDto.lastContactDate) : null,
      nextFollowUpDate: createLeadDto.nextFollowUpDate ? new Date(createLeadDto.nextFollowUpDate) : null,
    });

    return await this.leadRepository.save(lead);
  }

  async findAll(filters: LeadFilterDto): Promise<PaginatedLeads> {
    const {
      search = '',
      status,
      source,
      priority,
      assignedToId,
      company,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filters;

    const queryBuilder = this.leadRepository.createQueryBuilder('lead')
      .leftJoinAndSelect('lead.assignedTo', 'assignedTo')
      .leftJoinAndSelect('lead.createdBy', 'createdBy');

    // Search functionality
    if (search) {
      queryBuilder.where(
        '(lead.firstName ILIKE :search OR lead.lastName ILIKE :search OR lead.email ILIKE :search OR lead.company ILIKE :search OR lead.phone ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply filters
    if (status) {
      queryBuilder.andWhere('lead.status = :status', { status });
    }

    if (source) {
      queryBuilder.andWhere('lead.source = :source', { source });
    }

    if (priority) {
      queryBuilder.andWhere('lead.priority = :priority', { priority });
    }

    if (assignedToId) {
      queryBuilder.andWhere('lead.assignedToId = :assignedToId', { assignedToId });
    }

    if (company) {
      queryBuilder.andWhere('lead.company ILIKE :company', { company: `%${company}%` });
    }

    // Sorting
    const validSortFields = ['firstName', 'lastName', 'company', 'status', 'priority', 'estimatedValue', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`lead.${sortField}`, sortOrder);

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

  async findOne(id: string): Promise<Lead> {
    const lead = await this.leadRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'createdBy'],
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return lead;
  }

  async update(id: string, updateLeadDto: UpdateLeadDto): Promise<Lead> {
    const lead = await this.findOne(id);

    // Check email uniqueness if email is being updated
    if (updateLeadDto.email && updateLeadDto.email !== lead.email) {
      const existingLead = await this.leadRepository.findOne({
        where: { email: updateLeadDto.email }
      });

      if (existingLead) {
        throw new ConflictException('Lead with this email already exists');
      }
    }

    const updateData = {
      ...updateLeadDto,
      lastContactDate: updateLeadDto.lastContactDate ? new Date(updateLeadDto.lastContactDate) : lead.lastContactDate,
      nextFollowUpDate: updateLeadDto.nextFollowUpDate ? new Date(updateLeadDto.nextFollowUpDate) : lead.nextFollowUpDate,
    };

    Object.assign(lead, updateData);
    return await this.leadRepository.save(lead);
  }

  async remove(id: string): Promise<void> {
    const lead = await this.findOne(id);
    await this.leadRepository.remove(lead);
  }

  async convertToCustomer(id: string): Promise<Lead> {
    const lead = await this.findOne(id);
    lead.status = LeadStatus.CONVERTED;
    return await this.leadRepository.save(lead);
  }

  async getLeadStatistics(): Promise<any> {
    const totalLeads = await this.leadRepository.count();
    
    const statusDistribution = await this.leadRepository
      .createQueryBuilder('lead')
      .select('lead.status, COUNT(*) as count')
      .groupBy('lead.status')
      .getRawMany();

    const sourceDistribution = await this.leadRepository
      .createQueryBuilder('lead')
      .select('lead.source, COUNT(*) as count')
      .groupBy('lead.source')
      .getRawMany();

    const priorityDistribution = await this.leadRepository
      .createQueryBuilder('lead')
      .select('lead.priority, COUNT(*) as count')
      .groupBy('lead.priority')
      .getRawMany();

    const totalEstimatedValue = await this.leadRepository
      .createQueryBuilder('lead')
      .select('SUM(lead.estimatedValue)', 'total')
      .getRawOne();

    const conversionRate = await this.leadRepository
      .createQueryBuilder('lead')
      .select('COUNT(CASE WHEN lead.status = :convertedStatus THEN 1 END)::float / NULLIF(COUNT(*), 0)::float * 100', 'rate')
      .setParameter('convertedStatus', LeadStatus.CONVERTED)
      .getRawOne();

    return {
      totalLeads,
      statusDistribution,
      sourceDistribution,
      priorityDistribution,
      totalEstimatedValue: parseFloat(totalEstimatedValue.total) || 0,
      conversionRate: parseFloat(conversionRate.rate) || 0,
    };
  }

  async getLeadsByAssignee(assignedToId: string): Promise<Lead[]> {
    return await this.leadRepository.find({
      where: { assignedToId },
      relations: ['assignedTo', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await this.leadRepository.delete(ids);
  }

  async bulkUpdateStatus(ids: string[], status: LeadStatus): Promise<void> {
    await this.leadRepository.update(ids, { status });
  }
}
