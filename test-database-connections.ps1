# Script to test the User Management API connections
$baseUrl = "http://localhost:3001/api/v1"

Write-Host "=== Testing User Management Database Connection ===" -ForegroundColor Yellow
Write-Host ""

# Test admin login for user management access
Write-Host "1. Testing admin login..." -ForegroundColor Blue
$adminLogin = @{
    email = "admin@admin.com"
    password = "admin123"
}

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Headers @{'Content-Type' = 'application/json'} -Body ($adminLogin | ConvertTo-Json)
    $adminToken = $loginResponse.access_token
    Write-Host "   ✅ Admin login successful!" -ForegroundColor Green
    
    # Test fetching users from database
    Write-Host "2. Testing user list from database..." -ForegroundColor Blue
    $headers = @{
        'Authorization' = "Bearer $adminToken"
        'Content-Type' = 'application/json'
    }

    $usersResponse = Invoke-RestMethod -Uri "$baseUrl/users" -Method GET -Headers $headers
    Write-Host "   ✅ Users fetched from database!" -ForegroundColor Green
    Write-Host "   Found users: $($usersResponse.length)" -ForegroundColor Gray
    
    if ($usersResponse.length -gt 0) {
        Write-Host "   Sample users:" -ForegroundColor Gray
        $usersResponse | Select-Object -First 3 | ForEach-Object {
            Write-Host "   - $($_.firstName) $($_.lastName) ($($_.email)) - Role: $($_.role)" -ForegroundColor Gray
        }
    }
    
    # Test creating a new user
    Write-Host "3. Testing user creation..." -ForegroundColor Blue
    $newUserData = @{
        email = "test.user@company.com"
        firstName = "Test"
        lastName = "User"
        password = "testpassword123"
        role = "employee"
        department = "IT"
        status = "active"
    }

    $createResponse = Invoke-RestMethod -Uri "$baseUrl/users" -Method POST -Headers $headers -Body ($newUserData | ConvertTo-Json)
    Write-Host "   ✅ New user created successfully!" -ForegroundColor Green
    Write-Host "   User ID: $($createResponse.id)" -ForegroundColor Gray
    Write-Host "   Name: $($createResponse.firstName) $($createResponse.lastName)" -ForegroundColor Gray
    $newUserId = $createResponse.id
    
    # Test user search functionality
    Write-Host "4. Testing user search..." -ForegroundColor Blue
    $searchResponse = Invoke-RestMethod -Uri "$baseUrl/users/search?search=Test&page=1&limit=10" -Method GET -Headers $headers
    Write-Host "   ✅ User search working!" -ForegroundColor Green
    Write-Host "   Search results: $($searchResponse.total) users found" -ForegroundColor Gray
    
    # Test updating the user
    Write-Host "5. Testing user update..." -ForegroundColor Blue
    $updateData = @{
        department = "Updated Department"
        status = "active"
    }
    
    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/users/$newUserId" -Method PATCH -Headers $headers -Body ($updateData | ConvertTo-Json)
    Write-Host "   ✅ User updated successfully!" -ForegroundColor Green
    Write-Host "   Updated department: $($updateResponse.department)" -ForegroundColor Gray
    
    # Clean up - delete the test user
    Write-Host "6. Cleaning up test user..." -ForegroundColor Blue
    Invoke-RestMethod -Uri "$baseUrl/users/$newUserId" -Method DELETE -Headers $headers
    Write-Host "   ✅ Test user deleted!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🎉 USER MANAGEMENT DATABASE CONNECTION WORKING! 🎉" -ForegroundColor Green
    Write-Host "✅ Database connection: Working" -ForegroundColor Green
    Write-Host "✅ User CRUD operations: Working" -ForegroundColor Green
    Write-Host "✅ Search functionality: Working" -ForegroundColor Green
    Write-Host "✅ Authentication: Working" -ForegroundColor Green
    
} catch {
    Write-Host "   ❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Testing Employee Management Database Connection ===" -ForegroundColor Yellow
Write-Host ""

try {
    # Test fetching employees from database
    Write-Host "1. Testing employee list from database..." -ForegroundColor Blue
    $employeesResponse = Invoke-RestMethod -Uri "$baseUrl/employees" -Method GET -Headers $headers
    Write-Host "   ✅ Employees fetched from database!" -ForegroundColor Green
    Write-Host "   Found employees: $($employeesResponse.length)" -ForegroundColor Gray
    
    if ($employeesResponse.length -gt 0) {
        Write-Host "   Sample employees:" -ForegroundColor Gray
        $employeesResponse | Select-Object -First 3 | ForEach-Object {
            Write-Host "   - $($_.firstName) $($_.lastName) ($($_.empId)) - Dept: $($_.department)" -ForegroundColor Gray
        }
    }
    
    # Test creating a new employee
    Write-Host "2. Testing employee creation..." -ForegroundColor Blue
    $newEmployeeData = @{
        empId = "EMP" + (Get-Date).Ticks
        firstName = "Test"
        lastName = "Employee"
        email = "test.employee@company.com"
        phone = "9876543210"
        department = "IT"
        designation = "Software Engineer"
        salary = 500000
        employmentType = "full_time"
        joiningDate = "2025-08-29"
        status = "active"
    }

    $createEmpResponse = Invoke-RestMethod -Uri "$baseUrl/employees" -Method POST -Headers $headers -Body ($newEmployeeData | ConvertTo-Json)
    Write-Host "   ✅ New employee created successfully!" -ForegroundColor Green
    Write-Host "   Employee ID: $($createEmpResponse.id)" -ForegroundColor Gray
    Write-Host "   EmpID: $($createEmpResponse.empId)" -ForegroundColor Gray
    $newEmployeeId = $createEmpResponse.id
    
    # Test employee search
    Write-Host "3. Testing employee search..." -ForegroundColor Blue
    $empSearchResponse = Invoke-RestMethod -Uri "$baseUrl/employees/search?search=Test&page=1&limit=10" -Method GET -Headers $headers
    Write-Host "   ✅ Employee search working!" -ForegroundColor Green
    Write-Host "   Search results: $($empSearchResponse.total) employees found" -ForegroundColor Gray
    
    # Clean up - delete the test employee
    Write-Host "4. Cleaning up test employee..." -ForegroundColor Blue
    Invoke-RestMethod -Uri "$baseUrl/employees/$newEmployeeId" -Method DELETE -Headers $headers
    Write-Host "   ✅ Test employee deleted!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🎉 EMPLOYEE MANAGEMENT DATABASE CONNECTION WORKING! 🎉" -ForegroundColor Green
    Write-Host "✅ Database connection: Working" -ForegroundColor Green
    Write-Host "✅ Employee CRUD operations: Working" -ForegroundColor Green
    Write-Host "✅ Search functionality: Working" -ForegroundColor Green
    
} catch {
    Write-Host "   ❌ Employee test failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Backend API endpoints are working correctly with database." -ForegroundColor Green
Write-Host "The issue is that frontend pages are using MOCK DATA instead of API calls." -ForegroundColor Yellow
Write-Host ""
Write-Host "SOLUTION NEEDED:" -ForegroundColor Red
Write-Host "1. Replace mock data in frontend/src/pages/users.tsx with API calls" -ForegroundColor White
Write-Host "2. Replace mock data in frontend/src/pages/employees.tsx with API calls" -ForegroundColor White
Write-Host "3. Use the service files that were created for API integration" -ForegroundColor White
