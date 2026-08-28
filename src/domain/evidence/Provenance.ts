import type { SourceTier } from './SourceTier';
import type { EvidenceLevel } from './EvidenceLevel';

/**
 * Detailed Provenance Chain for any factual claim displayed in Somnithos.
 * Enables the "Why Am I Seeing This?" source viewer to trace claims back to specific manuscripts.
 */

export interface ProvenanceNode {
  claimId: string;
  sourceId: string;
  sourceTier: SourceTier;
  sourceTitle: string;
  authorOrCreator?: string;
  institutionOrPublisher?: string;
  publicationDate?: string;
  citation: string;
  urlOrIdentifier?: string;
  supportingExcerpt: string;
  evidenceLevel: EvidenceLevel;
  culturalTradition?: string;
  geographicRegion?: string;
  historicalPeriod?: string;
  uncertainty?: string;
  retrievedAt: string;
}

export interface ProvenanceChain {
  claimId: string;
  claimText: string;
  motif: string;
  nodes: ProvenanceNode[];
  isContested: boolean;
  contestReason?: string;
  verificationTimestamp: string;
}
