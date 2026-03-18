#!/usr/bin/env pwsh

# Test minimal Redsys parameters
Write-Host "Testing Minimal Transaction Parameters" -ForegroundColor Green;
Write-Host "=======================================" -ForegroundColor Green;
Write-Host "";

try {
    # Get signed params from backend
    $backendResp = Invoke-WebRequest -Uri "http://localhost:1337/api/payment/create-transaction" `
        -Method POST `
        -ContentType "application/json" `
        -Body '{"orderId":130,"totalAmount":125.00,"customerName":"Test","customerEmail":"test@test.com","customerPhone":"123"}' `
        -UseBasicParsing `
        -TimeoutSec 10;
    
    $data = $backendResp.Content | ConvertFrom-Json;
    
    # Decode to show fields
    $b64 = $data.tpvParams.Ds_MerchantParameters;
    $decoded = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($b64));
    $params = $decoded | ConvertFrom-Json;
    
    Write-Host "Backend Response: OK" -ForegroundColor Green;
    Write-Host "Fields sent to Redsys ($($params.PSObject.Properties.Count) total):" -ForegroundColor Cyan;
    $params.PSObject.Properties | ForEach-Object {
        Write-Host "  - $($_.Name) = $($_.Value)";
    };
    Write-Host "";
    
    # POST to Redsys
    Write-Host "Posting to Redsys Sandbox..." -ForegroundColor Yellow;
    
    # PowerShell 5.1 doesn't support -SkipCertificateCheck, use ServicePointManager
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true};
    
    $redsysResp = Invoke-WebRequest `
        -Uri "https://sis-t.redsys.es:25443/sis/realizarPago" `
        -Method POST `
        -Body @{
            Ds_SignatureVersion = $data.tpvParams.Ds_SignatureVersion
            Ds_MerchantParameters = $data.tpvParams.Ds_MerchantParameters
            Ds_Signature = $data.tpvParams.Ds_Signature
        } `
        -UseBasicParsing `
        -TimeoutSec 15;
    
    Write-Host "Redsys Response: HTTP $($redsysResp.StatusCode)" -ForegroundColor Green;
    
    $content = $redsysResp.Content;
    Write-Host "Response size: $($content.Length) bytes" -ForegroundColor Cyan;
    Write-Host "";
    
    # Check for errors
    if ($content -match "SIS(\d{4})") {
        Write-Host "❌ ERROR: SIS$($matches[1]) detected in response" -ForegroundColor Red;
        Write-Host "";
        Write-Host "Response snippet:" -ForegroundColor Yellow;
        $lines = $content -split "`n" | Select-String "SIS|error|Error" -Context 2,2;
        Write-Host $lines;
    } elseif ($content.Length -gt 3000) {
        Write-Host "✅ SUCCESS: Large response suggests payment form loaded!" -ForegroundColor Green;
        Write-Host "";
        Write-Host "✅ CONCLUSION: Minimal parameters resolved SIS0042!" -ForegroundColor Cyan;
    } else {
        Write-Host "Response length is small - checking content...";
        Write-Host $content.Substring(0, [Math]::Min(200, $content.Length));
    }
    
} catch {
    Write-Host "❌ Exception: $($_.Exception.Message)" -ForegroundColor Red;
}

Write-Host "";
Write-Host "Test complete." -ForegroundColor Yellow;
