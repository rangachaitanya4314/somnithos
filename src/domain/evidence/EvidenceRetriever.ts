import type { EvidenceRecordMatch } from './EvidenceRecord';
import type { ResearchRecordMatch } from '../research/ResearchRecord';
import type { ClaimRecord } from './ClaimRecord';
import type { ProvenanceChain } from './Provenance';

/**
 * Interface for structured evidence retrieval with full provenance preservation.
 */
export interface EvidenceRetriever {
  /**
   * Searches for verified evidence records by motif keyword.
   */
  searchByMotif(motif: string): EvidenceRecordMatch[];

  /**
   * Searches for verified evidence records by geographic region.
   */
  searchByRegion(region: string): EvidenceRecordMatch[];

  /**
   * Searches for verified evidence records by specific cultural/historical tradition.
   */
  searchByTradition(tradition: string): EvidenceRecordMatch[];

  /**
   * Searches for verified evidence records by historical period.
   */
  searchByHistoricalPeriod(period: string): EvidenceRecordMatch[];

  /**
   * Searches for empirical and theoretical cognitive research records.
   */
  searchResearch(features: string[]): ResearchRecordMatch[];

  /**
   * Generates discrete, verified ClaimRecords with full provenance for the given motifs.
   * Returns NO_RELIABLE_SOURCE claims when no verified records match.
   */
  findSupportingClaims(motifs: string[]): ClaimRecord[];

  /**
   * Retrieves the full provenance chain for a given claim ID.
   */
  getProvenanceForClaim(claimId: string): ProvenanceChain | undefined;
}
