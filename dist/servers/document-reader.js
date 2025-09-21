import { BaseMCPServer } from './base-server.js';
import { DocumentProcessor } from '../utils/document-processor.js';
import { logger } from '../utils/logger.js';
export class DocumentReaderServer extends BaseMCPServer {
    constructor() {
        super('document-reader');
        this.tools = [
            {
                name: 'read_document',
                description: 'Extract content from PDF, DOCX, TXT, RTF files',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filePath: {
                            type: 'string',
                            description: 'Absolute path to the document file'
                        },
                        maxSize: {
                            type: 'number',
                            description: 'Maximum file size in bytes (default: 50MB)',
                            default: 50 * 1024 * 1024
                        }
                    },
                    required: ['filePath']
                }
            },
            {
                name: 'analyze_document_metadata',
                description: 'Get document properties and metadata without full content extraction',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filePath: {
                            type: 'string',
                            description: 'Absolute path to the document file'
                        }
                    },
                    required: ['filePath']
                }
            },
            {
                name: 'extract_document_text',
                description: 'Pure text extraction with minimal processing',
                inputSchema: {
                    type: 'object',
                    properties: {
                        filePath: {
                            type: 'string',
                            description: 'Absolute path to the document file'
                        },
                        maxLength: {
                            type: 'number',
                            description: 'Maximum text length to extract (default: 10000)',
                            default: 10000
                        }
                    },
                    required: ['filePath']
                }
            },
            {
                name: 'process_extracted_text',
                description: 'Process Claude-extracted text from images and save to Excel',
                inputSchema: {
                    type: 'object',
                    properties: {
                        extractedText: {
                            type: 'string',
                            description: 'Text extracted by Claude from an image'
                        },
                        sourceDescription: {
                            type: 'string',
                            description: 'Description of the image source (e.g., "Screenshot from website")'
                        },
                        topic: {
                            type: 'string',
                            description: 'Topic category for the content',
                            default: 'Image Content'
                        }
                    },
                    required: ['extractedText', 'sourceDescription']
                }
            }
        ];
    }
    async initialize() {
        logger.info('Document reader server initialized successfully');
    }
    async handleToolCall(name, args) {
        try {
            switch (name) {
                case 'read_document':
                    return await this.readDocument(args.filePath, args.maxSize);
                case 'analyze_document_metadata':
                    return await this.analyzeDocumentMetadata(args.filePath);
                case 'extract_document_text':
                    return await this.extractDocumentText(args.filePath, args.maxLength);
                case 'process_extracted_text':
                    return await this.processExtractedText(args.extractedText, args.sourceDescription, args.topic);
                default:
                    throw new Error(`Unknown tool: ${name}`);
            }
        }
        catch (error) {
            logger.error(`Document reader tool call failed: ${name}`, {
                error: error instanceof Error ? error.message : String(error),
                args
            });
            return this.createErrorResponse(error instanceof Error ? error : new Error(String(error)));
        }
    }
    async readDocument(filePath, maxSize) {
        try {
            // Validate file
            DocumentProcessor.validateFile(filePath);
            if (maxSize) {
                await DocumentProcessor.checkFileSize(filePath, maxSize);
            }
            // Extract document content
            const documentContent = await DocumentProcessor.extractDocumentContent(filePath);
            logger.info('Successfully read document', {
                filePath,
                fileName: documentContent.fileName,
                fileType: documentContent.fileType,
                contentLength: documentContent.content.length,
                wordCount: documentContent.metadata.wordCount
            });
            return this.createSuccessResponse({
                success: true,
                data: documentContent,
                metadata: {
                    processingTime: Date.now(),
                    fileType: documentContent.fileType,
                    fileSize: documentContent.fileSize
                }
            });
        }
        catch (error) {
            throw new Error(`Document reading failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async analyzeDocumentMetadata(filePath) {
        try {
            DocumentProcessor.validateFile(filePath);
            const metadata = await DocumentProcessor.getDocumentMetadata(filePath);
            logger.info('Document metadata analyzed', {
                filePath,
                fileName: metadata.fileName,
                fileType: metadata.fileType,
                accessible: metadata.accessible
            });
            return this.createSuccessResponse({
                success: true,
                data: metadata
            });
        }
        catch (error) {
            throw new Error(`Metadata analysis failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async extractDocumentText(filePath, maxLength = 10000) {
        try {
            DocumentProcessor.validateFile(filePath);
            const documentContent = await DocumentProcessor.extractDocumentContent(filePath);
            // Limit text length
            let extractedText = documentContent.content;
            if (extractedText.length > maxLength) {
                extractedText = extractedText.substring(0, maxLength) + '...';
            }
            const result = {
                fileName: documentContent.fileName,
                fileType: documentContent.fileType,
                extractedText,
                wordCount: documentContent.metadata.wordCount,
                truncated: documentContent.content.length > maxLength
            };
            logger.info('Document text extracted', {
                filePath,
                fileName: documentContent.fileName,
                extractedLength: extractedText.length,
                totalLength: documentContent.content.length,
                truncated: result.truncated
            });
            return this.createSuccessResponse({
                success: true,
                data: result
            });
        }
        catch (error) {
            throw new Error(`Text extraction failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async processExtractedText(extractedText, sourceDescription, topic = 'Image Content') {
        try {
            if (!extractedText || extractedText.trim().length === 0) {
                throw new Error('No text provided for processing');
            }
            // Generate summary and title from extracted text
            const lines = extractedText.trim().split('\n').filter(line => line.trim().length > 0);
            const title = lines[0]?.substring(0, 100) || 'Extracted Text Content';
            // Create summary (first few sentences or up to 300 chars)
            const summary = extractedText.length > 300
                ? extractedText.substring(0, 300) + '...'
                : extractedText;
            // Calculate word count
            const wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;
            const processedContent = {
                source: sourceDescription,
                title,
                content: extractedText,
                summary,
                topic,
                metadata: {
                    wordCount,
                    extractedAt: new Date().toISOString(),
                    processingMethod: 'Claude Vision Extraction'
                }
            };
            logger.info('Processed extracted text', {
                sourceDescription,
                title,
                wordCount,
                contentLength: extractedText.length
            });
            return this.createSuccessResponse({
                success: true,
                data: processedContent,
                message: 'Text processed successfully. Ready for Excel integration.'
            });
        }
        catch (error) {
            throw new Error(`Text processing failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
