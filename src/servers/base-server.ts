import type { MCPTool, MCPToolResponse, MCPError } from '../types/mcp.js';

export abstract class BaseMCPServer {
  protected name: string;
  protected tools: MCPTool[] = [];

  constructor(name: string) {
    this.name = name;
  }

  async initialize(): Promise<void> {
    // Override in subclasses
  }

  async getTools(): Promise<MCPTool[]> {
    return this.tools;
  }

  abstract handleToolCall(name: string, args: Record<string, any>): Promise<MCPToolResponse>;

  protected createSuccessResponse(data: any): MCPToolResponse {
    return {
      content: [{
        type: 'text',
        text: typeof data === 'string' ? data : JSON.stringify(data)
      }]
    };
  }

  protected createErrorResponse(error: Error): MCPToolResponse {
    const errorResponse: MCPError = {
      success: false,
      error: {
        message: error.message,
        type: error.constructor.name,
        timestamp: new Date().toISOString()
      }
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(errorResponse)
      }]
    };
  }
}