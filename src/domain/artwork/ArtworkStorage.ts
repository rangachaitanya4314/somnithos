import type { ArtworkResult } from './ArtworkResult';

/**
 * Storage Abstraction for Dream Artwork.
 * Keeps artwork caching decoupled from specific cloud storage providers (e.g. GCS, S3, Base64).
 */

export interface ArtworkStorage {
  saveArtwork(artwork: ArtworkResult): Promise<string>;
  getArtwork(id: string): Promise<ArtworkResult | undefined>;
  deleteArtwork(id: string): Promise<boolean>;
}

export class InMemoryArtworkStorage implements ArtworkStorage {
  private store = new Map<string, ArtworkResult>();

  public async saveArtwork(artwork: ArtworkResult): Promise<string> {
    this.store.set(artwork.id, artwork);
    return artwork.id;
  }

  public async getArtwork(id: string): Promise<ArtworkResult | undefined> {
    return this.store.get(id);
  }

  public async deleteArtwork(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
