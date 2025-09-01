# Role-Based Access Control (RBAC) Specification

## User Roles and Permissions

###  ADMIN (Super User)
**Full system access - Can do everything**

#### Access Rights:
- **Users Module**: Full CRUD operations, user registration, role assignments, view all user details
- **Employees Module**: Full CRUD operations, view all employee data including salary
- **Finance Module**: Full CRUD operations, view all financial data, approve transactions
- **Procurement Module**: Full CRUD operations, approve/reject all requests, view vendor details
- **Files Module**: Full CRUD operations, upload/download all files
- **Reports Module**: Generate all reports, view system analytics
- **Sales Module**: Full CRUD operations, view all sales data
- **Projects Module**: Full CRUD operations, assign resources, view all project data

---

###  HR (Human Resources)
**People-focused access with financial oversight**

#### Access Rights:
- **Users Module**: Create employees and managers, view all user details except admin profiles
- **Employees Module**: Full CRUD operations, view all employee data including salary
- **Finance Module**: Read-only access to payroll and employee-related expenses
- **Procurement Module**: View and create requests, approve HR-related procurement
- **Files Module**: Upload/download HR documents, employee files
- **Reports Module**: Generate HR reports, attendance reports, payroll summaries
- **Sales Module**: Read-only access to team performance data
- **Projects Module**: Assign employees to projects, view team allocation

#### Restrictions:
- Cannot modify admin users
- Cannot approve high-value financial transactions (>₹1,00,000)
- Cannot access system configuration

---

###  MANAGER (Department/Team Manager)
**Team management with limited administrative access**

#### Access Rights:
- **Users Module**: View team members and basic employee directory (no salary info)
- **Employees Module**: View team employee data (no salary), update team member basic info
- **Finance Module**: View department budget, approve department expenses up to ₹50,000
- **Procurement Module**: Create and approve department requests up to ₹25,000
- **Files Module**: Upload/download department documents, limited access to employee files
- **Reports Module**: Generate department reports, team performance reports
- **Sales Module**: View team sales data, create sales reports for managed team
- **Projects Module**: Manage assigned projects, view team project allocation

#### Restrictions:
- Cannot see salary information
- Cannot create/delete users
- Cannot access other departments' sensitive data
- Limited approval amounts for procurement and finance

---

###  FINANCE (Finance Team)
**Financial focus with cross-department visibility**

#### Access Rights:
- **Users Module**: Read-only access to employee directory for financial operations
- **Employees Module**: View basic employee data, access to salary info for payroll
- **Finance Module**: Full CRUD operations for all financial data
- **Procurement Module**: Approve all financial aspects of procurement, vendor payments
- **Files Module**: Upload/download financial documents, invoices, receipts
- **Reports Module**: Generate all financial reports, budget analysis, expense tracking
- **Sales Module**: View sales data for revenue tracking and commission calculations
- **Projects Module**: View project costs and budgets

#### Restrictions:
- Cannot create/modify users (except financial profile updates)
- Cannot modify employee HR data
- Limited project management capabilities

---

###  SALES (Sales Team)
**Sales-focused access with customer management**

#### Access Rights:
- **Users Module**: Read-only access to basic employee directory
- **Employees Module**: View sales team data only
- **Finance Module**: View commission data, sales revenue, limited expense access
- **Procurement Module**: Create sales-related procurement requests
- **Files Module**: Upload/download sales documents, customer files, proposals
- **Reports Module**: Generate sales reports, customer analytics, revenue reports
- **Sales Module**: Full CRUD operations for sales data, customer management
- **Projects Module**: View sales-related projects, customer project status

#### Restrictions:
- Cannot access other departments' data
- Cannot approve procurement above ₹10,000
- No access to employee salary information
- Cannot modify system users

---

###  EMPLOYEE (General Employee)
**Basic access for daily operations**

#### Access Rights:
- **Users Module**: View basic employee directory (name, department, contact)
- **Employees Module**: View own profile, update personal contact information
- **Finance Module**: View own salary slips, expense reimbursements, submit expense claims
- **Procurement Module**: Create basic office supply requests up to ₹5,000
- **Files Module**: Upload personal documents, download company policies
- **Reports Module**: View own performance reports, attendance records
- **Sales Module**: View own sales data (if applicable)
- **Projects Module**: View assigned projects, update task status

