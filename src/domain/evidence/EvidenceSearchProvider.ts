import type { EvidenceRecord, EvidenceRecordMatch } from './EvidenceRecord';
import type { ClaimRecord } from './ClaimRecord';
import type { SourceVerificationResult } from './SourceVerifier';

/**
 * Adapter interface for modular evidence search providers.
 * Designed to support future academic database integrations (e.g. DreamResearch.net, UCSC, museum APIs)
 * strictly via server-side connectors without altering the core pipeline.
 */

export interface EvidenceSearchProvider {
  /**
   * Search for evidence matching a query.
   */
  search(query: string): Promise<EvidenceRecordMatch[]> | EvidenceRecordMatch[];

  /**
   * Retrieve a specific source by unique ID.
   */
  getSource(id: string): Promise<EvidenceRecord | undefined> | EvidenceRecord | undefined;

  /**
   * Verify source metadata integrity and tier compliance.
   */
  verifySource(source: EvidenceRecord): SourceVerificationResult;

  /**
   * Extract structured factual ClaimRecords with provenance from a source.
   */
  extractClaims(source: EvidenceRecord): ClaimRecord[];
}
