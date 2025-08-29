import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Item } from './item.entity';

@Entity('batches')
export class Batch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  batchNumber: string;

  @Column({ type: 'date' })
  manufacturingDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column('decimal', { precision: 10, scale: 3 })
  totalQuantity: number;

  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  usedQuantity: number;

  @Column('decimal', { precision: 10, scale: 3 })
  remainingQuantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  costPerUnit: number;

  @Column({ length: 100, nullable: true })
  vendor: string;

  @Column({ length: 100, nullable: true })
  lotNumber: string;

  @Column({
    type: 'enum',
    enum: ['active', 'expired', 'quarantine', 'consumed'],
    default: 'active'
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Item, item => item.batches)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ name: 'item_id' })
  itemId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
