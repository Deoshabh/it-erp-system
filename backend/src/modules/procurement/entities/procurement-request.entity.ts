import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ProcurementStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ORDERED = 'ordered',
  RECEIVED = 'received',
  CANCELLED = 'cancelled'
}

export enum ProcurementPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum ProcurementCategory {
  OFFICE_SUPPLIES = 'office_supplies',
  IT_EQUIPMENT = 'it_equipment',
  SOFTWARE_LICENSES = 'software_licenses',
  FURNITURE = 'furniture',
  MARKETING = 'marketing',
  TRAVEL = 'travel',
  TRAINING = 'training',
  SERVICES = 'services',
  MAINTENANCE = 'maintenance',
  OTHER = 'other'
}

@Entity('procurement_requests')
export class ProcurementRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  requestId: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ProcurementCategory,
    default: ProcurementCategory.OTHER
  })
  category: ProcurementCategory;

  @Column({
    type: 'enum',
    enum: ProcurementPriority,
    default: ProcurementPriority.MEDIUM
  })
  priority: ProcurementPriority;

  @Column({
    type: 'enum',
    enum: ProcurementStatus,
    default: ProcurementStatus.DRAFT
  })
  status: ProcurementStatus;

  @Column('decimal', { precision: 12, scale: 2 })
  estimatedAmount: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  actualAmount: number;

  @Column({ nullable: true })
  vendor: string;

  @Column({ nullable: true })
  vendorContact: string;

  @Column('date', { nullable: true })
  requiredBy: Date;

  @Column('date', { nullable: true })
  approvedAt: Date;

  @Column('date', { nullable: true })
  orderedAt: Date;

  @Column('date', { nullable: true })
  receivedAt: Date;

  @Column('text', { nullable: true })
  approvalNotes: string;

  @Column('text', { nullable: true })
  rejectionReason: string;

  @Column()
  requesterId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requesterId' })
  requester: User;

  @Column({ nullable: true })
  approverId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approverId' })
  approver: User;

  @Column()
  department: string;

  @Column('json', { nullable: true })
  attachments: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
