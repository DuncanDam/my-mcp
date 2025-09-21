import { BaseMCPServer } from './base-server.js';
import type { MCPToolResponse } from '../types/mcp.js';
export declare class DocumentReaderServer extends BaseMCPServer {
    constructor();
    initialize(): Promise<void>;
    handleToolCall(name: string, args: Record<string, any>): Promise<MCPToolResponse>;
    private readDocument;
    private analyzeDocumentMetadata;
    private extractDocumentText;
    private processExtractedText;
}
