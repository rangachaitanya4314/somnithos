import type { DreamRepository } from '../../domain/journal/DreamRepository';
import type { SavedDreamRecord } from '../../domain/journal/SavedDreamRecord';

const STORAGE_KEY = 'somnithos_dream_journal_v2';
const LEGACY_STORAGE_KEY = 'somnithos_saved_analyses_v1';

export class LocalStorageDreamRepository implements DreamRepository {
  private memoryCache: SavedDreamRecord[] | null = null;

  private loadRecords(): SavedDreamRecord[] {
    if (this.memoryCache) {
      return this.memoryCache;
    }

    try {
      if (typeof localStorage === 'undefined') {
        this.memoryCache = [];
        return [];
      }

      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.memoryCache = JSON.parse(raw);
        return this.memoryCache || [];
      }

      // Check legacy migration
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        try {
          const legacyItems: Array<{
            submission: {
              id: string;
              title?: string;
              description: string;
              emotions?: string[];
              symbolsAndObjects?: string[];
              location?: string;
              privacy?: 'private' | 'anonymous_public';
              createdAt?: string;
            };
            analysis: any;
            savedAt: string;
          }> = JSON.parse(legacyRaw);

          const migrated: SavedDreamRecord[] = legacyItems.map(item => ({
            dreamId: item.submission.id,
            title: item.submission.title || 'Untitled Dream',
            originalNarrative: item.submission.description || '',
            createdAt: item.submission.createdAt || item.savedAt || new Date().toISOString(),
            updatedAt: item.savedAt || new Date().toISOString(),
            emotions: item.submission.emotions || item.analysis?.extractedFeatures?.detectedEmotions || [],
            motifs: item.analysis?.extractedFeatures?.dominantMotifs || item.analysis?.extractedFeatures?.detectedSymbols || item.submission.symbolsAndObjects || [],
            setting: item.analysis?.extractedFeatures?.setting || (item.submission.location ? [item.submission.location] : []),
            analysisResult: item.analysis,
            personalReflection: item.analysis?.personalInterpretation?.primarySynthesis || item.analysis?.personalInterpretation?.narrativeArcs?.[0],
            creativeReflection: item.analysis?.originalReflection?.message,
            artworkReference: {
              artworkUrl: item.analysis?.dreamArtwork?.imageUrl,
              promptUsed: item.analysis?.dreamArtwork?.promptUsed
            },
            closingThought: item.analysis?.closingThought?.thought,
            privacyStatus: item.submission.privacy === 'anonymous_public' ? 'SHARED_ANONYMOUSLY' : 'PRIVATE',
            analysisVersion: '1.0.0'
          }));

          this.memoryCache = migrated;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          return migrated;
        } catch {
          // ignore migration parse error
        }
      }

      this.memoryCache = [];
      return [];
    } catch {
      this.memoryCache = [];
      return [];
    }
  }

  private saveRecords(records: SavedDreamRecord[]): void {
    this.memoryCache = records;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      }
    } catch (err) {
      console.warn('LocalStorageDreamRepository.saveRecords error:', err);
    }
  }

  public async saveDream(record: SavedDreamRecord): Promise<SavedDreamRecord> {
    const records = this.loadRecords();
    const existingIndex = records.findIndex(r => r.dreamId === record.dreamId);

    const fullRecord: SavedDreamRecord = {
      ...record,
      updatedAt: new Date().toISOString(),
      analysisVersion: record.analysisVersion || '1.0.0',
      privacyStatus: record.privacyStatus || 'PRIVATE'
    };

    if (existingIndex >= 0) {
      // Update existing
      records[existingIndex] = {
        ...records[existingIndex],
        ...fullRecord,
        createdAt: records[existingIndex].createdAt // Preserve original createdAt
      };
    } else {
      // Prepend new
      records.unshift(fullRecord);
    }

    this.saveRecords(records);
    return fullRecord;
  }

  public async getDream(dreamId: string): Promise<SavedDreamRecord | null> {
    const records = this.loadRecords();
    const found = records.find(r => r.dreamId === dreamId);
    return found || null;
  }

  public async listDreams(): Promise<SavedDreamRecord[]> {
    const records = this.loadRecords();
    // Return sorted newest first
    return [...records].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public async updateDream(record: SavedDreamRecord): Promise<SavedDreamRecord> {
    return this.saveDream(record);
  }

  public async deleteDream(dreamId: string): Promise<boolean> {
    const records = this.loadRecords();
    const filtered = records.filter(r => r.dreamId !== dreamId);
    const wasDeleted = filtered.length < records.length;
    this.saveRecords(filtered);
    return wasDeleted;
  }

  public async searchDreams(query: string): Promise<SavedDreamRecord[]> {
    const records = await this.listDreams();
    if (!query || !query.trim()) {
      return records;
    }

    const q = query.toLowerCase().trim();
    return records.filter(r => {
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchNarrative = r.originalNarrative.toLowerCase().includes(q);
      const matchMotifs = r.motifs.some(m => m.toLowerCase().includes(q));
      const matchEmotions = r.emotions.some(e => e.toLowerCase().includes(q));
      const matchSetting = r.setting?.some(s => s.toLowerCase().includes(q));
      return matchTitle || matchNarrative || matchMotifs || matchEmotions || matchSetting;
    });
  }

  public async getSharedDreams(): Promise<SavedDreamRecord[]> {
    const records = await this.listDreams();
    return records.filter(r => r.privacyStatus === 'SHARED_ANONYMOUSLY');
  }

  /**
   * Clears cache and storage (primarily for tests)
   */
  public clear(): void {
    this.memoryCache = [];
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }
}
