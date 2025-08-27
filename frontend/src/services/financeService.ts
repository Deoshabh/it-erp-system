import { apiClient } from './apiClient';

export interface Invoice {
  id?: number;
  clientName: string;
  amount: number;
  dueDate: string;
  status: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  id?: number;
  description: string;
  category: string;
  amount: number;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  paidRevenue: number;
  netProfit: number;
}

// Mock data for demo purposes (remove when backend is connected)
let mockInvoices: Invoice[] = [
  {
    id: 1,
    clientName: 'Acme Corp',
    amount: 15000,
    dueDate: '2024-09-15',
    status: 'pending',
    description: 'Web development services',
    createdAt: '2024-08-01T00:00:00Z'
  },
  {
    id: 2,
    clientName: 'Tech Solutions Ltd',
    amount: 8500,
    dueDate: '2024-08-30',
    status: 'paid',
    description: 'Software consulting',
    createdAt: '2024-08-15T00:00:00Z'
  }
];

let mockExpenses: Expense[] = [
  {
    id: 1,
    description: 'Office Rent',
    category: 'Rent',
    amount: 2500,
    date: '2024-08-01',
    createdAt: '2024-08-01T00:00:00Z'
  },
  {
    id: 2,
    description: 'Software Licenses',
    category: 'Software',
    amount: 1200,
    date: '2024-08-15',
    createdAt: '2024-08-15T00:00:00Z'
  }
];

class FinanceService {
  private baseUrl = '/api/v1/finance';
  private useMockData = true; // Set to false when backend is ready

  // Invoice methods
  async getAllInvoices(): Promise<Invoice[]> {
    if (this.useMockData) {
      return Promise.resolve([...mockInvoices]);
    }
    
    try {
      const response = await apiClient.get(`${this.baseUrl}/invoices`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  }

  async createInvoice(invoice: Omit<Invoice, 'id'>): Promise<Invoice> {
    if (this.useMockData) {
      const newInvoice: Invoice = {
        ...invoice,
        id: Math.max(...mockInvoices.map(i => i.id || 0)) + 1,
        createdAt: new Date().toISOString()
      };
      mockInvoices.push(newInvoice);
      return Promise.resolve(newInvoice);
    }

    const response = await apiClient.post(`${this.baseUrl}/invoices`, invoice);
    return response.data;
  }

  async updateInvoice(id: number, invoice: Partial<Invoice>): Promise<Invoice> {
    if (this.useMockData) {
      const index = mockInvoices.findIndex(i => i.id === id);
      if (index !== -1) {
        mockInvoices[index] = { ...mockInvoices[index], ...invoice };
        return Promise.resolve(mockInvoices[index]);
      }
      throw new Error('Invoice not found');
    }

    const response = await apiClient.patch(`${this.baseUrl}/invoices/${id}`, invoice);
    return response.data;
  }

  async deleteInvoice(id: number): Promise<void> {
    if (this.useMockData) {
      const index = mockInvoices.findIndex(i => i.id === id);
      if (index !== -1) {
        mockInvoices.splice(index, 1);
      }
      return Promise.resolve();
    }

    await apiClient.delete(`${this.baseUrl}/invoices/${id}`);
  }

  // Expense methods
  async getAllExpenses(): Promise<Expense[]> {
    if (this.useMockData) {
      return Promise.resolve([...mockExpenses]);
    }

    try {
      const response = await apiClient.get(`${this.baseUrl}/expenses`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }
  }

  async createExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    if (this.useMockData) {
      const newExpense: Expense = {
        ...expense,
        id: Math.max(...mockExpenses.map(e => e.id || 0)) + 1,
        createdAt: new Date().toISOString()
      };
      mockExpenses.push(newExpense);
      return Promise.resolve(newExpense);
    }

    const response = await apiClient.post(`${this.baseUrl}/expenses`, expense);
    return response.data;
  }

  async updateExpense(id: number, expense: Partial<Expense>): Promise<Expense> {
    if (this.useMockData) {
      const index = mockExpenses.findIndex(e => e.id === id);
      if (index !== -1) {
        mockExpenses[index] = { ...mockExpenses[index], ...expense };
        return Promise.resolve(mockExpenses[index]);
      }
      throw new Error('Expense not found');
    }

    const response = await apiClient.patch(`${this.baseUrl}/expenses/${id}`, expense);
    return response.data;
  }

  async deleteExpense(id: number): Promise<void> {
    if (this.useMockData) {
      const index = mockExpenses.findIndex(e => e.id === id);
      if (index !== -1) {
        mockExpenses.splice(index, 1);
      }
      return Promise.resolve();
    }

    await apiClient.delete(`${this.baseUrl}/expenses/${id}`);
  }

  // Summary method
  async getSummary(): Promise<FinancialSummary> {
    if (this.useMockData) {
      const totalRevenue = mockInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
      const totalExpenses = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const paidRevenue = mockInvoices
        .filter(invoice => invoice.status === 'paid')
        .reduce((sum, invoice) => sum + invoice.amount, 0);
      
      return Promise.resolve({
        totalRevenue,
        totalExpenses,
        paidRevenue,
        netProfit: totalRevenue - totalExpenses
      });
    }

    try {
      const response = await apiClient.get(`${this.baseUrl}/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching summary:', error);
      return {
        totalRevenue: 0,
        totalExpenses: 0,
        paidRevenue: 0,
        netProfit: 0
      };
    }
  }
}

export const financeService = new FinanceService();
