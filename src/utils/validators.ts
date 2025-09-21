import { z } from 'zod';

// Content validation schemas
export const ContentEntrySchema = z.object({
  url: z.string().url().optional(),
  title: z.string().min(1, 'Title is required'),
  summary: z.string().min(1, 'Summary is required'),
  topic: z.string().min(1, 'Topic is required'),
  keyPoints: z.string().optional()
});

export const DocumentProcessingSchema = z.object({
  filePath: z.string().min(1, 'File path is required'),
  maxSize: z.number().positive().optional(),
  maxLength: z.number().positive().optional()
});

export const WebScrapingSchema = z.object({
  url: z.string().url('Valid URL is required'),
  maxContent: z.number().positive().optional(),
  timeout: z.number().positive().optional()
});

export const WorkflowSchema = z.object({
  input: z.string().min(1, 'Input is required'),
  inputType: z.enum(['url', 'file', 'auto']).default('auto'),
  topic: z.string().default('General'),
  extractedText: z.string().optional(),
  sourceDescription: z.string().optional()
});

export const SearchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  limit: z.number().positive().max(100).default(10)
});

// Type exports
export type ContentEntry = z.infer<typeof ContentEntrySchema>;
export type DocumentProcessing = z.infer<typeof DocumentProcessingSchema>;
export type WebScraping = z.infer<typeof WebScrapingSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;
export type Search = z.infer<typeof SearchSchema>;

// Validation helpers
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateFilePath = (filePath: string): boolean => {
  // Basic file path validation
  if (!filePath || typeof filePath !== 'string') return false;
  if (filePath.includes('..') || filePath.includes('~')) return false;

  const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt', '.rtf', '.md', '.html', '.htm'];
  const ext = filePath.toLowerCase().split('.').pop();

  return ext ? allowedExtensions.includes(`.${ext}`) : false;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};