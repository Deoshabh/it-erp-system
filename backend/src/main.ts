import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend integration
  const corsOrigins = [
    "http://localhost:3003", // Local development
    "http://do8k4g0o8ckkk804s4ko84g0.147.79.66.75.sslip.io", // Production frontend
    process.env.FRONTEND_URL, // Environment variable override
    ...(process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
      : []), // Split comma-separated CORS origins
  ].filter(Boolean);

  console.log("🔧 CORS Configuration:");
  console.log("   Allowed Origins:", corsOrigins);
  console.log("   Frontend URL env:", process.env.FRONTEND_URL);
  console.log("   CORS Origin env:", process.env.CORS_ORIGIN);

  app.enableCors({
    origin: corsOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
  });

  // Set global prefix for API routes
  app.setGlobalPrefix("api/v1");

  const port = parseInt(process.env.PORT || "4101", 10);
  await app.listen(port, "0.0.0.0");
  // eslint-disable-next-line no-console
  console.log(`🚀 Backend listening on ${port}`);
  console.log(`📡 API available at: http://localhost:${port}/api/v1`);
}
bootstrap();
