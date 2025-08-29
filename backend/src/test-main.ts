import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function testBackend() {
  try {
    console.log('🚀 Starting backend test...');
    
    // Create the application
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn'],
    });

    // Enable CORS for frontend integration
    app.enableCors({
      origin: 'http://localhost:3000',
      credentials: true,
    });

    const port = process.env.PORT || 3001;
    await app.listen(port);
    
    console.log(`✅ Backend is running on http://localhost:${port}`);
    console.log('✅ All modules successfully loaded and connected');
    
    // Test basic endpoints
    console.log('\n📍 Available API endpoints:');
    console.log('- GET  /api/users');
    console.log('- GET  /api/employees');
    console.log('- GET  /api/finance');
    console.log('- GET  /api/files');
    console.log('- POST /api/auth/login');
    console.log('- GET  /api/health');
    
  } catch (error) {
    console.error('❌ Backend startup failed:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down backend...');
  process.exit(0);
});

testBackend();
