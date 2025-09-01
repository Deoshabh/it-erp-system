import React, { useState, useEffect } from 'react';
import { QuotationStorageService } from '../../services/localStorageService';
import { exportQuotationsToCSV } from '../../utils/csvExport';
import { FileText, Plus, Search, Edit, Trash2, Download, Filter, Calendar, User, Building, IndianRupee, Mail, Phone } from 'lucide-react';

const QuotationModule: React.FC = () => {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [newQuotation, setNewQuotation] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    company: '',
    quotationNumber: '',
    title: '',
    description: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    validUntil: '',
    terms: '',
    status: 'draft',
    assignedTo: '',
    notes: ''
  });

  useEffect(() => {
    loadQuotations();
  }, [pagination.page, searchTerm, statusFilter]);

  useEffect(() => {
    if (newQuotation.quotationNumber === '') {
      setNewQuotation(prev => ({
        ...prev,
        quotationNumber: 'QUO' + Date.now()
      }));
    }
  }, []);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const result = QuotationStorageService.searchQuotations(searchTerm, statusFilter, pagination.page);
      
      setQuotations(result.data);
      setPagination(prev => ({
        ...prev,
        total: result.meta.total,
        totalPages: result.meta.totalPages
      }));
    } catch (error) {
      console.error('Error loading quotations:', error);
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = (items: any[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    return subtotal;
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...newQuotation.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    const subtotal = calculateTotals(updatedItems);
    const total = subtotal + newQuotation.tax - newQuotation.discount;
    
    setNewQuotation({
      ...newQuotation,
      items: updatedItems,
      subtotal,
      total
    });
  };

  const addItem = () => {
    setNewQuotation({
      ...newQuotation,
      items: [...newQuotation.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
    });
  };

  const removeItem = (index: number) => {
    if (newQuotation.items.length > 1) {
      const updatedItems = newQuotation.items.filter((_, i) => i !== index);
      const subtotal = calculateTotals(updatedItems);
      const total = subtotal + newQuotation.tax - newQuotation.discount;
      
      setNewQuotation({
        ...newQuotation,
        items: updatedItems,
        subtotal,
        total
      });
    }
  };

  const handleCreateQuotation = async () => {
    try {
      setLoading(true);
      const quotationData = {
        ...newQuotation,
        id: 'QUO' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      QuotationStorageService.addQuotation(quotationData);
      loadQuotations();
      setShowCreateModal(false);
      setNewQuotation({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        company: '',
        quotationNumber: 'QUO' + Date.now(),
        title: '',
        description: '',
        items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
        subtotal: 0,
        tax: 0,
        discount: 0,
        total: 0,
        validUntil: '',
        terms: '',
        status: 'draft',
        assignedTo: '',
        notes: ''
      });
      alert('Quotation created successfully!');
    } catch (error) {
      console.error('Error creating quotation:', error);
      alert('Failed to create quotation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuotation = async () => {
    try {
      setLoading(true);
      if (selectedQuotation) {
        selectedQuotation.updatedAt = new Date().toISOString();
        QuotationStorageService.updateQuotation(selectedQuotation.id, selectedQuotation);
        loadQuotations();
        setShowEditModal(false);
        setSelectedQuotation(null);
        alert('Quotation updated successfully!');
      }
    } catch (error) {
      console.error('Error updating quotation:', error);
      alert('Failed to update quotation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuotation = async (quotationId: string) => {
    if (!confirm('Are you sure you want to delete this quotation?')) {
      return;
    }

    try {
      setLoading(true);
      QuotationStorageService.deleteQuotation(quotationId);
      loadQuotations();
      alert('Quotation deleted successfully!');
    } catch (error) {
      console.error('Error deleting quotation:', error);
      alert('Failed to delete quotation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (quotations.length === 0) {
      alert('No data to export');
      return;
    }
    exportQuotationsToCSV(quotations);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-800',
      'sent': 'bg-blue-100 text-blue-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'expired': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const statusOptions = ['draft', 'sent', 'approved', 'rejected', 'expired'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="mr-3 h-6 w-6 text-orange-600" />
            Quotation Management
          </h2>
          <p className="text-gray-600 mt-1">Create and manage sales quotations</p>
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
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Quotation
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
                placeholder="Search quotations by customer, quotation number, or title..."
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
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quotation Records</h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="text-gray-500">Loading quotations...</div>
          </div>
        ) : quotations.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-500">No quotations found matching your criteria.</div>
            <p className="text-sm text-gray-400 mt-2">
              Try adjusting your search terms or filters, or add a new quotation.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quotation Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid Until
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-orange-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {quotation.quotationNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {quotation.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {quotation.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {quotation.company}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Mail className="h-3 w-3 mr-1" />
                          {quotation.customerEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <IndianRupee className="h-4 w-4 mr-1 text-green-600" />
                        {quotation.total ? quotation.total.toFixed(2) : '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quotation.status)}`}>
                        {quotation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedQuotation(quotation);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuotation(quotation.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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

      {/* Create Quotation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Quotation</h3>
              
              {/* Customer Information */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={newQuotation.customerName}
                    onChange={(e) => setNewQuotation({...newQuotation, customerName: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <input
                    type="email"
                    placeholder="Customer Email"
                    value={newQuotation.customerEmail}
                    onChange={(e) => setNewQuotation({...newQuotation, customerEmail: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <input
                    type="tel"
                    placeholder="Customer Phone"
                    value={newQuotation.customerPhone}
                    onChange={(e) => setNewQuotation({...newQuotation, customerPhone: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={newQuotation.company}
                    onChange={(e) => setNewQuotation({...newQuotation, company: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Quotation Details */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">Quotation Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Quotation Number"
                    value={newQuotation.quotationNumber}
                    onChange={(e) => setNewQuotation({...newQuotation, quotationNumber: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <input
                    type="date"
                    placeholder="Valid Until"
                    value={newQuotation.validUntil}
                    onChange={(e) => setNewQuotation({...newQuotation, validUntil: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <input
                    type="text"
                    placeholder="Title"
                    value={newQuotation.title}
                    onChange={(e) => setNewQuotation({...newQuotation, title: e.target.value})}
                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <textarea
                    placeholder="Description"
                    value={newQuotation.description}
                    onChange={(e) => setNewQuotation({...newQuotation, description: e.target.value})}
                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows={3}
                  />
                </div>
              </div>

              {/* Items */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-md font-medium text-gray-700">Items</h4>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-orange-600 hover:text-orange-800 text-sm"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {newQuotation.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="col-span-5 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="col-span-2 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="col-span-2 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                      />
                      <div className="col-span-2 px-2 py-1 text-sm text-gray-700">
                        ₹{item.total.toFixed(2)}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="col-span-1 text-red-600 hover:text-red-800"
                        disabled={newQuotation.items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Totals */}
                <div className="mt-4 border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div></div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{newQuotation.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Tax:</span>
                        <input
                          type="number"
                          value={newQuotation.tax}
                          onChange={(e) => {
                            const tax = parseFloat(e.target.value) || 0;
                            const total = newQuotation.subtotal + tax - newQuotation.discount;
                            setNewQuotation({...newQuotation, tax, total});
                          }}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Discount:</span>
                        <input
                          type="number"
                          value={newQuotation.discount}
                          onChange={(e) => {
                            const discount = parseFloat(e.target.value) || 0;
                            const total = newQuotation.subtotal + newQuotation.tax - discount;
                            setNewQuotation({...newQuotation, discount, total});
                          }}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>₹{newQuotation.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">Additional Information</h4>
                <div className="space-y-4">
                  <textarea
                    placeholder="Terms and Conditions"
                    value={newQuotation.terms}
                    onChange={(e) => setNewQuotation({...newQuotation, terms: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows={3}
                  />
                  <input
                    type="text"
                    placeholder="Assigned To"
                    value={newQuotation.assignedTo}
                    onChange={(e) => setNewQuotation({...newQuotation, assignedTo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <textarea
                    placeholder="Notes"
                    value={newQuotation.notes}
                    onChange={(e) => setNewQuotation({...newQuotation, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateQuotation}
                  disabled={loading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Quotation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Similar structure but with selectedQuotation */}
      {showEditModal && selectedQuotation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Quotation</h3>
              
              {/* Similar form structure but using selectedQuotation */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={selectedQuotation.customerName}
                  onChange={(e) => setSelectedQuotation({...selectedQuotation, customerName: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <select
                  value={selectedQuotation.status}
                  onChange={(e) => setSelectedQuotation({...selectedQuotation, status: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedQuotation(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateQuotation}
                  disabled={loading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Quotation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationModule;
