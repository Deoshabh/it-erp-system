import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Item } from './item.entity';

@Entity('serials')
export class Serial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  serialNumber: string;

  @Column({
    type: 'enum',
    enum: ['available', 'sold', 'damaged', 'returned', 'under_repair'],
    default: 'available'
  })
  status: string;

  @Column({ type: 'date', nullable: true })
  manufacturingDate: Date;

  @Column({ type: 'date', nullable: true })
  warrantyExpiry: Date;

  @Column({ length: 100, nullable: true })
  vendor: string;

  @Column({ length: 50, nullable: true })
  batchNumber: string;

  @Column('decimal', { precision: 10, scale: 2 })
  purchaseCost: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid', nullable: true })
  soldToCustomer: string;

  @Column({ type: 'date', nullable: true })
  soldDate: Date;

  @ManyToOne(() => Item, item => item.serials)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ name: 'item_id' })
  itemId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
