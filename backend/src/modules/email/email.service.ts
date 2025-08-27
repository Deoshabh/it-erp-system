import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendEmployeeWelcomeEmail(employeeData: {
    email: string;
    firstName: string;
    lastName: string;
    position: string;
    startDate: string;
  }) {
    try {
      await this.mailerService.sendMail({
        to: employeeData.email,
        subject: 'Welcome to the Company!',
        template: 'employee-welcome',
        context: {
          firstName: employeeData.firstName,
          lastName: employeeData.lastName,
          position: employeeData.position,
          startDate: employeeData.startDate,
          companyName: this.configService.get('COMPANY_NAME', 'IT Company'),
        },
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  async sendInvoiceNotification(invoiceData: {
    recipientEmail: string;
    invoiceNumber: string;
    amount: number;
    dueDate: string;
    clientName: string;
  }) {
    try {
      await this.mailerService.sendMail({
        to: invoiceData.recipientEmail,
        subject: `Invoice ${invoiceData.invoiceNumber} - Payment Due`,
        template: 'invoice-notification',
        context: {
          invoiceNumber: invoiceData.invoiceNumber,
          amount: invoiceData.amount,
          dueDate: invoiceData.dueDate,
          clientName: invoiceData.clientName,
          companyName: this.configService.get('COMPANY_NAME', 'IT Company'),
        },
      });
    } catch (error) {
      console.error('Failed to send invoice notification:', error);
      throw new Error('Failed to send invoice notification');
    }
  }

  async sendExpenseApprovalRequest(expenseData: {
    approverEmail: string;
    employeeName: string;
    amount: number;
    description: string;
    expenseId: string;
  }) {
    try {
      await this.mailerService.sendMail({
        to: expenseData.approverEmail,
        subject: 'Expense Approval Required',
        template: 'expense-approval',
        context: {
          employeeName: expenseData.employeeName,
          amount: expenseData.amount,
          description: expenseData.description,
          expenseId: expenseData.expenseId,
          companyName: this.configService.get('COMPANY_NAME', 'IT Company'),
          approvalUrl: `${this.configService.get('FRONTEND_URL')}/expenses/approve/${expenseData.expenseId}`,
        },
      });
    } catch (error) {
      console.error('Failed to send expense approval request:', error);
      throw new Error('Failed to send expense approval request');
    }
  }

  async sendMonthlyReport(reportData: {
    recipientEmail: string;
    recipientName: string;
    month: string;
    year: string;
    totalRevenue: number;
    totalExpenses: number;
    employeeCount: number;
  }) {
    try {
      await this.mailerService.sendMail({
        to: reportData.recipientEmail,
        subject: `Monthly Report - ${reportData.month} ${reportData.year}`,
        template: 'monthly-report',
        context: {
          recipientName: reportData.recipientName,
          month: reportData.month,
          year: reportData.year,
          totalRevenue: reportData.totalRevenue,
          totalExpenses: reportData.totalExpenses,
          profit: reportData.totalRevenue - reportData.totalExpenses,
          employeeCount: reportData.employeeCount,
          companyName: this.configService.get('COMPANY_NAME', 'IT Company'),
        },
      });
    } catch (error) {
      console.error('Failed to send monthly report:', error);
      throw new Error('Failed to send monthly report');
    }
  }

  async sendPasswordResetEmail(userData: {
    email: string;
    firstName: string;
    resetToken: string;
  }) {
    try {
      await this.mailerService.sendMail({
        to: userData.email,
        subject: 'Password Reset Request',
        template: 'password-reset',
        context: {
          firstName: userData.firstName,
          resetUrl: `${this.configService.get('FRONTEND_URL')}/reset-password?token=${userData.resetToken}`,
          companyName: this.configService.get('COMPANY_NAME', 'IT Company'),
        },
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}
