
# Deployment Guide for HSNDB

This guide covers different deployment strategies for the HSNDB application with BLAST backend.

## Option 1: Separate Deployment (Recommended)

### Frontend Deployment (Vercel/Netlify)

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

3. **Or deploy to Netlify:**
   - Connect your GitHub repo to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

### Backend Deployment (Railway/Render)

1. **Railway Deployment:**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Navigate to backend directory
   cd hsndb-blast-backend
   
   # Deploy
   railway login
   railway init
   railway up
   ```

2. **Environment Variables:**
   Set these in your hosting platform:
   ```
   NODE_ENV=production
   PORT=3001
   BLAST_BIN_PATH=/usr/local/bin/
   ```

## Option 2: Docker Deployment

Create these files in your project root:

**Dockerfile.frontend:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "run", "preview"]
```

**Dockerfile.backend:**
```dockerfile
FROM node:18-alpine
RUN apk add --no-cache blast+
WORKDIR /app
COPY hsndb-blast-backend/package*.json ./
RUN npm install
COPY hsndb-blast-backend/ .
COPY sequences.fasta /app/sequences.fasta
EXPOSE 3001
CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "8080:8080"
    depends_on:
      - backend

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3001:3001"
    volumes:
      - ./sequences.fasta:/app/sequences.fasta
    environment:
      - NODE_ENV=production
      - BLAST_BIN_PATH=/usr/bin/
```

## Option 3: Single VPS Deployment

1. **Setup on Ubuntu/Debian VPS:**
   ```bash
   # Install Node.js and BLAST+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs blast2
   
   # Install PM2
   sudo npm install -g pm2
   ```

2. **Deploy application:**
   ```bash
   # Clone repository
   git clone <your-repo>
   cd your-project
   
   # Install dependencies
   npm install
   cd hsndb-blast-backend && npm install && cd ..
   
   # Build frontend
   npm run build
   
   # Create PM2 ecosystem file
   ```

3. **ecosystem.config.js:**
   ```javascript
   module.exports = {
     apps: [
       {
         name: 'hsndb-frontend',
         script: 'npx',
         args: 'serve -s dist -l 8080',
         cwd: './',
         instances: 1,
         autorestart: true,
         watch: false,
         max_memory_restart: '1G',
       },
       {
         name: 'hsndb-backend',
         script: 'server.js',
         cwd: './hsndb-blast-backend',
         instances: 1,
         autorestart: true,
         watch: false,
         max_memory_restart: '1G',
         env: {
           NODE_ENV: 'production',
           PORT: 3001,
           BLAST_BIN_PATH: '/usr/bin/'
         }
       }
     ]
   };
   ```

4. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

5. **Nginx Configuration:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Frontend
       location / {
           proxy_pass http://localhost:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:3001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## Production Considerations

1. **BLAST+ Installation:**
   - Ensure BLAST+ binaries are installed on production server
   - Update `BLAST_BIN_PATH` in config accordingly

2. **File Permissions:**
   - Ensure the backend can read the FASTA file
   - Create writable temp directory for BLAST operations

3. **Environment Variables:**
   - Set `NODE_ENV=production`
   - Configure proper CORS origins
   - Set appropriate memory limits

4. **Monitoring:**
   - Use PM2 for process monitoring
   - Set up log rotation
   - Monitor disk space for temp files

5. **SSL/HTTPS:**
   - Use Certbot for Let's Encrypt certificates
   - Configure Nginx for HTTPS redirect

## Recommended Architecture

For production, I recommend:

- **Frontend**: Vercel/Netlify (CDN, automatic scaling)
- **Backend**: Railway/Render (managed Node.js hosting)
- **Database**: Supabase (already configured)
- **Monitoring**: Sentry for error tracking

This provides the best balance of performance, cost, and maintainability.
