import type { DreamSubmission, DreamAnalysisResult, CommunityDreamPost } from '../types/dream';
import { COMMUNITY_DEMO_DREAMS } from '../data/communityDemo';
import type { SavedDreamRecord } from '../domain/journal/SavedDreamRecord';
import { LocalStorageDreamRepository } from './storage/LocalStorageDreamRepository';
import type { DreamRepository } from '../domain/journal/DreamRepository';

const COMMUNITY_POSTS_KEY = 'somnithos_community_posts_v1';
const USER_REACTIONS_KEY = 'somnithos_user_reactions_v1';
const LEGACY_COMMUNITY_KEY = 'dreamscape_community_posts_v1';
const LEGACY_REACTIONS_KEY = 'dreamscape_user_reactions_v1';

export interface SavedDreamEntry {
  submission: DreamSubmission;
  analysis: DreamAnalysisResult;
  savedAt: string;
}

export class StorageService {
  private static repository: DreamRepository = new LocalStorageDreamRepository();

  /**
   * Returns the active dream repository instance.
   */
  public static getRepository(): DreamRepository {
    return this.repository;
  }

  /**
   * Sets custom repository instance (e.g. for testing or future remote DB).
   */
  public static setRepository(repo: DreamRepository): void {
    this.repository = repo;
  }

  /**
   * Converts DreamSubmission + DreamAnalysisResult into a SavedDreamRecord.
   */
  public static toSavedDreamRecord(submission: DreamSubmission, analysis: DreamAnalysisResult): SavedDreamRecord {
    return {
      dreamId: submission.id,
      title: submission.title || 'Untitled Nocturnal Experience',
      originalNarrative: submission.description || '',
      createdAt: submission.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emotions: submission.emotions || analysis.extractedFeatures?.detectedEmotions || [],
      motifs: analysis.extractedFeatures?.dominantMotifs || analysis.extractedFeatures?.detectedSymbols || submission.symbolsAndObjects || [],
      setting: analysis.extractedFeatures?.setting || (submission.location ? [submission.location] : []),
      analysisResult: analysis as any,
      evidenceReferences: analysis.culturalPerspectives?.map(p => p.claim?.source?.sourceTitle || p.claim?.id).filter(Boolean) as string[],
      researchReferences: analysis.psychologyPerspectives?.map(p => p.psychologyClaim?.conceptName || p.psychologyClaim?.id).filter(Boolean) as string[],
      personalReflection: analysis.personalInterpretation?.primarySynthesis || (analysis.personalInterpretation as any)?.narrativeArcs?.[0],
      creativeReflection: analysis.originalReflection?.message,
      artworkReference: {
        artworkUrl: analysis.dreamArtwork?.imageUrl,
        promptUsed: analysis.dreamArtwork?.promptUsed
      },
      closingThought: analysis.closingThought?.thought,
      privacyStatus: submission.privacy === 'anonymous_public' ? 'SHARED_ANONYMOUSLY' : 'PRIVATE',
      analysisVersion: '1.0.0'
    };
  }

  /**
   * Saves a dream analysis result to the repository.
   */
  public static saveDreamAnalysis(submission: DreamSubmission, analysis: DreamAnalysisResult): void {
    const record = this.toSavedDreamRecord(submission, analysis);
    this.repository.saveDream(record);
  }

  /**
   * Retrieves all saved dream records asynchronously.
   */
  public static async getSavedDreams(): Promise<SavedDreamRecord[]> {
    return this.repository.listDreams();
  }

  /**
   * Synchronous backwards-compatibility retrieval returning SavedDreamEntry[].
   */
  public static getSavedDreamAnalyses(): SavedDreamEntry[] {
    if (this.repository instanceof LocalStorageDreamRepository) {
      // LocalStorageDreamRepository maintains an in-memory cache we can read synchronously
      const localRepo = this.repository as LocalStorageDreamRepository;
      let records: SavedDreamRecord[] = [];
      localRepo.listDreams().then(res => { records = res; });

      // Fallback to reading storage directly if empty
      if (records.length === 0 && typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('somnithos_dream_journal_v2');
        if (raw) {
          try {
            records = JSON.parse(raw);
          } catch {
            records = [];
          }
        }
      }

      return records.map(r => ({
        submission: {
          id: r.dreamId,
          title: r.title,
          description: r.originalNarrative,
          emotions: r.emotions,
          symbolsAndObjects: r.motifs,
          location: r.setting?.[0],
          privacy: r.privacyStatus === 'SHARED_ANONYMOUSLY' ? 'anonymous_public' : 'private',
          createdAt: r.createdAt
        },
        analysis: r.analysisResult as any,
        savedAt: r.updatedAt || r.createdAt
      }));
    }
    return [];
  }

