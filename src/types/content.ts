// Legacy ContentEntry for backward compatibility
export interface ContentEntry {
  dateAdded: string;
  sourceUrl: string;
  title: string;
  summary: string;
  topicCategory: string;
  keyPoints: string;
  status: string;
}

// Enhanced 26-column content entry following the Excel structure (A-Z)
export interface EnhancedContentEntry {
  // Core Information (A-D)
  linkToArticle: string;           // A: Link to Article
  shortDescription: string;        // B: Short Description/Summary
  categoryTags: string[];          // C: Category/Tags
  keyWordsIdeas: string;          // D: Key Words/Ideas/Points of Interest

  // Book Mapping (E-F)
  chapterRelevance: string[];      // E: Chapter Relevance
  sectionMapping: string;          // F: Section Mapping

  // Audience Analysis (G-J)
  personaRelevance: string[];      // G: Persona Relevance
  contentType: string;             // H: Content Type
  communicationElement: string[];  // I: Communication Element
  generationalPerspective: string; // J: Generational Perspective

  // Content Quality (K-O)
  emotionalTone: string;          // K: Emotional Tone
  dialogueTrigger: string;        // L: Dialogue Trigger
  actionableContent: string;      // M: Actionable Content
  realWorldApplication: string;   // N: Real-world Application
  supportingEvidence: string[];   // O: Supporting Evidence

  // Prioritization (P-R)
  priorityLevel: 'High' | 'Medium' | 'Low';  // P: Priority Level
  quotePotential: string;         // Q: Quote Potential
  caseStudyValue: string;         // R: Case Study Value

  // Metadata (S-Z)
  dataStatistics: string;         // S: Data/Statistics
  culturalContext: string;        // T: Cultural Context
  sourceCredibility: 'High' | 'Medium' | 'Low';  // U: Source Credibility
  publicationDate: string;        // V: Publication Date
  authorBackground: string;       // W: Author Background
  language: string;               // X: Language
  status: 'New' | 'Reviewed' | 'Approved' | 'Archived';  // Y: Status
  notesComments: string;          // Z: Notes/Additional Comments

  // System fields
  dateAdded: string;
  lastModified?: string;
}

export interface TopicCategory {
  category: string;
  description: string;
  keywords: string;
}

// Enhanced category system for book chapters and secondary tags
export interface EnhancedTopicCategory {
  category: string;
  description: string;
  keywords: string[];
  type: 'primary' | 'secondary';
  chapterMapping?: string;
}

// Predefined categories based on book structure
export const PRIMARY_CATEGORIES = [
  'Communication Bridge',
  'Saigon Decision',
  'Generational Learning',
  'Common Ground',
  'Family Stories',
  '4-Year Journey',
  'Practical Implementation'
] as const;

export const SECONDARY_TAGS = [
  'Financial Planning',
  'Career Pathways',
  'University Selection',
  'Family Dynamics',
  'Cultural Context',
  'Practical Tools',
  'Emotional Support',
  'Success Stories',
  'Challenges/Failures',
  'Expert Advice'
] as const;

export type PrimaryCategory = typeof PRIMARY_CATEGORIES[number];
export type SecondaryTag = typeof SECONDARY_TAGS[number];

// Content analysis and quality assessment interfaces
export interface ContentAnalysisResult {
  contentId: string;
  analysisDate: string;
  qualityScore: number;
  suitabilityScore: number;
  recommendedCategories: string[];
  extractedQuotes: string[];
  identifiedInsights: string[];
  culturalRelevance: number;
  actionableItems: string[];
  evidenceQuality: 'High' | 'Medium' | 'Low';
  analysisNotes: string;
}

export interface ContentCatalogCriteria {
  chapterCriteria: Record<PrimaryCategory, {
    requiredElements: string[];
    preferredSources: string[];
    qualityThreshold: number;
    culturalRelevance: number;
  }>;
  globalCriteria: {
    minSourceCredibility: 'High' | 'Medium' | 'Low';
    requirePublicationDate: boolean;
    requireAuthorInfo: boolean;
    minWordCount: number;
    maxAge: number; // days
  };
  qualityFactors: {
    evidenceWeight: number;
    culturalWeight: number;
    actionabilityWeight: number;
    quotabilityWeight: number;
  };
}

export interface DatabaseStats {
  total_entries: number;
  topic_breakdown: Record<string, number>;
  last_updated: string;
  most_popular_topic: string;
  excel_file_path: string;
}

// Enhanced database statistics for the 26-column system
export interface EnhancedDatabaseStats {
  total_entries: number;
  primary_category_breakdown: Record<PrimaryCategory, number>;
  secondary_tag_breakdown: Record<SecondaryTag, number>;
  priority_level_breakdown: Record<'High' | 'Medium' | 'Low', number>;
  source_credibility_breakdown: Record<'High' | 'Medium' | 'Low', number>;
  status_breakdown: Record<'New' | 'Reviewed' | 'Approved' | 'Archived', number>;
  language_breakdown: Record<string, number>;
  content_type_breakdown: Record<string, number>;
  average_quality_score: number;
  most_quoted_content: string[];
  most_actionable_categories: string[];
  cultural_context_coverage: Record<string, number>;
  recent_additions: number; // last 30 days
  last_updated: string;
  excel_file_path: string;
  schema_version: string;
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