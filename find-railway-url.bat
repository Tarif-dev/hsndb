@echo off
echo 🔍 Finding Your Railway URL...
echo ================================
echo.

cd /d "d:\hsndbSite\hsndb-blast-backend"

echo 1. Checking Railway status...
railway status

echo.
echo 2. Getting Railway domain...
railway domain

echo.
echo 3. If no domain exists, generating one...
railway domain --generate

echo.
echo 4. Final Railway info...
railway vars

echo.
echo ================================
echo Your Railway URL should be shown above!
echo Copy the URL and use it as: https://your-url.railway.app/api
echo.
pause
