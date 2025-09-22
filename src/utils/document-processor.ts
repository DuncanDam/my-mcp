import fs from 'fs/promises';
import path from 'path';
import { fileTypeFromFile } from 'file-type';
import mime from 'mime-types';
import mammoth from 'mammoth';
import type { DocumentContent, DocumentMetadata } from '../types/content.js';
import { ContentExtractor } from './content-extractor.js';

// Polyfill for PDF.js in Node.js environment
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    constructor(_values?: string | number[]) {
      // Simple polyfill for basic matrix operations
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
    }
    a: number; b: number; c: number; d: number; e: number; f: number;
  } as any;
}

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export class DocumentProcessor {
  static async detectFileType(filePath: string): Promise<{ mimeType: string; extension: string; format: string }> {
    try {
      // Try file-type detection first (more reliable)
      const fileType = await fileTypeFromFile(filePath);
      if (fileType) {
        return {
          mimeType: fileType.mime,
          extension: fileType.ext,
          format: this.getFormatName(fileType.ext)
        };
      }

      // Fallback to extension-based detection
      const ext = path.extname(filePath).toLowerCase().slice(1);
      const mimeType = mime.lookup(filePath) || 'application/octet-stream';

      return {
        mimeType,
        extension: ext,
        format: this.getFormatName(ext)
      };
    } catch (error) {
      throw new Error(`Failed to detect file type: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private static getFormatName(extension: string): string {
    const formatMap: Record<string, string> = {
      'pdf': 'PDF Document',
      'docx': 'Microsoft Word Document',
      'doc': 'Microsoft Word Document (Legacy)',
      'txt': 'Plain Text',
      'rtf': 'Rich Text Format',
      'md': 'Markdown',
      'html': 'HTML Document',
      'htm': 'HTML Document'
    };

    return formatMap[extension.toLowerCase()] || `${extension.toUpperCase()} Document`;
  }

  static async getDocumentMetadata(filePath: string): Promise<DocumentMetadata> {
    try {
      const stats = await fs.stat(filePath);
      const fileName = path.basename(filePath);
      const fileType = await this.detectFileType(filePath);

      const metadata: DocumentMetadata = {
        fileName,
        filePath,
        fileType: fileType.extension,
        fileSize: stats.size,
        mimeType: fileType.mimeType,
        lastModified: stats.mtime.toISOString(),
        accessible: true
      };

      // Extract document-specific properties
      try {
        if (fileType.extension === 'pdf') {
          const pdfProps = await this.extractPDFMetadata(filePath);
          if (pdfProps) {
            metadata.documentProperties = pdfProps;
          }
        } else if (fileType.extension === 'docx') {
          const docxProps = await this.extractDOCXMetadata(filePath);
          if (docxProps) {
            metadata.documentProperties = docxProps;
          }
        }
      } catch (error) {
        // Metadata extraction failed, but file is still accessible
        metadata.error = `Metadata extraction failed: ${error instanceof Error ? error.message : String(error)}`;
      }

      return metadata;
    } catch (error) {
      const fileName = path.basename(filePath);
      return {
        fileName,
        filePath,
        fileType: 'unknown',
        fileSize: 0,
        mimeType: 'application/octet-stream',
        lastModified: new Date().toISOString(),
        accessible: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private static async extractPDFMetadata(filePath: string): Promise<DocumentMetadata['documentProperties']> {
    const data = await fs.readFile(filePath);
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const metadata = await pdf.getMetadata();

    const info = metadata.info as any;
    const props: DocumentMetadata['documentProperties'] = {
      pageCount: pdf.numPages
    };

    if (info?.Title) props.title = info.Title;
    if (info?.Author) props.author = info.Author;
    if (info?.Subject) props.subject = info.Subject;
    if (info?.Keywords) props.keywords = info.Keywords;
    if (info?.Creator) props.creator = info.Creator;
    if (info?.Producer) props.producer = info.Producer;
    if (info?.CreationDate) props.creationDate = new Date(info.CreationDate).toISOString();
    if (info?.ModDate) props.modificationDate = new Date(info.ModDate).toISOString();

    return props;
  }

  private static async extractDOCXMetadata(filePath: string): Promise<DocumentMetadata['documentProperties']> {
    // mammoth doesn't provide metadata extraction, so we'll extract what we can
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    const wordCount = result.value.split(/\s+/).filter(word => word.length > 0).length;

    return {
      wordCount
    };
  }

  static async extractDocumentContent(filePath: string): Promise<DocumentContent> {
    const metadata = await this.getDocumentMetadata(filePath);

    if (!metadata.accessible) {
      throw new Error(`Document not accessible: ${metadata.error}`);
    }

    let content = '';
    let title = metadata.documentProperties?.title || path.basename(filePath, path.extname(filePath));

    try {
      switch (metadata.fileType.toLowerCase()) {
        case 'pdf':
          content = await this.extractPDFContent(filePath);
          break;
        case 'docx':
          content = await this.extractDOCXContent(filePath);
          break;
        case 'txt':
        case 'md':
          content = await this.extractTextContent(filePath);
          break;
        case 'rtf':
          content = await this.extractRTFContent(filePath);
          break;
        default:
          throw new Error(`Unsupported file format: ${metadata.fileType}`);
      }

      // Generate summary
      const summary = ContentExtractor.generateSummary(content, 500);

      // Calculate word count from extracted content
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;

      const docMetadata: DocumentContent['metadata'] = {
        wordCount,
        format: this.getFormatName(metadata.fileType)
      };

      if (metadata.documentProperties?.author) docMetadata.author = metadata.documentProperties.author;
      if (metadata.documentProperties?.creationDate) docMetadata.createdDate = metadata.documentProperties.creationDate;
      if (metadata.documentProperties?.modificationDate) docMetadata.modifiedDate = metadata.documentProperties.modificationDate;
      else docMetadata.modifiedDate = metadata.lastModified;
      if (metadata.documentProperties?.pageCount) docMetadata.pageCount = metadata.documentProperties.pageCount;
      if (metadata.documentProperties?.keywords) docMetadata.keywords = metadata.documentProperties.keywords;
      if (metadata.documentProperties?.subject) docMetadata.subject = metadata.documentProperties.subject;

      const documentContent: DocumentContent = {
        filePath,
        fileName: metadata.fileName,
        fileType: metadata.fileType,
        fileSize: metadata.fileSize,
        title,
        content,
        summary,
        metadata: docMetadata,
        extractedAt: new Date().toISOString()
      };

      return documentContent;
    } catch (error) {
      throw new Error(`Failed to extract document content: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private static async extractPDFContent(filePath: string): Promise<string> {
    const data = await fs.readFile(filePath);
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item): item is any => 'str' in item)
        .map(item => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim();
  }

  private static async extractDOCXContent(filePath: string): Promise<string> {
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  private static async extractTextContent(filePath: string): Promise<string> {
    const content = await fs.readFile(filePath, 'utf-8');
    return content.trim();
  }

  private static async extractRTFContent(filePath: string): Promise<string> {
    // Basic RTF text extraction (removing RTF control codes)
    const content = await fs.readFile(filePath, 'utf-8');

    // Simple RTF parser to extract plain text
    let text = content;

    // Remove RTF header and control groups
    text = text.replace(/\\rtf\d+/g, '');
    text = text.replace(/\\[a-zA-Z]+\d*/g, '');
    text = text.replace(/\{|\}/g, '');
    text = text.replace(/\\\\/g, '\\');
    text = text.replace(/\\'/g, "'");

    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return text;
  }

  static validateFile(filePath: string): void {
    // Basic security validations
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid file path provided');
    }

    // Check for path traversal
    if (filePath.includes('..') || filePath.includes('~')) {
      throw new Error('Invalid file path: path traversal detected');
    }

    // Check file extension
    const ext = path.extname(filePath).toLowerCase();
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt', '.rtf', '.md', '.html', '.htm'];

    if (!allowedExtensions.includes(ext)) {
      throw new Error(`Unsupported file extension: ${ext}`);
    }
  }

  static async checkFileSize(filePath: string, maxSize: number = 50 * 1024 * 1024): Promise<void> {
    try {
      const stats = await fs.stat(filePath);
      if (stats.size > maxSize) {
        throw new Error(`File too large: ${Math.round(stats.size / (1024 * 1024))}MB (max: ${Math.round(maxSize / (1024 * 1024))}MB)`);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error('File not found');
      }
      throw error;
    }
  }
}