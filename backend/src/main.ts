import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: [
      "http://localhost:3003",
      "http://localhost:3000",
      /\.sslip\.io$/, // Allow all sslip.io subdomains
      process.env.FRONTEND_URL || "http://localhost:3003",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  });

  const port = parseInt(process.env.PORT || "4101", 10);
  await app.listen(port, "0.0.0.0");
  // eslint-disable-next-line no-console
  console.log(`Backend listening on ${port}`);
}
bootstrap();
