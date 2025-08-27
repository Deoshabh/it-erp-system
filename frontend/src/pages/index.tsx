import React from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <Layout>
        <DashboardContent />
      </Layout>
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, canAccess } = useAuth();
  
  // Define quick actions based on user permissions
  const getQuickActions = () => {
    const actions = [];
    
    if (canAccess('employees', 'read')) {
      actions.push({
        href: '/employees',
        title: 'Employees',
        description: 'Manage staff',
        color: 'blue',
        icon: 'E'
      });
    }
    
    if (canAccess('finance', 'read')) {
      actions.push({
        href: '/finance',
        title: 'Finance',
        description: 'Invoices & Expenses',
        color: 'green',
        icon: 'F'
      });
    }
    
    if (canAccess('reports', 'read')) {
      actions.push({
        href: '/reports',
        title: 'Reports',
        description: 'Analytics & Export',
        color: 'purple',
        icon: 'R'
      });
    }
    
    if (canAccess('files', 'read')) {
      actions.push({
        href: '/files',
        title: 'Files',
        description: 'File Management',
        color: 'gray',
        icon: 'D'
      });
    }
    
    if (canAccess('users', 'read')) {
      actions.push({
        href: '/users',
        title: 'Users',
        description: 'User Management',
        color: 'indigo',
        icon: 'U'
      });
    }
    
    return actions;
  };

  const quickActions = getQuickActions();
  
  return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to IT ERP System{user ? `, ${user.firstName || 'User'}` : ''}
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Manage your company's employees, finances, and documents with our comprehensive ERP solution.
            </p>
            {user && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </p>
                    <p className="text-sm text-blue-700">
                      Email: {user.email}
                    </p>
                    {user.department && (
                      <p className="text-sm text-blue-700">
                        Department: {user.department}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'hr' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'manager' ? 'bg-yellow-100 text-yellow-800' :
                      user.role === 'finance' ? 'bg-green-100 text-green-800' :
                      user.role === 'sales' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Quick Actions - Role-based */}
            {quickActions.length > 0 ? (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Available Modules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {quickActions.map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      className={`bg-${action.color}-50 hover:bg-${action.color}-100 p-4 rounded-lg border border-${action.color}-200 transition-colors`}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 bg-${action.color}-500 rounded-md flex items-center justify-center`}>
                            <span className="text-white font-semibold text-sm">{action.icon}</span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <h3 className={`text-sm font-medium text-${action.color}-900`}>{action.title}</h3>
                          <p className={`text-xs text-${action.color}-700`}>{action.description}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-yellow-500">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Limited Access</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Your current role ({user?.role}) has limited access to system modules. Contact your administrator if you need additional permissions.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Role-specific information */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Permissions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['employees', 'finance', 'users', 'files', 'reports'].map((resource) => (
                <div key={resource} className="border rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 capitalize mb-2">{resource}</h4>
                  <div className="space-y-1">
                    {['read', 'create', 'update', 'delete'].map((action) => (
                      <div key={action} className="flex items-center text-sm">
                        <span className={`mr-2 ${canAccess(resource, action) ? 'text-green-500' : 'text-red-500'}`}>
                          {canAccess(resource, action) ? '✓' : '✗'}
                        </span>
                        <span className="capitalize">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <p className="text-sm text-gray-600">Database Connected</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <p className="text-sm text-gray-600">API Services</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <p className="text-sm text-gray-600">File Upload</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
