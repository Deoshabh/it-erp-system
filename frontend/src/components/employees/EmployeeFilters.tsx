import React from 'react';
import { EmployeeSearchFilters } from '../../services/employeeService';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface EmployeeFiltersProps {
  filters: EmployeeSearchFilters;
  onFiltersChange: (filters: EmployeeSearchFilters) => void;
  onClearFilters: () => void;
  departments: string[];
  designations: string[];
}

const EmployeeFilters: React.FC<EmployeeFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  departments,
  designations,
}) => {
  const handleFilterChange = (key: keyof EmployeeSearchFilters, value: string | number) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = filters.department || filters.designation || filters.status || 
    filters.employmentType || filters.salaryMin || filters.salaryMax || 
    filters.joiningDateFrom || filters.joiningDateTo;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search employees by name, email, employee ID..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filter Controls Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Department Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <select
            value={filters.department || ''}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Designation Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Designation
          </label>
          <select
            value={filters.designation || ''}
            onChange={(e) => handleFilterChange('designation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Designations</option>
            {designations.map((designation) => (
              <option key={designation} value={designation}>
                {designation}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="terminated">Terminated</option>
            <option value="on_leave">On Leave</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Employment Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employment Type
          </label>
          <select
            value={filters.employmentType || ''}
            onChange={(e) => handleFilterChange('employmentType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="intern">Intern</option>
            <option value="consultant">Consultant</option>
          </select>
        </div>
      </div>

      {/* Filter Controls Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Salary Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Salary
          </label>
          <input
            type="number"
            min="0"
            value={filters.salaryMin || ''}
            onChange={(e) => handleFilterChange('salaryMin', e.target.value ? parseFloat(e.target.value) : '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Min salary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Salary
          </label>
          <input
            type="number"
            min="0"
            value={filters.salaryMax || ''}
            onChange={(e) => handleFilterChange('salaryMax', e.target.value ? parseFloat(e.target.value) : '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Max salary"
          />
        </div>

        {/* Joining Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Joined From
          </label>
          <input
            type="date"
            value={filters.joiningDateFrom || ''}
            onChange={(e) => handleFilterChange('joiningDateFrom', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Joined To
          </label>
          <input
            type="date"
            value={filters.joiningDateTo || ''}
            onChange={(e) => handleFilterChange('joiningDateTo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            onClick={onClearFilters}
            className="px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
            title="Clear all filters"
          >
            <XMarkIcon className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FunnelIcon className="w-4 h-4" />
            <span>Active filters:</span>
          </div>
          
          {filters.department && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Department: {filters.department}
              <button
                onClick={() => handleFilterChange('department', '')}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.designation && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Designation: {filters.designation}
              <button
                onClick={() => handleFilterChange('designation', '')}
                className="hover:bg-green-200 rounded-full p-0.5"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.status && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              Status: {filters.status}
              <button
                onClick={() => handleFilterChange('status', '')}
                className="hover:bg-purple-200 rounded-full p-0.5"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.employmentType && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
              Type: {filters.employmentType.replace('_', ' ')}
              <button
                onClick={() => handleFilterChange('employmentType', '')}
                className="hover:bg-orange-200 rounded-full p-0.5"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}

          {(filters.salaryMin || filters.salaryMax) && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
              Salary: {filters.salaryMin || 0} - {filters.salaryMax || '∞'}
              <button
                onClick={() => {
                  handleFilterChange('salaryMin', '');
                  handleFilterChange('salaryMax', '');
                }}
                className="hover:bg-yellow-200 rounded-full p-0.5"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}

          {(filters.joiningDateFrom || filters.joiningDateTo) && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">
              Joined: {filters.joiningDateFrom || '...'} to {filters.joiningDateTo || '...'}
              <button
                onClick={() => {
                  handleFilterChange('joiningDateFrom', '');
                  handleFilterChange('joiningDateTo', '');
                }}
                className="hover:bg-pink-200 rounded-full p-0.5"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeFilters;
