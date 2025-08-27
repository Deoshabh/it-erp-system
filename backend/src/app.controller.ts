import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth(): string {
    return 'IT ERP System API - Running Successfully! 🚀';
  }

  @Get('health')
  getHealthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'IT ERP System API',
      version: '1.0.0',
      endpoints: [
        'GET /api/v1/users',
        'POST /api/v1/users',
        'GET /api/v1/users/:id',
        'PATCH /api/v1/users/:id',
        'DELETE /api/v1/users/:id',
        'GET /api/v1/users/count'
      ]
    };
  }
}
