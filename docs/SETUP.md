# MCP Content Analyzer - Setup Guide

A comprehensive setup guide for the MCP Content Analyzer system.

## Prerequisites

- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **Claude Desktop** - [Download from claude.ai](https://claude.ai/download)
- **Git** (optional) - For cloning the repository

## Quick Setup

### 1. Automated Setup (Recommended)

```bash
# Clone the repository (if applicable)
git clone <repository-url>
cd mcp-content-analyzer

# Run the automated setup script
./scripts/setup.sh
```

The setup script will:
- ✅ Check Node.js version compatibility
- ✅ Install all dependencies
- ✅ Create necessary directories
- ✅ Build TypeScript
- ✅ Install Playwright browsers
- ✅ Generate Claude Desktop configuration
- ✅ Create default configuration files

### 2. Manual Setup

If you prefer manual setup or the script fails:

```bash
# 1. Install dependencies
npm install

# 2. Create directories
mkdir -p data logs config

# 3. Create environment file
cp .env.template .env

# 4. Build TypeScript
npm run build

# 5. Install Playwright browsers
npx playwright install chromium

# 6. Generate Claude Desktop config
./scripts/generate-config.sh

# 7. Type check
npm run type-check
```

## Configuration

### Environment Variables

Edit `.env` file with your preferences:

```bash
# Excel Database Configuration
EXCEL_DATABASE_PATH=./data/content-database.xlsx
EXCEL_BACKUP_ENABLED=true

# Server Configuration
MCP_SERVER_PORT=3000
LOG_LEVEL=info

# Team Configuration (for multi-user deployments)
TEAM_NAME=your-team-name

# Optional: Google Vision API (not required, Claude vision is used instead)
# GOOGLE_VISION_API_KEY=your-api-key
```

### Claude Desktop Integration

After running `./scripts/generate-config.sh`, your Claude Desktop configuration will be automatically updated at:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Important**: Restart Claude Desktop completely after configuration changes.

## Testing Setup

### Automated Testing

```bash
# Test all components
./scripts/test-connection.sh

# Manual server test
npm start
```

### Manual Testing in Claude Desktop

1. **Restart Claude Desktop** completely
2. **Test basic connection**:
   ```
   Please test the MCP connection by calling test_connection with message "Setup test"
   ```

3. **Verify all tools are available**:
   ```
   Can you get the server information using get_server_info?
   ```

4. **Test workflows**:
   ```
   Use analyze_content_workflow to process https://example.com with topic "Testing"
   ```

## Directory Structure

After setup, your directory structure should look like:

```
mcp-content-analyzer/
├── src/                    # TypeScript source code
├── dist/                   # Compiled JavaScript
├── data/                   # Excel database files
├── logs/                   # Application logs
├── config/                 # Configuration files
├── scripts/                # Setup and deployment scripts
├── docs/                   # Documentation
├── tests/                  # Test suites
├── .env                    # Environment configuration
├── package.json            # Dependencies and scripts
└── README.md              # Quick start guide
```

## Docker Setup (Optional)

For containerized deployment:

```bash
# Build and run with Docker
./scripts/docker-deploy.sh

# Or manually with docker-compose
docker-compose up -d

# View logs
docker logs -f mcp-content-analyzer
```

## Troubleshooting Setup

### Common Issues

1. **"spawn node ENOENT" errors**
   ```bash
   ./scripts/generate-config.sh  # Regenerate config with full Node.js path
   ```

2. **TypeScript compilation errors**
   ```bash
   npm run type-check  # Check for type errors
   rm -rf node_modules && npm install  # Reinstall dependencies
   ```

3. **Playwright browser errors**
   ```bash
   npx playwright install chromium  # Reinstall browsers
   ```

4. **Claude Desktop connection issues**
   - Ensure complete restart of Claude Desktop
   - Check config: `cat ~/Library/Application\ Support/Claude/claude_desktop_config.json`
   - Verify build: `npm run build`

### Debug Information

```bash
# Check server status
npm start

# View MCP logs
tail -f ~/Library/Logs/Claude/mcp-server-content-analyzer.log

# Test individual components
node -e "import('./dist/servers/excel-manager.js')"
```

## Development Setup

For development and customization:

```bash
# Development mode with hot reload
npm run dev

# Watch TypeScript compilation
npm run build -- --watch

# Run type checking
npm run type-check

# Test specific components
npm test
```

## Next Steps

After successful setup:

1. 📖 Read [USAGE.md](./USAGE.md) for detailed usage examples
2. 🔧 Review [API.md](./API.md) for tool specifications
3. 🚀 Try the example workflows
4. 🐛 If issues occur, check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## Support

- **Logs**: `~/Library/Logs/Claude/mcp-server-content-analyzer.log`
- **Configuration**: Generated by `./scripts/generate-config.sh`
- **Testing**: Run `./scripts/test-connection.sh`