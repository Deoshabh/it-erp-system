import { apiClient } from './apiClient';

export interface ProcurementRequest {
  id?: string;
  requestId: string;
  title: string;
  description: string;
  category: 'office_supplies' | 'it_equipment' | 'software_licenses' | 'furniture' | 'marketing' | 'travel' | 'training' | 'services' | 'maintenance' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'ordered' | 'received' | 'cancelled';
  estimatedAmount: number;
  actualAmount?: number;
  vendor?: string;
  vendorContact?: string;
  requiredBy?: string;
  department: string;
  requester: {
    firstName: string;
    lastName: string;
    email: string;
  };
  approver?: {
    firstName: string;
    lastName: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ProcurementFilters {
  search?: string;
  status?: string;
  category?: string;
  priority?: string;
  department?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProcurementStats {
  total: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
  totalBudget: number;
  pendingBudget: number;
  averageProcessingTime: number;
}

class ProcurementService {
  private baseUrl = '/procurement';

  async getAllRequests(filters?: ProcurementFilters): Promise<ProcurementRequest[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value.toString());
        });
      }
      
      const url = params.toString() ? `${this.baseUrl}?${params.toString()}` : this.baseUrl;
      const response = await apiClient.get(url);
      
      // Ensure we always return an array
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
        return data.data;
      } else {
        console.warn('API returned non-array data for procurement requests:', data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching procurement requests:', error);
      return [];
    }
  }

  async getRequestById(id: string): Promise<ProcurementRequest | null> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching procurement request:', error);
      return null;
    }
  }

  async createRequest(request: Omit<ProcurementRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProcurementRequest> {
    try {
      const response = await apiClient.post(this.baseUrl, request);
      return response.data;
    } catch (error) {
      console.error('Error creating procurement request:', error);
      throw error;
    }
  }

  async updateRequest(id: string, request: Partial<ProcurementRequest>): Promise<ProcurementRequest> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${id}`, request);
      return response.data;
    } catch (error) {
      console.error('Error updating procurement request:', error);
      throw error;
    }
  }

  async deleteRequest(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Error deleting procurement request:', error);
      throw error;
    }
  }

  async approveRequest(id: string): Promise<ProcurementRequest> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving procurement request:', error);
      throw error;
    }
  }

  async rejectRequest(id: string, reason?: string): Promise<ProcurementRequest> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting procurement request:', error);
      throw error;
    }
  }

  async getStats(): Promise<ProcurementStats> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching procurement stats:', error);
      return {
        total: 0,
        pendingApproval: 0,
        approved: 0,
        rejected: 0,
        totalBudget: 0,
        pendingBudget: 0,
        averageProcessingTime: 0,
      };
    }
  }

  async exportRequests(format: 'csv' | 'excel' | 'pdf', filters?: ProcurementFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value.toString());
        });
      }
      
      const url = params.toString() 
        ? `${this.baseUrl}/export/${format}?${params.toString()}` 
        : `${this.baseUrl}/export/${format}`;
      
      const response = await apiClient.get(url, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting procurement requests:', error);
      throw error;
    }
  }
}

export const procurementService = new ProcurementService();
