import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification, NotificationChannel } from '../entities/notification.entity';
import { CreateNotificationDto, UpdateNotificationDto, NotificationFilterDto, BroadcastNotificationDto } from '../dto/notification.dto';

export interface PaginatedNotifications {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      scheduledFor: createNotificationDto.scheduledFor ? new Date(createNotificationDto.scheduledFor) : null,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    // Send notification based on channel
    await this.sendNotification(savedNotification);

    return savedNotification;
  }

  async findAll(filters: NotificationFilterDto): Promise<PaginatedNotifications> {
    const {
      search = '',
      type,
      priority,
      channel,
      isRead,
      recipientId,
      senderId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filters;

    const queryBuilder = this.notificationRepository.createQueryBuilder('notification')
      .leftJoinAndSelect('notification.recipient', 'recipient')
      .leftJoinAndSelect('notification.sender', 'sender');

    // Search functionality
    if (search) {
      queryBuilder.where(
        '(notification.title ILIKE :search OR notification.message ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply filters
    if (type) {
      queryBuilder.andWhere('notification.type = :type', { type });
    }

    if (priority) {
      queryBuilder.andWhere('notification.priority = :priority', { priority });
    }

    if (channel) {
      queryBuilder.andWhere('notification.channel = :channel', { channel });
    }

    if (isRead !== undefined) {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead });
    }

    if (recipientId) {
      queryBuilder.andWhere('notification.recipientId = :recipientId', { recipientId });
    }

    if (senderId) {
      queryBuilder.andWhere('notification.senderId = :senderId', { senderId });
    }

    // Sorting
    const validSortFields = ['title', 'type', 'priority', 'isRead', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`notification.${sortField}`, sortOrder);

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

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['recipient', 'sender'],
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id);

    const updateData = {
      ...updateNotificationDto,
      scheduledFor: updateNotificationDto.scheduledFor ? new Date(updateNotificationDto.scheduledFor) : notification.scheduledFor,
      readAt: updateNotificationDto.isRead && !notification.isRead ? new Date() : notification.readAt,
    };

    Object.assign(notification, updateData);
    return await this.notificationRepository.save(notification);
  }

  async remove(id: string): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationRepository.remove(notification);
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.isRead = true;
    notification.readAt = new Date();
    return await this.notificationRepository.save(notification);
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    await this.notificationRepository.update(
      { recipientId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  async getUnreadCount(recipientId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { recipientId, isRead: false },
    });
  }

  async getUserNotifications(recipientId: string, limit: number = 50): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { recipientId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async broadcastNotification(broadcastDto: BroadcastNotificationDto, senderId?: string): Promise<Notification[]> {
    let recipientIds = broadcastDto.recipientIds;

    // If no specific recipients, broadcast to all users
    if (!recipientIds || recipientIds.length === 0) {
      // This would typically get all user IDs from the User service
      // For now, we'll assume recipientIds are provided
      throw new Error('Recipient IDs must be provided for broadcast');
    }

    const notifications = recipientIds.map(recipientId => 
      this.notificationRepository.create({
        ...broadcastDto,
        recipientId,
        senderId,
        isBroadcast: true,
      })
    );

    const savedNotifications = await this.notificationRepository.save(notifications);

    // Send notifications based on channel
    for (const notification of savedNotifications) {
      await this.sendNotification(notification);
    }

    return savedNotifications;
  }

  async getNotificationStatistics(recipientId?: string): Promise<any> {
    const queryBuilder = this.notificationRepository.createQueryBuilder('notification');

    if (recipientId) {
      queryBuilder.where('notification.recipientId = :recipientId', { recipientId });
    }

    const total = await queryBuilder.getCount();
    const unread = await queryBuilder.clone().andWhere('notification.isRead = false').getCount();
    const read = await queryBuilder.clone().andWhere('notification.isRead = true').getCount();

    const typeDistribution = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.type, COUNT(*) as count')
      .where(recipientId ? 'notification.recipientId = :recipientId' : '1=1', { recipientId })
      .groupBy('notification.type')
      .getRawMany();

    const priorityDistribution = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.priority, COUNT(*) as count')
      .where(recipientId ? 'notification.recipientId = :recipientId' : '1=1', { recipientId })
      .groupBy('notification.priority')
      .getRawMany();

    return {
      total,
      unread,
      read,
      typeDistribution,
      priorityDistribution,
    };
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await this.notificationRepository.delete(ids);
  }

  async bulkMarkAsRead(ids: string[]): Promise<void> {
    await this.notificationRepository.update(
      { id: In(ids) },
      { isRead: true, readAt: new Date() }
    );
  }

  private async sendNotification(notification: Notification): Promise<void> {
    // This method would integrate with actual notification services
    // For now, it's a placeholder for different notification channels

    switch (notification.channel) {
      case NotificationChannel.EMAIL:
        // Integration with email service
        console.log(`Sending email notification: ${notification.title}`);
        break;
      case NotificationChannel.SMS:
        // Integration with SMS service
        console.log(`Sending SMS notification: ${notification.title}`);
        break;
      case NotificationChannel.PUSH:
        // Integration with push notification service
        console.log(`Sending push notification: ${notification.title}`);
        break;
      case NotificationChannel.IN_APP:
        // In-app notifications are stored in database and retrieved by frontend
        console.log(`In-app notification created: ${notification.title}`);
        break;
      default:
        console.log(`Unknown notification channel: ${notification.channel}`);
    }
  }
}
