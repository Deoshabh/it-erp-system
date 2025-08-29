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
import { ProjectService } from '../services/project.service';
import { CreateProjectDto, UpdateProjectDto, ProjectFilterDto, AddTeamMemberDto, RemoveTeamMemberDto, UpdateProjectProgressDto } from '../dto/project.dto';
import { Project, ProjectStatus, ProjectPriority, ProjectType } from '../entities/project.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Project created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async create(@Body() createProjectDto: CreateProjectDto): Promise<Project> {
    return await this.projectService.create(createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in name, description, client name' })
  @ApiQuery({ name: 'status', required: false, enum: ProjectStatus, description: 'Filter by status' })
  @ApiQuery({ name: 'priority', required: false, enum: ProjectPriority, description: 'Filter by priority' })
  @ApiQuery({ name: 'type', required: false, enum: ProjectType, description: 'Filter by type' })
  @ApiQuery({ name: 'managerId', required: false, description: 'Filter by manager ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Projects retrieved successfully' })
  async findAll(@Query() filters: ProjectFilterDto, @Request() req) {
    // Non-admin users can only see projects they manage or are team members of
    if (req.user.role !== UserRole.ADMIN) {
      // This will be handled in the service layer by filtering
    }
    return await this.projectService.findAll(filters);
  }

  @Get('my-projects')
  @ApiOperation({ summary: 'Get current user projects' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User projects retrieved successfully' })
  async getUserProjects(@Request() req): Promise<Project[]> {
    return await this.projectService.getUserProjects(req.user.sub);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get project statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Project statistics retrieved successfully' })
  async getStatistics(@Request() req) {
    // Non-admin users can only see statistics for their own projects
    const managerId = req.user.role === UserRole.ADMIN ? undefined : req.user.sub;
    return await this.projectService.getProjectStatistics(managerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Project retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Project> {
    return await this.projectService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Project updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto
  ): Promise<Project> {
    return await this.projectService.update(id, updateProjectDto);
  }

  @Patch(':id/progress')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Update project progress' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Project progress updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  async updateProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProgressDto: UpdateProjectProgressDto
  ): Promise<Project> {
    return await this.projectService.updateProgress(id, updateProgressDto);
  }

  @Post(':id/team-members')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Add team member to project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Team member added successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project or user not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'User is already a team member' })
  async addTeamMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addTeamMemberDto: AddTeamMemberDto
  ): Promise<Project> {
    return await this.projectService.addTeamMember(id, addTeamMemberDto);
  }

  @Delete(':id/team-members')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Remove team member from project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Team member removed successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'User is not a team member' })
  async removeTeamMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() removeTeamMemberDto: RemoveTeamMemberDto
  ): Promise<Project> {
    return await this.projectService.removeTeamMember(id, removeTeamMemberDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete project (soft delete)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Project deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.projectService.remove(id);
    return { message: 'Project deleted successfully' };
  }
}
