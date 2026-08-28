import type { CommunityRepository, CommunityFilterOptions } from '../../domain/community/CommunityRepository';
import type { CommunityDreamRecord, CommunityReport } from '../../domain/community/CommunityDream';

const COMMUNITY_DREAMS_KEY = 'somnithos_community_dreams_v2';
const COMMUNITY_REPORTS_KEY = 'somnithos_community_reports_v2';
const COMMUNITY_REACTIONS_KEY = 'somnithos_community_reactions_v2';

const SEEDED_DEMO_DREAMS: CommunityDreamRecord[] = [
  {
    id: 'pub-demo-001',
    dreamId: 'demo-internal-001',
    anonymousAuthorId: 'anon-9a8b',
    title: 'The Great Golden Library',
    narrative: 'I was wandering through an endless library with towering golden shelves reaching into a dark starry sky. Every book I opened had maps of places that do not exist.',
    excerpt: 'I was wandering through an endless library with towering golden shelves reaching into a dark starry sky...',
    emotions: ['Wonder', 'Curiosity'],
    motifs: ['library', 'books', 'stars', 'gold'],
    setting: ['celestial library'],
    artworkReference: {
      artworkUrl: 'data:image/png;base64,mockDemoArtworkLibrary',
      promptUsed: 'Surreal infinite golden library under starry cosmos',
      isAIGenerated: true,
      label: 'AI-generated artwork'
    },
    aiReflection: {
      reflectionText: 'A meditation on boundless curiosity and unmapped internal landscapes.',
      label: 'AI-assisted reflection',
      isAIGenerated: true
    },
    closingThought: {
      thoughtText: 'Books in dreams often reflect what we have not yet named within ourselves.',
      label: 'Original thought inspired by this dream',
      isAIGenerated: true
    },
    createdAt: '2026-08-01T12:00:00.000Z',
    updatedAt: '2026-08-01T12:00:00.000Z',
    moderationStatus: 'APPROVED',
    visibility: 'SHARED_ANONYMOUSLY',
    reportCount: 0,
    reactionCount: { resonated: 14, mystified: 22, comforted: 9 },
    commentCount: 0,
    isDemoData: true,
    contentType: 'USER_GENERATED_CONTENT'
  },
  {
    id: 'pub-demo-002',
    dreamId: 'demo-internal-002',
    anonymousAuthorId: 'anon-3c4d',
    title: 'Swimming with Phosphorescent Whales',
    narrative: 'I plunged into warm deep ocean waters at midnight. Beside me were glowing luminous blue whales breathing trails of light. I felt zero weight and completely safe.',
    excerpt: 'I plunged into warm deep ocean waters at midnight. Beside me were glowing luminous blue whales...',
    emotions: ['Peace', 'Awe'],
    motifs: ['water', 'ocean', 'whale', 'light'],
    setting: ['deep ocean'],
    artworkReference: {
      artworkUrl: 'data:image/png;base64,mockDemoArtworkOcean',
      promptUsed: 'Luminous blue whales in deep serene nocturnal waters',
      isAIGenerated: true,
      label: 'AI-generated artwork'
    },
    aiReflection: {
      reflectionText: 'A transition towards calm weightlessness in the presence of vast natural forces.',
      label: 'AI-assisted reflection',
      isAIGenerated: true
    },
    closingThought: {
      thoughtText: 'Water in nocturnal visions frequently opens quiet spaces for restoration.',
      label: 'Original thought inspired by this dream',
      isAIGenerated: true
    },
    createdAt: '2026-08-10T15:30:00.000Z',
    updatedAt: '2026-08-10T15:30:00.000Z',
    moderationStatus: 'APPROVED',
    visibility: 'SHARED_ANONYMOUSLY',
    reportCount: 0,
    reactionCount: { resonated: 31, mystified: 12, comforted: 28 },
    commentCount: 0,
    isDemoData: true,
    contentType: 'USER_GENERATED_CONTENT'
  }
];

export class LocalStorageCommunityRepository implements CommunityRepository {
  private cache: CommunityDreamRecord[] | null = null;
  private reportsCache: CommunityReport[] | null = null;

