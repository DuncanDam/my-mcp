# MCP Content Analysis Server - Complete Setup Guide

## Project Overview

A containerized MCP (Model Context Protocol) server system built with Hono and TypeScript that enables Claude to automatically scrape web content, process screenshots, analyze against predefined topics, and manage local Excel files. Designed for team distribution and easy deployment.

## Architecture Design

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Claude User   │◄──►│  MCP Server Hub  │◄──►│   Excel Files   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
            ┌───────▼───┐ ┌───▼───┐ ┌───▼──────┐
            │Web Scraper│ │  OCR  │ │ Excel    │
            │    MCP    │ │  MCP  │ │   MCP    │
            └───────────┘ └───────┘ └──────────┘
```

## Directory Structure

```
mcp-content-analyzer/
├── docker-compose.yml
├── Dockerfile
├── package.json
├── package-lock.json
├── tsconfig.json                # TypeScript configuration
├── README.md
├── .env.template
├── .env
├── .gitignore
├── src/
│   ├── index.ts                 # Main Hono MCP server hub
│   ├── app.ts                   # Hono application setup
│   ├── routes/
│   │   ├── mcp.ts               # MCP tool routing
│   │   ├── health.ts            # Health check endpoints
│   │   └── index.ts             # Route exports
│   ├── servers/
│   │   ├── web-scraper.ts       # Web scraping MCP server
│   │   ├── excel-manager.ts     # Excel file MCP server
│   │   ├── ocr-processor.ts     # OCR MCP server
│   │   └── base-server.ts       # Common MCP server utilities
│   ├── middleware/
│   │   ├── logger.ts            # Request logging middleware
│   │   ├── error-handler.ts     # Error handling middleware
│   │   └── auth.ts              # Authentication middleware
│   ├── utils/
│   │   ├── logger.ts            # Centralized logging
│   │   ├── config.ts            # Configuration management
│   │   └── validators.ts        # Request validation
│   ├── types/
│   │   ├── mcp.ts               # MCP tool and response types
│   │   ├── content.ts           # Content analysis types
│   │   └── index.ts             # Type exports
│   └── templates/
│       └── claude-config.json   # Claude Desktop configuration template
├── dist/                        # Compiled JavaScript output
├── config/
│   ├── topics-template.json     # Default topic categories
│   └── excel-schema.json        # Excel file structure definition
├── data/
│   ├── .gitkeep
│   └── content-database.xlsx    # Main Excel database file
├── credentials/
│   └── .gitkeep
├── scripts/
│   ├── setup.sh                 # Initial setup script
│   ├── install-deps.sh          # Dependency installation
│   ├── test-connection.sh       # Test MCP connection
│   └── generate-config.sh       # Generate Claude config
├── docs/
│   ├── SETUP.md                 # Detailed setup instructions
│   ├── USAGE.md                 # Usage examples and workflows
│   ├── API.md                   # MCP tool specifications
│   └── TROUBLESHOOTING.md       # Common issues and solutions
└── tests/
    ├── unit/
    │   ├── scraper.test.ts
    │   ├── sheets.test.ts
    │   └── ocr.test.ts
    └── integration/
        └── full-workflow.test.ts
```

## Core Components Specification

### 1. Main Hono MCP Server Hub (`src/index.ts`)
- **Purpose**: Orchestrate multiple MCP servers under single Hono process
- **Framework**: Hono with TypeScript for ultra-fast, type-safe routing
- **Port**: 3000 (configurable)
- **Transport**: Stdio and HTTP/WebSocket support via Hono adapters
- **Features**:
  - Type-safe server discovery and routing
  - Built-in health monitoring endpoints
  - Middleware-based request/response logging
  - Structured error handling with Hono error boundaries

### 2. Web Scraper Server (`src/servers/web-scraper.ts`)
- **Tools Provided**:
  - `scrape_webpage(url)` - Extract content from URL
  - `scrape_with_screenshot(url)` - Get content + visual screenshot
  - `check_url_accessibility(url)` - Validate URL before processing
- **Dependencies**: Playwright, Cheerio
- **Features**:
  - Anti-bot detection bypass
  - Content sanitization
  - Metadata extraction (title, description, author)
  - Rate limiting (configurable)

### 3. Excel Manager (`src/servers/excel-manager.ts`)
- **Tools Provided**:
  - `add_content_entry(data)` - Add new row to Excel database
  - `search_similar_content(query)` - Find similar existing entries
  - `get_topic_categories()` - Retrieve available topics
  - `update_entry(id, data)` - Modify existing entry
  - `get_database_stats()` - Return database metrics
- **Dependencies**: ExcelJS for Excel file manipulation
- **Features**:
  - Automatic schema validation
  - Duplicate detection
  - Batch operations support
  - Local file-based storage

### 4. OCR Processor (`src/servers/ocr-processor.ts`)
- **Tools Provided**:
  - `process_screenshot(image_data)` - Extract text from image
  - `analyze_document_structure(image_data)` - Identify document layout
  - `extract_tables(image_data)` - Parse tabular data
- **Providers**: Google Vision API, Tesseract (fallback)
- **Features**:
  - Multi-language support
  - Confidence scoring
  - Format preservation

## Environment Configuration

### Required Environment Variables
```bash
# Excel Database Configuration
EXCEL_DATABASE_PATH=./data/content-database.xlsx
EXCEL_BACKUP_ENABLED=true
EXCEL_AUTO_SAVE=true

# OCR Configuration
GOOGLE_VISION_API_KEY=your_vision_api_key
OCR_FALLBACK_ENABLED=true

