import type { ProvenanceChain } from './Provenance';
import type { SourceTier } from './SourceTier';

export type SupportStatus =
  | 'SUPPORTED'
  | 'PARTIALLY_SUPPORTED'
  | 'CONTESTED'
  | 'INSUFFICIENT_EVIDENCE'
  | 'NO_RELIABLE_SOURCE';

export type ClaimType =
  | 'cultural_historical'
  | 'empirical_science'
  | 'cognitive_model'
  | 'folk_tradition';

/**
 * Strongly-typed ClaimRecord.
 * Represents a discrete, verified factual assertion with full provenance linkage.
 */

export interface ClaimRecord {
  id: string;
  text: string; // The factual assertion
  claimType: ClaimType;
  motif: string; // Primary motif or psychological phenomenon
  sourceIds: string[];
  highestSourceTier: SourceTier;
  supportStatus: SupportStatus;
  confidence: number; // 0.0 to 1.0 based on tier and corroboration
  limitations?: string;
  uncertainty?: string;
  conflictingSourceIds?: string[]; // Preserved when sources disagree
  competingClaims?: string[]; // Competing interpretations
  provenance: ProvenanceChain;
  culturalContext?: {
    specificCommunity: string;
    geographicRegion: string;
    historicalPeriod: string;
  };
}
