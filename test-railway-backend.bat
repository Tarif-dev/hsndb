@echo off
echo 🧪 Testing Your Railway Backend
echo ================================
echo.
echo Your Railway URL: https://hsndb-backend-production.up.railway.app
echo.

echo 1. 🏥 Testing Health Endpoint...
curl -s -w "HTTP Status: %%{http_code}\n" "https://hsndb-backend-production.up.railway.app/api/health"
echo.

echo 2. 🗄️  Testing Database Info...
curl -s -w "HTTP Status: %%{http_code}\n" "https://hsndb-backend-production.up.railway.app/api/database/info"
echo.

echo 3. 📋 Testing Jobs Endpoint...
curl -s -w "HTTP Status: %%{http_code}\n" "https://hsndb-backend-production.up.railway.app/api/blast/jobs"
echo.

echo 4. 🧬 Testing BLAST Search...
echo Submitting test protein sequence...
curl -X POST "https://hsndb-backend-production.up.railway.app/api/blast/submit" ^
  -H "Content-Type: application/json" ^
  -d "{\"sequence\":\"MKFFVLRQVGGAKDFVPAGTAQDAIAKLGGQVTLVTHSARAIAQAALAGEGTKVLVTVDTDVTGDALLKEGVVLFRFVDNVGFGARVFKDP\",\"algorithm\":\"blastp\",\"evalue\":10,\"maxTargetSeqs\":10}" ^
  -w "HTTP Status: %%{http_code}\n"
echo.

echo.
echo ✅ If all tests show HTTP Status: 200, your backend is working!
echo ❌ If you see errors, check Railway logs: railway logs
echo.
pause
