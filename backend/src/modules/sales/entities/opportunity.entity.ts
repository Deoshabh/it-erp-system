import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Customer } from './customer.entity';
import { Lead } from './lead.entity';

export enum OpportunityStage {
  PROSPECTING = 'prospecting',
  QUALIFICATION = 'qualification',
  NEEDS_ANALYSIS = 'needs_analysis',
  VALUE_PROPOSITION = 'value_proposition',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost'
}

export enum OpportunityType {
  NEW_BUSINESS = 'new_business',
  EXISTING_BUSINESS = 'existing_business',
  RENEWAL = 'renewal',
  UPSELL = 'upsell',
  CROSS_SELL = 'cross_sell'
}

@Entity('opportunities')
export class Opportunity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: OpportunityStage,
    default: OpportunityStage.PROSPECTING
  })
  stage: OpportunityStage;

  @Column({
    type: 'enum',
    enum: OpportunityType,
    default: OpportunityType.NEW_BUSINESS
  })
  type: OpportunityType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'int', default: 10 })
  probability: number;

  @Column({ type: 'date' })
  expectedCloseDate: Date;

  @Column({ type: 'date', nullable: true })
  actualCloseDate: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  nextSteps: string;

  @Column({ type: 'text', nullable: true })
  competitorAnalysis: string;

  @Column({ type: 'text', nullable: true })
  lossReason: string;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ type: 'uuid', nullable: true })
  customerId: string;

  @ManyToOne(() => Lead, { nullable: true })
  @JoinColumn({ name: 'leadId' })
  lead: Lead;

  @Column({ type: 'uuid', nullable: true })
  leadId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ type: 'uuid' })
  ownerId: string;

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
