#!/bin/bash

# ERP System Backend Startup Script

echo "Starting ERP System Backend..."

# Set environment variables
export NODE_ENV=development

# Check if PostgreSQL is running
echo "Checking PostgreSQL connection..."
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo " PostgreSQL is not running. Please start PostgreSQL first."
    echo "   You can start it with: sudo service postgresql start"
    exit 1
fi

echo " PostgreSQL is running"

# Check if database exists
echo " Checking if database exists..."
DB_EXISTS=$(psql -h localhost -U postgres -lqt | cut -d \| -f 1 | grep -qw erp_system; echo $?)

if [ $DB_EXISTS -ne 0 ]; then
    echo " Creating database..."
    psql -h localhost -U postgres -c "CREATE DATABASE erp_system;"
    psql -h localhost -U postgres -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" erp_system
    echo " Database created"
else
    echo " Database exists"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo " Installing dependencies..."
    npm install
fi

# Run database migrations
echo " Running database migrations..."
npm run migration:run

# Build the application
echo " Building application..."
npm run build

# Start the development server
echo "Starting development server..."
echo "Backend will be available at: http://localhost:3001"
echo "API documentation at: http://localhost:3001/api/docs"
echo ""
echo "Press Ctrl+C to stop the server"

npm run start:dev
