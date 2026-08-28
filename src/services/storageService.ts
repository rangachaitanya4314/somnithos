import type { DreamSubmission, DreamAnalysisResult, CommunityDreamPost } from '../types/dream';
import { COMMUNITY_DEMO_DREAMS } from '../data/communityDemo';

const SAVED_ANALYSES_KEY = 'somnithos_saved_analyses_v1';
const COMMUNITY_POSTS_KEY = 'somnithos_community_posts_v1';
const USER_REACTIONS_KEY = 'somnithos_user_reactions_v1';
const LEGACY_SAVED_KEY = 'dreamscape_saved_analyses_v1';
const LEGACY_COMMUNITY_KEY = 'dreamscape_community_posts_v1';
const LEGACY_REACTIONS_KEY = 'dreamscape_user_reactions_v1';

export interface SavedDreamEntry {
  submission: DreamSubmission;
  analysis: DreamAnalysisResult;
  savedAt: string;
}

export class StorageService {
  /**
   * Saves a dream analysis result to localStorage.
   */
  public static saveDreamAnalysis(submission: DreamSubmission, analysis: DreamAnalysisResult): void {
    try {
      const existing = this.getSavedDreamAnalyses();
      const entry: SavedDreamEntry = {
        submission,
        analysis,
        savedAt: new Date().toISOString()
      };
      // Keep most recent first, max 30 items
      const updated = [entry, ...existing.filter(e => e.submission.id !== submission.id)].slice(0, 30);
      localStorage.setItem(SAVED_ANALYSES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('StorageService.saveDreamAnalysis error:', e);
    }
  }

  /**
   * Retrieves all saved dream analyses.
   */
  public static getSavedDreamAnalyses(): SavedDreamEntry[] {
    try {
      const raw = localStorage.getItem(SAVED_ANALYSES_KEY) || localStorage.getItem(LEGACY_SAVED_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      console.warn('StorageService.getSavedDreamAnalyses error:', e);
      return [];
    }
  }

  /**
   * Deletes a saved dream by submission ID.
   */
  public static deleteSavedDream(submissionId: string): void {
    try {
      const existing = this.getSavedDreamAnalyses();
      const filtered = existing.filter(e => e.submission.id !== submissionId);
      localStorage.setItem(SAVED_ANALYSES_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn('StorageService.deleteSavedDream error:', e);
    }
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
      symbols: analysis.extractedFeatures.detectedSymbols || [],
      originalReflection: analysis.originalReflection.message,
      artworkUrl: analysis.dreamArtwork.imageUrl,
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
      localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(updated));
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
      const raw = localStorage.getItem(USER_REACTIONS_KEY) || localStorage.getItem(LEGACY_REACTIONS_KEY);
      if (!raw) return false;
      const reactedSet: Record<string, boolean> = JSON.parse(raw);
      return !!reactedSet[`${postId}_${reactionType}`];
    } catch (e) {
      return false;
    }
  }
}
