# Authentication & Authorization System - Complete Setup

## Overview

The IT ERP System now has a comprehensive role-based access control (RBAC) system with:

- **Backend Authentication**: JWT-based authentication with bcrypt password hashing
- **Role-Based Authorization**: 6 user roles with specific permissions
- **Frontend Protection**: Route-level and component-level access control
- **Secure API**: All endpoints protected with guards and role decorators

## Quick Start

### 1. Setup Database and Dependencies

```bash
# Backend setup
cd backend
npm install
npm run build

# Frontend setup  
cd ../frontend
npm install
npm run build
```

### 2. Start the Application

```bash
# Start backend (Terminal 1)
cd backend
npm run start:dev

# Start frontend (Terminal 2)
cd frontend
npm run dev
```

### 3. Seed Test Users

```bash
# In backend directory
npm run seed
```

## User Roles & Test Accounts

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | admin@company.com | admin123 | Full system access, user management |
| **HR** | hr@company.com | hr123 | Employee management, salary access |
| **Manager** | manager@company.com | manager123 | Team oversight, approvals up to $10K |
| **Finance** | finance@company.com | finance123 | Financial data, invoices, expenses |
| **Sales** | sales@company.com | sales123 | Sales data, customer management |
| **Employee** | employee@company.com | emp123 | Basic profile access, file uploads |

## Authentication Flow

### Login Process
1. User submits email/password via `LoginForm`
2. Frontend calls `/auth/login` API endpoint
3. Backend validates credentials with bcrypt
4. JWT token issued with user data and role
5. Token stored in localStorage
6. User redirected to dashboard
7. AuthContext provides global auth state

### Authorization Checks
- **Route Level**: `ProtectedRoute` component checks authentication
- **API Level**: Guards check JWT validity and role permissions
- **Component Level**: `useAuth().canAccess()` for conditional rendering

## Permission Matrix

### Admin
- All user management (create, read, update, delete)
- All employee data including salaries
- All financial operations
- System configuration
- All approval limits

### HR
- Employee management (create, read, update)
- Salary and compensation data
- Performance management
- Approve up to $5,000

### Manager  
- View team members
- Basic employee data (no salaries)
- Project management
- Approve up to $10,000

### Finance
- Financial data and reports
- Invoice management
- Expense tracking
- Budget management
- Approve up to $25,000

### Sales
- Sales data and reports
- Customer management
- Lead tracking
- Approve up to $15,000

### Employee
- Own profile management
- File uploads
- Basic dashboard access
- No management capabilities

## Security Features

### Backend Security
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Role Guards**: `@UseGuards(JwtAuthGuard, RolesGuard)`
- **Route Protection**: `@Roles()` decorator on endpoints
- **Data Filtering**: Role-based data access control

### Frontend Security
- **Protected Routes**: Authentication required for all pages
- **Role-based Rendering**: Components adapt to user permissions
- **Token Management**: Automatic token refresh and logout
- **API Interceptors**: Auto-attach auth headers

## Technical Implementation

### Backend Architecture
```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts     # Login/register endpoints
│   │   ├── auth.service.ts        # JWT & validation logic
│   │   ├── strategies/            # Passport strategies
│   │   └── guards/                # Auth & role guards
│   └── users/
│       ├── users.controller.ts    # Role-protected endpoints
│       └── users.service.ts       # User CRUD operations
```

### Frontend Architecture
```
src/
├── contexts/
│   └── AuthContext.tsx           # Global auth state
├── components/
│   └── auth/
│       ├── LoginForm.tsx         # Login interface
│       └── ProtectedRoute.tsx    # Route protection
└── pages/
  └── _app.tsx                  # AuthProvider wrapper
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration  
- `GET /auth/profile` - Get current user

### Users (Role-protected)
- `GET /users` - List users (Admin/HR only)
- `POST /users` - Create user (Admin/HR only)
- `PUT /users/:id` - Update user (Admin/HR only)
- `DELETE /users/:id` - Delete user (Admin only)

### Employees (Role-protected)
- `GET /employees` - List employees (role-based filtering)
- `POST /employees` - Create employee (Admin/HR only)
- `PUT /employees/:id` - Update employee (Manager+)
- `DELETE /employees/:id` - Delete employee (Admin/HR only)

## Testing the System

### 1. Authentication Test
```bash
# Test login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'
```

### 2. Protected Endpoint Test
```bash
# Test protected endpoint (use token from login)
curl -X GET http://localhost:3001/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Role Authorization Test
Try accessing admin endpoints with different user roles to verify restrictions.

## Troubleshooting

### Common Issues

1. **Login fails**: Check if seed script ran successfully
2. **Token expired**: Frontend will auto-redirect to login
3. **403 Forbidden**: User lacks required role permissions
4. **CORS errors**: Ensure backend allows frontend origin

### Debug Commands
```bash
# Check database connection
npm run start:dev

# Verify user creation
npm run seed

# Check API health
curl http://localhost:3001/health
```

## Next Steps

1. **Database Setup**: Configure PostgreSQL/MySQL connection
2. **Environment Variables**: Set up production environment configs
3. **Email Integration**: Configure SMTP for user notifications
4. **File Uploads**: Test file management with authentication
5. **Audit Logging**: Track user actions for compliance
6. **Password Reset**: Implement forgot password functionality

## Related Documentation

- [RBAC Specification](./RBAC-Specification.md) - Detailed role permissions
- [API Documentation](./API.md) - Complete endpoint reference
- [Database Schema](./Database.md) - Entity relationships

---

**Your IT ERP System is now secure with comprehensive authentication and role-based access control!**
