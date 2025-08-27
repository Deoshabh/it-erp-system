# IT ERP System Setup Script for PowerShell
Write-Host "🚀 Setting up IT ERP System..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Docker Compose is installed
try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose found: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Setup backend
Write-Host "📦 Setting up backend..." -ForegroundColor Yellow
Set-Location backend

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created backend .env file" -ForegroundColor Green
}

Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Setup frontend
Write-Host "📦 Setting up frontend..." -ForegroundColor Yellow
Set-Location ..\frontend

if (-not (Test-Path ".env.local")) {
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ Created frontend .env.local file" -ForegroundColor Green
}

Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Return to root directory
Set-Location ..

Write-Host "🐳 Starting Docker services..." -ForegroundColor Yellow
docker-compose up -d postgres redis minio localstack

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "✅ Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Your IT ERP System is ready!" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start development:" -ForegroundColor White
Write-Host "1. Backend: cd backend; npm run start:dev" -ForegroundColor Gray
Write-Host "2. Frontend: cd frontend; npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Or use Docker:" -ForegroundColor White
Write-Host "docker-compose up" -ForegroundColor Gray
Write-Host ""
Write-Host "Access points:" -ForegroundColor White
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "- Backend API: http://localhost:3001" -ForegroundColor Gray
Write-Host "- GraphQL: http://localhost:3001/graphql" -ForegroundColor Gray
Write-Host "- API Docs: http://localhost:3001/api/docs" -ForegroundColor Gray
Write-Host ""
Write-Host "Default login:" -ForegroundColor White
Write-Host "- Email: admin@company.com" -ForegroundColor Gray
Write-Host "- Password: Admin123!" -ForegroundColor Gray

Read-Host "Press Enter to continue"
