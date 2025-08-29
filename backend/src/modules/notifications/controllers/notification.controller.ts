import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationService } from '../services/notification.service';
import { CreateNotificationDto, UpdateNotificationDto, NotificationFilterDto, BroadcastNotificationDto } from '../dto/notification.dto';
import { Notification, NotificationType, NotificationPriority } from '../entities/notification.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Notification created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async create(@Body() createNotificationDto: CreateNotificationDto): Promise<Notification> {
    return await this.notificationService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in title, message' })
  @ApiQuery({ name: 'type', required: false, enum: NotificationType, description: 'Filter by type' })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean, description: 'Filter by read status' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notifications retrieved successfully' })
  async findAll(@Query() filters: NotificationFilterDto, @Request() req) {
    // Users can only see their own notifications unless they're admin
    if (req.user.role !== UserRole.ADMIN) {
      filters.recipientId = req.user.sub;
    }
    return await this.notificationService.findAll(filters);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Unread count retrieved successfully' })
  async getUnreadCount(@Request() req): Promise<{ count: number }> {
    const count = await this.notificationService.getUnreadCount(req.user.sub);
    return { count };
  }

  @Get('my-notifications')
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of notifications to retrieve' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User notifications retrieved successfully' })
  async getUserNotifications(
    @Request() req,
    @Query('limit') limit?: number
  ): Promise<Notification[]> {
    return await this.notificationService.getUserNotifications(req.user.sub, limit);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get notification statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification statistics retrieved successfully' })
  async getStatistics(@Request() req) {
    // Users can only see their own statistics unless they're admin
    const recipientId = req.user.role === UserRole.ADMIN ? undefined : req.user.sub;
    return await this.notificationService.getNotificationStatistics(recipientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Notification not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Notification> {
    return await this.notificationService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update notification' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Notification not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNotificationDto: UpdateNotificationDto
  ): Promise<Notification> {
    return await this.notificationService.update(id, updateNotificationDto);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification marked as read successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Notification not found' })
  async markAsRead(@Param('id', ParseUUIDPipe) id: string): Promise<Notification> {
    return await this.notificationService.markAsRead(id);
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'All notifications marked as read successfully' })
  async markAllAsRead(@Request() req): Promise<{ message: string }> {
    await this.notificationService.markAllAsRead(req.user.sub);
    return { message: 'All notifications marked as read successfully' };
  }

  @Post('broadcast')
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @ApiOperation({ summary: 'Broadcast notification to multiple users' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Broadcast notification sent successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async broadcast(
    @Body() broadcastDto: BroadcastNotificationDto,
    @Request() req
  ): Promise<{ message: string; count: number }> {
    const notifications = await this.notificationService.broadcastNotification(broadcastDto, req.user.sub);
    return {
      message: 'Broadcast notification sent successfully',
      count: notifications.length,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notification deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Notification not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.notificationService.remove(id);
    return { message: 'Notification deleted successfully' };
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Bulk delete notifications' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notifications deleted successfully' })
  async bulkDelete(@Body('ids') ids: string[]): Promise<{ message: string }> {
    await this.notificationService.bulkDelete(ids);
    return { message: `${ids.length} notifications deleted successfully` };
  }

  @Patch('bulk-read')
  @ApiOperation({ summary: 'Bulk mark notifications as read' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notifications marked as read successfully' })
  async bulkMarkAsRead(@Body('ids') ids: string[]): Promise<{ message: string }> {
    await this.notificationService.bulkMarkAsRead(ids);
    return { message: `${ids.length} notifications marked as read successfully` };
  }
}
