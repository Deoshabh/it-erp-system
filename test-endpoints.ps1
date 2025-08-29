# Test script for API endpoints
$baseUrl = "http://localhost:3001/api/v1"

# Login to get token
$loginData = @{
    email = "admin@admin.com"
    password = "admin123"
} | ConvertTo-Json

Write-Host "Logging in..." -ForegroundColor Green
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    
    if ($loginResponse -and $loginResponse.access_token) {
        $token = $loginResponse.access_token
        Write-Host "Login successful! Token: $($token.Substring(0,20))..." -ForegroundColor Green
        
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        # Test employee statistics
        Write-Host "`nTesting employee statistics..." -ForegroundColor Yellow
        try {
            $empStats = Invoke-RestMethod -Uri "$baseUrl/employees/statistics" -Method GET -Headers $headers
            Write-Host "Employee stats successful!" -ForegroundColor Green
            if ($empStats -and $empStats.totalEmployees -ne $null) {
                Write-Host "Total employees: $($empStats.totalEmployees)" -ForegroundColor Cyan
            }
        } catch {
            Write-Host "Employee stats failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        
        # Test procurement statistics
        Write-Host "`nTesting procurement statistics..." -ForegroundColor Yellow
        try {
            $procStats = Invoke-RestMethod -Uri "$baseUrl/procurement/statistics" -Method GET -Headers $headers
            Write-Host "Procurement stats successful!" -ForegroundColor Green
            if ($procStats -and $procStats.totalRequests -ne $null) {
                Write-Host "Total requests: $($procStats.totalRequests)" -ForegroundColor Cyan
            }
        } catch {
            Write-Host "Procurement stats failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        
        # Test files statistics
        Write-Host "`nTesting files statistics..." -ForegroundColor Yellow
        try {
            $fileStats = Invoke-RestMethod -Uri "$baseUrl/files/stats" -Method GET -Headers $headers
            Write-Host "Files stats successful!" -ForegroundColor Green
            if ($fileStats -and $fileStats.totalFiles -ne $null) {
                Write-Host "Total files: $($fileStats.totalFiles)" -ForegroundColor Cyan
            }
        } catch {
            Write-Host "Files stats failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "Login response is missing token" -ForegroundColor Red
        Write-Host "Response: $($loginResponse | ConvertTo-Json)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
}
