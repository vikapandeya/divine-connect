$base = 'http://localhost:3000'
$results = @{}

function safeGet($path) {
   try {
      $r = Invoke-RestMethod -Uri ("$base$path") -Method GET -ErrorAction Stop
      return @{ ok = $true; data = $r }
   }
   catch {
      $err = $_.Exception
      $status = $null
      if ($err.Response) { $status = $err.Response.StatusCode.Value__ }
      return @{ ok = $false; message = $err.Message; status = $status }
   }
}

function safePost($path, $body) {
   try {
      $r = Invoke-RestMethod -Uri ("$base$path") -Method POST -Body ($body | ConvertTo-Json -Depth 10) -ContentType 'application/json' -ErrorAction Stop
      return @{ ok = $true; data = $r }
   }
   catch {
      $err = $_.Exception
      $status = $null
      if ($err.Response) { $status = $err.Response.StatusCode.Value__ }
      return @{ ok = $false; message = $err.Message; status = $status }
   }
}

# Health
$results.health = safeGet('/api/health')

# Logins (seeded users)
$adminCreds = @{ email = 'pg2331427@gmail.com'; password = 'admin123' }
$results.adminLogin = safePost('/api/auth/login', $adminCreds)

$userCreds = @{ email = 'user@test.com'; password = 'user123' }
$results.userLogin = safePost('/api/auth/login', $userCreds)

$vendorCreds = @{ email = 'vendor@test.com'; password = 'vendor123' }
$results.vendorLogin = safePost('/api/auth/login', $vendorCreds)

# Resolve IDs with fallback to seeded IDs
try { $userId = $results.userLogin.data.user.uid } catch { $userId = 'user_1' }
try { $vendorId = $results.vendorLogin.data.user.uid } catch { $vendorId = 'vendor_1' }
try { $adminId = $results.adminLogin.data.user.uid } catch { $adminId = 'admin_1' }

# Profiles
$results.getUserProfile = safeGet("/api/users/$userId")
$results.getVendorProfile = safeGet("/api/vendors/$vendorId")

# Create booking as user
$booking = @{
   userId       = $userId
   serviceId    = 'srv_test'
   vendorId     = $vendorId
   type         = 'puja'
   date         = (Get-Date).ToString('yyyy-MM-dd')
   timeSlot     = '10:00'
   totalAmount  = 150
   isOnline     = $false
   bringSamagri = $false
}
$results.createBooking = safePost('/api/bookings', $booking)

# Vendor bookings
$results.vendorBookings = safeGet("/api/vendor/bookings/$vendorId")

# Admin: send announcement
$announce = @{ title = 'Automated Test Announcement'; message = 'This is a test announcement'; targetRole = 'all' }
$results.sendAnnouncement = safePost('/api/admin/send-announcement', $announce)
$results.adminStats = safeGet('/api/admin/stats')
$results.adminPendingVendors = safeGet('/api/admin/pending-vendors')

# Create order as user
$order = @{
   userId          = $userId
   items           = @(@{ name = 'Test Item'; vendorId = $vendorId; price = 100; quantity = 1 })
   totalAmount     = 100
   status          = 'pending'
   shippingAddress = 'Test Address'
}
$results.createOrder = safePost('/api/orders', $order)
$results.getOrders = safeGet("/api/orders/$userId")

# Vendor wallet
$results.vendorWallet = safeGet("/api/vendor/wallet/$vendorId")

# Write results
New-Item -ItemType Directory -Force -Path tests\results | Out-Null
$results | ConvertTo-Json -Depth 20 | Out-File -FilePath tests\results\api_role_tests.json -Encoding utf8
Write-Output ("Results written to tests\results\api_role_tests.json")
$results | ConvertTo-Json -Depth 20
