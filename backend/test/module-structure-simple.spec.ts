import { Test, TestingModule } from '@nestjs/testing';

// Import all modules to test compilation
import { AppModule } from '../src/app.module';
import { EmployeesModule } from '../src/modules/employees/employees.module';
import { FilesModule } from '../src/modules/files/files.module';
import { FinanceModule } from '../src/modules/finance/finance.module';
import { UsersModule } from '../src/modules/users/users.module';
import { AuthModule } from '../src/modules/auth/auth.module';
import { AdminModule } from '../src/modules/admin/admin.module';
import { SalesModule } from '../src/modules/sales/sales.module';
import { ProjectsModule } from '../src/modules/projects/projects.module';
import { NotificationsModule } from '../src/modules/notifications/notifications.module';
import { ProcurementModule } from '../src/modules/procurement/procurement.module';
import { EmailModule } from '../src/modules/email/email.module';

describe('Module Structure (Compilation Test)', () => {
  it('should import all modules without compilation errors', () => {
    // Test that all modules can be imported
    expect(AppModule).toBeDefined();
    expect(EmployeesModule).toBeDefined();
    expect(FilesModule).toBeDefined();
    expect(FinanceModule).toBeDefined();
    expect(UsersModule).toBeDefined();
    expect(AuthModule).toBeDefined();
    expect(AdminModule).toBeDefined();
    expect(SalesModule).toBeDefined();
    expect(ProjectsModule).toBeDefined();
    expect(NotificationsModule).toBeDefined();
    expect(ProcurementModule).toBeDefined();
    expect(EmailModule).toBeDefined();
  });

  it('should verify module metadata exists', () => {
    // Check that modules have proper metadata
    expect(Reflect.getMetadata('imports', AppModule)).toBeDefined();
    expect(Reflect.getMetadata('controllers', EmployeesModule)).toBeDefined();
    expect(Reflect.getMetadata('controllers', FilesModule)).toBeDefined();
    expect(Reflect.getMetadata('controllers', FinanceModule)).toBeDefined();
    expect(Reflect.getMetadata('controllers', UsersModule)).toBeDefined();
  });
});