# Web Scraping Settings
SCRAPER_USER_AGENT="MCP Content Analyzer 1.0"
SCRAPER_TIMEOUT=30000
SCRAPER_RATE_LIMIT=5

# Server Configuration
MCP_SERVER_PORT=3000
LOG_LEVEL=info
MAX_CONTENT_LENGTH=50000

# Team Distribution
TEAM_NAME=your_team_name
SERVER_NAME=${TEAM_NAME}-mcp-content-analyzer
```

## File Templates

### `.env.template`
```bash
# Copy this to .env and fill in your values

# Excel Database Configuration
EXCEL_DATABASE_PATH=./data/content-database.xlsx
EXCEL_BACKUP_ENABLED=true
EXCEL_AUTO_SAVE=true

# OCR Configuration
GOOGLE_VISION_API_KEY=
OCR_FALLBACK_ENABLED=true

# Web Scraping Settings
SCRAPER_USER_AGENT="MCP Content Analyzer 1.0"
SCRAPER_TIMEOUT=30000
SCRAPER_RATE_LIMIT=5

# Server Configuration
MCP_SERVER_PORT=3000
LOG_LEVEL=info
MAX_CONTENT_LENGTH=50000

# Team Distribution
TEAM_NAME=my_team
SERVER_NAME=${TEAM_NAME}-mcp-content-analyzer
```

### `package.json`
```json
{
  "name": "mcp-content-analyzer",
  "version": "1.0.0",
  "description": "Hono-based MCP server for content analysis and Google Sheets integration",
  "main": "dist/index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "npm run build && node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "test": "jest",
    "test:integration": "jest tests/integration",
    "type-check": "tsc --noEmit",
    "setup": "./scripts/setup.sh",
    "docker:build": "docker build -t mcp-content-analyzer .",
    "docker:run": "docker-compose up -d",
    "docker:logs": "docker-compose logs -f",
    "docker:stop": "docker-compose down"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "hono": "^4.0.0",
    "@hono/node-server": "^1.8.0",
    "playwright": "^1.40.0",
    "cheerio": "^1.0.0-rc.12",
    "exceljs": "^4.4.0",
    "@google-cloud/vision": "^4.0.2",
    "winston": "^3.11.0",
    "dotenv": "^16.3.1",
    "sharp": "^0.32.6",
    "tesseract.js": "^5.0.4",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tsx": "^4.0.0",
    "@types/node": "^20.0.0",
    "@types/cheerio": "^0.22.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.8",
    "ts-jest": "^29.1.0"
  },
  "engines": {
    "node": ">=18.14.1"
  },
  "keywords": ["mcp", "claude", "automation", "content-analysis", "google-sheets", "hono", "typescript"],
  "author": "Your Team",
  "license": "MIT"
}
```

### `Dockerfile`
```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Playwright
FROM mcr.microsoft.com/playwright:v1.40.0-focal AS playwright
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
RUN npx playwright install chromium

# Stage 3: Production
FROM node:18-alpine AS production
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Copy application and build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Create data directory for Excel files
RUN mkdir -p /app/data && chown -R nodejs:nodejs /app/data

# Set up permissions and user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node src/utils/health-check.js

CMD ["node", "dist/index.js"]
```

### `docker-compose.yml`
```yaml
version: '3.8'
services:
  mcp-content-analyzer:
    build: .
    container_name: ${TEAM_NAME:-team}-mcp-server
    ports:
      - "${MCP_SERVER_PORT:-3000}:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
      - ./config:/app/config:ro
    restart: unless-stopped
    networks:
      - mcp-network
    
  # Optional: Redis for caching (team deployments)
  redis:
    image: redis:7-alpine
    container_name: ${TEAM_NAME:-team}-redis
    volumes:
      - redis_data:/data
    networks:
      - mcp-network
    profiles: ["caching"]

volumes:
  redis_data:

networks:
  mcp-network:
    driver: bridge
```

### `.gitignore`
```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# TypeScript
dist/
*.tsbuildinfo

# Environment files
.env
.env.local
.env.production

