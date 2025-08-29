import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import RoleBasedComponent from '../auth/RoleBasedComponent';
import { 
  Home, 
  Users, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  FileText, 
  BarChart3, 
  FolderOpen,
  Menu,
  X,
  LogOut
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, logout, canAccess } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Define navigation items with icons and submenu structure
  const navigationItems = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: Home,
      current: router.pathname === '/' 
    },
    { 
      name: 'Employees', 
      href: '/employees', 
      icon: Users,
      current: router.pathname === '/employees',
      resource: 'employees',
      action: 'read'
    },
    { 
      name: 'Users', 
      href: '/users', 
      icon: Users,
      current: router.pathname === '/users',
      resource: 'users',
      action: 'read'
    },
    { 
      name: 'Finance', 
      href: '/finance', 
      icon: DollarSign,
      current: router.pathname === '/finance' || router.pathname.startsWith('/finance'),
      resource: 'finance',
      action: 'read'
    },
    { 
      name: 'Inventory', 
      href: '/inventory', 
      icon: Package,
      current: router.pathname === '/inventory',
      resource: 'inventory',
      action: 'read'
    },
    { 
      name: 'Procurement', 
      href: '/procurement', 
      icon: ShoppingCart,
      current: router.pathname === '/procurement',
      resource: 'procurement',
      action: 'read'
    },
    { 
      name: 'Reports', 
      href: '/reports', 
      icon: BarChart3,
      current: router.pathname === '/reports',
      resource: 'reports',
      action: 'read'
    },
    { 
      name: 'Files', 
      href: '/files', 
      icon: FolderOpen,
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 bg-blue-700">
        <h1 className="text-xl font-bold text-white">IT ERP</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {allowedNavigation.map((item) => {
          const IconComponent = item.icon;
          
          return (
            <div key={item.name}>
              <div className="group">
                <Link
                  href={item.href}
                  className={`${
                    item.current
                      ? 'bg-blue-700 text-white'
                      : 'text-gray-300 hover:bg-blue-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <IconComponent className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </div>
            </div>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="px-4 py-4 border-t border-blue-700">
        {user && (
          <div className="text-xs text-gray-300 mb-2">
            <div className="font-medium text-white">{user.firstName} {user.lastName}</div>
            <div className="flex items-center justify-between mt-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
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
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-red-600 hover:text-white transition-colors duration-200"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-blue-800 overflow-y-auto">
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-blue-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top bar for mobile */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between bg-white px-4 py-2 border-b border-gray-200">
            <button
              type="button"
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-medium text-gray-900">IT ERP System</h1>
            <button
              onClick={handleLogout}
              className="p-2 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
