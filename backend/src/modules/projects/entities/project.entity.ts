import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  client: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column('decimal', { precision: 12, scale: 2 })
  budget: number;

  @Column()
  manager: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: 'planning' })
  status: string; // planning, active, completed, on-hold

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
