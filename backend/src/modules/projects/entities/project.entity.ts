import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from './task.entity';

export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ProjectType {
  INTERNAL = 'internal',
  CLIENT = 'client',
  RESEARCH = 'research',
  MAINTENANCE = 'maintenance',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  objectives: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING,
  })
  status: ProjectStatus;

  @Column({
    type: 'enum',
    enum: ProjectPriority,
    default: ProjectPriority.MEDIUM,
  })
  priority: ProjectPriority;

  @Column({
    type: 'enum',
    enum: ProjectType,
    default: ProjectType.INTERNAL,
  })
  type: ProjectType;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'date', nullable: true })
  actualStartDate: Date;

  @Column({ type: 'date', nullable: true })
  actualEndDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budget: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, default: 0 })
  actualCost: number;

  @Column({ type: 'integer', default: 0 })
  progress: number;

  @Column({ length: 200, nullable: true })
  clientName: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: true })
  isActive: boolean;

  // Relations
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'managerId' })
  manager: User;

  @Column()
  managerId: string;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'project_team_members',
    joinColumn: { name: 'projectId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  teamMembers: User[];

  @OneToMany(() => Task, task => task.project)
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual properties
  get isOverdue(): boolean {
    if (this.status === ProjectStatus.COMPLETED || this.status === ProjectStatus.CANCELLED) {
      return false;
    }
    return new Date() > new Date(this.endDate);
  }

  get daysRemaining(): number {
    const today = new Date();
    const endDate = new Date(this.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  get budgetUtilization(): number {
    if (!this.budget || this.budget === 0) return 0;
    return (this.actualCost / this.budget) * 100;
  }
}
