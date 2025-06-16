@echo off
echo 🔍 HSNDB BLAST Backend Health Check
echo ===================================
echo.

REM Get Railway URL from user
set /p RAILWAY_URL="Enter your Railway URL (e.g., https://your-app.railway.app): "

if "%RAILWAY_URL%"=="" (
    echo ❌ No URL provided
    pause
    exit /b 1
)

echo.
echo 🏥 Testing Health Endpoint...
curl -s -w "Status: %%{http_code}\n" "%RAILWAY_URL%/api/health"
echo.

echo.
echo 🗄️  Testing Database Info...
curl -s -w "Status: %%{http_code}\n" "%RAILWAY_URL%/api/database/info"
echo.

echo.
echo 📋 Testing Jobs Endpoint...
curl -s -w "Status: %%{http_code}\n" "%RAILWAY_URL%/api/blast/jobs"
echo.

echo.
echo ✅ Health check complete!
echo.
echo 📊 Expected Results:
echo - Health: Should return status 200 with {"status":"healthy"}
echo - Database: Should return status 200 with database info
echo - Jobs: Should return status 200 with empty jobs array
echo.
echo ❌ If you see errors:
echo 1. Check Railway logs: railway logs
echo 2. Verify environment variables are set
echo 3. Wait 2-3 minutes for server to fully start
echo.
pause
