import type { DreamSubmission, ExtractedDreamFeatures } from '../types/dream';
import { DreamArtGenerator } from './dreamArtGenerator';

export type ImageProviderType = 'procedural_canvas' | 'generative_ai_api';

export interface ArtGenerationRequest {
  submission: DreamSubmission;
  features: ExtractedDreamFeatures;
  stylePresetKey?: string;
  customPrompt?: string;
  apiKey?: string;
  canvasTarget?: HTMLCanvasElement;
}

export interface ArtGenerationResponse {
  imageUrl: string;
  provider: ImageProviderType;
  promptUsed: string;
  visualElementsDetected: string[];
  generationTimeMs: number;
  isFallback: boolean;
  notes: string;
}

export interface ImageGenerationProvider {
  id: ImageProviderType;
  name: string;
  description: string;
  requiresApiKey: boolean;
  generate(request: ArtGenerationRequest): Promise<ArtGenerationResponse>;
}

/**
 * High-fidelity Procedural HTML5 Canvas Art Provider
 * Renders faithful visual motifs (trains, fish, birds, clocks, doors, forests, underwater environments, etc.)
 * entirely offline and in real-time.
 */
export class ProceduralCanvasProvider implements ImageGenerationProvider {
  public id: ImageProviderType = 'procedural_canvas';
  public name = 'Procedural Canvas Engine (Real-Time)';
  public description = 'Generates dream-grounded surrealist compositions directly on HTML5 Canvas using dynamic layered shaders and motif synthesis.';
  public requiresApiKey = false;

  public async generate(request: ArtGenerationRequest): Promise<ArtGenerationResponse> {
    const startTime = performance.now();
    
    // Create an offscreen or provided canvas
    let canvas = request.canvasTarget;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = 900;
      canvas.height = 600;
    }

    const dataUrl = DreamArtGenerator.renderDreamCanvas(
      canvas,
      request.submission,
      request.features,
      request.stylePresetKey || 'nocturne'
    );

    const endTime = performance.now();

    return {
      imageUrl: dataUrl,
      provider: 'procedural_canvas',
      promptUsed: DreamArtGenerator.synthesizeArtPrompt(request.submission, request.features),
      visualElementsDetected: DreamArtGenerator.extractVisualElements(request.submission, request.features),
      generationTimeMs: Math.round(endTime - startTime),
      isFallback: false,
      notes: 'Rendered client-side via Somnithos Procedural Scene Synthesis.'
    };
  }
}

/**
 * External Generative AI Model Provider (Imagen / Gemini / OpenAI / Replicate Connector)
 * Provides modular integration point for cloud generative image APIs,
 * with automatic, graceful fallback to Procedural Canvas if no API key is provided or network fails.
 */
export class ExternalGenerativeAIProvider implements ImageGenerationProvider {
  public id: ImageProviderType = 'generative_ai_api';
  public name = 'Generative AI Model API (Modular Connector)';
  public description = 'Connects to an external image generation endpoint (e.g., Google Imagen 3, Gemini, or custom generative pipeline).';
  public requiresApiKey = true;

  private fallbackProvider = new ProceduralCanvasProvider();

  public async generate(request: ArtGenerationRequest): Promise<ArtGenerationResponse> {
    const startTime = performance.now();
    const prompt = request.customPrompt || DreamArtGenerator.synthesizeArtPrompt(request.submission, request.features);

    // If no API key is provided, gracefully use the high-fidelity procedural provider
    if (!request.apiKey) {
      const fallbackResult = await this.fallbackProvider.generate(request);
      return {
        ...fallbackResult,
        provider: 'generative_ai_api',
        isFallback: true,
        notes: 'No external API key configured. Rendered using the High-Fidelity Procedural Somnithos Engine.'
      };
    }

    try {
      // Modular API endpoint call placeholder
      // When user configures an endpoint/key in settings, the fetch is dispatched here
      const response = await fetch('/api/generate-dream-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${request.apiKey}`
        },
        body: JSON.stringify({
          prompt,
          aspectRatio: '3:2',
          styleTheme: request.stylePresetKey || 'surrealist_museum'
        })
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      const endTime = performance.now();

      return {
        imageUrl: data.imageUrl,
        provider: 'generative_ai_api',
        promptUsed: prompt,
        visualElementsDetected: DreamArtGenerator.extractVisualElements(request.submission, request.features),
        generationTimeMs: Math.round(endTime - startTime),
        isFallback: false,
        notes: 'Generated via external Generative Image Model API.'
      };
    } catch (err) {
      console.warn('External image generation API failed or unavailable, using procedural fallback:', err);
      const fallbackResult = await this.fallbackProvider.generate(request);
      return {
        ...fallbackResult,
        provider: 'generative_ai_api',
        isFallback: true,
        notes: 'External API connection unavailable. Displaying Procedural Somnithos visual artwork.'
      };
    }
  }
}

/**
 * Unified Image Generation Service Manager
 */
export class ImageGenerationService {
  private static providers: Record<ImageProviderType, ImageGenerationProvider> = {
    procedural_canvas: new ProceduralCanvasProvider(),
    generative_ai_api: new ExternalGenerativeAIProvider()
  };

  private static activeProviderId: ImageProviderType = 'procedural_canvas';
  private static apiKeyStorageKey = 'somnithos_image_api_key';

  public static setProvider(providerId: ImageProviderType) {
    this.activeProviderId = providerId;
  }

  public static getActiveProvider(): ImageGenerationProvider {
    return this.providers[this.activeProviderId] || this.providers.procedural_canvas;
  }

  public static getAllProviders(): ImageGenerationProvider[] {
    return Object.values(this.providers);
  }

  public static getApiKey(): string | null {
    return localStorage.getItem(this.apiKeyStorageKey);
  }

  public static setApiKey(key: string) {
    localStorage.setItem(this.apiKeyStorageKey, key);
  }

  public static async generateArtwork(request: ArtGenerationRequest): Promise<ArtGenerationResponse> {
    const provider = this.getActiveProvider();
    const apiKey = request.apiKey || this.getApiKey() || undefined;

    return provider.generate({
      ...request,
      apiKey
    });
  }
}
