import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ProcurementRequest, ProcurementStatus } from './entities/procurement-request.entity';
import { CreateProcurementRequestDto, UpdateProcurementRequestDto } from './dto/procurement-request.dto';

@Injectable()
export class ProcurementService {
  constructor(
    @InjectRepository(ProcurementRequest)
    private readonly procurementRepository: Repository<ProcurementRequest>,
  ) {}

  async createRequest(createDto: CreateProcurementRequestDto, requesterId: string): Promise<ProcurementRequest> {
    const requestId = `PR-${Date.now()}`;
    
    const procurement = this.procurementRepository.create({
      ...createDto,
      requestId,
      requesterId,
      status: ProcurementStatus.DRAFT,
    });

    return await this.procurementRepository.save(procurement);
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
    const query = this.procurementRepository.createQueryBuilder('procurement')
      .leftJoinAndSelect('procurement.requester', 'requester')
      .leftJoinAndSelect('procurement.approver', 'approver');

    if (search) {
      query.andWhere(
        '(procurement.title ILIKE :search OR procurement.description ILIKE :search OR procurement.vendor ILIKE :search OR procurement.requestId ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (status) {
      query.andWhere('procurement.status = :status', { status });
    }

    if (category) {
      query.andWhere('procurement.category = :category', { category });
    }

    if (department) {
      query.andWhere('procurement.department = :department', { department });
    }

    if (priority) {
      query.andWhere('procurement.priority = :priority', { priority });
    }

    const total = await query.getCount();

    query
      .orderBy(`procurement.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const requests = await query.getMany();

    return {
      data: requests,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    };
  }

  async findOne(id: string): Promise<ProcurementRequest> {
    const procurement = await this.procurementRepository.findOne({
      where: { id },
      relations: ['requester', 'approver'],
    });

    if (!procurement) {
      throw new NotFoundException('Procurement request not found');
    }

    return procurement;
  }

  async updateRequest(
    id: string,
    updateDto: UpdateProcurementRequestDto,
    userId: string,
    userRole: string,
  ): Promise<ProcurementRequest> {
    const procurement = await this.findOne(id);

    // Check permissions
    if (procurement.requesterId !== userId && !['admin', 'manager'].includes(userRole)) {
      throw new ForbiddenException('You can only update your own requests');
    }

    // Special handling for status changes
    if (updateDto.status) {
      switch (updateDto.status) {
        case ProcurementStatus.APPROVED:
          if (!['admin', 'manager'].includes(userRole)) {
            throw new ForbiddenException('Only managers can approve requests');
          }
          updateDto.approvalNotes = updateDto.approvalNotes || 'Approved';
          procurement.approverId = userId;
          procurement.approvedAt = new Date();
          break;

        case ProcurementStatus.REJECTED:
          if (!['admin', 'manager'].includes(userRole)) {
            throw new ForbiddenException('Only managers can reject requests');
          }
          if (!updateDto.rejectionReason) {
            throw new ForbiddenException('Rejection reason is required');
          }
          procurement.approverId = userId;
          break;

        case ProcurementStatus.ORDERED:
          if (procurement.status !== ProcurementStatus.APPROVED) {
            throw new ForbiddenException('Can only order approved requests');
          }
          procurement.orderedAt = new Date();
          break;

        case ProcurementStatus.RECEIVED:
          if (procurement.status !== ProcurementStatus.ORDERED) {
            throw new ForbiddenException('Can only mark ordered requests as received');
          }
          procurement.receivedAt = new Date();
          break;
      }
    }

    Object.assign(procurement, updateDto);
    return await this.procurementRepository.save(procurement);
  }

  async deleteRequest(id: string, userId: string, userRole: string): Promise<void> {
    const procurement = await this.findOne(id);

    if (procurement.requesterId !== userId && !['admin'].includes(userRole)) {
      throw new ForbiddenException('You can only delete your own requests');
    }

    if (procurement.status === ProcurementStatus.APPROVED || procurement.status === ProcurementStatus.ORDERED) {
      throw new ForbiddenException('Cannot delete approved or ordered requests');
    }

    await this.procurementRepository.remove(procurement);
  }

  async getStatistics(department?: string) {
    const query = this.procurementRepository.createQueryBuilder('procurement');

    if (department) {
      query.where('procurement.department = :department', { department });
    }

    const totalRequests = await query.getCount();

    const statusStats = await query
      .select('procurement.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('procurement.status')
      .getRawMany();

    const categoryStats = await query
      .select('procurement.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(procurement.estimatedAmount)', 'totalAmount')
      .groupBy('procurement.category')
      .getRawMany();

    const monthlySpend = await query
      .select("DATE_TRUNC('month', procurement.createdAt)", 'month')
      .addSelect('SUM(procurement.actualAmount)', 'totalSpend')
      .where('procurement.status = :status', { status: ProcurementStatus.RECEIVED })
      .groupBy("DATE_TRUNC('month', procurement.createdAt)")
      .orderBy('month', 'DESC')
      .limit(12)
      .getRawMany();

    return {
      totalRequests,
      statusStats,
      categoryStats,
      monthlySpend,
    };
  }

  async submitForApproval(id: string, userId: string): Promise<ProcurementRequest> {
    const procurement = await this.findOne(id);

    if (procurement.requesterId !== userId) {
      throw new ForbiddenException('You can only submit your own requests');
    }

    if (procurement.status !== ProcurementStatus.DRAFT) {
      throw new ForbiddenException('Only draft requests can be submitted for approval');
    }

    procurement.status = ProcurementStatus.PENDING_APPROVAL;
    return await this.procurementRepository.save(procurement);
  }
}
