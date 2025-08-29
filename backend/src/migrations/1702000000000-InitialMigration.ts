import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1702000000000 implements MigrationInterface {
  name = 'InitialMigration1702000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Users table
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM('admin', 'hr', 'manager', 'employee', 'finance', 'sales');
      CREATE TYPE "user_status_enum" AS ENUM('active', 'inactive', 'suspended');
      
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "role" "user_role_enum" NOT NULL DEFAULT 'employee',
        "status" "user_status_enum" NOT NULL DEFAULT 'active',
        "avatar" character varying,
        "phone" character varying,
        "department" character varying,
        "designation" character varying,
        "lastLoginAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    // Create Employees table
    await queryRunner.query(`
      CREATE TABLE "employees" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "employeeId" character varying NOT NULL,
        "userId" uuid NOT NULL,
        "department" character varying NOT NULL,
        "designation" character varying NOT NULL,
        "joinDate" TIMESTAMP NOT NULL,
        "salary" numeric(10,2),
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_employees_employeeId" UNIQUE ("employeeId"),
        CONSTRAINT "UQ_employees_userId" UNIQUE ("userId"),
        CONSTRAINT "PK_employees_id" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key for employees
    await queryRunner.query(`
      ALTER TABLE "employees" ADD CONSTRAINT "FK_employees_users" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    // Create Files table
    await queryRunner.query(`
      CREATE TYPE "file_type_enum" AS ENUM('document', 'image', 'video', 'audio', 'other');
      
      CREATE TABLE "files" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "filename" character varying NOT NULL,
        "originalName" character varying NOT NULL,
        "mimetype" character varying NOT NULL,
        "size" integer NOT NULL,
        "path" character varying NOT NULL,
        "type" "file_type_enum" NOT NULL DEFAULT 'other',
        "uploadedBy" uuid NOT NULL,
        "tags" text array DEFAULT '{}',
        "isPublic" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_files_id" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key for files
    await queryRunner.query(`
      ALTER TABLE "files" ADD CONSTRAINT "FK_files_users" 
      FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    // Create Finance tables
    await queryRunner.query(`
      CREATE TYPE "invoice_status_enum" AS ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled');
      
      CREATE TABLE "invoices" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "invoiceNumber" character varying NOT NULL,
        "clientName" character varying NOT NULL,
        "clientEmail" character varying NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "tax" numeric(10,2) NOT NULL DEFAULT 0,
        "total" numeric(10,2) NOT NULL,
        "status" "invoice_status_enum" NOT NULL DEFAULT 'draft',
        "dueDate" TIMESTAMP NOT NULL,
        "description" text,
        "createdBy" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_invoices_invoiceNumber" UNIQUE ("invoiceNumber"),
        CONSTRAINT "PK_invoices_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "expense_category_enum" AS ENUM('office', 'travel', 'equipment', 'marketing', 'utilities', 'other');
      CREATE TYPE "expense_status_enum" AS ENUM('pending', 'approved', 'rejected');
      
      CREATE TABLE "expenses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "description" character varying NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "category" "expense_category_enum" NOT NULL,
        "status" "expense_status_enum" NOT NULL DEFAULT 'pending',
        "expenseDate" TIMESTAMP NOT NULL,
        "receipt" character varying,
        "submittedBy" uuid NOT NULL,
        "approvedBy" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_expenses_id" PRIMARY KEY ("id")
      )
    `);

    // Add foreign keys for finance
    await queryRunner.query(`
      ALTER TABLE "invoices" ADD CONSTRAINT "FK_invoices_users" 
      FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "expenses" ADD CONSTRAINT "FK_expenses_submittedBy" 
      FOREIGN KEY ("submittedBy") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "expenses" ADD CONSTRAINT "FK_expenses_approvedBy" 
      FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE "expenses"`);
    await queryRunner.query(`DROP TABLE "invoices"`);
    await queryRunner.query(`DROP TABLE "files"`);
    await queryRunner.query(`DROP TABLE "employees"`);
    await queryRunner.query(`DROP TABLE "users"`);
    
    // Drop enums
    await queryRunner.query(`DROP TYPE "expense_status_enum"`);
    await queryRunner.query(`DROP TYPE "expense_category_enum"`);
    await queryRunner.query(`DROP TYPE "invoice_status_enum"`);
    await queryRunner.query(`DROP TYPE "file_type_enum"`);
    await queryRunner.query(`DROP TYPE "user_status_enum"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
