import { logger } from '../utils/logger.js';
export const loggerMiddleware = async (c, next) => {
    const start = Date.now();
    const method = c.req.method;
    const path = c.req.path;
    const userAgent = c.req.header('User-Agent') || 'Unknown';
    logger.info('Request started', {
        method,
        path,
        userAgent,
        timestamp: new Date().toISOString()
    });
    await next();
    const status = c.res.status;
    const duration = Date.now() - start;
    logger.info('Request completed', {
        method,
        path,
        status,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
    });
};
