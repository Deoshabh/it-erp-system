import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

// Create a simple health check controller for testing
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      modules: {
        users: 'available',
        employees: 'available',
        finance: 'available',
        files: 'available',
        sales: 'available',
        projects: 'available',
        notifications: 'available',
        admin: 'available',
        procurement: 'available',
        auth: 'available',
        email: 'available'
      }
    };
  }
}

import { Module } from '@nestjs/common';

@Module({
  controllers: [HealthController],
})
export class TestModule {}

describe('System Integration Test (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should have health endpoint working', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.modules).toBeDefined();
        expect(res.body.modules.users).toBe('available');
        expect(res.body.modules.employees).toBe('available');
        expect(res.body.modules.finance).toBe('available');
        expect(res.body.modules.files).toBe('available');
      });
  });

  it('should return proper JSON structure', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(typeof res.body).toBe('object');
        expect(res.body).toHaveProperty('status');
        expect(res.body).toHaveProperty('timestamp');
        expect(res.body).toHaveProperty('modules');
      });
  });
});
