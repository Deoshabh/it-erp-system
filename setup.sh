#!/bin/bash

# IT ERP System Setup Script
echo "🚀 Setting up IT ERP System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup backend
echo "📦 Setting up backend..."
cd backend
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created backend .env file"
fi

echo "📦 Installing backend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Setup frontend
echo "📦 Setting up frontend..."
cd ../frontend
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo "✅ Created frontend .env.local file"
fi

echo "📦 Installing frontend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Return to root directory
cd ..

echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis minio localstack

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

echo "✅ Setup completed successfully!"
echo ""
echo "🎉 Your IT ERP System is ready!"
echo ""
echo "To start development:"
echo "1. Backend: cd backend && npm run start:dev"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
echo "Or use Docker:"
echo "docker-compose up"
echo ""
echo "Access points:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:3001"
echo "- GraphQL: http://localhost:3001/graphql"
echo "- API Docs: http://localhost:3001/api/docs"
echo ""
echo "Default login:"
echo "- Email: admin@company.com"
echo "- Password: Admin123!"
