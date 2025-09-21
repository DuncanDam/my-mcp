import type { MCPTool, MCPToolResponse } from '../types/mcp.js';
export declare abstract class BaseMCPServer {
    protected name: string;
    protected tools: MCPTool[];
    constructor(name: string);
    initialize(): Promise<void>;
    getTools(): Promise<MCPTool[]>;
    abstract handleToolCall(name: string, args: Record<string, any>): Promise<MCPToolResponse>;
    protected createSuccessResponse(data: any): MCPToolResponse;
    protected createErrorResponse(error: Error): MCPToolResponse;
}
