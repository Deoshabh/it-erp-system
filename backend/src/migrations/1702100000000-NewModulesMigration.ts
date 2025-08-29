import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewModulesMigration1702100000000 implements MigrationInterface {
  name = 'NewModulesMigration1702100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Sales tables
    await queryRunner.query(`
      CREATE TYPE "lead_status_enum" AS ENUM('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost');
      CREATE TYPE "lead_source_enum" AS ENUM('website', 'referral', 'social_media', 'email', 'phone', 'event', 'advertisement', 'other');
      
      CREATE TABLE "leads" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "phone" character varying,
        "company" character varying,
        "position" character varying,
        "status" "lead_status_enum" NOT NULL DEFAULT 'new',
        "source" "lead_source_enum" NOT NULL DEFAULT 'other',
        "estimatedValue" numeric(10,2),
        "notes" text,
        "assignedTo" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_leads_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "customer_status_enum" AS ENUM('active', 'inactive', 'potential');
      
      CREATE TABLE "customers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "phone" character varying,
        "company" character varying NOT NULL,
        "address" text,
        "status" "customer_status_enum" NOT NULL DEFAULT 'potential',
        "totalValue" numeric(10,2) NOT NULL DEFAULT 0,
        "notes" text,
        "assignedTo" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_customers_email" UNIQUE ("email"),
        CONSTRAINT "PK_customers_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "opportunity_stage_enum" AS ENUM('prospecting', 'qualification', 'needs_analysis', 'proposal', 'negotiation', 'closed_won', 'closed_lost');
      
      CREATE TABLE "opportunities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" text,
        "value" numeric(10,2) NOT NULL,
        "stage" "opportunity_stage_enum" NOT NULL DEFAULT 'prospecting',
        "probability" integer NOT NULL DEFAULT 0,
        "expectedCloseDate" TIMESTAMP,
        "customerId" uuid NOT NULL,
        "assignedTo" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_opportunities_id" PRIMARY KEY ("id")
      )
    `);

    // Create Projects tables
    await queryRunner.query(`
      CREATE TYPE "project_status_enum" AS ENUM('planning', 'in_progress', 'on_hold', 'completed', 'cancelled');
      CREATE TYPE "project_priority_enum" AS ENUM('low', 'medium', 'high', 'critical');
      
      CREATE TABLE "projects" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "status" "project_status_enum" NOT NULL DEFAULT 'planning',
        "priority" "project_priority_enum" NOT NULL DEFAULT 'medium',
        "startDate" TIMESTAMP,
        "endDate" TIMESTAMP,
        "budget" numeric(10,2),
        "progress" integer NOT NULL DEFAULT 0,
        "managerId" uuid NOT NULL,
        "clientId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_projects_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "task_status_enum" AS ENUM('todo', 'in_progress', 'review', 'done', 'cancelled');
      CREATE TYPE "task_priority_enum" AS ENUM('low', 'medium', 'high', 'urgent');
      
      CREATE TABLE "tasks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" text,
        "status" "task_status_enum" NOT NULL DEFAULT 'todo',
        "priority" "task_priority_enum" NOT NULL DEFAULT 'medium',
        "dueDate" TIMESTAMP,
        "estimatedHours" integer,
        "actualHours" integer,
        "projectId" uuid NOT NULL,
        "assigneeId" uuid,
        "createdById" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tasks_id" PRIMARY KEY ("id")
      )
    `);

    // Create project-user many-to-many junction table
    await queryRunner.query(`
      CREATE TABLE "project_team_members" (
        "projectId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        CONSTRAINT "PK_project_team_members" PRIMARY KEY ("projectId", "userId")
      )
    `);

    // Create Notifications table
    await queryRunner.query(`
      CREATE TYPE "notification_type_enum" AS ENUM('info', 'success', 'warning', 'error');
      CREATE TYPE "notification_priority_enum" AS ENUM('low', 'medium', 'high', 'urgent');
      
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "message" text NOT NULL,
        "type" "notification_type_enum" NOT NULL DEFAULT 'info',
        "priority" "notification_priority_enum" NOT NULL DEFAULT 'medium',
        "isRead" boolean NOT NULL DEFAULT false,
        "userId" uuid NOT NULL,
        "data" jsonb,
        "expiresAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id")
      )
    `);

    // Create Admin tables
    await queryRunner.query(`
      CREATE TYPE "audit_action_enum" AS ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ACCESS');
      
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "action" "audit_action_enum" NOT NULL,
        "entityType" character varying NOT NULL,
        "entityId" character varying,
        "userId" uuid NOT NULL,
        "ipAddress" character varying,
        "userAgent" character varying,
        "details" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "setting_type_enum" AS ENUM('string', 'number', 'boolean', 'json');
      
      CREATE TABLE "system_settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "key" character varying NOT NULL,
        "value" text NOT NULL,
        "type" "setting_type_enum" NOT NULL DEFAULT 'string',
        "description" character varying,
        "isPublic" boolean NOT NULL DEFAULT false,
        "category" character varying NOT NULL DEFAULT 'general',
        "updatedBy" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_system_settings_key" UNIQUE ("key"),
        CONSTRAINT "PK_system_settings_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "widget_type_enum" AS ENUM('chart', 'metric', 'list', 'table', 'custom');
      
      CREATE TABLE "dashboard_widgets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "type" "widget_type_enum" NOT NULL,
        "config" jsonb NOT NULL,
        "position" jsonb NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "userId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_dashboard_widgets_id" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints for Sales
    await queryRunner.query(`
      ALTER TABLE "leads" ADD CONSTRAINT "FK_leads_assignedTo" 
      FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "customers" ADD CONSTRAINT "FK_customers_assignedTo" 
      FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "opportunities" ADD CONSTRAINT "FK_opportunities_customer" 
      FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "opportunities" ADD CONSTRAINT "FK_opportunities_assignedTo" 
      FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    // Add foreign key constraints for Projects
    await queryRunner.query(`
      ALTER TABLE "projects" ADD CONSTRAINT "FK_projects_manager" 
      FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "projects" ADD CONSTRAINT "FK_projects_client" 
      FOREIGN KEY ("clientId") REFERENCES "customers"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_project" 
      FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_assignee" 
      FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_createdBy" 
      FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "project_team_members" ADD CONSTRAINT "FK_project_team_members_project" 
      FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "project_team_members" ADD CONSTRAINT "FK_project_team_members_user" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    // Add foreign key constraints for Notifications
    await queryRunner.query(`
      ALTER TABLE "notifications" ADD CONSTRAINT "FK_notifications_user" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    // Add foreign key constraints for Admin
    await queryRunner.query(`
      ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_audit_logs_user" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "system_settings" ADD CONSTRAINT "FK_system_settings_updatedBy" 
      FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "dashboard_widgets" ADD CONSTRAINT "FK_dashboard_widgets_user" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    // Create indexes for better performance
    await queryRunner.query(`CREATE INDEX "IDX_leads_status" ON "leads" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_leads_assignedTo" ON "leads" ("assignedTo")`);
    await queryRunner.query(`CREATE INDEX "IDX_customers_status" ON "customers" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_opportunities_stage" ON "opportunities" ("stage")`);
    await queryRunner.query(`CREATE INDEX "IDX_projects_status" ON "projects" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_tasks_status" ON "tasks" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_userId" ON "notifications" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_isRead" ON "notifications" ("isRead")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_action" ON "audit_logs" ("action")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_entityType" ON "audit_logs" ("entityType")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_userId" ON "audit_logs" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_system_settings_category" ON "system_settings" ("category")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_system_settings_category"`);
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_entityType"`);
    await queryRunner.query(`DROP INDEX "IDX_audit_logs_action"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_isRead"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_tasks_status"`);
    await queryRunner.query(`DROP INDEX "IDX_projects_status"`);
    await queryRunner.query(`DROP INDEX "IDX_opportunities_stage"`);
    await queryRunner.query(`DROP INDEX "IDX_customers_status"`);
    await queryRunner.query(`DROP INDEX "IDX_leads_assignedTo"`);
    await queryRunner.query(`DROP INDEX "IDX_leads_status"`);

    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE "dashboard_widgets"`);
    await queryRunner.query(`DROP TABLE "system_settings"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TABLE "project_team_members"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TABLE "opportunities"`);
    await queryRunner.query(`DROP TABLE "customers"`);
    await queryRunner.query(`DROP TABLE "leads"`);
    
    // Drop enums
    await queryRunner.query(`DROP TYPE "widget_type_enum"`);
    await queryRunner.query(`DROP TYPE "setting_type_enum"`);
    await queryRunner.query(`DROP TYPE "audit_action_enum"`);
    await queryRunner.query(`DROP TYPE "notification_priority_enum"`);
    await queryRunner.query(`DROP TYPE "notification_type_enum"`);
    await queryRunner.query(`DROP TYPE "task_priority_enum"`);
    await queryRunner.query(`DROP TYPE "task_status_enum"`);
    await queryRunner.query(`DROP TYPE "project_priority_enum"`);
    await queryRunner.query(`DROP TYPE "project_status_enum"`);
    await queryRunner.query(`DROP TYPE "opportunity_stage_enum"`);
    await queryRunner.query(`DROP TYPE "customer_status_enum"`);
    await queryRunner.query(`DROP TYPE "lead_source_enum"`);
    await queryRunner.query(`DROP TYPE "lead_status_enum"`);
  }
}
