import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import RoleBasedComponent from '../auth/RoleBasedComponent';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, logout, canAccess } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Define navigation items with permission requirements
  const navigationItems = [
    { name: 'Dashboard', href: '/', current: router.pathname === '/' },
    { 
      name: 'Employees', 
      href: '/employees', 
      current: router.pathname === '/employees',
      resource: 'employees',
      action: 'read'
    },
    { 
      name: 'Users', 
      href: '/users', 
      current: router.pathname === '/users',
      resource: 'users',
      action: 'read'
    },
    { 
      name: 'Finance', 
      href: '/finance', 
      current: router.pathname === '/finance',
      resource: 'finance',
      action: 'read'
    },
    { 
      name: 'Procurement', 
      href: '/procurement', 
      current: router.pathname === '/procurement',
      resource: 'procurement',
      action: 'read'
    },
    { 
      name: 'Reports', 
      href: '/reports', 
      current: router.pathname === '/reports',
      resource: 'reports',
      action: 'read'
    },
    { 
      name: 'Files', 
      href: '/files', 
      current: router.pathname === '/files',
      resource: 'files',
      action: 'read'
    },
  ];

  // Filter navigation based on user permissions
  const allowedNavigation = navigationItems.filter(item => {
    if (!item.resource || !item.action) return true; // Always show dashboard
    return canAccess(item.resource, item.action);
  });

  // Don't show layout on login page
  if (router.pathname === '/login' || router.pathname === '/unauthorized') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">IT ERP System</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {allowedNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="text-sm text-gray-500">
                  <span className="mr-2">Welcome, {user.firstName} {user.lastName}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'hr' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'manager' ? 'bg-yellow-100 text-yellow-800' :
                    user.role === 'finance' ? 'bg-green-100 text-green-800' :
                    user.role === 'sales' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
