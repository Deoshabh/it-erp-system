import { ConfigModule } from '@nestjs/config';

// Global test setup
beforeAll(async () => {
  // Load test environment variables
  process.env.NODE_ENV = 'test';
});

// Global test teardown
afterAll(async () => {
  // Cleanup after tests
});
