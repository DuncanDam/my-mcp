#!/bin/bash

# Complete setup script for MCP Content Analyzer
set -e

echo "🚀 Setting up MCP Content Analyzer..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data logs config

# Set up environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.template .env
    echo "⚠️  Please update .env file with your configuration."
fi

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Type check
echo "🔍 Running type check..."
npm run type-check

# Install Playwright browsers
echo "🎭 Installing Playwright browsers..."
npx playwright install chromium

# Create default Excel structure
echo "📊 Setting up Excel database..."
if [ ! -f data/content-database.xlsx ]; then
    echo "Creating default Excel database structure..."
    # This will be created automatically when the server starts
fi

# Generate Claude Desktop configuration
echo "⚙️ Generating Claude Desktop configuration..."
node scripts/generate-config.js

# Create default topic categories
echo "📝 Creating default configuration files..."
cat > config/topics-template.json << 'EOF'
{
  "categories": [
    {
      "category": "AI Research",
      "description": "Artificial Intelligence research and developments",
      "keywords": "ai, artificial intelligence, machine learning, neural networks"
    },
    {
      "category": "Technology Trends",
      "description": "Latest technology trends and innovations",
      "keywords": "tech, innovation, trends, digital transformation"
    },
    {
      "category": "Business Strategy",
      "description": "Business strategy and management insights",
      "keywords": "business, strategy, management, leadership"
    },
    {
      "category": "Web Content",
      "description": "General web content and articles",
      "keywords": "web, content, articles, news"
    },
    {
      "category": "Document Analysis",
      "description": "Analysis of documents and files",
      "keywords": "documents, files, analysis, reports"
    }
  ]
}
EOF

# Create Excel schema documentation
cat > config/excel-schema.json << 'EOF'
{
  "worksheets": {
    "Content Database": {
      "columns": [
        { "name": "Date Added", "type": "string", "description": "Date when content was added" },
        { "name": "Source URL", "type": "string", "description": "Original URL or file path" },
        { "name": "Title", "type": "string", "description": "Content title" },
        { "name": "Summary", "type": "string", "description": "Content summary" },
        { "name": "Topic Category", "type": "string", "description": "Content category" },
        { "name": "Key Points", "type": "string", "description": "Key insights and metadata" },
        { "name": "Status", "type": "string", "description": "Processing status" }
      ]
    },
    "Topics": {
      "columns": [
        { "name": "Category", "type": "string", "description": "Topic category name" },
        { "name": "Description", "type": "string", "description": "Category description" },
        { "name": "Keywords", "type": "string", "description": "Related keywords" }
      ]
    }
  }
}
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env file with your configuration (if needed)"
echo "2. Restart Claude Desktop to load MCP configuration"
echo "   → The MCP server will start automatically when Claude Desktop loads"
echo "3. Test the connection in Claude Desktop with:"
echo '   "Please test the MCP connection by calling test_connection"'
echo ""
echo "📖 Documentation:"
echo "- README.md - Quick start guide"
echo "- docs/ - Detailed documentation"
echo ""
echo "🎯 Test commands in Claude Desktop:"
echo '  "Please test the MCP connection by calling test_connection"'
echo '  "Get server information using get_server_info"'
echo '  "Analyze content from https://example.com using analyze_content_workflow"'