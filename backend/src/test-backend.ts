import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Import controllers to test endpoints without database
import { UsersController } from './modules/users/users.controller';
import { EmployeesController } from './modules/employees/employees.controller';
import { FinanceController } from './modules/finance/finance.controller';
import { FilesController } from './modules/files/files.controller';

// Mock services for testing
import { Injectable } from '@nestjs/common';

@Injectable()
export class MockUsersService {
  async findAll() {
    return [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
    ];
  }
  
  async findOne(id: number) {
    return { id, name: 'Test User', email: 'test@example.com', role: 'user' };
  }
}

@Injectable()
export class MockEmployeesService {
  async findAll() {
    return [
      { id: 1, name: 'Alice Johnson', department: 'Engineering', position: 'Developer' },
      { id: 2, name: 'Bob Wilson', department: 'Sales', position: 'Manager' },
    ];
  }
}

@Injectable()
export class MockFinanceService {
  async findAll() {
    return [
      { id: 1, type: 'Income', amount: 50000, date: '2024-01-15' },
      { id: 2, type: 'Expense', amount: 15000, date: '2024-01-20' },
    ];
  }
}

@Injectable()
export class MockFilesService {
  async findAll() {
    return [
      { id: 1, filename: 'document1.pdf', size: 1024, uploadDate: '2024-01-10' },
      { id: 2, filename: 'image1.jpg', size: 2048, uploadDate: '2024-01-12' },
    ];
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [
    UsersController,
    EmployeesController,
    FinanceController,
    FilesController,
  ],
  providers: [
    { provide: 'UsersService', useClass: MockUsersService },
    { provide: 'EmployeesService', useClass: MockEmployeesService },
    { provide: 'FinanceService', useClass: MockFinanceService },
    { provide: 'FilesService', useClass: MockFilesService },
  ],
})
export class TestAppModule {}

async function testBackend() {
  try {
    console.log('🚀 Starting backend test without database...');
    
    const app = await NestFactory.create(TestAppModule, {
      logger: ['log', 'error', 'warn'],
    });

    app.enableCors({
      origin: 'http://localhost:3000',
      credentials: true,
    });

    app.setGlobalPrefix('api');

    const port = 3001;
    await app.listen(port);
    
    console.log(`✅ Test backend running on http://localhost:${port}`);
    console.log('✅ All module controllers loaded successfully');
    console.log('\n📍 Test endpoints available:');
    console.log('- GET  http://localhost:3001/api/users');
    console.log('- GET  http://localhost:3001/api/employees');
    console.log('- GET  http://localhost:3001/api/finance');
    console.log('- GET  http://localhost:3001/api/files');
    
  } catch (error) {
    console.error('❌ Test backend failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down test backend...');
  process.exit(0);
});

testBackend();
