@echo off
echo 🔧 HSNDB BLAST Railway Deployment Fix
echo =====================================
echo.

cd /d "d:\hsndbSite\hsndb-blast-backend"

echo �️  Checking required files...
if not exist "sequences.fasta" (
    echo 📋 Copying sequences.fasta from parent directory...
    copy "..\sequences.fasta" "sequences.fasta" >nul
    if errorlevel 1 (
        echo ❌ Failed to copy sequences.fasta
        pause
        exit /b 1
    )
    echo ✅ sequences.fasta copied successfully
) else (
    echo ✅ sequences.fasta already exists
)

if not exist "server.js" (
    echo ❌ server.js not found! Please check your backend directory.
    pause
    exit /b 1
)

if not exist "package.json" (
    echo ❌ package.json not found! Please check your backend directory.
    pause
    exit /b 1
)

echo.
echo 🚀 Attempting Railway deployment...
echo Method: Docker with Ubuntu base image
echo.

REM Clean up any previous failed deployments
railway delete -y 2>nul

echo 🔑 Initializing Railway project...
railway init
if errorlevel 1 (
    echo ❌ Railway initialization failed
    pause
    exit /b 1
)

echo 📦 Deploying to Railway...
railway up
if errorlevel 1 (
    echo.
    echo ❌ Docker deployment failed! Trying fallback method...
    echo.
    echo 🔄 Switching to Nixpacks (no Docker)...
    
    REM Use fallback configuration
    if exist "railway-fallback.json" (
        move "railway.json" "railway-docker.json.bak" >nul
        move "railway-fallback.json" "railway.json" >nul
        echo ✅ Switched to fallback configuration
        
        echo 🚀 Retrying deployment...
        railway up
        if errorlevel 1 (
            echo ❌ Fallback deployment also failed
            echo.
            echo 🆘 Manual intervention required:
            echo 1. Check Railway dashboard for detailed logs
            echo 2. Try: railway logs
            echo 3. Verify environment variables are set
            echo.
            
            REM Restore original configuration
            move "railway.json" "railway-fallback.json" >nul
            move "railway-docker.json.bak" "railway.json" >nul
            
            pause
            exit /b 1
        )
    ) else (
        echo ❌ Fallback configuration not found
        pause
        exit /b 1
    )
)

echo.
echo ✅ Deployment successful!
echo.
echo � Next steps:
echo 1. 🔗 Copy your Railway URL from above
echo 2. 🌐 Add environment variables in Railway dashboard:
echo    - NODE_ENV=production
echo    - SUPABASE_URL=your-supabase-url
echo    - SUPABASE_ANON_KEY=your-supabase-key
echo    - CORS_ORIGIN=https://your-vercel-domain.vercel.app
echo 3. 🧪 Test: https://your-railway-url.railway.app/api/health
echo 4. 📊 Update Vercel with VITE_BLAST_API_URL
echo.
echo 🎉 Deployment complete!
pause
