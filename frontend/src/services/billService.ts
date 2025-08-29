import { apiClient } from './apiClient';

interface Bill {
  id: string;
  billNumber: string;
  billType: 'purchase_bill' | 'sales_bill' | 'service_bill' | 'debit_note' | 'credit_note';
  vendorName: string;
  vendorGstin?: string;
  vendorEmail?: string;
  vendorPhone?: string;
  vendorAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  billDate: string;
  dueDate: string;
  status: 'draft' | 'pending' | 'approved' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAmount: number;
  discountAmount: number;
  tdsAmount: number;
  totalAmount: number;
  billItems: BillItem[];
  payments: BillPayment[];
  notes?: string;
  termsAndConditions?: string;
  createdAt: string;
  updatedAt: string;
}

interface BillItem {
  id: string;
  description: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  rate: number;
  gstRate: number;
  amount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAmount: number;
  totalAmount: number;
}

interface BillPayment {
  id: string;
  paymentDate: string;
  paidAmount: number;
  paymentMethod: 'cash' | 'cheque' | 'bank_transfer' | 'upi' | 'card' | 'other';
  paymentReference?: string;
  notes?: string;
}

interface BillSummary {
  totalBills: number;
  pendingBills: number;
  overdueBills: number;
  paidBills: number;
  totalAmount: number;
  pendingAmount: number;
}

interface CreateBillData {
  billNumber: string;
  billType: string;
  vendorName: string;
  vendorGstin?: string;
  vendorEmail?: string;
  vendorPhone?: string;
  vendorAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  billDate: string;
  dueDate: string;
  discountAmount?: number;
  tdsAmount?: number;
  billItems: Array<{
    description: string;
    hsnCode: string;
    quantity: number;
    unit: string;
    rate: number;
    gstRate: number;
  }>;
  notes?: string;
  termsAndConditions?: string;
}

interface CreatePaymentData {
  paymentDate: string;
  paidAmount: number;
  paymentMethod: string;
  paymentReference?: string;
  notes?: string;
}

export const billService = {
  async getAll(filters?: any): Promise<Bill[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key]) {
            params.append(key, filters[key]);
          }
        });
      }
      
      const response = await apiClient.get(`bills?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bills:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Bill | null> {
    try {
      const response = await apiClient.get(`bills/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bill:', error);
      return null;
    }
  },

  async create(billData: CreateBillData): Promise<Bill | null> {
    try {
      const response = await apiClient.post('bills', billData);
      return response.data;
    } catch (error) {
      console.error('Error creating bill:', error);
      throw error;
    }
  },

  async update(id: string, billData: Partial<CreateBillData>): Promise<Bill | null> {
    try {
      const response = await apiClient.put(`bills/${id}`, billData);
      return response.data;
    } catch (error) {
      console.error('Error updating bill:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`bills/${id}`);
    } catch (error) {
      console.error('Error deleting bill:', error);
      throw error;
    }
  },

  async approve(id: string): Promise<Bill | null> {
    try {
      const response = await apiClient.patch(`bills/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving bill:', error);
      throw error;
    }
  },

  async addPayment(id: string, paymentData: CreatePaymentData): Promise<Bill | null> {
    try {
      const response = await apiClient.post(`bills/${id}/payments`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  },

  async downloadPDF(id: string): Promise<void> {
    try {
      const response = await apiClient.get(`bills/${id}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bill-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  },

  async getSummary(): Promise<BillSummary> {
    try {
      const response = await apiClient.get('bills/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching summary:', error);
      return {
        totalBills: 0,
        pendingBills: 0,
        overdueBills: 0,
        paidBills: 0,
        totalAmount: 0,
        pendingAmount: 0
      };
    }
  },

  async downloadGSTReport(fromDate: string, toDate: string): Promise<void> {
    try {
      const response = await apiClient.get('bills/gst-report/pdf', {
        params: { fromDate, toDate },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `gst-report-${fromDate}-to-${toDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading GST report:', error);
      throw error;
    }
  }
};

export type { Bill, BillItem, BillPayment, BillSummary, CreateBillData, CreatePaymentData };
