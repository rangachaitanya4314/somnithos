import type { ArtworkSpecification } from './ArtworkSpecification';

export type ArtworkProviderType = 'real_ai' | 'mock_ai' | 'procedural_canvas';

export type ArtworkGenerationStatus = 'completed' | 'failed' | 'fallback_procedural';

export interface ArtworkResult {
  id: string;
  dreamId: string;
  provider: ArtworkProviderType;
  model?: string;
  createdAt: string;
  imageUrl: string;
  specification: ArtworkSpecification;
  generationStatus: ArtworkGenerationStatus;
  fallbackUsed: boolean;
  fallbackReason?: string;
  label: string; // "Your Dream — Imagined"
  subLabel: string; // "An artistic visualization inspired by your description."
  errorCode?: string;
}
