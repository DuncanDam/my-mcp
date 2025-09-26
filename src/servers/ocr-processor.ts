import { BaseMCPServer } from './base-server.js';
import { logger } from '../utils/logger.js';
import type { MCPToolResponse } from '../types/mcp.js';
import { readFileSync, existsSync } from 'fs';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { createWorker } from 'tesseract.js';

interface OCRResult {
  text: string;
  confidence: number;
  engine: 'google-vision' | 'tesseract';
  metadata?: {
    boundingBoxes?: any[];
    languages?: string[];
    processingTime: number;
  };
}

export class OCRProcessorServer extends BaseMCPServer {
  private visionClient: ImageAnnotatorClient | null = null;
  private googleVisionEnabled = false;
  private tesseractFallbackEnabled = true;

  constructor() {
    super('ocr-processor');

    this.tools = [
      {
        name: 'process_screenshot',
        description: 'Extract text from images using OCR (Google Vision API with Tesseract fallback)',
        inputSchema: {
          type: 'object',
          properties: {
            imagePath: {
              type: 'string',
              description: 'Absolute path to the image file'
            },
            language: {
              type: 'string',
              description: 'Language hint for OCR (e.g., "eng", "spa", "fra")',
              default: 'eng'
            },
            enableFallback: {
              type: 'boolean',
              description: 'Enable Tesseract fallback if Google Vision fails',
              default: true
            }
          },
          required: ['imagePath']
        }
      },
      {
        name: 'check_ocr_capabilities',
        description: 'Check which OCR engines are available and configured',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'extract_text_batch',
        description: 'Process multiple images in batch for OCR text extraction',
        inputSchema: {
          type: 'object',
          properties: {
            imagePaths: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of absolute paths to image files'
            },
            language: {
              type: 'string',
              description: 'Language hint for OCR',
              default: 'eng'
            },
            maxConcurrent: {
              type: 'number',
              description: 'Maximum concurrent processing (default: 3)',
              default: 3
            }
          },
          required: ['imagePaths']
        }
      }
    ];
  }

  async initialize(): Promise<void> {
    // Check if Google Vision API key is available
    const apiKey = process.env.GOOGLE_VISION_API_KEY;

    if (apiKey && apiKey !== 'your_google_vision_api_key_here') {
      try {
        // Initialize Google Vision client with API key
        this.visionClient = new ImageAnnotatorClient({
          apiKey: apiKey
        });

        // Test the connection with a simple call
        await this.testGoogleVisionConnection();

        this.googleVisionEnabled = true;
        logger.info('Google Vision API initialized successfully');
      } catch (error) {
        logger.warn('Google Vision API initialization failed, using Tesseract fallback only', {
          error: error instanceof Error ? error.message : String(error)
        });
        this.googleVisionEnabled = false;
      }
    } else {
      logger.info('Google Vision API key not configured, using Tesseract fallback only');
      this.googleVisionEnabled = false;
    }

    // Check Tesseract fallback setting
    this.tesseractFallbackEnabled = process.env.OCR_FALLBACK_ENABLED !== 'false';

    logger.info('OCR processor server initialized successfully', {
      googleVisionEnabled: this.googleVisionEnabled,
      tesseractFallbackEnabled: this.tesseractFallbackEnabled
    });
  }

  private async testGoogleVisionConnection(): Promise<void> {
    if (!this.visionClient) {
      throw new Error('Google Vision client not initialized');
    }

    // Create a minimal test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0b, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
    ]);

    await this.visionClient.textDetection({
      image: { content: testImageBuffer }
    });
  }

  async handleToolCall(name: string, args: Record<string, any>): Promise<MCPToolResponse> {
    try {
      switch (name) {
        case 'process_screenshot':
          return await this.processScreenshot(
            args.imagePath,
            args.language || 'eng',
            args.enableFallback !== false
          );
        case 'check_ocr_capabilities':
          return await this.checkOCRCapabilities();
        case 'extract_text_batch':
          return await this.extractTextBatch(
            args.imagePaths,
            args.language || 'eng',
            args.maxConcurrent || 3
          );
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      logger.error(`OCR processor tool call failed: ${name}`, {
        error: error instanceof Error ? error.message : String(error),
        args
      });
      return this.createErrorResponse(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private async processScreenshot(
    imagePath: string,
    language: string = 'eng',
    enableFallback: boolean = true
  ): Promise<MCPToolResponse> {
    const startTime = Date.now();

    try {
      // Validate image file exists
      if (!existsSync(imagePath)) {
        throw new Error(`Image file not found: ${imagePath}`);
      }

      let result: OCRResult;

      // Try Google Vision API first if available
      if (this.googleVisionEnabled) {
        try {
          result = await this.processWithGoogleVision(imagePath);
          logger.info('OCR processing completed with Google Vision', {
            imagePath,
            textLength: result.text.length,
            confidence: result.confidence,
            processingTime: Date.now() - startTime
          });
        } catch (error) {
          logger.warn('Google Vision processing failed, trying fallback', {
            error: error instanceof Error ? error.message : String(error),
            imagePath
          });

          if (enableFallback && this.tesseractFallbackEnabled) {
            result = await this.processWithTesseract(imagePath, language);
          } else {
            throw error;
          }
        }
      } else if (this.tesseractFallbackEnabled) {
        // Use Tesseract directly
        result = await this.processWithTesseract(imagePath, language);
      } else {
        throw new Error('No OCR engines available. Please configure Google Vision API key or enable Tesseract fallback.');
      }

      return this.createSuccessResponse({
        success: true,
        data: {
          extractedText: result.text,
          confidence: result.confidence,
          engine: result.engine,
          metadata: {
            ...result.metadata,
            imagePath,
            language,
            totalProcessingTime: Date.now() - startTime
          }
        },
        message: `Text extracted successfully using ${result.engine}`
      });

    } catch (error) {
      throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async processWithGoogleVision(imagePath: string): Promise<OCRResult> {
    if (!this.visionClient) {
      throw new Error('Google Vision client not initialized');
    }

    const startTime = Date.now();
    const imageBuffer = readFileSync(imagePath);

    const [result] = await this.visionClient.textDetection({
      image: { content: imageBuffer }
    });

    const detections = result.textAnnotations || [];
    const text = detections.length > 0 ? (detections[0].description || '') : '';

    // Calculate confidence (Google Vision doesn't provide overall confidence)
    const confidence = text.length > 0 ? 0.95 : 0.0;

    return {
      text: text.trim(),
      confidence,
      engine: 'google-vision',
      metadata: {
        boundingBoxes: detections.slice(1).map(det => det.boundingPoly),
        languages: result.textAnnotations?.[0]?.locale ? [result.textAnnotations[0].locale] : [],
        processingTime: Date.now() - startTime
      }
    };
  }

  private async processWithTesseract(imagePath: string, language: string): Promise<OCRResult> {
    const startTime = Date.now();

    const worker = await createWorker(language);

    try {
      const { data } = await worker.recognize(imagePath);

      return {
        text: data.text.trim(),
        confidence: data.confidence / 100, // Convert to 0-1 range
        engine: 'tesseract',
        metadata: {
          languages: [language],
          processingTime: Date.now() - startTime
        }
      };
    } finally {
      await worker.terminate();
    }
  }

  private async checkOCRCapabilities(): Promise<MCPToolResponse> {
    const capabilities = {
      googleVision: {
        enabled: this.googleVisionEnabled,
        configured: !!process.env.GOOGLE_VISION_API_KEY &&
                   process.env.GOOGLE_VISION_API_KEY !== 'your_google_vision_api_key_here',
        features: this.googleVisionEnabled ? [
          'Text detection',
          'Document text detection',
          'Multiple language support',
          'Bounding box information',
          'High accuracy'
        ] : []
      },
      tesseract: {
        enabled: this.tesseractFallbackEnabled,
        configured: true, // Always available
        features: this.tesseractFallbackEnabled ? [
          'Text recognition',
          'Multiple language support',
          'Confidence scores',
          'Offline processing'
        ] : []
      },
      recommendations: [] as string[]
    };

    // Add recommendations
    if (!capabilities.googleVision.enabled && !capabilities.tesseract.enabled) {
      capabilities.recommendations.push('Configure Google Vision API key or enable Tesseract fallback for OCR functionality');
    } else if (!capabilities.googleVision.enabled) {
      capabilities.recommendations.push('Consider adding Google Vision API key for improved accuracy');
    }

    return this.createSuccessResponse({
      success: true,
      data: capabilities,
      message: 'OCR capabilities checked successfully'
    });
  }

  private async extractTextBatch(
    imagePaths: string[],
    language: string = 'eng',
    maxConcurrent: number = 3
  ): Promise<MCPToolResponse> {
    if (!Array.isArray(imagePaths) || imagePaths.length === 0) {
      throw new Error('No image paths provided');
    }

    const startTime = Date.now();
    const results: Array<{ imagePath: string; result: OCRResult | Error }> = [];

    // Process images in batches
    for (let i = 0; i < imagePaths.length; i += maxConcurrent) {
      const batch = imagePaths.slice(i, i + maxConcurrent);

      const batchPromises = batch.map(async (imagePath) => {
        try {
          const result = await this.processSingleImage(imagePath, language);
          return { imagePath, result };
        } catch (error) {
          return {
            imagePath,
            result: error instanceof Error ? error : new Error(String(error))
          };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);

      for (const settled of batchResults) {
        if (settled.status === 'fulfilled') {
          results.push(settled.value);
        } else {
          results.push({
            imagePath: 'unknown',
            result: new Error(settled.reason)
          });
        }
      }
    }

    const successful = results.filter(r => !(r.result instanceof Error));
    const failed = results.filter(r => r.result instanceof Error);

    logger.info('Batch OCR processing completed', {
      totalImages: imagePaths.length,
      successful: successful.length,
      failed: failed.length,
      totalTime: Date.now() - startTime
    });

    return this.createSuccessResponse({
      success: true,
      data: {
        results: successful.map(r => ({
          imagePath: r.imagePath,
          extractedText: (r.result as OCRResult).text,
          confidence: (r.result as OCRResult).confidence,
          engine: (r.result as OCRResult).engine
        })),
        errors: failed.map(f => ({
          imagePath: f.imagePath,
          error: f.result instanceof Error ? f.result.message : String(f.result)
        })),
        summary: {
          totalProcessed: imagePaths.length,
          successful: successful.length,
          failed: failed.length,
          totalProcessingTime: Date.now() - startTime
        }
      },
      message: `Batch processing completed: ${successful.length}/${imagePaths.length} successful`
    });
  }

  private async processSingleImage(imagePath: string, language: string): Promise<OCRResult> {
    if (!existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    // Try Google Vision first if available
    if (this.googleVisionEnabled) {
      try {
        return await this.processWithGoogleVision(imagePath);
      } catch (error) {
        if (this.tesseractFallbackEnabled) {
          logger.warn(`Google Vision failed for ${imagePath}, using Tesseract fallback`);
          return await this.processWithTesseract(imagePath, language);
        }
        throw error;
      }
    } else if (this.tesseractFallbackEnabled) {
      return await this.processWithTesseract(imagePath, language);
    } else {
      throw new Error('No OCR engines available');
    }
  }
}