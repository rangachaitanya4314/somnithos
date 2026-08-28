import type { ArtworkProvider } from '../../domain/artwork/ArtworkProvider';
import type { ArtworkSpecification } from '../../domain/artwork/ArtworkSpecification';
import type { ArtworkResult } from '../../domain/artwork/ArtworkResult';
import { MockArtworkProvider } from './MockArtworkProvider';

/**
 * Procedural Artwork Provider.
 * Wraps procedural motif rendering as an ArtworkProvider.
 */

export class ProceduralArtworkProvider implements ArtworkProvider {
  public id = 'procedural_canvas';
  public name = 'Procedural Dream Canvas Engine';

  private mockProvider = new MockArtworkProvider();

  public async generateArtwork(
    specification: ArtworkSpecification,
    stylePresetKey?: string
  ): Promise<ArtworkResult> {
    const res = await this.mockProvider.generateArtwork(specification, stylePresetKey);
    return {
      ...res,
      provider: 'procedural_canvas',
      fallbackUsed: true,
      fallbackReason: 'Rendered using offline procedural canvas generator.'
    };
  }

  public async regenerateArtwork(
    specification: ArtworkSpecification,
    stylePresetKey?: string,
    variationSeed?: number
  ): Promise<ArtworkResult> {
    const res = await this.mockProvider.regenerateArtwork(specification, stylePresetKey, variationSeed);
    return {
      ...res,
      provider: 'procedural_canvas',
      fallbackUsed: true,
      fallbackReason: 'Regenerated using offline procedural canvas generator.'
    };
  }

  public async getArtworkStatus(id: string): Promise<ArtworkResult | undefined> {
    return this.mockProvider.getArtworkStatus(id);
  }
}
