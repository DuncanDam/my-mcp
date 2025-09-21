import { BaseMCPServer } from './base-server.js';
import { chromium, type Browser } from 'playwright';
import { ContentExtractor } from '../utils/content-extractor.js';
import { logger } from '../utils/logger.js';
import type { MCPToolResponse } from '../types/mcp.js';
import type { ScrapedContent, URLAccessibilityResult } from '../types/content.js';

export class WebScraperServer extends BaseMCPServer {
  private browser: Browser | null = null;

  constructor() {
    super('web-scraper');

    this.tools = [
      {
        name: 'scrape_webpage',
        description: 'Extract content from a webpage URL with metadata',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to scrape content from'
            },
            maxContent: {
              type: 'number',
              description: 'Maximum content length (default: 5000)',
              default: 5000
            },
            timeout: {
              type: 'number',
              description: 'Request timeout in milliseconds (default: 30000)',
              default: 30000
            }
          },
          required: ['url']
        }
      },
      {
        name: 'check_url_accessibility',
        description: 'Check if a URL is accessible and return status information',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to check accessibility'
            },
            timeout: {
              type: 'number',
              description: 'Request timeout in milliseconds (default: 10000)',
              default: 10000
            }
          },
          required: ['url']
        }
      }
    ];
  }

  async initialize(): Promise<void> {
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });

      logger.info('Web scraper browser initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize web scraper browser', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
        this.browser = null;
        logger.info('Web scraper browser closed successfully');
      } catch (error) {
        logger.error('Failed to close web scraper browser', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  async handleToolCall(name: string, args: Record<string, any>): Promise<MCPToolResponse> {
    if (!this.browser) {
      await this.initialize();
    }

    try {
      switch (name) {
        case 'scrape_webpage':
          return await this.scrapeWebpage(args.url, args.maxContent, args.timeout);
        case 'check_url_accessibility':
          return await this.checkUrlAccessibility(args.url, args.timeout);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      logger.error(`Web scraper tool call failed: ${name}`, {
        error: error instanceof Error ? error.message : String(error),
        args
      });
      return this.createErrorResponse(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private async scrapeWebpage(
    url: string,
    maxContent: number = 5000,
    timeout: number = 30000
  ): Promise<MCPToolResponse> {
    if (!ContentExtractor.isValidUrl(url)) {
      throw new Error(`Invalid URL format: ${url}`);
    }

    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();
    const startTime = Date.now();

    try {
      // Set user agent to avoid bot detection
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });

      // Navigate to the page
      const response = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout
      });

      if (!response) {
        throw new Error('Failed to load page - no response received');
      }

      if (!response.ok()) {
        throw new Error(`Failed to load page - HTTP ${response.status()}: ${response.statusText()}`);
      }

      // Wait for content to load
      await page.waitForTimeout(2000);

      // Get page content
      const html = await page.content();
      const title = ContentExtractor.extractTitle(html, url);
      const textContent = ContentExtractor.extractTextContent(html);
      const metadata = ContentExtractor.extractMetaData(html);

      // Limit content length
      const limitedContent = textContent.length > maxContent
        ? textContent.substring(0, maxContent) + '...'
        : textContent;

      const summary = ContentExtractor.generateSummary(limitedContent, 500);

      const scrapedContent: ScrapedContent = {
        url: ContentExtractor.normalizeUrl(url),
        title,
        content: limitedContent,
        summary,
        metadata: {
          ...metadata,
          responseTime: Date.now() - startTime
        },
        extractedAt: new Date().toISOString()
      };

      logger.info('Successfully scraped webpage', {
        url,
        title,
        contentLength: limitedContent.length,
        wordCount: metadata.wordCount,
        responseTime: Date.now() - startTime
      });

      return this.createSuccessResponse({
        success: true,
        data: scrapedContent,
        metadata: {
          processingTime: Date.now() - startTime,
          contentTruncated: textContent.length > maxContent
        }
      });

    } finally {
      await page.close();
    }
  }

  private async checkUrlAccessibility(
    url: string,
    timeout: number = 10000
  ): Promise<MCPToolResponse> {
    if (!ContentExtractor.isValidUrl(url)) {
      throw new Error(`Invalid URL format: ${url}`);
    }

    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();
    const startTime = Date.now();

    try {
      const response = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout
      });

      const responseTime = Date.now() - startTime;
      const result: URLAccessibilityResult = {
        url: ContentExtractor.normalizeUrl(url),
        accessible: response !== null && response.ok(),
        responseTime,
        checkedAt: new Date().toISOString()
      };

      if (response) {
        result.statusCode = response.status();
      }

      if (!response) {
        result.error = 'No response received';
      } else if (!response.ok()) {
        result.error = `HTTP ${response.status()}: ${response.statusText()}`;
      }

      logger.info('URL accessibility check completed', {
        url,
        accessible: result.accessible,
        statusCode: result.statusCode,
        responseTime
      });

      return this.createSuccessResponse({
        success: true,
        data: result
      });

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const result: URLAccessibilityResult = {
        url: ContentExtractor.normalizeUrl(url),
        accessible: false,
        error: error instanceof Error ? error.message : String(error),
        responseTime,
        checkedAt: new Date().toISOString()
      };

      logger.info('URL accessibility check failed', {
        url,
        error: result.error,
        responseTime
      });

      return this.createSuccessResponse({
        success: true,
        data: result
      });

    } finally {
      await page.close();
    }
  }
}