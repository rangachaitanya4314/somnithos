import type { ArtworkSpecification } from './ArtworkSpecification';
import type { ArtworkResult } from './ArtworkResult';

/**
 * Replaceable Artwork Provider Interface.
 * Allows switching between Mock, Real AI, and Procedural engines without altering client code.
 */

export interface ArtworkProvider {
  id: string;
  name: string;

  /**
   * Generates artwork from a strongly typed ArtworkSpecification.
   */
  generateArtwork(
    specification: ArtworkSpecification,
    stylePresetKey?: string
  ): Promise<ArtworkResult>;

  /**
   * Regenerates artwork for the same dream with a variation seed while preserving core dream entities.
   */
  regenerateArtwork(
    specification: ArtworkSpecification,
    stylePresetKey?: string,
    variationSeed?: number
  ): Promise<ArtworkResult>;

  /**
   * Retrieves status/metadata of a previously generated artwork.
   */
  getArtworkStatus(id: string): Promise<ArtworkResult | undefined>;
}
