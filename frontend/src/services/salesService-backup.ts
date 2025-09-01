import { apiClient } from './apiClient';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  source: 'website' | 'referral' | 'social_media' | 'email' | 'phone' | 'event' | 'advertisement' | 'other';
  estimatedValue?: number;
  notes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  address?: string;
  status: 'active' | 'inactive' | 'potential';
  totalValue: number;
  notes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description?: string;
  value: number;
  stage: 'prospecting' | 'qualification' | 'needs_analysis' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expectedCloseDate?: string;
  customerId: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadDto {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  source: string;
  estimatedValue?: number;
  notes?: string;
  assignedTo?: string;
}

export interface CreateCustomerDto {
  name: string;
  email: string;
  phone?: string;
  company: string;
  address?: string;
  notes?: string;
  assignedTo?: string;
}

export interface CreateOpportunityDto {
  title: string;
  description?: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate?: string;
  customerId: string;
  assignedTo?: string;
}

export interface SalesStatistics {
  totalLeads: number;
  totalCustomers: number;
  totalOpportunities: number;
  totalRevenue: number;
  conversionRate: number;
  leadsThisMonth: number;
  revenueThisMonth: number;
  topPerformers: Array<{
    userId: string;
    userName: string;
    deals: number;
    revenue: number;
  }>;
}

export const salesService = {
  // Leads
  async getLeads() {
    const response = await apiClient.get<Lead[]>('/sales/leads');
    return response.data;
  },

  async getLeadById(id: string) {
    const response = await apiClient.get<Lead>(`/sales/leads/${id}`);
    return response.data;
  },

  async createLead(data: CreateLeadDto) {
    const response = await apiClient.post<Lead>('/sales/leads', data);
    return response.data;
  },

  async updateLead(id: string, data: Partial<CreateLeadDto>) {
    const response = await apiClient.put<Lead>(`/sales/leads/${id}`, data);
    return response.data;
  },

  async deleteLead(id: string) {
    await apiClient.delete(`/sales/leads/${id}`);
  },

  // Customers
  async getCustomers() {
    const response = await apiClient.get<Customer[]>('/sales/customers');
    return response.data;
  },

  async getCustomerById(id: string) {
    const response = await apiClient.get<Customer>(`/sales/customers/${id}`);
    return response.data;
  },

  async createCustomer(data: CreateCustomerDto) {
    const response = await apiClient.post<Customer>('/sales/customers', data);
    return response.data;
  },

  async updateCustomer(id: string, data: Partial<CreateCustomerDto>) {
    const response = await apiClient.put<Customer>(`/sales/customers/${id}`, data);
    return response.data;
  },

  async deleteCustomer(id: string) {
    await apiClient.delete(`/sales/customers/${id}`);
  },

  // Opportunities
  async getOpportunities() {
    const response = await apiClient.get<Opportunity[]>('/sales/opportunities');
    return response.data;
  },

  async getOpportunityById(id: string) {
    const response = await apiClient.get<Opportunity>(`/sales/opportunities/${id}`);
    return response.data;
  },

  async createOpportunity(data: CreateOpportunityDto) {
    const response = await apiClient.post<Opportunity>('/sales/opportunities', data);
    return response.data;
  },

  async updateOpportunity(id: string, data: Partial<CreateOpportunityDto>) {
    const response = await apiClient.put<Opportunity>(`/sales/opportunities/${id}`, data);
    return response.data;
  },

  async deleteOpportunity(id: string) {
    await apiClient.delete(`/sales/opportunities/${id}`);
  },

  // Statistics
  async getSalesStatistics() {
    const response = await apiClient.get<SalesStatistics>('/sales/statistics');
    return response.data;
  },

  async getPipelineAnalytics() {
    const response = await apiClient.get('/sales/pipeline-analytics');
    return response.data;
  },

  async getLeadsBySource() {
    const response = await apiClient.get('/sales/leads-by-source');
    return response.data;
  },

  async getConversionFunnel() {
    const response = await apiClient.get('/sales/conversion-funnel');
    return response.data;
  }
};
