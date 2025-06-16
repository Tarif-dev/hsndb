@echo off
echo === Testing CORS Configuration ===
echo.

echo Your Vercel domain: https://hsndb-taupe.vercel.app
echo Railway backend: https://hsndb-backend-production.up.railway.app
echo.

echo 1. Testing direct API access (should work):
powershell -Command "try { $response = Invoke-RestMethod -Uri 'https://hsndb-backend-production.up.railway.app/api/health'; Write-Host 'SUCCESS: Backend is responding'; $response | ConvertTo-Json } catch { Write-Host 'ERROR: ' $_.Exception.Message }"

echo.
echo 2. Testing CORS from browser:
echo Please open your browser and go to: https://hsndb-taupe.vercel.app
echo Open developer tools (F12) and check the console for CORS errors.
echo.

echo 3. Current Railway variables:
cd /d "d:\hsndbSite\hsndb-blast-backend"
railway variables

echo.
echo === CORS Test Complete ===
echo If you still see CORS errors, the backend may still be redeploying.
echo Wait 2-3 minutes and try again.
echo.
pause
