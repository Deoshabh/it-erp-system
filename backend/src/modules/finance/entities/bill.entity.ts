import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('bills')
export class Bill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  billNumber: string;

  @Column({
    type: 'enum',
    enum: ['purchase_bill', 'sales_bill', 'service_bill', 'debit_note', 'credit_note'],
  })
  billType: string;

  @Column({ length: 200 })
  vendorName: string;

  @Column({ length: 15, nullable: true })
  vendorGstin: string;

  @Column({ length: 100, nullable: true })
  vendorEmail: string;

  @Column({ length: 15, nullable: true })
  vendorPhone: string;

  @Column('jsonb')
  vendorAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };

  @Column({ type: 'date' })
  billDate: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ length: 50, nullable: true })
  referenceNumber: string;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  cgstAmount: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  sgstAmount: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  igstAmount: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  cessAmount: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  tdsAmount: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  discountAmount: number;

  @Column('decimal', { precision: 12, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: ['draft', 'pending', 'approved', 'paid', 'partially_paid', 'overdue', 'cancelled'],
    default: 'draft'
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  termsAndConditions: string;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @OneToMany(() => BillItem, billItem => billItem.bill, { cascade: true })
  billItems: BillItem[];

  @OneToMany(() => BillPayment, payment => payment.bill)
  payments: BillPayment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('bill_items')
export class BillItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Bill, bill => bill.billItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bill_id' })
  bill: Bill;

  @Column({ name: 'bill_id' })
  billId: string;

  @Column({ length: 200 })
  description: string;

  @Column({ length: 20, nullable: true })
  hsnCode: string;

  @Column('decimal', { precision: 10, scale: 3 })
  quantity: number;

  @Column({ length: 20 })
  unit: string;

  @Column('decimal', { precision: 10, scale: 2 })
  rate: number;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  gstRate: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  cgstAmount: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  sgstAmount: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  igstAmount: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  cessAmount: number;

  @Column('decimal', { precision: 12, scale: 2 })
  totalAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('bill_payments')
export class BillPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Bill, bill => bill.payments)
  @JoinColumn({ name: 'bill_id' })
  bill: Bill;

  @Column({ name: 'bill_id' })
  billId: string;

  @Column({ length: 50 })
  paymentReference: string;

  @Column('decimal', { precision: 12, scale: 2 })
  paidAmount: number;

  @Column({ type: 'date' })
  paymentDate: Date;

  @Column({
    type: 'enum',
    enum: ['cash', 'cheque', 'bank_transfer', 'upi', 'credit_card', 'debit_card'],
  })
  paymentMethod: string;

  @Column({ length: 100, nullable: true })
  transactionId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Legacy entities for backward compatibility
@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  invoiceNumber: string;

  @Column()
  clientName: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  dueDate: string;

  @Column({ default: 'pending' })
  status: string; // pending, paid, overdue

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column()
  category: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ default: 'pending' })
  status: string; // pending, approved, rejected

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
