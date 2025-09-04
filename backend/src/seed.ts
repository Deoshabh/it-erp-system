import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { UsersService } from "./modules/users/users.service";
import {
  UserRole,
  UserStatus,
  Department,
  Designation,
} from "./modules/users/entities/user.entity";
import * as bcrypt from "bcrypt";

interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department: Department;
  designation: Designation;
  phone?: string;
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  try {
    console.log("🌱 Starting database seeding...");
    console.log("📊 Creating comprehensive test user accounts\n");

    // Define all test users
    const testUsers: CreateUserData[] = [
      // Admin User
      {
        email: "admin@company.com",
        password: "admin123",
        firstName: "System",
        lastName: "Administrator",
        role: UserRole.ADMIN,
        department: Department.INFORMATION_TECHNOLOGY,
        designation: Designation.SYSTEM_ADMINISTRATOR,
        phone: "+1-555-0101",
      },

      // HR User
      {
        email: "hr@company.com",
        password: "hr123",
        firstName: "John",
        lastName: "Smith",
        role: UserRole.HR,
        department: Department.HUMAN_RESOURCES,
        designation: Designation.HR_MANAGER,
        phone: "+1-555-0102",
      },

      // Manager User
      {
        email: "manager@company.com",
        password: "manager123",
        firstName: "Sarah",
        lastName: "Johnson",
        role: UserRole.MANAGER,
        department: Department.INFORMATION_TECHNOLOGY,
        designation: Designation.MANAGER,
        phone: "+1-555-0103",
      },

      // Finance User
      {
        email: "finance@company.com",
        password: "finance123",
        firstName: "Michael",
        lastName: "Davis",
        role: UserRole.FINANCE,
        department: Department.FINANCE,
        designation: Designation.FINANCE_MANAGER,
        phone: "+1-555-0104",
      },

      // Sales User
      {
        email: "sales@company.com",
        password: "sales123",
        firstName: "Emily",
        lastName: "Wilson",
        role: UserRole.SALES,
        department: Department.SALES,
        designation: Designation.SALES_MANAGER,
        phone: "+1-555-0105",
      },

      // Employee User
      {
        email: "employee@company.com",
        password: "emp123",
        firstName: "David",
        lastName: "Brown",
        role: UserRole.EMPLOYEE,
        department: Department.INFORMATION_TECHNOLOGY,
        designation: Designation.SOFTWARE_ENGINEER,
        phone: "+1-555-0106",
      },

      // Additional Test Users for Comprehensive Testing
      {
        email: "john.employee@company.com",
        password: "employee123",
        firstName: "John",
        lastName: "Employee",
        role: UserRole.EMPLOYEE,
        department: Department.INFORMATION_TECHNOLOGY,
        designation: Designation.SOFTWARE_ENGINEER,
        phone: "+1-555-0107",
      },

      {
        email: "jane.hr@company.com",
        password: "hr123",
        firstName: "Jane",
        lastName: "HR",
        role: UserRole.HR,
        department: Department.HUMAN_RESOURCES,
        designation: Designation.HR_EXECUTIVE,
        phone: "+1-555-0108",
      },
    ];

    let createdCount = 0;
    let existingCount = 0;

    // Create users
    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await usersService.findByEmail(userData.email);

        if (existingUser) {
          console.log(
            `⚠️  User already exists: ${userData.email} (${userData.role})`
          );
          existingCount++;
        } else {
          // Hash password
          const hashedPassword = await bcrypt.hash(userData.password, 10);

          // Create user
          const newUser = await usersService.create({
            email: userData.email,
            password: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            department: userData.department,
            designation: userData.designation,
            phone: userData.phone,
          });

          console.log(
            `✅ Created ${userData.role.toUpperCase()} user: ${userData.email}`
          );
          console.log(`   Name: ${userData.firstName} ${userData.lastName}`);
          console.log(`   Password: ${userData.password}`);
          console.log(`   User ID: ${newUser.id}\n`);
          createdCount++;
        }
      } catch (error) {
        console.error(
          `❌ Error creating user ${userData.email}:`,
          error.message
        );
      }
    }

    // Summary
    console.log("🎉 Database seeding completed!\n");
    console.log("📈 Summary:");
    console.log(`   ✅ Users created: ${createdCount}`);
    console.log(`   ⚠️  Users already existed: ${existingCount}`);
    console.log(`   📊 Total users: ${createdCount + existingCount}\n`);

    // Login credentials table
    console.log("🔑 Test Account Credentials:");
    console.log(
      "┌─────────────────────────────────┬──────────────┬─────────────────────┐"
    );
    console.log(
      "│ Email                           │ Password     │ Role                │"
    );
    console.log(
      "├─────────────────────────────────┼──────────────┼─────────────────────┤"
    );

    testUsers.forEach((user) => {
      const email = user.email.padEnd(31);
      const password = user.password.padEnd(12);
      const role = user.role.toUpperCase().padEnd(19);
      console.log(`│ ${email} │ ${password} │ ${role} │`);
    });

    console.log(
      "└─────────────────────────────────┴──────────────┴─────────────────────┘\n"
    );

    console.log("🚀 System is ready for testing!");
    console.log("   • Use any of the above credentials to log in");
    console.log("   • Admin user has full system access");
    console.log("   • Each role has different permissions as per RBAC");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    console.error("Stack trace:", error.stack);
  } finally {
    await app.close();
  }
}

// Run the seed script
bootstrap().catch((error) => {
  console.error("❌ Failed to start seeding:", error);
  process.exit(1);
});
