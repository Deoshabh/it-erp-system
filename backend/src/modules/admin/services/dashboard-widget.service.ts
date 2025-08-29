import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { DashboardWidget, DashboardWidgetType } from '../entities/dashboard-widget.entity';
import { CreateDashboardWidgetDto, UpdateDashboardWidgetDto, DashboardWidgetFilterDto, UpdateWidgetPositionDto } from '../dto/dashboard-widget.dto';

// Import services to get dashboard data
import { ProjectService } from '../../projects/services/project.service';
import { TaskService } from '../../projects/services/task.service';
import { EmployeesService } from '../../employees/employees.service';
import { FinanceService } from '../../finance/finance.service';
import { NotificationService } from '../../notifications/services/notification.service';

@Injectable()
export class DashboardWidgetService {
  constructor(
    @InjectRepository(DashboardWidget)
    private dashboardWidgetRepository: Repository<DashboardWidget>,
    private projectService: ProjectService,
    private taskService: TaskService,
    private employeesService: EmployeesService,
    private financeService: FinanceService,
    private notificationService: NotificationService,
  ) {}

  async create(createDashboardWidgetDto: CreateDashboardWidgetDto): Promise<DashboardWidget> {
    const widget = this.dashboardWidgetRepository.create(createDashboardWidgetDto);
    return await this.dashboardWidgetRepository.save(widget);
  }

