# Alternative Railway Deployment (Simple Node.js)

# Remove Docker approach if it's causing issues
rm railway.json
rm Dockerfile
rm .dockerignore

# Use Railway's automatic Node.js detection
railway up

# Railway will automatically:
# 1. Detect it's a Node.js app
# 2. Run npm install
# 3. Start with the "start" script from package.json
