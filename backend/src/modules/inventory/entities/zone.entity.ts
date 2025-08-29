import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { StockMovement } from './stock-movement.entity';

@Entity('zones')
export class Zone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20 })
  zoneCode: string;

  @Column({ length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: ['receiving', 'storage', 'picking', 'packing', 'shipping', 'quarantine'],
    default: 'storage'
  })
  type: string;

  @Column('decimal', { precision: 10, scale: 2 })
  capacity: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  usedCapacity: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Warehouse, warehouse => warehouse.zones)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ name: 'warehouse_id' })
  warehouseId: string;

  @OneToMany(() => StockMovement, stockMovement => stockMovement.zone)
  stockMovements: StockMovement[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
