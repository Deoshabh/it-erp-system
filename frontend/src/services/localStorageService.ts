/**
 * Local Storage Service for Sales Module
 * Provides functionality to store and retrieve sales data locally
 * This acts as a temporary solution until backend CRUD endpoints are implemented
 */

// Storage keys
const STORAGE_KEYS = {
  CUSTOMERS: 'sales_customers',
  ENQUIRIES: 'sales_enquiries',
  QUOTATIONS: 'sales_quotations',
  SALES_ORDERS: 'sales_sales_orders',
  INVOICES: 'sales_invoices',
  DISPATCHES: 'sales_dispatches',
  RETURNS: 'sales_returns'
};

/**
 * Generic storage utility
 */
class LocalStorageService {
  /**
   * Get data from localStorage
   */
  static getData<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error getting data from localStorage for key ${key}:`, error);
      return [];
    }
  }

  /**
   * Set data to localStorage
   */
  static setData<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error setting data to localStorage for key ${key}:`, error);
    }
  }

  /**
   * Add new item to stored data
   */
  static addItem<T extends { id: string }>(key: string, item: T): T {
    const items = this.getData<T>(key);
    const newItem = { ...item, id: this.generateId() };
    items.push(newItem);
    this.setData(key, items);
    return newItem;
  }

  /**
   * Update existing item
   */
  static updateItem<T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | null {
    const items = this.getData<T>(key);
    const index = items.findIndex(item => item.id === id);
    
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      this.setData(key, items);
      return items[index];
    }
    
    return null;
  }

  /**
   * Delete item
   */
  static deleteItem<T extends { id: string }>(key: string, id: string): boolean {
    const items = this.getData<T>(key);
    const filteredItems = items.filter((item: T) => item.id !== id);
    
    if (filteredItems.length !== items.length) {
      this.setData(key, filteredItems);
      return true;
    }
    
    return false;
  }

  /**
   * Generate unique ID
   */
  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Filter and search data
   */
  static filterData<T>(
    data: T[],
    searchTerm: string,
    searchFields: string[],
    filters?: { [key: string]: string }
  ): T[] {
    let filteredData = [...data];

    // Apply search filter
    if (searchTerm) {
      filteredData = filteredData.filter(item =>
        searchFields.some(field => {
          const value = (item as any)[field];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply additional filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          filteredData = filteredData.filter(item => (item as any)[key] === value);
        }
      });
    }

    return filteredData;
  }

  /**
   * Paginate data
   */
  static paginateData<T>(data: T[], page: number, limit: number) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      data: data.slice(startIndex, endIndex),
      meta: {
        total: data.length,
        page,
        limit,
        totalPages: Math.ceil(data.length / limit)
      }
    };
  }
}

// Specific services for each module
export class CustomerStorageService {
  static getCustomers() {
    return LocalStorageService.getData(STORAGE_KEYS.CUSTOMERS);
  }

