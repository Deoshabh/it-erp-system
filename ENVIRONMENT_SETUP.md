# Environment Configuration Guide

## Environment Files Overview

The IT ERP System uses multiple environment files for different deployment scenarios:

### 📁 **Environment Files Structure**

```
it-erp-system/
├── .env.docker                    # Docker orchestration variables
├── backend/
│   ├── .env                       # Backend development environment
│   ├── .env.production            # Backend production environment
│   ├── .env.test                  # Backend testing environment
│   └── .env.example               # Backend environment template
└── frontend/
    ├── .env                       # Frontend development environment
    ├── .env.production            # Frontend production environment
    └── .env.example               # Frontend environment template
```

## 🚀 **Quick Setup Guide**

### **For Local Development:**

1. Copy backend `.env.example` → `.env`
2. Copy frontend `.env.example` → `.env`
3. Update database credentials as needed

### **For Production Deployment:**

1. Use `.env.production` files
2. Update all sensitive credentials
3. Verify SSL/TLS configurations

### **For Docker Deployment:**

1. Configure `.env.docker` for container orchestration
2. Use production environment files for apps
3. Ensure container networking is properly configured

## 🔧 **Configuration Categories**

### **Database Configuration**

- **Development**: Local PostgreSQL with relaxed settings
- **Production**: VPS PostgreSQL with connection pooling and SSL
- **Performance**: Connection limits, timeouts, and caching

### **Security Configuration**

- **JWT Secrets**: Different keys for dev/prod
- **Password Hashing**: Higher rounds for production
- **Rate Limiting**: Stricter limits in production

### **Email Configuration**

- **Development**: MailHog for local testing
- **Production**: Real SMTP provider (Gmail, SendGrid, etc.)

### **File Upload Configuration**

- **Size Limits**: 10MB default, configurable
- **Allowed Types**: PDF, Office docs, images, text files
- **Storage**: Local filesystem or AWS S3

### **Monitoring & Logging**

- **Development**: Verbose logging with debug information
- **Production**: Error/warning logs only with metrics collection

## 🛠️ **Environment Variable Reference**

### **Database Variables**

```bash
DB_HOST=localhost                   # Database host
DB_PORT=5432                       # Database port
DB_USERNAME=postgres               # Database username
DB_PASSWORD=your-password          # Database password
DB_DATABASE=it-erp-backend         # Database name
DB_CONNECTION_LIMIT=10             # Max connections
DB_ACQUIRE_TIMEOUT=60000           # Connection timeout (ms)
DB_CACHE_DURATION=30000            # Query cache duration (ms)
DB_MAX_QUERY_TIME=1000             # Slow query threshold (ms)
```

### **Application Variables**

```bash
NODE_ENV=development               # Environment mode
PORT=4101                         # Application port
FRONTEND_URL=http://localhost:3003 # Frontend URL for CORS
JWT_SECRET=your-jwt-secret         # JWT signing secret
BCRYPT_ROUNDS=10                  # Password hashing rounds
```

### **Feature Flags**

```bash
NEXT_PUBLIC_ENABLE_ANALYTICS=false # Google Analytics
NEXT_PUBLIC_ENABLE_CHAT=true       # Chat functionality
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true # Push notifications
NEXT_PUBLIC_ENABLE_DARK_MODE=true  # Dark mode toggle
```

## 🔐 **Security Best Practices**

### **Development**

- ✅ Use simple passwords for local development
- ✅ Enable verbose logging for debugging
- ✅ Disable SSL for local database connections
- ✅ Use relaxed rate limiting

### **Production**

- ⚠️ **CHANGE ALL DEFAULT PASSWORDS**
- ⚠️ **USE STRONG JWT SECRETS (64+ characters)**
- ⚠️ **ENABLE SSL/TLS FOR ALL CONNECTIONS**
- ⚠️ **IMPLEMENT PROPER RATE LIMITING**
- ⚠️ **DISABLE DEBUG FEATURES**

## 🎯 **Environment-Specific Configurations**

### **Local Development (.env)**

```bash
# Relaxed settings for development
NODE_ENV=development
LOG_LEVEL=debug
BCRYPT_ROUNDS=10
RATE_LIMIT_MAX=200
DB_CONNECTION_LIMIT=5
```

### **Production (.env.production)**

```bash
# Secure settings for production
NODE_ENV=production
LOG_LEVEL=warn
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX=50
DB_CONNECTION_LIMIT=10
```

### **VPS Production Settings**

```bash
# Your current VPS configuration
DB_HOST=postgresql-database-p4ccsg0swwwkw0kgsg4gc0c8
DB_PASSWORD=82e0i6QYF5nayX1dT5OFUDUvIo5LPVu53v0CJu3K4o1jB6xjgnenleenKqm4UL19
FRONTEND_URL=http://do8k4g0o8ckkk804s4ko84g0.147.79.66.75.sslip.io
NEXT_PUBLIC_API_URL=http://api.swsw4w4wg4c84sowwooswoc4.147.79.66.75.sslip.io/api/v1
```

## 🔄 **Switching Environments**

### **Backend Environment Loading**

The backend loads environment files in this order:

1. `.env.local` (highest priority)
2. `.env.production` (if NODE_ENV=production)
3. `.env` (fallback)

### **Frontend Environment Loading**

Next.js loads environment files in this order:

1. `.env.production.local` (production + local)
2. `.env.production` (production)
3. `.env.local` (local)
4. `.env` (default)

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Database Connection Failed**

   - Check DB_HOST and DB_PORT
   - Verify database credentials
   - Ensure PostgreSQL is running

2. **JWT Token Issues**

   - Verify JWT_SECRET is set
   - Check token expiration settings
   - Ensure same secret across instances

3. **CORS Errors**

   - Update CORS_ORIGIN or FRONTEND_URL
   - Check protocol (http vs https)
   - Verify port numbers

4. **File Upload Failures**
   - Check MAX_FILE_SIZE limit
   - Verify ALLOWED_FILE_TYPES
   - Ensure upload directory permissions

## 📝 **Maintenance**

### **Regular Tasks**

- 🔄 Rotate JWT secrets monthly
- 🔐 Update database passwords quarterly
- 📊 Review and adjust rate limits based on usage
- 🧹 Clean up old log files
- 💾 Verify backup configurations

### **Before Production Deployment**

- [ ] Update all default passwords
- [ ] Set strong JWT secrets
- [ ] Configure proper SSL certificates
- [ ] Test email configurations
- [ ] Verify rate limiting settings
- [ ] Check logging configurations
- [ ] Test backup and restore procedures

---

## ✅ **Environment Files Created Successfully!**

All necessary environment files have been created and configured for your IT ERP System. Make sure to:

1. **Review and update sensitive credentials** in production files
2. **Test configurations** in your development environment
3. **Backup environment files** securely
4. **Never commit production secrets** to version control

Happy coding! 🚀
