import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import RoleBasedComponent from '../components/auth/RoleBasedComponent';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/currency';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  FunnelIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { CurrencyRupeeIcon } from '@heroicons/react/24/outline';

interface Employee {
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

interface SearchFilters {
  search: string;
  department: string;
  designation: string;
  status: string;
  employmentType: string;
  salaryMin: string;
  salaryMax: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

const EmployeesPage: React.FC = () => {
  return (
    <ProtectedRoute resource="employees" action="read">
      <Layout>
        <EmployeesContent />
      </Layout>
    </ProtectedRoute>
  );
};

const EmployeesContent: React.FC = () => {
  const { user, canAccess } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    department: '',
    designation: '',
    status: '',
    employmentType: '',
    salaryMin: '',
    salaryMax: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
  });

  const [newEmployee, setNewEmployee] = useState({
    empId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    salary: '',
    status: 'active' as Employee['status'],
    employmentType: 'full_time' as Employee['employmentType'],
    joiningDate: '',
  });

  // Mock API Functions (replace with actual API calls)
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data with INR salaries
      let mockData = [
        {
          id: '1',
          empId: 'EMP001',
          firstName: 'Rajesh',
          lastName: 'Kumar',
          email: 'rajesh.kumar@company.com',
          phone: '9876543210',
          department: 'Engineering',
          designation: 'Senior Software Engineer',
          salary: 1200000,
          status: 'active' as const,
          employmentType: 'full_time' as const,
          joiningDate: '2023-01-15',
          createdAt: '2023-01-15T00:00:00Z',
          updatedAt: '2023-01-15T00:00:00Z',
        },
        {
          id: '2',
          empId: 'EMP002',
          firstName: 'Priya',
          lastName: 'Sharma',
          email: 'priya.sharma@company.com',
          phone: '9876543211',
          department: 'HR',
          designation: 'HR Manager',
          salary: 800000,
          status: 'active' as const,
          employmentType: 'full_time' as const,
          joiningDate: '2023-02-01',
          createdAt: '2023-02-01T00:00:00Z',
          updatedAt: '2023-02-01T00:00:00Z',
        },
        {
          id: '3',
          empId: 'EMP003',
          firstName: 'Amit',
          lastName: 'Patel',
          email: 'amit.patel@company.com',
          phone: '9876543212',
          department: 'Finance',
          designation: 'Financial Analyst',
          salary: 700000,
          status: 'active' as const,
          employmentType: 'full_time' as const,
          joiningDate: '2023-03-01',
          createdAt: '2023-03-01T00:00:00Z',
          updatedAt: '2023-03-01T00:00:00Z',
        },
        {
          id: '4',
          empId: 'EMP004',
          firstName: 'Sunita',
          lastName: 'Singh',
          email: 'sunita.singh@company.com',
          phone: '9876543213',
          department: 'Marketing',
          designation: 'Marketing Executive',
          salary: 600000,
          status: 'on_leave' as const,
          employmentType: 'full_time' as const,
          joiningDate: '2023-04-01',
          createdAt: '2023-04-01T00:00:00Z',
          updatedAt: '2023-04-01T00:00:00Z',
        },
        {
          id: '5',
          empId: 'EMP005',
          firstName: 'Vikash',
          lastName: 'Gupta',
          email: 'vikash.gupta@company.com',
          phone: '9876543214',
          department: 'Operations',
          designation: 'Operations Manager',
          salary: 900000,
          status: 'active' as const,
          employmentType: 'contract' as const,
          joiningDate: '2023-05-01',
          createdAt: '2023-05-01T00:00:00Z',
          updatedAt: '2023-05-01T00:00:00Z',
        },
        {
          id: '6',
          empId: 'EMP006',
          firstName: 'Anna',
          lastName: 'Rodriguez',
          email: 'employee@company.com',
          phone: '9876543215',
          department: 'Marketing',
          designation: 'Marketing Specialist',
          salary: 500000,
          status: 'active' as const,
          employmentType: 'full_time' as const,
          joiningDate: '2023-06-01',
          createdAt: '2023-06-01T00:00:00Z',
          updatedAt: '2023-06-01T00:00:00Z',
        }
      ];

