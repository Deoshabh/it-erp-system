import { apiClient } from './apiClient';

// Base interfaces
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Existing interfaces (preserved for backward compatibility)
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
  customerCode: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  contactPerson?: string;
  contactDesignation?: string;
  gstNumber?: string;
  panNumber?: string;
  creditLimit?: number;
  paymentTerms?: string;
  status: 'active' | 'inactive' | 'potential';
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

// New interfaces for 8 Sales modules
export interface Enquiry {
  id: string;
  enquiryNumber: string;
  customerId: string;
  customer?: Customer;
  enquiryDate: string;
  validTill?: string;
  subject: string;
  description?: string;
  productDetails: Array<{
    productName: string;
    quantity: number;
    specifications?: string;
    estimatedPrice?: number;
  }>;
  status: 'draft' | 'sent' | 'responded' | 'converted' | 'expired' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  enquiryId?: string;
  enquiry?: Enquiry;
  customerId: string;
  customer?: Customer;
  quotationDate: string;
  validTill: string;
  subject: string;
  items: Array<{
    productName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    taxRate?: number;
    amount: number;
  }>;
  subtotal: number;
  taxAmount: number;
  discountAmount?: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'revised';
  termsAndConditions?: string;
  notes?: string;
  assignedTo?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  quotationId?: string;
  quotation?: Quotation;
  customerId: string;
  customer?: Customer;
  orderDate: string;
  expectedDeliveryDate?: string;
  items: Array<{
    productName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    taxRate?: number;
    amount: number;
  }>;
  subtotal: number;
  taxAmount: number;
  discountAmount?: number;
  totalAmount: number;
  status: 'draft' | 'confirmed' | 'processing' | 'ready_for_dispatch' | 'dispatched' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid';
  deliveryAddress: string;
  specialInstructions?: string;
  assignedTo?: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SalesDispatch {
  id: string;
  dispatchNumber: string;
  salesOrderId: string;
  salesOrder?: SalesOrder;
  dispatchDate: string;
  items: Array<{
    productName: string;
    orderedQuantity: number;
    dispatchedQuantity: number;
    pendingQuantity: number;
  }>;
  status: 'draft' | 'ready' | 'dispatched' | 'in_transit' | 'delivered' | 'returned';
  transporterName?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  trackingNumber?: string;
  deliveryAddress: string;
  dispatchedBy?: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  salesOrderId?: string;
  salesOrder?: SalesOrder;
  customerId: string;
  customer?: Customer;
  invoiceDate: string;
  dueDate: string;
  items: Array<{
    productName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    taxRate?: number;
    amount: number;
  }>;
  subtotal: number;
  taxAmount: number;
  discountAmount?: number;
  totalAmount: number;
  paidAmount?: number;
  balanceAmount?: number;
  status: 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  paymentTerms?: string;
  bankDetails?: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SalesReturn {
  id: string;
  returnNumber: string;
  salesInvoiceId?: string;
  salesInvoice?: SalesInvoice;
  customerId: string;
  customer?: Customer;
  returnDate: string;
  items: Array<{
    productName: string;
    invoicedQuantity: number;
    returnedQuantity: number;
    unitPrice: number;
    reason: string;
    condition: 'good' | 'damaged' | 'defective';
    amount: number;
  }>;
  totalAmount: number;
  reason: 'defective' | 'wrong_item' | 'customer_request' | 'damage_in_transit' | 'other';
  status: 'draft' | 'approved' | 'processed' | 'refunded' | 'replaced' | 'rejected';
  refundMethod?: 'cash' | 'bank_transfer' | 'credit_note';
  processedBy?: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

// DTOs for creating/updating records
export interface CreateCustomerDto {
  name: string;
  email: string;
  phone?: string;
  company: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  contactPerson?: string;
  contactDesignation?: string;
  gstNumber?: string;
  panNumber?: string;
  creditLimit?: number;
  paymentTerms?: string;
  notes?: string;
  assignedTo?: string;
}

export interface CreateEnquiryDto {
  customerId: string;
  enquiryDate: string;
  validTill?: string;
  subject: string;
  description?: string;
  productDetails: Array<{
    productName: string;
    quantity: number;
    specifications?: string;
    estimatedPrice?: number;
  }>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  notes?: string;
}

export interface CreateQuotationDto {
  enquiryId?: string;
  customerId: string;
  quotationDate: string;
  validTill: string;
  subject: string;
  items: Array<{
    productName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    taxRate?: number;
  }>;
  termsAndConditions?: string;
  notes?: string;
  assignedTo?: string;
}

export interface CreateSalesOrderDto {
  quotationId?: string;
  customerId: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  items: Array<{
    productName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    taxRate?: number;
  }>;
  deliveryAddress: string;
  specialInstructions?: string;
  assignedTo?: string;
  notes?: string;
}

export interface CreateSalesDispatchDto {
  salesOrderId: string;
  dispatchDate: string;
  items: Array<{
    productName: string;
    dispatchedQuantity: number;
  }>;
  transporterName?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  deliveryAddress: string;
  dispatchedBy?: string;
  notes?: string;
}

export interface CreateSalesInvoiceDto {
  salesOrderId?: string;
  customerId: string;
  invoiceDate: string;
  dueDate: string;
  items: Array<{
    productName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    taxRate?: number;
  }>;
  paymentTerms?: string;
  bankDetails?: string;
  notes?: string;
}

export interface CreateSalesReturnDto {
  salesInvoiceId?: string;
  customerId: string;
  returnDate: string;
  items: Array<{
    productName: string;
    returnedQuantity: number;
    unitPrice: number;
    reason: string;
    condition: 'good' | 'damaged' | 'defective';
  }>;
  reason: 'defective' | 'wrong_item' | 'customer_request' | 'damage_in_transit' | 'other';
  refundMethod?: 'cash' | 'bank_transfer' | 'credit_note';
  notes?: string;
}

// Update DTOs
export type UpdateCustomerDto = Partial<CreateCustomerDto>;
export type UpdateEnquiryDto = Partial<CreateEnquiryDto>;
export type UpdateQuotationDto = Partial<CreateQuotationDto>;
export type UpdateSalesOrderDto = Partial<CreateSalesOrderDto>;
export type UpdateSalesDispatchDto = Partial<CreateSalesDispatchDto>;
export type UpdateSalesInvoiceDto = Partial<CreateSalesInvoiceDto>;
export type UpdateSalesReturnDto = Partial<CreateSalesReturnDto>;

// Sales Service Class
class SalesService {
  private baseUrl = '/api/sales';

  // Customer Management
  async getCustomers(params?: PaginationParams): Promise<PaginatedResponse<Customer>> {
    const response = await apiClient.get(`${this.baseUrl}/customers`, { params });
    return response.data;
  }

  async getCustomer(id: string): Promise<Customer> {
    const response = await apiClient.get(`${this.baseUrl}/customers/${id}`);
    return response.data;
  }

  async createCustomer(data: CreateCustomerDto): Promise<Customer> {
    const response = await apiClient.post(`${this.baseUrl}/customers`, data);
    return response.data;
  }

  async updateCustomer(id: string, data: UpdateCustomerDto): Promise<Customer> {
    const response = await apiClient.patch(`${this.baseUrl}/customers/${id}`, data);
    return response.data;
  }

  async deleteCustomer(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/customers/${id}`);
  }

  async getCustomerStatistics(): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/customers/statistics`);
    return response.data;
  }

  // Enquiry Management
  async getEnquiries(params?: PaginationParams): Promise<PaginatedResponse<Enquiry>> {
    const response = await apiClient.get(`${this.baseUrl}/enquiries`, { params });
    return response.data;
  }

  async getEnquiry(id: string): Promise<Enquiry> {
    const response = await apiClient.get(`${this.baseUrl}/enquiries/${id}`);
    return response.data;
  }

  async createEnquiry(data: CreateEnquiryDto): Promise<Enquiry> {
    const response = await apiClient.post(`${this.baseUrl}/enquiries`, data);
    return response.data;
  }

  async updateEnquiry(id: string, data: UpdateEnquiryDto): Promise<Enquiry> {
    const response = await apiClient.patch(`${this.baseUrl}/enquiries/${id}`, data);
    return response.data;
  }

  async deleteEnquiry(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/enquiries/${id}`);
  }

  async updateEnquiryStatus(id: string, status: string): Promise<Enquiry> {
    const response = await apiClient.patch(`${this.baseUrl}/enquiries/${id}/status`, { status });
    return response.data;
  }

  async convertEnquiryToQuotation(id: string): Promise<Quotation> {
    const response = await apiClient.post(`${this.baseUrl}/enquiries/${id}/convert-to-quotation`);
    return response.data;
  }

  async getEnquiryStatistics(): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/enquiries/statistics`);
    return response.data;
  }

  // Quotation Management
  async getQuotations(params?: PaginationParams): Promise<PaginatedResponse<Quotation>> {
    const response = await apiClient.get(`${this.baseUrl}/quotations`, { params });
    return response.data;
  }

  async getQuotation(id: string): Promise<Quotation> {
    const response = await apiClient.get(`${this.baseUrl}/quotations/${id}`);
    return response.data;
  }

  async createQuotation(data: CreateQuotationDto): Promise<Quotation> {
    const response = await apiClient.post(`${this.baseUrl}/quotations`, data);
    return response.data;
  }

  async updateQuotation(id: string, data: UpdateQuotationDto): Promise<Quotation> {
    const response = await apiClient.patch(`${this.baseUrl}/quotations/${id}`, data);
    return response.data;
  }

  async deleteQuotation(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/quotations/${id}`);
  }

  async updateQuotationStatus(id: string, status: string): Promise<Quotation> {
    const response = await apiClient.patch(`${this.baseUrl}/quotations/${id}/status`, { status });
    return response.data;
  }

  async confirmQuotation(id: string): Promise<SalesOrder> {
    const response = await apiClient.post(`${this.baseUrl}/quotations/${id}/confirm`);
    return response.data;
  }

  async getQuotationStatistics(): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/quotations/statistics`);
    return response.data;
  }

