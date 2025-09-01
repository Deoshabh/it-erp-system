/**
 * CSV Export Utility for Sales Module
 * Provides functionality to export various sales data to CSV format
 */

export interface ExportableData {
  [key: string]: any;
}

/**
 * Convert array of objects to CSV string
 */
export function convertToCSV(data: ExportableData[], headers?: string[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  // If no headers provided, use all keys from first object
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create header row
  const headerRow = csvHeaders.join(',');
  
  // Create data rows
  const dataRows = data.map(item => {
    return csvHeaders.map(header => {
      const value = item[header];
      // Handle values that might contain commas, quotes, or newlines
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Export quotations to CSV
 */
export function exportQuotationsToCSV(quotations: any[]): void {
  const headers = ['quotationNumber', 'customer', 'subject', 'quotationDate', 'validTill', 'totalAmount', 'status', 'assignedTo'];
  const csvContent = convertToCSV(quotations, headers);
  const filename = `quotations_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Export customers to CSV
 */
export function exportCustomersToCSV(customers: any[]): void {
  const headers = ['customerCode', 'name', 'email', 'phone', 'company', 'address', 'status', 'assignedTo', 'createdAt'];
  const csvContent = convertToCSV(customers, headers);
  const filename = `customers_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Export sales orders to CSV
 */
export function exportSalesOrdersToCSV(orders: any[]): void {
  const headers = ['orderNumber', 'customer', 'orderDate', 'deliveryDate', 'totalAmount', 'status', 'priority'];
  const csvContent = convertToCSV(orders, headers);
  const filename = `sales_orders_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Export invoices to CSV
 */
export function exportInvoicesToCSV(invoices: any[]): void {
  const headers = ['invoiceNumber', 'customer', 'invoiceDate', 'dueDate', 'totalAmount', 'status', 'paymentStatus'];
  const csvContent = convertToCSV(invoices, headers);
  const filename = `invoices_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Export dispatches to CSV
 */
export function exportDispatchesToCSV(dispatches: any[]): void {
  const headers = ['dispatchNumber', 'orderNumber', 'customer', 'dispatchDate', 'deliveryAddress', 'status', 'trackingNumber'];
  const csvContent = convertToCSV(dispatches, headers);
  const filename = `dispatches_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Export returns to CSV
 */
export function exportReturnsToCSV(returns: any[]): void {
  const headers = ['returnNumber', 'orderNumber', 'customer', 'returnDate', 'reason', 'totalAmount', 'status'];
  const csvContent = convertToCSV(returns, headers);
  const filename = `returns_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Export enquiries to CSV
 */
export function exportEnquiriesToCSV(enquiries: any[]): void {
  const headers = ['enquiryNumber', 'customer', 'subject', 'enquiryDate', 'priority', 'status', 'assignedTo'];
  const csvContent = convertToCSV(enquiries, headers);
  const filename = `enquiries_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
}
