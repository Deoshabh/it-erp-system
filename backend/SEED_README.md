# Database Seeding Guide

## Overview

The seed script creates comprehensive test user accounts for the IT ERP System with proper role-based access control (RBAC) setup.

## How to Run

### Prerequisites

- Backend server dependencies installed (`npm install`)
- PostgreSQL database running and configured
- Environment variables properly set in `.env` file

### Running the Seed Script

```bash
# Navigate to backend directory
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

1. **Database Connection Error**

   ```
   Error: connect ECONNREFUSED 127.0.0.1:5432
   ```

   - Ensure PostgreSQL is running
   - Check database credentials in `.env` file
   - Verify database exists

2. **User Already Exists**

   ```
   ⚠️ User already exists: admin@company.com
   ```

   - This is normal - script prevents duplicates
   - Users won't be recreated if they already exist

3. **Permission Denied**

   ```
   Error: permission denied for table users
   ```

   - Check database user permissions
   - Ensure database user can create/insert records

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

## Production Deployment

**⚠️ IMPORTANT**: Before deploying to production:

1. Create production admin account with strong password
2. Remove or disable test accounts
3. Use environment variables for admin credentials
4. Enable additional security measures (2FA, password policies, etc.)

---

**Happy Testing! 🚀**
