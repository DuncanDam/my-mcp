# My MCP

A fast MCP (Model Context Protocol) server that enables Claude to scrape websites, process documents (PDF, DOCX, TXT), and manage Excel databases.

## 🚀 Installation

**One command installs everything:**

```bash
curl -fsSL https://raw.githubusercontent.com/DuncanDam/my-mcp/main/install.sh | bash
```

Then run:
```bash
my-mcp setup    # Setup configuration
my-mcp config   # Configure Claude Desktop
# Restart Claude Desktop completely
my-mcp start    # Start the server
```

## 🔄 Updates

Same installation command updates to latest version:
```bash
curl -fsSL https://raw.githubusercontent.com/DuncanDam/my-mcp/main/install.sh | bash
```

## 🛠️ Main Tools

**Workflows (Recommended):**
- `analyze_content_workflow` - Complete content analysis pipeline
- `scrape_and_save_content` - Web scraping with Excel integration

**Individual Tools:**
- `scrape_webpage` - Extract content from URLs
- `read_document` - Process PDF, DOCX, TXT, RTF files
- `add_content_entry` - Save content to Excel database
- `search_similar_content` - Find related content
- `test_connection` - Test MCP connectivity

## 📋 Commands

| Command | Description |
|---------|-------------|
| `my-mcp setup` | Install dependencies and setup |
| `my-mcp config` | Configure Claude Desktop |
| `my-mcp start` | Start the MCP server |
| `my-mcp test` | Test server connection |
| `my-mcp dev` | Development mode |
| `my-mcp help` | Show all commands |

## 💡 Quick Examples

**Web content:**
```
Use analyze_content_workflow to process https://example.com with topic "News"
```

**Document:**
```
Use analyze_content_workflow to process /path/to/document.pdf with topic "Research"
```

**Screenshot:** Share image with Claude, then:
```
Use analyze_content_workflow with the text you extracted, sourceDescription "Meeting notes", and topic "Business"
```

## 🔧 Manual Installation (Backup)

If the script fails:
```bash
git clone https://github.com/DuncanDam/my-mcp.git
cd my-mcp
npm install && npm run build && npm install -g .
my-mcp setup && my-mcp config
```

## 🆘 Troubleshooting

- **Test connection**: `my-mcp test`
- **Check logs**: `tail -f ~/Library/Logs/Claude/mcp-server-*.log`
- **Reinstall**: Run the installation command again
- **Permission issues**: `sudo npm install -g .` (macOS/Linux)

## ✅ Success Check

Your system works if:
- `my-mcp test` shows "✅ MCP server is responding"
- Claude can call `test_connection` 
- Web scraping and document processing work in Claude

---

**Ready to use! Start with `my-mcp start` and test in Claude Desktop.**