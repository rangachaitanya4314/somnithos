import type { CommunityDreamRecord, CommunityReport } from './CommunityDream';

export interface CommunityFilterOptions {
  emotion?: string;
  motif?: string;
  searchQuery?: string;
  excludeBlockedAuthors?: string[];
  limit?: number;
  offset?: number;
}

export interface CommunityRepository {
  /**
   * Publishes or updates a dream in the community.
   * Enforces SHARED_ANONYMOUSLY visibility.
   */
  publishDream(record: CommunityDreamRecord): Promise<CommunityDreamRecord>;

  /**
   * Un-shares a dream, revoking its community visibility and removing it from listings.
   */
  unshareDream(dreamId: string): Promise<boolean>;

  /**
   * Permanently deletes a dream from the community.
   */
  deleteCommunityDream(dreamId: string): Promise<boolean>;

  /**
   * Retrieves a single public community dream by its public ID.
   * Returns null if private or removed.
   */
  getPublicDreamById(publicId: string): Promise<CommunityDreamRecord | null>;

  /**
   * Retrieves a community record by its internal dreamId.
   */
  getCommunityDreamByInternalId(dreamId: string): Promise<CommunityDreamRecord | null>;

  /**
   * Lists all approved, publicly shared community dreams.
   * Strictly filters out PRIVATE, FLAGGED, and REMOVED dreams.
   */
  listCommunityDreams(options?: CommunityFilterOptions): Promise<CommunityDreamRecord[]>;

  /**
   * Searches public community dreams.
   * NEVER searches private records.
   */
  searchCommunityDreams(query: string, options?: CommunityFilterOptions): Promise<CommunityDreamRecord[]>;

  /**
   * Submits a Trust & Safety report.
   */
  submitReport(report: CommunityReport): Promise<CommunityReport>;

  /**
   * Retrieves all reports (for moderation auditing).
   */
  listReports(): Promise<CommunityReport[]>;

  /**
   * Updates moderation status of a dream.
   */
  updateModerationStatus(publicId: string, status: 'APPROVED' | 'FLAGGED' | 'REMOVED'): Promise<boolean>;

  /**
   * Toggles a reaction count on a community dream.
   */
  toggleReaction(publicId: string, type: 'resonated' | 'mystified' | 'comforted', userToken: string): Promise<{ success: boolean; newCount: number }>;

  /**
   * Checks if a user has reacted to a community dream.
   */
  hasUserReacted(publicId: string, type: 'resonated' | 'mystified' | 'comforted', userToken: string): boolean;
}
