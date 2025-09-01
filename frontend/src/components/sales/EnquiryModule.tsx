import React, { useState, useEffect } from 'react';
import { EnquiryStorageService } from '../../services/localStorageService';
import { exportEnquiriesToCSV } from '../../utils/csvExport';
import { MessageSquare, Plus, Search, Edit, Trash2, Download, Filter, Calendar, User, Building, AlertCircle, Phone, Mail } from 'lucide-react';

const EnquiryModule: React.FC = () => {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [newEnquiry, setNewEnquiry] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    company: '',
    subject: '',
    description: '',
    requirements: '',
    budget: '',
    timeline: '',
    priority: 'medium',
    status: 'new',
    source: 'website',
    assignedTo: '',
    notes: ''
  });

  useEffect(() => {
    loadEnquiries();
  }, [pagination.page, searchTerm, statusFilter, priorityFilter]);

  const loadEnquiries = async () => {
    try {
      setLoading(true);
      const result = EnquiryStorageService.searchEnquiries(searchTerm, statusFilter, priorityFilter, pagination.page);
      
      setEnquiries(result.data);
      setPagination(prev => ({
        ...prev,
        total: result.meta.total,
        totalPages: result.meta.totalPages
      }));
    } catch (error) {
      console.error('Error loading enquiries:', error);
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEnquiry = async () => {
    try {
      setLoading(true);
      const enquiryData = {
        ...newEnquiry,
        id: 'ENQ' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      EnquiryStorageService.addEnquiry(enquiryData);
      loadEnquiries();
      setShowCreateModal(false);
      setNewEnquiry({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        company: '',
        subject: '',
        description: '',
        requirements: '',
        budget: '',
        timeline: '',
        priority: 'medium',
        status: 'new',
        source: 'website',
        assignedTo: '',
        notes: ''
      });
      alert('Enquiry created successfully!');
    } catch (error) {
      console.error('Error creating enquiry:', error);
      alert('Failed to create enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEnquiry = async () => {
    try {
      setLoading(true);
      if (selectedEnquiry) {
        selectedEnquiry.updatedAt = new Date().toISOString();
        EnquiryStorageService.updateEnquiry(selectedEnquiry.id, selectedEnquiry);
        loadEnquiries();
        setShowEditModal(false);
        setSelectedEnquiry(null);
        alert('Enquiry updated successfully!');
      }
    } catch (error) {
      console.error('Error updating enquiry:', error);
      alert('Failed to update enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEnquiry = async (enquiryId: string) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) {
      return;
    }

    try {
      setLoading(true);
      EnquiryStorageService.deleteEnquiry(enquiryId);
      loadEnquiries();
      alert('Enquiry deleted successfully!');
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      alert('Failed to delete enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (enquiries.length === 0) {
      alert('No data to export');
      return;
    }
    exportEnquiriesToCSV(enquiries);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'new': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'qualified': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800',
      'lost': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'low': 'bg-gray-100 text-gray-800',
      'medium': 'bg-blue-100 text-blue-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const statusOptions = ['new', 'in-progress', 'qualified', 'closed', 'lost'];
  const priorityOptions = ['low', 'medium', 'high', 'urgent'];
  const sourceOptions = ['website', 'phone', 'email', 'referral', 'social-media', 'trade-show', 'other'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="mr-3 h-6 w-6 text-orange-600" />
            Enquiry Management
          </h2>
          <p className="text-gray-600 mt-1">Track and manage customer enquiries and leads</p>
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
            Add Enquiry
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
                placeholder="Search enquiries by customer, subject, or description..."
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
              <option value="new">New</option>
              <option value="in-progress">In Progress</option>
              <option value="qualified">Qualified</option>
              <option value="closed">Closed</option>
              <option value="lost">Lost</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Enquiry Records</h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="text-gray-500">Loading enquiries...</div>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-500">No enquiries found matching your criteria.</div>
            <p className="text-sm text-gray-400 mt-2">
              Try adjusting your search terms or filters, or add a new enquiry.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enquiry Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status & Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                            <MessageSquare className="h-4 w-4 text-orange-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {enquiry.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {enquiry.company}
                          </div>
                          <div className="space-y-1 mt-1">
                            <div className="flex items-center text-xs text-gray-500">
                              <Mail className="h-3 w-3 mr-1" />
                              {enquiry.customerEmail}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Phone className="h-3 w-3 mr-1" />
                              {enquiry.customerPhone}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {enquiry.subject}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {enquiry.description}
                        </div>
                        {enquiry.budget && (
                          <div className="text-xs text-green-600 font-medium">
                            Budget: {enquiry.budget}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(enquiry.status)}`}>
                          {enquiry.status}
                        </span>
                        <br />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(enquiry.priority)}`}>
                          {enquiry.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        {enquiry.assignedTo || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedEnquiry(enquiry);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEnquiry(enquiry.id)}
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

      {/* Create Enquiry Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Enquiry</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={newEnquiry.customerName}
                  onChange={(e) => setNewEnquiry({...newEnquiry, customerName: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <input
                  type="email"
                  placeholder="Customer Email"
                  value={newEnquiry.customerEmail}
                  onChange={(e) => setNewEnquiry({...newEnquiry, customerEmail: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <input
                  type="tel"
                  placeholder="Customer Phone"
                  value={newEnquiry.customerPhone}
                  onChange={(e) => setNewEnquiry({...newEnquiry, customerPhone: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={newEnquiry.company}
                  onChange={(e) => setNewEnquiry({...newEnquiry, company: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  value={newEnquiry.subject}
                  onChange={(e) => setNewEnquiry({...newEnquiry, subject: e.target.value})}
                  className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <textarea
                  placeholder="Description"
                  value={newEnquiry.description}
                  onChange={(e) => setNewEnquiry({...newEnquiry, description: e.target.value})}
                  className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows={3}
                />
                <input
                  type="text"
                  placeholder="Budget (Optional)"
                  value={newEnquiry.budget}
                  onChange={(e) => setNewEnquiry({...newEnquiry, budget: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <input
                  type="text"
                  placeholder="Timeline (Optional)"
                  value={newEnquiry.timeline}
                  onChange={(e) => setNewEnquiry({...newEnquiry, timeline: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <select
                  value={newEnquiry.priority}
                  onChange={(e) => setNewEnquiry({...newEnquiry, priority: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {priorityOptions.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
                <select
                  value={newEnquiry.source}
                  onChange={(e) => setNewEnquiry({...newEnquiry, source: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {sourceOptions.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Assigned To (Optional)"
                  value={newEnquiry.assignedTo}
                  onChange={(e) => setNewEnquiry({...newEnquiry, assignedTo: e.target.value})}
                  className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <textarea
                  placeholder="Additional Notes (Optional)"
                  value={newEnquiry.notes}
                  onChange={(e) => setNewEnquiry({...newEnquiry, notes: e.target.value})}
                  className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEnquiry}
                  disabled={loading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Enquiry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Enquiry Modal */}
      {showEditModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Enquiry</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={selectedEnquiry.customerName}
                  onChange={(e) => setSelectedEnquiry({...selectedEnquiry, customerName: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <input
                  type="email"
                  placeholder="Customer Email"
                  value={selectedEnquiry.customerEmail}
                  onChange={(e) => setSelectedEnquiry({...selectedEnquiry, customerEmail: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <input
                  type="tel"
                  placeholder="Customer Phone"
                  value={selectedEnquiry.customerPhone}
                  onChange={(e) => setSelectedEnquiry({...selectedEnquiry, customerPhone: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={selectedEnquiry.company}
                  onChange={(e) => setSelectedEnquiry({...selectedEnquiry, company: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  value={selectedEnquiry.subject}
                  onChange={(e) => setSelectedEnquiry({...selectedEnquiry, subject: e.target.value})}
                  className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <textarea
                  placeholder="Description"
                  value={selectedEnquiry.description}
                  onChange={(e) => setSelectedEnquiry({...selectedEnquiry, description: e.target.value})}
                  className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows={3}
                />
                <input
                  type="text"
                  placeholder="Budget (Optional)"
                  value={selectedEnquiry.budget}
                  onChange={(e) => setSelectedEnquiry({...selectedEnquiry, budget: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <input
                  type="text"
                  placeholder="Timeline (Optional)"
                  value={selectedEnquiry.timeline}
                  onChange={(e) => setSelectedEnquiry({...selectedEnquiry, timeline: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <select
                  value={selectedEnquiry.status}
                  onChange={(e) => setSelectedEnquiry({...selectedEnquiry, status: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <select
                  value={selectedEnquiry.priority}
                  onChange={(e) => setSelectedEnquiry({...selectedEnquiry, priority: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {priorityOptions.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Assigned To (Optional)"
                  value={selectedEnquiry.assignedTo}
                  onChange={(e) => setSelectedEnquiry({...selectedEnquiry, assignedTo: e.target.value})}
                  className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <textarea
                  placeholder="Additional Notes (Optional)"
                  value={selectedEnquiry.notes}
                  onChange={(e) => setSelectedEnquiry({...selectedEnquiry, notes: e.target.value})}
                  className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedEnquiry(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateEnquiry}
                  disabled={loading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Enquiry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnquiryModule;
