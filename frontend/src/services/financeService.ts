import { apiClient } from './apiClient';

export interface Invoice {
  id?: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  amount: number;
  dueDate: string;
  status: string;
  items?: any[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  id?: string;
  description: string;
  category: string;
  vendor?: string;
  amount: number;
  date: string;
  status?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  paidRevenue: number;
  netProfit: number;
}

class FinanceService {
  private baseUrl = '/finance';

  // Invoice methods
  async getAllInvoices(): Promise<Invoice[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/invoices`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  }

  async createInvoice(invoice: Omit<Invoice, 'id'>): Promise<Invoice> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/invoices`, invoice);
      return response.data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  async updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/invoices/${id}`, invoice);
      return response.data;
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  async deleteInvoice(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/invoices/${id}`);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }

  // Expense methods
  async getAllExpenses(): Promise<Expense[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/expenses`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }
  }

  async createExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/expenses`, expense);
      return response.data;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  async updateExpense(id: string, expense: Partial<Expense>): Promise<Expense> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/expenses/${id}`, expense);
      return response.data;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  async deleteExpense(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/expenses/${id}`);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  // Dashboard/Summary methods
  async getFinancialSummary(): Promise<FinancialSummary> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      // Fallback to local calculation if backend endpoint fails
      const [invoices, expenses] = await Promise.all([
        this.getAllInvoices(),
        this.getAllExpenses()
      ]);

      const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
      const paidRevenue = invoices
        .filter(invoice => invoice.status === 'paid')
        .reduce((sum, invoice) => sum + invoice.amount, 0);
      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const netProfit = paidRevenue - totalExpenses;

      return {
        totalRevenue,
        totalExpenses,
        paidRevenue,
        netProfit
      };
    }
  }
}

export const financeService = new FinanceService();
