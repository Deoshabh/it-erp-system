import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum CustomerType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
  ENTERPRISE = 'enterprise'
}

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PROSPECT = 'prospect',
  CHURNED = 'churned'
}

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: CustomerType,
    default: CustomerType.BUSINESS
  })
  type: CustomerType;

  @Column({
    type: 'enum',
    enum: CustomerStatus,
    default: CustomerStatus.PROSPECT
  })
  status: CustomerStatus;

  @Column({ length: 255, nullable: true })
  website: string;

  @Column({ length: 100, nullable: true })
  industry: string;

  @Column({ type: 'int', nullable: true })
  employeeCount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  annualRevenue: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  billingAddress: string;

  @Column({ length: 100, nullable: true })
  billingCity: string;

  @Column({ length: 100, nullable: true })
  billingState: string;

  @Column({ length: 20, nullable: true })
  billingZipCode: string;

  @Column({ length: 100, nullable: true })
  billingCountry: string;

  @Column({ type: 'text', nullable: true })
  shippingAddress: string;

  @Column({ length: 100, nullable: true })
  shippingCity: string;

  @Column({ length: 100, nullable: true })
  shippingState: string;

  @Column({ length: 20, nullable: true })
  shippingZipCode: string;

  @Column({ length: 100, nullable: true })
  shippingCountry: string;

  @Column({ type: 'timestamp', nullable: true })
  firstPurchaseDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastPurchaseDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPurchaseValue: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'accountManagerId' })
  accountManager: User;

  @Column({ type: 'uuid', nullable: true })
  accountManagerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'uuid' })
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