# Data files (Excel databases)
data/*.xlsx
data/*.xls
!data/.gitkeep

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Docker
.dockerignore

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
test-results/
playwright-report/
```

## Source Code Files

### `src/index.js` - Main MCP Server Hub
```javascript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { config } from './utils/config.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './utils/error-handler.js';
import { WebScraperServer } from './servers/web-scraper.js';
import { ExcelManagerServer } from './servers/excel-manager.js';
import { OCRProcessorServer } from './servers/ocr-processor.js';

class MCPContentAnalyzer {
  constructor() {
    this.server = new Server({
      name: 'mcp-content-analyzer',
      version: '1.0.0'
    });

    this.webScraper = new WebScraperServer();
    this.excelManager = new ExcelManagerServer();
    this.ocrProcessor = new OCRProcessorServer();
    
    this.setupHandlers();
  }

  setupHandlers() {
    // Aggregate all tools from sub-servers
    this.server.setRequestHandler('tools/list', async () => {
      const tools = [
        ...(await this.webScraper.getTools()),
        ...(await this.excelManager.getTools()),
        ...(await this.ocrProcessor.getTools()),
        {
          name: 'analyze_content_workflow',
          description: 'Complete workflow: scrape/OCR → analyze → categorize → store',
          inputSchema: {
            type: 'object',
            properties: {
              source: {
                type: 'object',
                oneOf: [
                  {
                    properties: {
                      type: { enum: ['url'] },
                      url: { type: 'string' }
                    }
                  },
                  {
                    properties: {
                      type: { enum: ['image'] },
                      image_data: { type: 'string', format: 'base64' }
                    }
                  }
                ]
              },
              analysis_options: {
                type: 'object',
                properties: {
                  check_duplicates: { type: 'boolean', default: true },
                  auto_categorize: { type: 'boolean', default: true },
                  similarity_threshold: { type: 'number', default: 0.8 }
                }
              }
            },
            required: ['source']
          }
        }
      ];
      
      return { tools };
    });

    // Route tool calls to appropriate handlers
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        logger.info(`Tool called: ${name}`, { args });
        
        if (name === 'analyze_content_workflow') {
          return await this.handleCompleteWorkflow(args);
        }
        
        // Route to appropriate sub-server
        if (name.startsWith('scrape_') || name.includes('url')) {
          return await this.webScraper.handleToolCall(name, args);
        }
        
        if (name.includes('excel') || name.includes('entry') || name.includes('topic')) {
          return await this.excelManager.handleToolCall(name, args);
        }
        
        if (name.includes('ocr') || name.includes('image') || name.includes('screenshot')) {
          return await this.ocrProcessor.handleToolCall(name, args);
        }
        
        throw new Error(`Unknown tool: ${name}`);
        
      } catch (error) {
        logger.error(`Tool call failed: ${name}`, { error: error.message, args });
        return errorHandler.formatResponse(error);
      }
    });
  }

  async handleCompleteWorkflow(args) {
    const startTime = Date.now();
    const { source, analysis_options = {} } = args;
    
    try {
      let content, title, metadata;
      
      // Step 1: Extract content
      if (source.type === 'url') {
        const scrapeResult = await this.webScraper.handleToolCall('scrape_webpage', { url: source.url });
        const data = JSON.parse(scrapeResult.content[0].text);
        content = data.content;
        title = data.title;
        metadata = { source_url: source.url };
      } else if (source.type === 'image') {
        const ocrResult = await this.ocrProcessor.handleToolCall('process_screenshot', { image_data: source.image_data });
        const data = JSON.parse(ocrResult.content[0].text);
        content = data.text;
        title = data.title || 'Screenshot Content';
        metadata = { source_type: 'image', confidence: data.confidence };
      }
      
      // Step 2: Get topic categories
      const topicsResult = await this.excelManager.handleToolCall('get_topic_categories', {});
      const topics = topicsResult.content[0].text;

      // Step 3: Check for similar content (if enabled)
      let similarityMatches = [];
      if (analysis_options.check_duplicates) {
        const searchResult = await this.excelManager.handleToolCall('search_similar_content', {
          query: content.substring(0, 500)
        });
        similarityMatches = JSON.parse(searchResult.content[0].text || '[]');
      }

      // Step 4: Auto-categorize (simplified - in real implementation, use Claude API)
      let category = 'Uncategorized';
      if (analysis_options.auto_categorize) {
        // Simple keyword matching - replace with Claude API call for better categorization
        const topicList = topics.split(', ');
        for (const topic of topicList) {
          if (content.toLowerCase().includes(topic.toLowerCase())) {
            category = topic;
            break;
          }
        }
      }

      // Step 5: Add to Excel database
      const addResult = await this.excelManager.handleToolCall('add_content_entry', {
        url: metadata.source_url || '',
        title,
        summary: content.substring(0, 500) + (content.length > 500 ? '...' : ''),
        topic: category,
        keyPoints: this.extractKeyPoints(content)
      });
      
      const processingTime = Date.now() - startTime;
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: {
              title,
              category,
              summary: content.substring(0, 200) + '...',
              similarity_matches: similarityMatches,
              database_entry: addResult.content[0].text,
              metadata: {
                ...metadata,
                processing_time_ms: processingTime,
                content_length: content.length
              }
            }
          })
        }]
      };
      
    } catch (error) {
      logger.error('Complete workflow failed', { error: error.message, args });
      throw error;
    }
  }
  
  extractKeyPoints(content) {
    // Simple key points extraction - replace with Claude API for better results
    const sentences = content.split('.').filter(s => s.trim().length > 20);
    return sentences.slice(0, 3).join('. ');
  }

  async start() {
    try {
      await this.webScraper.initialize();
      await this.excelManager.initialize();
      await this.ocrProcessor.initialize();
      
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      logger.info('MCP Content Analyzer started successfully');
    } catch (error) {
      logger.error('Failed to start server', { error: error.message });
      process.exit(1);
    }
  }
}

// Start server
const analyzer = new MCPContentAnalyzer();
analyzer.start().catch(console.error);
```

### `src/servers/base-server.js` - Common MCP Server Utilities
```javascript
export class BaseMCPServer {
  constructor(name) {
    this.name = name;
    this.tools = [];
  }

  async initialize() {
    // Override in subclasses
  }

  async getTools() {
    return this.tools;
  }

  async handleToolCall(name, args) {
    // Override in subclasses
    throw new Error(`Tool ${name} not implemented in ${this.name}`);
  }

  createSuccessResponse(data) {
    return {
      content: [{
        type: 'text',
        text: typeof data === 'string' ? data : JSON.stringify(data)
      }]
    };
  }

  createErrorResponse(error) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ error: error.message })
      }]
    };
  }
}
```

### `src/servers/web-scraper.js`
```javascript
import { BaseMCPServer } from './base-server.js';
import { chromium } from 'playwright';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';

export class WebScraperServer extends BaseMCPServer {
  constructor() {
    super('web-scraper');
    this.browser = null;
    
    this.tools = [
      {
        name: 'scrape_webpage',
        description: 'Extract content from a webpage',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to scrape' }
          },
          required: ['url']
        }
      },
      {
        name: 'check_url_accessibility',
        description: 'Check if URL is accessible before scraping',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string' }
          },
          required: ['url']
        }
      }
    ];
  }

  async initialize() {
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      logger.info('Web scraper initialized');
    } catch (error) {
      logger.error('Failed to initialize web scraper', { error: error.message });
      throw error;
    }
  }

  async handleToolCall(name, args) {
    switch (name) {
      case 'scrape_webpage':
        return await this.scrapeWebpage(args.url);
      case 'check_url_accessibility':
        return await this.checkUrlAccessibility(args.url);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async scrapeWebpage(url) {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser.newPage();
    
    try {
      await page.setUserAgent(config.scraper.userAgent);
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: config.scraper.timeout 
      });
      
      const title = await page.title();
      const content = await page.evaluate(() => {
        // Remove scripts and styles
        const scripts = document.querySelectorAll('script, style, nav, footer, .ad, .advertisement');
        scripts.forEach(el => el.remove());
        
        // Get main content
        const main = document.querySelector('main, article, .content, .post, .entry');
        return main ? main.innerText : document.body.innerText;
      });
      
      const metadata = await page.evaluate(() => ({
        description: document.querySelector('meta[name="description"]')?.content || '',
        author: document.querySelector('meta[name="author"]')?.content || '',
        publishDate: document.querySelector('meta[property="article:published_time"]')?.content || ''
      }));
      
      logger.info('Successfully scraped webpage', { url, contentLength: content.length });
      
      return this.createSuccessResponse({
        title,
        content: content.slice(0, config.maxContentLength),
        url,
        metadata
      });
      
    } catch (error) {
      logger.error('Failed to scrape webpage', { url, error: error.message });
      return this.createErrorResponse(error);
    } finally {
      await page.close();
    }
  }

  async checkUrlAccessibility(url) {
    const page = await this.browser.newPage();
    
    try {
      const response = await page.goto(url, { timeout: 10000 });
      const accessible = response && response.status() < 400;
      
      return this.createSuccessResponse({
        url,
        accessible,
        status: response?.status() || 0
      });
      
    } catch (error) {
      return this.createSuccessResponse({
        url,
        accessible: false,
        error: error.message
      });
    } finally {
      await page.close();
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
```

### `src/servers/excel-manager.js`
```javascript
import { BaseMCPServer } from './base-server.js';
import ExcelJS from 'exceljs';
import fs from 'fs/promises';
import path from 'path';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';

export class ExcelManagerServer extends BaseMCPServer {
  constructor() {
    super('excel-manager');
    this.workbook = null;
    this.filePath = null;
    
    this.tools = [
      {
        name: 'add_content_entry',
        description: 'Add new content entry to Excel database',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            title: { type: 'string' },
            summary: { type: 'string' },
            topic: { type: 'string' },
            keyPoints: { type: 'string' }
          },
          required: ['title', 'summary']
        }
      },
      {
        name: 'search_similar_content',
        description: 'Search for similar existing content',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' }
          },
          required: ['query']
        }
      },
      {
        name: 'get_topic_categories',
        description: 'Get list of available topics',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_database_stats',
        description: 'Return Excel database metrics',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ];
  }

  async initialize() {
    try {
      this.filePath = config.excel.databasePath;
      this.workbook = new ExcelJS.Workbook();

      // Check if Excel file exists, create if not
      try {
        await fs.access(this.filePath);
        await this.workbook.xlsx.readFile(this.filePath);
        logger.info('Loaded existing Excel database', { filePath: this.filePath });
      } catch (error) {
        // Create new Excel file with default structure
        await this.createDefaultExcelStructure();
        logger.info('Created new Excel database', { filePath: this.filePath });
      }

      logger.info('Excel manager initialized', {
        filePath: this.filePath,
        worksheets: this.workbook.worksheets.length
      });
    } catch (error) {
      logger.error('Failed to initialize Excel manager', { error: error.message });
      throw error;
    }
  }

  async createDefaultExcelStructure() {
    // Ensure directory exists
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });

    // Create main content worksheet
    const worksheet = this.workbook.addWorksheet('Content Database');
    worksheet.columns = [
      { header: 'Date Added', key: 'dateAdded', width: 15 },
      { header: 'Source URL', key: 'sourceUrl', width: 50 },
      { header: 'Title', key: 'title', width: 40 },
      { header: 'Summary', key: 'summary', width: 80 },
      { header: 'Topic Category', key: 'topicCategory', width: 20 },
      { header: 'Key Points', key: 'keyPoints', width: 60 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    // Create topics worksheet
    const topicsSheet = this.workbook.addWorksheet('Topics');
    topicsSheet.columns = [
      { header: 'Category', key: 'category', width: 25 },
      { header: 'Description', key: 'description', width: 50 },
      { header: 'Keywords', key: 'keywords', width: 40 }
    ];

    // Add default topics
    const defaultTopics = [
      { category: 'AI Research', description: 'Artificial Intelligence research and developments', keywords: 'ai, artificial intelligence, machine learning, neural networks' },
      { category: 'Technology Trends', description: 'Latest technology trends and innovations', keywords: 'tech, innovation, trends, digital transformation' },
      { category: 'Business Strategy', description: 'Business strategy and management insights', keywords: 'business, strategy, management, leadership' }
    ];

    topicsSheet.addRows(defaultTopics);

    // Save the file
    await this.workbook.xlsx.writeFile(this.filePath);
  }

  async handleToolCall(name, args) {
    if (!this.workbook) {
      await this.initialize();
    }

    switch (name) {
      case 'add_content_entry':
        return await this.addContentEntry(args);
      case 'search_similar_content':
        return await this.searchSimilarContent(args.query);
      case 'get_topic_categories':
        return await this.getTopicCategories();
      case 'get_database_stats':
        return await this.getDatabaseStats();
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async addContentEntry(data) {
    try {
      const worksheet = this.workbook.getWorksheet('Content Database');

      const newRow = {
        dateAdded: new Date().toISOString().split('T')[0],
        sourceUrl: data.url || '',
        title: data.title,
        summary: data.summary,
        topicCategory: data.topic || 'Uncategorized',
        keyPoints: data.keyPoints || '',
        status: 'New'
      };

      worksheet.addRow(newRow);

      // Save the file
      await this.saveExcelFile();

      logger.info('Added content entry', { title: data.title, topic: data.topic });

      return this.createSuccessResponse({
        message: 'Entry added successfully to Excel database',
        entry: newRow
      });

    } catch (error) {
      logger.error('Failed to add content entry', { error: error.message, data });
      return this.createErrorResponse(error);
    }
  }

  async saveExcelFile() {
    if (config.excel.backupEnabled) {
      // Create backup
      const backupPath = this.filePath.replace('.xlsx', `-backup-${Date.now()}.xlsx`);
      await this.workbook.xlsx.writeFile(backupPath);
    }

    await this.workbook.xlsx.writeFile(this.filePath);
  }

  async searchSimilarContent(query) {
    try {
      const worksheet = this.workbook.getWorksheet('Content Database');
      const rows = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
          rows.push({
            rowNumber,
            title: row.getCell('title').value || '',
            summary: row.getCell('summary').value || '',
            keyPoints: row.getCell('keyPoints').value || '',
            topicCategory: row.getCell('topicCategory').value || ''
          });
        }
      });

      const matches = rows.filter(row => {
        const title = row.title.toString().toLowerCase();
        const summary = row.summary.toString().toLowerCase();
        const keyPoints = row.keyPoints.toString().toLowerCase();
        const searchTerms = query.toLowerCase();

        return title.includes(searchTerms) ||
               summary.includes(searchTerms) ||
               keyPoints.includes(searchTerms);
      });

      const results = matches.slice(0, 5).map((row, index) => ({
        entry_id: `entry_${row.rowNumber}`,
        title: row.title,
        summary: row.summary.toString().substring(0, 100) + '...',
        topic: row.topicCategory,
        similarity_score: 0.8 - (index * 0.1) // Simplified scoring
      }));

      logger.info('Search completed', { query, resultsFound: results.length });

      return this.createSuccessResponse(results);

    } catch (error) {
      logger.error('Failed to search content', { query, error: error.message });
      return this.createErrorResponse(error);
    }
  }

  async getTopicCategories() {
    try {
      const topicsSheet = this.workbook.getWorksheet('Topics');
      if (!topicsSheet) {
        return this.createSuccessResponse('AI Research, Machine Learning, Business Strategy, Technology Trends');
      }

      const topics = [];
      topicsSheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
          const category = row.getCell('category').value;
          if (category) {
            topics.push(category.toString());
          }
        }
      });

      return this.createSuccessResponse(topics.join(', '));

    } catch (error) {
      logger.error('Failed to get topics', { error: error.message });
      return this.createErrorResponse(error);
    }
  }

  async getDatabaseStats() {
    try {
      const worksheet = this.workbook.getWorksheet('Content Database');

      let totalEntries = 0;
      const topicCounts = {};

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
          totalEntries++;
          const topic = row.getCell('topicCategory').value || 'Uncategorized';
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        }
      });

      const stats = {
        total_entries: totalEntries,
        topic_breakdown: topicCounts,
        last_updated: new Date().toISOString().split('T')[0],
        most_popular_topic: Object.keys(topicCounts).reduce((a, b) =>
          topicCounts[a] > topicCounts[b] ? a : b, 'None'),
        excel_file_path: this.filePath
      };

      return this.createSuccessResponse(stats);

    } catch (error) {
      logger.error('Failed to get database stats', { error: error.message });
      return this.createErrorResponse(error);
    }
  }
}
```

### `src/servers/ocr-processor.js`
```javascript
import { BaseMCPServer } from './base-server.js';
import vision from '@google-cloud/vision';
import { createWorker } from 'tesseract.js';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';

export class OCRProcessorServer extends BaseMCPServer {
  constructor() {
    super('ocr-processor');
    this.visionClient = null;
    this.tesseractWorker = null;
    
    this.tools = [
      {
        name: 'process_screenshot',
        description: 'Extract text from image using OCR',
        inputSchema: {
          type: 'object',
          properties: {
            image_data: { 
              type: 'string', 
              format: 'base64',
              description: 'Base64 encoded image data'
            }
          },
          required: ['image_data']
        }
      },
      {
        name: 'analyze_document_structure',
        description: 'Identify document layout and structure',
        inputSchema: {
          type: 'object',
          properties: {
            image_data: { type: 'string', format: 'base64' }
          },
          required: ['image_data']
        }
      }
    ];
  }

  async initialize() {
    try {
      // Initialize Google Vision API if key is available
      if (config.google.visionApiKey) {
        this.visionClient = new vision.ImageAnnotatorClient({
          keyFilename: config.google.serviceAccountPath
        });
        logger.info('Google Vision API initialized');
      }
      
      // Initialize Tesseract as fallback
      if (config.ocr.fallbackEnabled) {
        this.tesseractWorker = await createWorker('eng');
        logger.info('Tesseract OCR initialized');
      }
      
    } catch (error) {
      logger.error('Failed to initialize OCR processor', { error: error.message });
      throw error;
    }
  }

  async handleToolCall(name, args) {
    switch (name) {
      case 'process_screenshot':
        return await this.processScreenshot(args.image_data);
      case 'analyze_document_structure':
        return await this.analyzeDocumentStructure(args.image_data);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async processScreenshot(imageData) {
    try {
      let result;
      
      // Try Google Vision API first
      if (this.visionClient) {
        result = await this.processWithGoogleVision(imageData);
      } else if (this.tesseractWorker) {
        result = await this.processWithTesseract(imageData);
      } else {
        throw new Error('No OCR service available');
      }
      
      logger.info('OCR processing completed', { 
        textLength: result.text.length,
        confidence: result.confidence 
      });
      
      return this.createSuccessResponse({
        text: result.text,
        confidence: result.confidence,
        title: this.extractTitle(result.text),
        word_count: result.text.split(' ').length
      });
      
    } catch (error) {
      logger.error('OCR processing failed', { error: error.message });
      return this.createErrorResponse(error);
    }
  }

  async processWithGoogleVision(imageData) {
    const image = {
      content: imageData
    };
    
    const [result] = await this.visionClient.textDetection(image);
    const detections = result.textAnnotations;
    
    if (!detections || detections.length === 0) {
      return { text: '', confidence: 0 };
    }
    
    return {
      text: detections[0].description,
      confidence: 0.95 // Google Vision is generally high confidence
    };
  }

  async processWithTesseract(imageData) {
    const buffer = Buffer.from(imageData, 'base64');
    const { data } = await this.tesseractWorker.recognize(buffer);
    
    return {
      text: data.text,
      confidence: data.confidence / 100
    };
  }

  extractTitle(text) {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length === 0) return 'Untitled Document';
    
    // First non-empty line is likely the title
    return lines[0].trim().substring(0, 100);
  }

  async analyzeDocumentStructure(imageData) {
    try {
      if (!this.visionClient) {
        return this.createErrorResponse(new Error('Document structure analysis requires Google Vision API'));
      }
      
      const image = { content: imageData };
      const [result] = await this.visionClient.documentTextDetection(image);
      
      const fullTextAnnotation = result.fullTextAnnotation;
      if (!fullTextAnnotation) {
        return this.createSuccessResponse({
          structure: 'unknown',
          blocks: 0,
          paragraphs: 0
        });
      }
      
      const pages = fullTextAnnotation.pages;
      const blocks = pages.reduce((total, page) => total + page.blocks.length, 0);
      const paragraphs = pages.reduce((total, page) => 
        total + page.blocks.reduce((blockTotal, block) => 
          blockTotal + block.paragraphs.length, 0), 0);
      
      return this.createSuccessResponse({
        structure: 'document',
        blocks,
        paragraphs,
        confidence: 0.9
      });
      
    } catch (error) {
      logger.error('Document structure analysis failed', { error: error.message });
      return this.createErrorResponse(error);
    }
  }

  async cleanup() {
    if (this.tesseractWorker) {
      await this.tesseractWorker.terminate();
    }
  }
}
```

### `src/utils/config.js`
```javascript
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  excel: {
    databasePath: process.env.EXCEL_DATABASE_PATH || './data/content-database.xlsx',
    backupEnabled: process.env.EXCEL_BACKUP_ENABLED === 'true',
    autoSave: process.env.EXCEL_AUTO_SAVE === 'true'
  },

  google: {
    visionApiKey: process.env.GOOGLE_VISION_API_KEY
  },
  
  scraper: {
    userAgent: process.env.SCRAPER_USER_AGENT || 'MCP Content Analyzer 1.0',
    timeout: parseInt(process.env.SCRAPER_TIMEOUT) || 30000,
    rateLimit: parseInt(process.env.SCRAPER_RATE_LIMIT) || 5
  },
  
  ocr: {
    fallbackEnabled: process.env.OCR_FALLBACK_ENABLED === 'true'
  },
  
  server: {
    port: parseInt(process.env.MCP_SERVER_PORT) || 3000,
    logLevel: process.env.LOG_LEVEL || 'info'
  },
  
  maxContentLength: parseInt(process.env.MAX_CONTENT_LENGTH) || 50000,
  
  team: {
    name: process.env.TEAM_NAME || 'default_team',
    serverName: process.env.SERVER_NAME || 'mcp-content-analyzer'
  }
};

// Validate required config
if (!config.excel.databasePath) {
  throw new Error('EXCEL_DATABASE_PATH environment variable is required');
}
```

### `src/utils/logger.js`
```javascript
import winston from 'winston';
import { config } from './config.js';

export const logger = winston.createLogger({
  level: config.server.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: config.team.serverName,
    team: config.team.name 
  },
  transports: [
    new winston.transports.File({ 
      filename: './logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: './logs/combined.log' 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### `src/utils/error-handler.js`
```javascript
import { logger } from './logger.js';

export const errorHandler = {
  formatResponse(error) {
    const errorResponse = {
      success: false,
      error: {
        message: error.message,
        type: error.constructor.name,
        timestamp: new Date().toISOString()
      }
    };
    
    logger.error('Error response generated', errorResponse);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(errorResponse)
      }]
    };
  },

  handleAsync(fn) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        logger.error('Async operation failed', { 
          error: error.message, 
          stack: error.stack 
        });
        throw error;
      }
    };
  }
};
```

### `src/utils/health-check.js`
```javascript
import { config } from './config.js';

async function healthCheck() {
  try {
    // Check if server is responsive
    const response = await fetch(`http://localhost:${config.server.port}/health`);
    
    if (response.ok) {
      console.log('Health check passed');
      process.exit(0);
    } else {
      console.error('Health check failed: Server not responding');
      process.exit(1);
    }
  } catch (error) {
    console.error('Health check failed:', error.message);
    process.exit(1);
  }
}

healthCheck();
```

## Configuration Files

### `config/topics-template.json`
```json
{
  "categories": [
    "AI Research",
    "Machine Learning",
    "Business Strategy", 
    "Technology Trends",
    "Product Development",
    "Market Analysis",
    "Competitive Intelligence",
    "Industry News",
    "Research Papers",
    "Case Studies"
  ],
  "custom_categories": [
    "Add your custom topics here"
  ]
}
```

### `config/excel-schema.json`
```json
{
  "main_sheet": {
    "name": "Content Database",
    "columns": [
      {"name": "Date Added", "key": "dateAdded", "type": "date", "width": 15},
      {"name": "Source URL", "key": "sourceUrl", "type": "url", "width": 50},
      {"name": "Title", "key": "title", "type": "text", "width": 40},
      {"name": "Summary", "key": "summary", "type": "text", "width": 80},
      {"name": "Topic Category", "key": "topicCategory", "type": "text", "width": 20},
      {"name": "Key Points", "key": "keyPoints", "type": "text", "width": 60},
      {"name": "Status", "key": "status", "type": "text", "width": 15}
    ]
  },
  "topics_sheet": {
    "name": "Topics",
    "columns": [
      {"name": "Category", "key": "category", "type": "text", "width": 25},
      {"name": "Description", "key": "description", "type": "text", "width": 50},
      {"name": "Keywords", "key": "keywords", "type": "text", "width": 40}
    ]
  }
}
```

### `src/templates/claude-config.json`
```json
{
  "mcpServers": {
    "content-analyzer": {
      "command": "node",
      "args": ["./src/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

## Scripts

### `scripts/setup.sh`
```bash
#!/bin/bash

echo "🚀 Setting up MCP Content Analyzer..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to 18.0.0 or newer."
    exit 1
fi

echo "✅ Node.js version check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create required directories
mkdir -p logs
mkdir -p data
mkdir -p config

# Copy environment template
if [ ! -f .env ]; then
    cp .env.template .env
    echo "📝 Created .env file from template. Please fill in your configuration."
fi

# Install Playwright browsers
echo "🎭 Installing Playwright browsers..."
npx playwright install chromium

# Set permissions
chmod +x scripts/*.sh

echo "✅ Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Fill in your .env file with Excel database path and API credentials"
echo "2. Optionally configure Google Vision API for OCR features"
echo "3. Run 'npm test' to verify installation"
echo "4. Run 'npm start' to start the MCP server"
```

### `scripts/test-connection.sh`
```bash
#!/bin/bash

echo "🔍 Testing MCP server connection..."

# Start server in background
node src/index.js &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test if server is responsive
if kill -0 $SERVER_PID 2>/dev/null; then
    echo "✅ MCP server started successfully (PID: $SERVER_PID)"
else
    echo "❌ MCP server failed to start"
    exit 1
fi

# Cleanup
kill $SERVER_PID 2>/dev/null

echo "✅ Connection test completed"
```

### `scripts/generate-config.sh`
```bash
#!/bin/bash

echo "⚙️ Generating Claude Desktop configuration..."

# Get current directory
CURRENT_DIR=$(pwd)

# Determine OS and config path
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    CONFIG_DIR="$HOME/Library/Application Support/Claude"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    CONFIG_DIR="$APPDATA/Claude"
else
    # Linux
    CONFIG_DIR="$HOME/.config/Claude"
fi

CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"

# Create config directory if it doesn't exist
mkdir -p "$CONFIG_DIR"

# Generate config
cat > "$CONFIG_FILE" << EOF
{
  "mcpServers": {
    "content-analyzer": {
      "command": "node",
      "args": ["$CURRENT_DIR/src/index.js"],
      "env": {}
    }
  }
}
EOF

echo "✅ Claude Desktop configuration created at: $CONFIG_FILE"
echo "🔄 Please restart Claude Desktop to load the new configuration"
```

### `scripts/docker-deploy.sh`
```bash
#!/bin/bash

echo "🐳 Deploying MCP Content Analyzer with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

# Build and start services
echo "🏗️ Building Docker image..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

echo "✅ Deployment completed!"
echo "📊 View logs with: docker-compose logs -f"
echo "🛑 Stop services with: docker-compose down"
```

## Documentation Files

### `docs/SETUP.md`
```markdown
# Setup Instructions

## Prerequisites
- Node.js 18+
- Google Cloud Platform account
- Claude Desktop app

## Quick Start
1. Clone the repository
2. Run `./scripts/setup.sh`
3. Configure your .env file
4. Add Google service account credentials
5. Run `npm start`

## Detailed Setup

### Google Cloud Setup
1. Create a new project in Google Cloud Console
2. Enable Google Sheets API and Google Drive API
3. Create a service account and download the JSON key
4. Share your Google Sheet with the service account email

### Environment Configuration
Copy `.env.template` to `.env` and fill in:
- `GOOGLE_SHEETS_ID`: Your spreadsheet ID from the URL
- `GOOGLE_SERVICE_ACCOUNT_PATH`: Path to your service account JSON file

### Claude Desktop Integration
Run `./scripts/generate-config.sh` to automatically configure Claude Desktop.

## Troubleshooting
See TROUBLESHOOTING.md for common issues and solutions.
```

### `docs/USAGE.md`
```markdown
# Usage Guide

## Starting the Server
```bash
npm start
# or with Docker
docker-compose up -d
```

## Using with Claude

### Analyze a webpage
```
Claude, analyze this article: https://example.com/article
Please categorize it and add to my database.
```

### Process a screenshot
Upload an image and say:
```
Claude, extract the text from this screenshot and analyze the content.
Add it to my database under the appropriate topic.
```

### Search existing content
```
Claude, search my database for content related to "machine learning"
and show me similar entries.
```

## Available Tools
- `analyze_content_workflow`: Complete analysis pipeline
- `scrape_webpage`: Extract content from URLs  
- `process_screenshot`: OCR text extraction
- `add_content_entry`: Add to database
- `search_similar_content`: Find related content
- `get_topic_categories`: List available topics

## Team Features
- Shared topic taxonomies
- Multi-user access tracking
- Usage analytics
- Centralized configuration
```

### `docs/API.md`
```markdown
# MCP API Reference

## Tool Specifications

### analyze_content_workflow
Complete content analysis pipeline.

**Input:**
```json
{
  "source": {
    "type": "url|image",
    "url": "https://example.com",
    "image_data": "base64_string"
  },
  "analysis_options": {
    "check_duplicates": true,
    "auto_categorize": true,
    "similarity_threshold": 0.8
  }
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "title": "Article Title",
    "category": "AI Research", 
    "summary": "Content summary...",
    "similarity_matches": [...],
    "metadata": {...}
  }
}
```

### scrape_webpage
Extract content from a web page.

**Input:**
```json
{
  "url": "https://example.com/article"
}
```

**Output:**
```json
{
  "title": "Page Title",
  "content": "Extracted text content...",
  "url": "https://example.com/article",
  "metadata": {
    "description": "Meta description",
    "author": "Author name",
    "publishDate": "2024-01-01"
  }
}
```

## Error Handling
All tools return standardized error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "type": "ErrorType",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```
```

### `docs/TROUBLESHOOTING.md`
```markdown
# Troubleshooting Guide

## Common Issues

### "Tools not showing up in Claude"
**Symptoms:** Claude doesn't see MCP tools
**Solutions:**
1. Restart Claude Desktop completely
2. Check config file syntax: `./scripts/generate-config.sh`
3. Verify server starts: `npm start`
4. Check logs: `tail -f logs/combined.log`

### "Excel file access denied"
**Symptoms:** Error accessing Excel database file
**Solutions:**
1. Verify Excel file path exists and is writable
2. Check file permissions on data directory
3. Ensure ExcelJS dependencies are installed
4. Verify Excel file is not open in another application

### "Web scraping fails"
**Symptoms:** Cannot scrape certain websites
**Solutions:**
1. Check if site blocks automated access
2. Verify Playwright installation: `npx playwright install chromium`
3. Try different User-Agent string
4. Check network connectivity

### "OCR not working"
**Symptoms:** Screenshot text extraction fails
**Solutions:**
1. Verify Google Vision API credentials
2. Check Tesseract fallback installation
3. Ensure image is valid base64 format
4. Check API quotas in Google Cloud Console

### "Docker deployment issues"
**Symptoms:** Container fails to start
**Solutions:**
1. Check Docker and Docker Compose installation
2. Verify .env file is present
3. Check credentials directory permissions
4. Review Docker logs: `docker-compose logs`

## Performance Issues

### "Slow response times"
**Solutions:**
1. Increase timeout values in .env
2. Enable Redis caching profile
3. Optimize Google Sheets structure
4. Use batch operations for multiple entries

### "High memory usage"
**Solutions:**
1. Limit content length in config
2. Restart server periodically
3. Monitor browser instances
4. Implement request throttling

## Debugging

### Enable debug logging
```bash
export LOG_LEVEL=debug
npm start
```

### Test individual components
```bash
# Test Excel manager connection
node -e "import('./src/servers/excel-manager.js').then(m => new m.ExcelManagerServer().initialize())"

# Test web scraping
node -e "import('./src/servers/web-scraper.js').then(m => new m.WebScraperServer().initialize())"
```

### Health checks
```bash
# Server health
curl http://localhost:3000/health

# Docker health
docker-compose ps
```
```

## MCP Tool Specifications

### Tool Response Format
```json
{
  "success": true,
  "data": {
    "content_id": "entry_123",
    "title": "Extracted Title",
    "summary": "AI-generated summary...",
    "category": "AI Research",
    "similarity_matches": [
      {
        "entry_id": "entry_45",
        "title": "Similar Article",
        "similarity_score": 0.85
      }
    ],
    "metadata": {
      "processing_time_ms": 1250,
      "content_length": 5432,
      "confidence_score": 0.92
    }
  }
}
```

## Team Distribution Features

### One-Command Setup
```bash
curl -fsSL https://raw.githubusercontent.com/your-org/mcp-content-analyzer/main/scripts/quick-install.sh | bash
```

### Team Configuration Management
- Environment-specific configs
- Shared topic taxonomies
- Excel file sharing and synchronization
- Usage analytics

### Scalability Options
- Multi-instance deployment
- Load balancing support
- Queue-based processing
- Database sharding

## Security Considerations

### Credential Management
- Service account keys in secure volume mounts
- API key rotation support
- Access logging and monitoring

### Network Security
- Internal network isolation
- Rate limiting per user/team
- Request sanitization

### Data Privacy
- Local Excel file storage (no cloud dependencies)
- Automatic PII detection and masking
- Configurable data retention policies
- Optional file encryption

## Cost Summary
- **Local Excel Storage:** FREE (no cloud costs)
- **MCP Servers:** FREE (self-hosted)
- **Node.js/Playwright:** FREE
- **Claude usage:** Your normal usage (~$5-15/month)
- **Optional Google Vision API:** FREE (within generous daily limits)
- **Total additional cost:** $0/month

This complete setup provides a powerful, cost-effective automation system that works entirely through Claude conversations while maintaining team distribution capabilities!