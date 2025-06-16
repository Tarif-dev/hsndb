# Use official Node.js runtime as base image
FROM node:18-alpine

# Install BLAST+ and other dependencies
RUN apk add --no-cache \
    blast+ \
    bash \
    curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create temp directory
RUN mkdir -p temp

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
