import type { EvidenceRecord, EvidenceRecordMatch } from '../../domain/evidence/EvidenceRecord';
import type { EvidenceRepository } from '../../domain/evidence/EvidenceRepository';
import { MOCK_EVIDENCE_RECORDS } from '../../data/mock/mockEvidenceData';

/**
 * Concrete Mock Implementation of EvidenceRepository.
 * Performs strict matching against audited evidence records.
 */

export class MockEvidenceRepository implements EvidenceRepository {
  private records: EvidenceRecord[];

  constructor(seedRecords: EvidenceRecord[] = MOCK_EVIDENCE_RECORDS) {
    this.records = seedRecords;
  }

  public matchEvidence(motifs: string[]): EvidenceRecordMatch[] {
    const matches: EvidenceRecordMatch[] = [];
    const normalizedMotifs = new Set(motifs.map(m => m.toLowerCase().trim()));

    for (const record of this.records) {
      const subject = (record.motif || record.primarySubject).toLowerCase().trim();
      const primaryMatch = normalizedMotifs.has(subject);

      if (primaryMatch) {
        matches.push({
          claim: record,
          evidenceRecord: record,
          relevanceReason: `Matched verified primary record for "${record.primarySubject}" in ${record.culturalTradition || record.exactTradition} (${record.historicalPeriod}).`,
          traditionLabel: `${record.culturalTradition || record.exactTradition} • ${record.geographicRegion || record.geographicContext}`
        });
      }
    }

    return matches;
  }

  public getRecordById(id: string): EvidenceRecord | undefined {
    return this.records.find(r => r.id === id);
  }

  public getAllRecords(): EvidenceRecord[] {
    return [...this.records];
  }
}
