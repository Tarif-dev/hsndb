@echo off
echo 🔧 Quick Fix for Railway Deployment Error...
echo.

cd hsndb-blast-backend

echo 🗑️  Cleaning up failed deployment...
railway delete -y 2>nul

echo 📁 Ensuring files are ready...
if not exist "sequences.fasta" (
    echo Copying sequences.fasta...
    copy "..\sequences.fasta" "sequences.fasta"
)

echo 🐳 Using Docker deployment (more reliable)...
echo Current railway.json uses Docker builder
echo Current Dockerfile uses Alpine Linux + BLAST+

echo.
echo 🚀 Attempting deployment...
railway init
railway up

if errorlevel 1 (
    echo.
    echo ❌ Docker deployment failed. Trying fallback...
    echo.
    echo 🔄 Switching to simple Node.js deployment...
    
    REM Backup Docker files
    ren railway.json railway.json.bak
    ren Dockerfile Dockerfile.bak
    
    REM Try simple deployment
    railway up
    
    if errorlevel 1 (
        echo ❌ All deployment methods failed.
        echo.
        echo 🆘 Manual steps required:
        echo 1. Check Railway dashboard for error details
        echo 2. View logs: railway logs
        echo 3. Try deploying from Railway dashboard directly
        echo.
        
        REM Restore files
        ren railway.json.bak railway.json
        ren Dockerfile.bak Dockerfile
        
        pause
        exit /b 1
    )
)

echo.
echo ✅ Deployment successful!
echo 🔗 Check Railway dashboard for your app URL
echo.
echo 📋 Next steps:
echo 1. Add environment variables in Railway dashboard
echo 2. Test the health endpoint
echo 3. Update your Vercel environment variables
echo.
pause
