import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';
import { Bill } from '../entities/bill.entity';

@Injectable()
export class PdfService {
  private billTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>{{billType}} - {{billNumber}}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4a90e2; padding-bottom: 20px; }
            .company-name { font-size: 28px; font-weight: bold; color: #4a90e2; margin-bottom: 5px; }
            .company-details { font-size: 14px; color: #666; }
            .bill-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .bill-details, .vendor-details { width: 48%; }
            .bill-details h3, .vendor-details h3 { color: #4a90e2; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            .items-table th { background-color: #f8f9fa; font-weight: bold; }
            .totals-section { float: right; width: 300px; }
            .totals-table { width: 100%; border-collapse: collapse; }
            .totals-table td { padding: 8px; border-bottom: 1px solid #ddd; }
            .total-row { font-weight: bold; font-size: 16px; background-color: #f8f9fa; }
            .footer { clear: both; margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; }
            .notes { margin-top: 20px; }
            .currency { font-family: 'Arial', sans-serif; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .small { font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">Your Company Name</div>
            <div class="company-details">
                123 Business Street, Business City, State - 123456<br>
                GSTIN: 29ABCDE1234F1Z5 | Email: billing@company.com | Phone: +91-9876543210
            </div>
        </div>

        <div class="bill-info">
            <div class="bill-details">
                <h3>Bill Details</h3>
                <p><strong>{{billTypeDisplay}}:</strong> {{billNumber}}</p>
                <p><strong>Date:</strong> {{formatDate billDate}}</p>
                <p><strong>Due Date:</strong> {{formatDate dueDate}}</p>
                {{#if referenceNumber}}
                <p><strong>Reference:</strong> {{referenceNumber}}</p>
                {{/if}}
                <p><strong>Status:</strong> <span style="color: {{statusColor}}">{{statusDisplay}}</span></p>
            </div>

            <div class="vendor-details">
                <h3>{{#eq billType 'sales_bill'}}Bill To{{else}}Vendor Details{{/eq}}</h3>
                <p><strong>{{vendorName}}</strong></p>
                {{#if vendorGstin}}
                <p><strong>GSTIN:</strong> {{vendorGstin}}</p>
                {{/if}}
                <p>{{vendorAddress.street}}<br>
                   {{vendorAddress.city}}, {{vendorAddress.state}} - {{vendorAddress.pincode}}<br>
                   {{vendorAddress.country}}</p>
                {{#if vendorEmail}}
                <p><strong>Email:</strong> {{vendorEmail}}</p>
                {{/if}}
                {{#if vendorPhone}}
                <p><strong>Phone:</strong> {{vendorPhone}}</p>
                {{/if}}
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 5%">#</th>
                    <th style="width: 40%">Description</th>
                    <th style="width: 10%">HSN Code</th>
                    <th style="width: 8%">Qty</th>
                    <th style="width: 8%">Unit</th>
                    <th style="width: 10%">Rate (₹)</th>
                    <th style="width: 8%">GST%</th>
                    <th style="width: 11%" class="text-right">Amount (₹)</th>
                </tr>
            </thead>
            <tbody>
                {{#each billItems}}
                <tr>
                    <td>{{increment @index}}</td>
                    <td>{{description}}</td>
                    <td>{{hsnCode}}</td>
                    <td class="text-right">{{quantity}}</td>
                    <td>{{unit}}</td>
                    <td class="text-right currency">{{formatCurrency rate}}</td>
                    <td class="text-center">{{gstRate}}%</td>
                    <td class="text-right currency">{{formatCurrency totalAmount}}</td>
                </tr>
                {{/each}}
            </tbody>
        </table>

        <div class="totals-section">
            <table class="totals-table">
                <tr>
                    <td>Subtotal:</td>
                    <td class="text-right currency">₹{{formatCurrency subtotal}}</td>
                </tr>
                {{#if cgstAmount}}
                <tr>
                    <td>CGST:</td>
                    <td class="text-right currency">₹{{formatCurrency cgstAmount}}</td>
                </tr>
                {{/if}}
                {{#if sgstAmount}}
                <tr>
                    <td>SGST:</td>
                    <td class="text-right currency">₹{{formatCurrency sgstAmount}}</td>
                </tr>
                {{/if}}
                {{#if igstAmount}}
                <tr>
                    <td>IGST:</td>
                    <td class="text-right currency">₹{{formatCurrency igstAmount}}</td>
                </tr>
                {{/if}}
                {{#if cessAmount}}
                <tr>
                    <td>CESS:</td>
                    <td class="text-right currency">₹{{formatCurrency cessAmount}}</td>
                </tr>
                {{/if}}
                {{#if discountAmount}}
                <tr>
                    <td>Discount:</td>
                    <td class="text-right currency">-₹{{formatCurrency discountAmount}}</td>
                </tr>
                {{/if}}
                {{#if tdsAmount}}
                <tr>
                    <td>TDS:</td>
                    <td class="text-right currency">-₹{{formatCurrency tdsAmount}}</td>
                </tr>
                {{/if}}
                <tr class="total-row">
                    <td><strong>Total Amount:</strong></td>
                    <td class="text-right currency"><strong>₹{{formatCurrency totalAmount}}</strong></td>
                </tr>
            </table>
        </div>

        <div class="footer">
            {{#if notes}}
            <div class="notes">
                <h4>Notes:</h4>
                <p>{{notes}}</p>
            </div>
            {{/if}}

            {{#if termsAndConditions}}
            <div class="notes">
                <h4>Terms & Conditions:</h4>
                <p>{{termsAndConditions}}</p>
            </div>
            {{/if}}

            <div class="small text-center" style="margin-top: 30px;">
                This is a computer generated bill and does not require physical signature.<br>
                Generated on {{formatDateTime now}}
            </div>
        </div>
    </body>
    </html>
  `;

  constructor() {
    // Register Handlebars helpers
    handlebars.registerHelper('formatCurrency', (amount) => {
      return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    });

    handlebars.registerHelper('formatDate', (date) => {
      return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    });

    handlebars.registerHelper('formatDateTime', (date) => {
      return new Date(date).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    });

    handlebars.registerHelper('increment', (value) => {
      return parseInt(value) + 1;
    });

    handlebars.registerHelper('eq', (a, b) => {
      return a === b;
    });
  }

  async generateBillPdf(bill: Bill): Promise<Buffer> {
    const template = handlebars.compile(this.billTemplate);
    
    // Prepare data for template
    const templateData = {
      ...bill,
      billTypeDisplay: this.getBillTypeDisplay(bill.billType),
      statusDisplay: this.getStatusDisplay(bill.status),
      statusColor: this.getStatusColor(bill.status),
      now: new Date()
    };

    const html = template(templateData);

    // Generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  async generateGSTReport(bills: Bill[], fromDate: Date, toDate: Date): Promise<Buffer> {
    const reportTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>GST Report</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .period { color: #666; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f8f9fa; }
              .text-right { text-align: right; }
              .summary { background-color: #e9ecef; font-weight: bold; }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>GST Report</h1>
              <p class="period">Period: {{formatDate fromDate}} to {{formatDate toDate}}</p>
          </div>

          <table>
              <thead>
                  <tr>
                      <th>Bill Number</th>
                      <th>Date</th>
                      <th>Vendor</th>
                      <th>Type</th>
                      <th class="text-right">Subtotal</th>
                      <th class="text-right">CGST</th>
                      <th class="text-right">SGST</th>
                      <th class="text-right">IGST</th>
                      <th class="text-right">Total</th>
                  </tr>
              </thead>
              <tbody>
                  {{#each bills}}
                  <tr>
                      <td>{{billNumber}}</td>
                      <td>{{formatDate billDate}}</td>
                      <td>{{vendorName}}</td>
                      <td>{{billType}}</td>
                      <td class="text-right">₹{{formatCurrency subtotal}}</td>
                      <td class="text-right">₹{{formatCurrency cgstAmount}}</td>
                      <td class="text-right">₹{{formatCurrency sgstAmount}}</td>
                      <td class="text-right">₹{{formatCurrency igstAmount}}</td>
                      <td class="text-right">₹{{formatCurrency totalAmount}}</td>
                  </tr>
                  {{/each}}
              </tbody>
          </table>
      </body>
      </html>
    `;

    const template = handlebars.compile(reportTemplate);
    const html = template({ bills, fromDate, toDate });

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  private getBillTypeDisplay(billType: string): string {
    const types = {
      'purchase_bill': 'Purchase Bill',
      'sales_bill': 'Sales Bill',
      'service_bill': 'Service Bill',
      'debit_note': 'Debit Note',
      'credit_note': 'Credit Note'
    };
    return types[billType] || billType;
  }

  private getStatusDisplay(status: string): string {
    const statuses = {
      'draft': 'Draft',
      'pending': 'Pending',
      'approved': 'Approved',
      'paid': 'Paid',
      'partially_paid': 'Partially Paid',
      'overdue': 'Overdue',
      'cancelled': 'Cancelled'
    };
    return statuses[status] || status;
  }

  private getStatusColor(status: string): string {
    const colors = {
      'draft': '#6c757d',
      'pending': '#ffc107',
      'approved': '#17a2b8',
      'paid': '#28a745',
      'partially_paid': '#fd7e14',
      'overdue': '#dc3545',
      'cancelled': '#6c757d'
    };
    return colors[status] || '#6c757d';
  }
}
