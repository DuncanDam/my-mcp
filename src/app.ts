import { Hono } from 'hono';
import { mcpRoutes } from './routes/mcp.js';
import { healthRoutes } from './routes/health.js';
import { loggerMiddleware } from './middleware/logger.js';
import { errorHandler } from './middleware/error-handler.js';

const app: Hono = new Hono();

// Middleware
app.use('*', loggerMiddleware);
app.onError(errorHandler);

// Routes
app.route('/health', healthRoutes);
app.route('/mcp', mcpRoutes);

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'MCP Content Analyzer',
    version: '1.0.0',
    description: 'Hono-based MCP server for content analysis and Excel integration',
    phase: 'Phase 5 - Complete Workflow & Hono Integration',
    endpoints: {
      health: '/health',
      mcp: '/mcp',
      docs: '/docs'
    }
  });
});

export { app };