  // Sales Order Management
  async getSalesOrders(params?: PaginationParams): Promise<PaginatedResponse<SalesOrder>> {
    const response = await apiClient.get(`${this.baseUrl}/sales-orders`, { params });
    return response.data;
  }

  async getSalesOrder(id: string): Promise<SalesOrder> {
    const response = await apiClient.get(`${this.baseUrl}/sales-orders/${id}`);
    return response.data;
  }

  async createSalesOrder(data: CreateSalesOrderDto): Promise<SalesOrder> {
    const response = await apiClient.post(`${this.baseUrl}/sales-orders`, data);
    return response.data;
  }

  async updateSalesOrder(id: string, data: UpdateSalesOrderDto): Promise<SalesOrder> {
    const response = await apiClient.patch(`${this.baseUrl}/sales-orders/${id}`, data);
    return response.data;
  }

  async deleteSalesOrder(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/sales-orders/${id}`);
  }

  async updateSalesOrderStatus(id: string, status: string): Promise<SalesOrder> {
    const response = await apiClient.patch(`${this.baseUrl}/sales-orders/${id}/status`, { status });
    return response.data;
  }

  async getSalesOrderStatistics(): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/sales-orders/statistics`);
    return response.data;
  }

  // Sales Dispatch Management
  async getDispatches(params?: PaginationParams): Promise<PaginatedResponse<SalesDispatch>> {
    const response = await apiClient.get(`${this.baseUrl}/dispatches`, { params });
    return response.data;
  }

  async getDispatch(id: string): Promise<SalesDispatch> {
    const response = await apiClient.get(`${this.baseUrl}/dispatches/${id}`);
    return response.data;
  }

  async createDispatch(data: CreateSalesDispatchDto): Promise<SalesDispatch> {
    const response = await apiClient.post(`${this.baseUrl}/dispatches`, data);
    return response.data;
  }

  async updateDispatch(id: string, data: UpdateSalesDispatchDto): Promise<SalesDispatch> {
    const response = await apiClient.patch(`${this.baseUrl}/dispatches/${id}`, data);
    return response.data;
  }

  async deleteDispatch(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/dispatches/${id}`);
  }

  async updateDispatchStatus(id: string, status: string): Promise<SalesDispatch> {
    const response = await apiClient.patch(`${this.baseUrl}/dispatches/${id}/status`, { status });
    return response.data;
  }

  async getDispatchesStats(): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/dispatches/statistics`);
    return response.data;
  }

  // Sales Invoice Management
  async getInvoices(params?: PaginationParams): Promise<PaginatedResponse<SalesInvoice>> {
    const response = await apiClient.get(`${this.baseUrl}/invoices`, { params });
    return response.data;
  }

  async getInvoice(id: string): Promise<SalesInvoice> {
    const response = await apiClient.get(`${this.baseUrl}/invoices/${id}`);
    return response.data;
  }

  async createInvoice(data: CreateSalesInvoiceDto): Promise<SalesInvoice> {
    const response = await apiClient.post(`${this.baseUrl}/invoices`, data);
    return response.data;
  }

  async updateInvoice(id: string, data: UpdateSalesInvoiceDto): Promise<SalesInvoice> {
    const response = await apiClient.patch(`${this.baseUrl}/invoices/${id}`, data);
    return response.data;
  }

  async deleteInvoice(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/invoices/${id}`);
  }

  async updateInvoiceStatus(id: string, status: string): Promise<SalesInvoice> {
    const response = await apiClient.patch(`${this.baseUrl}/invoices/${id}/status`, { status });
    return response.data;
  }

  async getInvoicesStats(): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/invoices/statistics`);
    return response.data;
  }

  // Sales Return Management
  async getReturns(params?: PaginationParams): Promise<PaginatedResponse<SalesReturn>> {
    const response = await apiClient.get(`${this.baseUrl}/returns`, { params });
    return response.data;
  }

  async getReturn(id: string): Promise<SalesReturn> {
    const response = await apiClient.get(`${this.baseUrl}/returns/${id}`);
    return response.data;
  }

  async createReturn(data: CreateSalesReturnDto): Promise<SalesReturn> {
    const response = await apiClient.post(`${this.baseUrl}/returns`, data);
    return response.data;
  }

  async updateReturn(id: string, data: UpdateSalesReturnDto): Promise<SalesReturn> {
    const response = await apiClient.patch(`${this.baseUrl}/returns/${id}`, data);
    return response.data;
  }

  async deleteReturn(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/returns/${id}`);
  }

  async updateReturnStatus(id: string, status: string): Promise<SalesReturn> {
    const response = await apiClient.patch(`${this.baseUrl}/returns/${id}/status`, { status });
    return response.data;
  }

  async getReturnsStats(): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/returns/statistics`);
    return response.data;
  }

  // Legacy methods (preserved for backward compatibility)
  async getLeads(): Promise<Lead[]> {
    // For now, return empty array as we're focusing on the new 8 modules
    return [];
  }

  async getOpportunities(): Promise<Opportunity[]> {
    // For now, return empty array as we're focusing on the new 8 modules
    return [];
  }

  async getSalesStatistics(): Promise<any> {
    return {
      totalLeads: 0,
      totalCustomers: 0,
      totalOpportunities: 0,
      totalRevenue: 0,
      conversionRate: 0,
      pipelineValue: 0
    };
  }
}

export const salesService = new SalesService();
