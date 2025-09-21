import { Hono } from 'hono';
import { config } from '../utils/config.js';

const health = new Hono();

health.get('/', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    phase: 'Phase 5 - Complete Workflow & Hono Integration',
    nodeVersion: process.version,
    environment: {
      logLevel: config.server.logLevel,
      teamName: config.team.name,
      serverName: config.team.serverName
    }
  });
});

health.get('/ready', (c) => {
  return c.json({
    ready: true,
    services: {
      excel: 'operational',
      webScraper: 'operational',
      documentReader: 'operational'
    },
    timestamp: new Date().toISOString()
  });
});

export { health as healthRoutes };