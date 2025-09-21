import { BaseMCPServer } from './base-server.js';
import type { MCPToolResponse } from '../types/mcp.js';
export declare class ExcelManagerServer extends BaseMCPServer {
    private workbook;
    private filePath;
    constructor();
    initialize(): Promise<void>;
    private createDefaultExcelStructure;
    handleToolCall(name: string, args: Record<string, any>): Promise<MCPToolResponse>;
    private addContentEntry;
    private saveExcelFile;
    private searchSimilarContent;
    private getTopicCategories;
    private getDatabaseStats;
}
