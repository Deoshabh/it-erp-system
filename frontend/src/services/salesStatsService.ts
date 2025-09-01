/**
 * Sales Statistics Service for Local Storage
 * Provides aggregated statistics from all sales modules
 */

import { 
  CustomerStorageService, 
  EnquiryStorageService, 
  QuotationStorageService, 
  SalesOrderStorageService, 
  InvoiceStorageService,
  DispatchStorageService 
} from './localStorageService';

export interface SalesStats {
  totalCustomers: number;
  totalEnquiries: number;
  totalQuotations: number;
  totalOrders: number;
  totalRevenue: number;
  pendingDispatches: number;
  overdueInvoices: number;
  activeReturns: number;
}

export class SalesStatsService {
  static getSalesStatistics(): SalesStats {
    try {
      // Get all data from localStorage
      const customers = CustomerStorageService.getAllCustomers();
      const enquiries = EnquiryStorageService.getAllEnquiries();
      const quotations = QuotationStorageService.getQuotations();
      const salesOrders = SalesOrderStorageService.getAllSalesOrders();
      const invoices = InvoiceStorageService.getAllInvoices();
      
      // Calculate statistics
      const totalCustomers = customers.length;
      const totalEnquiries = enquiries.length;
      const totalQuotations = quotations.length;
      const totalOrders = salesOrders.length;
      
      // Calculate total revenue from sales orders
      const totalRevenue = salesOrders.reduce((sum: number, order: any) => {
        return sum + (order.total || order.totalAmount || 0);
      }, 0);
      
      // Calculate pending dispatches (orders with status 'ready-to-ship' or 'processing')
      const pendingDispatches = salesOrders.filter((order: any) => 
        order.status === 'ready-to-ship' || order.status === 'processing'
      ).length;
      
      // Calculate overdue invoices (invoices with status 'overdue' or past due date)
      const overdueInvoices = invoices.filter((invoice: any) => {
        if (invoice.status === 'overdue') return true;
        if (invoice.dueDate) {
          const dueDate = new Date(invoice.dueDate);
          const today = new Date();
          return dueDate < today && invoice.status === 'pending';
        }
        return false;
      }).length;
      
      // For now, set activeReturns to 0 as we don't have returns module implemented
      const activeReturns = 0;
      
      return {
        totalCustomers,
        totalEnquiries,
        totalQuotations,
        totalOrders,
        totalRevenue,
        pendingDispatches,
        overdueInvoices,
        activeReturns
      };
    } catch (error) {
      console.error('Error calculating sales statistics:', error);
      return {
        totalCustomers: 0,
        totalEnquiries: 0,
        totalQuotations: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingDispatches: 0,
        overdueInvoices: 0,
        activeReturns: 0
      };
    }
  }

  static getCustomerStatistics() {
    try {
      const customers = CustomerStorageService.getAllCustomers();
      const activeCustomers = customers.filter((customer: any) => customer.status === 'active').length;
      const inactiveCustomers = customers.filter((customer: any) => customer.status === 'inactive').length;
      const potentialCustomers = customers.filter((customer: any) => customer.status === 'potential').length;
      
      return {
        total: customers.length,
        active: activeCustomers,
        inactive: inactiveCustomers,
        potential: potentialCustomers
      };
    } catch (error) {
      console.error('Error calculating customer statistics:', error);
      return { total: 0, active: 0, inactive: 0, potential: 0 };
    }
  }

  static getEnquiryStatistics() {
    try {
      const enquiries = EnquiryStorageService.getAllEnquiries();
      const newEnquiries = enquiries.filter((enquiry: any) => enquiry.status === 'new').length;
      const inProgressEnquiries = enquiries.filter((enquiry: any) => enquiry.status === 'in-progress').length;
      const closedEnquiries = enquiries.filter((enquiry: any) => enquiry.status === 'closed').length;
      
      return {
        total: enquiries.length,
        new: newEnquiries,
        inProgress: inProgressEnquiries,
        closed: closedEnquiries
      };
    } catch (error) {
      console.error('Error calculating enquiry statistics:', error);
      return { total: 0, new: 0, inProgress: 0, closed: 0 };
    }
  }

  static getQuotationStatistics() {
    try {
      const quotations = QuotationStorageService.getQuotations();
      const draftQuotations = quotations.filter((quotation: any) => quotation.status === 'draft').length;
      const sentQuotations = quotations.filter((quotation: any) => quotation.status === 'sent').length;
      const acceptedQuotations = quotations.filter((quotation: any) => quotation.status === 'accepted').length;
      const rejectedQuotations = quotations.filter((quotation: any) => quotation.status === 'rejected').length;
      
      return {
        total: quotations.length,
        draft: draftQuotations,
        sent: sentQuotations,
        accepted: acceptedQuotations,
        rejected: rejectedQuotations
      };
    } catch (error) {
      console.error('Error calculating quotation statistics:', error);
      return { total: 0, draft: 0, sent: 0, accepted: 0, rejected: 0 };
    }
  }

  static getSalesOrderStatistics() {
    try {
      const salesOrders = SalesOrderStorageService.getAllSalesOrders();
      const pendingOrders = salesOrders.filter((order: any) => order.status === 'pending').length;
      const processingOrders = salesOrders.filter((order: any) => order.status === 'processing').length;
      const readyToShipOrders = salesOrders.filter((order: any) => order.status === 'ready-to-ship').length;
      const deliveredOrders = salesOrders.filter((order: any) => order.status === 'delivered').length;
      
      const totalValue = salesOrders.reduce((sum: number, order: any) => {
        return sum + (order.total || order.totalAmount || 0);
      }, 0);
      
      return {
        total: salesOrders.length,
        pending: pendingOrders,
        processing: processingOrders,
        readyToShip: readyToShipOrders,
        delivered: deliveredOrders,
        totalValue
      };
    } catch (error) {
      console.error('Error calculating sales order statistics:', error);
      return { total: 0, pending: 0, processing: 0, readyToShip: 0, delivered: 0, totalValue: 0 };
    }
  }
}
