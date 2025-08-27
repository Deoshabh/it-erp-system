import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TERMINATED = 'terminated',
  ON_LEAVE = 'on_leave',
  SUSPENDED = 'suspended',
}

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERN = 'intern',
  CONSULTANT = 'consultant',
}

@Entity('employees')
@Index(['department', 'designation'])
@Index(['status'])
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  empId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  phone: string;

  @Column()
  department: string;

  @Column()
  designation: string;

  @Column('decimal', { precision: 15, scale: 2, comment: 'Salary in INR' })
  salary: number;

  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
  })
  status: EmployeeStatus;

  @Column({
    type: 'enum',
    enum: EmploymentType,
    default: EmploymentType.FULL_TIME,
  })
  employmentType: EmploymentType;

  @Column({ type: 'date' })
  joiningDate: string;

  @Column({ type: 'date', nullable: true })
  lastWorkingDate?: string;

  @Column({ nullable: true })
  managerId?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  pincode?: string;

  @Column({ nullable: true })
  emergencyContact?: string;

  @Column({ nullable: true })
  bankAccount?: string;

  @Column({ nullable: true })
  ifscCode?: string;

  @Column({ nullable: true })
  panNumber?: string;

  @Column({ nullable: true })
  aadharNumber?: string;

  @Column({ nullable: true })
  profilePicture?: string;

  @Column('text', { nullable: true })
  skills?: string;

  @Column('text', { nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isActive(): boolean {
    return this.status === EmployeeStatus.ACTIVE;
  }
}
