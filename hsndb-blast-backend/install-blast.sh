#!/bin/bash

echo "🔍 Checking for BLAST+ installation..."

# Check if blastp exists
if command -v blastp >/dev/null 2>&1; then
    echo "✅ BLAST+ already installed"
    blastp -version | head -1
    exit 0
fi

echo "⚡ Installing BLAST+..."

# Detect OS and install accordingly
if [ -f /etc/debian_version ]; then
    # Debian/Ubuntu
    echo "📦 Detected Debian/Ubuntu system"
    apt-get update -qq
    apt-get install -y ncbi-blast+
elif [ -f /etc/redhat-release ]; then
    # RedHat/CentOS
    echo "📦 Detected RedHat/CentOS system"
    yum install -y ncbi-blast+
elif [ -f /etc/alpine-release ]; then
    # Alpine - install from source
    echo "📦 Detected Alpine system - installing from source"
    apk add --no-cache wget tar
    cd /tmp
    wget -q https://ftp.ncbi.nlm.nih.gov/blast/executables/blast+/LATEST/ncbi-blast-2.15.0+-x64-linux.tar.gz
    tar -xzf ncbi-blast-2.15.0+-x64-linux.tar.gz
    cp ncbi-blast-2.15.0+/bin/* /usr/local/bin/
    chmod +x /usr/local/bin/*
    rm -rf ncbi-blast-*
else
    echo "❓ Unknown OS - trying to install from source"
    cd /tmp
    wget -q https://ftp.ncbi.nlm.nih.gov/blast/executables/blast+/LATEST/ncbi-blast-2.15.0+-x64-linux.tar.gz
    tar -xzf ncbi-blast-2.15.0+-x64-linux.tar.gz
    cp ncbi-blast-2.15.0+/bin/* /usr/local/bin/
    chmod +x /usr/local/bin/*
    rm -rf ncbi-blast-*
fi

echo "✅ BLAST+ installation complete"
if command -v blastp >/dev/null 2>&1; then
    blastp -version | head -1
else
    echo "⚠️  Warning: BLAST+ may not be in PATH"
    echo "Available binaries:"
    find /usr -name "blastp" 2>/dev/null || echo "No blastp found"
fi
