import { apiClient } from './apiClient';

export interface Employee {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  salary: number;
  department: string;
  startDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Mock data for demo purposes (remove when backend is connected)
let mockEmployees: Employee[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    position: 'Software Engineer',
    salary: 85000,
    department: 'Engineering',
    startDate: '2023-01-15',
    createdAt: '2023-01-15T00:00:00Z'
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@company.com',
    position: 'Product Manager',
    salary: 95000,
    department: 'Product',
    startDate: '2022-11-01',
    createdAt: '2022-11-01T00:00:00Z'
  },
  {
    id: 3,
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael.johnson@company.com',
    position: 'Designer',
    salary: 75000,
    department: 'Design',
    startDate: '2023-03-10',
    createdAt: '2023-03-10T00:00:00Z'
  }
];

class EmployeeService {
  private baseUrl = '/api/v1/employees';
  private useMockData = true; // Set to false when backend is ready

  async getAll(): Promise<Employee[]> {
    if (this.useMockData) {
      return Promise.resolve([...mockEmployees]);
    }

    try {
      const response = await apiClient.get(this.baseUrl);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  }

  async create(employee: Omit<Employee, 'id'>): Promise<Employee> {
    if (this.useMockData) {
      const newEmployee: Employee = {
        ...employee,
        id: Math.max(...mockEmployees.map(e => e.id || 0)) + 1,
        createdAt: new Date().toISOString(),
        startDate: new Date().toISOString().split('T')[0]
      };
      mockEmployees.push(newEmployee);
      return Promise.resolve(newEmployee);
    }

    const response = await apiClient.post(this.baseUrl, employee);
    return response.data;
  }

  async update(id: number, employee: Partial<Employee>): Promise<Employee> {
    if (this.useMockData) {
      const index = mockEmployees.findIndex(e => e.id === id);
      if (index !== -1) {
        mockEmployees[index] = { ...mockEmployees[index], ...employee };
        return Promise.resolve(mockEmployees[index]);
      }
      throw new Error('Employee not found');
    }

    const response = await apiClient.patch(`${this.baseUrl}/${id}`, employee);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    if (this.useMockData) {
      const index = mockEmployees.findIndex(e => e.id === id);
      if (index !== -1) {
        mockEmployees.splice(index, 1);
      }
      return Promise.resolve();
    }

    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async getById(id: number): Promise<Employee> {
    if (this.useMockData) {
      const employee = mockEmployees.find(e => e.id === id);
      if (!employee) {
        throw new Error('Employee not found');
      }
      return Promise.resolve(employee);
    }

    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async search(searchTerm?: string, department?: string): Promise<Employee[]> {
    if (this.useMockData) {
      let filtered = [...mockEmployees];
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(e => 
          e.firstName.toLowerCase().includes(term) ||
          e.lastName.toLowerCase().includes(term) ||
          e.email.toLowerCase().includes(term) ||
          e.position.toLowerCase().includes(term)
        );
      }
      
      if (department) {
        filtered = filtered.filter(e => e.department.toLowerCase() === department.toLowerCase());
      }
      
      return Promise.resolve(filtered);
    }

    const params = new URLSearchParams();
    if (searchTerm) params.append('term', searchTerm);
    if (department) params.append('department', department);
    
    try {
      const response = await apiClient.get(`${this.baseUrl}/search?${params.toString()}`);
      return response.data || [];
    } catch (error) {
      console.error('Error searching employees:', error);
      return [];
    }
  }

  async getDepartmentAnalytics(): Promise<any[]> {
    if (this.useMockData) {
      const departments = Array.from(new Set(mockEmployees.map(e => e.department)));
      const analytics = departments.map(dept => ({
        department: dept,
        count: mockEmployees.filter(e => e.department === dept).length,
        avgSalary: mockEmployees
          .filter(e => e.department === dept)
          .reduce((sum, e) => sum + e.salary, 0) / 
          mockEmployees.filter(e => e.department === dept).length
      }));
      return Promise.resolve(analytics);
    }

    try {
      const response = await apiClient.get(`${this.baseUrl}/analytics/by-department`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching department analytics:', error);
      return [];
    }
  }
}

export const employeeService = new EmployeeService();
