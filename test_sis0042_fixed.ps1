$apiUrl = "http://localhost:1337/api/orders"

$orderData = @{
  products = @(
    @{
      id = 1
      quantity = 1
      price = 125.00
    }
  )
  customer = @{
    email = "test@example.com"
    firstName = "Test"
    lastName = "User"
    phone = "+34600000000"
  }
  totalAmount = 125.00
  currency = "EUR"
} | ConvertTo-Json -Depth 10

Write-Output "Creating order with totalAmount: 125.00 EUR..."
Write-Output ""

$orderResponse = Invoke-WebRequest -Uri $apiUrl `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body $orderData `
  -UseBasicParsing

Write-Output "Order created: Status $($orderResponse.StatusCode)"
Write-Output ""

if ($orderResponse.StatusCode -eq 200 -or $orderResponse.StatusCode -eq 201) {
  $order = $orderResponse.Content | ConvertFrom-Json

  $orderId = $null
  if ($order.data -and $order.data.id) {
    $orderId = $order.data.id
  } elseif ($order.order -and $order.order.id) {
    $orderId = $order.order.id
  }

  if (-not $orderId) {
    Write-Output "FAILED to parse order id from response"
    Write-Output $orderResponse.Content
    exit 1
  }

  Write-Output "Order ID: $orderId"
  Write-Output ""

  $paymentUrl = "http://localhost:1337/api/payment/create-transaction"
  Write-Output "Fetching TPV payment parameters..."
  Write-Output ""

  $paymentRequest = @{
    orderId = $orderId
    customerEmail = "test@example.com"
    customerName = "Test User"
    customerPhone = "+34600000000"
    totalAmount = 125.00
  } | ConvertTo-Json

  $paymentResponse = Invoke-WebRequest -Uri $paymentUrl `
    -Method POST `
    -Headers @{ "Content-Type" = "application/json" } `
    -Body $paymentRequest `
    -UseBasicParsing

  Write-Output "Payment parameters obtained: Status $($paymentResponse.StatusCode)"
  Write-Output ""

  if ($paymentResponse.StatusCode -eq 200) {
    $payment = $paymentResponse.Content | ConvertFrom-Json

    Write-Output "DECODED MERCHANT PARAMETERS:"
    Write-Output "============================"
    Write-Output ""

    $paramBase64 = $payment.paramBase64
    if (-not $paramBase64 -and $payment.tpvParams) {
      $paramBase64 = $payment.tpvParams.Ds_MerchantParameters
    }

    if (-not $paramBase64) {
      Write-Output "FAILED to locate Ds_MerchantParameters in response"
      Write-Output $paymentResponse.Content
      exit 1
    }
    $base64 = $paramBase64 -replace '-', '+' -replace '_', '/'
    while (($base64.Length % 4) -ne 0) {
      $base64 += '='
    }

    $decoded = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($base64))
    Write-Output $decoded
    Write-Output ""

    Write-Output "CRITICAL FIELD VERIFICATION:"
    Write-Output "============================"
    $params = $decoded | ConvertFrom-Json

    $criticalFields = @(
      "DS_MERCHANT_AMOUNT",
      "DS_MERCHANT_ORDER",
      "DS_MERCHANT_MERCHANTCODE",
      "DS_MERCHANT_TERMINAL",
      "DS_MERCHANT_CURRENCY",
      "DS_MERCHANT_TRANSACTIONTYPE",
      "DS_MERCHANT_URLOK",
      "DS_MERCHANT_URLKO",
      "DS_MERCHANT_MERCHANTURL"
    )

    foreach ($field in $criticalFields) {
      $value = $params.$field
      if ($value) {
        Write-Output "[OK] $field = $value"
      } else {
        Write-Output "[MISSING] $field"
      }
    }

    Write-Output ""
    $presentCount = ($criticalFields | Where-Object { $params.PSObject.Properties.Name -contains $_ }).Count
    Write-Output "TOTAL CRITICAL FIELDS PRESENT: $presentCount / $($criticalFields.Count)"
    Write-Output "TPV endpoint: $($payment.tpvEndpoint)"
    if ($payment.tpvParams) {
      Write-Output "Signature version: $($payment.tpvParams.Ds_SignatureVersion)"
    }

    Write-Output ""
    Write-Output "Testing direct POST to Redsys sandbox..."
    $dsSignature = $payment.signature
    if (-not $dsSignature -and $payment.tpvParams) {
      $dsSignature = $payment.tpvParams.Ds_Signature
    }

    $tpvForm = @{
      Ds_SignatureVersion = "HMAC_SHA256_V1"
      Ds_MerchantParameters = $paramBase64
      Ds_Signature = $dsSignature
    }

    try {
      $tpvResponse = Invoke-WebRequest -Uri $payment.tpvEndpoint -Method POST -Body $tpvForm -UseBasicParsing
      Write-Output "Redsys response HTTP status: $($tpvResponse.StatusCode)"

      if ($tpvResponse.Content -match "SIS0042") {
        Write-Output "[ERROR] SIS0042 detected in Redsys response"
      } else {
        Write-Output "[OK] SIS0042 not detected in Redsys response"
      }
    } catch {
      $response = $_.Exception.Response
      if ($response -and $response.StatusCode) {
        Write-Output "Redsys response HTTP status: $([int]$response.StatusCode)"
      }

      $errorText = $_.Exception.Message
      if ($errorText -match "SIS0042") {
        Write-Output "[ERROR] SIS0042 detected while posting to Redsys"
      } else {
        Write-Output "[INFO] Redsys returned an error but SIS0042 was not detected"
      }
    }
  } else {
    Write-Output "FAILED to get payment parameters"
    Write-Output $paymentResponse.Content
    exit 1
  }
} else {
  Write-Output "FAILED to create order"
  Write-Output $orderResponse.Content
  exit 1
}
