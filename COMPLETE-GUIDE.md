# MCP Content Analyzer - Complete Guide & Testing Reference

**A comprehensive guide to setup, test, and use the MCP Content Analyzer system with Claude Desktop.**

## 🚀 Quick Start (5 Minutes)

### 1. Automated Setup
```bash
# Clone or download the project
cd mcp-content-analyzer

# Run automated setup
./scripts/setup.sh

# Test everything works
./scripts/test-connection.sh
```

### 2. Claude Desktop Integration
1. **Restart Claude Desktop completely** (required)
2. **Test connection** in Claude Desktop:
   ```
   Please test the MCP connection by calling test_connection with message "Quick start test"
   ```

### 3. First Workflow Test
```
Use analyze_content_workflow to process https://example.com with topic "Testing"
```

✅ **If this works, you're ready to go!** Continue to [Complete Testing](#complete-testing-workflows) below.

---

## 📋 Complete Testing Workflows

### Test 1: System Connectivity
```
Please test the MCP connection by calling test_connection with message "System test"
```
**Expected**: Success response with echo message and server status.

### Test 2: Server Information
```
Can you get the server information using get_server_info?
```
**Expected**: Complete server info including Phase 4 features and all tools.

### Test 3: Database Operations
```
What topic categories are available in the database using get_topic_categories?
```
**Expected**: List of default categories (AI Research, Technology Trends, etc.).

```
Show me the current database statistics using get_database_stats
```
**Expected**: Database metrics including entry counts and topics.

### Test 4: Web Content Analysis
```
Use analyze_content_workflow to process https://example.com with topic "Web Testing"
```
**Expected**: Complete workflow execution with content extraction and Excel storage.

```
Check if this URL is accessible: https://httpbin.org/html
```
**Expected**: Accessibility check with response time and status.

```
Scrape content from https://httpbin.org/html
```
**Expected**: HTML content extraction with metadata.

### Test 5: Document Processing
Create a test text file:
```bash
echo "This is a test document for MCP Content Analyzer testing." > /tmp/test-doc.txt
```

```
Use analyze_content_workflow to process /tmp/test-doc.txt with topic "Document Testing"
```
**Expected**: Document content extraction and Excel storage.

```
Analyze metadata for /tmp/test-doc.txt using analyze_document_metadata
```
**Expected**: File metadata including size, type, and modification date.

### Test 6: Claude Vision Integration
Share any screenshot with Claude, then:
```
I've shared a screenshot above. Please extract the text and then use analyze_content_workflow with:
- The extracted text you just read
- sourceDescription: "Test screenshot"
- topic: "Vision Testing"
```
**Expected**: Claude extracts text, processes it, and saves to Excel.

### Test 7: Search and Discovery
```
Search for similar content with query "test" using search_similar_content
```
**Expected**: Results showing previously added test content.

### Test 8: Content Management
```
Add a content entry with:
- title: "Manual Test Entry"
- summary: "Testing manual content addition"
- topic: "Testing"
- url: "manual-test"
```
**Expected**: Successful addition to Excel database.

```
Show me updated database statistics after adding content
```
**Expected**: Increased entry count and updated statistics.

---

## 🛠️ All Available Tools Reference

### 🔧 System Tools
| Tool | Purpose | Example Usage |
|------|---------|---------------|
| `test_connection` | Test MCP connectivity | `test_connection with message "Hello"` |
| `get_server_info` | Get server status | `get_server_info` |

### 🌊 Workflow Tools (Recommended)
| Tool | Purpose | Example Usage |
|------|---------|---------------|
| `analyze_content_workflow` | **Main tool** - Complete pipeline | `analyze_content_workflow to process https://example.com` |
| `scrape_and_save_content` | Web scraping workflow | `scrape_and_save_content for https://example.com` |

### 🕸️ Web Scraping Tools
| Tool | Purpose | Example Usage |
|------|---------|---------------|
| `scrape_webpage` | Extract web content | `scrape_webpage from https://example.com` |
| `check_url_accessibility` | Validate URLs | `check_url_accessibility for https://example.com` |

### 📄 Document Processing Tools
| Tool | Purpose | Example Usage |
|------|---------|---------------|
| `read_document` | Extract document content | `read_document from /path/to/file.pdf` |
| `analyze_document_metadata` | Get file properties | `analyze_document_metadata for /path/to/file.pdf` |
| `extract_document_text` | Extract text only | `extract_document_text from /path/to/file.pdf` |
| `process_extracted_text` | Process Claude vision text | `process_extracted_text with "Your text here"` |

### 📊 Excel Database Tools
| Tool | Purpose | Example Usage |
|------|---------|---------------|
| `add_content_entry` | Add database entries | `add_content_entry with title "Test"` |
| `search_similar_content` | Search existing content | `search_similar_content with query "AI"` |
| `get_topic_categories` | List categories | `get_topic_categories` |
| `get_database_stats` | Database analytics | `get_database_stats` |

---

## 🎯 Complete Usage Examples

### Example 1: Research Workflow
```
I'm researching "artificial intelligence trends". Help me:

1. First, show me what AI-related content I already have using search_similar_content with query "artificial intelligence"

2. Then analyze this article: https://techcrunch.com/ai-trends with topic "AI Research"

3. Finally, show me updated database statistics to see my research progress
```

