@echo off
echo 🚀 Deploying HSNDB BLAST Backend to Railway...
echo.

REM Check if Railway CLI is installed
railway --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Railway CLI not found. Installing...
    npm install -g @railway/cli
    if errorlevel 1 (
        echo ❌ Failed to install Railway CLI. Please install manually.
        echo Run: npm install -g @railway/cli
        pause
        exit /b 1
    )
)

echo 📁 Navigating to backend directory...
cd hsndb-blast-backend

echo � Checking files...
if not exist "sequences.fasta" (
    echo ❌ sequences.fasta not found in backend directory
    echo Copying from parent directory...
    copy "..\sequences.fasta" "sequences.fasta"
    if errorlevel 1 (
        echo ❌ Failed to copy sequences.fasta
        pause
        exit /b 1
    )
)

if not exist "package.json" (
    echo ❌ package.json not found
    pause
    exit /b 1
)

echo ✅ Files check complete

echo �🔑 Login to Railway (browser will open)...
railway login
if errorlevel 1 (
    echo ❌ Railway login failed
    pause
    exit /b 1
)

echo 🆕 Initializing Railway project...
if not exist ".railway" (
    railway init
    if errorlevel 1 (
        echo ❌ Railway init failed
        pause
        exit /b 1
    )
)

echo 📦 Deploying to Railway using Docker...
railway up
if errorlevel 1 (
    echo ❌ Deployment failed
    echo.
    echo 🔧 Troubleshooting tips:
    echo 1. Check if Docker approach worked
    echo 2. View logs: railway logs
    echo 3. Check Railway dashboard for details
    pause
    exit /b 1
)

echo.
echo ✅ Deployment complete!
echo 🔗 Your Railway app URL will be shown above.
echo.
echo 📋 Next steps:
echo    1. Copy the Railway URL from above
echo    2. Add environment variables in Railway dashboard:
echo       - NODE_ENV=production
echo       - SUPABASE_URL=your-supabase-url
echo       - SUPABASE_ANON_KEY=your-supabase-key
echo       - CORS_ORIGIN=https://your-vercel-domain.vercel.app
echo    3. Update your Vercel environment variable: VITE_BLAST_API_URL
echo    4. Test the deployment with: ..\test-railway-health.bat
echo.
pause
