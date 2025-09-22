import fs from 'fs/promises';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import type {
  EnhancedContentEntry,
  ContentAnalysisResult,
  ScrapedContent
} from '../types/content.js';

export class ContentAnalysisEngine {
  private catalogGuidelines: string = '';

  constructor() {
    this.initializeCatalogGuidelines();
  }

  private async initializeCatalogGuidelines(): Promise<void> {
    try {
      if (config.contentCatalog.validationEnabled) {
        this.catalogGuidelines = await fs.readFile(config.contentCatalog.guidelinesPath, 'utf-8');
        logger.info('Content catalog guidelines loaded', {
          path: config.contentCatalog.guidelinesPath,
          size: this.catalogGuidelines.length
        });
      }
    } catch (error) {
      logger.warn('Failed to load content catalog guidelines', {
        error: error instanceof Error ? error.message : String(error),
        path: config.contentCatalog.guidelinesPath
      });
    }
  }

  /**
   * Performs comprehensive content analysis using AI and catalog guidelines
   */
  async analyzeContent(content: ScrapedContent): Promise<ContentAnalysisResult> {
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.info('Starting content analysis', {
      analysisId,
      url: content.url,
      contentLength: content.content.length
    });

    try {
      // Extract basic content features
      const basicAnalysis = this.extractBasicFeatures(content);

      // Perform AI-powered content classification
      const categoryAnalysis = await this.classifyContent(content);

      // Assess content quality against catalog guidelines
      const qualityAssessment = await this.assessContentQuality(content);

      // Extract quotes and actionable insights
      const insightExtraction = await this.extractInsightsAndQuotes(content);

      // Evaluate cultural relevance
      const culturalRelevance = this.evaluateCulturalRelevance(content);

      const result: ContentAnalysisResult = {
        contentId: analysisId,
        analysisDate: new Date().toISOString(),
        qualityScore: qualityAssessment.overallScore,
        suitabilityScore: qualityAssessment.suitabilityScore,
        recommendedCategories: categoryAnalysis.primaryCategories,
        extractedQuotes: insightExtraction.quotes,
        identifiedInsights: insightExtraction.insights,
        culturalRelevance: culturalRelevance,
        actionableItems: insightExtraction.actionableItems,
        evidenceQuality: qualityAssessment.evidenceQuality,
        analysisNotes: this.generateAnalysisNotes({
          basicAnalysis,
          categoryAnalysis,
          qualityAssessment,
          insightExtraction,
          culturalRelevance
        })
      };

      logger.info('Content analysis completed', {
        analysisId,
        qualityScore: result.qualityScore,
        suitabilityScore: result.suitabilityScore,
        categoriesFound: result.recommendedCategories.length,
        quotesFound: result.extractedQuotes.length
      });

      return result;

    } catch (error) {
      logger.error('Content analysis failed', {
        analysisId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new Error(`Content analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Converts analysis result to enhanced content entry
   */
  async createEnhancedContentEntry(
    content: ScrapedContent,
    analysis: ContentAnalysisResult
  ): Promise<EnhancedContentEntry> {

    const entry: EnhancedContentEntry = {
      // Core Information (A-D)
      linkToArticle: content.url,
      shortDescription: content.summary || content.metadata.description || '',
      categoryTags: analysis.recommendedCategories,
      keyWordsIdeas: this.extractKeywords(content, analysis),

      // Book Mapping (E-F)
      chapterRelevance: analysis.recommendedCategories.filter(cat =>
        this.isPrimaryCategory(cat)
      ),
      sectionMapping: this.mapToBookSections(analysis.recommendedCategories),

      // Audience Analysis (G-J)
      personaRelevance: this.determinePersonaRelevance(content, analysis),
      contentType: this.determineContentType(content),
      communicationElement: this.extractCommunicationElements(content, analysis),
      generationalPerspective: this.determineGenerationalPerspective(content, analysis),

      // Content Quality (K-O)
      emotionalTone: this.determineEmotionalTone(content, analysis),
      dialogueTrigger: this.extractDialogueTriggers(analysis),
      actionableContent: analysis.actionableItems.join('; '),
      realWorldApplication: this.determineRealWorldApplication(content, analysis),
      supportingEvidence: this.extractSupportingEvidence(content),

      // Prioritization (P-R)
      priorityLevel: this.determinePriorityLevel(analysis),
      quotePotential: analysis.extractedQuotes.slice(0, 3).join(' | '),
      caseStudyValue: this.assessCaseStudyValue(content, analysis),

      // Metadata (S-Z)
      dataStatistics: this.extractDataStatistics(content),
      culturalContext: this.describeCulturalContext(analysis.culturalRelevance),
      sourceCredibility: this.assessSourceCredibility(content),
      publicationDate: content.metadata.publishDate || '',
      authorBackground: content.metadata.author || '',
      language: content.metadata.language || 'English',
      status: 'New',
      notesComments: analysis.analysisNotes,

      // System fields
      dateAdded: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0]
    };

    return entry;
  }

  // Private helper methods for content analysis

  private extractBasicFeatures(content: ScrapedContent) {
    return {
      wordCount: content.metadata.wordCount,
      hasAuthor: !!content.metadata.author,
      hasPublishDate: !!content.metadata.publishDate,
      contentLength: content.content.length,
      titleLength: content.title.length,
      summaryLength: content.summary.length
    };
  }

  private async classifyContent(content: ScrapedContent) {
    // AI-powered classification logic
    const text = `${content.title} ${content.summary} ${content.content}`.toLowerCase();

    const primaryCategories: string[] = [];
    const secondaryTags: string[] = [];

    // Simple keyword-based classification (can be enhanced with ML)
    const categoryKeywords = {
      'Communication Bridge': ['communication', 'dialogue', 'conversation', 'parent-child', 'talk'],
      'Saigon Decision': ['decision', 'location', 'opportunity', 'choice', 'planning'],
      'Generational Learning': ['generation', 'learning', 'mentor', 'wisdom', 'experience'],
      'Common Ground': ['values', 'shared', 'common', 'unity', 'agreement'],
      'Family Stories': ['story', 'experience', 'case', 'example', 'narrative'],
      '4-Year Journey': ['university', 'college', 'education', 'academic', 'student'],
      'Practical Implementation': ['practical', 'implementation', 'step', 'action', 'guide']
    };

    const tagKeywords = {
      'Financial Planning': ['budget', 'cost', 'money', 'financial', 'investment'],
      'Career Pathways': ['career', 'job', 'profession', 'pathway', 'success'],
      'Cultural Context': ['culture', 'vietnamese', 'tradition', 'heritage', 'cultural'],
      'Family Dynamics': ['family', 'relationship', 'dynamics', 'interaction'],
      'Emotional Support': ['emotion', 'support', 'anxiety', 'stress', 'confidence']
    };

    // Classification logic
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const matches = keywords.filter(keyword => text.includes(keyword)).length;
      if (matches >= 2) {
        primaryCategories.push(category);
      }
    }

    for (const [tag, keywords] of Object.entries(tagKeywords)) {
      const matches = keywords.filter(keyword => text.includes(keyword)).length;
      if (matches >= 1) {
        secondaryTags.push(tag);
      }
    }

    return {
      primaryCategories,
      secondaryTags,
      confidence: Math.min(0.9, (primaryCategories.length + secondaryTags.length) * 0.2)
    };
  }

  private async assessContentQuality(content: ScrapedContent) {
    let overallScore = 5.0; // Base score
    let suitabilityScore = 5.0;
    let evidenceQuality: 'High' | 'Medium' | 'Low' = 'Medium';

    // Word count assessment
    if (content.metadata.wordCount >= config.qualityControl.minWordCount) {
      overallScore += 1.0;
    } else {
      overallScore -= 1.0;
    }

    // Author and publication date
    if (content.metadata.author) overallScore += 0.5;
    if (content.metadata.publishDate) overallScore += 0.5;

    // Source credibility assessment
    const sourceCredibility = this.assessSourceCredibility(content);
    switch (sourceCredibility) {
      case 'High':
        overallScore += 2.0;
        evidenceQuality = 'High';
        break;
      case 'Medium':
        overallScore += 1.0;
        break;
      case 'Low':
        overallScore -= 0.5;
        evidenceQuality = 'Low';
        break;
    }

    // Content depth assessment
    if (content.content.includes('research') || content.content.includes('study')) {
      overallScore += 1.0;
      evidenceQuality = evidenceQuality === 'Low' ? 'Medium' : 'High';
    }

    // Catalog guidelines consultation
    if (config.contentCatalog.validationEnabled && this.catalogGuidelines) {
      suitabilityScore = await this.evaluateAgainstCatalog(content);
    }

    return {
      overallScore: Math.max(0, Math.min(10, overallScore)),
      suitabilityScore: Math.max(0, Math.min(10, suitabilityScore)),
      evidenceQuality
    };
  }

  private async extractInsightsAndQuotes(content: ScrapedContent) {
    const quotes: string[] = [];
    const insights: string[] = [];
    const actionableItems: string[] = [];

    // Extract potential quotes (sentences with quotation marks or key phrases)
    const quotePhrases = content.content.match(/[""]([^""]+)[""]|'([^']+)'/g) || [];
    quotes.push(...quotePhrases.slice(0, 5).map(q => q.replace(/[""']/g, '')));

    // Extract insights (sentences starting with key insight words)
    const insightWords = ['The key is', 'Research shows', 'Studies indicate', 'It\'s important to'];
    const sentences = content.content.split(/[.!?]+/);

    for (const sentence of sentences) {
      for (const word of insightWords) {
        if (sentence.trim().toLowerCase().startsWith(word.toLowerCase())) {
          insights.push(sentence.trim());
          break;
        }
      }
    }

    // Extract actionable items (imperatives and step-by-step instructions)
    const actionWords = ['Start by', 'Begin with', 'Try to', 'Consider', 'Make sure to'];
    for (const sentence of sentences) {
      for (const word of actionWords) {
        if (sentence.trim().toLowerCase().startsWith(word.toLowerCase())) {
          actionableItems.push(sentence.trim());
          break;
        }
      }
    }

    return {
      quotes: quotes.slice(0, 5),
      insights: insights.slice(0, 5),
      actionableItems: actionableItems.slice(0, 5)
    };
  }

  private evaluateCulturalRelevance(content: ScrapedContent): number {
    const text = `${content.title} ${content.summary} ${content.content}`.toLowerCase();

    const culturalKeywords = [
      'vietnamese', 'vietnam', 'asian', 'family', 'generation', 'tradition',
      'cultural', 'heritage', 'immigrant', 'education', 'respect', 'honor'
    ];

    const matches = culturalKeywords.filter(keyword => text.includes(keyword)).length;
    return Math.min(1.0, matches * 0.15);
  }

  private async evaluateAgainstCatalog(content: ScrapedContent): Promise<number> {
    // Simplified catalog evaluation - can be enhanced with more sophisticated NLP
    let score = 5.0;

    const text = content.content.toLowerCase();

    // Check for required elements mentioned in guidelines
    if (text.includes('family') || text.includes('parent') || text.includes('child')) {
      score += 1.0;
    }

    if (text.includes('communication') || text.includes('dialogue')) {
      score += 1.0;
    }

    if (text.includes('vietnamese') || text.includes('cultural')) {
      score += 1.5;
    }

    return Math.min(10, score);
  }

  // Helper methods for content entry creation
  private extractKeywords(content: ScrapedContent, _analysis: ContentAnalysisResult): string {
    const words = content.content.toLowerCase().split(/\s+/);
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);

    const wordCounts = new Map<string, number>();
    words.forEach(word => {
      const clean = word.replace(/[^\w]/g, '');
      if (clean.length > 3 && !commonWords.has(clean)) {
        wordCounts.set(clean, (wordCounts.get(clean) || 0) + 1);
      }
    });

    const topWords = Array.from(wordCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    return topWords.join(', ');
  }

  private isPrimaryCategory(category: string): boolean {
    const primaryCategories = [
      'Communication Bridge', 'Saigon Decision', 'Generational Learning',
      'Common Ground', 'Family Stories', '4-Year Journey', 'Practical Implementation'
    ];
    return primaryCategories.includes(category);
  }

  private mapToBookSections(categories: string[]): string {
    return categories.filter(cat => this.isPrimaryCategory(cat)).join(', ');
  }

  private determinePersonaRelevance(content: ScrapedContent, _analysis: ContentAnalysisResult): string[] {
    const personas = [];
    const text = content.content.toLowerCase();

    if (text.includes('parent') || text.includes('mother') || text.includes('father')) {
      personas.push('Traditional Parents');
    }
    if (text.includes('student') || text.includes('young') || text.includes('teenager')) {
      personas.push('Modern Students');
    }
    if (text.includes('bridge') || text.includes('cultural') || text.includes('generation')) {
      personas.push('Cultural Bridge-builders');
    }

    return personas;
  }

  private determineContentType(content: ScrapedContent): string {
    if (content.url.includes('research') || content.content.includes('study')) return 'Research';
    if (content.content.includes('case') || content.content.includes('story')) return 'Case Study';
    if (content.content.includes('guide') || content.content.includes('how to')) return 'Guide';
    return 'Article';
  }

  private extractCommunicationElements(content: ScrapedContent, _analysis: ContentAnalysisResult): string[] {
    const elements = [];
    const text = content.content.toLowerCase();

    if (text.includes('conversation') || text.includes('dialogue')) elements.push('Dialogue');
    if (text.includes('listen') || text.includes('hearing')) elements.push('Active Listening');
    if (text.includes('question') || text.includes('ask')) elements.push('Questioning');
    if (text.includes('empathy') || text.includes('understand')) elements.push('Empathy');

    return elements;
  }

  private determineGenerationalPerspective(content: ScrapedContent, _analysis: ContentAnalysisResult): string {
    const text = content.content.toLowerCase();

    if (text.includes('millennial') || text.includes('gen z')) return 'Younger Generation';
    if (text.includes('boomer') || text.includes('traditional')) return 'Older Generation';
    if (text.includes('bridge') || text.includes('both')) return 'Multi-generational';

    return 'Universal';
  }

  private determineEmotionalTone(content: ScrapedContent, _analysis: ContentAnalysisResult): string {
    const text = content.content.toLowerCase();

    if (text.includes('positive') || text.includes('optimistic') || text.includes('hope')) return 'Positive';
    if (text.includes('challenge') || text.includes('difficult') || text.includes('struggle')) return 'Realistic';
    if (text.includes('inspire') || text.includes('motivate') || text.includes('encourage')) return 'Inspirational';

    return 'Neutral';
  }

  private extractDialogueTriggers(analysis: ContentAnalysisResult): string {
    return analysis.identifiedInsights
      .filter(insight => insight.includes('ask') || insight.includes('discuss') || insight.includes('talk'))
      .slice(0, 2)
      .join('; ');
  }

  private determineRealWorldApplication(_content: ScrapedContent, analysis: ContentAnalysisResult): string {
    return analysis.actionableItems.slice(0, 3).join('; ');
  }

  private extractSupportingEvidence(content: ScrapedContent): string[] {
    const evidence = [];
    const text = content.content;

    // Look for statistics or data
    const numbers = text.match(/\d+%|\d+\.\d+%|\d+ percent/gi) || [];
    evidence.push(...numbers.slice(0, 3));

    // Look for research citations
    const research = text.match(/according to [^.]+|research shows [^.]+|studies indicate [^.]+/gi) || [];
    evidence.push(...research.slice(0, 2));

    return evidence;
  }

  private determinePriorityLevel(analysis: ContentAnalysisResult): 'High' | 'Medium' | 'Low' {
    if (analysis.qualityScore >= 8 && analysis.suitabilityScore >= 8) return 'High';
    if (analysis.qualityScore >= 6 && analysis.suitabilityScore >= 6) return 'Medium';
    return 'Low';
  }

  private assessCaseStudyValue(content: ScrapedContent, _analysis: ContentAnalysisResult): string {
    const text = content.content.toLowerCase();

    if (text.includes('case study') || text.includes('example') || text.includes('story')) {
      return 'High - Contains real examples and narratives';
    }
    if (text.includes('experience') || text.includes('example')) {
      return 'Medium - Has experiential elements';
    }

    return 'Low - Primarily theoretical';
  }

  private extractDataStatistics(content: ScrapedContent): string {
    const statistics = content.content.match(/\d+%|\d+\.\d+%|\d+ percent|\d+ out of \d+/gi) || [];
    return statistics.slice(0, 3).join(', ');
  }

  private describeCulturalContext(relevance: number): string {
    if (relevance >= 0.7) return 'High Vietnamese family relevance';
    if (relevance >= 0.4) return 'Moderate cultural applicability';
    if (relevance >= 0.2) return 'General family context';
    return 'Universal principles';
  }

  private assessSourceCredibility(content: ScrapedContent): 'High' | 'Medium' | 'Low' {
    const url = content.url.toLowerCase();

    // High credibility sources
    if (url.includes('edu') || url.includes('gov') || url.includes('org')) return 'High';
    if (url.includes('research') || url.includes('journal') || url.includes('academic')) return 'High';

    // Medium credibility sources
    if (url.includes('psychology') || url.includes('family') || url.includes('counseling')) return 'Medium';
    if (content.metadata.author && content.metadata.publishDate) return 'Medium';

    return 'Low';
  }

  private generateAnalysisNotes(analysisData: any): string {
    const notes = [];

    notes.push(`Quality Score: ${analysisData.qualityAssessment.overallScore}/10`);
    notes.push(`Cultural Relevance: ${(analysisData.culturalRelevance * 100).toFixed(0)}%`);
    notes.push(`Categories: ${analysisData.categoryAnalysis.primaryCategories.join(', ')}`);
    notes.push(`Evidence Quality: ${analysisData.qualityAssessment.evidenceQuality}`);

    if (analysisData.insightExtraction.quotes.length > 0) {
      notes.push(`Notable Quotes: ${analysisData.insightExtraction.quotes.length} found`);
    }

    return notes.join(' | ');
  }
}