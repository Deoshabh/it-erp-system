$baseUrl = "http://localhost:3001/api/v1"

# Get fresh admin token
Write-Host "Getting admin token..." -ForegroundColor Blue
$adminLogin = @{
    email = "admin@admin.com"
    password = "admin123"
}

$adminResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Headers @{'Content-Type' = 'application/json'} -Body ($adminLogin | ConvertTo-Json)
$adminToken = $adminResponse.access_token
Write-Host "Admin token obtained" -ForegroundColor Green

# Check users
Write-Host "Checking users..." -ForegroundColor Blue
$headers = @{
    'Authorization' = "Bearer $adminToken"
    'Content-Type' = 'application/json'
}

$users = Invoke-RestMethod -Uri "$baseUrl/users" -Method GET -Headers $headers
Write-Host "Total users: $($users.total)" -ForegroundColor Green
foreach ($user in $users.users) {
    Write-Host "Email: $($user.email), Role: $($user.role), Status: $($user.status)" -ForegroundColor Gray
}

# Try to login as employee
Write-Host "Trying employee login..." -ForegroundColor Blue
$employeeLogin = @{
    email = "employee@company.com"
    password = "employee123"
}

try {
    $employeeResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Headers @{'Content-Type' = 'application/json'} -Body ($employeeLogin | ConvertTo-Json)
    Write-Host "Employee login successful!" -ForegroundColor Green
    $employeeToken = $employeeResponse.access_token
    
    # Test procurement creation
    Write-Host "Testing procurement creation..." -ForegroundColor Blue
    $procurementData = @{
        title = "Employee Test Request"
        description = "Testing procurement as employee"
        category = "it_equipment"
        priority = "medium"
        estimatedAmount = 25000
        vendor = "Test Vendor"
        vendorContact = "123456789"
        requiredBy = "2025-08-29"
        department = "IT"
    }

    $employeeHeaders = @{
        'Authorization' = "Bearer $employeeToken"
        'Content-Type' = 'application/json'
    }

    $procurementResponse = Invoke-RestMethod -Uri "$baseUrl/procurement" -Method POST -Headers $employeeHeaders -Body ($procurementData | ConvertTo-Json)
    Write-Host "Procurement creation successful! Request ID: $($procurementResponse.requestId)" -ForegroundColor Green
    
} catch {
    Write-Host "Employee operation failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Error Body: $errorBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read error details" -ForegroundColor Red
        }
    }
}
