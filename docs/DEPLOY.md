# Deployment Guide

## Database Setup

### Prerequisites
Before deploying the IT ERP System, ensure the PostgreSQL database `it_erp` exists.

### Quick Database Creation

#### Option 1: Using psql directly
```bash
export PGHOST=your_host
export PGUSER=your_user
export PGPASSWORD='your_password'
export PGPORT=5432

psql -h "$PGHOST" -U "$PGUSER" -p "$PGPORT" -c "CREATE DATABASE it_erp;"
```

#### Option 2: Using the provided script
```bash
chmod +x scripts/create-db.sh
./scripts/create-db.sh
```

#### Option 3: Docker Compose (for local development)
```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
      POSTGRES_DB: it_erp
    volumes:
      - db-data:/var/lib/postgresql/data
volumes:
  db-data:
```

#### Option 4: Docker container access
```bash
# If running Postgres locally in Docker
docker exec -it <postgres_container_name> psql -U postgres -c "CREATE DATABASE it_erp;"
```

### Verification
Verify the database exists:
```bash
psql -h "$PGHOST" -U "$PGUSER" -p "$PGPORT" -l | grep it_erp
```

### CI/CD Integration
Add this step to your CI pipeline before starting the application:
```bash
# Ensure database exists before app startup
psql -h $DB_HOST -U $DB_USER -c "CREATE DATABASE IF NOT EXISTS it_erp;"
```

### Troubleshooting
If you see the error `database "it_erp" does not exist`:
1. Check database connection parameters
2. Ensure the database exists using the commands above
3. Verify the application can connect to the PostgreSQL server
4. Check that the database user has appropriate permissions

### Environment Variables
Ensure these environment variables are set:
- `PGHOST` or `DB_HOST`
- `PGUSER` or `DB_USER`
- `PGPASSWORD` or `DB_PASSWORD`
- `PGPORT` or `DB_PORT` (default: 5432)
- `DB_NAME=it_erp`
