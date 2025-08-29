import { financeService } from './financeService';
import { procurementService } from './procurementService';
import { employeeStatsService, EmployeeStats } from './employeeStatsService';
import { apiClient } from './apiClient';

export interface FinanceStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  invoices: number;
  expenses: number;
}

export interface ProcurementStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalValue: number;
}

export interface FileStats {
  total: number;
  totalSize: number;
  types: { [key: string]: number };
}

export interface ReportData {
  employees: EmployeeStats;
  finance: FinanceStats;
  procurement: ProcurementStats;
  files: FileStats;
}

class ReportsService {
  private baseUrl = '/reports';

  async getEmployeeStats(): Promise<EmployeeStats> {
    try {
      // Try to get stats from backend first
      const stats = await employeeStatsService.getStats();
      if (stats.total > 0) {
        return stats;
      }
      // Fallback to calculating from employee data
      return await employeeStatsService.calculateStatsFromEmployees();
    } catch (error) {
      console.error('Error fetching employee stats:', error);
      // Final fallback to default stats
      return {
        total: 0,
        active: 0,
        departments: {},
        totalSalary: 0,
        averageSalary: 0,
      };
    }
  }

  async getFinanceStats(): Promise<FinanceStats> {
    try {
      const summary = await financeService.getFinancialSummary();
      const invoices = await financeService.getAllInvoices();
      const expenses = await financeService.getAllExpenses();

      return {
        totalRevenue: summary.totalRevenue || 0,
        totalExpenses: summary.totalExpenses || 0,
        netProfit: (summary.totalRevenue || 0) - (summary.totalExpenses || 0),
        invoices: invoices.length,
        expenses: expenses.length,
      };
    } catch (error) {
      console.error('Error fetching finance stats:', error);
      return {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        invoices: 0,
        expenses: 0,
      };
    }
  }

  async getProcurementStats(): Promise<ProcurementStats> {
    try {
      const stats = await procurementService.getStats();
      return {
        total: stats.total || 0,
        pending: stats.pendingApproval || 0,
        approved: stats.approved || 0,
        rejected: stats.rejected || 0,
        totalValue: stats.totalBudget || 0,
      };
    } catch (error) {
      console.error('Error fetching procurement stats:', error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalValue: 0,
      };
    }
  }

  async getFileStats(): Promise<FileStats> {
    try {
      const response = await apiClient.get('/files/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching file stats:', error);
      return {
        total: 0,
        totalSize: 0,
        types: {},
      };
    }
  }

  async getAllReportData(): Promise<ReportData> {
    try {
      const [employees, finance, procurement, files] = await Promise.all([
        this.getEmployeeStats(),
        this.getFinanceStats(),
        this.getProcurementStats(),
        this.getFileStats(),
      ]);

      return {
        employees,
        finance,
        procurement,
        files,
      };
    } catch (error) {
      console.error('Error fetching all report data:', error);
      // Return empty stats if everything fails
      return {
        employees: {
          total: 0,
          active: 0,
          departments: {},
          totalSalary: 0,
          averageSalary: 0,
        },
        finance: {
          totalRevenue: 0,
          totalExpenses: 0,
          netProfit: 0,
          invoices: 0,
          expenses: 0,
        },
        procurement: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          totalValue: 0,
        },
        files: {
          total: 0,
          totalSize: 0,
          types: {},
        },
      };
    }
  }

  async exportReport(type: 'pdf' | 'excel' | 'csv', format: 'summary' | 'detailed' = 'summary'): Promise<Blob> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/export/${type}/${format}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }

  async scheduleReport(
    type: 'daily' | 'weekly' | 'monthly',
    recipients: string[],
    format: 'pdf' | 'excel' = 'pdf'
  ): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/schedule`, {
        type,
        recipients,
        format,
      });
    } catch (error) {
      console.error('Error scheduling report:', error);
      throw error;
    }
  }
}

export const reportsService = new ReportsService();
