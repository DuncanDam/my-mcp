import dotenv from 'dotenv';

// Suppress all console output during dotenv loading to prevent MCP protocol interference
const originalConsole = { ...console };
console.log = console.info = console.warn = () => {};
dotenv.config();
Object.assign(console, originalConsole);

export const config = {
  excel: {
    databasePath: process.env.EXCEL_DATABASE_PATH || './data/content-database.xlsx',
    backupEnabled: false, // Backup disabled by default
    autoSave: process.env.EXCEL_AUTO_SAVE === 'true',
    templatePath: process.env.EXCEL_TEMPLATE_PATH || './config/excel-template.xlsx',
    schemaVersion: process.env.EXCEL_SCHEMA_VERSION || '2.0'
  },

  contentCatalog: {
    guidelinesPath: process.env.CONTENT_CATALOG_PATH || './data/content-catalog-guidelines.md',
    validationEnabled: process.env.SUPPORT_DOCUMENT_VALIDATION === 'true',
    autoReject: process.env.AUTO_REJECT_UNSUITABLE === 'true',
    defaultCatalogEnabled: process.env.DEFAULT_CATALOG_ENABLED !== 'false'
  },

  analysis: {
    aiAnalysisEnabled: process.env.AI_ANALYSIS_ENABLED !== 'false',
    quoteExtractionEnabled: process.env.QUOTE_EXTRACTION_ENABLED !== 'false',
    caseStudyDetection: process.env.CASE_STUDY_DETECTION_ENABLED !== 'false',
    culturalContextAnalysis: process.env.CULTURAL_CONTEXT_ANALYSIS !== 'false',
    autoCategorizationEnabled: process.env.AUTO_CATEGORIZATION === 'true',
    enhancedSearchEnabled: process.env.ENHANCED_SEARCH_ENABLED !== 'false'
  },

  qualityControl: {
    minSourceCredibility: (process.env.MIN_SOURCE_CREDIBILITY as 'High' | 'Medium' | 'Low') || 'Medium',
    requirePublicationDate: process.env.REQUIRE_PUBLICATION_DATE === 'true',
    requireAuthorInfo: process.env.REQUIRE_AUTHOR_INFO === 'true',
    minWordCount: parseInt(process.env.MIN_WORD_COUNT || '100'),
    maxContentAge: parseInt(process.env.MAX_CONTENT_AGE || '365'), // days
    culturalRelevanceThreshold: parseFloat(process.env.CULTURAL_RELEVANCE_THRESHOLD || '0.3')
  },


  scraper: {
    userAgent: process.env.SCRAPER_USER_AGENT || 'MCP Content Analyzer 1.0',
    timeout: parseInt(process.env.SCRAPER_TIMEOUT || '30000'),
    rateLimit: parseInt(process.env.SCRAPER_RATE_LIMIT || '5')
  },

  ocr: {
    fallbackEnabled: process.env.OCR_FALLBACK_ENABLED === 'true'
  },

  server: {
    port: parseInt(process.env.MCP_SERVER_PORT || '3000'),
    logLevel: process.env.LOG_LEVEL || 'info'
  },

  maxContentLength: parseInt(process.env.MAX_CONTENT_LENGTH || '50000'),

  team: {
    name: process.env.TEAM_NAME || 'default_team',
    serverName: process.env.SERVER_NAME || 'my-mcp'
  }
} as const;