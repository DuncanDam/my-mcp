import dotenv from 'dotenv';

// Suppress all console output during dotenv loading to prevent MCP protocol interference
const originalConsole = { ...console };
console.log = console.info = console.warn = () => {};
dotenv.config();
Object.assign(console, originalConsole);

export const config = {
  excel: {
    databasePath: process.env.EXCEL_DATABASE_PATH || './data/content-database.xlsx',
    backupEnabled: process.env.EXCEL_BACKUP_ENABLED === 'true',
    autoSave: process.env.EXCEL_AUTO_SAVE === 'true'
  },

  google: {
    visionApiKey: process.env.GOOGLE_VISION_API_KEY
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