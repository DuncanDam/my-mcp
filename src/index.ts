#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { config } from './utils/config.js';
import { logger } from './utils/logger.js';
import { getServerInfo } from './utils/version.js';
import { ExcelManagerServer } from './servers/excel-manager.js';
import { WebScraperServer } from './servers/web-scraper.js';
import { DocumentReaderServer } from './servers/document-reader.js';
import type { MCPTool } from './types/mcp.js';

class MCPContentAnalyzer {
  private server: Server;
  private excelManager: ExcelManagerServer;
  private webScraper: WebScraperServer;
  private documentReader: DocumentReaderServer;

  constructor() {
    // We'll set the server info dynamically in the start method
    this.server = new Server({
      name: 'my-mcp',
      version: '1.0.0'  // Temporary, will be updated from package.json
    }, {
      capabilities: {
        tools: {}
      }
    });

    this.excelManager = new ExcelManagerServer();
    this.webScraper = new WebScraperServer();
    this.documentReader = new DocumentReaderServer();
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      // Get tools from all servers
      const excelTools = await this.excelManager.getTools();
      const webScraperTools = await this.webScraper.getTools();
      const documentTools = await this.documentReader.getTools();

      const tools: MCPTool[] = [
        {
          name: 'test_connection',
          description: 'Test MCP server connection and basic functionality',
          inputSchema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'Test message to echo back'
              }
            },
            required: ['message']
          }
        },
        {
          name: 'get_server_info',
          description: 'Get information about the MCP server',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'scrape_and_save_content',
          description: 'Complete workflow: scrape webpage content and save to Excel database',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'URL to scrape content from'
              },
              topic: {
                type: 'string',
                description: 'Topic category for the content (optional)',
                default: 'Uncategorized'
              },
              maxContent: {
                type: 'number',
                description: 'Maximum content length (default: 5000)',
                default: 5000
              }
            },
            required: ['url']
          }
        },
        {
          name: 'analyze_content_workflow',
          description: 'Complete content analysis pipeline with intelligent fallback: URL → document → Excel',
          inputSchema: {
            type: 'object',
            properties: {
              input: {
                type: 'string',
                description: 'URL or file path to process'
              },
              inputType: {
                type: 'string',
                description: 'Type of input: "url" or "file" (auto-detected if not specified)',
                enum: ['url', 'file', 'auto']
              },
              topic: {
                type: 'string',
                description: 'Topic category for the content',
                default: 'General'
              },
              extractedText: {
                type: 'string',
                description: 'Pre-extracted text (e.g., from Claude vision analysis of images)'
              },
              sourceDescription: {
                type: 'string',
                description: 'Description of content source when using extractedText'
              }
            },
            required: ['input']
          }
        },
        ...excelTools,
        ...webScraperTools,
        ...documentTools
      ];

      return { tools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        logger.info(`Tool called: ${name}`, { args });

        let result;
        switch (name) {
          case 'test_connection':
            result = await this.handleTestConnection(args || {});
            break;
          case 'get_server_info':
            result = await this.handleGetServerInfo();
            break;
          case 'scrape_and_save_content':
            result = await this.handleScrapeAndSaveContent(args || {});
            break;
          case 'analyze_content_workflow':
            result = await this.handleAnalyzeContentWorkflow(args || {});
            break;
          case 'add_content_entry':
          case 'search_similar_content':
          case 'get_topic_categories':
          case 'delete_content_entry':
          case 'get_database_stats':
            result = await this.excelManager.handleToolCall(name, args || {});
            break;
          case 'scrape_webpage':
          case 'check_url_accessibility':
            result = await this.webScraper.handleToolCall(name, args || {});
            break;
          case 'read_document':
          case 'analyze_document_metadata':
          case 'extract_document_text':
          case 'process_extracted_text':
            result = await this.documentReader.handleToolCall(name, args || {});
            break;
          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        return {
          content: result.content
        };
      } catch (error) {
        logger.error(`Tool call failed: ${name}`, {
          error: error instanceof Error ? error.message : String(error),
          args
        });
        const errorResponse = this.createErrorResponse(error instanceof Error ? error : new Error(String(error)));
        return {
          content: errorResponse.content
        };
      }
    });
  }

  private async handleTestConnection(args: Record<string, any>) {
    const message = args.message || 'No message provided';

    const response = {
      success: true,
      data: {
        echo: message,
        timestamp: new Date().toISOString(),
        server: 'MCP Content Analyzer',
        status: 'connected'
      }
    };

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(response)
      }]
    };
  }

  private async handleGetServerInfo() {
    const serverInfo = await getServerInfo();

    const response = {
      success: true,
      data: {
        name: serverInfo.name,
        version: serverInfo.version,
        description: serverInfo.description,
        author: serverInfo.author,
        phase: 'Phase 4 - Document Processing Integration',
        features: [
          'Excel database management',
          'Content entry creation',
          'Content entry deletion',
          'Similar content search',
          'Topic categorization',
          'Database statistics',
          'Web content scraping',
          'URL accessibility checking',
          'Document processing (PDF, DOCX, TXT, RTF)',
          'Complete content analysis workflow',
          'Claude vision text integration',
          'Enhanced formatting preservation'
        ],
        config: {
          logLevel: config.server.logLevel,
          teamName: config.team.name,
          serverName: config.team.serverName,
          excelDatabasePath: config.excel.databasePath
        },
        uptime: process.uptime(),
        nodeVersion: process.version
      }
    };

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(response)
      }]
    };
  }

  private async handleAnalyzeContentWorkflow(args: Record<string, any>) {
    try {
      const { input, inputType = 'auto', topic = 'General', extractedText, sourceDescription } = args;

      logger.info('Starting content analysis workflow', { input, inputType, topic });

      let contentData;
      let processingMethod = '';

      // Handle pre-extracted text (from Claude vision)
      if (extractedText) {
        logger.info('Processing Claude-extracted text');
        const textResult = await this.documentReader.handleToolCall('process_extracted_text', {
          extractedText,
          sourceDescription: sourceDescription || input,
          topic
        });

        const textData = JSON.parse(textResult.content[0].text);
        if (!textData.success) {
          throw new Error(`Text processing failed: ${textData.error?.message || 'Unknown error'}`);
        }

        contentData = {
          url: sourceDescription || 'Claude Vision Extract',
          title: textData.data.title,
          summary: textData.data.summary,
          topic: textData.data.topic,
          keyPoints: `Extracted via Claude Vision. Word count: ${textData.data.metadata.wordCount}`
        };
        processingMethod = 'Claude Vision Extraction';
      } else {
        // Determine input type if auto
        let detectedType = inputType;
        if (inputType === 'auto') {
          detectedType = this.detectInputType(input);
        }

        if (detectedType === 'url') {
          // Try web scraping first
          logger.info('Attempting web scraping', { url: input });
          try {
            const scrapeResult = await this.webScraper.handleToolCall('scrape_webpage', { url: input });
            const scrapeData = JSON.parse(scrapeResult.content[0].text);

            if (scrapeData.success) {
              const scrapedContent = scrapeData.data;
              contentData = {
                url: scrapedContent.url,
                title: scrapedContent.title,
                summary: scrapedContent.summary,
                topic,
                keyPoints: `Word count: ${scrapedContent.metadata.wordCount}. ${scrapedContent.metadata.description || ''}`
              };
              processingMethod = 'Web Scraping';
            } else {
              throw new Error('Web scraping failed');
            }
          } catch (webError) {
            logger.warn('Web scraping failed, cannot fallback to document processing for URL', { error: webError });
            throw new Error(`Web scraping failed: ${webError instanceof Error ? webError.message : String(webError)}`);
          }
        } else if (detectedType === 'file') {
          // Try document processing
          logger.info('Attempting document processing', { filePath: input });
          try {
            const docResult = await this.documentReader.handleToolCall('read_document', { filePath: input });
            const docData = JSON.parse(docResult.content[0].text);

            if (docData.success) {
              const documentContent = docData.data;
              contentData = {
                url: documentContent.filePath,
                title: documentContent.title,
                summary: documentContent.summary,
                topic,
                keyPoints: `${documentContent.metadata.format}. Word count: ${documentContent.metadata.wordCount}. ${documentContent.metadata.author ? `Author: ${documentContent.metadata.author}` : ''}`
              };
              processingMethod = 'Document Processing';
            } else {
              throw new Error('Document processing failed');
            }
          } catch (docError) {
            logger.error('Document processing failed', { error: docError });
            throw new Error(`Document processing failed: ${docError instanceof Error ? docError.message : String(docError)}`);
          }
        } else {
          throw new Error(`Unsupported input type: ${detectedType}`);
        }
      }

      // Save to Excel database
      logger.info('Saving content to Excel database');
      const excelResult = await this.excelManager.handleToolCall('add_content_entry', contentData);
      const excelData = JSON.parse(excelResult.content[0].text);

      if (!excelData.success) {
        throw new Error(`Excel save failed: ${excelData.error?.message || 'Unknown error'}`);
      }

      const response = {
        success: true,
        data: {
          workflow: 'analyze_content_workflow',
          input,
          processingMethod,
          content: {
            title: contentData.title,
            topic: contentData.topic,
            summary: contentData.summary
          },
          saved: {
            entry: excelData.entry,
            message: excelData.message
          },
          processingTime: Date.now()
        }
      };

      logger.info('Content analysis workflow completed', {
        input,
        processingMethod,
        title: contentData.title,
        topic: contentData.topic
      });

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(response)
        }]
      };

    } catch (error) {
      logger.error('Content analysis workflow failed', {
        input: args.input,
        error: error instanceof Error ? error.message : String(error)
      });

      return this.createErrorResponse(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private detectInputType(input: string): 'url' | 'file' {
    // Check if it's a URL
    try {
      new URL(input);
      return 'url';
    } catch {
      // Assume it's a file path
      return 'file';
    }
  }

  private async handleScrapeAndSaveContent(args: Record<string, any>) {
    try {
      // First, scrape the webpage
      const scrapeResult = await this.webScraper.handleToolCall('scrape_webpage', {
        url: args.url,
        maxContent: args.maxContent || 5000
      });

      // Parse the scrape result
      const scrapeData = JSON.parse(scrapeResult.content[0].text);

      if (!scrapeData.success) {
        throw new Error(`Scraping failed: ${scrapeData.error?.message || 'Unknown error'}`);
      }

      const scrapedContent = scrapeData.data;

      // Now add to Excel database
      const excelResult = await this.excelManager.handleToolCall('add_content_entry', {
        url: scrapedContent.url,
        title: scrapedContent.title,
        summary: scrapedContent.summary,
        topic: args.topic || 'Web Content',
        keyPoints: `Word count: ${scrapedContent.metadata.wordCount}. ${scrapedContent.metadata.description || ''}`
      });

      // Parse Excel result
      const excelData = JSON.parse(excelResult.content[0].text);

      if (!excelData.success) {
        throw new Error(`Excel save failed: ${excelData.error?.message || 'Unknown error'}`);
      }

      const response = {
        success: true,
        data: {
          workflow: 'scrape_and_save_content',
          scraped: {
            url: scrapedContent.url,
            title: scrapedContent.title,
            contentLength: scrapedContent.content.length,
            wordCount: scrapedContent.metadata.wordCount
          },
          saved: {
            entry: excelData.entry,
            message: excelData.message
          },
          processingTime: Date.now()
        }
      };

      logger.info('Scrape and save workflow completed', {
        url: args.url,
        title: scrapedContent.title,
        topic: args.topic || 'Web Content'
      });

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(response)
        }]
      };

    } catch (error) {
      logger.error('Scrape and save workflow failed', {
        url: args.url,
        error: error instanceof Error ? error.message : String(error)
      });

      return this.createErrorResponse(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private createErrorResponse(error: Error) {
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          success: false,
          error: {
            message: error.message,
            type: error.constructor.name,
            timestamp: new Date().toISOString()
          }
        })
      }]
    };
  }

  async start(): Promise<void> {
    try {
      // Get version info from package.json
      const serverInfo = await getServerInfo();

      // Initialize all servers
      await this.excelManager.initialize();
      await this.webScraper.initialize();
      await this.documentReader.initialize();

      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      logger.info('MCP Content Analyzer started successfully', {
        name: serverInfo.name,
        version: serverInfo.version,
        description: serverInfo.description,
        author: serverInfo.author,
        phase: 'Phase 4 - Document Processing Integration',
        excelDatabase: config.excel.databasePath
      });
    } catch (error) {
      logger.error('Failed to start server', {
        error: error instanceof Error ? error.message : String(error)
      });
      process.exit(1);
    }
  }
}

// Start server
const analyzer = new MCPContentAnalyzer();
analyzer.start().catch((error) => {
  console.error('Fatal error starting MCP server:', error);
  process.exit(1);
});