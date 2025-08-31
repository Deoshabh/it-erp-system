import { apiClient } from './apiClient';

export interface Employee {
  id: string;
  empId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: number;
  status: 'active' | 'inactive' | 'terminated' | 'on_leave' | 'suspended';
  employmentType: 'full_time' | 'part_time' | 'contract' | 'intern' | 'consultant';
  joiningDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeDto {
  empId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: number;
  status?: Employee['status'];
  employmentType?: Employee['employmentType'];
  joiningDate: string;
}

export interface UpdateEmployeeDto {
  empId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  department?: string;
  designation?: string;
  salary?: number;
  status?: Employee['status'];
  employmentType?: Employee['employmentType'];
  joiningDate?: string;
}

export interface EmployeeSearchFilters {
  search?: string;
  department?: string;
  designation?: string;
  status?: string;
  employmentType?: string;
  salaryMin?: number;
  salaryMax?: number;
  joiningDateFrom?: string;
  joiningDateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedEmployees {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EmployeeStatistics {
  total: number;
  active: number;
  inactive: number;
  totalSalaryBudget: number;
  averageSalary: number;
  departmentDistribution: Array<{ department: string; count: number; totalSalary: number }>;
  designationDistribution: Array<{ designation: string; count: number; avgSalary: number }>;
  employmentTypeDistribution: Array<{ type: string; count: number }>;
  recentJoinings: Employee[];
}

class EmployeeService {
  private baseUrl = '/employees';

  async getAll(): Promise<Employee[]> {
    try {
      const response = await apiClient.get(this.baseUrl);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  async searchEmployees(filters: EmployeeSearchFilters): Promise<PaginatedEmployees> {
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
      console.error('Error searching employees:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Employee> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  }

  async create(employeeData: CreateEmployeeDto): Promise<Employee> {
    try {
      const response = await apiClient.post(this.baseUrl, employeeData);
      return response.data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  async update(id: string, employeeData: UpdateEmployeeDto): Promise<Employee> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${id}`, employeeData);
      return response.data;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }

  async bulkDelete(ids: string[]): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/bulk`, { data: { ids } });
    } catch (error) {
      console.error('Error bulk deleting employees:', error);
      throw error;
    }
  }

  async bulkUpdateStatus(ids: string[], status: Employee['status']): Promise<void> {
    try {
      await apiClient.patch(`${this.baseUrl}/bulk/status`, { ids, status });
    } catch (error) {
      console.error('Error bulk updating employee status:', error);
      throw error;
    }
  }

  async getStatistics(): Promise<EmployeeStatistics> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee statistics:', error);
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

  async getSalaryRange(): Promise<{ min: number; max: number }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/salary-range`);
      return response.data;
    } catch (error) {
      console.error('Error fetching salary range:', error);
      throw error;
    }
  }
}

export const employeeService = new EmployeeService();
export default employeeService;
