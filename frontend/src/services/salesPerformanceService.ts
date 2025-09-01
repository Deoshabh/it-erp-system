/**
 * Sales Performance Analytics Service
 * Generates performance data and analytics from localStorage data
 */

import { 
  CustomerStorageService,
  EnquiryStorageService,
  QuotationStorageService,
  SalesOrderStorageService,
  InvoiceStorageService
} from './localStorageService';

export interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
  target: number;
}

export interface ConversionData {
  stage: string;
  count: number;
  percentage: number;
  value: number;
}

export interface TrendData {
  period: string;
  customers: number;
  enquiries: number;
  quotations: number;
  orders: number;
}

export interface ProductPerformance {
  category: string;
  revenue: number;
  orders: number;
  growth: number;
}

export class SalesPerformanceService {
  /**
   * Generate monthly revenue data for the last 12 months
   */
  static getMonthlyRevenueData(): RevenueData[] {
    const salesOrders = SalesOrderStorageService.getAllSalesOrders();
    const currentDate = new Date();
    const monthsData: RevenueData[] = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      // Filter orders for this month
      const monthOrders = salesOrders.filter((order: any) => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === date.getMonth() && 
               orderDate.getFullYear() === date.getFullYear();
      });

      const monthlyRevenue = monthOrders.reduce((sum: number, order: any) => {
        return sum + (order.total || order.totalAmount || 0);
      }, 0);

      // Generate realistic targets (10-20% higher than revenue with some variation)
      const target = Math.round(monthlyRevenue * (1.1 + Math.random() * 0.1));

