import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  VIEW = 'view',
  DOWNLOAD = 'download',
  UPLOAD = 'upload',
  EXPORT = 'export',
  IMPORT = 'import',
}

export enum AuditEntityType {
  USER = 'user',
  EMPLOYEE = 'employee',
  PROJECT = 'project',
  TASK = 'task',
  FINANCE = 'finance',
  FILE = 'file',
  NOTIFICATION = 'notification',
  SETTING = 'setting',
  SYSTEM = 'system',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({
    type: 'enum',
    enum: AuditEntityType,
  })
  entityType: AuditEntityType;

  @Column({ nullable: true })
  entityId: string;

  @Column({ length: 200, nullable: true })
  entityName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValues: any;

  @Column({ type: 'jsonb', nullable: true })
  newValues: any;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ length: 45, nullable: true })
  ipAddress: string;

  @Column({ length: 500, nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  sessionId: string;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  // Virtual properties
  get isSystemAction(): boolean {
    return this.userId === null;
  }

  get actionDescription(): string {
    return `${this.action.toUpperCase()} ${this.entityType} ${this.entityName || this.entityId || ''}`.trim();
  }
}
