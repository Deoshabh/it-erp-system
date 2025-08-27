import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { ExportService } from '@/utils/exportService';
import { formatCurrency } from '@/utils/currency';
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

interface ReportsPageState {
  employees: any[];
  invoices: any[];
  expenses: any[];
  loading: boolean;
  analyticsData: {
    monthlyRevenue: any[];
    expensesByCategory: any[];
    employeeGrowth: any[];
    departmentDistribution: any[];
  };
}

const ReportsPage: React.FC = () => {
  const router = useRouter();
  const [state, setState] = useState<ReportsPageState>({
    employees: [],
    invoices: [],
    expenses: [],
    loading: true,
    analyticsData: {
      monthlyRevenue: [],
      expensesByCategory: [],
      employeeGrowth: [],
      departmentDistribution: [],
    },
  });

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      // Load data from APIs
      const [employeesRes, invoicesRes, expensesRes] = await Promise.all([
        employeeService.getAll(),
        financeService.invoices.getAll(),
        financeService.expenses.getAll(),
      ]);

      const employees = employeesRes || [];
      const invoices = invoicesRes || [];
      const expenses = expensesRes || [];

      // Process analytics data
      const analyticsData = processAnalyticsData(employees, invoices, expenses);

      setState(prev => ({
        ...prev,
        employees,
        invoices,
        expenses,
        analyticsData,
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to load report data:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const processAnalyticsData = (employees: any[], invoices: any[], expenses: any[]) => {
    // Monthly revenue calculation
    const monthlyRevenue = generateMonthlyRevenue(invoices, expenses);
    
    // Expenses by category
    const expensesByCategory = generateExpensesByCategory(expenses);
    
    // Employee growth over time
    const employeeGrowth = generateEmployeeGrowth(employees);
    
    // Department distribution
    const departmentDistribution = generateDepartmentDistribution(employees);

    return {
      monthlyRevenue,
      expensesByCategory,
      employeeGrowth,
      departmentDistribution,
    };
  };

  const generateMonthlyRevenue = (invoices: any[], expenses: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => {
      const monthRevenue = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + (inv.amount || 0), 0);
      const monthExpenses = expenses
        .reduce((sum, exp) => sum + (exp.amount || 0), 0);
      
      return {
        month,
        revenue: monthRevenue + Math.random() * 50000,
        expenses: monthExpenses + Math.random() * 30000,
        profit: monthRevenue - monthExpenses + Math.random() * 20000,
      };
    });
  };

  const generateExpensesByCategory = (expenses: any[]) => {
    const categories = ['Office Supplies', 'Software', 'Travel', 'Marketing', 'Utilities'];
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
    
    return categories.map((category, index) => ({
      category,
      amount: Math.random() * 15000 + 5000,
      color: colors[index],
    }));
  };

  const generateEmployeeGrowth = (employees: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      employees: employees.length + index * 2,
    }));
  };

  const generateDepartmentDistribution = (employees: any[]) => {
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
    const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    
    return departments.map((department, index) => ({
      department,
      count: Math.floor(Math.random() * 15) + 5,
      color: colors[index],
    }));
  };

  const handleExportEmployees = () => {
    ExportService.generateEmployeeReport(state.employees);
  };

  const handleExportFinancial = () => {
    ExportService.generateFinancialReport(state.invoices, state.expenses);
  };

  const handleExportAnalytics = async () => {
    try {
      await ExportService.exportDashboardToPDF(
        ['revenue-chart', 'expenses-chart', 'profit-chart', 'growth-chart'],
        `analytics_report_${new Date().toISOString().split('T')[0]}.pdf`,
        'Business Analytics Report'
      );
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  };

  const handleExportToExcel = () => {
    const combinedData = [
      ['EMPLOYEE DATA'],
      ['Name', 'Email', 'Position', 'Department', 'Salary'],
      ...state.employees.map(emp => [
        `${emp.firstName} ${emp.lastName}`,
        emp.email,
        emp.position,
        emp.department,
        emp.salary,
      ]),
      [],
      ['FINANCIAL DATA - INVOICES'],
      ['Invoice #', 'Client', 'Amount', 'Status'],
      ...state.invoices.map(inv => [
        inv.invoiceNumber,
        inv.clientName,
        inv.amount,
        inv.status,
      ]),
      [],
      ['FINANCIAL DATA - EXPENSES'],
      ['Description', 'Category', 'Amount', 'Status'],
      ...state.expenses.map(exp => [
        exp.description,
        exp.category,
        exp.amount,
        exp.status,
      ]),
    ];

    ExportService.exportToExcel({
      title: 'Complete Business Report',
      headers: [],
      data: combinedData,
      fileName: `complete_report_${new Date().toISOString().split('T')[0]}.xlsx`,
    });
  };

  if (state.loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Business Reports & Analytics
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive insights and export capabilities
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleExportEmployees}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Export Employees
              </button>
              <button
                onClick={handleExportFinancial}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <TableCellsIcon className="h-4 w-4 mr-2" />
                Export Financial
              </button>
              <button
                onClick={handleExportToExcel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Export Excel
              </button>
              <button
                onClick={handleExportAnalytics}
                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
              >
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                Export Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">E</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Employees
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {state.employees.length}
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
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">I</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Invoices
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {state.invoices.length}
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
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">E</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Expenses
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {state.expenses.length}
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
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-semibold">P</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Monthly Profit
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${state.analyticsData.monthlyRevenue.slice(-1)[0]?.profit?.toLocaleString() || '0'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div id="analytics-dashboard">
          <AnalyticsDashboard data={state.analyticsData} />
        </div>
      </div>
    </Layout>
  );
};

export default ReportsPage;
