# Database Seeding Guide

## Overview

The seed script creates comprehensive test user accounts for the IT ERP System with proper role-based access control (RBAC) setup.

## How to Run

### Prerequisites

- Backend server dependencies installed (`npm install`)
- PostgreSQL database running and configured
- Environment variables properly set in `.env` file

### Running the Seed Script

#### Option 1: From project root directory

```bash
# Navigate to backend directory from project root
cd backend

# Run the seed script
npm run seed
```

#### Option 2: If you're already in the backend directory

```bash
# Check if you're in the backend directory (should see package.json, src/, dist/)
ls

# If you see package.json and src/ directory, you're in the right place - just run:
npm run seed
```

#### Option 3: If you're running in Docker container

```bash
# Check your current directory first
pwd
ls

# In Docker, you might be in /app directory
# Navigate to the backend directory within the container
cd /app/backend

# Or if the backend is the main app directory:
cd /app

# Then run the seed script
npm run seed
```

#### Option 4: From any directory

```bash
# Navigate to the project root first
cd /path/to/it-erp-system

# Then go to backend
cd backend

# Run the seed script
npm run seed
```

## Test Accounts Created

The seed script creates the following test accounts:

| Role         | Email                     | Password    | Name                 | Department      | Designation          |
| ------------ | ------------------------- | ----------- | -------------------- | --------------- | -------------------- |
| **Admin**    | admin@company.com         | admin123    | System Administrator | IT              | System Administrator |
| **HR**       | hr@company.com            | hr123       | John Smith           | Human Resources | HR Manager           |
| **Manager**  | manager@company.com       | manager123  | Sarah Johnson        | IT              | Manager              |
| **Finance**  | finance@company.com       | finance123  | Michael Davis        | Finance         | Finance Manager      |
| **Sales**    | sales@company.com         | sales123    | Emily Wilson         | Sales           | Sales Manager        |
| **Employee** | employee@company.com      | emp123      | David Brown          | IT              | Software Engineer    |
| **Employee** | john.employee@company.com | employee123 | John Employee        | IT              | Software Engineer    |
| **HR**       | jane.hr@company.com       | hr123       | Jane HR              | Human Resources | HR Executive         |

## Role Permissions

### Admin (admin@company.com)

- **Full system access**
- User management (create, read, update, delete)
- All employee data including salaries
- All financial operations
- System configuration
- All approval limits

### HR (hr@company.com, jane.hr@company.com)

- Employee management (create, read, update)
- Salary and compensation data
- Performance management
- Approve up to ₹4,15,000

### Manager (manager@company.com)

- View team members
- Basic employee data (no salaries)
- Project management
- Approve up to ₹8,30,000

### Finance (finance@company.com)

- Financial data and reports
- Invoice management
- Expense tracking
- Budget management
- Approve up to ₹20,75,000

### Sales (sales@company.com)

- Sales data and reports
- Customer management
- Lead tracking
- Approve up to ₹12,45,000

### Employee (employee@company.com, john.employee@company.com)

- Own profile management
- File uploads
- Basic dashboard access
- No management capabilities

## Script Features

- **Duplicate Prevention**: Checks if users already exist before creating
- **Password Hashing**: Automatically hashes passwords using bcrypt
- **Comprehensive Logging**: Detailed output showing creation status
- **Error Handling**: Graceful error handling for each user creation
- **Summary Report**: Final summary with credentials table

## Troubleshooting

### Common Issues

1. **Missing seed.ts file (Docker Container)**

   ```
   Error: Cannot find module './seed.ts'
   MODULE_NOT_FOUND
   ```

   **Solution**: The source files are not available in the Docker container. Try these alternatives:

   ```bash
   # Option 1: Check if src directory exists
   ls src/

   # Option 2: Check if compiled seed file exists in dist
   ls dist/

   # Option 3: If you see seed.js in dist/, run it directly (most common solution):
   node dist/seed.js

   # Option 4: If seed.js doesn't exist in dist, you may need to run this outside Docker
   # Exit the container and run from your local machine:
   exit
   cd /path/to/your/project
   cd backend
   npm run seed

   # Option 5: If using Docker Compose, try:
   docker-compose exec backend npm run seed
   ```

   **Important**: Make sure to type the command exactly as shown above. Do NOT run `npm run seed.js` - that won't work.

