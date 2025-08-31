import React from 'react';
import { Lead, Customer, Opportunity } from '../../services/salesService';
import { TrendingUp, Users, Target, DollarSign, BarChart3 } from 'lucide-react';

interface SalesDashboardProps {
  stats: {
    totalLeads: number;
    totalCustomers: number;
    totalOpportunities: number;
    totalRevenue: number;
    conversionRate: number;
    pipelineValue: number;
  };
  leads: Lead[];
  customers: Customer[];
  opportunities: Opportunity[];
  onRefresh: () => void;
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({
  stats,
  leads,
  customers,
  opportunities,
  onRefresh
}) => {
  // Ensure leads is an array to prevent runtime errors
  const safeLeads = Array.isArray(leads) ? leads : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const safeOpportunities = Array.isArray(opportunities) ? opportunities : [];

  // Get recent leads (last 5)
  const recentLeads = safeLeads.slice(0, 5);

  // Get high-value opportunities
  const highValueOpportunities = safeOpportunities
    .filter(opp => opp.value > 10000)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Get leads by status
  const leadsByStatus = safeLeads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get opportunities by stage
  const opportunitiesByStage = safeOpportunities.reduce((acc, opp) => {
    acc[opp.stage] = (acc[opp.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'new': 'bg-blue-100 text-blue-800',
      'contacted': 'bg-yellow-100 text-yellow-800',
      'qualified': 'bg-green-100 text-green-800',
      'proposal': 'bg-purple-100 text-purple-800',
      'negotiation': 'bg-orange-100 text-orange-800',
      'closed_won': 'bg-green-100 text-green-800',
      'closed_lost': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'prospecting': 'bg-blue-100 text-blue-800',
      'qualification': 'bg-yellow-100 text-yellow-800',
      'needs_analysis': 'bg-purple-100 text-purple-800',
      'proposal': 'bg-orange-100 text-orange-800',
      'negotiation': 'bg-red-100 text-red-800',
      'closed_won': 'bg-green-100 text-green-800',
      'closed_lost': 'bg-gray-100 text-gray-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Performance Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Status Distribution */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Lead Status Distribution
            </h3>
            <div className="space-y-3">
              {Object.entries(leadsByStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Opportunity Pipeline */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Opportunity Pipeline
            </h3>
            <div className="space-y-3">
              {Object.entries(opportunitiesByStage).map(([stage, count]) => (
                <div key={stage} className="flex justify-between items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(stage)}`}>
                    {stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Leads
              </h3>
              <button
                onClick={onRefresh}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                View all
              </button>
            </div>
            <div className="space-y-3">
              {recentLeads.length > 0 ? (
                recentLeads.map((lead) => (
                  <div key={lead.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                      <p className="text-sm text-gray-500">{lead.company || lead.email}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status.replace('_', ' ')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent leads</p>
              )}
            </div>
          </div>
        </div>

        {/* High-Value Opportunities */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                High-Value Opportunities
              </h3>
              <button
                onClick={onRefresh}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                View all
              </button>
            </div>
            <div className="space-y-3">
              {highValueOpportunities.length > 0 ? (
                highValueOpportunities.map((opportunity) => (
                  <div key={opportunity.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{opportunity.title}</p>
                      <p className="text-sm text-gray-500">${opportunity.value.toLocaleString()}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(opportunity.stage)}`}>
                      {opportunity.stage.replace('_', ' ')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No high-value opportunities</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center p-3 border border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <Users className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-gray-900">Add Lead</span>
            </button>
            <button className="flex items-center p-3 border border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <Target className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm font-medium text-gray-900">Create Opportunity</span>
            </button>
            <button className="flex items-center p-3 border border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <BarChart3 className="h-5 w-5 text-purple-500 mr-2" />
              <span className="text-sm font-medium text-gray-900">View Reports</span>
            </button>
            <button className="flex items-center p-3 border border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <TrendingUp className="h-5 w-5 text-orange-500 mr-2" />
              <span className="text-sm font-medium text-gray-900">Sales Forecast</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
