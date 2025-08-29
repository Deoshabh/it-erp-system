import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DashboardWidgetType {
  CHART = 'chart',
  METRIC = 'metric',
  TABLE = 'table',
  PROGRESS = 'progress',
  LIST = 'list',
  CALENDAR = 'calendar',
}

export enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  DOUGHNUT = 'doughnut',
  AREA = 'area',
  SCATTER = 'scatter',
}

@Entity('dashboard_widgets')
export class DashboardWidget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DashboardWidgetType,
  })
  type: DashboardWidgetType;

  @Column({
    type: 'enum',
    enum: ChartType,
    nullable: true,
  })
  chartType: ChartType;

  @Column({ type: 'jsonb' })
  configuration: any;

  @Column({ type: 'text' })
  dataSource: string;

  @Column({ type: 'jsonb', nullable: true })
  filters: any;

  @Column({ type: 'int', default: 12 })
  width: number; // Grid width (1-12)

  @Column({ type: 'int', default: 6 })
  height: number; // Grid height

  @Column({ type: 'int', default: 0 })
  xPosition: number;

  @Column({ type: 'int', default: 0 })
  yPosition: number;

  @Column({ type: 'int', default: 300 })
  refreshInterval: number; // seconds

  @Column({ default: true })
  isVisible: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ length: 100, default: 'default' })
  category: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual properties
  get gridSpan(): string {
    return `col-span-${this.width}`;
  }

  get refreshIntervalMs(): number {
    return this.refreshInterval * 1000;
  }
}