      // Role-based filtering: Employees can only see themselves
      if (user?.role === 'employee') {
        mockData = mockData.filter(emp => emp.email === user.email);
      }
      
      // Managers can only see employees in their department
      if (user?.role === 'manager') {
        mockData = mockData.filter(emp => emp.department === user.department);
      }

      // Apply filters
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        mockData = mockData.filter(emp => 
          emp.firstName.toLowerCase().includes(searchTerm) ||
          emp.lastName.toLowerCase().includes(searchTerm) ||
          emp.email.toLowerCase().includes(searchTerm) ||
          emp.empId.toLowerCase().includes(searchTerm) ||
          emp.department.toLowerCase().includes(searchTerm) ||
          emp.designation.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.department) {
        mockData = mockData.filter(emp => emp.department === filters.department);
      }

      if (filters.status) {
        mockData = mockData.filter(emp => emp.status === filters.status);
      }

      if (filters.employmentType) {
        mockData = mockData.filter(emp => emp.employmentType === filters.employmentType);
      }

      if (filters.salaryMin) {
        mockData = mockData.filter(emp => emp.salary >= parseFloat(filters.salaryMin));
      }

      if (filters.salaryMax) {
        mockData = mockData.filter(emp => emp.salary <= parseFloat(filters.salaryMax));
      }

      // Apply sorting
      mockData.sort((a, b) => {
        const aValue = a[filters.sortBy as keyof Employee];
        const bValue = b[filters.sortBy as keyof Employee];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return filters.sortOrder === 'ASC' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return filters.sortOrder === 'ASC' ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
      });

