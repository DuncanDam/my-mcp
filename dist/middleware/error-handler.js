import { logger } from '../utils/logger.js';
export const errorHandler = (err, c) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    logger.error('Request error', {
        error: message,
        status,
        path: c.req.path,
        method: c.req.method,
        stack: err.stack,
        timestamp: new Date().toISOString()
    });
    return c.json({
        success: false,
        error: {
            message,
            status,
            timestamp: new Date().toISOString()
        }
    }, status);
};
