import type { EvidenceRecord } from './EvidenceRecord';
import type { ResearchRecord } from '../research/ResearchRecord';
import type { SupportStatus } from './ClaimRecord';
import type { SourceTier } from './SourceTier';
import type { ProvenanceChain } from './Provenance';

export interface SourceVerificationResult {
  isValid: boolean;
  sourceId: string;
  sourceTier: SourceTier;
  errors: string[];
  warnings: string[];
  isPrimaryOrScholarly: boolean;
  metadataConfidence: number; // 0.0 to 1.0
}

export interface ClaimVerificationResult {
  claimId: string;
  supportStatus: SupportStatus;
  confidence: number;
  supportingSources: EvidenceRecord[];
  conflictingSources: EvidenceRecord[];
  provenance: ProvenanceChain;
  explanation: string;
}

/**
 * Core interface for validating sources and verifying that claims are grounded in authentic evidence.
 */
export interface SourceVerifier {
  /**
   * Verifies that a source record exists, has consistent metadata, and belongs to an acceptable tier.
   */
  verifySource(source: EvidenceRecord | ResearchRecord): SourceVerificationResult;

  /**
   * Evaluates whether a factual claim is supported by the provided sources, detecting conflicts or insufficient evidence.
   */
  verifyClaim(claimText: string, motif: string, sources: EvidenceRecord[]): ClaimVerificationResult;

  /**
   * Retrieves all verified supporting evidence records linked to a claim.
   */
  getSupportingEvidence(claimId: string): EvidenceRecord[];

  /**
   * Retrieves full metadata for a source by ID.
   */
  getSourceMetadata(sourceId: string): EvidenceRecord | undefined;
}
