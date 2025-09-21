# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a containerized MCP (Model Context Protocol) server system built with Hono and TypeScript that enables Claude to automatically scrape web content, process screenshots, analyze against predefined topics, and manage local Excel files. The system is designed for team distribution and easy deployment.

## Architecture

The system follows a modular Hono-based MCP server hub pattern:
- **Main Hono MCP Server Hub** (`src/index.ts`) - Orchestrates multiple MCP servers under a single Hono process
- **Hono Application** (`src/app.ts`) - Sets up Hono routing, middleware, and error handling
- **MCP Routes** (`src/routes/mcp.ts`) - Type-safe routing for MCP tool calls
- **Web Scraper Server** (`src/servers/web-scraper.ts`) - Handles webpage content extraction using Playwright
- **Excel Manager** (`src/servers/excel-manager.ts`) - Manages database operations with local Excel files using ExcelJS
- **OCR Processor** (`src/servers/ocr-processor.ts`) - Extracts text from images using Google Vision API and Tesseract

Each server extends `BaseMCPServer` for common functionality like error handling and response formatting.

## Development Commands

### Setup and Installation
```bash
# Initial setup (installs dependencies, creates directories, configures Playwright)
./scripts/setup.sh

# Install dependencies only
npm install

# Install Playwright browsers
npx playwright install chromium

# Build TypeScript
npm run build
```

### Running the Server
```bash
# Start the Hono MCP server (builds and runs)
npm start

# Development mode with TypeScript watch
npm run dev

# Build only
npm run build

# Type checking
npm run type-check

# Docker deployment
npm run docker:build
npm run docker:run
npm run docker:logs
npm run docker:stop
```

### Testing
```bash
# Run all tests
npm test

# Run integration tests only
npm run test:integration

# Test MCP server connection
./scripts/test-connection.sh

# Test Hono endpoints
curl http://localhost:3000/health
curl -X POST http://localhost:3000/mcp/list
```

### Configuration
```bash
# Generate Claude Desktop configuration
./scripts/generate-config.sh

# Test individual server components (after building)
npm run build
node -e "import('./dist/servers/excel-manager.js').then(m => new m.ExcelManagerServer().initialize())"
```

## Key Dependencies

- **hono**: Ultra-fast web framework built on Web Standards
- **@hono/node-server**: Node.js adapter for Hono
- **typescript**: Type safety and modern JavaScript features
- **tsx**: TypeScript execution and hot reloading for development
- **zod**: Runtime type validation and schema parsing
- **@modelcontextprotocol/sdk**: Core MCP framework for tool definitions and server communication
- **playwright**: Web scraping with headless browser automation
- **exceljs**: Excel file manipulation and data management
- **@google-cloud/vision**: OCR processing via Google Vision API
- **tesseract.js**: Fallback OCR processing
- **winston**: Structured logging with file and console output
- **cheerio**: HTML parsing for content extraction

## Environment Configuration

Key environment variables (see `.env.template`):
- `EXCEL_DATABASE_PATH`: Path to Excel database file (default: ./data/content-database.xlsx)
- `EXCEL_BACKUP_ENABLED`: Enable automatic Excel file backups
- `GOOGLE_VISION_API_KEY`: For OCR processing (optional)
- `MCP_SERVER_PORT`: Server port (default: 3000)
- `TEAM_NAME`: For multi-team deployments

## MCP Tools Available

The system provides these tools to Claude:

### Content Analysis
- `analyze_content_workflow`: Complete pipeline (scrape/OCR → analyze → categorize → store)
- `scrape_webpage`: Extract content from URLs with metadata
- `process_screenshot`: OCR text extraction from images
- `check_url_accessibility`: Validate URLs before processing

### Database Operations
- `add_content_entry`: Add new entries to Excel database
- `search_similar_content`: Find related existing content
- `get_topic_categories`: Retrieve available topic categories
- `get_database_stats`: Return Excel database metrics and analytics

## File Structure Patterns

