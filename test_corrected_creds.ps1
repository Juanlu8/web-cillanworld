#!/usr/bin/env pwsh

Write-Host "Testing with CORRECTED Merchant Credentials" -ForegroundColor Cyan;
Write-Host "==========================================" -ForegroundColor Cyan;
Write-Host "";

[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true};

# Get signed params from backend
$resp = Invoke-WebRequest -Uri "http://localhost:1337/api/payment/create-transaction" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"orderId":130,"totalAmount":125.00,"customerName":"Test","customerEmail":"test@test.com","customerPhone":"123"}' `
  -UseBasicParsing;

$data = ConvertFrom-Json $resp.Content;

Write-Host "Backend Response: OK" -ForegroundColor Green;

# Decode params to show what's being sent
$b64 = $data.tpvParams.Ds_MerchantParameters;
$decoded = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($b64));
$params = $decoded | ConvertFrom-Json;

Write-Host "Terminal in params: $($params.DS_MERCHANT_TERMINAL)" -ForegroundColor Yellow;
Write-Host "";

# POST to Redsys
Write-Host "Posting to Redsys Sandbox with corrected credentials..." -ForegroundColor Yellow;

$formBody = @{
    Ds_SignatureVersion = $data.tpvParams.Ds_SignatureVersion
    Ds_MerchantParameters = $data.tpvParams.Ds_MerchantParameters
    Ds_Signature = $data.tpvParams.Ds_Signature
};

$redsysResp = Invoke-WebRequest -Uri "https://sis-t.redsys.es:25443/sis/realizarPago" `
  -Method POST -Body $formBody -UseBasicParsing;

$content = $redsysResp.Content;

Write-Host "HTTP Response: $($redsysResp.StatusCode)" -ForegroundColor Green;
Write-Host "Response size: $($content.Length) bytes" -ForegroundColor Cyan;
Write-Host "";

# Check for SIS error code
if ($content -match "SIS(\d{4})") {
    Write-Host "ERROR: SIS$($matches[1]) detected" -ForegroundColor Red;
    
    # Show context
    $lines = $content -split "`n";
    $errorLines = $lines | Select-String "SIS" | Select-Object -First 3;
    Write-Host "Error context:" -ForegroundColor Yellow;
    $errorLines | ForEach-Object { Write-Host $_.Line };
    
} elseif ($content -match "formTarjeta|form.*method|input.*hidden") {
    Write-Host "✅ SUCCESS! Payment form HTML detected" -ForegroundColor Green;
    Write-Host "" ;
    Write-Host "Payment gateway successfully accepted the parameters!" -ForegroundColor Cyan;
    Write-Host "User can now enter card details." -ForegroundColor Cyan;
} else {
    Write-Host "Response received:" -ForegroundColor Cyan;
    Write-Host $content.Substring(0, [Math]::Min(300, $content.Length));
}

Write-Host "";
Write-Host "Test complete." -ForegroundColor Yellow;
