import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { User, UserRole, UserStatus } from '../modules/users/entities/user.entity';

async function seed() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);
  
  try {
    // Check if admin user already exists
    const userRepository = dataSource.getRepository(User);
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@admin.com' }
    });

    if (!existingAdmin) {
      // Create default admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = userRepository.create({
        email: 'admin@admin.com',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        department: 'IT',
        designation: 'System Administrator',
      });

      await userRepository.save(adminUser);
      console.log('Default admin user created:');
      console.log('Email: admin@admin.com');
      console.log('Password: admin123');
    } else {
      console.log('Admin user already exists');
    }

    // Create default employee user
    const existingEmployee = await userRepository.findOne({
      where: { email: 'employee@test.com' }
    });

    if (!existingEmployee) {
      const hashedPassword = await bcrypt.hash('employee123', 10);
      
      const employeeUser = userRepository.create({
        email: 'employee@test.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'Employee',
        role: UserRole.EMPLOYEE,
        status: UserStatus.ACTIVE,
        department: 'General',
        designation: 'Employee',
      });

      await userRepository.save(employeeUser);
      console.log('Default employee user created:');
      console.log('Email: employee@test.com');
      console.log('Password: employee123');
    } else {
      console.log('Employee user already exists');
    }

  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await app.close();
  }
}

seed();
