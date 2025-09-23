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
        name: 'delete_content_entry',
        description: 'Delete content entry from Excel database by row number',
        inputSchema: {
          type: 'object',
          properties: {
            rowNumber: { type: 'number', description: 'Row number to delete (starting from 2)' }
          },
          required: ['rowNumber']
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
        // Load existing file with all formatting preserved
        await this.workbook.xlsx.readFile(this.filePath);
        logger.info('Loaded existing Excel database with formatting preserved', { filePath: this.filePath });
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

    // Create content worksheet with enhanced formatting and text wrapping
    const worksheet = this.workbook.addWorksheet('Content Database');
    worksheet.columns = [
      // Core Content Information - with enhanced widths and wrapping
      { header: 'Source URL', key: 'sourceUrl', width: 25 },
      { header: 'Title', key: 'title', width: 35 },
      { header: 'Summary', key: 'summary', width: 50 },
      { header: 'Key Points', key: 'keyPoints', width: 40 },

      // Content Analysis
      { header: 'Content Type', key: 'contentType', width: 18 },
      { header: 'Primary Topic', key: 'primaryTopic', width: 22 },
      { header: 'Chapter Relevance', key: 'chapterRelevance', width: 28 },
      { header: 'Cultural Relevance Score', key: 'culturalRelevanceScore', width: 20 },

      // Quality Assessment
      { header: 'Actionability Score', key: 'actionabilityScore', width: 15 },
      { header: 'Evidence Quality Score', key: 'evidenceQualityScore', width: 18 },
      { header: 'Usability Score', key: 'usabilityScore', width: 15 },
      { header: 'Overall Quality Score', key: 'overallQualityScore', width: 18 },

      // Vietnamese Context Analysis
      { header: 'HCMC Context Relevance', key: 'hcmcContextRelevance', width: 20 },
      { header: 'Family Collaboration Support', key: 'familyCollaborationSupport', width: 25 },
      { header: 'Generational Bridge Value', key: 'generationalBridgeValue', width: 22 },
      { header: 'Conversation Framework Potential', key: 'conversationFrameworkPotential', width: 28 },

      // Implementation Details
      { header: 'Implementation Tools Available', key: 'implementationTools', width: 30 },
      { header: 'Timeline Guidance', key: 'timelineGuidance', width: 18 },
      { header: 'Family Exercise Potential', key: 'familyExercisePotential', width: 22 },
      { header: 'Real World Examples', key: 'realWorldExamples', width: 20 },

      // Source Information
      { header: 'Author', key: 'author', width: 25 },
      { header: 'Publication Date', key: 'publicationDate', width: 15 },
      { header: 'Source Type', key: 'sourceType', width: 15 },
      { header: 'Source Credibility', key: 'sourceCredibility', width: 16 },
      { header: 'Language', key: 'language', width: 12 },

      // Processing Status
      { header: 'Processing Status', key: 'processingStatus', width: 16 },
      { header: 'Priority Level', key: 'priorityLevel', width: 14 },
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

    // Apply professional formatting to header row
    const headerRow = worksheet.getRow(1);
    headerRow.height = 35;

    headerRow.eachCell((cell) => {
      cell.style = {
        font: {
          bold: true,
          color: { argb: 'FFFFFF' },
          size: 12,
          name: 'Segoe UI'
        },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '1F4E79' }
        },
        border: {
          top: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
          right: { style: 'thin', color: { argb: '000000' } }
        },
        alignment: {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true
        }
      };
    });

    // Enhanced worksheet view settings
    worksheet.views = [
      {
        state: 'frozen',
        xSplit: 0,
        ySplit: 1,
        topLeftCell: 'A2',
        activeCell: 'A2',
        showGridLines: true,
        showRowColHeaders: true,
        zoomScale: 90,
        zoomScaleNormal: 90
      }
    ];

    // Add print settings for better printing/PDF export
    worksheet.pageSetup = {
      paperSize: 9, // A4
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3
      }
    };

    // Save the file with enhanced formatting
    await this.workbook.xlsx.writeFile(this.filePath, {
      useStyles: true,
      useSharedStrings: true
    });
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
        case 'delete_content_entry':
          return await this.deleteContentEntry(args.rowNumber);
        case 'get_database_stats':
          return await this.getDatabaseStats();
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isFileLocked = errorMessage.includes('Excel file is locked') ||
                         errorMessage.includes('File is locked') ||
                         errorMessage.includes('lock file detected') ||
                         errorMessage.includes('EBUSY') ||
                         errorMessage.includes('EPERM') ||
                         errorMessage.includes('EACCES') ||
                         errorMessage.includes('sharing violation') ||
                         errorMessage.includes('access denied');

      logger.error(`Excel tool call failed: ${name}`, {
        error: errorMessage,
        args,
        isFileLocked
      });

      // Return user-friendly error message for file locks
      if (isFileLocked) {
        return this.createErrorResponse(new Error(
          '📁 Excel file is currently open in Microsoft Excel. Please close Excel and try again.'
        ));
      }

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

    // Preserve formatting by using ExcelJS's built-in style inheritance and manual style copying
    const newRowNumber = worksheet.rowCount + 1;

    // If there are existing data rows (more than just header), copy formatting
    if (worksheet.rowCount > 1) {
      const templateRowNumber = worksheet.rowCount; // Use last existing row as template

      // Method 1: Try using ExcelJS's built-in style inheritance (insertRow with 'i' style)
      // Insert at the end with inheritance from above
      let newRow;
      try {
        // Insert row with inheritance style ('i' means inherit from row above)
        newRow = worksheet.insertRow(newRowNumber, rowData, 'i+');
        logger.info('Used ExcelJS built-in style inheritance', { rowNumber: newRowNumber });
      } catch (inheritanceError) {
        // Fallback to regular addRow if inheritance fails
        logger.warn('Style inheritance failed, falling back to manual copy', {
          error: inheritanceError instanceof Error ? inheritanceError.message : String(inheritanceError)
        });
        newRow = worksheet.addRow(rowData);
      }

      // Method 2: Manual style copying as backup/enhancement

      // Copy comprehensive formatting from template row using proper style cloning
      let formattingApplied = 0;

      // Get template row for style reference
      const templateRow = worksheet.getRow(templateRowNumber);

      // Apply formatting to each cell in the new row
      newRow.eachCell((newCell, colNumber) => {
        const templateCell = templateRow.getCell(colNumber);

        if (templateCell && templateCell.style) {
          try {
            // Use ExcelJS's built-in style cloning by creating a complete style object
            const clonedStyle: Partial<ExcelJS.Style> = {
              ...templateCell.style
            };

            // Clean undefined values to avoid TypeScript strict mode issues
            if (clonedStyle.numFmt === undefined) {
              delete clonedStyle.numFmt;
            }

            // Apply the complete cloned style
            newCell.style = clonedStyle;
            formattingApplied++;

          } catch (styleError) {
            logger.warn('Failed to copy style for cell', {
              rowNumber: newRowNumber,
              columnNumber: colNumber,
              error: styleError instanceof Error ? styleError.message : String(styleError)
            });
          }
        }

        // Ensure the value is set correctly (preserve existing value from addRow)
        // Value is already set by addRow, but ensure it's maintained
        if (colNumber <= rowData.length) {
          newCell.value = rowData[colNumber - 1];
        }
      });

      // Row-level styling is not available in ExcelJS Row type
      // Individual cell styling is sufficient for formatting preservation

      logger.info('Enhanced formatting preservation applied', {
        rowNumber: newRowNumber,
        cellsFormatted: formattingApplied,
        templateRowUsed: templateRowNumber,
        totalColumns: newRow.cellCount
      });

      // Apply enhanced formatting with text wrapping for long content
      this.applyEnhancedRowFormatting(newRow, newRowNumber, rowData);

      // Commit the row to ensure changes are applied
      newRow.commit();
    } else {
      // No existing data rows, add row normally with base formatting
      const addedRow = worksheet.addRow(rowData);
      this.applyEnhancedRowFormatting(addedRow, newRowNumber, rowData);
      addedRow.commit();
    }

    logger.info('Added comprehensive content entry', {
      rowNumber: newRowNumber,
      title: contentEntry.title,
      topic: contentEntry.primaryTopic,
      qualityScore: contentEntry.overallQualityScore
    });

    // Save the file with formatting preservation
    await this.saveExcelFile();

    return this.createSuccessResponse({
      success: true,
      message: 'Content entry added successfully to Excel database',
      entry: contentEntry,
      rowNumber: newRowNumber
    });
  }

  private async deleteContentEntry(rowNumber: number): Promise<MCPToolResponse> {
    if (!this.workbook) throw new Error('Workbook not initialized');

    const worksheet = this.workbook.getWorksheet('Content Database');
    if (!worksheet) throw new Error('Content Database worksheet not found');

    // Validate row number
    if (rowNumber < 2) {
      return this.createErrorResponse(new Error('Row number must be 2 or greater (row 1 is header)'));
    }

    if (rowNumber > worksheet.rowCount) {
      return this.createErrorResponse(new Error(`Row number ${rowNumber} exceeds total rows (${worksheet.rowCount})`));
    }

    try {
      // Get row data before deletion for logging
      const row = worksheet.getRow(rowNumber);
      const title = row.getCell(2)?.value?.toString() || 'Unknown'; // Column 2 = title

      // Delete the row
      worksheet.spliceRows(rowNumber, 1);

      logger.info('Deleted content entry', {
        rowNumber,
        title,
        remainingRows: worksheet.rowCount - 1 // -1 for header
      });

      // Save the file with formatting preservation
      await this.saveExcelFile();

      return this.createSuccessResponse({
        success: true,
        message: `Content entry deleted successfully from row ${rowNumber}`,
        deletedEntry: {
          rowNumber,
          title
        },
        remainingEntries: worksheet.rowCount - 1 // -1 for header
      });

    } catch (error) {
      logger.error('Failed to delete content entry', {
        error: error instanceof Error ? error.message : String(error),
        rowNumber
      });
      return this.createErrorResponse(error instanceof Error ? error : new Error(String(error)));
    }
  }


  private async saveExcelFile(): Promise<void> {
    if (!this.workbook) throw new Error('Workbook not initialized');

    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Check if file is locked by trying to open it for writing
        await this.checkFileLock();

        // Save with comprehensive format preservation
        await this.workbook.xlsx.writeFile(this.filePath, {
          useStyles: true,           // Preserve all cell and row styling
          useSharedStrings: true     // Optimize string storage
        });

        logger.info('Excel file saved with formatting preserved', {
          filePath: this.filePath,
          attempt
        });

        // Verify the save by checking file modification time
        const fs = await import('fs/promises');
        const stats = await fs.stat(this.filePath);
        logger.info('Excel file verification', {
          size: stats.size,
          lastModified: stats.mtime.toISOString()
        });

        return; // Success, exit retry loop

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isFileLocked = errorMessage.includes('EBUSY') ||
                           errorMessage.includes('EPERM') ||
                           errorMessage.includes('EACCES') ||
                           errorMessage.includes('EMFILE') ||
                           errorMessage.includes('ENFILE') ||
                           errorMessage.includes('locked') ||
                           errorMessage.includes('in use') ||
                           errorMessage.includes('cannot save') ||
                           errorMessage.includes('access denied') ||
                           errorMessage.includes('sharing violation') ||
                           errorMessage.includes('file is being used');

        if (isFileLocked && attempt < maxRetries) {
          logger.warn(`File appears locked (attempt ${attempt}/${maxRetries}), retrying in ${retryDelay}ms`, {
            error: errorMessage,
            filePath: this.filePath
          });

          // Show user-friendly message for the first retry
          if (attempt === 1) {
            console.log(`\n⚠️  EXCEL FILE IS LOCKED ⚠️`);
            console.log(`The Excel file is currently open in Microsoft Excel or another application.`);
            console.log(`Please close the Excel file and the operation will continue automatically.`);
            console.log(`Retrying in ${retryDelay / 1000} second(s)... (attempt ${attempt}/${maxRetries})\n`);
          } else {
            console.log(`Still waiting... (attempt ${attempt}/${maxRetries})`);
          }

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }

        // Final attempt failed or non-locking error
        logger.error('Failed to save Excel file', {
          error: errorMessage,
          filePath: this.filePath,
          finalAttempt: attempt,
          isFileLocked
        });

        if (isFileLocked) {
          console.log(`\n❌ UNABLE TO SAVE EXCEL FILE ❌`);
          console.log(`The Excel file is still locked after ${maxRetries} attempts.`);
          console.log(`Please:`);
          console.log(`1. Close Microsoft Excel completely`);
          console.log(`2. Try the operation again`);
          console.log(`3. Make sure no other applications have the file open\n`);

          throw new Error(`Excel file is locked by another application. Please close Microsoft Excel and try again.`);
        } else {
          throw new Error(`Excel save failed: ${errorMessage}`);
        }
      }
    }
  }

  private async checkFileLock(): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');

      // Method 1: Check for Excel temporary lock files
      const dir = path.dirname(this.filePath);
      const filename = path.basename(this.filePath, '.xlsx');

      // Excel creates these temporary files when a file is open
      const lockPatterns = [
        `~$${filename}.xlsx`,           // Excel lock file pattern
        `.~${filename}.xlsx`,           // Alternative lock file pattern
        `${filename}.xlsx.lock`,        // Generic lock file
        `.${filename}.xlsx.lock`        // Hidden lock file
      ];

      // Check for lock files
      for (const lockFile of lockPatterns) {
        const lockPath = path.join(dir, lockFile);
        try {
          await fs.access(lockPath);
          console.log(`\n⚠️  EXCEL FILE IS CURRENTLY LOCKED ⚠️`);
          console.log(`File: ${this.filePath}`);
          console.log(`Found lock file: ${lockFile}`);
          console.log(`Please close Microsoft Excel to continue...`);
          throw new Error('File is locked by another application (lock file detected)');
        } catch (accessError) {
          // Lock file doesn't exist, continue checking
        }
      }

      // Method 2: Try to open file with exclusive access
      let fileHandle;
      try {
        fileHandle = await fs.open(this.filePath, 'r+');

        // Try to get an exclusive lock (if supported)
        // This will fail if Excel has the file open
        await fileHandle.close();

      } catch (openError) {
        const errorMessage = openError instanceof Error ? openError.message : String(openError);
        if (errorMessage.includes('EBUSY') ||
            errorMessage.includes('EPERM') ||
            errorMessage.includes('EACCES') ||
            errorMessage.includes('EMFILE') ||
            errorMessage.includes('ENFILE')) {
          console.log(`\n⚠️  EXCEL FILE IS CURRENTLY LOCKED ⚠️`);
          console.log(`File access error: ${errorMessage}`);
          console.log(`Please close Microsoft Excel to continue...`);
          throw new Error('File is locked by another application');
        }
        throw openError; // Re-throw if it's not a lock-related error
      }

      // Method 3: Try to write to the file as a final test
      try {
        // Create a backup of the current file stats
        const stats = await fs.stat(this.filePath);
        const originalSize = stats.size;

        // Try to touch the file (update access time)
        await fs.utimes(this.filePath, stats.atime, stats.mtime);

        // Verify the file wasn't corrupted by our test
        const newStats = await fs.stat(this.filePath);
        if (newStats.size !== originalSize) {
          logger.warn('File size changed during lock test, file may be corrupted');
        }

      } catch (writeError) {
        const errorMessage = writeError instanceof Error ? writeError.message : String(writeError);
        if (errorMessage.includes('EBUSY') ||
            errorMessage.includes('EPERM') ||
            errorMessage.includes('EACCES')) {
          console.log(`\n⚠️  EXCEL FILE IS CURRENTLY LOCKED ⚠️`);
          console.log(`Write test failed: ${errorMessage}`);
          console.log(`Please close Microsoft Excel to continue...`);
          throw new Error('File is locked by another application');
        }
      }

    } catch (error) {
      // If we already threw a lock error, re-throw it
      if (error instanceof Error && error.message.includes('File is locked')) {
        throw error;
      }

      // For other errors, log but don't block the operation
      logger.warn('Lock detection test failed', {
        error: error instanceof Error ? error.message : String(error),
        filePath: this.filePath
      });
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

  private applyEnhancedRowFormatting(row: ExcelJS.Row, rowNumber: number, rowData: any[]): void {
    // Calculate row height based on content length
    let maxContentLength = 0;
    rowData.forEach(content => {
      const contentStr = content?.toString() || '';
      if (contentStr.length > maxContentLength) {
        maxContentLength = contentStr.length;
      }
    });

    // Dynamic row height based on content
    let rowHeight = 20; // Base height
    if (maxContentLength > 100) rowHeight = 35;
    if (maxContentLength > 200) rowHeight = 50;
    if (maxContentLength > 300) rowHeight = 65;
    if (maxContentLength > 500) rowHeight = 80;

    row.height = rowHeight;

    // Enhanced cell formatting with text wrapping
    const isEvenRow = (rowNumber - 2) % 2 === 0;
    const bgColor = isEvenRow ? 'F8F9FA' : 'FFFFFF';

    // Columns that should have text wrapping enabled
    const wrapColumns = [1, 2, 3, 4, 17, 21, 28]; // URL, Title, Summary, Key Points, Implementation Tools, Author, Usage Notes

    row.eachCell((cell, colNumber) => {
      // Base formatting for all data cells
      cell.style = {
        font: {
          name: 'Segoe UI',
          size: 10,
          color: { argb: '333333' }
        },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: bgColor }
        },
        border: {
          top: { style: 'thin', color: { argb: 'DDDDDD' } },
          left: { style: 'thin', color: { argb: 'DDDDDD' } },
          bottom: { style: 'thin', color: { argb: 'DDDDDD' } },
          right: { style: 'thin', color: { argb: 'DDDDDD' } }
        },
        alignment: {
          vertical: 'top',
          horizontal: 'left',
          wrapText: wrapColumns.includes(colNumber),
          indent: 1
        }
      };

      // Column-specific enhanced formatting with type safety
      switch (colNumber) {
        case 1: // Source URL
          if (cell.value && cell.value.toString().startsWith('http') && cell.style.font) {
            cell.style.font.color = { argb: '0066CC' };
            cell.style.font.underline = true;
          }
          break;

        case 2: // Title
          if (cell.style.font) {
            cell.style.font.bold = true;
            cell.style.font.size = 11;
          }
          break;

        case 6: // Primary Topic
          if (cell.style.alignment && cell.style.font) {
            cell.style.alignment.horizontal = 'center';
            cell.style.font.bold = true;
            const topic = cell.value?.toString() || '';

            if (topic.includes('Communication') && cell.style.fill && 'fgColor' in cell.style.fill) {
              cell.style.fill.fgColor = { argb: 'E3F2FD' };
              cell.style.font.color = { argb: '1565C0' };
            } else if (topic.includes('Bridge') && cell.style.fill && 'fgColor' in cell.style.fill) {
              cell.style.fill.fgColor = { argb: 'E8F5E8' };
              cell.style.font.color = { argb: '2E7D32' };
            } else if (topic.includes('Decision') && cell.style.fill && 'fgColor' in cell.style.fill) {
              cell.style.fill.fgColor = { argb: 'FFF3E0' };
              cell.style.font.color = { argb: 'F57C00' };
            }
          }
          break;

        case 9: case 10: case 11: case 12: // Score columns
          if (cell.style.alignment) {
            cell.style.alignment.horizontal = 'center';
            cell.style.numFmt = '0';
            const scoreValue = cell.value?.toString() || '';
            const score = parseInt(scoreValue);

            if (!isNaN(score) && cell.style.font && cell.style.fill && 'fgColor' in cell.style.fill) {
              if (score >= 8) {
                cell.style.font.color = { argb: '28A745' };
                cell.style.font.bold = true;
                cell.style.fill.fgColor = { argb: 'D4EDDA' };
              } else if (score >= 6) {
                cell.style.font.color = { argb: 'FD7E14' };
                cell.style.fill.fgColor = { argb: 'FFF3CD' };
              } else if (score > 0) {
                cell.style.font.color = { argb: 'DC3545' };
                cell.style.fill.fgColor = { argb: 'F8D7DA' };
              }
            }
          }
          break;

        case 26: // Processing Status
          if (cell.style.alignment && cell.style.font && cell.style.fill && 'fgColor' in cell.style.fill) {
            cell.style.alignment.horizontal = 'center';
            const status = cell.value?.toString() || '';

            if (status === 'New') {
              cell.style.fill.fgColor = { argb: 'D1ECF1' };
              cell.style.font.color = { argb: '0C5460' };
              cell.style.font.bold = true;
            } else if (status === 'Processed') {
              cell.style.fill.fgColor = { argb: 'D4EDDA' };
              cell.style.font.color = { argb: '155724' };
              cell.style.font.bold = true;
            }
          }
          break;

        case 27: // Priority Level
          if (cell.style.alignment && cell.style.font && cell.style.fill && 'fgColor' in cell.style.fill) {
            cell.style.alignment.horizontal = 'center';
            const priority = cell.value?.toString() || '';

            if (priority === 'High') {
              cell.style.fill.fgColor = { argb: 'F8D7DA' };
              cell.style.font.color = { argb: '721C24' };
              cell.style.font.bold = true;
            } else if (priority === 'Medium') {
              cell.style.fill.fgColor = { argb: 'FFF3CD' };
              cell.style.font.color = { argb: '856404' };
            } else if (priority === 'Low') {
              cell.style.fill.fgColor = { argb: 'D1ECF1' };
              cell.style.font.color = { argb: '0C5460' };
            }
          }
          break;

        case 29: case 30: // Date columns
          if (cell.style.alignment) {
            cell.style.alignment.horizontal = 'center';
            cell.style.numFmt = 'mm/dd/yyyy';
          }
          break;

        default:
          // Center alignment for most other columns
          if (colNumber >= 5 && colNumber <= 27 && colNumber !== 17 && colNumber !== 21 && cell.style.alignment) {
            cell.style.alignment.horizontal = 'center';
          }
          break;
      }
    });
  }
}