import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, Between } from 'typeorm';
import { ProcurementRequest, ProcurementStatus, ProcurementCategory, ProcurementPriority } from './entities/procurement-request.entity';
import { CreateProcurementRequestDto, UpdateProcurementRequestDto } from './dto/procurement-request.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class ProcurementService {
  constructor(
    @InjectRepository(ProcurementRequest)
    private procurementRepository: Repository<ProcurementRequest>,
  ) {}

  async createRequest(createDto: CreateProcurementRequestDto, userId: string): Promise<ProcurementRequest> {
    // Generate unique request ID
    const requestId = await this.generateRequestId();

    const request = this.procurementRepository.create({
      ...createDto,
      requestId,
      requesterId: userId,
      status: ProcurementStatus.DRAFT,
      priority: createDto.priority || ProcurementPriority.MEDIUM,
      requiredBy: createDto.requiredBy ? new Date(createDto.requiredBy) : null,
    });

    return await this.procurementRepository.save(request);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: ProcurementStatus,
    category?: string,
    department?: string,
    priority?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (search) {
      where.title = Like(`%${search}%`);
    }
    
    if (status) {
      where.status = status;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (department) {
      where.department = department;
    }
    
    if (priority) {
      where.priority = priority;
    }

    const options: FindManyOptions<ProcurementRequest> = {
      where,
      skip,
      take: limit,
      order: { [sortBy]: sortOrder },
      relations: ['requester', 'approver'],
    };

    const [requests, total] = await this.procurementRepository.findAndCount(options);

    return {
      data: requests,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ProcurementRequest> {
    const request = await this.procurementRepository.findOne({
      where: { id },
      relations: ['requester', 'approver'],
    });

    if (!request) {
      throw new NotFoundException(`Procurement request with ID ${id} not found`);
    }

    return request;
  }

  async updateRequest(
    id: string,
    updateDto: UpdateProcurementRequestDto,
    userId: string,
    userRole: string,
  ): Promise<ProcurementRequest> {
    const request = await this.findOne(id);

    // Check permissions
    const canEdit = this.canEditRequest(request, userId, userRole);
    if (!canEdit) {
      throw new ForbiddenException('You do not have permission to edit this request');
    }

    // Update fields
    Object.assign(request, updateDto);

    if (updateDto.requiredBy) {
      request.requiredBy = new Date(updateDto.requiredBy);
    }

    // Handle status changes
    if (updateDto.status) {
      request.status = updateDto.status;
      
      if (updateDto.status === ProcurementStatus.APPROVED) {
        request.approvedAt = new Date();
        request.approverId = userId;
      } else if (updateDto.status === ProcurementStatus.ORDERED) {
        request.orderedAt = new Date();
      } else if (updateDto.status === ProcurementStatus.RECEIVED) {
        request.receivedAt = new Date();
      }
    }

    return await this.procurementRepository.save(request);
  }

  async submitForApproval(id: string, userId: string): Promise<ProcurementRequest> {
    const request = await this.findOne(id);

    if (request.requesterId !== userId) {
      throw new ForbiddenException('You can only submit your own requests');
    }

    if (request.status !== ProcurementStatus.DRAFT) {
      throw new BadRequestException('Only draft requests can be submitted for approval');
    }

    request.status = ProcurementStatus.PENDING_APPROVAL;
    return await this.procurementRepository.save(request);
  }

  async deleteRequest(id: string, userId: string, userRole: string): Promise<void> {
    const request = await this.findOne(id);

    // Only allow deletion of draft requests by owner or admin
    if (request.status !== ProcurementStatus.DRAFT) {
      throw new BadRequestException('Only draft requests can be deleted');
    }

    const canDelete = request.requesterId === userId || userRole === UserRole.ADMIN;
    if (!canDelete) {
      throw new ForbiddenException('You do not have permission to delete this request');
    }

    await this.procurementRepository.remove(request);
  }

  async getStatistics(department?: string) {
    const where: any = {};
    if (department) {
      where.department = department;
    }

    const [
      total,
      pending,
      approved,
      rejected,
      totalValueResult,
    ] = await Promise.all([
      this.procurementRepository.count({ where }),
      this.procurementRepository.count({ where: { ...where, status: ProcurementStatus.PENDING_APPROVAL } }),
      this.procurementRepository.count({ where: { ...where, status: ProcurementStatus.APPROVED } }),
      this.procurementRepository.count({ where: { ...where, status: ProcurementStatus.REJECTED } }),
      this.procurementRepository
        .createQueryBuilder('request')
        .select('SUM(request.estimatedAmount)', 'total')
        .where(department ? 'request.department = :department' : '1=1', { department })
        .getRawOne(),
    ]);

    const totalValue = parseFloat(totalValueResult?.total || '0');

    // Get category distribution
    const categoryStats = await this.procurementRepository
      .createQueryBuilder('request')
      .select('request.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(request.estimatedAmount)', 'value')
      .where(department ? 'request.department = :department' : '1=1', { department })
      .groupBy('request.category')
      .getRawMany();

    // Get monthly trends (last 6 months)
    const monthlyTrends = await this.procurementRepository
      .createQueryBuilder('request')
      .select("DATE_FORMAT(request.createdAt, '%Y-%m')", 'month')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(request.estimatedAmount)', 'value')
      .where('request.createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)')
      .andWhere(department ? 'request.department = :department' : '1=1', { department })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      summary: {
        total,
        pending,
        approved,
        rejected,
        totalValue,
        averageValue: total > 0 ? totalValue / total : 0,
      },
      categoryDistribution: categoryStats.map(stat => ({
        category: stat.category,
        count: parseInt(stat.count),
        value: parseFloat(stat.value || '0'),
      })),
      monthlyTrends: monthlyTrends.map(trend => ({
        month: trend.month,
        count: parseInt(trend.count),
        value: parseFloat(trend.value || '0'),
      })),
    };
  }

  private async generateRequestId(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Get count of requests this month
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const count = await this.procurementRepository.count({
      where: {
        createdAt: Between(startOfMonth, endOfMonth),
      },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `PR${year}${month}${sequence}`;
  }

  private canEditRequest(request: ProcurementRequest, userId: string, userRole: string): boolean {
    // Admin can edit any request
    if (userRole === UserRole.ADMIN) {
      return true;
    }

    // Requester can edit their own draft requests
    if (request.requesterId === userId && request.status === ProcurementStatus.DRAFT) {
      return true;
    }

    // Managers/HR can edit pending requests for approval decisions
    if (
      (userRole === UserRole.MANAGER || userRole === UserRole.HR || userRole === UserRole.FINANCE) &&
      request.status === ProcurementStatus.PENDING_APPROVAL
    ) {
      return true;
    }

    return false;
  }
}