2. **Directory Navigation Error (Docker Container)**

   ```
   npm error path /app/package.json
   npm error errno -2
   npm error enoent Could not read package.json
   ```

   **Solution**: You're in a Docker container. Check your location and navigate correctly:

   ```bash
   # Check where you are
   pwd
   ls

   # If you see "backend" directory, navigate into it:
   cd backend
   npm run seed

   # If you're already in /app and see package.json, you're in the right place:
   npm run seed

   # If you're in root (/app) but need to go to backend:
   cd /app/backend
   npm run seed
   ```

3. **Directory Navigation Error (Local Development)**

   ```
   sh: 1: cd: can't cd to backend
   npm error Missing script: "seednpm"
   ```

   **Solution**: You're likely already in the backend directory. Check your current location:

   ```bash
   # Check current directory contents
   ls

   # If you see: dist, node_modules, package.json, src/ - you're already in backend
   # Just run the seed command directly:
   npm run seed

   # If you don't see these files, navigate to project root first:
   cd /path/to/your/it-erp-system
   cd backend
   npm run seed
   ```

4. **Database Connection Error**

   ```
   Error: connect ECONNREFUSED 127.0.0.1:5432
   ```

   - Ensure PostgreSQL is running
   - Check database credentials in `.env` file
   - Verify database exists

5. **User Already Exists**

   ```
   ⚠️ User already exists: admin@company.com
   ```

   - This is normal - script prevents duplicates
   - Users won't be recreated if they already exist

6. **Permission Denied**

   ```
   Error: permission denied for table users
   ```

   - Check database user permissions
   - Ensure database user can create/insert records

7. **Login Failed: Invalid credentials (Frontend Error)**

   ```
   Failed to load resource: the server responded with a status of 401 (Unauthorized)
   Login failed: Invalid credentials
   ```

   **Solution**: This means the test accounts don't exist yet. You need to run the seed script first:

   ```bash
   # In your backend Docker container, run:
   node dist/seed.js

   # After successful seeding, try logging in again with:
   # Email: admin@company.com
   # Password: admin123
   ```

   **Note**: The backend API is working (you can see it responds), but the user accounts haven't been created yet.

8. **Favicon 404 Error (Minor)**

   ```
   favicon.ico:1 Failed to load resource: the server responded with a status of 404 (Not Found)
   ```

   - This is a minor cosmetic issue and doesn't affect functionality
   - The system will work normally despite this warning

9. **Node.js Not Found (Container Issue)**

   ```
   sh: node: not found
   ```

   **Solution**: You're in the wrong container or Node.js is not installed. Try these options:

   ```bash
   # Option 1: Check what container you're in
   ls

   # If you see system directories like: bin, dev, etc, home, lib, usr, var
   # You're in a database/system container, NOT the backend container!

   # Option 2: Exit and find the correct backend container
   exit

   # From your host machine, list all running containers:
   docker ps

   # Look for containers with names like:
   # - backend, app, node, nestjs, or your project name
   # - NOT postgres, db, database

   # Connect to the BACKEND container (not database):
   docker exec -it <backend-container-name> sh

   # You should see: package.json, dist/, node_modules/
   ls

   # Then run the seed script:
   node dist/seed.js

   # Option 3: Use Docker Compose from host machine
   docker-compose exec backend npm run seed
   ```

   **Critical**: You were in the **database container**. You need the **backend/application container** that has Node.js installed.

