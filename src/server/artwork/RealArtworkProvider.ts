import type { ArtworkProvider } from '../../domain/artwork/ArtworkProvider';
import type { ArtworkSpecification } from '../../domain/artwork/ArtworkSpecification';
import type { ArtworkResult } from '../../domain/artwork/ArtworkResult';
import { transformSpecificationToRequest } from '../../domain/artwork/ImageGenerationRequest';
import { MockArtworkProvider } from './MockArtworkProvider';

/**
 * Real Artwork Provider for Somnithos.
 * Communicates with server-side image generation APIs (e.g. Imagen 3 via Google Generative AI API).
 * Keeps credentials server-side and falls back safely to MockArtworkProvider if API key is missing or unavailable.
 */

export class RealArtworkProvider implements ArtworkProvider {
  public id = 'real_ai';
  public name = 'Google Imagen 3 / Generative AI Provider';

  private apiKey: string;
  private fallbackProvider: MockArtworkProvider;
  private timeoutMs: number;

  constructor(
    apiKey: string = process.env.IMAGEN_API_KEY || process.env.GEMINI_API_KEY || '',
    fallbackProvider: MockArtworkProvider = new MockArtworkProvider(),
    timeoutMs: number = 25000
  ) {
    this.apiKey = apiKey;
    this.fallbackProvider = fallbackProvider;
    this.timeoutMs = timeoutMs;
  }

  public hasApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async generateArtwork(
    spec: ArtworkSpecification,
    stylePresetKey: string = 'nocturne'
  ): Promise<ArtworkResult> {
    return this.executeGeneration(spec, stylePresetKey, 0);
  }

  public async regenerateArtwork(
    spec: ArtworkSpecification,
    stylePresetKey: string = 'nocturne',
    variationSeed: number = 1
  ): Promise<ArtworkResult> {
    return this.executeGeneration(spec, stylePresetKey, variationSeed);
  }

  public async getArtworkStatus(_id: string): Promise<ArtworkResult | undefined> {
    return undefined;
  }

  private async executeGeneration(
    spec: ArtworkSpecification,
    stylePresetKey: string,
    variationSeed: number
  ): Promise<ArtworkResult> {
    // 1. Fallback if API key is missing
    if (!this.hasApiKey()) {
      const fallbackResult = await this.fallbackProvider.generateArtwork(spec, stylePresetKey);
      return {
        ...fallbackResult,
        provider: 'mock_ai',
        fallbackUsed: true,
        fallbackReason: 'Image generation API key is not configured in server environment. Used high-fidelity dream synthesis mock.',
        generationStatus: 'completed'
      };
    }

    const request = transformSpecificationToRequest(spec, variationSeed);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      // Google Generative Language Imagen API endpoint
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${this.apiKey}`;

      const requestPayload = {
        instances: [
          {
            prompt: request.positivePrompt
          }
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: request.aspectRatio === '16:9' ? '16:9' : '1:1',
          negativePrompt: request.negativePrompt,
          personGeneration: 'ALLOW_ADULT',
          safetyFilterLevel: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Imagen API error: HTTP ${response.status} ${response.statusText}`);
      }

      const data: any = await response.json();
      const b64Image = data?.predictions?.[0]?.bytesBase64Encoded;

      if (!b64Image) {
        throw new Error('No image bytes returned in predictions payload');
      }

      const mimeType = data?.predictions?.[0]?.mimeType || 'image/jpeg';
      const imageUrl = `data:${mimeType};base64,${b64Image}`;

      return {
        id: 'art-' + spec.originalDreamId + '-' + Date.now(),
        dreamId: spec.originalDreamId,
        provider: 'real_ai',
        model: 'imagen-3.0-generate-002',
        createdAt: new Date().toISOString(),
        imageUrl,
        specification: spec,
        generationStatus: 'completed',
        fallbackUsed: false,
        label: 'Your Dream — Imagined',
        subLabel: 'An artistic visualization inspired by your description.'
      };
    } catch (err: any) {
      // Safe fallback on timeout or error
      const fallbackResult = await this.fallbackProvider.generateArtwork(spec, stylePresetKey);
      return {
        ...fallbackResult,
        provider: 'mock_ai',
        fallbackUsed: true,
        fallbackReason: `Image generation service encountered an error (${err.message || 'connection failed'}). Used dream synthesis engine fallback.`,
        generationStatus: 'completed'
      };
    }
  }
}
