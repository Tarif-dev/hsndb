@echo off
echo =====================================
echo  HSNDB BLAST Server - Starting...
echo =====================================
echo.

cd /d "%~dp0"

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: 
node --version

echo.
echo Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting HSNDB BLAST Server...
echo.
echo Server will be available at: http://localhost:3001
echo API endpoint: http://localhost:3001/api
echo Health check: http://localhost:3001/api/health
echo.
echo Press Ctrl+C to stop the server
echo =====================================
echo.

node server.js

echo.
echo Server stopped.
pause
