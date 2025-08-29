# Test API URL Fix
$baseUrl = "http://localhost:3001/api/v1"

Write-Host "=== TESTING API URL PATH FIX ===" -ForegroundColor Yellow
Write-Host ""

# Get admin token
Write-Host "1. Getting admin authentication..." -ForegroundColor Blue
$adminLogin = @{
    email = "admin@admin.com"
    password = "admin123"
}

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Headers @{'Content-Type' = 'application/json'} -Body ($adminLogin | ConvertTo-Json)
    $adminToken = $loginResponse.access_token
    Write-Host "   Admin authenticated!" -ForegroundColor Green
    
    $headers = @{
        'Authorization' = "Bearer $adminToken"
        'Content-Type' = 'application/json'
    }

    # Test the specific endpoint that was failing
    Write-Host ""
    Write-Host "2. Testing users search endpoint..." -ForegroundColor Blue
    
    $usersSearchUrl = "$baseUrl/users/search?page=1&limit=10&sortBy=createdAt&sortOrder=DESC"
    Write-Host "   Testing URL: $usersSearchUrl" -ForegroundColor Gray
    
    $usersSearchResponse = Invoke-RestMethod -Uri $usersSearchUrl -Method GET -Headers $headers
    Write-Host "   Users search endpoint working!" -ForegroundColor Green
    Write-Host "   Total users found: $($usersSearchResponse.total)" -ForegroundColor Green

    # Test employees search endpoint
    Write-Host ""
    Write-Host "3. Testing employees search endpoint..." -ForegroundColor Blue
    
    $employeesSearchUrl = "$baseUrl/employees/search?page=1&limit=10&sortBy=createdAt&sortOrder=DESC"
    Write-Host "   Testing URL: $employeesSearchUrl" -ForegroundColor Gray
    
    $employeesSearchResponse = Invoke-RestMethod -Uri $employeesSearchUrl -Method GET -Headers $headers
    Write-Host "   Employees search endpoint working!" -ForegroundColor Green
    Write-Host "   Total employees found: $($employeesSearchResponse.total)" -ForegroundColor Green

    Write-Host ""
    Write-Host "API URL PATH ISSUE FIXED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "BEFORE: URLs were duplicated like /api/v1/api/v1/users/search" -ForegroundColor Green
    Write-Host "AFTER: URLs are correct like /api/v1/users/search" -ForegroundColor Green

} catch {
    Write-Host "Test failed: $($_.Exception.Message)" -ForegroundColor Red
}
