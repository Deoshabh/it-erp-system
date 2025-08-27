import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';
import { UserRole } from './modules/users/entities/user.entity';

async function seed() {
  console.log('🌱 Starting database seed...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const testUsers = [
    {
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@company.com',
      password: 'admin123',
      role: UserRole.ADMIN,
      department: 'IT',
      position: 'System Administrator',
      phone: '+1-555-0101',
      salary: 85000,
      address: '123 Admin St, Tech City, TC 12345',
      isActive: true,
    },
    {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'hr@company.com',
      password: 'hr123',
      role: UserRole.HR,
      department: 'Human Resources',
      position: 'HR Manager',
      phone: '+1-555-0102',
      salary: 75000,
      address: '456 HR Ave, People City, PC 23456',
      isActive: true,
    },
    {
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'manager@company.com',
      password: 'manager123',
      role: UserRole.MANAGER,
      department: 'Operations',
      position: 'Operations Manager',
      phone: '+1-555-0103',
      salary: 80000,
      address: '789 Manager Rd, Business City, BC 34567',
      isActive: true,
    },
    {
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'finance@company.com',
      password: 'finance123',
      role: UserRole.FINANCE,
      department: 'Finance',
      position: 'Finance Manager',
      phone: '+1-555-0104',
      salary: 78000,
      address: '101 Finance St, Money City, MC 45678',
      isActive: true,
    },
    {
      firstName: 'James',
      lastName: 'Wilson',
      email: 'sales@company.com',
      password: 'sales123',
      role: UserRole.SALES,
      department: 'Sales',
      position: 'Sales Manager',
      phone: '+1-555-0105',
      salary: 72000,
      address: '202 Sales Ave, Revenue City, RC 56789',
      isActive: true,
    },
    {
      firstName: 'Anna',
      lastName: 'Rodriguez',
      email: 'employee@company.com',
      password: 'emp123',
      role: UserRole.EMPLOYEE,
      department: 'Marketing',
      position: 'Marketing Specialist',
      phone: '+1-555-0106',
      salary: 55000,
      address: '303 Employee Blvd, Worker City, WC 67890',
      isActive: true,
    },
  ];

  console.log('Creating test users...');
  
  for (const userData of testUsers) {
    try {
      // Check if user already exists
      const existingUser = await usersService.findByEmail(userData.email);
      if (existingUser) {
        console.log(`🔄 Updating existing user: ${userData.email}`);
        // Delete existing user and recreate with correct password
        await usersService.remove(existingUser.id);
      }

      // Create new user
      const user = await usersService.create(userData);
      console.log(`✓ Created user: ${user.email} (${user.role})`);
    } catch (error) {
      console.error(`✗ Failed to create user ${userData.email}:`, error.message);
    }
  }

  console.log('🎉 Database seed completed!');
  console.log('\n📋 Test Account Credentials:');
  console.log('Admin:    admin@company.com / admin123');
  console.log('HR:       hr@company.com / hr123');
  console.log('Manager:  manager@company.com / manager123');
  console.log('Finance:  finance@company.com / finance123');
  console.log('Sales:    sales@company.com / sales123');
  console.log('Employee: employee@company.com / emp123');

  await app.close();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
