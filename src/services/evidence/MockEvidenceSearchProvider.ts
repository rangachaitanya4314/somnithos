import type { EvidenceRecord, EvidenceRecordMatch } from '../../domain/evidence/EvidenceRecord';
import type { ClaimRecord } from '../../domain/evidence/ClaimRecord';
import type { SourceVerificationResult } from '../../domain/evidence/SourceVerifier';
import type { EvidenceSearchProvider } from '../../domain/evidence/EvidenceSearchProvider';
import { MOCK_EVIDENCE_RECORDS } from '../../data/mock/mockEvidenceData';
import { SourceVerifierService } from './SourceVerifierService';
import { EvidenceRetrieverService } from './EvidenceRetrieverService';

/**
 * Mock implementation of EvidenceSearchProvider.
 * Encapsulates search, verification, and claim extraction for audited records.
 */

export class MockEvidenceSearchProvider implements EvidenceSearchProvider {
  private records: EvidenceRecord[];
  private verifier: SourceVerifierService;
  private retriever: EvidenceRetrieverService;

  constructor(records: EvidenceRecord[] = MOCK_EVIDENCE_RECORDS) {
    this.records = records;
    this.verifier = new SourceVerifierService(records);
    this.retriever = new EvidenceRetrieverService(records);
  }

  public async search(query: string): Promise<EvidenceRecordMatch[]> {
    const q = query.toLowerCase().trim();
    return this.records
      .filter(r =>
        (r.motif || r.primarySubject).toLowerCase().includes(q) ||
        (r.culturalTradition || r.exactTradition).toLowerCase().includes(q) ||
        (r.geographicRegion || r.geographicContext).toLowerCase().includes(q) ||
        (r.specificCommunity || r.communityOrSchool || '').toLowerCase().includes(q) ||
        (r.author || r.authors || r.source?.authorOrCreator || '').toLowerCase().includes(q) ||
        (r.sourceTitle || r.source?.sourceTitle || '').toLowerCase().includes(q) ||
        (r.publisher || r.institution || r.publicationOrInstitution || r.source?.institutionOrPublisher || '').toLowerCase().includes(q) ||
        r.claim.toLowerCase().includes(q) ||
        r.secondaryKeywords?.some(k => k.toLowerCase().includes(q))
      )
      .map(r => ({
        claim: r,
        evidenceRecord: r,
        relevanceReason: `Query match for "${query}" in ${r.culturalTradition || r.exactTradition}.`,
        traditionLabel: `${r.culturalTradition || r.exactTradition} • ${r.geographicRegion || r.geographicContext}`
      }));
  }

  public async getSource(id: string): Promise<EvidenceRecord | undefined> {
    return this.records.find(r => r.id === id || r.source.id === id);
  }

  public verifySource(source: EvidenceRecord): SourceVerificationResult {
    return this.verifier.verifySource(source);
  }

  public extractClaims(source: EvidenceRecord): ClaimRecord[] {
    return this.retriever.findSupportingClaims([source.motif || source.primarySubject]);
  }
}
