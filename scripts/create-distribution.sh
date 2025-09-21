#!/bin/bash

# Create distribution package for team sharing
echo "📦 Creating distribution package..."

# Build the project
npm run build

# Create distribution directory
rm -rf dist-package
mkdir -p dist-package

# Copy necessary files (exclude node_modules, data, logs)
rsync -av --progress . dist-package/ \
  --exclude node_modules \
  --exclude data \
  --exclude logs \
  --exclude .git \
  --exclude dist-package \
  --exclude "*.log"

# Create installation script
cat > dist-package/INSTALL.md << 'EOF'
# 🚀 MCP Content Analyzer - Team Installation

## Quick Install (2 minutes)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install globally:**
   ```bash
   npm install -g .
   ```

3. **Setup and configure:**
   ```bash
   mcp-content-analyzer setup
   mcp-content-analyzer config
   ```

4. **Restart Claude Desktop completely**

5. **Start the analyzer:**
   ```bash
   mcp-content-analyzer start
   ```

## Test Installation
```bash
mcp-content-analyzer test
```

## Available Commands
- `mcp-content-analyzer start` - Start the server
- `mcp-content-analyzer test` - Test connection
- `mcp-content-analyzer help` - Show all commands

## Support
Contact team lead if you have issues!
EOF

# Create version info
echo "$(date '+%Y-%m-%d %H:%M:%S') - v$(node -p "require('./package.json').version")" > dist-package/VERSION.txt

# Create zip file
zip -r "mcp-content-analyzer-v$(node -p "require('./package.json').version").zip" dist-package/

echo "✅ Distribution package created!"
echo "📁 File: mcp-content-analyzer-v$(node -p "require('./package.json').version").zip"
echo ""
echo "📤 Share this zip file with your team members"
echo "📋 They should extract it and follow INSTALL.md"

# Cleanup
rm -rf dist-package