  static addCustomer(customer: any) {
    return LocalStorageService.addItem(STORAGE_KEYS.CUSTOMERS, {
      ...customer,
      customerCode: `CUST-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  static updateCustomer(id: string, updates: any) {
    return LocalStorageService.updateItem(STORAGE_KEYS.CUSTOMERS, id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  static deleteCustomer(id: string) {
    return LocalStorageService.deleteItem(STORAGE_KEYS.CUSTOMERS, id);
  }

  static searchCustomers(searchTerm: string, statusFilter: string = 'all', page: number = 1, limit: number = 10) {
    const customers = this.getCustomers();
    let filtered = customers;

    // Filter by search term
    if (searchTerm) {
      const searchFields = ['name', 'email', 'company', 'customerCode'];
      filtered = LocalStorageService.filterData(filtered, searchTerm, searchFields);
    }

    // Filter by status
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter((customer: any) => customer.status === statusFilter);
    }

    return LocalStorageService.paginateData(filtered, page, limit);
  }

  static getAllCustomers() {
    return this.getCustomers();
  }
}

export class EnquiryStorageService {
  static getEnquiries() {
    return LocalStorageService.getData(STORAGE_KEYS.ENQUIRIES);
  }

  static addEnquiry(enquiry: any) {
    return LocalStorageService.addItem(STORAGE_KEYS.ENQUIRIES, {
      ...enquiry,
      enquiryNumber: `ENQ-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  static updateEnquiry(id: string, updates: any) {
    return LocalStorageService.updateItem(STORAGE_KEYS.ENQUIRIES, id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  static deleteEnquiry(id: string) {
    return LocalStorageService.deleteItem(STORAGE_KEYS.ENQUIRIES, id);
  }

  static searchEnquiries(searchTerm: string, statusFilter: string = 'all', priorityFilter: string = 'all', page: number = 1, limit: number = 10) {
    const enquiries = this.getEnquiries();
    let filtered = enquiries;

    // Filter by search term
    if (searchTerm) {
      const searchFields = ['customerName', 'subject', 'description', 'company'];
      filtered = LocalStorageService.filterData(filtered, searchTerm, searchFields);
    }

    // Filter by status
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter((enquiry: any) => enquiry.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter && priorityFilter !== 'all') {
      filtered = filtered.filter((enquiry: any) => enquiry.priority === priorityFilter);
    }

    return LocalStorageService.paginateData(filtered, page, limit);
  }

  static getAllEnquiries() {
    return this.getEnquiries();
  }
}

export class QuotationStorageService {
  static getQuotations() {
    return LocalStorageService.getData(STORAGE_KEYS.QUOTATIONS);
  }

  static addQuotation(quotation: any) {
    return LocalStorageService.addItem(STORAGE_KEYS.QUOTATIONS, {
      ...quotation,
      quotationNumber: `QT-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  static updateQuotation(id: string, updates: any) {
    return LocalStorageService.updateItem(STORAGE_KEYS.QUOTATIONS, id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  static deleteQuotation(id: string) {
    return LocalStorageService.deleteItem(STORAGE_KEYS.QUOTATIONS, id);
  }

  static searchQuotations(searchTerm: string, statusFilter: string = 'all', page: number = 1, limit: number = 10) {
    const quotations = this.getQuotations();
    const searchFields = ['quotationNumber', 'customer', 'subject'];
    const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined;
    const filtered = LocalStorageService.filterData(quotations, searchTerm, searchFields, filters);
    return LocalStorageService.paginateData(filtered, page, limit);
  }
}

export class SalesOrderStorageService {
  static getSalesOrders() {
    return LocalStorageService.getData(STORAGE_KEYS.SALES_ORDERS);
  }

  static addSalesOrder(order: any) {
    return LocalStorageService.addItem(STORAGE_KEYS.SALES_ORDERS, {
      ...order,
      orderNumber: `SO-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  static updateSalesOrder(id: string, updates: any) {
    return LocalStorageService.updateItem(STORAGE_KEYS.SALES_ORDERS, id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  static deleteSalesOrder(id: string) {
    return LocalStorageService.deleteItem(STORAGE_KEYS.SALES_ORDERS, id);
  }

  static searchSalesOrders(searchTerm: string, statusFilter: string = 'all', page: number = 1, limit: number = 10) {
    const orders = this.getSalesOrders();
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      const searchFields = ['orderNumber', 'customerName', 'quotationRef'];
      filtered = LocalStorageService.filterData(filtered, searchTerm, searchFields);
    }

    // Filter by status
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter((order: any) => order.status === statusFilter);
    }

    return LocalStorageService.paginateData(filtered, page, limit);
  }

  static getAllSalesOrders() {
    return this.getSalesOrders();
  }
}

export class InvoiceStorageService {
  static getInvoices() {
    return LocalStorageService.getData(STORAGE_KEYS.INVOICES);
  }

  static addInvoice(invoice: any) {
    return LocalStorageService.addItem(STORAGE_KEYS.INVOICES, {
      ...invoice,
      invoiceNumber: `INV-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  static updateInvoice(id: string, updates: any) {
    return LocalStorageService.updateItem(STORAGE_KEYS.INVOICES, id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  static deleteInvoice(id: string) {
    return LocalStorageService.deleteItem(STORAGE_KEYS.INVOICES, id);
  }

  static searchInvoices(searchTerm: string, statusFilter: string = 'all', page: number = 1, limit: number = 10) {
    const invoices = this.getInvoices();
    const searchFields = ['invoiceNumber', 'customer'];
    const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined;
    const filtered = LocalStorageService.filterData(invoices, searchTerm, searchFields, filters);
    return LocalStorageService.paginateData(filtered, page, limit);
  }

  static getAllInvoices() {
    return this.getInvoices();
  }
}

export class DispatchStorageService {
  static getDispatches() {
    return LocalStorageService.getData(STORAGE_KEYS.DISPATCHES);
  }

  static addDispatch(dispatch: any) {
    return LocalStorageService.addItem(STORAGE_KEYS.DISPATCHES, {
      ...dispatch,
      dispatchNumber: `DISP-${Date.now()}`,
      trackingNumber: `TRK-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  static updateDispatch(id: string, updates: any) {
    return LocalStorageService.updateItem(STORAGE_KEYS.DISPATCHES, id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  static deleteDispatch(id: string) {
    return LocalStorageService.deleteItem(STORAGE_KEYS.DISPATCHES, id);
  }

  static searchDispatches(searchTerm: string, statusFilter: string = 'all', page: number = 1, limit: number = 10) {
    const dispatches = this.getDispatches();
    const searchFields = ['dispatchNumber', 'orderNumber', 'customer'];
    const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined;
    const filtered = LocalStorageService.filterData(dispatches, searchTerm, searchFields, filters);
    return LocalStorageService.paginateData(filtered, page, limit);
  }
}

export class ReturnStorageService {
  static getReturns() {
    return LocalStorageService.getData(STORAGE_KEYS.RETURNS);
  }

  static addReturn(returnItem: any) {
    return LocalStorageService.addItem(STORAGE_KEYS.RETURNS, {
      ...returnItem,
      returnNumber: `RET-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  static updateReturn(id: string, updates: any) {
    return LocalStorageService.updateItem(STORAGE_KEYS.RETURNS, id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  static deleteReturn(id: string) {
    return LocalStorageService.deleteItem(STORAGE_KEYS.RETURNS, id);
  }

  static searchReturns(searchTerm: string, statusFilter: string = 'all', page: number = 1, limit: number = 10) {
    const returns = this.getReturns();
    const searchFields = ['returnNumber', 'orderNumber', 'customer'];
    const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined;
    const filtered = LocalStorageService.filterData(returns, searchTerm, searchFields, filters);
    return LocalStorageService.paginateData(filtered, page, limit);
  }
}

export default LocalStorageService;
