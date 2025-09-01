import React, { useState, useEffect } from 'react';
import { CheckCircle, Search, Edit3, Filter, Calendar, User, Building, AlertCircle, IndianRupee, FileText, Download } from 'lucide-react';
import { QuotationStorageService } from '../../services/localStorageService';
import { exportQuotationsToCSV } from '../../utils/csvExport';

const ConfirmQuotationModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('sent'); // Only show quotations that need confirmation
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    loadQuotations();
  }, [pagination.page, searchTerm, statusFilter]);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const result = QuotationStorageService.searchQuotations(searchTerm, statusFilter, pagination.page, pagination.limit);
      
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

  const handleConfirmQuotation = (quotationId: string) => {
    try {
      QuotationStorageService.updateQuotation(quotationId, { 
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
        confirmedBy: 'Current User' // In real app, get from auth context
      });
      loadQuotations(); // Refresh the list
      alert('Quotation confirmed successfully!');
    } catch (error) {
      console.error('Error confirming quotation:', error);
      alert('Failed to confirm quotation. Please try again.');
    }
  };

  const handleRejectQuotation = (quotationId: string) => {
    try {
      const reason = prompt('Please provide a reason for rejection:');
      if (reason) {
        QuotationStorageService.updateQuotation(quotationId, { 
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          rejectedBy: 'Current User', // In real app, get from auth context
          rejectionReason: reason
        });
        loadQuotations(); // Refresh the list
        alert('Quotation rejected successfully!');
      }
    } catch (error) {
      console.error('Error rejecting quotation:', error);
      alert('Failed to reject quotation. Please try again.');
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
    switch (status) {
      case 'sent': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <CheckCircle className="mr-3 h-6 w-6 text-orange-600" />
            Confirm Quotations
          </h2>
          <p className="text-gray-600 mt-1">Review and confirm pending quotations</p>
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
                placeholder="Search quotations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Pending Quotations */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quotations Pending Confirmation</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quotation Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Validity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
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
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {quotation.quotationNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {quotation.subject}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                          <Building className="h-4 w-4 text-orange-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {quotation.customer}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(quotation.quotationDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Valid till: {new Date(quotation.validTill).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm font-medium text-gray-900">
                      <IndianRupee className="h-4 w-4 mr-1 text-gray-400" />
                      ₹{(quotation.totalAmount || 0).toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <div className="text-sm text-gray-900">{quotation.assignedTo}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleConfirmQuotation(quotation.id)}
                        className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Confirm
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button className="text-orange-600 hover:text-orange-900">
                        <FileText className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Development Notice */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-orange-800">
              Confirm Quotation Module - Implementation in Progress
            </h3>
            <div className="text-sm text-orange-700 mt-2">
              <p>Complete functionality includes:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Review quotation details and line items</li>
                <li>Approve or reject quotations</li>
                <li>Convert confirmed quotations to sales orders</li>
                <li>Customer confirmation tracking</li>
                <li>Revision management</li>
                <li>Approval workflow and notifications</li>
                <li>Bulk confirmation operations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmQuotationModule;
