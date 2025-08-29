import { apiClient } from './apiClient';

// Inventory interfaces
interface Warehouse {
  id: string;
  warehouseCode: string;
  name: string;
  type: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  // Additional UI fields
  managerName?: string;
  contactNumber?: string;
  email?: string;
  totalCapacity?: number;
  usedCapacity?: number;
  isActive: boolean;
  capacity?: number;
  currentOccupancy?: number;
  createdAt: string;
  updatedAt: string;
}

interface Item {
  id: string;
  itemCode: string;
  name: string;
  description?: string;
  type: string;
  category: string;
  unit: string;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  costPrice: number;
  sellingPrice: number;
  gstRate: number;
  hsnCode?: string;
  manufacturer?: string;
  brand?: string;
  barcode?: string;
  // Additional UI fields
  standardCost?: number;
  currentStock?: number;
  minimumStock?: number;
  maximumStock?: number;
  isBatchTracked?: boolean;
  isSerialTracked?: boolean;
  subcategory?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StockMovement {
  id: string;
  warehouseId: string;
  itemId: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  movementDate: string;
  reference?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdBy: string;
  // Additional UI fields
  referenceNumber?: string;
  unitCost?: number;
  totalValue?: number;
  createdAt: string;
  updatedAt: string;
  warehouse?: Warehouse;
  item?: Item;
}

export const inventoryService = {
  // Warehouse operations
  warehouses: {
    async getAll(): Promise<Warehouse[]> {
      try {
        const response = await apiClient.get('inventory/warehouses');
        return response.data;
      } catch (error) {
        console.error('Error fetching warehouses:', error);
        return [];
      }
    },

    async getById(id: string): Promise<Warehouse | null> {
      try {
        const response = await apiClient.get(`inventory/warehouses/${id}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching warehouse:', error);
        return null;
      }
    },

    async create(warehouseData: Partial<Warehouse>): Promise<Warehouse | null> {
      try {
        const response = await apiClient.post('inventory/warehouses', warehouseData);
        return response.data;
      } catch (error) {
        console.error('Error creating warehouse:', error);
        throw error;
      }
    },

    async update(id: string, warehouseData: Partial<Warehouse>): Promise<Warehouse | null> {
      try {
        const response = await apiClient.patch(`inventory/warehouses/${id}`, warehouseData);
        return response.data;
      } catch (error) {
        console.error('Error updating warehouse:', error);
        throw error;
      }
    },

    async delete(id: string): Promise<void> {
      try {
        await apiClient.delete(`inventory/warehouses/${id}`);
      } catch (error) {
        console.error('Error deleting warehouse:', error);
        throw error;
      }
    }
  },

  // Item operations
  items: {
    async getAll(filters?: any): Promise<Item[]> {
      try {
        const params = new URLSearchParams();
        if (filters) {
          Object.keys(filters).forEach(key => {
            if (filters[key]) {
              params.append(key, filters[key]);
            }
          });
        }
        
        const response = await apiClient.get(`inventory/items?${params.toString()}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching items:', error);
        return [];
      }
    },

    async getById(id: string): Promise<Item | null> {
      try {
        const response = await apiClient.get(`inventory/items/${id}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching item:', error);
        return null;
      }
    },

    async getLowStock(): Promise<Item[]> {
      try {
        const response = await apiClient.get('inventory/items/low-stock');
        return response.data;
      } catch (error) {
        console.error('Error fetching low stock items:', error);
        return [];
      }
    },

    async getCategories(): Promise<string[]> {
      try {
        const response = await apiClient.get('inventory/items/categories');
        return response.data;
      } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
    },

    async create(itemData: Partial<Item>): Promise<Item | null> {
      try {
        const response = await apiClient.post('inventory/items', itemData);
        return response.data;
      } catch (error) {
        console.error('Error creating item:', error);
        throw error;
      }
    },

    async update(id: string, itemData: Partial<Item>): Promise<Item | null> {
      try {
        const response = await apiClient.patch(`inventory/items/${id}`, itemData);
        return response.data;
      } catch (error) {
        console.error('Error updating item:', error);
        throw error;
      }
    },

    async updateStock(id: string, stockData: { quantity: number; warehouseId: string }): Promise<Item | null> {
      try {
        const response = await apiClient.patch(`inventory/items/${id}/stock`, stockData);
        return response.data;
      } catch (error) {
        console.error('Error updating stock:', error);
        throw error;
      }
    },

    async delete(id: string): Promise<void> {
      try {
        await apiClient.delete(`inventory/items/${id}`);
      } catch (error) {
        console.error('Error deleting item:', error);
        throw error;
      }
    }
  },

  // Stock movement operations
  stockMovements: {
    async getAll(filters?: any): Promise<StockMovement[]> {
      try {
        const params = new URLSearchParams();
        if (filters) {
          Object.keys(filters).forEach(key => {
            if (filters[key]) {
              params.append(key, filters[key]);
            }
          });
        }
        
        const response = await apiClient.get(`inventory/stock-movements?${params.toString()}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching stock movements:', error);
        return [];
      }
    },

    async getById(id: string): Promise<StockMovement | null> {
      try {
        const response = await apiClient.get(`inventory/stock-movements/${id}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching stock movement:', error);
        return null;
      }
    },

    async getSummary(): Promise<any> {
      try {
        const response = await apiClient.get('inventory/stock-movements/summary');
        return response.data;
      } catch (error) {
        console.error('Error fetching stock movement summary:', error);
        return {};
      }
    },

    async create(movementData: Partial<StockMovement>): Promise<StockMovement | null> {
      try {
        const response = await apiClient.post('inventory/stock-movements', movementData);
        return response.data;
      } catch (error) {
        console.error('Error creating stock movement:', error);
        throw error;
      }
    },

    async update(id: string, movementData: Partial<StockMovement>): Promise<StockMovement | null> {
      try {
        const response = await apiClient.patch(`inventory/stock-movements/${id}`, movementData);
        return response.data;
      } catch (error) {
        console.error('Error updating stock movement:', error);
        throw error;
      }
    },

    async complete(id: string): Promise<StockMovement | null> {
      try {
        const response = await apiClient.patch(`inventory/stock-movements/${id}/complete`);
        return response.data;
      } catch (error) {
        console.error('Error completing stock movement:', error);
        throw error;
      }
    },

    async cancel(id: string): Promise<StockMovement | null> {
      try {
        const response = await apiClient.patch(`inventory/stock-movements/${id}/cancel`);
        return response.data;
      } catch (error) {
        console.error('Error cancelling stock movement:', error);
        throw error;
      }
    },

    async delete(id: string): Promise<void> {
      try {
        await apiClient.delete(`inventory/stock-movements/${id}`);
      } catch (error) {
        console.error('Error deleting stock movement:', error);
        throw error;
      }
    }
  }
};

export type { Warehouse, Item, StockMovement };
