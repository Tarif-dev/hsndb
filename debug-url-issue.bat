@echo off
echo ✅ URL Issue Fixed!
echo ==================
echo.

echo Previous issue: Frontend was calling /health instead of /api/health
echo Root cause: VITE_BLAST_API_URL in Vercel was missing /api
echo.

echo Your fix: Frontend now automatically adds /api if missing
echo Current Vercel setting: https://hsndb-backend-production.up.railway.app
echo Frontend will convert to: https://hsndb-backend-production.up.railway.app/api
echo.

echo Next steps:
echo 1. Deploy your frontend changes to Vercel
echo 2. Test at: https://hsndb-taupe.vercel.app
echo 3. Check browser console for:
echo    "🎯 Final Base URL: https://hsndb-backend-production.up.railway.app/api"
echo.

echo Alternative: Update Vercel environment variable to include /api
echo Go to Vercel → Settings → Environment Variables
echo Update VITE_BLAST_API_URL to: https://hsndb-backend-production.up.railway.app/api
echo.

echo ✅ Either approach will fix the issue!
pause

echo This means VITE_BLAST_API_URL is not set correctly in Vercel.
echo.

echo 📋 To fix this:
echo.
echo 1. Go to: https://vercel.com/dashboard
echo 2. Click your project
echo 3. Go to Settings → Environment Variables
echo 4. Add or update:
echo    Name: VITE_BLAST_API_URL
echo    Value: https://hsndb-backend-production.up.railway.app/api
echo    Environment: Production (and Preview if needed)
echo.
echo 5. Redeploy your Vercel site
echo.

echo 🧪 To test if the fix worked:
echo 1. Visit your site: https://hsndb-taupe.vercel.app
echo 2. Open developer tools (F12)
echo 3. Look for these console logs:
echo    - "🔗 BLAST API URL: https://hsndb-backend-production.up.railway.app/api"
echo    - "🔍 Checking server health: https://hsndb-backend-production.up.railway.app/api/health"
echo.

echo ✅ The updated code will now ensure /api is always included!
echo.
pause
