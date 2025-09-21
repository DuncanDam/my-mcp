import * as cheerio from 'cheerio';
export class ContentExtractor {
    static extractMetaData(html) {
        const $ = cheerio.load(html);
        const description = $('meta[name="description"]').attr('content') ||
            $('meta[property="og:description"]').attr('content') ||
            $('meta[name="twitter:description"]').attr('content');
        const author = $('meta[name="author"]').attr('content') ||
            $('meta[property="article:author"]').attr('content') ||
            $('meta[name="twitter:creator"]').attr('content');
        const publishDate = $('meta[property="article:published_time"]').attr('content') ||
            $('meta[name="date"]').attr('content') ||
            $('time[datetime]').attr('datetime');
        const language = $('html').attr('lang') ||
            $('meta[http-equiv="content-language"]').attr('content');
        // Extract text content for word count
        const textContent = this.extractTextContent(html);
        const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
        const metadata = {
            wordCount
        };
        if (description)
            metadata.description = description;
        if (author)
            metadata.author = author;
        if (publishDate)
            metadata.publishDate = publishDate;
        if (language)
            metadata.language = language;
        return metadata;
    }
    static extractTextContent(html) {
        const $ = cheerio.load(html);
        // Remove script and style elements
        $('script, style, nav, header, footer, aside, .ads, .advertisement').remove();
        // Try to find main content area
        const contentSelectors = [
            'main',
            'article',
            '.content',
            '.post-content',
            '.entry-content',
            '.article-content',
            '#content',
            '.main-content'
        ];
        let content = '';
        for (const selector of contentSelectors) {
            const element = $(selector);
            if (element.length > 0) {
                content = element.text();
                break;
            }
        }
        // Fallback to body if no specific content area found
        if (!content) {
            content = $('body').text();
        }
        // Clean up whitespace
        return content
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, '\n')
            .trim();
    }
    static extractTitle(html, url) {
        const $ = cheerio.load(html);
        // Try multiple title sources in order of preference
        const title = $('title').text() ||
            $('meta[property="og:title"]').attr('content') ||
            $('meta[name="twitter:title"]').attr('content') ||
            $('h1').first().text() ||
            new URL(url).hostname;
        return title.trim();
    }
    static generateSummary(content, maxLength = 500) {
        if (!content || content.length <= maxLength) {
            return content;
        }
        // Split into sentences and take complete sentences up to maxLength
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        let summary = '';
        for (const sentence of sentences) {
            const trimmedSentence = sentence.trim();
            if (summary.length + trimmedSentence.length + 1 <= maxLength) {
                summary += (summary ? '. ' : '') + trimmedSentence;
            }
            else {
                break;
            }
        }
        // If no complete sentences fit, truncate at word boundary
        if (!summary && content.length > maxLength) {
            const truncated = content.substring(0, maxLength);
            const lastSpace = truncated.lastIndexOf(' ');
            summary = lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
        }
        return summary || content;
    }
    static isValidUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        }
        catch {
            return false;
        }
    }
    static normalizeUrl(url) {
        try {
            const urlObj = new URL(url);
            // Remove unnecessary query parameters and fragments
            const cleanUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
            return cleanUrl.endsWith('/') && urlObj.pathname !== '/'
                ? cleanUrl.slice(0, -1)
                : cleanUrl;
        }
        catch {
            return url;
        }
    }
}