#### Restrictions:
- Cannot see other employees' personal data
- Cannot access financial information beyond own records
- Cannot approve any requests
- Very limited procurement requests
- Cannot generate system-wide reports

---

## API Endpoint Access Matrix

| Module | Endpoint | Admin | HR | Manager | Finance | Sales | Employee |
|--------|----------|-------|----|---------|---------| ------|----------|
| **Auth** |
| POST /auth/login | Yes | Yes | Yes | Yes | Yes | Yes |
| POST /auth/register | Yes | Yes | No | No | No | No |
| GET /auth/profile | Yes | Yes | Yes | Yes | Yes | Yes |
| **Users** |
| GET /users | Yes | Yes | Yes | No | No | Yes (limited) |
| POST /users | Yes | Yes | No | No | No | No |
| PUT /users/:id | Yes | Yes | No | No | No | No (own only) |
| DELETE /users/:id | Yes | No | No | No | No | No |
| **Employees** |
| GET /employees | Yes | Yes | Yes | Yes (limited) | Yes (limited) | Yes (very limited) |
| POST /employees | Yes | Yes | No | No | No | No |
| PUT /employees/:id | Yes | Yes | Yes (team only) | No | No | No (own basic info) |
| DELETE /employees/:id | Yes | Yes | No | No | No | No |
| **Finance** |
| GET /finance | Yes | Yes (HR related) | Yes (dept budget) | Yes | Yes (sales related) | Yes (own records) |
| POST /finance | Yes | Yes (HR expenses) | Yes (dept expenses) | Yes | Yes (sales expenses) | Yes (expense claims) |
| PUT /finance/:id | Yes | Yes (HR related) | Yes (up to limit) | Yes | Yes (sales related) | No |
| DELETE /finance/:id | Yes | No | No | Yes | No | No |
| **Procurement** |
| GET /procurement | Yes | Yes | Yes | Yes | Yes | Yes (own requests) |
| POST /procurement | Yes | Yes | Yes | Yes | Yes | Yes (limited amount) |
| PUT /procurement/:id | Yes | Yes (HR related) | Yes (up to ₹25k) | Yes | Yes (up to ₹10k) | No |
| DELETE /procurement/:id | Yes | Yes (own/HR related) | Yes (own/dept) | Yes | Yes (own) | Yes (own only) |

## Approval Limits

| Role | Procurement | Finance | Description |
|------|-------------|---------|-------------|
| **Admin** | Unlimited | Unlimited | Can approve any amount |
| **HR** | ₹50,000 | ₹50,000 | HR-related expenses and procurement |
| **Manager** | ₹25,000 | ₹50,000 | Department-level approvals |
| **Finance** | ₹1,00,000 | Unlimited | Financial oversight and approval |
| **Sales** | ₹10,000 | ₹20,000 | Sales-related expenses only |
| **Employee** | ₹5,000 | ₹5,000 | Basic office supplies and expense claims |

## Data Visibility Rules

### Salary Information
- **Admin & HR**: Full access
- **Finance**: Access for payroll processing
- **Manager**: No access
- **Sales**: Own commission data only
- **Employee**: Own salary slip only

### Employee Personal Data
- **Admin & HR**: Full access
- **Manager**: Team members only (limited fields)
- **Finance**: Basic info for financial operations
- **Sales**: Sales team only
- **Employee**: Own data + basic directory

### Financial Reports
- **Admin**: All reports
- **HR**: HR budget and payroll reports
- **Manager**: Department budget reports
- **Finance**: All financial reports
- **Sales**: Sales revenue and commission reports
- **Employee**: Personal expense reports only

## Implementation Notes

1. **JWT Token**: Include user role in JWT payload
2. **Route Guards**: Use `@Roles()` decorator on endpoints
3. **Data Filtering**: Service layer filters data based on user role
4. **Approval Workflow**: Implement amount-based approval routing
5. **Audit Trail**: Log all role-based access attempts
6. **Dynamic Permissions**: Consider implementing permission-based system for finer control

## Security Considerations

1. **Principle of Least Privilege**: Users get minimum required access
2. **Role Escalation Protection**: Cannot elevate own role
3. **Sensitive Data Protection**: Salary and personal data access controls
4. **Audit Logging**: Track all administrative actions
5. **Session Management**: Role-based session timeouts
