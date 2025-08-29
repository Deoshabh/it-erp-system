import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Opportunity, OpportunityStage } from '../entities/opportunity.entity';
import { CreateOpportunityDto, UpdateOpportunityDto, OpportunityFilterDto } from '../dto/opportunity.dto';

export interface PaginatedOpportunities {
  data: Opportunity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class OpportunityService {
  constructor(
    @InjectRepository(Opportunity)
    private opportunityRepository: Repository<Opportunity>,
  ) {}

  async create(createOpportunityDto: CreateOpportunityDto, createdById: string): Promise<Opportunity> {
    const opportunity = this.opportunityRepository.create({
      ...createOpportunityDto,
      createdById,
      expectedCloseDate: new Date(createOpportunityDto.expectedCloseDate),
    });

    return await this.opportunityRepository.save(opportunity);
  }

  async findAll(filters: OpportunityFilterDto): Promise<PaginatedOpportunities> {
    const {
      search = '',
      stage,
      type,
      ownerId,
      customerId,
      minAmount,
      maxAmount,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filters;

    const queryBuilder = this.opportunityRepository.createQueryBuilder('opportunity')
      .leftJoinAndSelect('opportunity.customer', 'customer')
      .leftJoinAndSelect('opportunity.lead', 'lead')
      .leftJoinAndSelect('opportunity.owner', 'owner')
      .leftJoinAndSelect('opportunity.createdBy', 'createdBy');

    // Search functionality
    if (search) {
      queryBuilder.where(
        '(opportunity.name ILIKE :search OR opportunity.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply filters
    if (stage) {
      queryBuilder.andWhere('opportunity.stage = :stage', { stage });
    }

    if (type) {
      queryBuilder.andWhere('opportunity.type = :type', { type });
    }

    if (ownerId) {
      queryBuilder.andWhere('opportunity.ownerId = :ownerId', { ownerId });
    }

    if (customerId) {
      queryBuilder.andWhere('opportunity.customerId = :customerId', { customerId });
    }

    if (minAmount !== undefined) {
      queryBuilder.andWhere('opportunity.amount >= :minAmount', { minAmount });
    }

    if (maxAmount !== undefined) {
      queryBuilder.andWhere('opportunity.amount <= :maxAmount', { maxAmount });
    }

    // Sorting
    const validSortFields = ['name', 'stage', 'amount', 'probability', 'expectedCloseDate', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`opportunity.${sortField}`, sortOrder);

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

  async findOne(id: string): Promise<Opportunity> {
    const opportunity = await this.opportunityRepository.findOne({
      where: { id },
      relations: ['customer', 'lead', 'owner', 'createdBy'],
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    return opportunity;
  }

  async update(id: string, updateOpportunityDto: UpdateOpportunityDto): Promise<Opportunity> {
    const opportunity = await this.findOne(id);

    const updateData = {
      ...updateOpportunityDto,
      expectedCloseDate: updateOpportunityDto.expectedCloseDate ? new Date(updateOpportunityDto.expectedCloseDate) : opportunity.expectedCloseDate,
      actualCloseDate: updateOpportunityDto.actualCloseDate ? new Date(updateOpportunityDto.actualCloseDate) : opportunity.actualCloseDate,
    };

    Object.assign(opportunity, updateData);
    return await this.opportunityRepository.save(opportunity);
  }

  async remove(id: string): Promise<void> {
    const opportunity = await this.findOne(id);
    await this.opportunityRepository.remove(opportunity);
  }

  async closeWon(id: string): Promise<Opportunity> {
    const opportunity = await this.findOne(id);
    opportunity.stage = OpportunityStage.CLOSED_WON;
    opportunity.actualCloseDate = new Date();
    opportunity.probability = 100;
    return await this.opportunityRepository.save(opportunity);
  }

  async closeLost(id: string, lossReason?: string): Promise<Opportunity> {
    const opportunity = await this.findOne(id);
    opportunity.stage = OpportunityStage.CLOSED_LOST;
    opportunity.actualCloseDate = new Date();
    opportunity.probability = 0;
    if (lossReason) {
      opportunity.lossReason = lossReason;
    }
    return await this.opportunityRepository.save(opportunity);
  }

  async getSalesPipeline(): Promise<any> {
    const pipelineData = await this.opportunityRepository
      .createQueryBuilder('opportunity')
      .select('opportunity.stage, COUNT(*) as count, SUM(opportunity.amount) as totalValue')
      .where('opportunity.stage NOT IN (:...closedStages)', { 
        closedStages: [OpportunityStage.CLOSED_WON, OpportunityStage.CLOSED_LOST] 
      })
      .groupBy('opportunity.stage')
      .getRawMany();

    const stages = Object.values(OpportunityStage).filter(stage => 
      stage !== OpportunityStage.CLOSED_WON && stage !== OpportunityStage.CLOSED_LOST
    );

    return stages.map(stage => {
      const stageData = pipelineData.find(p => p.opportunity_stage === stage);
      return {
        stage,
        count: parseInt(stageData?.count || '0'),
        totalValue: parseFloat(stageData?.totalvalue || '0'),
      };
    });
  }

  async getOpportunityStatistics(): Promise<any> {
    const totalOpportunities = await this.opportunityRepository.count();
    
    const stageDistribution = await this.opportunityRepository
      .createQueryBuilder('opportunity')
      .select('opportunity.stage, COUNT(*) as count, SUM(opportunity.amount) as totalValue')
      .groupBy('opportunity.stage')
      .getRawMany();

    const totalValue = await this.opportunityRepository
      .createQueryBuilder('opportunity')
      .select('SUM(opportunity.amount)', 'total')
      .getRawOne();

    const wonOpportunities = await this.opportunityRepository.count({
      where: { stage: OpportunityStage.CLOSED_WON }
    });

    const lostOpportunities = await this.opportunityRepository.count({
      where: { stage: OpportunityStage.CLOSED_LOST }
    });

    const winRate = totalOpportunities > 0 ? (wonOpportunities / (wonOpportunities + lostOpportunities)) * 100 : 0;

    const averageAmount = await this.opportunityRepository
      .createQueryBuilder('opportunity')
      .select('AVG(opportunity.amount)', 'average')
      .getRawOne();

    return {
      totalOpportunities,
      wonOpportunities,
      lostOpportunities,
      winRate,
      totalValue: parseFloat(totalValue.total) || 0,
      averageAmount: parseFloat(averageAmount.average) || 0,
      stageDistribution: stageDistribution.map(s => ({
        stage: s.opportunity_stage,
        count: parseInt(s.count),
        totalValue: parseFloat(s.totalvalue) || 0,
      })),
    };
  }

  async getOpportunitiesByOwner(ownerId: string): Promise<Opportunity[]> {
    return await this.opportunityRepository.find({
      where: { ownerId },
      relations: ['customer', 'lead', 'owner', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getForecast(ownerId?: string): Promise<any> {
    const queryBuilder = this.opportunityRepository.createQueryBuilder('opportunity')
      .select('opportunity.stage, SUM(opportunity.amount * opportunity.probability / 100) as weightedValue')
      .where('opportunity.stage NOT IN (:...closedStages)', { 
        closedStages: [OpportunityStage.CLOSED_WON, OpportunityStage.CLOSED_LOST] 
      });

    if (ownerId) {
      queryBuilder.andWhere('opportunity.ownerId = :ownerId', { ownerId });
    }

    const forecast = await queryBuilder
      .groupBy('opportunity.stage')
      .getRawMany();

    const totalWeightedValue = forecast.reduce((sum, f) => sum + parseFloat(f.weightedvalue || '0'), 0);

    return {
      totalWeightedValue,
      byStage: forecast.map(f => ({
        stage: f.opportunity_stage,
        weightedValue: parseFloat(f.weightedvalue || '0'),
      })),
    };
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await this.opportunityRepository.delete(ids);
  }

  async bulkUpdateStage(ids: string[], stage: OpportunityStage): Promise<void> {
    await this.opportunityRepository.update(ids, { stage });
  }
}
