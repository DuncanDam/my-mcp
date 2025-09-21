import type { ScrapedContent } from '../types/content.js';
export declare class ContentExtractor {
    static extractMetaData(html: string): ScrapedContent['metadata'];
    static extractTextContent(html: string): string;
    static extractTitle(html: string, url: string): string;
    static generateSummary(content: string, maxLength?: number): string;
    static isValidUrl(url: string): boolean;
    static normalizeUrl(url: string): string;
}
