import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SalesOrder } from './sales-order.entity';

export enum DispatchStatus {
  PENDING = 'pending',
  PACKED = 'packed',
  DISPATCHED = 'dispatched',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  RETURNED = 'returned'
}

@Entity('sales_dispatches')
export class SalesDispatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  dispatchNo: string;

  @Column('uuid')
  salesOrderId: string;

  @ManyToOne(() => SalesOrder)
  @JoinColumn({ name: 'salesOrderId' })
  salesOrder: SalesOrder;

  @Column('date')
  dispatchDate: Date;

  @Column('date', { nullable: true })
  expectedDeliveryDate: Date;

  @Column({ nullable: true })
  trackingNo: string;

  @Column({ nullable: true })
  courierService: string;

  @Column('text', { nullable: true })
  shippingAddress: string;

  @Column({
    type: 'enum',
    enum: DispatchStatus,
    default: DispatchStatus.PENDING
  })
  status: DispatchStatus;

  @Column('text', { nullable: true })
  notes: string;

  @Column('uuid', { nullable: true })
  assignedTo: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