      setEmployees(mockData);
      setPagination({
        total: mockData.length,
        totalPages: Math.ceil(mockData.length / filters.limit),
        currentPage: filters.page,
      });
    } catch (err) {
      setError('Failed to fetch employees');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const employee: Employee = {
        id: Date.now().toString(),
        ...newEmployee,
        salary: parseFloat(newEmployee.salary) || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setEmployees(prev => [employee, ...prev]);
      setShowCreateForm(false);
      setNewEmployee({
        empId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        salary: '',
        status: 'active' as Employee['status'],
        employmentType: 'full_time' as Employee['employmentType'],
        joiningDate: '',
      });
    } catch (err) {
      setError('Failed to create employee');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    } catch (err) {
      setError('Failed to delete employee');
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setNewEmployee({
      empId: employee.empId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      designation: employee.designation,
      salary: employee.salary.toString(),
      status: employee.status,
      employmentType: employee.employmentType,
      joiningDate: employee.joiningDate,
    });
    setShowEditForm(true);
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      const updatedEmployee: Employee = {
        ...selectedEmployee,
        ...newEmployee,
        salary: parseFloat(newEmployee.salary) || 0,
        updatedAt: new Date().toISOString(),
      };

      setEmployees(prev => prev.map(emp => 
        emp.id === selectedEmployee.id ? updatedEmployee : emp
      ));
      
      setShowEditForm(false);
      setSelectedEmployee(null);
      setNewEmployee({
        empId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        salary: '',
        status: 'active' as Employee['status'],
        employmentType: 'full_time' as Employee['employmentType'],
        joiningDate: '',
      });
    } catch (err) {
      setError('Failed to update employee');
    }
  };

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : (typeof value === 'number' ? value : parseInt(value) || 1),
    }));
  };

  const handleSelectEmployee = (id: string) => {
    setSelectedEmployees(prev => 
      prev.includes(id) 
        ? prev.filter(empId => empId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp.id));
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmploymentTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'full_time': return 'bg-blue-100 text-blue-800';
      case 'part_time': return 'bg-purple-100 text-purple-800';
      case 'contract': return 'bg-indigo-100 text-indigo-800';
      case 'intern': return 'bg-cyan-100 text-cyan-800';
      case 'consultant': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && employees.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
              <p className="text-gray-600 mt-2">
                {user?.role === 'employee' 
                  ? 'View your employee profile and information' 
                  : 'Manage your company\'s employee database with advanced search and analytics'
                }
              </p>
            </div>
            <RoleBasedComponent requiredResource="employees" requiredAction="create">
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                Add Employee
              </button>
            </RoleBasedComponent>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Employees</p>
                  <p className="text-2xl font-bold text-blue-900">{employees.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Active Employees</p>
                  <p className="text-2xl font-bold text-green-900">{employees.filter(e => e.status === 'active').length}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Salary Budget</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(employees.reduce((sum, emp) => sum + emp.salary, 0))}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <CurrencyRupeeIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Average Salary</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {formatCurrency(employees.length > 0 ? employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length : 0)}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <RoleBasedComponent 
          requiredResource="employees" 
          requiredAction="read"
          fallback={user?.role === 'employee' ? null : undefined}
        >
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, employee ID, email, phone, designation..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FunnelIcon className="h-5 w-5" />
                Filters
              </button>
            </div>
          </div>
        </RoleBasedComponent>

        {/* Show simple profile card for employees */}
        {user?.role === 'employee' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Profile</h3>
            <p className="text-sm text-gray-600">
              As an employee, you can view your own profile information below.
            </p>
          </div>
        )}

        {/* Employee Table */}
        <div className="bg-white shadow rounded-lg p-6">
          {/* Bulk Actions */}
          <div className="mb-4">
            <RoleBasedComponent requiredResource="employees" requiredAction="delete">
              {selectedEmployees.length > 0 && (
                <button
                  onClick={() => console.log('Bulk delete:', selectedEmployees)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                  Delete ({selectedEmployees.length})
                </button>
              )}
            </RoleBasedComponent>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <select
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="terminated">Terminated</option>
                  <option value="on_leave">On Leave</option>
                  <option value="suspended">Suspended</option>
                </select>

                <select
                  value={filters.employmentType}
                  onChange={(e) => handleFilterChange('employmentType', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Employment Types</option>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="intern">Intern</option>
                  <option value="consultant">Consultant</option>
                </select>

                <input
                  type="number"
                  placeholder="Min Salary"
                  value={filters.salaryMin}
                  onChange={(e) => handleFilterChange('salaryMin', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="number"
                  placeholder="Max Salary"
                  value={filters.salaryMax}
                  onChange={(e) => handleFilterChange('salaryMax', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Employee Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.length === employees.length && employees.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={() => handleSelectEmployee(employee.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                            <span className="text-gray-600 font-medium">
                              {employee.firstName[0]}{employee.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{employee.empId}</div>
                            <div className="text-sm text-gray-500">{employee.email}</div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{employee.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{employee.designation}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(employee.salary)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(employee.status)}`}>
                        {employee.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEmploymentTypeBadgeColor(employee.employmentType)}`}>
                        {employee.employmentType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(employee.joiningDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewEmployee(employee)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <RoleBasedComponent requiredResource="employees" requiredAction="update">
                          <button 
                            onClick={() => handleEditEmployee(employee)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit Employee"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </RoleBasedComponent>
                        <RoleBasedComponent requiredResource="employees" requiredAction="delete">
                          <button 
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Employee"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </RoleBasedComponent>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Employee Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add New Employee</h3>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleCreateEmployee} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Employee ID *</label>
                      <input
                        type="text"
                        required
                        value={newEmployee.empId}
                        onChange={(e) => setNewEmployee({...newEmployee, empId: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name *</label>
                      <input
                        type="text"
                        required
                        value={newEmployee.firstName}
                        onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={newEmployee.lastName}
                        onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email *</label>
                      <input
                        type="email"
                        required
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone *</label>
                      <input
                        type="tel"
                        required
                        pattern="[6-9][0-9]{9}"
                        value={newEmployee.phone}
                        onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Department *</label>
                      <input
                        type="text"
                        required
                        value={newEmployee.department}
                        onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Designation *</label>
                      <input
                        type="text"
                        required
                        value={newEmployee.designation}
                        onChange={(e) => setNewEmployee({...newEmployee, designation: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Salary (INR) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={newEmployee.salary}
                        onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={newEmployee.status}
                        onChange={(e) => setNewEmployee({...newEmployee, status: e.target.value as any})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on_leave">On Leave</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                      <select
                        value={newEmployee.employmentType}
                        onChange={(e) => setNewEmployee({...newEmployee, employmentType: e.target.value as any})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="intern">Intern</option>
                        <option value="consultant">Consultant</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Joining Date *</label>
                      <input
                        type="date"
                        required
                        value={newEmployee.joiningDate}
                        onChange={(e) => setNewEmployee({...newEmployee, joiningDate: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Create Employee
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Employee Modal */}
        {showEditForm && selectedEmployee && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edit Employee - {selectedEmployee.empId}</h3>
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      setSelectedEmployee(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleUpdateEmployee} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Employee ID *</label>
                      <input
                        type="text"
                        required
                        value={newEmployee.empId}
                        onChange={(e) => setNewEmployee({...newEmployee, empId: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name *</label>
                      <input
                        type="text"
                        required
                        value={newEmployee.firstName}
                        onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={newEmployee.lastName}
                        onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email *</label>
                      <input
                        type="email"
                        required
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone *</label>
                      <input
                        type="tel"
                        required
                        pattern="[6-9][0-9]{9}"
                        value={newEmployee.phone}
                        onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Department *</label>
                      <input
                        type="text"
                        required
                        value={newEmployee.department}
                        onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Designation *</label>
                      <input
                        type="text"
                        required
                        value={newEmployee.designation}
                        onChange={(e) => setNewEmployee({...newEmployee, designation: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Salary (INR) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={newEmployee.salary}
                        onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={newEmployee.status}
                        onChange={(e) => setNewEmployee({...newEmployee, status: e.target.value as any})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on_leave">On Leave</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                      <select
                        value={newEmployee.employmentType}
                        onChange={(e) => setNewEmployee({...newEmployee, employmentType: e.target.value as any})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="intern">Intern</option>
                        <option value="consultant">Consultant</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Joining Date *</label>
                      <input
                        type="date"
                        required
                        value={newEmployee.joiningDate}
                        onChange={(e) => setNewEmployee({...newEmployee, joiningDate: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditForm(false);
                        setSelectedEmployee(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Update Employee
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* View Employee Modal */}
        {showViewModal && selectedEmployee && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-3xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Employee Details - {selectedEmployee.empId}</h3>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedEmployee(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Employee ID</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedEmployee.empId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Full Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedEmployee.firstName} {selectedEmployee.lastName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedEmployee.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedEmployee.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Department</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedEmployee.department}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Designation</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedEmployee.designation}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Salary</label>
                      <p className="mt-1 text-sm text-gray-900 font-medium">{formatCurrency(selectedEmployee.salary)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Status</label>
                      <span className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(selectedEmployee.status)}`}>
                        {selectedEmployee.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Employment Type</label>
                      <span className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${getEmploymentTypeBadgeColor(selectedEmployee.employmentType)}`}>
                        {selectedEmployee.employmentType.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Joining Date</label>
                      <p className="mt-1 text-sm text-gray-900">{new Date(selectedEmployee.joiningDate).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Created At</label>
                      <p className="mt-1 text-sm text-gray-900">{new Date(selectedEmployee.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="mt-1 text-sm text-gray-900">{new Date(selectedEmployee.updatedAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditEmployee(selectedEmployee);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Edit Employee
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedEmployee(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default EmployeesPage;
