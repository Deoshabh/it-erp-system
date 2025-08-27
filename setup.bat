@echo off
REM IT ERP System Setup Script for Windows

echo 🚀 Setting up IT ERP System...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Setup backend
echo 📦 Setting up backend...
cd backend
if not exist ".env" (
    copy .env.example .env
    echo ✅ Created backend .env file
)

echo 📦 Installing backend dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

REM Setup frontend
echo 📦 Setting up frontend...
cd ..\frontend
if not exist ".env.local" (
    copy .env.example .env.local
    echo ✅ Created frontend .env.local file
)

echo 📦 Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

REM Return to root directory
cd ..

echo 🐳 Starting Docker services...
docker-compose up -d postgres redis minio localstack

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo ✅ Setup completed successfully!
echo.
echo 🎉 Your IT ERP System is ready!
echo.
echo To start development:
echo 1. Backend: cd backend && npm run start:dev
echo 2. Frontend: cd frontend && npm run dev
echo.
echo Or use Docker:
echo docker-compose up
echo.
echo Access points:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:3001
echo - GraphQL: http://localhost:3001/graphql
echo - API Docs: http://localhost:3001/api/docs
echo.
echo Default login:
echo - Email: admin@company.com
echo - Password: Admin123!

pause