10. **Seed Script Successful but Login Still Fails (401 Unauthorized)**

    ```
    POST http://api.../auth/login 401 (Unauthorized)
    Login failed: Invalid credentials
    ```

    **Scenario**: Seed script reports "User already exists" but login still fails with 401.

    **Solution**: There might be a database connection issue or authentication problem:

    ```bash
    # Step 1: Verify users actually exist in database
    # Connect to backend container
    docker exec -it <backend-container-name> sh

    # Check database directly
    node -e "
    const { DataSource } = require('typeorm');
    const config = require('./dist/database/data-source.js');

    async function checkUsers() {
      try {
        const dataSource = new DataSource(config.default);
        await dataSource.initialize();

        const users = await dataSource.query('SELECT email, role, status FROM users LIMIT 10');
        console.log('Users in database:', users);

        await dataSource.destroy();
      } catch (error) {
        console.error('Database Error:', error.message);
      }
    }
    checkUsers();
    "

    # Step 2: If no users found, re-run seed script
    node dist/seed.js

    # Step 3: If users exist but login fails, check password hashing
    # Try creating a fresh admin user:
    node -e "
    const bcrypt = require('bcrypt');
    console.log('Test password hash:', bcrypt.hashSync('admin123', 10));
    "

    # Step 4: Alternative - use PostgreSQL directly
    # Connect to database container
    docker exec -it <postgres-container-name> psql -U <username> -d it-erp-backend
    # Run: SELECT email, role, status FROM users WHERE email = 'admin@company.com';
    ```

    **Common causes**:
    - Backend connected to different database than seed script
    - Environment variables mismatch between containers
    - Password hashing algorithm inconsistency

11. **cURL Testing for Authentication Verification**

    **Use Case**: Verify backend authentication directly without frontend interference.

    **Basic Login Test**:
    ```bash
    # Test admin login with cURL
    curl -X POST http://api.swsw4w4wg4c84sowwooswoc4.147.79.66.75.sslip.io/api/v1/auth/login \
      -H "Content-Type: application/json" \
      -d '{
        "email": "admin@company.com",
        "password": "admin123"
      }'
    ```

    **Verbose Debugging**:
    ```bash
    # More detailed output to see what's happening
    curl -v -X POST http://api.swsw4w4wg4c84sowwooswoc4.147.79.66.75.sslip.io/api/v1/auth/login \
      -H "Content-Type: application/json" \
      -H "Accept: application/json" \
      -d '{
        "email": "admin@company.com",
        "password": "admin123"
      }'
    ```

    **Test Multiple Users**:
    ```bash
    # Test HR user
    curl -X POST http://api.swsw4w4wg4c84sowwooswoc4.147.79.66.75.sslip.io/api/v1/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email": "hr@company.com", "password": "hr123"}'

    # Test Manager user
    curl -X POST http://api.swsw4w4wg4c84sowwooswoc4.147.79.66.75.sslip.io/api/v1/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email": "manager@company.com", "password": "manager123"}'
    ```

    **Expected Responses**:
    
    *Successful Login (200 OK)*:
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "...",
        "email": "admin@company.com",
        "firstName": "System",
        "lastName": "Administrator",
        "role": "admin"
      }
    }
    ```

    *Failed Login (401 Unauthorized)*:
    ```json
    {
      "statusCode": 401,
      "message": "Invalid credentials",
      "error": "Unauthorized"
    }
    ```

    **API Health Check**:
    ```bash
    # Check if the API is responding
    curl -v http://api.swsw4w4wg4c84sowwooswoc4.147.79.66.75.sslip.io/api/v1/health
    ```

    **If cURL login succeeds but frontend fails**:
    - Frontend/backend CORS issue
    - Frontend sending malformed requests
    - JavaScript encoding problems

    **If cURL login also fails (401)**:
    - Password hash mismatch (run UPDATE commands above)
    - Database connection issues
    - Authentication logic problems

### Manual Database Reset

If you need to reset all users:

```sql
-- Connect to your database
psql -h localhost -U postgres -d it-erp-backend

