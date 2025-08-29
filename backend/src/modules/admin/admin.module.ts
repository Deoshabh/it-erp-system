import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogController } from './controllers/audit-log.controller';
import { SystemSettingController } from './controllers/system-setting.controller';
import { DashboardWidgetController } from './controllers/dashboard-widget.controller';
import { AdminController } from './controllers/admin.controller';
import { AuditLogService } from './services/audit-log.service';
import { SystemSettingService } from './services/system-setting.service';
import { DashboardWidgetService } from './services/dashboard-widget.service';
import { AuditLog } from './entities/audit-log.entity';
import { SystemSetting } from './entities/system-setting.entity';
import { DashboardWidget } from './entities/dashboard-widget.entity';
import { UsersModule } from '../users/users.module';
import { ProjectsModule } from '../projects/projects.module';
import { EmployeesModule } from '../employees/employees.module';
import { FinanceModule } from '../finance/finance.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog, SystemSetting, DashboardWidget]),
    UsersModule,
    ProjectsModule,
    EmployeesModule,
    FinanceModule,
    NotificationsModule,
  ],
  controllers: [AuditLogController, SystemSettingController, DashboardWidgetController, AdminController],
  providers: [AuditLogService, SystemSettingService, DashboardWidgetService],
  exports: [AuditLogService, SystemSettingService, DashboardWidgetService],
})
export class AdminModule {}
