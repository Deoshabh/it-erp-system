import React from 'react';
import { Employee } from '../../services/employeeService';
import Modal from '../common/Modal';
import { 
  XMarkIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  BuildingOfficeIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  IdentificationIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

interface EmployeeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

const getStatusColor = (status: string) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    terminated: 'bg-red-100 text-red-800',
    on_leave: 'bg-yellow-100 text-yellow-800',
    suspended: 'bg-red-100 text-red-800',
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const getEmploymentTypeColor = (type: string) => {
  const colors = {
    full_time: 'bg-blue-100 text-blue-800',
    part_time: 'bg-purple-100 text-purple-800',
    contract: 'bg-orange-100 text-orange-800',
    intern: 'bg-green-100 text-green-800',
    consultant: 'bg-indigo-100 text-indigo-800',
  };
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const formatEmploymentType = (type: string) => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({
  isOpen,
  onClose,
  employee,
}) => {
  if (!employee) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="3xl">
      <div className="bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Employee Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Profile Section */}
          <div className="flex items-start gap-6 mb-8">
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-3xl">
                  {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="text-lg text-gray-600 mb-3">{employee.designation}</p>
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center px-2 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded-full">
                  <IdentificationIcon className="w-4 h-4 mr-1" />
                  {employee.empId}
                </span>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getEmploymentTypeColor(employee.employmentType)}`}>
                  {formatEmploymentType(employee.employmentType)}
                </span>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(employee.status)}`}>
                  {employee.status.charAt(0).toUpperCase() + employee.status.slice(1).replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Joined {new Date(employee.joiningDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CurrencyDollarIcon className="w-4 h-4" />
                  <span>${employee.salary.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <EnvelopeIcon className="w-5 h-5" />
                Contact Information
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="text-gray-900">{employee.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <PhoneIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-gray-900">{employee.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BriefcaseIcon className="w-5 h-5" />
                Work Information
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="text-gray-900">{employee.department}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Designation</p>
                    <p className="text-gray-900">{employee.designation}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BriefcaseIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Employment Type</p>
                    <p className="text-gray-900">{formatEmploymentType(employee.employmentType)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Employment Details
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <IdentificationIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Employee ID</p>
                    <p className="text-gray-900 font-mono">{employee.empId}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Joining Date</p>
                    <p className="text-gray-900">
                      {new Date(employee.joiningDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                    <div className={`w-3 h-3 rounded-full ${
                      employee.status === 'active' ? 'bg-green-500' : 
                      employee.status === 'on_leave' ? 'bg-yellow-500' : 
                      employee.status === 'terminated' || employee.status === 'suspended' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Employment Status</p>
                    <p className="text-gray-900 capitalize">
                      {employee.status.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compensation & Timeline */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5" />
                Compensation & Timeline
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CurrencyDollarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Annual Salary</p>
                    <p className="text-gray-900 text-lg font-semibold">
                      ${employee.salary.toLocaleString()}
                    </p>
                  </div>
                </div>

                {employee.createdAt && (
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Record Created</p>
                      <p className="text-gray-900">
                        {new Date(employee.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )}
                
                {employee.updatedAt && (
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="text-gray-900">
                        {new Date(employee.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EmployeeDetailsModal;
