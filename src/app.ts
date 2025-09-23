import { Hono } from 'hono';
import { mcpRoutes } from './routes/mcp.js';
import { healthRoutes } from './routes/health.js';
import { loggerMiddleware } from './middleware/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { getServerInfo } from './utils/version.js';

const app: Hono = new Hono();

// Middleware
app.use('*', loggerMiddleware);
app.onError(errorHandler);

// Routes
app.route('/health', healthRoutes);
app.route('/mcp', mcpRoutes);

// Root endpoint
app.get('/', async (c) => {
  const serverInfo = await getServerInfo();

  return c.json({
    name: serverInfo.name,
    version: serverInfo.version,
    description: serverInfo.description,
    author: serverInfo.author,
    phase: 'Phase 5 - Complete Workflow & Hono Integration',
    endpoints: {
      health: '/health',
      mcp: '/mcp',
      tools: '/mcp/tools',
      docs: '/docs'
    },
    features: [
      'MCP Protocol Support',
      'Excel Database Management',
      'Web Content Scraping',
      'Document Processing',
      'Content Analysis Workflows',
      'Enhanced Formatting Preservation'
    ]
  });
});

export { app };