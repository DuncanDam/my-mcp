#!/bin/bash

# Test MCP Content Analyzer connection and functionality
set -e

echo "🔍 Testing MCP Content Analyzer..."

# Check if server is built
if [ ! -d "dist" ]; then
    echo "❌ Server not built. Run 'npm run build' first."
    exit 1
fi

# Check if Claude Desktop config exists
CLAUDE_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
if [ ! -f "$CLAUDE_CONFIG" ]; then
    echo "❌ Claude Desktop configuration not found. Run './scripts/generate-config.sh' first."
    exit 1
fi

echo "✅ Build directory exists"
echo "✅ Claude Desktop configuration found"

# Test TypeScript compilation
echo "🔍 Testing TypeScript compilation..."
npm run type-check
echo "✅ TypeScript compilation successful"

# Test Node.js imports
echo "🔍 Testing Node.js module imports..."
node -e "
  import('./dist/index.js')
    .then(() => console.log('✅ Module imports successful'))
    .catch(err => {
      console.error('❌ Module import failed:', err.message);
      process.exit(1);
    });
" --input-type=module

# Check dependencies
echo "🔍 Checking critical dependencies..."
node -e "
  try {
    require('@modelcontextprotocol/sdk/server/index.js');
    require('pdfjs-dist');
    require('mammoth');
    require('playwright');
    require('exceljs');
    console.log('✅ All critical dependencies available');
  } catch (err) {
    console.error('❌ Dependency check failed:', err.message);
    process.exit(1);
  }
"

# Test data directory
echo "🔍 Testing data directory..."
if [ ! -d "data" ]; then
    mkdir -p data
    echo "✅ Created data directory"
else
    echo "✅ Data directory exists"
fi

# Test logs directory
echo "🔍 Testing logs directory..."
if [ ! -d "logs" ]; then
    mkdir -p logs
    echo "✅ Created logs directory"
else
    echo "✅ Logs directory exists"
fi

# Test environment configuration
echo "🔍 Testing environment configuration..."
if [ -f ".env" ]; then
    echo "✅ Environment file exists"
else
    cp .env.template .env
    echo "✅ Created environment file from template"
fi

# Test Playwright browser installation
echo "🔍 Testing Playwright browser..."
if npx playwright --version > /dev/null 2>&1; then
    echo "✅ Playwright installed"

    # Check if chromium is available
    node -e "
      import('./dist/servers/web-scraper.js')
        .then(module => {
          console.log('✅ Web scraper module loadable');
        })
        .catch(err => {
          console.log('⚠️  Web scraper may need browser installation');
          console.log('Run: npx playwright install chromium');
        });
    " --input-type=module
else
    echo "⚠️  Playwright not found. Web scraping may not work."
fi

echo ""
echo "🎯 Connection Test Summary:"
echo "✅ TypeScript compilation"
echo "✅ Node.js module loading"
echo "✅ Dependencies available"
echo "✅ Directory structure"
echo "✅ Configuration files"
echo ""
echo "📋 Manual Testing Steps:"
echo "1. Restart Claude Desktop completely"
echo "2. In Claude Desktop, try:"
echo '   "Please test the MCP connection by calling test_connection with message \"Test from script\""'
echo '   "Can you get the server information using get_server_info?"'
echo ""
echo "🚀 If manual tests work, the MCP server is ready!"
echo "📊 Monitor logs: tail -f ~/Library/Logs/Claude/mcp-server-content-analyzer.log"