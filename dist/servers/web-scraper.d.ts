import { BaseMCPServer } from './base-server.js';
import type { MCPToolResponse } from '../types/mcp.js';
export declare class WebScraperServer extends BaseMCPServer {
    private browser;
    constructor();
    initialize(): Promise<void>;
    cleanup(): Promise<void>;
    handleToolCall(name: string, args: Record<string, any>): Promise<MCPToolResponse>;
    private scrapeWebpage;
    private checkUrlAccessibility;
}
