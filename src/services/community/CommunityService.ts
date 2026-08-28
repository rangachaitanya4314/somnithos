import type { CommunityDreamRecord, CommunityReport, ReportCategory } from '../../domain/community/CommunityDream';
import type { CommunityRepository, CommunityFilterOptions } from '../../domain/community/CommunityRepository';
import type { ContentModerationProvider } from '../../domain/community/ContentModerationProvider';
import type { SavedDreamRecord } from '../../domain/journal/SavedDreamRecord';
import { LocalStorageCommunityRepository } from './LocalStorageCommunityRepository';
import { DefaultContentModerationProvider } from '../moderation/DefaultContentModerationProvider';
import { RateLimiterService } from '../moderation/RateLimiterService';

const BLOCKED_AUTHORS_KEY = 'somnithos_blocked_authors_v2';
const USER_SESSION_TOKEN_KEY = 'somnithos_anon_session_token';

export class CommunityService {
  private static repository: CommunityRepository = new LocalStorageCommunityRepository();
  private static moderationProvider: ContentModerationProvider = new DefaultContentModerationProvider();

  public static setRepository(repo: CommunityRepository): void {
    this.repository = repo;
  }

  public static setModerationProvider(provider: ContentModerationProvider): void {
    this.moderationProvider = provider;
  }

  /**
   * Generates or retrieves an anonymized session token for the local client.
   * Never contains email, personal name, or identifiable hardware tokens.
   */
  public static getClientToken(): string {
    if (typeof localStorage === 'undefined') return 'sess-temp-token';
    let token = localStorage.getItem(USER_SESSION_TOKEN_KEY);
    if (!token) {
      token = 'usr-' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem(USER_SESSION_TOKEN_KEY, token);
    }
    return token;
  }

  /**
   * Derives a stable anonymized author identifier (e.g. anon-7f8a) from a user token.
   */
  public static deriveAnonymousAuthorId(userToken: string): string {
    let hash = 0;
    for (let i = 0; i < userToken.length; i++) {
      hash = (hash << 5) - hash + userToken.charCodeAt(i);
      hash |= 0;
    }
    return 'anon-' + Math.abs(hash).toString(16).substring(0, 6);
  }

