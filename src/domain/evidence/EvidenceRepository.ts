import type { EvidenceRecord, EvidenceRecordMatch } from './EvidenceRecord';

/**
 * Interface for retrieving audited historical and cultural evidence records.
 * Adheres strictly to the source-first principle: never fabricates unverified claims.
 */
export interface EvidenceRepository {
  /**
   * Matches verified evidence records strictly against the provided motifs/keywords.
   * If a motif has no matching verified evidence, it is omitted or categorized as ungrounded.
   */
  matchEvidence(motifs: string[]): EvidenceRecordMatch[];

  /**
   * Retrieves a specific verified evidence record by ID.
   */
  getRecordById(id: string): EvidenceRecord | undefined;

  /**
   * Retrieves all verified evidence records in the archive.
   */
  getAllRecords(): EvidenceRecord[];
}
