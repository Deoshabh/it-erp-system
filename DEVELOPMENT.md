# IT ERP System Development Setup

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### 1. Install Dependencies

#### Backend (NestJS)
```bash
cd backend
npm install
```

#### Frontend (Next.js)
```bash
cd frontend
npm install
```

### 2. Environment Setup

#### Backend Environment (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=it_erp

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# AWS Configuration (for local development)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
S3_BUCKET_NAME=it-erp-documents

# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

#### Frontend Environment (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql
```

### 3. Development with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Manual Development Setup

#### Start Database & Redis
```bash
docker-compose up postgres redis -d
```

#### Start Backend
```bash
cd backend
npm run start:dev
```

#### Start Frontend
```bash
cd frontend
npm run dev
```

### 5. Database Setup

The database will be automatically initialized with:
- User roles and permissions
- Sample data for development
- Required indexes and constraints

### 6. Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **GraphQL Playground**: http://localhost:3001/graphql
- **API Documentation**: http://localhost:3001/api/docs
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)

### 7. Default Login

Development user:
- Email: admin@company.com
- Password: Admin123!

## Development Commands

### Backend
```bash
# Development
npm run start:dev

# Build
npm run build

# Tests
npm run test
npm run test:e2e

# Database migrations
npm run migration:generate
npm run migration:run
```

### Frontend
```bash
# Development
npm run dev

# Build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## Project Structure

```
it-erp-system/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication
│   │   │   ├── users/      # User management
│   │   │   ├── employees/  # Employee management
│   │   │   ├── projects/   # Project management
│   │   │   ├── finance/    # Financial management
│   │   │   ├── sales/      # Sales & CRM
│   │   │   └── ...
│   │   ├── database/       # Database configuration
│   │   └── common/         # Shared utilities
│   └── ...
├── frontend/               # Next.js web application
│   ├── src/
│   │   ├── app/           # Next.js 13+ app directory
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities and configurations
│   │   └── styles/        # CSS and styling
│   └── ...
├── mobile/                # React Native mobile app
├── infrastructure/        # AWS infrastructure code
└── docs/                  # Documentation
```

## API Documentation

The API documentation is automatically generated and available at:
- REST API: http://localhost:3001/api/docs
- GraphQL: http://localhost:3001/graphql

## Testing

### Backend Testing
```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend Testing
```bash
cd frontend

# Jest tests
npm run test

# E2E tests with Playwright
npm run test:e2e
```

## Deployment

See the infrastructure directory for AWS deployment scripts using:
- AWS CDK or Terraform
- ECS Fargate for backend services
- CloudFront + S3 for frontend
- Aurora PostgreSQL for database
- ElastiCache for Redis

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## Support

For development support, check:
1. This README file
2. API documentation
3. Component documentation in the code
4. GitHub issues
