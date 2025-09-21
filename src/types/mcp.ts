export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface MCPToolCallRequest {
  name: string;
  arguments: Record<string, any>;
}

export interface MCPToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

export interface MCPError {
  success: false;
  error: {
    message: string;
    type: string;
    timestamp: string;
  };
}

export interface MCPSuccess<T = any> {
  success: true;
  data: T;
}