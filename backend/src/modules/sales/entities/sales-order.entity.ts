import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Customer } from './customer.entity';
import { Quotation } from './quotation.entity';
import { SalesInvoice } from './sales-invoice.entity';

export enum SalesOrderStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  IN_PRODUCTION = 'in_production',
  READY_TO_DISPATCH = 'ready_to_dispatch',
  DISPATCHED = 'dispatched',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Entity('sales_orders')
export class SalesOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNo: string;

  @Column('uuid')
  customerId: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column('uuid', { nullable: true })
  quotationId: string;

  @ManyToOne(() => Quotation, quotation => quotation.salesOrders, { nullable: true })
  @JoinColumn({ name: 'quotationId' })
  quotation: Quotation;

  @Column('date')
  orderDate: Date;

  @Column('date', { nullable: true })
  expectedDeliveryDate: Date;

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
    enum: SalesOrderStatus,
    default: SalesOrderStatus.DRAFT
  })
  status: SalesOrderStatus;

  @Column('text', { nullable: true })
  notes: string;

  @Column('uuid', { nullable: true })
  assignedTo: string;

  @OneToMany(() => SalesInvoice, invoice => invoice.salesOrder)
  invoices: SalesInvoice[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
