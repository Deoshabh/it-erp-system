import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, Between, In } from 'typeorm';
import { Project, ProjectStatus } from '../entities/project.entity';
import { User } from '../../users/entities/user.entity';
import { CreateProjectDto, UpdateProjectDto, ProjectFilterDto, AddTeamMemberDto, RemoveTeamMemberDto, UpdateProjectProgressDto } from '../dto/project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    // Validate manager exists
    const manager = await this.userRepository.findOne({ where: { id: createProjectDto.managerId } });
    if (!manager) {
      throw new NotFoundException('Manager not found');
    }

    // Validate start date is before end date
    if (new Date(createProjectDto.startDate) >= new Date(createProjectDto.endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Create project
    const project = this.projectRepository.create({
      ...createProjectDto,
      manager,
    });

    // Add team members if provided
    if (createProjectDto.teamMemberIds && createProjectDto.teamMemberIds.length > 0) {
      const teamMembers = await this.userRepository.findBy({
        id: In(createProjectDto.teamMemberIds),
      });
      
      if (teamMembers.length !== createProjectDto.teamMemberIds.length) {
        throw new BadRequestException('One or more team members not found');
      }
      
      project.teamMembers = teamMembers;
    }

    return await this.projectRepository.save(project);
  }

  async findAll(filters: ProjectFilterDto) {
    const {
      search,
      status,
      priority,
      type,
      managerId,
      teamMemberId,
      clientName,
      startDateFrom,
      startDateTo,
      endDateFrom,
      endDateTo,
      budgetMin,
      budgetMax,
      isOverdue,
      includeInactive,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filters;

    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.manager', 'manager')
      .leftJoinAndSelect('project.teamMembers', 'teamMembers')
      .leftJoinAndSelect('project.tasks', 'tasks');

    // Search filter
    if (search) {
      queryBuilder.andWhere(
        '(project.name ILIKE :search OR project.description ILIKE :search OR project.clientName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Status filter
    if (status) {
      queryBuilder.andWhere('project.status = :status', { status });
    }

    // Priority filter
    if (priority) {
      queryBuilder.andWhere('project.priority = :priority', { priority });
    }

    // Type filter
    if (type) {
      queryBuilder.andWhere('project.type = :type', { type });
    }

    // Manager filter
    if (managerId) {
      queryBuilder.andWhere('project.managerId = :managerId', { managerId });
    }

    // Team member filter
    if (teamMemberId) {
      queryBuilder.andWhere('teamMembers.id = :teamMemberId', { teamMemberId });
    }

    // Client filter
    if (clientName) {
      queryBuilder.andWhere('project.clientName ILIKE :clientName', { clientName: `%${clientName}%` });
    }

    // Date filters
    if (startDateFrom) {
      queryBuilder.andWhere('project.startDate >= :startDateFrom', { startDateFrom });
    }
    if (startDateTo) {
      queryBuilder.andWhere('project.startDate <= :startDateTo', { startDateTo });
    }
    if (endDateFrom) {
      queryBuilder.andWhere('project.endDate >= :endDateFrom', { endDateFrom });
    }
    if (endDateTo) {
      queryBuilder.andWhere('project.endDate <= :endDateTo', { endDateTo });
    }

    // Budget filters
    if (budgetMin !== undefined) {
      queryBuilder.andWhere('project.budget >= :budgetMin', { budgetMin });
    }
    if (budgetMax !== undefined) {
      queryBuilder.andWhere('project.budget <= :budgetMax', { budgetMax });
    }

    // Overdue filter
    if (isOverdue) {
      const today = new Date().toISOString().split('T')[0];
      queryBuilder.andWhere('project.endDate < :today', { today });
      queryBuilder.andWhere('project.status NOT IN (:...completedStatuses)', {
        completedStatuses: [ProjectStatus.COMPLETED, ProjectStatus.CANCELLED],
      });
    }

    // Active filter
    if (!includeInactive) {
      queryBuilder.andWhere('project.isActive = true');
    }

    // Sorting
    queryBuilder.orderBy(`project.${sortBy}`, sortOrder);

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [projects, total] = await queryBuilder.getManyAndCount();

    return {
      data: projects,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['manager', 'teamMembers', 'tasks', 'tasks.assignedTo'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id);

    // Validate manager if provided
    if (updateProjectDto.managerId) {
      const manager = await this.userRepository.findOne({ where: { id: updateProjectDto.managerId } });
      if (!manager) {
        throw new NotFoundException('Manager not found');
      }
      project.manager = manager;
    }

    // Validate dates if provided
    const startDate = updateProjectDto.startDate ? new Date(updateProjectDto.startDate) : project.startDate;
    const endDate = updateProjectDto.endDate ? new Date(updateProjectDto.endDate) : project.endDate;
    
    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Update team members if provided
    if (updateProjectDto.teamMemberIds) {
      const teamMembers = await this.userRepository.findBy({
        id: In(updateProjectDto.teamMemberIds),
      });
      
      if (teamMembers.length !== updateProjectDto.teamMemberIds.length) {
        throw new BadRequestException('One or more team members not found');
      }
      
      project.teamMembers = teamMembers;
    }

    // Apply updates
    Object.assign(project, updateProjectDto);
    
    return await this.projectRepository.save(project);
  }

  async remove(id: string): Promise<void> {
    const project = await this.findOne(id);
    project.isActive = false;
    await this.projectRepository.save(project);
  }

  async addTeamMember(projectId: string, addTeamMemberDto: AddTeamMemberDto): Promise<Project> {
    const project = await this.findOne(projectId);
    const user = await this.userRepository.findOne({ where: { id: addTeamMemberDto.userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already a team member
    const isAlreadyMember = project.teamMembers.some(member => member.id === user.id);
    if (isAlreadyMember) {
      throw new BadRequestException('User is already a team member');
    }

    project.teamMembers.push(user);
    return await this.projectRepository.save(project);
  }

  async removeTeamMember(projectId: string, removeTeamMemberDto: RemoveTeamMemberDto): Promise<Project> {
    const project = await this.findOne(projectId);
    
    // Check if user is a team member
    const memberIndex = project.teamMembers.findIndex(member => member.id === removeTeamMemberDto.userId);
    if (memberIndex === -1) {
      throw new BadRequestException('User is not a team member');
    }

    project.teamMembers.splice(memberIndex, 1);
    return await this.projectRepository.save(project);
  }

  async updateProgress(projectId: string, updateProgressDto: UpdateProjectProgressDto): Promise<Project> {
    const project = await this.findOne(projectId);
    
    project.progress = updateProgressDto.progress;
    if (updateProgressDto.notes) {
      project.notes = updateProgressDto.notes;
    }

    // Auto-update status based on progress
    if (updateProgressDto.progress === 100 && project.status !== ProjectStatus.COMPLETED) {
      project.status = ProjectStatus.COMPLETED;
      project.actualEndDate = new Date();
    } else if (updateProgressDto.progress > 0 && project.status === ProjectStatus.PLANNING) {
      project.status = ProjectStatus.IN_PROGRESS;
      project.actualStartDate = new Date();
    }

    return await this.projectRepository.save(project);
  }

  async getProjectStatistics(managerId?: string) {
    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .where('project.isActive = true');

    if (managerId) {
      queryBuilder.andWhere('project.managerId = :managerId', { managerId });
    }

    const totalProjects = await queryBuilder.getCount();

    const statusStats = await queryBuilder
      .select('project.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('project.status')
      .getRawMany();

    const priorityStats = await queryBuilder
      .select('project.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .groupBy('project.priority')
      .getRawMany();

    // Create a fresh query builder for budget stats
    const budgetQueryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .where('project.isActive = true');

    if (managerId) {
      budgetQueryBuilder.andWhere('project.managerId = :managerId', { managerId });
    }

    const budgetStats = await budgetQueryBuilder
      .select('SUM(project.budget)', 'totalBudget')
      .addSelect('SUM(project.actualCost)', 'totalActualCost')
      .addSelect('AVG(project.progress)', 'averageProgress')
      .getRawOne();

    // Overdue projects - create fresh query builder
    const today = new Date().toISOString().split('T')[0];
    const overdueQueryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .where('project.isActive = true');

    if (managerId) {
      overdueQueryBuilder.andWhere('project.managerId = :managerId', { managerId });
    }

    const overdueCount = await overdueQueryBuilder
      .andWhere('project.endDate < :today', { today })
      .andWhere('project.status NOT IN (:...completedStatuses)', {
        completedStatuses: [ProjectStatus.COMPLETED, ProjectStatus.CANCELLED],
      })
      .getCount();

    return {
      totalProjects,
      overdueProjects: overdueCount,
      statusDistribution: statusStats.map(stat => ({
        status: stat.status,
        count: parseInt(stat.count),
      })),
      priorityDistribution: priorityStats.map(stat => ({
        priority: stat.priority,
        count: parseInt(stat.count),
      })),
      budget: {
        totalBudget: budgetStats ? parseFloat(budgetStats.totalBudget) || 0 : 0,
        totalActualCost: budgetStats ? parseFloat(budgetStats.totalActualCost) || 0 : 0,
        averageProgress: budgetStats ? parseFloat(budgetStats.averageProgress) || 0 : 0,
      },
    };
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return await this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.manager', 'manager')
      .leftJoinAndSelect('project.teamMembers', 'teamMembers')
      .where('project.managerId = :userId OR teamMembers.id = :userId', { userId })
      .andWhere('project.isActive = true')
      .orderBy('project.updatedAt', 'DESC')
      .getMany();
  }
}
