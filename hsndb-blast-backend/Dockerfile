# Use Ubuntu-based Node.js image (has ncbi-blast+ package)
FROM node:18-slim

# Install system dependencies and BLAST+
RUN apt-get update && \
    apt-get install -y \
    ncbi-blast+ \
    curl \
    wget \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/temp /app/blastdb

# Set environment variables
ENV NODE_ENV=production
ENV BLAST_BIN_PATH=/usr/bin/
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