  async findAll(filters: DashboardWidgetFilterDto) {
    const {
      search,
      type,
      category,
      visibleOnly,
      activeOnly,
      page = 1,
      limit = 20,
      sortBy = 'yPosition',
      sortOrder = 'ASC',
    } = filters;

    const queryBuilder = this.dashboardWidgetRepository.createQueryBuilder('widget');

    // Search filter
    if (search) {
      queryBuilder.andWhere(
        '(widget.title ILIKE :search OR widget.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Type filter
    if (type) {
      queryBuilder.andWhere('widget.type = :type', { type });
    }

    // Category filter
    if (category) {
      queryBuilder.andWhere('widget.category = :category', { category });
    }

    // Visibility filter
    if (visibleOnly) {
      queryBuilder.andWhere('widget.isVisible = true');
    }

    // Active filter
    if (activeOnly) {
      queryBuilder.andWhere('widget.isActive = true');
    }

    // Sorting
    if (sortBy === 'yPosition') {
      queryBuilder.orderBy('widget.yPosition', sortOrder).addOrderBy('widget.xPosition', 'ASC');
    } else {
      queryBuilder.orderBy(`widget.${sortBy}`, sortOrder);
    }

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [widgets, total] = await queryBuilder.getManyAndCount();

    return {
      data: widgets,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<DashboardWidget> {
    const widget = await this.dashboardWidgetRepository.findOne({
      where: { id },
    });

    if (!widget) {
      throw new NotFoundException('Dashboard widget not found');
    }

    return widget;
  }

  async update(id: string, updateDashboardWidgetDto: UpdateDashboardWidgetDto): Promise<DashboardWidget> {
    const widget = await this.findOne(id);
    Object.assign(widget, updateDashboardWidgetDto);
    return await this.dashboardWidgetRepository.save(widget);
  }

  async updatePosition(id: string, updatePositionDto: UpdateWidgetPositionDto): Promise<DashboardWidget> {
    const widget = await this.findOne(id);
    Object.assign(widget, updatePositionDto);
    return await this.dashboardWidgetRepository.save(widget);
  }

  async remove(id: string): Promise<void> {
    const widget = await this.findOne(id);
    widget.isActive = false;
    await this.dashboardWidgetRepository.save(widget);
  }

  async getWidgetData(id: string, userId?: string): Promise<any> {
    const widget = await this.findOne(id);

    if (!widget.isActive || !widget.isVisible) {
      throw new NotFoundException('Widget not available');
    }

    // Apply filters from widget configuration
    const filters = widget.filters || {};

    switch (widget.dataSource) {
      case 'projects':
        return await this.getProjectData(widget, filters, userId);
      case 'tasks':
        return await this.getTaskData(widget, filters, userId);
      case 'employees':
        return await this.getEmployeeData(widget, filters);
      case 'finance':
        return await this.getFinanceData(widget, filters);
      case 'notifications':
        return await this.getNotificationData(widget, filters, userId);
      case 'system':
        return await this.getSystemData(widget, filters);
      default:
        throw new NotFoundException('Unknown data source');
    }
  }

  private async getProjectData(widget: DashboardWidget, filters: any, userId?: string): Promise<any> {
    const managerId = filters.managerId || (userId && !filters.allProjects ? userId : undefined);

    switch (widget.type) {
      case DashboardWidgetType.METRIC:
        const stats = await this.projectService.getProjectStatistics(managerId);
        return {
          totalProjects: stats.totalProjects,
          overdueProjects: stats.overdueProjects,
          averageProgress: stats.budget.averageProgress,
        };

      case DashboardWidgetType.CHART:
        const chartStats = await this.projectService.getProjectStatistics(managerId);
        if (widget.chartType === 'pie' || widget.chartType === 'doughnut') {
          return {
            labels: chartStats.statusDistribution.map(s => s.status),
            datasets: [{
              data: chartStats.statusDistribution.map(s => s.count),
              backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#6B7280', '#8B5CF6'],
            }],
          };
        }
        break;

      case DashboardWidgetType.TABLE:
        const projects = await this.projectService.getUserProjects(userId || '');
        return {
          columns: ['Name', 'Status', 'Progress', 'Due Date'],
          rows: projects.slice(0, 10).map(p => [
            p.name,
            p.status,
            `${p.progress}%`,
            p.endDate,
          ]),
        };

      default:
        return {};
    }
  }

  private async getTaskData(widget: DashboardWidget, filters: any, userId?: string): Promise<any> {
    const assignedToId = filters.assignedToId || (userId && !filters.allTasks ? userId : undefined);

    switch (widget.type) {
      case DashboardWidgetType.METRIC:
        const stats = await this.taskService.getTaskStatistics(filters.projectId, assignedToId);
        return {
          totalTasks: stats.totalTasks,
          overdueTasks: stats.overdueTasks,
          completedTasks: stats.statusDistribution.find(s => s.status === 'completed')?.count || 0,
        };

      case DashboardWidgetType.CHART:
        const chartStats = await this.taskService.getTaskStatistics(filters.projectId, assignedToId);
        return {
          labels: chartStats.statusDistribution.map(s => s.status),
          datasets: [{
            data: chartStats.statusDistribution.map(s => s.count),
            backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#6B7280'],
          }],
        };

      case DashboardWidgetType.LIST:
        const tasks = await this.taskService.getUserTasks(userId || '', 10);
        return {
          items: tasks.map(t => ({
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            dueDate: t.dueDate,
          })),
        };

      default:
        return {};
    }
  }

  private async getEmployeeData(widget: DashboardWidget, filters: any): Promise<any> {
    switch (widget.type) {
      case DashboardWidgetType.METRIC:
        // This would need to be implemented in EmployeeService
        return {
          totalEmployees: 0,
          activeEmployees: 0,
          newThisMonth: 0,
        };

      default:
        return {};
    }
  }

  private async getFinanceData(widget: DashboardWidget, filters: any): Promise<any> {
    switch (widget.type) {
      case DashboardWidgetType.METRIC:
        // This would need to be implemented in FinanceService
        return {
          totalRevenue: 0,
          totalExpenses: 0,
          netProfit: 0,
        };

      default:
        return {};
    }
  }

  private async getNotificationData(widget: DashboardWidget, filters: any, userId?: string): Promise<any> {
    switch (widget.type) {
      case DashboardWidgetType.METRIC:
        const unreadCount = await this.notificationService.getUnreadCount(userId || '');
        return {
          unreadNotifications: unreadCount,
        };

      case DashboardWidgetType.LIST:
        const notifications = await this.notificationService.getUserNotifications(userId || '', 5);
        return {
          items: notifications.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type,
            isRead: n.isRead,
            createdAt: n.createdAt,
          })),
        };

      default:
        return {};
    }
  }

  private async getSystemData(widget: DashboardWidget, filters: any): Promise<any> {
    switch (widget.type) {
      case DashboardWidgetType.METRIC:
        return {
          uptime: '99.9%',
          activeUsers: 150,
          systemLoad: '45%',
        };

      default:
        return {};
    }
  }

  async getDefaultDashboardLayout(): Promise<DashboardWidget[]> {
    return await this.dashboardWidgetRepository.find({
      where: { category: 'default', isActive: true, isVisible: true },
      order: { yPosition: 'ASC', xPosition: 'ASC' },
    });
  }

  async createDefaultWidgets(): Promise<void> {
    const defaultWidgets = [
      {
        title: 'Project Overview',
        type: DashboardWidgetType.METRIC,
        dataSource: 'projects',
        configuration: {
          metrics: ['totalProjects', 'overdueProjects', 'averageProgress'],
        },
        width: 12,
        height: 4,
        xPosition: 0,
        yPosition: 0,
        category: 'default',
      },
      {
        title: 'Project Status Distribution',
        type: DashboardWidgetType.CHART,
        chartType: 'doughnut',
        dataSource: 'projects',
        configuration: {
          showLegend: true,
          responsive: true,
        },
        width: 6,
        height: 6,
        xPosition: 0,
        yPosition: 4,
        category: 'default',
      },
      {
        title: 'Recent Tasks',
        type: DashboardWidgetType.LIST,
        dataSource: 'tasks',
        configuration: {
          maxItems: 10,
          showStatus: true,
          showPriority: true,
        },
        width: 6,
        height: 6,
        xPosition: 6,
        yPosition: 4,
        category: 'default',
      },
      {
        title: 'Task Statistics',
        type: DashboardWidgetType.METRIC,
        dataSource: 'tasks',
        configuration: {
          metrics: ['totalTasks', 'overdueTasks', 'completedTasks'],
        },
        width: 12,
        height: 4,
        xPosition: 0,
        yPosition: 10,
        category: 'default',
      },
    ];

    for (const widgetData of defaultWidgets) {
      const existingWidget = await this.dashboardWidgetRepository.findOne({
        where: { title: widgetData.title, category: widgetData.category },
      });

      if (!existingWidget) {
        const widget = this.dashboardWidgetRepository.create(widgetData as any);
        await this.dashboardWidgetRepository.save(widget);
      }
    }
  }
}