      monthsData.push({
        month: monthStr,
        revenue: monthlyRevenue,
        orders: monthOrders.length,
        target: Math.max(target, monthlyRevenue * 1.05) // Ensure target is at least 5% higher
      });
    }

    return monthsData;
  }

  /**
   * Generate conversion funnel data
   */
  static getConversionFunnelData(): ConversionData[] {
    const enquiries = EnquiryStorageService.getAllEnquiries();
    const quotations = QuotationStorageService.getQuotations();
    const salesOrders = SalesOrderStorageService.getAllSalesOrders();
    const invoices = InvoiceStorageService.getAllInvoices();

    const enquiryCount = enquiries.length;
    const quotationCount = quotations.length;
    const orderCount = salesOrders.length;
    const invoiceCount = invoices.length;

    // Calculate total values
    const enquiryValue = enquiries.reduce((sum: number, enq: any) => sum + (enq.estimatedValue || 50000), 0);
    const quotationValue = quotations.reduce((sum: number, quot: any) => sum + (quot.totalAmount || 0), 0);
    const orderValue = salesOrders.reduce((sum: number, order: any) => sum + (order.total || order.totalAmount || 0), 0);
    const invoiceValue = invoices.reduce((sum: number, inv: any) => sum + (inv.total || inv.totalAmount || 0), 0);

    return [
      {
        stage: 'Enquiries',
        count: enquiryCount,
        percentage: 100,
        value: enquiryValue
      },
      {
        stage: 'Quotations',
        count: quotationCount,
        percentage: enquiryCount > 0 ? Math.round((quotationCount / enquiryCount) * 100) : 0,
        value: quotationValue
      },
      {
        stage: 'Orders',
        count: orderCount,
        percentage: quotationCount > 0 ? Math.round((orderCount / quotationCount) * 100) : 0,
        value: orderValue
      },
      {
        stage: 'Invoices',
        count: invoiceCount,
        percentage: orderCount > 0 ? Math.round((invoiceCount / orderCount) * 100) : 0,
        value: invoiceValue
      }
    ];
  }

  /**
   * Generate weekly trend data for the last 8 weeks
   */
  static getWeeklyTrendData(): TrendData[] {
    const customers = CustomerStorageService.getAllCustomers();
    const enquiries = EnquiryStorageService.getAllEnquiries();
    const quotations = QuotationStorageService.getQuotations();
    const salesOrders = SalesOrderStorageService.getAllSalesOrders();

    const currentDate = new Date();
    const weeksData: TrendData[] = [];

    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const periodStr = `Week ${8 - i}`;

      // Count items created in this week
      const weekCustomers = customers.filter((item: any) => {
        if (!item.createdAt) return false;
        const itemDate = new Date(item.createdAt);
        return itemDate >= weekStart && itemDate <= weekEnd;
      }).length;

      const weekEnquiries = enquiries.filter((item: any) => {
        if (!item.createdAt) return false;
        const itemDate = new Date(item.createdAt);
        return itemDate >= weekStart && itemDate <= weekEnd;
      }).length;

      const weekQuotations = quotations.filter((item: any) => {
        if (!item.createdAt) return false;
        const itemDate = new Date(item.createdAt);
        return itemDate >= weekStart && itemDate <= weekEnd;
      }).length;

      const weekOrders = salesOrders.filter((item: any) => {
        if (!item.createdAt) return false;
        const itemDate = new Date(item.createdAt);
        return itemDate >= weekStart && itemDate <= weekEnd;
      }).length;

      weeksData.push({
        period: periodStr,
        customers: weekCustomers,
        enquiries: weekEnquiries,
        quotations: weekQuotations,
        orders: weekOrders
      });
    }

    return weeksData;
  }

  /**
   * Generate product/service performance data
   */
  static getProductPerformanceData(): ProductPerformance[] {
    const salesOrders = SalesOrderStorageService.getAllSalesOrders();
    const categories: { [key: string]: { revenue: number; orders: number; } } = {};

    // Analyze items in sales orders
    salesOrders.forEach((order: any) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const category = item.category || item.description || 'General';
          const revenue = (item.quantity || 1) * (item.unitPrice || 0);
          
          if (!categories[category]) {
            categories[category] = { revenue: 0, orders: 0 };
          }
          
          categories[category].revenue += revenue;
          categories[category].orders += 1;
        });
      } else {
        // Fallback for orders without detailed items
        const category = 'General Services';
        const revenue = order.total || order.totalAmount || 0;
        
        if (!categories[category]) {
          categories[category] = { revenue: 0, orders: 0 };
        }
        
        categories[category].revenue += revenue;
        categories[category].orders += 1;
      }
    });

    // Convert to array and calculate growth (simulated)
    return Object.entries(categories).map(([category, data]) => ({
      category,
      revenue: data.revenue,
      orders: data.orders,
      growth: Math.round((Math.random() * 40) - 10) // Random growth between -10% and +30%
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 6); // Top 6 categories
  }

  /**
   * Calculate key performance indicators
   */
  static getKPIs() {
    const customers = CustomerStorageService.getAllCustomers();
    const enquiries = EnquiryStorageService.getAllEnquiries();
    const quotations = QuotationStorageService.getQuotations();
    const salesOrders = SalesOrderStorageService.getAllSalesOrders();

    const totalRevenue = salesOrders.reduce((sum: number, order: any) => {
      return sum + (order.total || order.totalAmount || 0);
    }, 0);

    const averageOrderValue = salesOrders.length > 0 ? totalRevenue / salesOrders.length : 0;
    
    const conversionRate = enquiries.length > 0 ? 
      Math.round((salesOrders.length / enquiries.length) * 100) : 0;

    const quotationWinRate = quotations.length > 0 ? 
      Math.round((salesOrders.length / quotations.length) * 100) : 0;

    const customerGrowth = customers.length; // Simplified - in real app, calculate monthly growth

    return {
      totalRevenue,
      averageOrderValue,
      conversionRate,
      quotationWinRate,
      customerGrowth,
      totalCustomers: customers.length,
      totalOrders: salesOrders.length
    };
  }

  /**
   * Generate sales pipeline data
   */
  static getSalesPipelineData() {
    const enquiries = EnquiryStorageService.getAllEnquiries();
    const quotations = QuotationStorageService.getQuotations();
    const salesOrders = SalesOrderStorageService.getAllSalesOrders();

    const newEnquiries = enquiries.filter((e: any) => e.status === 'new').length;
    const inProgressEnquiries = enquiries.filter((e: any) => e.status === 'in-progress').length;
    const sentQuotations = quotations.filter((q: any) => q.status === 'sent').length;
    const acceptedQuotations = quotations.filter((q: any) => q.status === 'accepted').length;
    const pendingOrders = salesOrders.filter((o: any) => o.status === 'pending').length;
    const processingOrders = salesOrders.filter((o: any) => o.status === 'processing').length;

    return {
      newEnquiries,
      inProgressEnquiries,
      sentQuotations,
      acceptedQuotations,
      pendingOrders,
      processingOrders
    };
  }
}
