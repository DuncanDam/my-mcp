import type { DocumentContent, DocumentMetadata } from '../types/content.js';
export declare class DocumentProcessor {
    static detectFileType(filePath: string): Promise<{
        mimeType: string;
        extension: string;
        format: string;
    }>;
    private static getFormatName;
    static getDocumentMetadata(filePath: string): Promise<DocumentMetadata>;
    private static extractPDFMetadata;
    private static extractDOCXMetadata;
    static extractDocumentContent(filePath: string): Promise<DocumentContent>;
    private static extractPDFContent;
    private static extractDOCXContent;
    private static extractTextContent;
    private static extractRTFContent;
    static validateFile(filePath: string): void;
    static checkFileSize(filePath: string, maxSize?: number): Promise<void>;
}