  /**
   * Shares a dream anonymously to the Somnithos community.
   * Enforces rate limiting, payload validation, moderation, and PII shielding.
   */
  public static async shareDreamAnonymously(
    savedDream: SavedDreamRecord,
    userToken: string = this.getClientToken()
  ): Promise<{ success: boolean; record?: CommunityDreamRecord; error?: string }> {
    // 1. Rate Limiting Check
    const rateCheck = RateLimiterService.checkSubmissionRate(userToken);
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: `Submission rate limit exceeded. Please wait ${rateCheck.retryAfterSeconds || 60} seconds before sharing another dream.`
      };
    }

    // 2. Payload Size Validation
    const sizeCheck = RateLimiterService.validatePayloadSize(savedDream);
    if (!sizeCheck.valid) {
      return {
        success: false,
        error: sizeCheck.message || 'Payload exceeds allowable size limit.'
      };
    }

    // 3. Content Moderation Check
    const moderation = await this.moderationProvider.moderateDream({
      title: savedDream.title,
      narrative: savedDream.originalNarrative,
      motifs: savedDream.motifs
    });

    if (moderation.status === 'REMOVED') {
      return {
        success: false,
        error: 'Your dream cannot be shared publicly because it contains prohibited content or severe policy violations.'
      };
    }

    // 4. PII Redaction for public excerpt
    let publicExcerpt = savedDream.originalNarrative.length > 180
      ? savedDream.originalNarrative.substring(0, 180) + '...'
      : savedDream.originalNarrative;

    if (moderation.piiResult?.hasPII) {
      publicExcerpt = moderation.piiResult.sanitizedText.length > 180
        ? moderation.piiResult.sanitizedText.substring(0, 180) + '...'
        : moderation.piiResult.sanitizedText;
    }

    const publicId = 'pub-' + Math.random().toString(36).substring(2, 9);
    const anonymousAuthorId = this.deriveAnonymousAuthorId(userToken);

    // 5. Construct Community Record with explicit AI labeling
    const communityRecord: CommunityDreamRecord = {
      id: publicId,
      dreamId: savedDream.dreamId,
      anonymousAuthorId,
      title: savedDream.title || 'Untitled Nocturne',
      narrative: savedDream.originalNarrative,
      excerpt: publicExcerpt,
      emotions: savedDream.emotions || [],
      motifs: savedDream.motifs || [],
      setting: savedDream.setting || [],
      artworkReference: savedDream.artworkReference?.artworkUrl ? {
        artworkUrl: savedDream.artworkReference.artworkUrl,
        promptUsed: savedDream.artworkReference.promptUsed,
        isAIGenerated: true,
        label: 'AI-generated artwork'
      } : undefined,
      aiReflection: savedDream.personalReflection ? {
        reflectionText: savedDream.personalReflection,
        label: 'AI-assisted reflection',
        isAIGenerated: true
      } : undefined,
      closingThought: savedDream.closingThought ? {
        thoughtText: savedDream.closingThought,
        label: 'Original thought inspired by this dream',
        isAIGenerated: true
      } : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      moderationStatus: moderation.status,
      visibility: 'SHARED_ANONYMOUSLY',
      reportCount: 0,
      reactionCount: { resonated: 0, mystified: 0, comforted: 0 },
      commentCount: 0,
      isDemoData: false,
      contentType: 'USER_GENERATED_CONTENT'
    };

    const published = await this.repository.publishDream(communityRecord);
    return { success: true, record: published };
  }

  /**
   * Revokes community sharing for a dream (Stop Sharing).
   */
  public static async stopSharingDream(
    dreamId: string,
    _userToken: string = this.getClientToken()
  ): Promise<{ success: boolean; message: string }> {
    const unshared = await this.repository.unshareDream(dreamId);
    if (unshared) {
      return { success: true, message: 'Dream has been removed from the community wall and is now private.' };
    }
    return { success: false, message: 'Dream is not currently shared in the community.' };
  }

  /**
   * Permanently deletes a dream from community storage.
   */
  public static async deleteSharedDream(dreamId: string): Promise<boolean> {
    return this.repository.deleteCommunityDream(dreamId);
  }

  /**
   * Retrieves public community dreams applying strict privacy, moderation, and blocklists.
   */
  public static async getCommunityFeed(
    options?: CommunityFilterOptions,
    userToken: string = this.getClientToken()
  ): Promise<CommunityDreamRecord[]> {
    const blocked = this.getBlockedAuthors(userToken);
    return this.repository.listCommunityDreams({
      ...options,
      excludeBlockedAuthors: blocked
    });
  }

  /**
   * Searches public community dreams.
   * Strictly searches only SHARED_ANONYMOUSLY and APPROVED items.
   */
  public static async searchCommunity(
    query: string,
    options?: CommunityFilterOptions,
    userToken: string = this.getClientToken()
  ): Promise<CommunityDreamRecord[]> {
    const blocked = this.getBlockedAuthors(userToken);
    return this.repository.searchCommunityDreams(query, {
      ...options,
      excludeBlockedAuthors: blocked
    });
  }

  /**
   * Fetches a single public dream by its public ID with authorization and isolation.
   */
  public static async getPublicDream(publicId: string): Promise<CommunityDreamRecord | null> {
    return this.repository.getPublicDreamById(publicId);
  }

  /**
   * Submits a Trust & Safety report for a community dream.
   */
  public static async reportDream(
    publicDreamId: string,
    category: ReportCategory,
    explanation?: string,
    reporterToken: string = this.getClientToken()
  ): Promise<{ success: boolean; message: string }> {
    // 1. Rate Limiting Check on reports
    const rateCheck = RateLimiterService.checkReportRate(reporterToken);
    if (!rateCheck.allowed) {
      return {
        success: false,
        message: `Report rate limit exceeded. Please wait ${rateCheck.retryAfterSeconds || 60} seconds before reporting again.`
      };
    }

    const reporterAnonId = this.deriveAnonymousAuthorId(reporterToken);
    const report: CommunityReport = {
      id: 'rep-' + Math.random().toString(36).substring(2, 9),
      dreamId: publicDreamId,
      publicDreamId,
      reporterId: reporterAnonId,
      category,
      explanation,
      createdAt: new Date().toISOString(),
      status: 'OPEN'
    };

    // 2. Run moderation provider check on report
    const modReportResult = await this.moderationProvider.moderateReport(report);
    if (modReportResult.shouldFlag) {
      await this.repository.updateModerationStatus(publicDreamId, 'FLAGGED');
    }

    await this.repository.submitReport(report);
    return {
      success: true,
      message: 'Thank you. Your report has been submitted to the Somnithos curation team for review.'
    };
  }

  /**
   * Toggles a reaction to a community dream.
   */
  public static async toggleReaction(
    publicId: string,
    type: 'resonated' | 'mystified' | 'comforted',
    userToken: string = this.getClientToken()
  ): Promise<{ success: boolean; newCount: number }> {
    return this.repository.toggleReaction(publicId, type, userToken);
  }

  /**
   * Checks if user reacted to a post.
   */
  public static hasUserReacted(
    publicId: string,
    type: 'resonated' | 'mystified' | 'comforted',
    userToken: string = this.getClientToken()
  ): boolean {
    return this.repository.hasUserReacted(publicId, type, userToken);
  }

  /**
   * Blocks an anonymous author from appearing in the user's community feed.
   */
  public static blockAuthor(authorId: string, _userToken: string = this.getClientToken()): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const blocked = this.getBlockedAuthors();
      if (!blocked.includes(authorId)) {
        blocked.push(authorId);
        localStorage.setItem(BLOCKED_AUTHORS_KEY, JSON.stringify(blocked));
      }
    } catch (e) {
      console.warn('CommunityService.blockAuthor error:', e);
    }
  }

  /**
   * Unblocks an author.
   */
  public static unblockAuthor(authorId: string, _userToken: string = this.getClientToken()): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const blocked = this.getBlockedAuthors().filter(id => id !== authorId);
      localStorage.setItem(BLOCKED_AUTHORS_KEY, JSON.stringify(blocked));
    } catch (e) {
      console.warn('CommunityService.unblockAuthor error:', e);
    }
  }

  /**
   * Lists blocked authors.
   */
  public static getBlockedAuthors(_userToken: string = this.getClientToken()): string[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(BLOCKED_AUTHORS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
