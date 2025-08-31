import { apiClient } from './apiClient';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'employee' | 'hr' | 'finance' | 'guest';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  department: string;
  designation?: string;
  phone?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: User['role'];
  status?: User['status'];
  department: string;
  designation?: string;
  phone?: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  role?: User['role'];
  status?: User['status'];
  department?: string;
  designation?: string;
  phone?: string;
}

export interface UserSearchFilters {
  search?: string;
  role?: string;
  status?: string;
  department?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserStatistics {
  total: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  roleDistribution: Array<{ role: string; count: number }>;
  departmentDistribution: Array<{ department: string; count: number }>;
}

class UsersService {
  private baseUrl = '/users';

  async getAll(): Promise<User[]> {
    try {
      const response = await apiClient.get(this.baseUrl);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async searchUsers(filters: UserSearchFilters): Promise<PaginatedUsers> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`${this.baseUrl}/search?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<User> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async create(userData: CreateUserDto): Promise<User> {
    try {
      const response = await apiClient.post(this.baseUrl, userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async update(id: string, userData: UpdateUserDto): Promise<User> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async bulkDelete(ids: string[]): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/bulk`, { data: { ids } });
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      throw error;
    }
  }

  async bulkUpdateStatus(ids: string[], status: User['status']): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/bulk/status`, { ids, status });
    } catch (error) {
      console.error('Error bulk updating user status:', error);
      throw error;
    }
  }

  async getStatistics(): Promise<UserStatistics> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw error;
    }
  }

  async getCount(): Promise<number> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/count`);
      return response.data.count;
    } catch (error) {
      console.error('Error fetching user count:', error);
      throw error;
    }
  }

  async getDepartments(): Promise<Array<{ value: string; label: string }>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/departments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  }

  async getDesignations(): Promise<Array<{ value: string; label: string }>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/designations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching designations:', error);
      throw error;
    }
  }

  async getDesignationsByDepartment(department: string): Promise<Array<{ value: string; label: string }>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/designations/${department}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching designations by department:', error);
      throw error;
    }
  }
}

export const usersService = new UsersService();
export default usersService;
