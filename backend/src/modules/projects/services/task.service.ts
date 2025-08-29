import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, Between } from 'typeorm';
import { Task, TaskStatus } from '../entities/task.entity';
import { Project } from '../entities/project.entity';
import { User } from '../../users/entities/user.entity';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto } from '../dto/task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    // Validate project exists
    const project = await this.projectRepository.findOne({ where: { id: createTaskDto.projectId } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Validate creator exists
    const creator = await this.userRepository.findOne({ where: { id: createTaskDto.createdById } });
    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    // Validate assignee if provided
    let assignedTo = null;
    if (createTaskDto.assignedToId) {
      assignedTo = await this.userRepository.findOne({ where: { id: createTaskDto.assignedToId } });
      if (!assignedTo) {
        throw new NotFoundException('Assigned user not found');
      }
    }

    // Validate dates
    if (createTaskDto.startDate && createTaskDto.dueDate) {
      if (new Date(createTaskDto.startDate) >= new Date(createTaskDto.dueDate)) {
        throw new BadRequestException('Start date must be before due date');
      }
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      project,
      createdBy: creator,
      assignedTo,
    });

    return await this.taskRepository.save(task);
  }

  async findAll(filters: TaskFilterDto) {
    const {
      search,
      status,
      priority,
      projectId,
      assignedToId,
      createdById,
      dueDateFrom,
      dueDateTo,
      isOverdue,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filters;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .where('task.isActive = true');

    // Search filter
    if (search) {
      queryBuilder.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Status filter
    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    // Priority filter
    if (priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority });
    }

    // Project filter
    if (projectId) {
      queryBuilder.andWhere('task.projectId = :projectId', { projectId });
    }

    // Assigned user filter
    if (assignedToId) {
      queryBuilder.andWhere('task.assignedToId = :assignedToId', { assignedToId });
    }

    // Creator filter
    if (createdById) {
      queryBuilder.andWhere('task.createdById = :createdById', { createdById });
    }

    // Due date filters
    if (dueDateFrom) {
      queryBuilder.andWhere('task.dueDate >= :dueDateFrom', { dueDateFrom });
    }
    if (dueDateTo) {
      queryBuilder.andWhere('task.dueDate <= :dueDateTo', { dueDateTo });
    }

    // Overdue filter
    if (isOverdue) {
      const today = new Date().toISOString().split('T')[0];
      queryBuilder.andWhere('task.dueDate < :today', { today });
      queryBuilder.andWhere('task.status NOT IN (:...completedStatuses)', {
        completedStatuses: [TaskStatus.COMPLETED, TaskStatus.CANCELLED],
      });
    }

    // Sorting
    queryBuilder.orderBy(`task.${sortBy}`, sortOrder);

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [tasks, total] = await queryBuilder.getManyAndCount();

    return {
      data: tasks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['project', 'assignedTo', 'createdBy'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    // Validate project if provided
    if (updateTaskDto.projectId) {
      const project = await this.projectRepository.findOne({ where: { id: updateTaskDto.projectId } });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
      task.project = project;
    }

    // Validate assignee if provided
    if (updateTaskDto.assignedToId) {
      const assignedTo = await this.userRepository.findOne({ where: { id: updateTaskDto.assignedToId } });
      if (!assignedTo) {
        throw new NotFoundException('Assigned user not found');
      }
      task.assignedTo = assignedTo;
    }

    // Validate dates
    const startDate = updateTaskDto.startDate ? new Date(updateTaskDto.startDate) : task.startDate;
    const dueDate = updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : task.dueDate;
    
    if (startDate && dueDate && startDate >= dueDate) {
      throw new BadRequestException('Start date must be before due date');
    }

    // Auto-update completion date if status is completed
    if (updateTaskDto.status === TaskStatus.COMPLETED && task.status !== TaskStatus.COMPLETED) {
      task.completedDate = new Date();
    }

    // Apply updates
    Object.assign(task, updateTaskDto);
    
    return await this.taskRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    task.isActive = false;
    await this.taskRepository.save(task);
  }

  async getTaskStatistics(projectId?: string, assignedToId?: string) {
    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .where('task.isActive = true');

    if (projectId) {
      queryBuilder.andWhere('task.projectId = :projectId', { projectId });
    }

    if (assignedToId) {
      queryBuilder.andWhere('task.assignedToId = :assignedToId', { assignedToId });
    }

    const totalTasks = await queryBuilder.getCount();

    const statusStats = await queryBuilder
      .select('task.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('task.status')
      .getRawMany();

    const priorityStats = await queryBuilder
      .select('task.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .groupBy('task.priority')
      .getRawMany();

    const timeStats = await queryBuilder
      .select('SUM(task.estimatedHours)', 'totalEstimatedHours')
      .addSelect('SUM(task.actualHours)', 'totalActualHours')
      .addSelect('AVG(task.estimatedHours)', 'averageEstimatedHours')
      .addSelect('AVG(task.actualHours)', 'averageActualHours')
      .getRawOne();

    // Overdue tasks
    const today = new Date().toISOString().split('T')[0];
    const overdueCount = await queryBuilder
      .andWhere('task.dueDate < :today', { today })
      .andWhere('task.status NOT IN (:...completedStatuses)', {
        completedStatuses: [TaskStatus.COMPLETED, TaskStatus.CANCELLED],
      })
      .getCount();

    return {
      totalTasks,
      overdueTasks: overdueCount,
      statusDistribution: statusStats.map(stat => ({
        status: stat.status,
        count: parseInt(stat.count),
      })),
      priorityDistribution: priorityStats.map(stat => ({
        priority: stat.priority,
        count: parseInt(stat.count),
      })),
      timeTracking: {
        totalEstimatedHours: parseFloat(timeStats.totalEstimatedHours) || 0,
        totalActualHours: parseFloat(timeStats.totalActualHours) || 0,
        averageEstimatedHours: parseFloat(timeStats.averageEstimatedHours) || 0,
        averageActualHours: parseFloat(timeStats.averageActualHours) || 0,
      },
    };
  }

  async getUserTasks(userId: string, limit?: number): Promise<Task[]> {
    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .where('task.assignedToId = :userId', { userId })
      .andWhere('task.isActive = true')
      .orderBy('task.dueDate', 'ASC')
      .addOrderBy('task.priority', 'DESC');

    if (limit) {
      queryBuilder.take(limit);
    }

    return await queryBuilder.getMany();
  }

  async getProjectTasks(projectId: string): Promise<Task[]> {
    return await this.taskRepository.find({
      where: { projectId, isActive: true },
      relations: ['assignedTo', 'createdBy'],
      order: { createdAt: 'DESC' },
    });
  }
}