  /**
   * Deletes a saved dream by submission/dream ID.
   */
  public static deleteSavedDream(submissionId: string): void {
    this.repository.deleteDream(submissionId);
  }

  /**
   * Updates the privacy status of a saved dream.
   */
  public static async updateDreamPrivacy(dreamId: string, privacyStatus: 'PRIVATE' | 'SHARED_ANONYMOUSLY'): Promise<SavedDreamRecord | null> {
    const dream = await this.repository.getDream(dreamId);
    if (!dream) return null;
    const updated: SavedDreamRecord = {
      ...dream,
      privacyStatus,
      updatedAt: new Date().toISOString()
    };
    return this.repository.updateDream(updated);
  }

  /**
   * Publishes an anonymous public dream to the community wall.
   */
  public static publishToCommunity(submission: DreamSubmission, analysis: DreamAnalysisResult): CommunityDreamPost {
    const post: CommunityDreamPost = {
      id: 'comm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      submissionId: submission.id,
      title: submission.title || 'Anonymous Dreamer',
      excerpt: submission.description.length > 140 
        ? submission.description.substring(0, 140) + '...'
        : submission.description,
      fullDescription: submission.description,
      emotions: submission.emotions || [],
      symbols: analysis.extractedFeatures?.detectedSymbols || [],
      originalReflection: analysis.originalReflection?.message || '',
      artworkUrl: analysis.dreamArtwork?.imageUrl,
      reactions: {
        resonated: 0,
        mystified: 0,
        comforted: 0
      },
      postedAt: 'Just now',
      isDemoData: false
    };

    try {
      const posts = this.getCommunityPosts();
      const updated = [post, ...posts];
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('StorageService.publishToCommunity error:', e);
    }

    return post;
  }

  /**
   * Retrieves all community posts (combines demo + user published).
   */
  public static getCommunityPosts(): CommunityDreamPost[] {
    try {
      if (typeof localStorage === 'undefined') {
        return COMMUNITY_DEMO_DREAMS;
      }
      const raw = localStorage.getItem(COMMUNITY_POSTS_KEY) || localStorage.getItem(LEGACY_COMMUNITY_KEY);
      const userPosts: CommunityDreamPost[] = raw ? JSON.parse(raw) : [];
      // Combine user posts with demo posts
      return [...userPosts, ...COMMUNITY_DEMO_DREAMS];
    } catch (e) {
      console.warn('StorageService.getCommunityPosts error:', e);
      return COMMUNITY_DEMO_DREAMS;
    }
  }

  /**
   * Adds a reaction to a community post.
   */
  public static toggleReaction(postId: string, reactionType: 'resonated' | 'mystified' | 'comforted'): { success: boolean; newCount: number } {
    try {
      if (typeof localStorage === 'undefined') {
        return { success: false, newCount: 0 };
      }
      const reactionKey = `${postId}_${reactionType}`;
      const rawReactions = localStorage.getItem(USER_REACTIONS_KEY) || localStorage.getItem(LEGACY_REACTIONS_KEY);
      const reactedSet: Record<string, boolean> = rawReactions ? JSON.parse(rawReactions) : {};

      const hasReacted = !!reactedSet[reactionKey];
      const posts = this.getCommunityPosts();
      const target = posts.find(p => p.id === postId);

      if (!target) return { success: false, newCount: 0 };

      if (hasReacted) {
        target.reactions[reactionType] = Math.max(0, target.reactions[reactionType] - 1);
        delete reactedSet[reactionKey];
      } else {
        target.reactions[reactionType] += 1;
        reactedSet[reactionKey] = true;
      }

      localStorage.setItem(USER_REACTIONS_KEY, JSON.stringify(reactedSet));
      
      // Save user posts back
      const userOnly = posts.filter(p => !p.isDemoData);
      localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(userOnly));

      return { success: true, newCount: target.reactions[reactionType] };
    } catch (e) {
      console.warn('StorageService.toggleReaction error:', e);
      return { success: false, newCount: 0 };
    }
  }

  /**
   * Checks if user has reacted to a post.
   */
  public static hasUserReacted(postId: string, reactionType: 'resonated' | 'mystified' | 'comforted'): boolean {
    try {
      if (typeof localStorage === 'undefined') return false;
      const raw = localStorage.getItem(USER_REACTIONS_KEY) || localStorage.getItem(LEGACY_REACTIONS_KEY);
      if (!raw) return false;
      const reactedSet: Record<string, boolean> = JSON.parse(raw);
      return !!reactedSet[`${postId}_${reactionType}`];
    } catch {
      return false;
    }
  }
}
