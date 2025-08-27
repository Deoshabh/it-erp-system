# IT ERP System

A comprehensive Enterprise Resource Planning (ERP) system built with modern web technologies, featuring role-based access control, employee management, procurement, finance, and file management modules.

##  Features

###  Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Six user roles: Admin, HR, Manager, Finance, Sales, Employee
- Granular permission system with resource-action mapping

###  User Management
- Complete user lifecycle management
- Role assignment and permission control
- User profile management
- Department-based organization

###  Employee Management
- Employee profile management
- Department and role assignment
- Employment status tracking
- Role-based data filtering (employees see only their own data)

###  Finance Module
- Financial record management
- Budget tracking
- Expense management
- Role-based financial data access

###  Procurement Module
- Procurement request management
- Multi-level approval workflow
- Vendor management
- Status tracking (draft, pending, approved, rejected, ordered, received)
- Role-based request filtering

###  Reports Module
- Generate various business reports
- Role-based report access
- Export functionality

###  File Management
- Document upload and management
- File categorization
- Access control based on user roles

##  Technology Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **API**: RESTful API design
- **Validation**: Class-validator & Class-transformer

### Frontend
- **Framework**: Next.js (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **State Management**: React Context API
- **HTTP Client**: Axios

### Infrastructure
- **Database**: PostgreSQL
- **Development**: Docker Compose
- **Package Manager**: npm

##  Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

##  Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/07ItachiUchiha/it-erp-system.git
cd it-erp-system
```

### 2. Setup Backend
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your database credentials

# Setup database
npm run db:create
npm run db:migrate

# Start backend server
npm run start:dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your API endpoints

# Start frontend development server
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

##  Default User Accounts

After setting up the system, you can create users with different roles:

- **Admin**: Full system access
- **HR**: Employee and user management
- **Manager**: Department-level management
- **Finance**: Financial operations and approvals
- **Sales**: Sales-related operations
- **Employee**: Limited access to own data

##  Project Structure

```
it-erp-system/
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication module
│   │   │   ├── users/      # User management
│   │   │   ├── employees/  # Employee management
│   │   │   ├── finance/    # Finance module
│   │   │   ├── procurement/ # Procurement module
│   │   │   ├── files/      # File management
│   │   │   └── ...
│   │   ├── database/       # Database configuration
│   │   └── ...
│   └── ...
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── auth/       # Authentication components
│   │   │   └── layout/     # Layout components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Next.js pages
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── ...
├── docs/                   # Documentation
└── infrastructure/         # Infrastructure files
```

##  Role-Based Access Control

### Permission Matrix

| Module | Admin | HR | Manager | Finance | Sales | Employee |
|--------|-------|----|---------|---------| ------|----------|
| Users | CRUD | CRU | R | R | R | - |
| Employees | CRUD | CRUD | RU* | R | R* | R* |
| Finance | CRUD | R | RU* | CRUD | R* | R* |
| Procurement | CRUD+A | CRU+A | CRU | R+A | CR | CR |
| Files | CRUD | CRU | CRU | CRU | CRU | CR |
| Reports | CRUD | CR | CR | CR | CR | R* |

**Legend**: C=Create, R=Read, U=Update, D=Delete, A=Approve, *=Own data only

##  Development

### Backend Development
```bash
cd backend
npm run start:dev    # Start development server
npm run test         # Run tests
npm run build        # Build for production
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
```

##  Deployment

### Production Setup
1. Set up PostgreSQL database
2. Configure environment variables
3. Build and deploy backend
4. Build and deploy frontend
5. Set up reverse proxy (nginx)

### Environment Variables

#### Backend (.env)
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=it_erp_system
JWT_SECRET=your_jwt_secret
PORT=3001
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Issues & Support

If you encounter any issues or need support, please create an issue on the GitHub repository.

##  Roadmap

- [ ] Advanced reporting and analytics
- [ ] Mobile application
- [ ] Integration with third-party services
- [ ] Advanced workflow management
- [ ] Real-time notifications
- [ ] Audit logging and compliance

---

**Built with  using NestJS and Next.js**
- **Sales & CRM** - Lead management, client relationships, sales pipeline
- **Procurement** - Vendor management, purchase orders, asset tracking
- **Administration** - User management, company settings, workflows

### Tech Stack

#### Frontend
- **React + Next.js** - Modern web application with SSR
- **TailwindCSS** - Utility-first CSS framework
- **TypeScript** - Type-safe development

#### Backend
- **Node.js + NestJS** - Enterprise-grade backend framework
- **GraphQL + Apollo** - Flexible API querying
- **TypeScript** - Full-stack type safety

#### Database
- **Amazon Aurora PostgreSQL** - Primary database (Serverless v2)
- **Amazon ElastiCache (Redis)** - Caching layer
- **Amazon S3** - Document storage

#### Cloud Infrastructure (AWS)
- **ECS Fargate** - Containerized microservices
- **Amazon Cognito** - Authentication & authorization
- **API Gateway** - API management
- **CloudFront** - CDN
- **Step Functions** - Workflow orchestration
- **SQS/SNS** - Messaging & notifications

#### Analytics & Monitoring
- **Amazon QuickSight** - Business intelligence dashboards
- **AWS Athena + S3 Data Lake** - Analytics
- **CloudWatch + X-Ray** - Monitoring & tracing

##  Getting Started

### Prerequisites
- Node.js 18+
- Docker
- AWS CLI configured
- Terraform or AWS CDK

### Local Development
```bash
# Clone the repository
git clone <repository-url>
cd it-erp-system

# Setup backend
cd backend
npm install
npm run start:dev

# Setup frontend
cd ../frontend
npm install
npm run dev

# Setup mobile (React Native)
cd ../mobile
npm install
npx react-native run-android  # or run-ios
```

##  Project Structure

```
it-erp-system/
├── frontend/          # Next.js web application
├── backend/           # NestJS API server
├── mobile/            # React Native mobile app
├── infrastructure/    # AWS infrastructure as code
├── docs/             # Documentation
└── docker-compose.yml # Local development environment
```

##  Security Features

- Multi-factor authentication (MFA)
- Role-based access control (RBAC)
- Data encryption at rest and in transit
- Audit trails for compliance
- AWS WAF protection

##  Key Features

### For Employees
- Self-service portal for leave requests
- Timesheet management
- Expense reporting
- Project collaboration tools

### For Managers
- Team performance dashboards
- Project monitoring
- Approval workflows
- Resource planning

### For HR
- Employee lifecycle management
- Payroll processing
- Performance reviews
- Compliance tracking

### For Finance
- Automated invoicing
- Expense management
- Financial reporting
- Budget tracking

### For Sales
- Lead management
- Client relationship tracking
- Sales pipeline
- Proposal generation

##  Development Workflow

1. **Planning** - Feature requirements and technical design
2. **Development** - Feature branches with PR reviews
3. **Testing** - Automated testing and quality checks
4. **Deployment** - CI/CD pipeline to AWS
5. **Monitoring** - Performance and error tracking

##  Scalability

The system is designed to scale from startup to enterprise:
- **Phase 1**: Modular monolith for rapid development
- **Phase 2**: Microservices split by domain
- **Phase 3**: Multi-tenant SaaS platform

##  Contributing

Please read our contributing guidelines and code of conduct before submitting pull requests.

##  License

This project is licensed under the MIT License - see the LICENSE file for details.
