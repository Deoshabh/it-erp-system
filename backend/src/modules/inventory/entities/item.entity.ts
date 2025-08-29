import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StockMovement } from './stock-movement.entity';
import { Batch } from './batch.entity';
import { Serial } from './serial.entity';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20, unique: true })
  itemCode: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['product', 'service', 'asset'],
    default: 'product'
  })
  type: string;

  @Column({ length: 50 })
  category: string;

  @Column({ length: 50, nullable: true })
  subcategory: string;

  @Column({ length: 20 })
  unit: string;

  @Column('decimal', { precision: 10, scale: 2 })
  standardCost: number;

  @Column('decimal', { precision: 10, scale: 2 })
  sellingPrice: number;

  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  currentStock: number;

  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  minimumStock: number;

  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  maximumStock: number;

  @Column({ default: false })
  isBatchTracked: boolean;

  @Column({ default: false })
  isSerialTracked: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  specifications: any;

  @Column({ length: 20, nullable: true })
  hsnCode: string; // For Indian GST compliance

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  gstRate: number; // GST rate in percentage

  @OneToMany(() => StockMovement, stockMovement => stockMovement.item)
  stockMovements: StockMovement[];

  @OneToMany(() => Batch, batch => batch.item)
  batches: Batch[];

  @OneToMany(() => Serial, serial => serial.item)
  serials: Serial[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