  private loadDreams(): CommunityDreamRecord[] {
    if (this.cache) return this.cache;
    if (typeof localStorage === 'undefined') {
      this.cache = [...SEEDED_DEMO_DREAMS];
      return this.cache;
    }
    const raw = localStorage.getItem(COMMUNITY_DREAMS_KEY);
    if (!raw) {
      this.cache = [...SEEDED_DEMO_DREAMS];
      this.saveDreamsToStorage(this.cache);
      return this.cache;
    }
    try {
      const parsed: CommunityDreamRecord[] = JSON.parse(raw);
      this.cache = parsed;
      return this.cache;
    } catch {
      this.cache = [...SEEDED_DEMO_DREAMS];
      return this.cache;
    }
  }

  private saveDreamsToStorage(dreams: CommunityDreamRecord[]): void {
    this.cache = dreams;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(COMMUNITY_DREAMS_KEY, JSON.stringify(dreams));
      } catch (e) {
        console.warn('LocalStorageCommunityRepository.saveDreams error:', e);
      }
    }
  }

  private loadReports(): CommunityReport[] {
    if (this.reportsCache) return this.reportsCache;
    if (typeof localStorage === 'undefined') {
      this.reportsCache = [];
      return this.reportsCache;
    }
    const raw = localStorage.getItem(COMMUNITY_REPORTS_KEY);
    if (!raw) {
      this.reportsCache = [];
      return this.reportsCache;
    }
    try {
      this.reportsCache = JSON.parse(raw);
      return this.reportsCache || [];
    } catch {
      this.reportsCache = [];
      return this.reportsCache;
    }
  }

  private saveReportsToStorage(reports: CommunityReport[]): void {
    this.reportsCache = reports;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(COMMUNITY_REPORTS_KEY, JSON.stringify(reports));
      } catch (e) {
        console.warn('LocalStorageCommunityRepository.saveReports error:', e);
      }
    }
  }

  public async publishDream(record: CommunityDreamRecord): Promise<CommunityDreamRecord> {
    const dreams = this.loadDreams();
    const existingIndex = dreams.findIndex(d => d.dreamId === record.dreamId || d.id === record.id);

    if (existingIndex >= 0) {
      dreams[existingIndex] = {
        ...record,
        updatedAt: new Date().toISOString()
      };
      this.saveDreamsToStorage(dreams);
      return dreams[existingIndex];
    } else {
      const updated = [record, ...dreams];
      this.saveDreamsToStorage(updated);
      return record;
    }
  }

  public async unshareDream(dreamId: string): Promise<boolean> {
    const dreams = this.loadDreams();
    const existingIndex = dreams.findIndex(d => d.dreamId === dreamId);
    if (existingIndex >= 0) {
      // Switch visibility to PRIVATE and remove from community listings
      dreams.splice(existingIndex, 1);
      this.saveDreamsToStorage(dreams);
      return true;
    }
    return false;
  }

  public async deleteCommunityDream(dreamId: string): Promise<boolean> {
    const dreams = this.loadDreams();
    const filtered = dreams.filter(d => d.dreamId !== dreamId && d.id !== dreamId);
    if (filtered.length !== dreams.length) {
      this.saveDreamsToStorage(filtered);
      return true;
    }
    return false;
  }

  public async getPublicDreamById(publicId: string): Promise<CommunityDreamRecord | null> {
    const dreams = this.loadDreams();
    const match = dreams.find(d => d.id === publicId);
    // Strict isolation: only return if SHARED_ANONYMOUSLY and APPROVED
    if (!match || match.visibility !== 'SHARED_ANONYMOUSLY' || match.moderationStatus !== 'APPROVED') {
      return null;
    }
    return match;
  }

  public async getCommunityDreamByInternalId(dreamId: string): Promise<CommunityDreamRecord | null> {
    const dreams = this.loadDreams();
    return dreams.find(d => d.dreamId === dreamId) || null;
  }

  public async listCommunityDreams(options?: CommunityFilterOptions): Promise<CommunityDreamRecord[]> {
    const dreams = this.loadDreams();
    return dreams.filter(d => {
      // 1. Strict Privacy & Moderation Isolation
      if (d.visibility !== 'SHARED_ANONYMOUSLY') return false;
      if (d.moderationStatus !== 'APPROVED') return false;

      // 2. Blocked authors check
      if (options?.excludeBlockedAuthors?.includes(d.anonymousAuthorId)) {
        return false;
      }

      // 3. Emotion filter
      if (options?.emotion && options.emotion !== 'all') {
        const hasEmotion = d.emotions.some(e => e.toLowerCase() === options.emotion?.toLowerCase());
        if (!hasEmotion) return false;
      }

      // 4. Motif filter
      if (options?.motif && options.motif !== 'all') {
        const hasMotif = d.motifs.some(m => m.toLowerCase().includes(options.motif!.toLowerCase()));
        if (!hasMotif) return false;
      }

      // 5. Search query
      if (options?.searchQuery && options.searchQuery.trim().length > 0) {
        const q = options.searchQuery.toLowerCase();
        const matches =
          d.title.toLowerCase().includes(q) ||
          d.narrative.toLowerCase().includes(q) ||
          d.motifs.some(m => m.toLowerCase().includes(q)) ||
          d.emotions.some(e => e.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }

  public async searchCommunityDreams(query: string, options?: CommunityFilterOptions): Promise<CommunityDreamRecord[]> {
    return this.listCommunityDreams({
      ...options,
      searchQuery: query
    });
  }

  public async submitReport(report: CommunityReport): Promise<CommunityReport> {
    const reports = this.loadReports();
    reports.push(report);
    this.saveReportsToStorage(reports);

    // Increment report count on target dream and auto-flag if threshold reached (3+ reports)
    const dreams = this.loadDreams();
    const dream = dreams.find(d => d.id === report.publicDreamId || d.dreamId === report.dreamId);
    if (dream) {
      dream.reportCount = (dream.reportCount || 0) + 1;
      if (dream.reportCount >= 3) {
        dream.moderationStatus = 'FLAGGED';
      }
      this.saveDreamsToStorage(dreams);
    }

    return report;
  }

  public async listReports(): Promise<CommunityReport[]> {
    return this.loadReports();
  }

  public async updateModerationStatus(publicId: string, status: 'APPROVED' | 'FLAGGED' | 'REMOVED'): Promise<boolean> {
    const dreams = this.loadDreams();
    const dream = dreams.find(d => d.id === publicId);
    if (dream) {
      dream.moderationStatus = status;
      dream.updatedAt = new Date().toISOString();
      this.saveDreamsToStorage(dreams);
      return true;
    }
    return false;
  }

  public async toggleReaction(
    publicId: string,
    type: 'resonated' | 'mystified' | 'comforted',
    userToken: string
  ): Promise<{ success: boolean; newCount: number }> {
    const dreams = this.loadDreams();
    const dream = dreams.find(d => d.id === publicId);
    if (!dream) return { success: false, newCount: 0 };

    const reactionKey = `${publicId}_${type}_${userToken}`;
    let reactedMap: Record<string, boolean> = {};

    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(COMMUNITY_REACTIONS_KEY);
        if (raw) reactedMap = JSON.parse(raw);
      } catch {}
    }

    const hasReacted = !!reactedMap[reactionKey];
    if (hasReacted) {
      dream.reactionCount[type] = Math.max(0, dream.reactionCount[type] - 1);
      delete reactedMap[reactionKey];
    } else {
      dream.reactionCount[type] = (dream.reactionCount[type] || 0) + 1;
      reactedMap[reactionKey] = true;
    }

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(COMMUNITY_REACTIONS_KEY, JSON.stringify(reactedMap));
      } catch {}
    }

    this.saveDreamsToStorage(dreams);
    return { success: true, newCount: dream.reactionCount[type] };
  }

  public hasUserReacted(
    publicId: string,
    type: 'resonated' | 'mystified' | 'comforted',
    userToken: string
  ): boolean {
    if (typeof localStorage === 'undefined') return false;
    try {
      const raw = localStorage.getItem(COMMUNITY_REACTIONS_KEY);
      if (!raw) return false;
      const reactedMap = JSON.parse(raw);
      return !!reactedMap[`${publicId}_${type}_${userToken}`];
    } catch {
      return false;
    }
  }
}
