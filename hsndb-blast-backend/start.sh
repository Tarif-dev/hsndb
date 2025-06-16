#!/bin/bash

# Startup script for Railway deployment
echo "🚀 Starting HSNDB BLAST Backend..."

# Check if BLAST+ is available
if ! command -v blastp &> /dev/null; then
    echo "⚠️  BLAST+ not found. Attempting to install..."
    
    # Try to install BLAST+ via package manager
    if command -v apt-get &> /dev/null; then
        apt-get update && apt-get install -y ncbi-blast+
    elif command -v apk &> /dev/null; then
        apk add --no-cache blast+
    elif command -v yum &> /dev/null; then
        yum install -y ncbi-blast+
    else
        echo "❌ Unable to install BLAST+. Package manager not found."
        echo "Please ensure BLAST+ is available in the environment."
        exit 1
    fi
fi

# Verify BLAST+ installation
if command -v blastp &> /dev/null; then
    echo "✅ BLAST+ found at: $(which blastp)"
    blastp -version | head -1
else
    echo "❌ BLAST+ installation failed"
    exit 1
fi

# Start the Node.js application
echo "🎯 Starting Node.js server..."
exec node server.js
