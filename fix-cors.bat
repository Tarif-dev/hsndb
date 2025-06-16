@echo off
echo 🔧 Quick CORS Fix for Railway Backend
echo =====================================
echo.

cd /d "d:\hsndbSite\hsndb-blast-backend"

echo 1. Setting correct CORS origin...
railway variables --set "CORS_ORIGIN=https://hsndb-taupe.vercel.app,https://hsndb-site.vercel.app,https://vercel.app"

echo.
echo 2. Checking current variables...
railway variables

echo.
echo 3. Backend should automatically redeploy with new CORS settings...
echo Wait 2-3 minutes for deployment to complete.

echo.
echo 4. Test CORS:
echo Visit: https://hsndb-taupe.vercel.app
echo Open developer tools (F12)
echo Check console for CORS errors

echo.
echo ✅ CORS fix applied!
echo If you still see CORS errors, wait for deployment to complete.
pause
