# MCP Content Analyzer - Usage Guide

Complete usage examples and workflows for the MCP Content Analyzer.

## Available Tools

### System Tools

#### `test_connection`
Test MCP server connection and basic functionality.

```
Please test the MCP connection by calling test_connection with message "Hello MCP!"
```

#### `get_server_info`
Get comprehensive information about the MCP server.

```
Can you get the server information using get_server_info?
```

### Workflow Tools (Recommended)

#### `analyze_content_workflow`
**The main tool** - Complete content analysis pipeline with intelligent fallback.

**For URLs:**
```
Use analyze_content_workflow to process https://news.ycombinator.com with topic "Technology News"
```

**For Documents:**
```
Use analyze_content_workflow to process /path/to/document.pdf with topic "Research Paper"
```

**For Claude-extracted text from images:**
```
Use analyze_content_workflow with:
- input: "Screenshot analysis"
- extractedText: "Your extracted text here"
- sourceDescription: "Screenshot from presentation slides"
- topic: "Presentation Content"
```

#### `scrape_and_save_content`
Legacy workflow for web content only.

```
Use scrape_and_save_content to scrape https://example.com and save with topic "Web Content"
```

### Web Scraping Tools

#### `scrape_webpage`
Extract content from URLs with metadata.

```
Scrape content from https://example.com
```

#### `check_url_accessibility`
Validate URLs before processing.

```
Check if this URL is accessible: https://example.com
```

### Document Processing Tools

#### `read_document`
Extract content from PDF, DOCX, TXT, RTF files.

```
Read this document: /Users/username/Documents/report.pdf
```

#### `analyze_document_metadata`
Get document properties without full content extraction.

```
Analyze metadata for: /path/to/document.docx
```

#### `extract_document_text`
Pure text extraction with length limits.

```
Extract text from /path/to/document.pdf with maxLength 5000
```

#### `process_extracted_text`
Process Claude-extracted text from images.

```
Process this extracted text: "Your text here" with sourceDescription "Screenshot from app"
```

### Excel Database Tools

#### `add_content_entry`
Add new entries to Excel database.

```
Add content entry with:
- title: "AI Breakthrough"
- summary: "New developments in machine learning"
- topic: "AI Research"
- url: "https://example.com"
```

#### `search_similar_content`
Find related existing content.

```
Search for similar content with query "machine learning"
```

#### `get_topic_categories`
Retrieve available topic categories.

```
What topic categories are available in the database?
```

#### `get_database_stats`
Return Excel database metrics and analytics.

```
Show me the current database statistics
```

## Complete Workflows

### Workflow 1: Web Content Analysis

```
I want to analyze this article: https://techcrunch.com/2024/01/15/ai-breakthrough

Please use analyze_content_workflow to:
1. Scrape the content
2. Categorize it under "Technology News"
3. Save it to the Excel database
```

### Workflow 2: Document Analysis

```
I have a research paper at /Users/username/Desktop/ai-paper.pdf

Please use analyze_content_workflow to:
1. Extract the content
2. Categorize it as "AI Research"
3. Save it to the database
```

### Workflow 3: Screenshot Analysis

First, share a screenshot with Claude, then:

```
I've shared a screenshot above. Please extract the text and then use analyze_content_workflow with:
- The extracted text you just read
- sourceDescription: "Screenshot from quarterly report"
- topic: "Business Reports"
```

### Workflow 4: Bulk Content Processing

```
I want to process multiple sources:

1. First, analyze https://example.com/article1 with topic "News"
2. Then, process /path/to/document.pdf with topic "Research"
3. Finally, show me the updated database statistics
```

## Advanced Usage

### Custom Topic Categories

```
First, let me see what topic categories are available using get_topic_categories

Then add content with a custom topic:
Use analyze_content_workflow with topic "My Custom Category"
```

### Content Discovery

```
Search for content related to "artificial intelligence" using search_similar_content

Then analyze the results and suggest related topics I should explore
```

### Database Management

```
1. Show me database statistics using get_database_stats
2. Search for content about "machine learning"
3. Suggest ways to better organize my content library
```

## Error Handling

### URL Issues

If web scraping fails:
```
The URL https://example.com failed to scrape. Can you:
1. Check if the URL is accessible using check_url_accessibility
2. If accessible, try the scrape_webpage tool directly
3. If that fails, I can provide the content manually
```

### Document Issues

If document processing fails:
```
The document /path/to/file.pdf failed to process. Can you:
1. Check the metadata using analyze_document_metadata
2. Try text extraction with extract_document_text
3. Report what the specific issue might be
```

### Large Files

For large documents:
```
This is a large document. Please:
1. Extract just the first 10000 characters using extract_document_text
2. Process that excerpt with analyze_content_workflow
3. Let me know if I should process the full document
```

## Integration with Claude's Capabilities

### Image Analysis + MCP

1. **Share an image** with Claude
2. **Claude extracts text** using vision capabilities
3. **Process with MCP**: "Now use analyze_content_workflow with the extracted text"

### Research Workflows

```
I'm researching "quantum computing". Can you:
1. Search existing content with search_similar_content
2. Suggest URLs to analyze with analyze_content_workflow
3. Help me build a comprehensive knowledge base
```

### Content Curation

```
Help me curate content about "sustainable technology":
1. Show current database stats
2. Analyze these 3 URLs: [list URLs]
3. Suggest additional sources to complete the topic
4. Organize findings by relevance
```

## Performance Tips

1. **Use workflows** (`analyze_content_workflow`) instead of individual tools
2. **Specify topics** clearly for better organization
3. **Check URL accessibility** before processing large batches
4. **Use document metadata** to validate files before full processing
5. **Search existing content** to avoid duplicates

## Monitoring and Maintenance

### Check System Health

```
Please get_server_info and tell me:
1. Current system status
2. Database statistics
3. Any performance issues
```

### Database Maintenance

```
Show me database statistics and suggest:
1. Content organization improvements
2. Duplicate content to review
3. Categories that might need refinement
```

## Troubleshooting Usage

### Tool Not Found

If a tool isn't available:
1. Check server info: `get_server_info`
2. Restart Claude Desktop
3. Verify MCP configuration

### Content Not Saving

If content isn't saving to Excel:
1. Check database stats: `get_database_stats`
2. Verify file permissions in data directory
3. Check logs for errors

### Slow Performance

For performance issues:
1. Use smaller content limits
2. Process files individually
3. Check available disk space