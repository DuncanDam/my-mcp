#!/bin/bash

# Docker deployment script for MCP Content Analyzer
set -e

echo "🚀 Starting Docker deployment for MCP Content Analyzer..."

# Configuration
CONTAINER_NAME="mcp-content-analyzer"
IMAGE_NAME="mcp-content-analyzer:latest"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data logs config

# Set up environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.template .env
    echo "⚠️  Please update .env file with your configuration before running the container."
fi

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t $IMAGE_NAME .

# Stop and remove existing container if it exists
if docker ps -a --format 'table {{.Names}}' | grep -q $CONTAINER_NAME; then
    echo "🛑 Stopping existing container..."
    docker stop $CONTAINER_NAME
    echo "🗑️  Removing existing container..."
    docker rm $CONTAINER_NAME
fi

# Run the container
echo "🏃 Starting new container..."
docker run -d \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    -p 3000:3000 \
    -v "$(pwd)/data:/app/data" \
    -v "$(pwd)/logs:/app/logs" \
    -v "$(pwd)/config:/app/config:ro" \
    --env-file .env \
    $IMAGE_NAME

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 5

# Check container status
if docker ps --format 'table {{.Names}}\t{{.Status}}' | grep -q $CONTAINER_NAME; then
    echo "✅ Container is running successfully!"
    echo ""
    echo "📊 Container Information:"
    docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep $CONTAINER_NAME
    echo ""
    echo "📝 To view logs: docker logs -f $CONTAINER_NAME"
    echo "🛑 To stop: docker stop $CONTAINER_NAME"
    echo "🔍 To inspect: docker exec -it $CONTAINER_NAME sh"
    echo ""
    echo "🌐 Hono server available at: http://localhost:3000"
    echo "💾 Excel data in: $(pwd)/data/"
    echo "📋 Logs in: $(pwd)/logs/"
else
    echo "❌ Container failed to start. Check logs:"
    docker logs $CONTAINER_NAME
    exit 1
fi