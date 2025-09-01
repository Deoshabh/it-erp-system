import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from './customer.entity';
import { SalesInvoice } from './sales-invoice.entity';

export enum ReturnStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PROCESSED = 'processed',
  COMPLETED = 'completed',
  REJECTED = 'rejected'
}

export enum ReturnReason {
  DEFECTIVE = 'defective',
  WRONG_ITEM = 'wrong_item',
  DAMAGED = 'damaged',
  NOT_AS_DESCRIBED = 'not_as_described',
  CUSTOMER_CHANGED_MIND = 'customer_changed_mind',
  OTHER = 'other'
}

@Entity('sales_returns')
export class SalesReturn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  creditNoteNo: string;

  @Column('uuid')
  customerId: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column('uuid')
  invoiceId: string;

  @ManyToOne(() => SalesInvoice, invoice => invoice.returns)
  @JoinColumn({ name: 'invoiceId' })
  invoice: SalesInvoice;

  @Column('date')
  returnDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  returnAmount: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column('decimal', { precision: 10, scale: 2 })
  taxAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalReturnAmount: number;

  @Column({
    type: 'enum',
    enum: ReturnStatus,
    default: ReturnStatus.PENDING
  })
  status: ReturnStatus;

  @Column({
    type: 'enum',
    enum: ReturnReason,
    default: ReturnReason.OTHER
  })
  reason: ReturnReason;

  @Column('text', { nullable: true })
  reasonDescription: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column('uuid', { nullable: true })
  assignedTo: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
