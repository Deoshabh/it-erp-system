import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StockMovement } from './stock-movement.entity';
import { Zone } from './zone.entity';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  warehouseCode: string;

  @Column({ length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: ['main', 'branch', 'transit', 'virtual'],
    default: 'main'
  })
  type: string;

  @Column('jsonb')
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };

  @Column({ length: 100 })
  managerName: string;

  @Column({ length: 15 })
  contactNumber: string;

  @Column({ length: 100 })
  email: string;

  @Column('decimal', { precision: 15, scale: 2 })
  totalCapacity: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  usedCapacity: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Zone, zone => zone.warehouse)
  zones: Zone[];

  @OneToMany(() => StockMovement, stockMovement => stockMovement.warehouse)
  stockMovements: StockMovement[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