### Example 2: Document Library Management
```
I want to build a document library. Can you:

1. Get current database statistics using get_database_stats

2. Process this research paper: /Users/username/Documents/ai-paper.pdf with topic "Research Papers"

3. Search for similar content to avoid duplicates

4. Suggest how to better organize my content
```

### Example 3: Multi-Source Content Analysis
```
I need to analyze content from multiple sources:

1. Web article: https://example.com/article
2. Local document: /path/to/report.docx
3. Screenshot content (I'll share an image)

Please process all three using analyze_content_workflow with topic "Multi-Source Research"
```

### Example 4: Content Discovery and Curation
```
Help me curate content about "sustainable technology":

1. Show what I already have: search_similar_content with "sustainability"
2. Analyze this new source: https://green-tech-news.com/article
3. Suggest additional categories I should create
4. Show final database organization
```

---

## 🔍 Troubleshooting Guide

### Issue: Tools Not Available
**Symptoms**: "Unknown tool" errors
**Solutions**:
1. Check server info: `get_server_info`
2. Restart Claude Desktop completely
3. Regenerate config: `./scripts/generate-config.sh`

### Issue: Web Scraping Fails
**Symptoms**: Scraping errors or timeouts
**Solutions**:
1. Check URL first: `check_url_accessibility`
2. Try direct scraping: `scrape_webpage`
3. Verify network connectivity

### Issue: Document Processing Fails
**Symptoms**: File reading errors
**Solutions**:
1. Check metadata: `analyze_document_metadata`
2. Verify file path and permissions
3. Try text extraction only: `extract_document_text`

### Issue: Excel Database Issues
**Symptoms**: Content not saving
**Solutions**:
1. Check stats: `get_database_stats`
2. Verify data directory permissions
3. Check available disk space

### Issue: Slow Performance
**Symptoms**: Long response times
**Solutions**:
1. Use smaller content limits
2. Process files individually
3. Check system resources

---

## 📊 Performance Monitoring

### System Health Check
```
Please get_server_info and tell me about:
1. Current system status and uptime
2. Available features and tools
3. Any performance indicators
```

### Database Health Check
```
Show me database statistics and analyze:
1. Content distribution by topic
2. Recent activity patterns
3. Storage efficiency
```

### Content Quality Assessment
```
Search for content and help me:
1. Identify duplicate or similar entries
2. Suggest content organization improvements
3. Recommend categories that need more content
```

---

## 🚢 Deployment Options

### Local Development
```bash
npm run dev          # Development mode
npm start           # Production mode
npm run type-check  # Type validation
```

### Docker Deployment
```bash
./scripts/docker-deploy.sh  # Complete Docker setup
docker-compose up -d        # Manual Docker Compose
docker logs -f mcp-content-analyzer  # View logs
```

### Production Monitoring
```bash
# View logs
tail -f ~/Library/Logs/Claude/mcp-server-content-analyzer.log

# Check container status (Docker)
docker ps | grep mcp-content-analyzer

# Test health endpoints (if using Hono)
curl http://localhost:3000/health
```

---

## 📈 Advanced Workflows

### Automated Content Pipeline
```
Set up an automated research pipeline:
1. Process daily news from 3 different sources
2. Categorize by topic automatically
3. Identify trending themes
4. Generate weekly content summaries
```

### Knowledge Base Building
```
Help me build a comprehensive knowledge base:
1. Audit existing content using database statistics
2. Identify knowledge gaps by topic
3. Suggest content sources to fill gaps
4. Organize content with improved categorization
```

### Content Analysis and Insights
```
Analyze my content library and provide insights:
1. What are my most researched topics?
2. Which sources provide the highest quality content?
3. What time periods show the most content activity?
4. Suggest content curation improvements
```

---

## 🆘 Support and Debugging

### Log Analysis
```bash
# MCP server logs
tail -f ~/Library/Logs/Claude/mcp-server-content-analyzer.log

# Application logs (if using file logging)
tail -f logs/combined.log

# Docker logs
docker logs -f mcp-content-analyzer
```

### Configuration Validation
```bash
# Test configuration
./scripts/test-connection.sh

# Validate TypeScript
npm run type-check

# Check Claude Desktop config
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### System Information
```
Please provide detailed system information using get_server_info including:
1. All available tools and their status
2. Database configuration and statistics
3. Current system performance metrics
4. Any error conditions or warnings
```

---

## 🎓 Best Practices

1. **Always use workflows** (`analyze_content_workflow`) for complete processing
2. **Specify clear topics** for better content organization
3. **Check URL accessibility** before batch processing
4. **Search existing content** to avoid duplicates
5. **Monitor database statistics** regularly
6. **Use document metadata** to validate files first
7. **Process large files** in chunks when needed
8. **Restart Claude Desktop** after configuration changes

---

## ✅ Success Criteria

Your MCP Content Analyzer is working correctly if:

- ✅ All system tools respond (`test_connection`, `get_server_info`)
- ✅ Web scraping works with real URLs
- ✅ Document processing handles PDF, DOCX, TXT files
- ✅ Claude vision integration processes screenshots
- ✅ Excel database saves and retrieves content
- ✅ Search finds relevant existing content
- ✅ Complete workflows execute end-to-end
- ✅ Database statistics show accurate metrics

**Ready to explore your content analysis capabilities!** 🚀