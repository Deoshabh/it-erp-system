import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import RoleBasedComponent from '../components/auth/RoleBasedComponent';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/currency';
import employeeService, { Employee, CreateEmployeeDto, UpdateEmployeeDto, EmployeeSearchFilters } from '../services/employeeService';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  FunnelIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { CurrencyRupeeIcon } from '@heroicons/react/24/outline';

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

  // API Functions - connect to real backend
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert string filters to appropriate types for API
      const apiFilters: EmployeeSearchFilters = {
        search: filters.search,
        department: filters.department,
        designation: filters.designation,
        status: filters.status,
        employmentType: filters.employmentType,
        salaryMin: filters.salaryMin ? parseFloat(filters.salaryMin) : undefined,
        salaryMax: filters.salaryMax ? parseFloat(filters.salaryMax) : undefined,
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };
      
      const result = await employeeService.searchEmployees(apiFilters);
      
      setEmployees(result.data);
      setPagination({
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.page,
      });
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      setError(error.message || 'Failed to fetch employees');
      
      // If no employees exist, just show empty state
      if (error.message?.includes('404') || error.message?.includes('No employees found')) {
        setEmployees([]);
        setPagination({ total: 0, totalPages: 0, currentPage: 1 });
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleCreateEmployee = async () => {
    try {
      if (!newEmployee.empId || !newEmployee.firstName || !newEmployee.lastName || 
          !newEmployee.email || !newEmployee.phone || !newEmployee.department || 
          !newEmployee.designation || !newEmployee.salary || !newEmployee.joiningDate) {
        setError('Please fill in all required fields');
        return;
      }

      setLoading(true);
      
      const employeeData: CreateEmployeeDto = {
        empId: newEmployee.empId,
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        email: newEmployee.email,
        phone: newEmployee.phone,
        department: newEmployee.department,
        designation: newEmployee.designation,
        salary: parseFloat(newEmployee.salary),
        status: newEmployee.status,
        employmentType: newEmployee.employmentType,
        joiningDate: newEmployee.joiningDate,
      };

      await employeeService.create(employeeData);

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
      
      // Refresh the employee list
      await fetchEmployees();
    } catch (error: any) {
      console.error('Error creating employee:', error);
      setError(error.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      setLoading(true);
      
      const updateData: UpdateEmployeeDto = {
        empId: selectedEmployee.empId,
        firstName: selectedEmployee.firstName,
        lastName: selectedEmployee.lastName,
        email: selectedEmployee.email,
        phone: selectedEmployee.phone,
        department: selectedEmployee.department,
        designation: selectedEmployee.designation,
        salary: selectedEmployee.salary,
        status: selectedEmployee.status,
        employmentType: selectedEmployee.employmentType,
        joiningDate: selectedEmployee.joiningDate,
      };

      await employeeService.update(selectedEmployee.id, updateData);

      setShowEditForm(false);
      setSelectedEmployee(null);
      
      // Refresh the employee list
      await fetchEmployees();
    } catch (error: any) {
      console.error('Error updating employee:', error);
      setError(error.message || 'Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      setLoading(true);
      await employeeService.delete(employeeId);
      
      // Refresh the employee list
      await fetchEmployees();
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      setError(error.message || 'Failed to delete employee');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600">Manage employee information and records</p>
        </div>
        <RoleBasedComponent allowedRoles={['admin', 'hr']}>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Employee
          </button>
        </RoleBasedComponent>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <FunnelIcon className="h-5 w-5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Department"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="Designation"
                value={filters.designation}
                onChange={(e) => handleFilterChange('designation', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
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
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">All Employment Types</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
                <option value="consultant">Consultant</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <UserGroupIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.department || filters.designation ? 
                'No employees match your current filters.' : 
                'No employees have been added yet.'}
            </p>
            <RoleBasedComponent allowedRoles={['admin', 'hr']}>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add First Employee
              </button>
            </RoleBasedComponent>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Designation
                    </th>
                    {(user?.role === 'admin' || user?.role === 'hr') && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Salary
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employment Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{employee.empId}</div>
                            <div className="text-sm text-gray-500">{employee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.designation}
                      </td>
                      {(user?.role === 'admin' || user?.role === 'hr') && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <CurrencyRupeeIcon className="h-4 w-4 text-gray-400 mr-1" />
                            {formatCurrency(employee.salary)}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          employee.status === 'active' ? 'bg-green-100 text-green-800' :
                          employee.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          employee.status === 'on_leave' ? 'bg-yellow-100 text-yellow-800' :
                          employee.status === 'terminated' ? 'bg-red-100 text-red-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {employee.status === 'on_leave' ? 'On Leave' : employee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.employmentType === 'full_time' ? 'Full Time' :
                         employee.employmentType === 'part_time' ? 'Part Time' :
                         employee.employmentType.charAt(0).toUpperCase() + employee.employmentType.slice(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setShowViewModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <RoleBasedComponent allowedRoles={['admin', 'hr']}>
                            <button
                              onClick={() => {
                                setSelectedEmployee(employee);
                                setShowEditForm(true);
                              }}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(employee.id)}
                              className="text-red-600 hover:text-red-900"
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm text-gray-700">
                      Showing {(pagination.currentPage - 1) * filters.limit + 1} to{' '}
                      {Math.min(pagination.currentPage * filters.limit, pagination.total)} of{' '}
                      {pagination.total} results
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded text-sm ${
                          page === pagination.currentPage
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Employee Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Employee</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                  <input
                    type="text"
                    value={newEmployee.empId}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, empId: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="EMP001"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      value={newEmployee.firstName}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, firstName: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      value={newEmployee.lastName}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, lastName: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, phone: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="10-digit mobile number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <input
                    type="text"
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, department: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Designation</label>
                  <input
                    type="text"
                    value={newEmployee.designation}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, designation: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Salary (INR)</label>
                  <input
                    type="number"
                    value={newEmployee.salary}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, salary: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                  <select
                    value={newEmployee.employmentType}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, employmentType: e.target.value as Employee['employmentType'] }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="intern">Intern</option>
                    <option value="consultant">Consultant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                  <input
                    type="date"
                    value={newEmployee.joiningDate}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, joiningDate: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEmployee}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Employee'}
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
