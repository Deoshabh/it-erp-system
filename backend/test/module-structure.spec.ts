import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { SalesModule } from '../src/modules/sales/sales.module';
import { ProjectsModule } from '../src/modules/projects/projects.module';
import { NotificationsModule } from '../src/modules/notifications/notifications.module';
import { AdminModule } from '../src/modules/admin/admin.module';
import { UsersModule } from '../src/modules/users/users.module';
import { AuthModule } from '../src/modules/auth/auth.module';
import { EmployeesModule } from '../src/modules/employees/employees.module';
import { FilesModule } from '../src/modules/files/files.module';
import { FinanceModule } from '../src/modules/finance/finance.module';

describe('Module Structure Tests', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider('DataSource')
    .useValue({
      isInitialized: true,
      query: jest.fn(),
      createQueryRunner: jest.fn(),
    })
    .compile();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Core Modules', () => {
    it('should have AppModule defined', () => {
      expect(AppModule).toBeDefined();
    });

    it('should have all core modules', () => {
      expect(UsersModule).toBeDefined();
      expect(AuthModule).toBeDefined();
      expect(EmployeesModule).toBeDefined();
      expect(FilesModule).toBeDefined();
      expect(FinanceModule).toBeDefined();
    });
  });

  describe('New Feature Modules', () => {
    it('should have SalesModule', () => {
      expect(SalesModule).toBeDefined();
    });

    it('should have ProjectsModule', () => {
      expect(ProjectsModule).toBeDefined();
    });

    it('should have NotificationsModule', () => {
      expect(NotificationsModule).toBeDefined();
    });

    it('should have AdminModule', () => {
      expect(AdminModule).toBeDefined();
    });
  });

  describe('Module Dependencies', () => {
    it('should compile without errors', async () => {
      expect(app).toBeDefined();
    });

    it('should have proper module structure', () => {
      const moduleRef = app.get(AppModule);
      expect(moduleRef).toBeDefined();
    });
  });
});
