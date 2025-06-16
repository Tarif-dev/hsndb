# 🚀 Railway Deployment Guide for HSNDB BLAST Backend

## 🛠️ DEPLOYMENT FIXES APPLIED

### Issues Fixed:

- ✅ Updated nixpacks.toml with correct package names (`ncbi-blast+` instead of `blast-plus`)
- ✅ Added Docker-based deployment as primary method
- ✅ Fixed config.js BLAST_BIN_PATH for Alpine Linux
- ✅ Added comprehensive error handling
- ✅ Created fallback deployment methods

### Current Setup:

- **Primary**: Docker deployment with Alpine Linux + BLAST+
- **Fallback**: Nixpacks with corrected configuration
- **Emergency**: Simple Node.js with runtime BLAST+ installation

## 🔧 TROUBLESHOOTING THE BUILD ERROR

The error you encountered was caused by:

1. Incorrect package name in nixpacks.toml (`blast-plus` vs `ncbi-blast+`)
2. Nix environment setup issues
3. Package installation conflicts

### Fixed Configuration:

- `nixpacks.toml`: Updated to use `ncbi-blast+`
- `Dockerfile`: Uses Alpine Linux with `blast+` package
- `railway.json`: Now uses Docker builder for reliability

## 🚀 DEPLOYMENT OPTIONS (Try in order)

### Option 1: Docker Deployment (Recommended)

```bash
cd hsndb-blast-backend
railway up
```

This uses the Dockerfile which is more reliable.

### Option 2: Delete and Retry

If you have deployment issues:

```bash
# Delete the failed deployment
railway delete

# Redeploy
railway init
railway up
```

### Option 3: Simple Node.js

If Docker fails:

```bash
# Remove Docker files
del railway.json
del Dockerfile

# Let Railway auto-detect
railway up
```

## Prerequisites

- Node.js 18+ installed
- Git repository (GitHub recommended)
- Railway account (https://railway.app)

## Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

## Step 2: Login to Railway

```bash
railway login
```

This will open your browser for authentication.

## Step 3: Deploy Backend

Navigate to the backend directory and deploy:

```bash
cd hsndb-blast-backend
railway init
railway up
```

## Step 4: Configure Environment Variables

In the Railway dashboard, add these environment variables:

### Required Variables:

- `NODE_ENV=production`
- `SUPABASE_URL=your-supabase-url`
- `SUPABASE_ANON_KEY=your-supabase-anon-key`
- `CORS_ORIGIN=https://your-vercel-domain.vercel.app`

### Optional Variables:

- `BLAST_BIN_PATH=/nix/store/` (auto-detected)
- `PORT=3001` (Railway auto-assigns)

## Step 5: Update Frontend Configuration

1. Copy your Railway URL from the deployment
2. In Vercel dashboard, add environment variable:
   - `VITE_BLAST_API_URL=https://your-railway-app.railway.app/api`
3. Redeploy your Vercel app

## Step 6: Test Deployment

1. Check health endpoint: `https://your-railway-app.railway.app/api/health`
2. Test database info: `https://your-railway-app.railway.app/api/database/info`
3. Test BLAST search from your frontend

## Troubleshooting

### CORS Issues

- Ensure your Vercel domain is added to `CORS_ORIGIN`
- Check both production and preview URLs

### BLAST Not Found

- Railway automatically installs BLAST+ via nixpacks.toml
- Check Railway logs for any installation issues

### Database Issues

- Verify sequences.fasta was copied to backend directory
- Check Railway logs during startup

## Monitoring

- View logs: `railway logs`
- Monitor metrics in Railway dashboard
- Set up alerts for downtime

## Estimated Costs

- Railway: ~$5-10/month for basic usage
- Scales automatically with traffic

## Support

Check Railway documentation: https://docs.railway.app
