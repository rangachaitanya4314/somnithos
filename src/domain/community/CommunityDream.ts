/**
 * Step 7: Community, Privacy & Trust/Safety Domain Model
 * 
 * Epistemic & Privacy Guarantees:
 * 1. PRIVATE BY DEFAULT: Dreams are only shared when explicitly requested.
 * 2. ANONYMITY: Real user identities, emails, and internal IDs are NEVER exposed.
 * 3. UGC SEPARATION: Community content is user-generated, not verified historical evidence.
 */

export type CommunityVisibility = 'PRIVATE' | 'SHARED_ANONYMOUSLY';

export type CommunityModerationStatus = 'PENDING' | 'APPROVED' | 'FLAGGED' | 'REMOVED';

export type ReportCategory = 
  | 'harassment'
  | 'sexual_content'
  | 'graphic_violence'
  | 'hateful_content'
  | 'self_harm'
  | 'personal_information'
  | 'spam'
  | 'misleading_attribution'
  | 'other';

export type ReportStatus = 'OPEN' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';

export interface CommunityArtworkReference {
  artworkUrl: string;
  promptUsed?: string;
  isAIGenerated: boolean;
  label: string; // "AI-generated artwork"
}

export interface CommunityAIReflection {
  reflectionText: string;
  label: string; // "AI-assisted reflection"
  isAIGenerated: boolean;
}

export interface CommunityClosingThought {
  thoughtText: string;
  label: string; // "Original thought inspired by this dream"
  isAIGenerated: boolean;
}

export interface CommunityDreamRecord {
  /** Public-facing non-sensitive identifier (e.g. pub-abc123) */
  id: string;
  /** Internal dreamId link (used for un-sharing/deletion authorization) */
  dreamId: string;
  /** Anonymized pseudonymous author hash (e.g. anon-7f8a) */
  anonymousAuthorId: string;
  /** Dream Title */
  title: string;
  /** Publicly displayed dream narrative */
  narrative: string;
  /** Short excerpt for previews */
  excerpt: string;
  /** Emotional signals */
  emotions: string[];
  /** Dominant motifs */
  motifs: string[];
  /** Setting/Locations */
  setting?: string[];
  /** Optional AI-generated artwork reference with epistemic labels */
  artworkReference?: CommunityArtworkReference;
  /** Optional AI reflection with epistemic labels */
  aiReflection?: CommunityAIReflection;
  /** Optional closing thought */
  closingThought?: CommunityClosingThought;
  /** Publication timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Current Trust & Safety moderation status */
  moderationStatus: CommunityModerationStatus;
  /** Visibility state (strictly SHARED_ANONYMOUSLY for community listings) */
  visibility: CommunityVisibility;
  /** Number of user reports submitted */
  reportCount: number;
  /** Community reactions (lightweight, non-compulsive) */
  reactionCount: {
    resonated: number;
    mystified: number;
    comforted: number;
  };
  /** Total comments count (0 for MVP) */
  commentCount: number;
  /** Whether this is a seeded demo item */
  isDemoData?: boolean;
  /** Content type classification */
  contentType: 'USER_GENERATED_CONTENT';
}

export interface CommunityReport {
  id: string;
  dreamId: string;
  publicDreamId: string;
  /** Anonymized reporter reference (NEVER exposed to the author) */
  reporterId: string;
  category: ReportCategory;
  explanation?: string;
  createdAt: string;
  status: ReportStatus;
}
