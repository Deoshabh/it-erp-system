import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, Between } from 'typeorm';
import { AuditLog, AuditAction, AuditEntityType } from '../entities/audit-log.entity';
import { User } from '../../users/entities/user.entity';
import { CreateAuditLogDto, AuditLogFilterDto } from '../dto/audit-log.dto';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    let user = null;
    if (createAuditLogDto.userId) {
      user = await this.userRepository.findOne({ where: { id: createAuditLogDto.userId } });
    }

    const auditLog = this.auditLogRepository.create({
      ...createAuditLogDto,
      user,
    });

    return await this.auditLogRepository.save(auditLog);
  }

  async findAll(filters: AuditLogFilterDto) {
    const {
      search,
      action,
      entityType,
      entityId,
      userId,
      dateFrom,
      dateTo,
      ipAddress,
      systemActionsOnly,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filters;

    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('auditLog')
      .leftJoinAndSelect('auditLog.user', 'user');

    // Search filter
    if (search) {
      queryBuilder.andWhere(
        '(auditLog.description ILIKE :search OR auditLog.entityName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Action filter
    if (action) {
      queryBuilder.andWhere('auditLog.action = :action', { action });
    }

    // Entity type filter
    if (entityType) {
      queryBuilder.andWhere('auditLog.entityType = :entityType', { entityType });
    }

    // Entity ID filter
    if (entityId) {
      queryBuilder.andWhere('auditLog.entityId = :entityId', { entityId });
    }

    // User filter
    if (userId) {
      queryBuilder.andWhere('auditLog.userId = :userId', { userId });
    }

    // Date filters
    if (dateFrom) {
      queryBuilder.andWhere('auditLog.createdAt >= :dateFrom', { dateFrom });
    }
    if (dateTo) {
      queryBuilder.andWhere('auditLog.createdAt <= :dateTo', { dateTo });
    }

    // IP address filter
    if (ipAddress) {
      queryBuilder.andWhere('auditLog.ipAddress = :ipAddress', { ipAddress });
    }

    // System actions filter
    if (systemActionsOnly) {
      queryBuilder.andWhere('auditLog.userId IS NULL');
    }

    // Sorting
    queryBuilder.orderBy(`auditLog.${sortBy}`, sortOrder);

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [auditLogs, total] = await queryBuilder.getManyAndCount();

    return {
      data: auditLogs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<AuditLog> {
    const auditLog = await this.auditLogRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!auditLog) {
      throw new NotFoundException('Audit log not found');
    }

    return auditLog;
  }

  async getAuditStatistics(dateFrom?: Date, dateTo?: Date) {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('auditLog');

    if (dateFrom) {
      queryBuilder.andWhere('auditLog.createdAt >= :dateFrom', { dateFrom });
    }
    if (dateTo) {
      queryBuilder.andWhere('auditLog.createdAt <= :dateTo', { dateTo });
    }

    const totalLogs = await queryBuilder.getCount();

    const actionStats = await queryBuilder
      .select('auditLog.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('auditLog.action')
      .getRawMany();

    const entityTypeStats = await queryBuilder
      .select('auditLog.entityType', 'entityType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('auditLog.entityType')
      .getRawMany();

    const userStats = await queryBuilder
      .leftJoin('auditLog.user', 'user')
      .select('user.email', 'userEmail')
      .addSelect('user.firstName', 'firstName')
      .addSelect('user.lastName', 'lastName')
      .addSelect('COUNT(*)', 'count')
      .where('user.id IS NOT NULL')
      .groupBy('user.id, user.email, user.firstName, user.lastName')
      .orderBy('COUNT(*)', 'DESC')
      .limit(10)
      .getRawMany();

    const systemActionsCount = await queryBuilder
      .andWhere('auditLog.userId IS NULL')
      .getCount();

    return {
      totalLogs,
      systemActionsCount,
      userActionsCount: totalLogs - systemActionsCount,
      actionDistribution: actionStats.map(stat => ({
        action: stat.action,
        count: parseInt(stat.count),
      })),
      entityTypeDistribution: entityTypeStats.map(stat => ({
        entityType: stat.entityType,
        count: parseInt(stat.count),
      })),
      topActiveUsers: userStats.map(stat => ({
        userEmail: stat.userEmail,
        userName: `${stat.firstName} ${stat.lastName}`,
        count: parseInt(stat.count),
      })),
    };
  }

  async logAction(
    action: AuditAction,
    entityType: AuditEntityType,
    entityId?: string,
    entityName?: string,
    description?: string,
    oldValues?: any,
    newValues?: any,
    userId?: string,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string,
  ): Promise<AuditLog> {
    const auditLogDto: CreateAuditLogDto = {
      action,
      entityType,
      entityId,
      entityName,
      description,
      oldValues,
      newValues,
      userId,
      metadata,
      ipAddress,
      userAgent,
      sessionId,
    };

    return await this.create(auditLogDto);
  }

  async getEntityHistory(entityType: AuditEntityType, entityId: string): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: { entityType, entityId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUserActivity(userId: string, limit?: number): Promise<AuditLog[]> {
    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('auditLog')
      .leftJoinAndSelect('auditLog.user', 'user')
      .where('auditLog.userId = :userId', { userId })
      .orderBy('auditLog.createdAt', 'DESC');

    if (limit) {
      queryBuilder.take(limit);
    }

    return await queryBuilder.getMany();
  }

  async deleteOldLogs(daysOld: number): Promise<{ deletedCount: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return { deletedCount: result.affected || 0 };
  }
}
