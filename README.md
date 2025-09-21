# MCP Content Analyzer ✅ COMPLETE

A comprehensive MCP (Model Context Protocol) server system built with Hono and TypeScript that enables Claude to automatically scrape web content, process documents, analyze screenshots, and manage local Excel databases with intelligent content workflows.

## 🚀 ALL PHASES COMPLETE - Production Ready System ✅

**Complete content analysis pipeline** with web scraping, document processing, Excel database management, Docker deployment, and comprehensive documentation.

## ⚡ Quick Start (2 Minutes) - Easy Distribution

### 🚀 Recommended: Direct Installation (Bypasses npm cache issues)
```bash
# 1. Download and run the installation script
curl -fsSL https://raw.githubusercontent.com/DuncanDam/my-mcp/main/install.sh | bash

# 2. Setup dependencies and configuration (run once)
mcp-content-analyzer setup
mcp-content-analyzer config

# 3. Restart Claude Desktop completely

# 4. Start the analyzer
mcp-content-analyzer start
```

### 🔧 Alternative: Direct npm installation (may have cache issues)
```bash
# Note: Some users experience npm cache corruption with this method
npm install -g git+https://github.com/DuncanDam/my-mcp.git

# If the above fails, use the installation script method above instead
```

### Traditional Setup:
1. **Automated Setup**:
   ```bash
   ./scripts/setup.sh
   ```

2. **Restart Claude Desktop** completely

3. **Test in Claude Desktop**:
   ```
   Please test the MCP connection by calling test_connection with message "Hello MCP!"
   ```

4. **Try the main workflow**:
   ```
   Use analyze_content_workflow to process https://example.com with topic "Testing"
   ```

## 🛠️ Complete Tool Suite

### 🌊 Main Workflow Tools (Recommended)
- `analyze_content_workflow` - **Complete content analysis pipeline** with intelligent fallback
- `scrape_and_save_content` - Web scraping workflow with Excel integration

### 🔧 System Tools
- `test_connection` - Test MCP server connectivity
- `get_server_info` - Get comprehensive server information

### 🕸️ Web Processing
- `scrape_webpage` - Extract content from URLs with metadata
- `check_url_accessibility` - Validate URLs before processing

### 📄 Document Processing
- `read_document` - Extract content from PDF, DOCX, TXT, RTF files
- `analyze_document_metadata` - Get document properties and structure
- `extract_document_text` - Pure text extraction with formatting
- `process_extracted_text` - Process Claude-extracted text from images

### 📊 Excel Database
- `add_content_entry` - Add new entries to Excel database
- `search_similar_content` - Find related existing content
- `get_topic_categories` - Retrieve available topic categories
- `get_database_stats` - Return database metrics and analytics

## 📚 Comprehensive Documentation

- **[DISTRIBUTION.md](./DISTRIBUTION.md)** - **🚀 Easy team distribution guide (recommended)**
- **[COMPLETE-GUIDE.md](./COMPLETE-GUIDE.md)** - Complete testing and usage guide
- **[docs/SETUP.md](./docs/SETUP.md)** - Detailed setup instructions
- **[docs/USAGE.md](./docs/USAGE.md)** - Usage examples and workflows

## 🚢 Deployment Options

### Local Development
```bash
npm run build    # Build TypeScript
npm start       # Run MCP server
npm run dev     # Development mode with hot reload
```

### Docker Deployment
```bash
./scripts/docker-deploy.sh    # Complete Docker setup
docker-compose up -d          # Manual Docker Compose
```

### Production Scripts
```bash
./scripts/setup.sh           # Complete automated setup
./scripts/test-connection.sh # Comprehensive testing
./scripts/generate-config.sh # Claude Desktop configuration
```

## 🎯 Complete Workflow Examples

### Example 1: Web Content Analysis
```
Use analyze_content_workflow to process https://techcrunch.com/ai-news with topic "AI News"
```

### Example 2: Document Processing
```
Use analyze_content_workflow to process /path/to/research-paper.pdf with topic "Research"
```

### Example 3: Screenshot Analysis
Share a screenshot with Claude, then:
```
Use analyze_content_workflow with the text you extracted from that screenshot, sourceDescription "Quarterly report slides", and topic "Business Reports"
```

## 🏗️ System Architecture

**Complete 7-Phase Implementation:**
- ✅ **Phase 1**: Basic MCP server foundation
- ✅ **Phase 2**: Excel database operations
- ✅ **Phase 3**: Web scraping with Playwright
- ✅ **Phase 4**: Document processing (PDF, DOCX, TXT, RTF)
- ✅ **Phase 5**: Complete workflow & Hono integration
- ✅ **Phase 6**: Docker & production setup
- ✅ **Phase 7**: Documentation & testing suite

## 🔧 Technical Stack

- **Framework**: Hono (ultra-fast web framework)
- **Runtime**: Node.js 18+ with TypeScript
- **MCP SDK**: @modelcontextprotocol/sdk
- **Web Scraping**: Playwright + Cheerio
- **Document Processing**: PDF.js, mammoth (DOCX), fs (TXT)
- **Database**: ExcelJS for local Excel file management
- **Validation**: Zod schemas with type safety
- **Containerization**: Docker + Docker Compose
- **Vision Processing**: Claude's native capabilities (no external APIs needed)

## 🛡️ Security & Production Features

- Multi-stage Docker builds with security best practices
- File validation and path traversal protection
- Resource limits and health checks
- Comprehensive error handling and logging
- Type-safe operations throughout
- No external API dependencies for core functionality

## 📊 Performance & Monitoring

- Tool response time: < 5 seconds for web scraping
- Document processing: < 3 seconds for small files, < 10 seconds for large files
- Excel operations: < 1 second for database queries
- Memory usage: < 512MB base, < 1GB with browsers
- Health check endpoints and comprehensive logging

## 🆘 Support & Troubleshooting

- **Quick Test**: Run `./scripts/test-connection.sh`
- **Logs**: `tail -f ~/Library/Logs/Claude/mcp-server-content-analyzer.log`
- **Health Check**: `curl http://localhost:3000/health` (if using Hono)
- **Documentation**: See [COMPLETE-GUIDE.md](./COMPLETE-GUIDE.md) for comprehensive testing

## ✅ Success Criteria

Your system is working correctly if:
- ✅ All system tools respond (`test_connection`, `get_server_info`)
- ✅ Web scraping works with real URLs
- ✅ Document processing handles PDF, DOCX, TXT files
- ✅ Claude vision integration processes screenshots
- ✅ Excel database saves and retrieves content
- ✅ Complete workflows execute end-to-end

**Ready for production use! 🚀**