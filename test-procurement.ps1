# Test procurement creation
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
        Write-Host "Login successful!" -ForegroundColor Green
        
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        # Test procurement creation
        Write-Host "`nTesting procurement creation..." -ForegroundColor Yellow
        $procurementData = @{
            title = "Test Request"
            description = "Test procurement request"
            category = "it_equipment"
            priority = "medium"
            estimatedAmount = 5000
            vendor = "Test Vendor"
            vendorContact = "123456789"
            requiredBy = "2025-09-30"
            department = "IT"
        } | ConvertTo-Json
        
        try {
            $result = Invoke-RestMethod -Uri "$baseUrl/procurement" -Method POST -Body $procurementData -Headers $headers
            Write-Host "Procurement creation successful!" -ForegroundColor Green
            Write-Host "Request ID: $($result.requestId)" -ForegroundColor Cyan
        } catch {
            Write-Host "Procurement creation failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
}
