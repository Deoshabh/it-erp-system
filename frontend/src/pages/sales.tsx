import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { salesService, Lead, Customer, Opportunity } from '../services/salesService';
import SalesDashboard from '../components/sales/SalesDashboard';
import LeadManagement from '../components/sales/LeadManagement';
import CustomerManagement from '../components/sales/CustomerManagement';
import OpportunityManagement from '../components/sales/OpportunityManagement';
import { User, TrendingUp, Users, Target, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type TabType = 'dashboard' | 'leads' | 'customers' | 'opportunities';

const SalesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalCustomers: 0,
    totalOpportunities: 0,
    totalRevenue: 0,
    conversionRate: 0,
    pipelineValue: 0
  });

  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsData, customersData, opportunitiesData, statsData] = await Promise.all([
        salesService.getLeads(),
        salesService.getCustomers(),
        salesService.getOpportunities(),
        salesService.getSalesStatistics()
      ]);

      // Extract arrays from API responses (they might be wrapped in objects)
      const safeLeads = Array.isArray(leadsData) ? leadsData : (leadsData as any)?.leads || [];
      const safeCustomers = Array.isArray(customersData) ? customersData : (customersData as any)?.customers || [];
      const safeOpportunities = Array.isArray(opportunitiesData) ? opportunitiesData : (opportunitiesData as any)?.opportunities || [];

      setLeads(safeLeads);
      setCustomers(safeCustomers);
      setOpportunities(safeOpportunities);
      setStats({
        totalLeads: statsData?.totalLeads || safeLeads.length,
        totalCustomers: statsData?.totalCustomers || safeCustomers.length,
        totalOpportunities: statsData?.totalOpportunities || safeOpportunities.length,
        totalRevenue: statsData?.totalRevenue || 0,
        conversionRate: statsData?.conversionRate || 0,
        pipelineValue: safeOpportunities.reduce((sum: number, opp: Opportunity) => sum + (opp.value || 0), 0) // Calculate from opportunities
      });
    } catch (error) {
      console.error('Error loading sales data:', error);
      // Set fallback empty arrays on error
      setLeads([]);
      setCustomers([]);
      setOpportunities([]);
      setStats({
        totalLeads: 0,
        totalCustomers: 0,
        totalOpportunities: 0,
        totalRevenue: 0,
        conversionRate: 0,
        pipelineValue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: 'dashboard' as TabType,
      name: 'Dashboard',
      icon: TrendingUp,
      count: null
    },
    {
      id: 'leads' as TabType,
      name: 'Leads',
      icon: User,
      count: Array.isArray(leads) ? leads.length : 0
    },
    {
      id: 'customers' as TabType,
      name: 'Customers',
      icon: Users,
      count: Array.isArray(customers) ? customers.length : 0
    },
    {
      id: 'opportunities' as TabType,
      name: 'Opportunities',
      icon: Target,
      count: Array.isArray(opportunities) ? opportunities.length : 0
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <SalesDashboard
            stats={stats}
            leads={leads}
            customers={customers}
            opportunities={opportunities}
            onRefresh={loadData}
          />
        );
      case 'leads':
        return (
          <LeadManagement
            leads={leads}
            onLeadsChange={setLeads}
            onRefresh={loadData}
          />
        );
      case 'customers':
        return (
          <CustomerManagement
            customers={customers}
            onCustomersChange={setCustomers}
            onRefresh={loadData}
          />
        );
      case 'opportunities':
        return (
          <OpportunityManagement
            opportunities={opportunities}
            customers={customers}
            onOpportunitiesChange={setOpportunities}
            onRefresh={loadData}
          />
        );
      default:
        return <SalesDashboard stats={stats} leads={leads} customers={customers} opportunities={opportunities} onRefresh={loadData} />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {(user?.role === 'admin' || user?.role === 'sales' || user?.role === 'manager' || user?.role === 'hr') ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
              <p className="mt-2 text-gray-600">
                Manage leads, customers, and sales opportunities
              </p>
            </div>
            {(user?.role === 'admin' || user?.role === 'sales' || user?.role === 'manager') && (
              <button
                onClick={() => {
                  // Quick action dropdown could be implemented here
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Quick Add
              </button>
            )}
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Leads
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalLeads}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Customers
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalCustomers}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Target className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Opportunities
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalOpportunities}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Revenue
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ${stats.totalRevenue?.toLocaleString() || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Conversion
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.conversionRate?.toFixed(1) || 0}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Target className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pipeline
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ${stats.pipelineValue?.toLocaleString() || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.name}
                    {tab.count !== null && (
                      <span className={`${
                        activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-900'
                      } ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {renderTabContent()}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">You don't have access to the Sales module.</p>
        </div>
      )}
    </Layout>
  );
};

export default SalesPage;
