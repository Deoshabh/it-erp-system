import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { Zone } from './zone.entity';
import { Item } from './item.entity';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20 })
  referenceNumber: string;

  @Column({
    type: 'enum',
    enum: ['in', 'out', 'transfer', 'adjustment'],
  })
  type: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  })
  status: string;

  @Column('decimal', { precision: 10, scale: 3 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitCost: number;

  @Column('decimal', { precision: 12, scale: 2 })
  totalValue: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Item, item => item.stockMovements)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ name: 'item_id' })
  itemId: string;

  @ManyToOne(() => Warehouse, warehouse => warehouse.stockMovements)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ name: 'warehouse_id' })
  warehouseId: string;

  @ManyToOne(() => Zone, zone => zone.stockMovements)
  @JoinColumn({ name: 'zone_id' })
  zone: Zone;

  @Column({ name: 'zone_id' })
  zoneId: string;

  @Column({ length: 50, nullable: true })
  batchNumber: string;

  @Column({ length: 50, nullable: true })
  serialNumber: string;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
