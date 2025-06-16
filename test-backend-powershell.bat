@echo off
echo Testing Railway Backend: https://hsndb-backend-production.up.railway.app
echo.

powershell -Command "try { $response = Invoke-RestMethod -Uri 'https://hsndb-backend-production.up.railway.app/api/health' -Method Get; Write-Host 'Health Check:'; $response | ConvertTo-Json } catch { Write-Host 'Error: ' $_.Exception.Message }"

echo.
echo Testing Database Info...
powershell -Command "try { $response = Invoke-RestMethod -Uri 'https://hsndb-backend-production.up.railway.app/api/database/info' -Method Get; Write-Host 'Database Info:'; $response | ConvertTo-Json } catch { Write-Host 'Error: ' $_.Exception.Message }"

echo.
echo Testing BLAST Submit...
powershell -Command "try { $body = @{ sequence = 'MKFFVLRQVGGAKDFVPAGTAQDAIAKLGGQVTLVTHSARAIAQAALAGEGTKVLVTVDTDVTGDALLKEGVVLFRFVDNVGFGARVFKDP'; algorithm = 'blastp'; evalue = 10; maxTargetSeqs = 10 } | ConvertTo-Json; $response = Invoke-RestMethod -Uri 'https://hsndb-backend-production.up.railway.app/api/blast/submit' -Method Post -Body $body -ContentType 'application/json'; Write-Host 'BLAST Submit:'; $response | ConvertTo-Json } catch { Write-Host 'Error: ' $_.Exception.Message }"

echo.
pause
