$base = 'http://localhost:3000'
$headers = @{ Accept = 'application/json' }

function safeInvoke($method, $path, $body=$null) {
  try {
    if ($method -eq 'GET') {
      $r = Invoke-RestMethod -Uri ("$base$path") -Method GET -Headers $headers -ContentType 'application/json' -ErrorAction Stop
      return @{ ok = $true; status = 200; data = $r }
    } else {
      $json = $body | ConvertTo-Json -Depth 10
      $r = Invoke-RestMethod -Uri ("$base$path") -Method $method -Headers $headers -Body $json -ContentType 'application/json' -ErrorAction Stop
      return @{ ok = $true; status = 200; data = $r }
    }
  } catch {
    $err = $_.Exception
    $status = $null
    if ($err.Response) { $status = $err.Response.StatusCode.Value__ }
    $respBody = $null
    try { $respBody = $err.Response.Content } catch {}
    return @{ ok = $false; message = $err.Message; status = $status; responseBody = $respBody }
  }
}

$results = @{}
$admin = @{ email = 'pg2331427@gmail.com'; password = 'admin123' }
$user = @{ email = 'user@test.com'; password = 'user123' }
$vendor = @{ email = 'vendor@test.com'; password = 'vendor123' }

$results.adminLogin = safeInvoke 'POST' '/api/auth/login' $admin
$results.userLogin = safeInvoke 'POST' '/api/auth/login' $user
$results.vendorLogin = safeInvoke 'POST' '/api/auth/login' $vendor

$userId = if ($results.userLogin.ok) { $results.userLogin.data.user.uid } else { 'user_1' }
$vendorId = if ($results.vendorLogin.ok) { $results.vendorLogin.data.user.uid } else { 'vendor_1' }
$adminId = if ($results.adminLogin.ok) { $results.adminLogin.data.user.uid } else { 'admin_1' }

$results.getUserProfile = safeInvoke 'GET' "/api/users/$userId"
$results.getVendorProfile = safeInvoke 'GET' "/api/vendors/$vendorId"

$booking = @{ userId = $userId; serviceId = 'srv_test'; vendorId = $vendorId; type = 'puja'; date = (Get-Date).ToString('yyyy-MM-dd'); timeSlot = '10:00'; totalAmount = 150; isOnline = $false; bringSamagri = $false }
$results.createBooking = safeInvoke 'POST' '/api/bookings' $booking

$results.vendorBookings = safeInvoke 'GET' "/api/vendor/bookings/$vendorId"

$announce = @{ title = 'Automated Test Announcement'; message = 'This is a test announcement'; targetRole = 'all' }
$results.sendAnnouncement = safeInvoke 'POST' '/api/admin/send-announcement' $announce
$results.adminStats = safeInvoke 'GET' '/api/admin/stats'
$results.adminPendingVendors = safeInvoke 'GET' '/api/admin/pending-vendors'

$order = @{ userId = $userId; items = @(@{ name = 'Test Item'; vendorId = $vendorId; price = 100; quantity = 1 }); totalAmount = 100; status = 'pending'; shippingAddress = 'Test Address' }
$results.createOrder = safeInvoke 'POST' '/api/orders' $order
$results.getOrders = safeInvoke 'GET' "/api/orders/$userId"

$results.vendorWallet = safeInvoke 'GET' "/api/vendor/wallet/$vendorId"

New-Item -ItemType Directory -Force -Path tests\results | Out-Null
$results | ConvertTo-Json -Depth 20 | Out-File -FilePath tests\results\retry_api_requests.json -Encoding utf8
Write-Output "Results written to tests\results\retry_api_requests.json"
$results | ConvertTo-Json -Depth 20
