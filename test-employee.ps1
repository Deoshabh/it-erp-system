# Test Employee Authentication and Procurement Creation
$baseUrl = "http://localhost:3001/api/v1"

Write-Host "=== Employee Authentication Test ===" -ForegroundColor Yellow

# First, login as admin to get fresh token
Write-Host "Logging in as admin..." -ForegroundColor Blue
$adminLogin = @{
    email = "admin@admin.com"
    password = "admin123"
}

try {
    $adminResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Headers @{'Content-Type' = 'application/json'} -Body ($adminLogin | ConvertTo-Json)
    $adminToken = $adminResponse.access_token
    Write-Host "Admin login successful!" -ForegroundColor Green
} catch {
    Write-Host "Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Create employee user if it doesn't exist
Write-Host "Creating employee user..." -ForegroundColor Blue
$employeeData = @{
    email = "employee@company.com"
    password = "employee123"
    firstName = "John"
    lastName = "Employee"
    role = "employee"
    status = "active"
}

try {
    $headers = @{
        'Authorization' = "Bearer $adminToken"
        'Content-Type' = 'application/json'
    }
    
    $employeeResponse = Invoke-RestMethod -Uri "$baseUrl/users" -Method POST -Headers $headers -Body ($employeeData | ConvertTo-Json)
    Write-Host "Employee user created successfully: $($employeeResponse.email)" -ForegroundColor Green
} catch {
    Write-Host "Employee user creation failed (might already exist): $($_.Exception.Message)" -ForegroundColor Yellow
}

# Now login as employee
Write-Host "Logging in as employee..." -ForegroundColor Blue
$loginData = @{
    email = "employee@company.com"
    password = "employee123"
}

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Headers @{'Content-Type' = 'application/json'} -Body ($loginData | ConvertTo-Json)
    $employeeToken = $loginResponse.access_token
    Write-Host "Employee login successful!" -ForegroundColor Green
    Write-Host "Employee Token: $employeeToken" -ForegroundColor Gray
    
    # Decode token to check payload
    $tokenParts = $employeeToken.Split('.')
    $payload = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($tokenParts[1] + "=="))
    Write-Host "Token Payload: $payload" -ForegroundColor Gray
    
} catch {
    Write-Host "Employee login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test procurement creation as employee
Write-Host "Testing procurement creation as employee..." -ForegroundColor Blue
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

try {
    $procurementResponse = Invoke-RestMethod -Uri "$baseUrl/procurement" -Method POST -Headers $employeeHeaders -Body ($procurementData | ConvertTo-Json)
    Write-Host "Employee procurement creation successful!" -ForegroundColor Green
    Write-Host "Request ID: $($procurementResponse.requestId)" -ForegroundColor Green
} catch {
    Write-Host "Employee procurement creation failed:" -ForegroundColor Red
    $_.Exception.Message
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Red
    }
}
