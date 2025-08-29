import { apiClient } from './apiClient';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate?: string;
  endDate?: string;
  budget?: number;
  progress: number;
  managerId: string;
  clientId?: string;
  teamMembers?: any[];
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  projectId: string;
  assigneeId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  priority: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  clientId?: string;
  teamMemberIds?: string[];
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority: string;
  dueDate?: string;
  estimatedHours?: number;
  projectId: string;
  assigneeId?: string;
}

export interface ProjectStatistics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
  totalTasks: number;
  completedTasks: number;
  averageProjectCompletion: number;
  projectsByStatus: Array<{
    status: string;
    count: number;
  }>;
  tasksByStatus: Array<{
    status: string;
    count: number;
  }>;
}

export const projectService = {
  // Projects
  async getProjects() {
    const response = await apiClient.get<Project[]>('/projects');
    return response.data;
  },

  async getProjectById(id: string) {
    const response = await apiClient.get<Project>(`/projects/${id}`);
    return response.data;
  },

  async createProject(data: CreateProjectDto) {
    const response = await apiClient.post<Project>('/projects', data);
    return response.data;
  },

  async updateProject(id: string, data: Partial<CreateProjectDto>) {
    const response = await apiClient.put<Project>(`/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id: string) {
    await apiClient.delete(`/projects/${id}`);
  },

  async getProjectTasks(projectId: string) {
    const response = await apiClient.get<Task[]>(`/projects/${projectId}/tasks`);
    return response.data;
  },

  async addTeamMember(projectId: string, userId: string) {
    const response = await apiClient.post(`/projects/${projectId}/team-members`, { userId });
    return response.data;
  },

  async removeTeamMember(projectId: string, userId: string) {
    await apiClient.delete(`/projects/${projectId}/team-members/${userId}`);
  },

  async updateProjectProgress(projectId: string, progress: number) {
    const response = await apiClient.patch(`/projects/${projectId}/progress`, { progress });
    return response.data;
  },

  // Tasks
  async getTasks() {
    const response = await apiClient.get<Task[]>('/projects/tasks');
    return response.data;
  },

  async getTaskById(id: string) {
    const response = await apiClient.get<Task>(`/projects/tasks/${id}`);
    return response.data;
  },

  async createTask(data: CreateTaskDto) {
    const response = await apiClient.post<Task>('/projects/tasks', data);
    return response.data;
  },

  async updateTask(id: string, data: Partial<CreateTaskDto>) {
    const response = await apiClient.put<Task>(`/projects/tasks/${id}`, data);
    return response.data;
  },

  async deleteTask(id: string) {
    await apiClient.delete(`/projects/tasks/${id}`);
  },

  async updateTaskStatus(id: string, status: string) {
    const response = await apiClient.patch(`/projects/tasks/${id}/status`, { status });
    return response.data;
  },

  async logTaskTime(id: string, hours: number) {
    const response = await apiClient.post(`/projects/tasks/${id}/time-log`, { hours });
    return response.data;
  },

  // Statistics
  async getProjectStatistics() {
    const response = await apiClient.get<ProjectStatistics>('/projects/statistics');
    return response.data;
  },

  async getMyTasks() {
    const response = await apiClient.get<Task[]>('/projects/my-tasks');
    return response.data;
  },

  async getMyProjects() {
    const response = await apiClient.get<Project[]>('/projects/my-projects');
    return response.data;
  },

  async getProjectTimeline(projectId: string) {
    const response = await apiClient.get(`/projects/${projectId}/timeline`);
    return response.data;
  }
};
