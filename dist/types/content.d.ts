export interface ContentEntry {
    dateAdded: string;
    sourceUrl: string;
    title: string;
    summary: string;
    topicCategory: string;
    keyPoints: string;
    status: string;
}
export interface TopicCategory {
    category: string;
    description: string;
    keywords: string;
}
export interface DatabaseStats {
    total_entries: number;
    topic_breakdown: Record<string, number>;
    last_updated: string;
    most_popular_topic: string;
    excel_file_path: string;
}
export interface SimilarContentMatch {
    entry_id: string;
    title: string;
    summary: string;
    topic: string;
    similarity_score: number;
}
export interface ScrapedContent {
    url: string;
    title: string;
    content: string;
    summary: string;
    metadata: {
        description?: string;
        author?: string;
        publishDate?: string;
        wordCount: number;
        language?: string;
        responseTime?: number;
    };
    extractedAt: string;
}
export interface URLAccessibilityResult {
    url: string;
    accessible: boolean;
    statusCode?: number;
    error?: string;
    responseTime?: number;
    checkedAt: string;
}
export interface DocumentContent {
    filePath: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    title: string;
    content: string;
    summary: string;
    metadata: {
        author?: string;
        createdDate?: string;
        modifiedDate?: string;
        pageCount?: number;
        wordCount: number;
        language?: string;
        keywords?: string;
        subject?: string;
        format: string;
    };
    extractedAt: string;
}
export interface DocumentMetadata {
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    mimeType: string;
    lastModified: string;
    accessible: boolean;
    error?: string;
    documentProperties?: {
        title?: string;
        author?: string;
        subject?: string;
        keywords?: string;
        creator?: string;
        producer?: string;
        creationDate?: string;
        modificationDate?: string;
        pageCount?: number;
        wordCount?: number;
    };
}
