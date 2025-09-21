import winston from 'winston';
import { config } from './config.js';
export const logger = winston.createLogger({
    level: config.server.logLevel,
    format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.simple()),
    defaultMeta: {
        service: config.team.serverName,
        team: config.team.name
    },
    transports: [
        // Only use console logging to stderr - Claude Desktop captures this
        new winston.transports.Console({
            stderrLevels: ['error', 'warn', 'info', 'debug'],
            format: winston.format.simple()
        })
    ]
});
