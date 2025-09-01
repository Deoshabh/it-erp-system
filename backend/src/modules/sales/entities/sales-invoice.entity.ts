import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Customer } from './customer.entity';
import { SalesOrder } from './sales-order.entity';
import { SalesReturn } from './sales-return.entity';

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

export enum EInvoiceStatus {
  NOT_GENERATED = 'not_generated',
  PENDING = 'pending',
  GENERATED = 'generated',
  CANCELLED = 'cancelled'
}

export enum EWayBillStatus {
  NOT_GENERATED = 'not_generated',
  PENDING = 'pending',
  GENERATED = 'generated',
  CANCELLED = 'cancelled'
}

@Entity('sales_invoices')
export class SalesInvoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  invoiceNo: string;

  @Column('uuid')
  customerId: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column('uuid', { nullable: true })
  salesOrderId: string;

  @ManyToOne(() => SalesOrder, order => order.invoices, { nullable: true })
  @JoinColumn({ name: 'salesOrderId' })
  salesOrder: SalesOrder;

  @Column('date')
  invoiceDate: Date;

  @Column('date', { nullable: true })
  dueDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column('decimal', { precision: 10, scale: 2 })
  taxAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  balanceAmount: number;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT
  })
  status: InvoiceStatus;

  @Column({
    type: 'enum',
    enum: EInvoiceStatus,
    default: EInvoiceStatus.NOT_GENERATED
  })
  eInvoiceStatus: EInvoiceStatus;

  @Column({ nullable: true })
  eInvoiceNo: string;

  @Column({
    type: 'enum',
    enum: EWayBillStatus,
    default: EWayBillStatus.NOT_GENERATED
  })
  eWayBillStatus: EWayBillStatus;

  @Column({ nullable: true })
  eWayBillNo: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column('uuid', { nullable: true })
  assignedTo: string;

  @OneToMany(() => SalesReturn, salesReturn => salesReturn.invoice)
  returns: SalesReturn[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
