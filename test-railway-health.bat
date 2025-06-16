@echo off
echo 🔍 Testing HSNDB BLAST Backend Health...
echo.

REM Get Railway URL from user
set /p RAILWAY_URL="Enter your Railway URL (e.g., https://your-app.railway.app): "

echo.
echo 📡 Testing Health Endpoint...
curl -s "%RAILWAY_URL%/api/health" | echo.

echo.
echo 🗄️  Testing Database Info...
curl -s "%RAILWAY_URL%/api/database/info" | echo.

echo.
echo 📋 Testing Jobs Endpoint...
curl -s "%RAILWAY_URL%/api/blast/jobs" | echo.

echo.
echo ✅ Health check complete!
echo.
pause
