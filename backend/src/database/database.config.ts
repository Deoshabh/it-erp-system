import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";

export const databaseConfig = (
  configService: ConfigService
): TypeOrmModuleOptions => ({
  type: "postgres",
  host: configService.get("DB_HOST", "localhost"),
  port: Number(configService.get("DB_PORT", 5432)),
  username: configService.get("DB_USERNAME", "postgres"),
  password: configService.get("DB_PASSWORD", "password"),
  database: configService.get("DB_DATABASE", "it-erp-backend"),

  // Entity and Migration Configuration
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
  migrations: [__dirname + "/../migrations/*{.ts,.js}"],

  // Environment-specific Database Behavior
  synchronize: configService.get("NODE_ENV") !== "production", // Never sync in production
  migrationsRun: configService.get("NODE_ENV") === "production", // Auto-run migrations in production

  // SSL Configuration - Enhanced for Production
  ssl:
    configService.get("NODE_ENV") === "production" &&
    configService.get("PGSSLMODE") !== "disable"
      ? {
          rejectUnauthorized: false,
          ca: configService.get("DB_SSL_CA"),
          key: configService.get("DB_SSL_KEY"),
          cert: configService.get("DB_SSL_CERT"),
        }
      : false,

  // Connection Pool Configuration
  extra: {
    connectionLimit: Number(configService.get("DB_CONNECTION_LIMIT", 10)),
    acquireTimeout: Number(configService.get("DB_ACQUIRE_TIMEOUT", 60000)),
    timeout: Number(configService.get("DB_TIMEOUT", 60000)),

    // Production-specific options
    ...(configService.get("NODE_ENV") === "production" && {
      application_name: configService.get(
        "DB_APPLICATION_NAME",
        "IT-ERP-System"
      ),
    }),
  },

  // Logging Configuration
  logging:
    configService.get("NODE_ENV") === "development" ? "all" : ["error", "warn"],
  logger: "advanced-console",

  // Performance and Debugging
  cache: {
    duration: Number(configService.get("DB_CACHE_DURATION", 30000)), // 30 seconds
  },
  maxQueryExecutionTime: Number(configService.get("DB_MAX_QUERY_TIME", 1000)), // Log slow queries

  // Retry Configuration
  retryAttempts: Number(configService.get("DB_RETRY_ATTEMPTS", 3)),
  retryDelay: Number(configService.get("DB_RETRY_DELAY", 3000)),

  // Auto-load entities in development
  autoLoadEntities: configService.get("NODE_ENV") === "development",

  // Keep connection alive
  keepConnectionAlive: true,
});
