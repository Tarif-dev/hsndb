@echo off
echo === Testing Railway Backend ===
echo URL: https://hsndb-backend-production.up.railway.app
echo.

echo 1. Health Check:
powershell -Command "Invoke-RestMethod -Uri 'https://hsndb-backend-production.up.railway.app/api/health'"
echo.

echo 2. Database Info:
powershell -Command "Invoke-RestMethod -Uri 'https://hsndb-backend-production.up.railway.app/api/database/info'"
echo.

echo === Test Complete ===
pause
