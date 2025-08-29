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
import { TaskService } from '../services/task.service';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto } from '../dto/task.dto';
import { Task, TaskStatus, TaskPriority } from '../entities/task.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Task created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req): Promise<Task> {
    // Set creator to current user if not provided
    if (!createTaskDto.createdById) {
      createTaskDto.createdById = req.user.sub;
    }
    return await this.taskService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in title, description' })
  @ApiQuery({ name: 'status', required: false, enum: TaskStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'priority', required: false, enum: TaskPriority, description: 'Filter by priority' })
  @ApiQuery({ name: 'projectId', required: false, description: 'Filter by project ID' })
  @ApiQuery({ name: 'assignedToId', required: false, description: 'Filter by assigned user ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tasks retrieved successfully' })
  async findAll(@Query() filters: TaskFilterDto, @Request() req) {
    // Non-admin users can only see tasks assigned to them or created by them
    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.MANAGER) {
      if (!filters.assignedToId && !filters.createdById) {
        filters.assignedToId = req.user.sub;
      }
    }
    return await this.taskService.findAll(filters);
  }

  @Get('my-tasks')
  @ApiOperation({ summary: 'Get current user tasks' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of tasks to retrieve' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User tasks retrieved successfully' })
  async getUserTasks(
    @Request() req,
    @Query('limit') limit?: number
  ): Promise<Task[]> {
    return await this.taskService.getUserTasks(req.user.sub, limit);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get task statistics' })
  @ApiQuery({ name: 'projectId', required: false, description: 'Filter by project ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Task statistics retrieved successfully' })
  async getStatistics(
    @Request() req,
    @Query('projectId') projectId?: string
  ) {
    // Non-admin users can only see statistics for their own tasks
    const assignedToId = req.user.role === UserRole.ADMIN ? undefined : req.user.sub;
    return await this.taskService.getTaskStatistics(projectId, assignedToId);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get tasks by project ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Project tasks retrieved successfully' })
  async getProjectTasks(@Param('projectId', ParseUUIDPipe) projectId: string): Promise<Task[]> {
    return await this.taskService.getProjectTasks(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Task retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Task not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Task> {
    return await this.taskService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Update task' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Task updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Task not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto
  ): Promise<Task> {
    return await this.taskService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete task (soft delete)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Task deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Task not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.taskService.remove(id);
    return { message: 'Task deleted successfully' };
  }
}