- `/src/`: TypeScript source code
- `/src/routes/`: Hono route handlers for MCP tools and health checks
- `/src/middleware/`: Hono middleware (logging, error handling, auth)
- `/src/servers/`: Individual MCP server implementations
- `/src/types/`: TypeScript type definitions for MCP tools and responses
- `/src/utils/`: Shared utilities (config, logging, validators)
- `/dist/`: Compiled JavaScript output
- `/scripts/`: Setup and deployment automation
- `/data/`: Excel database files (content files git-ignored)
- `/config/`: Topic categories and schema definitions
- `/logs/`: Runtime logs (auto-created)

## Common Development Tasks

### Adding New MCP Tools
1. Define types in `/src/types/` for request/response schemas
2. Extend the appropriate server class in `/src/servers/` with TypeScript types
3. Add tool definition to the `tools` array in constructor with proper typing
4. Implement handler in `handleToolCall` method with type safety
5. Update route handling in `src/routes/mcp.ts` with type-safe routing
6. Build TypeScript: `npm run build`

### Debugging Connection Issues
```bash
# Check server logs
tail -f logs/combined.log

# Test Hono server health
curl http://localhost:3000/health

# Test Excel manager connection (after build)
npm run build
node -e "import('./dist/servers/excel-manager.js').then(m => new m.ExcelManagerServer().initialize())"

# Verify Claude Desktop config
./scripts/generate-config.sh

# Check TypeScript compilation
npm run type-check
```

### Docker Deployment
The system includes multi-stage Docker builds with TypeScript compilation, Playwright, health checks, and optional Redis caching. The Dockerfile builds TypeScript before running and creates data directories for Excel files. Use `docker-compose.yml` for team deployments with environment-specific configurations.

## Claude Planning Workflow

When you say "plan" or "design", Claude should follow this structured workflow:

1. **Analyze & Think**: Thoroughly understand the objectives and requirements
2. **Create Planning Document**: Write detailed analysis and plan in markdown file in `design/` folder
3. **Brief Implementation Steps**: List concise step-by-step implementation in a to-do list
4. **Wait for Approval**: Present the plan and steps, then wait for your input/approval
5. **Document Questions**: List anything unclear or requiring your input in the planning doc
6. **Create Phase-Based Task Document**: After approval, create separate detailed task markdown with:
   - **Phase 1**: Always lay foundation system + demonstrate it works
   - **Subsequent Phases**: Gradual integration into whole system, one step at a time
   - **Approach Options**: Present suitable approaches for you to choose from

This ensures structured planning with approval at each stage and clear phase-based implementation.

## Task Implementation Workflow

When implementing a new feature from design documents, Claude should:

1. **Create Task To-Do List Document**: Create a markdown file in `tasks/` folder with:
   - Clear task breakdown following the design document
   - Checkbox format for tracking completion status
   - Reference to the original design document
   - Implementation notes and considerations
   
2. **Update Task Document**: After completing each task:
   - Mark completed tasks with `[x]`
   - Add implementation notes or changes made
   - Update any dependencies or blockers
   - Document any deviations from original plan
   
3. **Maintain Continuity**: Ensure task documents are self-contained so that:
   - Progress can be resumed even after chat history is cleared
   - All necessary context is preserved in the task document
   - Design decisions and implementation details are documented
   - Future sessions can continue from where previous session left off

**Task Document Naming Convention**: `tasks/[feature-name]-implementation.md`

**Example Task Document Structure**:
```markdown
# [Feature Name] Implementation Tasks

**Design Reference**: `design/[design-document].md`
**Started**: [Date]
**Status**: In Progress / Completed

## Task List

### Phase 1: Foundation
- [ ] Task 1 description
- [x] Task 2 description - COMPLETED: implementation notes
- [ ] Task 3 description

### Phase 2: Integration
- [ ] Task 4 description
- [ ] Task 5 description

## Implementation Notes
- Note 1: Details about implementation decisions
- Note 2: Changes from original design

## Blockers/Issues
- Issue 1: Description and resolution
```