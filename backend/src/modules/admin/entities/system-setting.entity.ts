import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum SettingType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
  EMAIL = 'email',
  URL = 'url',
  PASSWORD = 'password',
}

export enum SettingCategory {
  GENERAL = 'general',
  SECURITY = 'security',
  EMAIL = 'email',
  NOTIFICATION = 'notification',
  SYSTEM = 'system',
  INTEGRATION = 'integration',
  APPEARANCE = 'appearance',
}

@Entity('system_settings')
export class SystemSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  key: string;

  @Column({ type: 'text' })
  value: string;

  @Column({
    type: 'enum',
    enum: SettingType,
    default: SettingType.STRING,
  })
  type: SettingType;

  @Column({
    type: 'enum',
    enum: SettingCategory,
    default: SettingCategory.GENERAL,
  })
  category: SettingCategory;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  defaultValue: string;

  @Column({ default: false })
  isSecret: boolean;

  @Column({ default: true })
  isEditable: boolean;

  @Column({ default: false })
  requiresRestart: boolean;

  @Column({ type: 'text', nullable: true })
  validationRules: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'lastModifiedById' })
  lastModifiedBy: User;

  @Column({ nullable: true })
  lastModifiedById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual properties
  get parsedValue(): any {
    try {
      switch (this.type) {
        case SettingType.BOOLEAN:
          return this.value === 'true';
        case SettingType.NUMBER:
          return parseFloat(this.value);
        case SettingType.JSON:
          return JSON.parse(this.value);
        default:
          return this.value;
      }
    } catch (error) {
      return this.value;
    }
  }

  get displayValue(): string {
    if (this.isSecret) {
      return '***';
    }
    return this.value;
  }
}