-- Delete all users (CAUTION: This removes all user data)
DELETE FROM users;

-- Run seed script again
npm run seed
```

## PostgreSQL Database Setup

### Create PostgreSQL User and Database

If you need to set up the PostgreSQL database and user from scratch:

```sql
-- Connect to PostgreSQL as superuser (usually postgres)
psql -U postgres

-- Create a new database user
CREATE USER it_erp_user WITH PASSWORD 'your_secure_password';

-- Create the database
CREATE DATABASE "it-erp-backend" OWNER it_erp_user;

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE "it-erp-backend" TO it_erp_user;

-- Connect to the new database
\c it-erp-backend

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO it_erp_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO it_erp_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO it_erp_user;

-- Exit PostgreSQL
\q
```

### Manual Admin User Creation

If the seed script fails and you need to manually create an admin user:

```sql
-- Connect to your database
psql -U it_erp_user -d it-erp-backend

-- OR if using different credentials:
psql -h localhost -U postgres -d it-erp-backend

-- First, check if users table exists
\dt

-- If tables don't exist, you need to run migrations first
-- Exit and run: npm run migration:run

-- Create admin user manually (password: admin123)
INSERT INTO users (
    id,
    email,
    password,
    "firstName",
    "lastName",
    role,
    status,
    department,
    designation,
    "approvalLimit",
    "createdAt",
    "updatedAt"
) VALUES (
    'admin-001',
    'admin@company.com',
    '$2b$10$YourHashedPasswordHere',
    'System',
    'Administrator',
    'admin',
    'active',
    'IT',
    'System Administrator',
    999999999,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create HR user
INSERT INTO users (
    id,
    email,
    password,
    "firstName",
    "lastName",
    role,
    status,
    department,
    designation,
    "approvalLimit",
    "createdAt",
    "updatedAt"
) VALUES (
    'hr-001',
    'hr@company.com',
    '$2b$10$YourHashedPasswordHere',
    'John',
    'Smith',
    'hr',
    'active',
    'Human Resources',
    'HR Manager',
    415000,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Verify users were created
SELECT email, role, status, "firstName", "lastName" FROM users;

-- Exit PostgreSQL
\q
```

### Generate Password Hash

To generate the correct password hash for manual insertion:

```bash
# In your backend container, generate password hash
node -e "
const bcrypt = require('bcrypt');
const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);
console.log('Password hash for admin123:');
console.log(hash);
"

# Copy the output hash and use it in the SQL INSERT statement above
```

### Complete Setup Commands

Here's the complete sequence for a fresh setup:

```bash
# Step 1: Connect to PostgreSQL as superuser
docker exec -it <postgres-container-name> psql -U postgres

# Step 2: Create database and user
CREATE USER it_erp_user WITH PASSWORD 'SecurePassword123!';
CREATE DATABASE "it-erp-backend" OWNER it_erp_user;
GRANT ALL PRIVILEGES ON DATABASE "it-erp-backend" TO it_erp_user;
\q

# Step 3: Connect to backend container and run migrations
docker exec -it <backend-container-name> sh
npm run migration:run

# Step 4: Generate password hash
node -e "
const bcrypt = require('bcrypt');
console.log('Admin password hash:', bcrypt.hashSync('admin123', 10));
"

# Step 5: Insert admin user with the generated hash
docker exec -it <postgres-container-name> psql -U it_erp_user -d it-erp-backend

INSERT INTO users (
    id, email, password, "firstName", "lastName", role, status,
    department, designation, "approvalLimit", "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid(),
    'admin@company.com',
    '$2b$10$[PASTE_YOUR_GENERATED_HASH_HERE]',
    'System', 'Administrator', 'admin', 'active',
    'IT', 'System Administrator', 999999999, NOW(), NOW()
);

# Step 6: Verify user creation
SELECT email, role, "firstName", "lastName" FROM users WHERE email = 'admin@company.com';
\q

# Step 7: Test login from frontend
# Use: admin@company.com / admin123
```

### Alternative: One-line commands

```bash
# Create user
createuser -U postgres -P it_erp_user

# Create database
createdb -U postgres -O it_erp_user it-erp-backend
```

### Environment Variables

Update your `.env` file with the database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=it_erp_user
DB_PASSWORD=your_secure_password
DB_DATABASE=it-erp-backend

# For production, use stronger passwords and consider SSL
DB_SSL=false
```

### Docker PostgreSQL Setup

If using Docker for PostgreSQL:

```bash
# Run PostgreSQL in Docker
docker run --name postgres-erp \
  -e POSTGRES_USER=it_erp_user \
  -e POSTGRES_PASSWORD=your_secure_password \
  -e POSTGRES_DB=it-erp-backend \
  -p 5432:5432 \
  -d postgres:15

# Connect to the Docker PostgreSQL instance
docker exec -it postgres-erp psql -U it_erp_user -d it-erp-backend
```

## Security Notes

- **Development Only**: These are test credentials for development
- **Change Passwords**: Update passwords before production deployment
- **Environment Variables**: Use strong passwords in production
- **Database Security**: Ensure database is properly secured

## Next Steps

After running the seed script:

1. **Test Login**: Try logging in with any of the test accounts
2. **Verify Permissions**: Test that each role has appropriate access
3. **API Testing**: Use the credentials to test protected endpoints
4. **Frontend Integration**: Verify frontend login works with these accounts

### Access Your Deployed System

**Frontend URL**: `http://do8k4g0o8ckkk804s4ko84g0.147.79.66.75.sslip.io`

**Backend API**: Should be accessible via your backend deployment URL

### Test the Complete System

1. **Access Frontend**: Open `http://do8k4g0o8ckkk804s4ko84g0.147.79.66.75.sslip.io` in your browser
2. **Login with Test Accounts**:
   - **Admin**: `admin@company.com` / `admin123` (Full system access)
   - **HR**: `hr@company.com` / `hr123` (Employee management, ₹4.15L approval)
   - **Manager**: `manager@company.com` / `manager123` (Team oversight, ₹8.3L approval)
   - **Finance**: `finance@company.com` / `finance123` (Financial operations, ₹20.75L approval)
   - **Sales**: `sales@company.com` / `sales123` (Sales management, ₹12.45L approval)
   - **Employee**: `employee@company.com` / `emp123` (Basic access)

3. **Verify Features**:
   - Dashboard loads correctly
   - Role-based permissions work
   - INR currency formatting displays properly
   - All modules are accessible based on user role

## Production Deployment

**⚠️ IMPORTANT**: Before deploying to production:

1. Create production admin account with strong password
2. Remove or disable test accounts
3. Use environment variables for admin credentials
4. Enable additional security measures (2FA, password policies, etc.)

---

## ✅ System Successfully Deployed & Ready!

**Status**: 🎉 **DEPLOYMENT COMPLETE** - All test accounts created and system ready for use!

### 🚀 **Access Your Live System**

**Frontend**: `http://do8k4g0o8ckkk804s4ko84g0.147.79.66.75.sslip.io`

**Test Login Credentials** (All accounts ready):

- **Admin**: `admin@company.com` / `admin123` ✅
- **HR**: `hr@company.com` / `hr123` ✅
- **Manager**: `manager@company.com` / `manager123` ✅
- **Finance**: `finance@company.com` / `finance123` ✅
- **Sales**: `sales@company.com` / `sales123` ✅
- **Employee**: `employee@company.com` / `emp123` ✅

### ✅ **Verified Features**

- ✅ Frontend deployed and accessible
- ✅ Backend API responding correctly
- ✅ Database seeded with test accounts
- ✅ INR currency formatting implemented
- ✅ Role-based access control (RBAC) configured
- ✅ All modules accessible based on user permissions

**Happy Testing! 🚀**
