import React, { useState, useEffect } from 'react';
import { RotateCcw, Search, Edit3, Filter, Calendar, User, Building, AlertCircle, Package, ArrowLeft, Clock, CheckCircle, Download, Plus } from 'lucide-react';
import { ReturnStorageService } from '../../services/localStorageService';
import { exportReturnsToCSV } from '../../utils/csvExport';

const ReturnsModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    loadReturns();
  }, [pagination.page, searchTerm, statusFilter]);

  const loadReturns = async () => {
    try {
      setLoading(true);
      const result = ReturnStorageService.searchReturns(searchTerm, statusFilter, pagination.page, pagination.limit);
      
      setReturns(result.data);
      setPagination(prev => ({
        ...prev,
        total: result.meta.total,
        totalPages: result.meta.totalPages
      }));
    } catch (error) {
      console.error('Error loading returns:', error);
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (returns.length === 0) {
      alert('No data to export');
      return;
    }
    exportReturnsToCSV(returns);
  };

  const handleAddReturn = () => {
    setShowAddForm(true);
  };

  const handleProcessReturn = (returnId: string) => {
    try {
      ReturnStorageService.updateReturn(returnId, { 
        status: 'processing',
        processedAt: new Date().toISOString(),
        processedBy: 'Current User' // In real app, get from auth context
      });
      loadReturns(); // Refresh the list
      alert('Return marked as processing!');
    } catch (error) {
      console.error('Error processing return:', error);
      alert('Failed to process return. Please try again.');
    }
  };

  const handleApproveReturn = (returnId: string) => {
    try {
      ReturnStorageService.updateReturn(returnId, { 
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: 'Current User' // In real app, get from auth context
      });
      loadReturns(); // Refresh the list
      alert('Return approved successfully!');
    } catch (error) {
      console.error('Error approving return:', error);
      alert('Failed to approve return. Please try again.');
    }
  };

  const handleRejectReturn = (returnId: string) => {
    try {
      const reason = prompt('Please provide a reason for rejection:');
      if (reason) {
        ReturnStorageService.updateReturn(returnId, { 
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          rejectedBy: 'Current User', // In real app, get from auth context
          rejectionReason: reason
        });
        loadReturns(); // Refresh the list
        alert('Return rejected!');
      }
    } catch (error) {
      console.error('Error rejecting return:', error);
      alert('Failed to reject return. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      case 'replaced': return 'bg-indigo-100 text-indigo-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplayName = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getReturnTypeColor = (type: string) => {
    switch (type) {
      case 'defective': return 'text-red-600';
      case 'wrong_item': return 'text-orange-600';
      case 'damaged': return 'text-red-600';
      case 'not_as_described': return 'text-yellow-600';
      case 'changed_mind': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <RotateCcw className="mr-3 h-6 w-6 text-orange-600" />
            Returns Management
          </h2>
          <p className="text-gray-600 mt-1">Process returns, refunds, and exchanges</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={handleAddReturn}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Process Return
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by return number, customer, or invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Status</option>
              <option value="requested">Requested</option>
              <option value="processing">Processing</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="refunded">Refunded</option>
              <option value="replaced">Replaced</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Return Requests</h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="text-gray-500">Loading returns...</div>
          </div>
        ) : returns.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-500">No returns found matching your criteria.</div>
            <p className="text-sm text-gray-400 mt-2">
              Try adjusting your search terms or filters, or process a new return.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer & Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items & Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resolution
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {returns.map((returnItem) => (
                  <tr key={returnItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {returnItem.returnNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          Order: {returnItem.orderNumber || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-8 w-8 mt-1">
                          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                            <Building className="h-4 w-4 text-orange-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {returnItem.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Invoice: {returnItem.invoiceNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Package className="h-4 w-4 mr-1 text-gray-400" />
                          {returnItem.itemsCount || 1} item(s)
                        </div>
                        <div className={`text-sm font-medium ${getReturnTypeColor(returnItem.returnType)}`}>
                          {returnItem.returnType?.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-500 max-w-xs truncate">
                          {returnItem.reason}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {returnItem.requestDate}
                        </div>
                        <div className="text-sm text-gray-500">
                          {returnItem.expectedResolution && `Expected: ${returnItem.expectedResolution}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(returnItem.status)}`}>
                        {getStatusDisplayName(returnItem.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {returnItem.resolutionType || 'Pending'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {returnItem.refundAmount && `₹${(returnItem.refundAmount || 0).toLocaleString('en-IN')}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1">
                        <button className="text-blue-600 hover:text-blue-900" title="View Details">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        {returnItem.status === 'requested' && (
                          <>
                            <button
                              onClick={() => handleProcessReturn(returnItem.id)}
                              className="text-orange-600 hover:text-orange-900"
                              title="Process"
                            >
                              <Clock className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleApproveReturn(returnItem.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRejectReturn(returnItem.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <AlertCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {returnItem.status === 'processing' && (
                          <button
                            onClick={() => handleApproveReturn(returnItem.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Complete"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                disabled={pagination.page === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ArrowLeft className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pending Returns</p>
              <p className="text-2xl font-semibold text-gray-900">
                {returns.filter(ret => ret.status === 'requested').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Processing</p>
              <p className="text-2xl font-semibold text-gray-900">
                {returns.filter(ret => ret.status === 'processing').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {returns.filter(ret => ret.status === 'completed' || ret.status === 'refunded' || ret.status === 'replaced').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-semibold text-gray-900">
                {returns.filter(ret => ret.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Help */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-orange-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-orange-800">
              Returns Management Guide
            </h3>
            <div className="mt-2 text-sm text-orange-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Search by return number, customer name, or invoice number</li>
                <li>Filter returns by status to prioritize pending requests</li>
                <li>Click "Process Return" to start handling a new return request</li>
                <li>Use action buttons to approve, reject, or update return status</li>
                <li>Monitor return reasons to identify product or service issues</li>
                <li>Track refunds and replacements for customer satisfaction</li>
                <li>Export return data to CSV for analysis and reporting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnsModule;
