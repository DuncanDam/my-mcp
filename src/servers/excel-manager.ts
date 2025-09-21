import { BaseMCPServer } from './base-server.js';
import ExcelJS from 'exceljs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import type { MCPToolResponse } from '../types/mcp.js';
import type { ContentEntry, TopicCategory, DatabaseStats, SimilarContentMatch } from '../types/content.js';

export class ExcelManagerServer extends BaseMCPServer {
  private workbook: ExcelJS.Workbook | null = null;
  private filePath: string;

  constructor() {
    super('excel-manager');

    // Get absolute path to project root when run from Claude Desktop
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    // From dist/servers/excel-manager.js, go up 2 levels to project root
    const projectRoot = path.resolve(__dirname, '../..');

    // Use absolute path for Excel database
    if (path.isAbsolute(config.excel.databasePath)) {
      this.filePath = config.excel.databasePath;
    } else {
      this.filePath = path.resolve(projectRoot, config.excel.databasePath);
    }

    this.tools = [
      {
        name: 'add_content_entry',
        description: 'Add new content entry to Excel database',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'Source URL' },
            title: { type: 'string', description: 'Content title' },
            summary: { type: 'string', description: 'Content summary' },
            topic: { type: 'string', description: 'Topic category' },
            keyPoints: { type: 'string', description: 'Key points extracted' }
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
            query: { type: 'string', description: 'Search query text' }
          },
          required: ['query']
        }
      },
      {
        name: 'get_topic_categories',
        description: 'Get list of available topic categories',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_database_stats',
        description: 'Return Excel database metrics and statistics',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ];
  }

  async initialize(): Promise<void> {
    try {
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

      logger.info('Excel manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Excel manager', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  private async createDefaultExcelStructure(): Promise<void> {
    if (!this.workbook) throw new Error('Workbook not initialized');

    // Ensure directory exists
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });

    // Create main content worksheet
    // Column structure: 1=dateAdded, 2=sourceUrl, 3=title, 4=summary, 5=topicCategory, 6=keyPoints, 7=status
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
    const defaultTopics: TopicCategory[] = [
      {
        category: 'AI Research',
        description: 'Artificial Intelligence research and developments',
        keywords: 'ai, artificial intelligence, machine learning, neural networks'
      },
      {
        category: 'Technology Trends',
        description: 'Latest technology trends and innovations',
        keywords: 'tech, innovation, trends, digital transformation'
      },
      {
        category: 'Business Strategy',
        description: 'Business strategy and management insights',
        keywords: 'business, strategy, management, leadership'
      }
    ];

    topicsSheet.addRows(defaultTopics);

    // Save the file
    await this.workbook.xlsx.writeFile(this.filePath);
  }

  async handleToolCall(name: string, args: Record<string, any>): Promise<MCPToolResponse> {
    if (!this.workbook) {
      await this.initialize();
    }

    try {
      switch (name) {
        case 'add_content_entry':
          return await this.addContentEntry(args as Partial<ContentEntry>);
        case 'search_similar_content':
          return await this.searchSimilarContent(args.query);
        case 'get_topic_categories':
          return await this.getTopicCategories();
        case 'get_database_stats':
          return await this.getDatabaseStats();
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      logger.error(`Excel tool call failed: ${name}`, {
        error: error instanceof Error ? error.message : String(error),
        args
      });
      return this.createErrorResponse(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private async addContentEntry(data: Record<string, any>): Promise<MCPToolResponse> {
    if (!this.workbook) throw new Error('Workbook not initialized');

    const worksheet = this.workbook.getWorksheet('Content Database');
    if (!worksheet) throw new Error('Content Database worksheet not found');

    const newRow: ContentEntry = {
      dateAdded: new Date().toISOString().split('T')[0],
      sourceUrl: data.url || '',
      title: data.title || '',
      summary: data.summary || '',
      topicCategory: data.topic || 'Uncategorized',
      keyPoints: data.keyPoints || '',
      status: 'New'
    };

    // Add row using explicit column values to ensure proper saving
    const rowData = [
      newRow.dateAdded,
      newRow.sourceUrl,
      newRow.title,
      newRow.summary,
      newRow.topicCategory,
      newRow.keyPoints,
      newRow.status
    ];

    const addedRow = worksheet.addRow(rowData);

    // Force commit the row
    addedRow.commit();

    logger.info('Row added to worksheet', {
      rowNumber: addedRow.number,
      values: rowData
    });

    // Save the file
    await this.saveExcelFile();

    logger.info('Added content entry', { title: data.title, topic: data.topic });

    return this.createSuccessResponse({
      success: true,
      message: 'Entry added successfully to Excel database',
      entry: newRow
    });
  }

  private async saveExcelFile(): Promise<void> {
    if (!this.workbook) throw new Error('Workbook not initialized');

    try {
      if (config.excel.backupEnabled) {
        // Create backup
        const backupPath = this.filePath.replace('.xlsx', `-backup-${Date.now()}.xlsx`);
        await this.workbook.xlsx.writeFile(backupPath);
        logger.info('Created Excel backup', { backupPath });
      }

      // Save main file with explicit error handling
      await this.workbook.xlsx.writeFile(this.filePath);
      logger.info('Excel file saved successfully', { filePath: this.filePath });

      // Verify the save by checking file modification time
      const fs = await import('fs/promises');
      const stats = await fs.stat(this.filePath);
      logger.info('Excel file verification', {
        size: stats.size,
        lastModified: stats.mtime.toISOString()
      });

    } catch (error) {
      logger.error('Failed to save Excel file', {
        error: error instanceof Error ? error.message : String(error),
        filePath: this.filePath
      });
      throw new Error(`Excel save failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async searchSimilarContent(query: string): Promise<MCPToolResponse> {
    if (!this.workbook) throw new Error('Workbook not initialized');

    const worksheet = this.workbook.getWorksheet('Content Database');
    if (!worksheet) throw new Error('Content Database worksheet not found');

    const rows: any[] = [];

    try {
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
          try {
            rows.push({
              rowNumber,
              title: row.getCell(3)?.value?.toString() || '', // Column 3 = title
              summary: row.getCell(4)?.value?.toString() || '', // Column 4 = summary
              keyPoints: row.getCell(6)?.value?.toString() || '', // Column 6 = keyPoints
              topicCategory: row.getCell(5)?.value?.toString() || '' // Column 5 = topicCategory
            });
          } catch (cellError) {
            logger.error('Failed to read row data', { 
              rowNumber, 
              error: cellError instanceof Error ? cellError.message : String(cellError) 
            });
            // Skip this row but continue processing others
            return; // Exit this row iteration
          }
        }
      });
    } catch (error) {
      logger.error('Error during content search', { 
        error: error instanceof Error ? error.message : String(error),
        query 
      });
      throw new Error(`Failed to search content: ${error instanceof Error ? error.message : String(error)}`);
    }

    const matches = rows.filter(row => {
      const title = row.title.toString().toLowerCase();
      const summary = row.summary.toString().toLowerCase();
      const keyPoints = row.keyPoints.toString().toLowerCase();
      const searchTerms = query.toLowerCase();

      return title.includes(searchTerms) ||
             summary.includes(searchTerms) ||
             keyPoints.includes(searchTerms);
    });

    const results: SimilarContentMatch[] = matches.slice(0, 5).map((row, index) => ({
      entry_id: `entry_${row.rowNumber}`,
      title: row.title.toString(),
      summary: row.summary.toString().substring(0, 100) + '...',
      topic: row.topicCategory.toString(),
      similarity_score: 0.8 - (index * 0.1) // Simplified scoring
    }));

    logger.info('Search completed', { query, resultsFound: results.length });

    return this.createSuccessResponse({
      success: true,
      results,
      query,
      total_matches: results.length
    });
  }

  private async getTopicCategories(): Promise<MCPToolResponse> {
    if (!this.workbook) throw new Error('Workbook not initialized');

    const topicsSheet = this.workbook.getWorksheet('Topics');
    if (!topicsSheet) {
      return this.createSuccessResponse({
        success: true,
        categories: ['AI Research', 'Technology Trends', 'Business Strategy']
      });
    }

    const topics: string[] = [];
    try {
      topicsSheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
          try {
            const category = row.getCell(1)?.value; // Column 1 = category
            if (category) {
              topics.push(category.toString());
            }
          } catch (cellError) {
            logger.error('Failed to read topic category', { 
              rowNumber, 
              error: cellError instanceof Error ? cellError.message : String(cellError) 
            });
            // Skip this row but continue processing others
            return; // Exit this row iteration
          }
        }
      });
    } catch (error) {
      logger.error('Error reading topic categories', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw new Error(`Failed to read topic categories: ${error instanceof Error ? error.message : String(error)}`);
    }

    return this.createSuccessResponse({
      success: true,
      categories: topics,
      total: topics.length
    });
  }

  private async getDatabaseStats(): Promise<MCPToolResponse> {
    if (!this.workbook) throw new Error('Workbook not initialized');

    const worksheet = this.workbook.getWorksheet('Content Database');
    if (!worksheet) throw new Error('Content Database worksheet not found');

    let totalEntries = 0;
    const topicCounts: Record<string, number> = {};

    // Use safer row iteration with proper bounds checking
    const rowCount = worksheet.rowCount;
    logger.info('Getting database stats', { totalRows: rowCount });

    try {
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1 && rowNumber <= rowCount) { // Skip header row and check bounds
          totalEntries++;
          
          // Use column index (5) instead of key for more reliable access
          // Column 5 is 'Topic Category' based on the worksheet structure
          let topic = 'Uncategorized';
          try {
            const topicCell = row.getCell(5); // Column index 5 = topicCategory
            if (topicCell && topicCell.value) {
              topic = topicCell.value.toString();
            }
          } catch (cellError) {
            logger.error('Failed to read topic cell', { 
              rowNumber, 
              error: cellError instanceof Error ? cellError.message : String(cellError) 
            });
            // Skip this row but continue processing others
            return; // Exit this row iteration
          }
          
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        }
      });
    } catch (error) {
      logger.error('Error iterating worksheet rows', { 
        error: error instanceof Error ? error.message : String(error),
        rowCount 
      });
      throw new Error(`Failed to read worksheet data: ${error instanceof Error ? error.message : String(error)}`);
    }

    const stats: DatabaseStats = {
      total_entries: totalEntries,
      topic_breakdown: topicCounts,
      last_updated: new Date().toISOString().split('T')[0],
      most_popular_topic: Object.keys(topicCounts).length > 0 
        ? Object.keys(topicCounts).reduce((a, b) =>
            topicCounts[a] > topicCounts[b] ? a : b)
        : 'None',
      excel_file_path: this.filePath
    };

    logger.info('Database stats calculated', { totalEntries, topicsFound: Object.keys(topicCounts).length });

    return this.createSuccessResponse({
      success: true,
      stats
    });
  }
}