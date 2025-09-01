import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { salesService } from '../services/salesService';
import SalesDashboard from '../components/sales/SalesDashboard';
import CustomersModule from '../components/sales/CustomersModule';
import EnquiryModule from '../components/sales/EnquiryModule';
import QuotationModule from '../components/sales/QuotationModule';
import ConfirmQuotationModule from '../components/sales/ConfirmQuotationModule';
import SalesOrderModule from '../components/sales/SalesOrderModule';
import DispatchModule from '../components/sales/DispatchModule';
import InvoiceModule from '../components/sales/InvoiceModule';
import ReturnsModule from '../components/sales/ReturnsModule';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  FileText, 
  CheckCircle, 
  ShoppingCart, 
  Truck, 
  Receipt, 
  RotateCcw,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type TabType = 'dashboard' | 'customers' | 'enquiry' | 'quotation' | 'confirm-quotation' | 'sales-order' | 'dispatch' | 'invoice' | 'returns';

const SalesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalEnquiries: 0,
    totalQuotations: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingDispatches: 0,
    overdueInvoices: 0,
    activeReturns: 0
  });

  const { user, canAccess } = useAuth();

  // Tab configuration with permissions
  const tabs = [
    {
      id: 'dashboard' as TabType,
      name: 'Dashboard',
      icon: BarChart3,
      resource: 'sales',
      action: 'read'
    },
    {
      id: 'customers' as TabType,
      name: 'Customers',
      icon: Users,
      resource: 'sales',
      action: 'read'
    },
    {
      id: 'enquiry' as TabType,
      name: 'Enquiry',
      icon: MessageSquare,
      resource: 'sales',
      action: 'read'
    },
    {
      id: 'quotation' as TabType,
      name: 'Quotation',
      icon: FileText,
      resource: 'sales',
      action: 'read'
    },
    {
      id: 'confirm-quotation' as TabType,
      name: 'Confirm Quotation',
      icon: CheckCircle,
      resource: 'sales',
      action: 'update'
    },
    {
      id: 'sales-order' as TabType,
      name: 'Sales Order',
      icon: ShoppingCart,
      resource: 'sales',
      action: 'read'
    },
    {
      id: 'dispatch' as TabType,
      name: 'Dispatch',
      icon: Truck,
      resource: 'sales',
      action: 'read'
    },
    {
      id: 'invoice' as TabType,
      name: 'Invoice',
      icon: Receipt,
      resource: 'sales',
      action: 'read'
    },
    {
      id: 'returns' as TabType,
      name: 'Returns',
      icon: RotateCcw,
      resource: 'sales',
      action: 'read'
    }
  ];

  // Filter tabs based on user permissions
  const allowedTabs = tabs.filter(tab => 
    canAccess(tab.resource, tab.action)
  );

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      // For now, use mock data since the new endpoints might not be fully available
      setStats({
        totalCustomers: 150,
        totalEnquiries: 45,
        totalQuotations: 32,
        totalOrders: 28,
        totalRevenue: 125000,
        pendingDispatches: 12,
        overdueInvoices: 8,
        activeReturns: 3
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a handler function to convert string to TabType
  const handleTabChange = (tab: string) => {
    // Type assertion to convert string to TabType
    setActiveTab(tab as TabType);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SalesDashboard stats={stats} onTabChange={handleTabChange} />;
      case 'customers':
        return <CustomersModule />;
      case 'enquiry':
        return <EnquiryModule />;
      case 'quotation':
        return <QuotationModule />;
      case 'confirm-quotation':
        return <ConfirmQuotationModule />;
      case 'sales-order':
        return <SalesOrderModule />;
      case 'dispatch':
        return <DispatchModule />;
      case 'invoice':
        return <InvoiceModule />;
      case 'returns':
        return <ReturnsModule />;
      default:
        return <SalesDashboard stats={stats} onTabChange={handleTabChange} />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="mr-3 h-8 w-8 text-blue-600" />
              Sales Management
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Comprehensive sales management from enquiry to completion
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="text-sm text-gray-500">
              Welcome back, <span className="font-medium text-gray-900">{user?.firstName}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalCustomers}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Enquiries</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalEnquiries}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingCart className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalOrders}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Receipt className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${stats.totalRevenue.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {allowedTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading...</span>
              </div>
            ) : (
              renderContent()
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SalesPage;
