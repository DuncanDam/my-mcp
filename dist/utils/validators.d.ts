import { z } from 'zod';
export declare const ContentEntrySchema: z.ZodObject<{
    url: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    summary: z.ZodString;
    topic: z.ZodString;
    keyPoints: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const DocumentProcessingSchema: z.ZodObject<{
    filePath: z.ZodString;
    maxSize: z.ZodOptional<z.ZodNumber>;
    maxLength: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const WebScrapingSchema: z.ZodObject<{
    url: z.ZodString;
    maxContent: z.ZodOptional<z.ZodNumber>;
    timeout: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const WorkflowSchema: z.ZodObject<{
    input: z.ZodString;
    inputType: z.ZodDefault<z.ZodEnum<{
        file: "file";
        url: "url";
        auto: "auto";
    }>>;
    topic: z.ZodDefault<z.ZodString>;
    extractedText: z.ZodOptional<z.ZodString>;
    sourceDescription: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const SearchSchema: z.ZodObject<{
    query: z.ZodString;
    limit: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export type ContentEntry = z.infer<typeof ContentEntrySchema>;
export type DocumentProcessing = z.infer<typeof DocumentProcessingSchema>;
export type WebScraping = z.infer<typeof WebScrapingSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;
export type Search = z.infer<typeof SearchSchema>;
export declare const validateUrl: (url: string) => boolean;
export declare const validateFilePath: (filePath: string) => boolean;
export declare const sanitizeInput: (input: string) => string;
