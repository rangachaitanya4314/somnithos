import type { SavedDreamRecord } from './SavedDreamRecord';

/**
 * DreamRepository Interface
 * 
 * Modular persistence abstraction for the Somnithos Dream Journal.
 * Can be backed by LocalStorage, IndexedDB, or future PostgreSQL/Supabase databases.
 */
export interface DreamRepository {
  saveDream(record: SavedDreamRecord): Promise<SavedDreamRecord>;
  getDream(dreamId: string): Promise<SavedDreamRecord | null>;
  listDreams(): Promise<SavedDreamRecord[]>;
  updateDream(record: SavedDreamRecord): Promise<SavedDreamRecord>;
  deleteDream(dreamId: string): Promise<boolean>;
  searchDreams(query: string): Promise<SavedDreamRecord[]>;
  getSharedDreams(): Promise<SavedDreamRecord[]>;
}
