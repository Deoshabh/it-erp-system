@echo off
REM ERP System Backend Startup Script for Windows

echo  Starting ERP System Backend...

REM Set environment variables
set NODE_ENV=development

REM Check if node_modules exists
if not exist "node_modules" (
    echo  Installing dependencies...
    npm install
)

REM Build the application
echo  Building application...
npm run build

REM Start the development server
echo  Starting development server...
echo Backend will be available at: http://localhost:3001
echo API documentation at: http://localhost:3001/api/docs
echo.
echo Press Ctrl+C to stop the server

npm run start:dev
