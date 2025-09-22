import { BaseMCPServer } from './base-server.js';
import ExcelJS from 'exceljs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import type { MCPToolResponse } from '../types/mcp.js';
import type {
  ContentEntry,
  EnhancedTopicCategory,
  DatabaseStats,
  SimilarContentMatch
} from '../types/content.js';

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

    // Create content worksheet with clean column headers (no A:B: prefixes)
    const worksheet = this.workbook.addWorksheet('Content Database');
    worksheet.columns = [
      // Core Content Information
      { header: 'Source URL', key: 'sourceUrl', width: 50 },
      { header: 'Title', key: 'title', width: 60 },
      { header: 'Summary', key: 'summary', width: 80 },
      { header: 'Key Points', key: 'keyPoints', width: 60 },

      // Content Analysis
      { header: 'Content Type', key: 'contentType', width: 20 },
      { header: 'Primary Topic', key: 'primaryTopic', width: 30 },
      { header: 'Chapter Relevance', key: 'chapterRelevance', width: 30 },
      { header: 'Cultural Relevance Score', key: 'culturalRelevanceScore', width: 20 },

      // Quality Assessment
      { header: 'Actionability Score', key: 'actionabilityScore', width: 20 },
      { header: 'Evidence Quality Score', key: 'evidenceQualityScore', width: 20 },
      { header: 'Usability Score', key: 'usabilityScore', width: 18 },
      { header: 'Overall Quality Score', key: 'overallQualityScore', width: 20 },

      // Vietnamese Context Analysis
      { header: 'HCMC Context Relevance', key: 'hcmcContextRelevance', width: 25 },
      { header: 'Family Collaboration Support', key: 'familyCollaborationSupport', width: 30 },
      { header: 'Generational Bridge Value', key: 'generationalBridgeValue', width: 25 },
      { header: 'Conversation Framework Potential', key: 'conversationFrameworkPotential', width: 30 },

      // Implementation Details
      { header: 'Implementation Tools Available', key: 'implementationTools', width: 35 },
      { header: 'Timeline Guidance', key: 'timelineGuidance', width: 25 },
      { header: 'Family Exercise Potential', key: 'familyExercisePotential', width: 30 },
      { header: 'Real World Examples', key: 'realWorldExamples', width: 25 },

      // Source Information
      { header: 'Author', key: 'author', width: 30 },
      { header: 'Publication Date', key: 'publicationDate', width: 15 },
      { header: 'Source Type', key: 'sourceType', width: 20 },
      { header: 'Source Credibility', key: 'sourceCredibility', width: 20 },
      { header: 'Language', key: 'language', width: 15 },

      // Processing Status
      { header: 'Processing Status', key: 'processingStatus', width: 20 },
      { header: 'Priority Level', key: 'priorityLevel', width: 15 },
      { header: 'Usage Notes', key: 'usageNotes', width: 50 },

      // System fields
      { header: 'Date Added', key: 'dateAdded', width: 15 },
      { header: 'Last Modified', key: 'lastModified', width: 15 }
    ];

    // Create enhanced topics worksheet
    const topicsSheet = this.workbook.addWorksheet('Topics');
    topicsSheet.columns = [
      { header: 'Category', key: 'category', width: 30 },
      { header: 'Description', key: 'description', width: 60 },
      { header: 'Keywords', key: 'keywords', width: 50 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Chapter Mapping', key: 'chapterMapping', width: 25 }
    ];

    // Add enhanced default topics based on book structure
    const enhancedTopics: EnhancedTopicCategory[] = [
      // Primary Categories (Book Chapters)
      {
        category: 'Communication Bridge',
        description: 'Articles about parent-child dialogue and communication strategies',
        keywords: ['dialogue', 'communication', 'conversation', 'parent-child', 'understanding'],
        type: 'primary',
        chapterMapping: 'Chapter 1'
      },
      {
        category: 'Saigon Decision',
        description: 'Location and opportunity discussions for family planning',
        keywords: ['location', 'opportunity', 'decision-making', 'family-planning', 'geography'],
        type: 'primary',
        chapterMapping: 'Chapter 2'
      },
      {
        category: 'Generational Learning',
        description: 'Success playbook differences between generations',
        keywords: ['generational-gap', 'learning-styles', 'success-strategies', 'mentorship'],
        type: 'primary',
        chapterMapping: 'Chapter 3'
      },
      {
        category: 'Common Ground',
        description: 'Finding shared values and goals between family members',
        keywords: ['shared-values', 'family-goals', 'common-interests', 'unity'],
        type: 'primary',
        chapterMapping: 'Chapter 4'
      },
      {
        category: 'Family Stories',
        description: 'Real case studies and family experiences',
        keywords: ['case-studies', 'family-experiences', 'real-stories', 'examples'],
        type: 'primary',
        chapterMapping: 'Chapter 5'
      },
      {
        category: '4-Year Journey',
        description: 'University process and family support throughout education',
        keywords: ['university', 'education', 'college-planning', 'academic-support'],
        type: 'primary',
        chapterMapping: 'Chapter 6'
      },
      {
        category: 'Practical Implementation',
        description: 'Financial, housing, network planning and practical steps',
        keywords: ['practical-steps', 'implementation', 'planning', 'execution'],
        type: 'primary',
        chapterMapping: 'Chapter 7'
      },

      // Secondary Tags
      {
        category: 'Financial Planning',
        description: 'Budgets, costs, ROI calculations for education and family decisions',
        keywords: ['budget', 'costs', 'roi', 'financial-planning', 'investment'],
        type: 'secondary'
      },
      {
        category: 'Career Pathways',
        description: 'Different success routes and career opportunities',
        keywords: ['career', 'pathways', 'success-routes', 'opportunities'],
        type: 'secondary'
      },
      {
        category: 'University Selection',
        description: 'School choice and admission processes',
        keywords: ['university-selection', 'admissions', 'school-choice', 'education'],
        type: 'secondary'
      },
      {
        category: 'Family Dynamics',
        description: 'Relationships and communication patterns within families',
        keywords: ['family-relationships', 'dynamics', 'communication-patterns'],
        type: 'secondary'
      },
      {
        category: 'Cultural Context',
        description: 'Vietnamese family traditions and cultural expectations',
        keywords: ['vietnamese-culture', 'traditions', 'cultural-expectations', 'heritage'],
        type: 'secondary'
      },
      {
        category: 'Emotional Support',
        description: 'Anxiety, stress, and confidence building strategies',
        keywords: ['emotional-support', 'anxiety', 'stress-management', 'confidence'],
        type: 'secondary'
      }
    ];

    topicsSheet.addRows(enhancedTopics.map(topic => ({
      category: topic.category,
      description: topic.description,
      keywords: topic.keywords.join(', '),
      type: topic.type,
      chapterMapping: topic.chapterMapping || ''
    })));

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

    const currentDate = new Date().toISOString().split('T')[0];

    // Create comprehensive content entry with all fields properly filled
    const contentEntry = {
      // Core Content Information
      sourceUrl: data.url || data.sourceUrl || '',
      title: data.title || '',
      summary: data.summary || '',
      keyPoints: data.keyPoints || '',

      // Content Analysis
      contentType: data.contentType || this.determineContentType(data),
      primaryTopic: data.topic || data.primaryTopic || 'Uncategorized',
      chapterRelevance: data.chapterRelevance || this.determineChapterRelevance(data),
      culturalRelevanceScore: data.culturalRelevanceScore || this.calculateCulturalRelevance(data),

      // Quality Assessment (1-10 scale)
      actionabilityScore: data.actionabilityScore || this.calculateActionabilityScore(data),
      evidenceQualityScore: data.evidenceQualityScore || this.calculateEvidenceQuality(data),
      usabilityScore: data.usabilityScore || this.calculateUsabilityScore(data),
      overallQualityScore: data.overallQualityScore || this.calculateOverallQuality(data),

      // Vietnamese Context Analysis
      hcmcContextRelevance: data.hcmcContextRelevance || this.assessHCMCRelevance(data),
      familyCollaborationSupport: data.familyCollaborationSupport || this.assessCollaborationSupport(data),
      generationalBridgeValue: data.generationalBridgeValue || this.assessGenerationalBridge(data),
      conversationFrameworkPotential: data.conversationFrameworkPotential || this.assessConversationPotential(data),

      // Implementation Details
      implementationTools: data.implementationTools || this.identifyImplementationTools(data),
      timelineGuidance: data.timelineGuidance || this.assessTimelineGuidance(data),
      familyExercisePotential: data.familyExercisePotential || this.assessFamilyExercisePotential(data),
      realWorldExamples: data.realWorldExamples || this.identifyRealWorldExamples(data),

      // Source Information
      author: data.author || '',
      publicationDate: data.publicationDate || '',
      sourceType: data.sourceType || this.determineSourceType(data),
      sourceCredibility: data.sourceCredibility || 'Medium',
      language: data.language || 'English',

      // Processing Status
      processingStatus: data.processingStatus || 'New',
      priorityLevel: data.priorityLevel || this.calculatePriorityLevel(data),
      usageNotes: data.usageNotes || '',

      // System fields
      dateAdded: currentDate,
      lastModified: currentDate
    };

    // Convert to array in correct column order
    const rowData = [
      contentEntry.sourceUrl,
      contentEntry.title,
      contentEntry.summary,
      contentEntry.keyPoints,
      contentEntry.contentType,
      contentEntry.primaryTopic,
      contentEntry.chapterRelevance,
      contentEntry.culturalRelevanceScore,
      contentEntry.actionabilityScore,
      contentEntry.evidenceQualityScore,
      contentEntry.usabilityScore,
      contentEntry.overallQualityScore,
      contentEntry.hcmcContextRelevance,
      contentEntry.familyCollaborationSupport,
      contentEntry.generationalBridgeValue,
      contentEntry.conversationFrameworkPotential,
      contentEntry.implementationTools,
      contentEntry.timelineGuidance,
      contentEntry.familyExercisePotential,
      contentEntry.realWorldExamples,
      contentEntry.author,
      contentEntry.publicationDate,
      contentEntry.sourceType,
      contentEntry.sourceCredibility,
      contentEntry.language,
      contentEntry.processingStatus,
      contentEntry.priorityLevel,
      contentEntry.usageNotes,
      contentEntry.dateAdded,
      contentEntry.lastModified
    ];

    const addedRow = worksheet.addRow(rowData);
    addedRow.commit();

    logger.info('Added comprehensive content entry', {
      rowNumber: addedRow.number,
      title: contentEntry.title,
      topic: contentEntry.primaryTopic,
      qualityScore: contentEntry.overallQualityScore
    });

    // Save the file
    await this.saveExcelFile();

    return this.createSuccessResponse({
      success: true,
      message: 'Content entry added successfully to Excel database',
      entry: contentEntry,
      rowNumber: addedRow.number
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
              sourceUrl: row.getCell(1)?.value?.toString() || '', // Column 1 = sourceUrl
              title: row.getCell(2)?.value?.toString() || '', // Column 2 = title
              summary: row.getCell(3)?.value?.toString() || '', // Column 3 = summary
              keyPoints: row.getCell(4)?.value?.toString() || '', // Column 4 = keyPoints
              primaryTopic: row.getCell(6)?.value?.toString() || '', // Column 6 = primaryTopic
              chapterRelevance: row.getCell(7)?.value?.toString() || '', // Column 7 = chapterRelevance
              overallQualityScore: row.getCell(12)?.value?.toString() || '' // Column 12 = overallQualityScore
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

    const searchTerms = query.toLowerCase();
    const matches = rows.filter(row => {
      const title = row.title.toString().toLowerCase();
      const summary = row.summary.toString().toLowerCase();
      const keyPoints = row.keyPoints.toString().toLowerCase();
      const topic = row.primaryTopic.toString().toLowerCase();
      const chapter = row.chapterRelevance.toString().toLowerCase();

      return title.includes(searchTerms) ||
             summary.includes(searchTerms) ||
             keyPoints.includes(searchTerms) ||
             topic.includes(searchTerms) ||
             chapter.includes(searchTerms);
    });

    // Sort by quality score (higher first) and relevance
    matches.sort((a, b) => {
      const scoreA = parseFloat(a.overallQualityScore) || 0;
      const scoreB = parseFloat(b.overallQualityScore) || 0;
      return scoreB - scoreA;
    });

    const results: SimilarContentMatch[] = matches.slice(0, 5).map((row, index) => ({
      entry_id: `entry_${row.rowNumber}`,
      title: row.title.toString(),
      summary: row.summary.toString().substring(0, 150) + '...',
      topic: row.primaryTopic.toString(),
      chapter: row.chapterRelevance.toString(),
      quality_score: parseFloat(row.overallQualityScore) || 0,
      source_url: row.sourceUrl.toString(),
      similarity_score: Math.max(0.9 - (index * 0.1), 0.5) // Higher scores for better matches
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

          // Column 6 is 'Primary Topic' in the new structure
          let topic = 'Uncategorized';
          try {
            const topicCell = row.getCell(6); // Column index 6 = primaryTopic
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

  // Helper methods for content analysis and scoring
  private determineContentType(data: Record<string, any>): string {
    const summary = (data.summary || '').toLowerCase();
    const keyPoints = (data.keyPoints || '').toLowerCase();

    if (summary.includes('conversation') || summary.includes('dialogue') || keyPoints.includes('script')) {
      return 'Conversation Framework';
    }
    if (summary.includes('tool') || summary.includes('template') || summary.includes('checklist')) {
      return 'Planning Tool';
    }
    if (summary.includes('case study') || summary.includes('story') || summary.includes('example')) {
      return 'Case Study';
    }
    if (summary.includes('research') || summary.includes('study') || summary.includes('data')) {
      return 'Research Article';
    }
    if (summary.includes('guide') || summary.includes('implementation') || summary.includes('how to')) {
      return 'Implementation Guide';
    }
    return 'General Article';
  }

  private determineChapterRelevance(data: Record<string, any>): string {
    const content = ((data.summary || '') + ' ' + (data.keyPoints || '') + ' ' + (data.title || '')).toLowerCase();

    if (content.includes('location') || content.includes('saigon') || content.includes('hcmc') || content.includes('decision')) {
      return 'Chapter 1: Saigon Decision';
    }
    if (content.includes('generation') || content.includes('communication') || content.includes('bridge')) {
      return 'Chapter 2: Generational Bridge';
    }
    if (content.includes('common') || content.includes('voice') || content.includes('alignment')) {
      return 'Chapter 3: Common Voice';
    }
    if (content.includes('story') || content.includes('family') || content.includes('case')) {
      return 'Chapter 4: Family Stories';
    }
    if (content.includes('university') || content.includes('4-year') || content.includes('journey')) {
      return 'Chapter 5: University Journey';
    }
    if (content.includes('practical') || content.includes('implementation') || content.includes('reality')) {
      return 'Chapter 6: Practical Implementation';
    }
    return 'General/Multiple Chapters';
  }

  private calculateCulturalRelevance(data: Record<string, any>): string {
    const content = ((data.summary || '') + ' ' + (data.keyPoints || '')).toLowerCase();
    let score = 0.5; // Default medium relevance

    // High relevance indicators
    if (content.includes('vietnamese') || content.includes('vietnam') || content.includes('asian family')) score += 0.3;
    if (content.includes('hcmc') || content.includes('ho chi minh') || content.includes('saigon')) score += 0.2;
    if (content.includes('family collaboration') || content.includes('together') || content.includes('cùng nhau')) score += 0.2;
    if (content.includes('generation') && content.includes('parent')) score += 0.1;

    // Return categorical score
    if (score >= 0.8) return 'High (0.8-1.0)';
    if (score >= 0.5) return 'Medium (0.5-0.7)';
    if (score >= 0.2) return 'Low (0.2-0.4)';
    return 'Minimal (0.0-0.1)';
  }

  private calculateActionabilityScore(data: Record<string, any>): number {
    const content = ((data.summary || '') + ' ' + (data.keyPoints || '')).toLowerCase();
    let score = 5; // Base score

    if (content.includes('tool') || content.includes('template') || content.includes('framework')) score += 2;
    if (content.includes('conversation') || content.includes('dialogue') || content.includes('script')) score += 2;
    if (content.includes('step') || content.includes('guide') || content.includes('implementation')) score += 1;
    if (content.includes('exercise') || content.includes('activity') || content.includes('checklist')) score += 1;

    return Math.min(score, 10);
  }

  private calculateEvidenceQuality(data: Record<string, any>): number {
    const content = ((data.summary || '') + ' ' + (data.keyPoints || '')).toLowerCase();
    let score = 5; // Base score

    if (content.includes('research') || content.includes('study') || content.includes('data')) score += 2;
    if (content.includes('case study') || content.includes('example') || content.includes('real')) score += 1;
    if (content.includes('statistics') || content.includes('survey') || content.includes('evidence')) score += 1;
    if (data.author && data.author.length > 0) score += 1;

    return Math.min(score, 10);
  }

  private calculateUsabilityScore(data: Record<string, any>): number {
    const summary = (data.summary || '');
    let score = 5; // Base score

    if (summary.length > 100 && summary.length < 500) score += 2; // Good length
    if (summary.includes('step') || summary.includes('how to') || summary.includes('guide')) score += 2;
    if (!summary.includes('theoretical') && !summary.includes('academic')) score += 1;

    return Math.min(score, 10);
  }

  private calculateOverallQuality(data: Record<string, any>): number {
    const actionability = this.calculateActionabilityScore(data);
    const evidence = this.calculateEvidenceQuality(data);
    const usability = this.calculateUsabilityScore(data);

    // Weighted average: 35% actionability, 30% cultural relevance (estimated as 7), 20% evidence, 15% usability
    return Math.round((actionability * 0.35 + 7 * 0.30 + evidence * 0.20 + usability * 0.15));
  }

  private assessHCMCRelevance(data: Record<string, any>): string {
    const content = ((data.summary || '') + ' ' + (data.keyPoints || '')).toLowerCase();

    if (content.includes('hcmc') || content.includes('ho chi minh') || content.includes('saigon')) return 'Direct';
    if (content.includes('urban') || content.includes('city') || content.includes('location')) return 'Adaptable';
    if (content.includes('university') || content.includes('education')) return 'General';
    return 'Limited';
  }

  private assessCollaborationSupport(data: Record<string, any>): string {
    const content = ((data.summary || '') + ' ' + (data.keyPoints || '')).toLowerCase();

    if (content.includes('family') && (content.includes('together') || content.includes('collaboration'))) return 'Strong';
    if (content.includes('parent') && content.includes('child') && content.includes('decision')) return 'Moderate';
    if (content.includes('communication') || content.includes('dialogue')) return 'Basic';
    return 'Limited';
  }

  private assessGenerationalBridge(data: Record<string, any>): string {
    const content = ((data.summary || '') + ' ' + (data.keyPoints || '')).toLowerCase();

    if (content.includes('generation') && (content.includes('bridge') || content.includes('gap'))) return 'High';
    if (content.includes('parent') && content.includes('child') && content.includes('understanding')) return 'Medium';
    if (content.includes('communication') && content.includes('family')) return 'Low';
    return 'None';
  }

  private assessConversationPotential(data: Record<string, any>): string {
    const content = ((data.summary || '') + ' ' + (data.keyPoints || '')).toLowerCase();

    if (content.includes('conversation') || content.includes('dialogue') || content.includes('script')) return 'High';
    if (content.includes('discussion') || content.includes('talk') || content.includes('communication')) return 'Medium';
    if (content.includes('framework') || content.includes('guide')) return 'Low';
    return 'None';
  }

  private identifyImplementationTools(data: Record<string, any>): string {
    const content = ((data.summary || '') + ' ' + (data.keyPoints || '')).toLowerCase();
    const tools = [];

    if (content.includes('template')) tools.push('Templates');
    if (content.includes('checklist')) tools.push('Checklists');
    if (content.includes('worksheet')) tools.push('Worksheets');
    if (content.includes('framework')) tools.push('Frameworks');
    if (content.includes('tool')) tools.push('Tools');

    return tools.length > 0 ? tools.join(', ') : 'None identified';
  }

  private assessTimelineGuidance(data: Record<string, any>): string {
    const content = ((data.summary || '') + ' ' + (data.keyPoints || '')).toLowerCase();

    if (content.includes('timeline') || content.includes('schedule')) return 'Detailed';
    if (content.includes('step') || content.includes('phase')) return 'Sequential';
    if (content.includes('time') || content.includes('month') || content.includes('year')) return 'Basic';
    return 'None';
  }

  private assessFamilyExercisePotential(data: Record<string, any>): string {
    const content = ((data.summary || '') + ' ' + (data.keyPoints || '')).toLowerCase();

    if (content.includes('exercise') || content.includes('activity')) return 'Direct';
    if (content.includes('discussion') || content.includes('planning')) return 'Adaptable';
    if (content.includes('assessment') || content.includes('evaluation')) return 'Basic';
    return 'Limited';
  }

  private identifyRealWorldExamples(data: Record<string, any>): string {
    const content = ((data.summary || '') + ' ' + (data.keyPoints || '')).toLowerCase();

    if (content.includes('case study') || content.includes('example') || content.includes('story')) return 'Yes';
    if (content.includes('scenario') || content.includes('situation')) return 'Some';
    return 'None';
  }

  private determineSourceType(data: Record<string, any>): string {
    const url = (data.url || data.sourceUrl || '').toLowerCase();

    if (url.includes('academic') || url.includes('.edu') || url.includes('journal')) return 'Academic';
    if (url.includes('blog') || url.includes('medium') || url.includes('substack')) return 'Blog';
    if (url.includes('news') || url.includes('article')) return 'News Article';
    if (url.includes('government') || url.includes('.gov')) return 'Government';
    return 'Website';
  }

  private calculatePriorityLevel(data: Record<string, any>): string {
    const overallScore = this.calculateOverallQuality(data);
    const actionabilityScore = this.calculateActionabilityScore(data);

    if (overallScore >= 8 && actionabilityScore >= 8) return 'High';
    if (overallScore >= 6 && actionabilityScore >= 6) return 'Medium';
    return 'Low';
  }
}