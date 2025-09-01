import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Customer } from './customer.entity';
import { Enquiry } from './enquiry.entity';
import { SalesOrder } from './sales-order.entity';

export enum QuotationStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

@Entity('sales_quotations')
export class Quotation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  quotationNo: string;

  @Column('uuid')
  customerId: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column('uuid', { nullable: true })
  enquiryId: string;

  @ManyToOne(() => Enquiry, { nullable: true })
  @JoinColumn({ name: 'enquiryId' })
  enquiry: Enquiry;

  @Column('text', { nullable: true })
  subject: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column('decimal', { precision: 10, scale: 2 })
  taxAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  grandTotal: number;

  @Column({
    type: 'enum',
    enum: QuotationStatus,
    default: QuotationStatus.DRAFT
  })
  status: QuotationStatus;

  @Column('date', { nullable: true })
  validUntil: Date;

  @Column('text', { nullable: true })
  terms: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column('uuid', { nullable: true })
  assignedTo: string;

  @OneToMany(() => SalesOrder, order => order.quotation)
  salesOrders: SalesOrder[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
