import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';

// Extend jsPDF interface for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

export interface ExportData {
  title?: string;
  headers: string[];
  data: any[][];
  fileName?: string;
  companyName?: string;
}

export interface ChartExportOptions {
  elementId: string;
  fileName?: string;
  title?: string;
}

export class ExportService {
  // Export data to PDF table
  static exportToPDF(exportData: ExportData): void {
    const {
      title = 'Report',
      headers,
      data,
      fileName = 'report.pdf',
      companyName = 'IT Company'
    } = exportData;

    const doc = new jsPDF();
    
    // Add company header
    doc.setFontSize(20);
    doc.text(companyName, 20, 20);
    
    doc.setFontSize(16);
    doc.text(title, 20, 35);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 50);

    // Add table
    doc.autoTable({
      startY: 60,
      head: [headers],
      body: data,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246], // Blue header
        textColor: 255,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251], // Light gray alternate rows
      },
    });

    doc.save(fileName);
  }

  // Export data to Excel
  static exportToExcel(exportData: ExportData): void {
    const {
      title = 'Report',
      headers,
      data,
      fileName = 'report.xlsx',
      companyName = 'IT Company'
    } = exportData;

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    
    // Add header information
    const headerData = [
      [companyName],
      [title],
      [`Generated on: ${new Date().toLocaleDateString()}`],
      [], // Empty row
      headers, // Column headers
      ...data // Actual data
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(headerData);

    // Style the header
    const range = XLSX.utils.decode_range(worksheet['!ref']!);
    
    // Set column widths
    const columnWidths = headers.map(() => ({ wch: 15 }));
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

    // Generate Excel file and save
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
  }

  // Export chart as image to PDF
  static async exportChartToPDF(options: ChartExportOptions): Promise<void> {
    const {
      elementId,
      fileName = 'chart.pdf',
      title = 'Chart Report'
    } = options;

    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`);
    }

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
      });

      const imgData = canvas.toDataURL('image/png');
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text(title, 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);

      // Calculate image dimensions to fit page
      const imgWidth = 170; // Max width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add image to PDF
      doc.addImage(imgData, 'PNG', 20, 50, imgWidth, imgHeight);
      
      doc.save(fileName);
    } catch (error) {
      console.error('Error exporting chart to PDF:', error);
      throw new Error('Failed to export chart to PDF');
    }
  }

  // Export dashboard as PDF with multiple charts
  static async exportDashboardToPDF(
    chartIds: string[],
    fileName: string = 'dashboard.pdf',
    title: string = 'Analytics Dashboard'
  ): Promise<void> {
    const doc = new jsPDF();
    
    // Add title page
    doc.setFontSize(20);
    doc.text(title, 20, 30);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);

    for (let i = 0; i < chartIds.length; i++) {
      const element = document.getElementById(chartIds[i]);
      if (!element) continue;

      try {
        if (i > 0) {
          doc.addPage(); // New page for each chart
        }

        const canvas = await html2canvas(element, {
          backgroundColor: '#ffffff',
          scale: 1.5,
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 170;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add chart title
        doc.setFontSize(14);
        doc.text(`Chart ${i + 1}`, 20, i === 0 ? 70 : 20);
        
        doc.addImage(imgData, 'PNG', 20, i === 0 ? 80 : 30, imgWidth, imgHeight);
      } catch (error) {
        console.error(`Error processing chart ${chartIds[i]}:`, error);
      }
    }

    doc.save(fileName);
  }

  // Generate employee report
  static generateEmployeeReport(employees: any[]): void {
    const headers = ['Name', 'Email', 'Position', 'Department', 'Salary', 'Start Date', 'Status'];
    const data = employees.map(emp => [
      `${emp.firstName} ${emp.lastName}`,
      emp.email,
      emp.position,
      emp.department,
      `$${emp.salary?.toLocaleString() || 'N/A'}`,
      emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : 'N/A',
      emp.status || 'Active'
    ]);

    const exportData: ExportData = {
      title: 'Employee Report',
      headers,
      data,
      fileName: `employees_report_${new Date().toISOString().split('T')[0]}.pdf`
    };

    this.exportToPDF(exportData);
  }

  // Generate financial report
  static generateFinancialReport(invoices: any[], expenses: any[]): void {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Financial Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);

    // Invoice summary
    doc.setFontSize(14);
    doc.text('Invoices Summary', 20, 55);
    
    const invoiceHeaders = ['Invoice #', 'Client', 'Amount', 'Status', 'Due Date'];
    const invoiceData = invoices.map(inv => [
      inv.invoiceNumber,
      inv.clientName,
      `$${inv.amount?.toLocaleString() || '0'}`,
      inv.status,
      inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'
    ]);

    doc.autoTable({
      startY: 65,
      head: [invoiceHeaders],
      body: invoiceData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [34, 197, 94] },
    });

    // Add new page for expenses
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Expenses Summary', 20, 20);

    const expenseHeaders = ['Description', 'Category', 'Amount', 'Date', 'Status'];
    const expenseData = expenses.map(exp => [
      exp.description,
      exp.category,
      `$${exp.amount?.toLocaleString() || '0'}`,
      exp.date ? new Date(exp.date).toLocaleDateString() : 'N/A',
      exp.status
    ]);

    doc.autoTable({
      startY: 30,
      head: [expenseHeaders],
      body: expenseData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [239, 68, 68] },
    });

    doc.save(`financial_report_${new Date().toISOString().split('T')[0]}.pdf`);
  }
}
