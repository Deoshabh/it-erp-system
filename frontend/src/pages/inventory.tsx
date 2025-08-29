import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import RoleBasedComponent from '../components/auth/RoleBasedComponent';
import Layout from '../components/layout/Layout';
import { inventoryService, Warehouse, Item, StockMovement } from '../services/inventoryService';

interface Zone {
  id: string;
  zoneCode: string;
  name: string;
  type: string;
  capacity: number;
  usedCapacity: number;
  isActive: boolean;
}

export default function InventoryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'warehouses' | 'items' | 'movements'>('warehouses');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'warehouses') {
        const data = await inventoryService.warehouses.getAll();
        setWarehouses(data);
      } else if (activeTab === 'items') {
        const data = await inventoryService.items.getAll();
        setItems(data);
      } else if (activeTab === 'movements') {
        const data = await inventoryService.stockMovements.getAll();
        setStockMovements(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ tab, label, active, onClick }: { 
    tab: string; 
    label: string; 
    active: boolean; 
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-md ${
        active
          ? 'bg-blue-100 text-blue-700 border border-blue-300'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  const WarehouseCard = ({ warehouse }: { warehouse: Warehouse }) => {
    const capacityPercentage = warehouse.totalCapacity && warehouse.usedCapacity ? 
      (warehouse.usedCapacity / warehouse.totalCapacity * 100).toFixed(1) : '0';

    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{warehouse.name}</h3>
            <p className="text-sm text-gray-500">Code: {warehouse.warehouseCode}</p>
            <p className="text-sm text-gray-500">Type: {warehouse.type}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            warehouse.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {warehouse.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm">
            <span>Capacity Utilization</span>
            <span>{capacityPercentage}%</span>
          </div>
          <div className="mt-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${capacityPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Manager</p>
            <p className="font-medium">{warehouse.managerName}</p>
          </div>
          <div>
            <p className="text-gray-500">Contact</p>
            <p className="font-medium">{warehouse.contactNumber}</p>
          </div>
        </div>

        <div className="mt-4 text-sm">
          <p className="text-gray-500">Address</p>
          <p className="font-medium">
            {warehouse.address.street}, {warehouse.address.city}, {warehouse.address.state} - {warehouse.address.pincode}
          </p>
        </div>
      </div>
    );
  };

  const ItemCard = ({ item }: { item: Item }) => {
    const stockLevel = (item.currentStock ?? 0) <= (item.minimumStock ?? 0) ? 'low' : 
                      (item.currentStock ?? 0) >= (item.maximumStock ?? 0) ? 'high' : 'normal';

    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-500">Code: {item.itemCode}</p>
            <p className="text-sm text-gray-500">Category: {item.category}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            stockLevel === 'low' ? 'bg-red-100 text-red-800' :
            stockLevel === 'high' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {stockLevel === 'low' ? 'Low Stock' : 
             stockLevel === 'high' ? 'Excess Stock' : 'Normal'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Current Stock</p>
            <p className="font-medium">{item.currentStock ?? 0} {item.unit}</p>
          </div>
          <div>
            <p className="text-gray-500">Standard Cost</p>
            <p className="font-medium">₹{(item.standardCost ?? 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-500">Selling Price</p>
            <p className="font-medium">₹{item.sellingPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-500">GST Rate</p>
            <p className="font-medium">{item.gstRate}%</p>
          </div>
        </div>

        {item.hsnCode && (
          <div className="mt-4 text-sm">
            <p className="text-gray-500">HSN Code</p>
            <p className="font-medium">{item.hsnCode}</p>
          </div>
        )}

        <div className="mt-4 flex space-x-2">
          {item.isBatchTracked && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              Batch Tracked
            </span>
          )}
          {item.isSerialTracked && (
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
              Serial Tracked
            </span>
          )}
        </div>
      </div>
    );
  };

  const MovementRow = ({ movement }: { movement: StockMovement }) => {
    const typeColor = {
      'in': 'text-green-800 bg-green-100',
      'out': 'text-red-800 bg-red-100',
      'transfer': 'text-blue-800 bg-blue-100',
      'adjustment': 'text-yellow-800 bg-yellow-100'
    }[movement.type] || 'text-gray-800 bg-gray-100';

    const statusColor = {
      'pending': 'text-yellow-800 bg-yellow-100',
      'in_progress': 'text-blue-800 bg-blue-100',
      'completed': 'text-green-800 bg-green-100',
      'cancelled': 'text-red-800 bg-red-100'
    }[movement.status] || 'text-gray-800 bg-gray-100';

    return (
      <tr className="border-b border-gray-200">
        <td className="px-6 py-4 text-sm font-medium text-gray-900">
          {movement.referenceNumber}
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {movement.item?.name ?? 'N/A'}
        </td>
        <td className="px-6 py-4 text-sm">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColor}`}>
            {movement.type}
          </span>
        </td>
        <td className="px-6 py-4 text-sm">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
            {movement.status.replace('_', ' ')}
          </span>
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {movement.quantity}
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          ₹{(movement.unitCost ?? 0).toFixed(2)}
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          ₹{(movement.totalValue ?? 0).toFixed(2)}
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {movement.warehouse?.name ?? 'N/A'}
        </td>
        <td className="px-6 py-4 text-sm text-gray-500">
          {new Date(movement.createdAt).toLocaleDateString()}
        </td>
      </tr>
    );
  };

  return (
    <ProtectedRoute resource="inventory" action="read">
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600">Manage warehouses, items, and stock movements</p>
            </div>
            
            <RoleBasedComponent allowedRoles={['admin', 'manager']}>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add {activeTab === 'warehouses' ? 'Warehouse' : activeTab === 'items' ? 'Item' : 'Movement'}
              </button>
            </RoleBasedComponent>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-6">
            <TabButton
              tab="warehouses"
              label="Warehouses"
              active={activeTab === 'warehouses'}
              onClick={() => setActiveTab('warehouses')}
            />
            <TabButton
              tab="items"
              label="Items"
              active={activeTab === 'items'}
              onClick={() => setActiveTab('items')}
            />
            <TabButton
              tab="movements"
              label="Stock Movements"
              active={activeTab === 'movements'}
              onClick={() => setActiveTab('movements')}
            />
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div>
              {activeTab === 'warehouses' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {warehouses.map((warehouse) => (
                    <WarehouseCard key={warehouse.id} warehouse={warehouse} />
                  ))}
                  {warehouses.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-500">No warehouses found. Add your first warehouse to get started.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'items' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                  {items.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-500">No items found. Add your first item to get started.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'movements' && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reference
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Cost
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Warehouse
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {stockMovements.map((movement) => (
                        <MovementRow key={movement.id} movement={movement} />
                      ))}
                      {stockMovements.length === 0 && (
                        <tr>
                          <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                            No stock movements found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
