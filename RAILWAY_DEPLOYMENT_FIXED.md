# 🚀 HSNDB BLAST Railway Deployment Guide

## ✅ **READY TO DEPLOY - ISSUES FIXED!**

### What Was Fixed:

- ✅ **Docker Issue**: Switched from Alpine to Ubuntu base image
- ✅ **Package Names**: Using correct `ncbi-blast+` package
- ✅ **BLAST Path**: Updated to `/usr/bin/` for Ubuntu
- ✅ **Cleanup**: Removed unnecessary files and configurations
- ✅ **Fallback**: Added nixpacks fallback if Docker fails

## 🚀 **Deploy Now**

### Method 1: Automated Script (Recommended)

```bash
cd d:\hsndbSite
quick-fix-deployment.bat
```

### Method 2: Manual Steps

```bash
cd d:\hsndbSite\hsndb-blast-backend
railway login
railway init
railway up
```

## 📋 **After Deployment**

1. **Add Environment Variables** in Railway Dashboard:

   - `NODE_ENV=production`
   - `SUPABASE_URL=your-supabase-url`
   - `SUPABASE_ANON_KEY=your-supabase-key`
   - `CORS_ORIGIN=https://your-vercel-domain.vercel.app`

2. **Test Deployment**:

   ```bash
   test-railway-health.bat
   ```

3. **Update Vercel**:
   - Add `VITE_BLAST_API_URL=https://your-railway-url.railway.app/api`
   - Redeploy Vercel

## 🧪 **Expected Results**

- ✅ Health: `https://your-app.railway.app/api/health`
- ✅ Database: `https://your-app.railway.app/api/database/info`
- ✅ BLAST Search: Working from frontend

## 🛠️ **If Issues Persist**

1. **Check logs**: `railway logs`
2. **Verify files**: Ensure `sequences.fasta` exists in backend
3. **Environment vars**: Double-check all variables are set
4. **Fallback**: Script automatically tries nixpacks if Docker fails

The deployment should now work correctly with the Ubuntu-based Docker image!
