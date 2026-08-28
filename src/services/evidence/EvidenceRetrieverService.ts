import type { EvidenceRecord, EvidenceRecordMatch } from '../../domain/evidence/EvidenceRecord';
import type { ResearchRecord, ResearchRecordMatch } from '../../domain/research/ResearchRecord';
import type { ClaimRecord } from '../../domain/evidence/ClaimRecord';
import type { ProvenanceChain } from '../../domain/evidence/Provenance';
import type { EvidenceRetriever } from '../../domain/evidence/EvidenceRetriever';
import { MOCK_EVIDENCE_RECORDS } from '../../data/mock/mockEvidenceData';
import { MOCK_RESEARCH_RECORDS } from '../../data/mock/mockResearchData';
import { SourceVerifierService } from './SourceVerifierService';

/**
 * Structured Evidence Retriever with provenance preservation.
 */

export class EvidenceRetrieverService implements EvidenceRetriever {
  private evidenceRecords: EvidenceRecord[];
  private researchRecords: ResearchRecord[];
  private verifier: SourceVerifierService;
  private claimCache: Map<string, ClaimRecord> = new Map();

  constructor(
    evidence: EvidenceRecord[] = MOCK_EVIDENCE_RECORDS,
    research: ResearchRecord[] = MOCK_RESEARCH_RECORDS
  ) {
    this.evidenceRecords = evidence;
    this.researchRecords = research;
    this.verifier = new SourceVerifierService(evidence);
  }

  public searchByMotif(motif: string): EvidenceRecordMatch[] {
    const term = motif.toLowerCase().trim();
    const matches: EvidenceRecordMatch[] = [];

    for (const record of this.evidenceRecords) {
      const subject = (record.motif || record.primarySubject).toLowerCase();
      const secondary = record.secondaryKeywords?.map(k => k.toLowerCase()) || [];

      if (subject === term || secondary.includes(term)) {
        matches.push({
          claim: record,
          evidenceRecord: record,
          relevanceReason: `Documented primary record for "${record.primarySubject}" in ${record.culturalTradition || record.exactTradition}.`,
          traditionLabel: `${record.culturalTradition || record.exactTradition} • ${record.geographicRegion || record.geographicContext}`
        });
      }
    }

    return matches;
  }

  public searchByRegion(region: string): EvidenceRecordMatch[] {
    const term = region.toLowerCase().trim();
    return this.evidenceRecords
      .filter(r => (r.geographicRegion || r.geographicContext).toLowerCase().includes(term))
      .map(record => ({
        claim: record,
        evidenceRecord: record,
        relevanceReason: `Region match for "${record.geographicRegion || record.geographicContext}".`,
        traditionLabel: `${record.culturalTradition || record.exactTradition} • ${record.geographicRegion || record.geographicContext}`
      }));
  }

  public searchByTradition(tradition: string): EvidenceRecordMatch[] {
    const term = tradition.toLowerCase().trim();
    return this.evidenceRecords
      .filter(r => (r.culturalTradition || r.exactTradition).toLowerCase().includes(term))
      .map(record => ({
        claim: record,
        evidenceRecord: record,
        relevanceReason: `Tradition match for "${record.culturalTradition || record.exactTradition}".`,
        traditionLabel: `${record.culturalTradition || record.exactTradition} • ${record.geographicRegion || record.geographicContext}`
      }));
  }

  public searchByHistoricalPeriod(period: string): EvidenceRecordMatch[] {
    const term = period.toLowerCase().trim();
    return this.evidenceRecords
      .filter(r => r.historicalPeriod.toLowerCase().includes(term))
      .map(record => ({
        claim: record,
        evidenceRecord: record,
        relevanceReason: `Historical period match for "${record.historicalPeriod}".`,
        traditionLabel: `${record.culturalTradition || record.exactTradition} • ${record.geographicRegion || record.geographicContext}`
      }));
  }

  public searchResearch(features: string[]): ResearchRecordMatch[] {
    const matches: ResearchRecordMatch[] = [];
    const normalized = features.map(f => f.toLowerCase().trim());

    for (const res of this.researchRecords) {
      const themes = (res.dreamFeature || res.relevanceToDreamThemes).map(t => t.toLowerCase());
      const hasMatch = normalized.some(feat => themes.includes(feat));

      if (hasMatch) {
        matches.push({
          researchRecord: res,
          psychologyClaim: res,
          relevanceReason: `Applicable peer-reviewed model for themes: ${themes.slice(0, 3).join(', ')}.`
        });
      }
    }

    return matches;
  }

  public findSupportingClaims(motifs: string[]): ClaimRecord[] {
    const claimRecords: ClaimRecord[] = [];

    for (const motif of motifs) {
      const cleanMotif = motif.toLowerCase().trim();
      const matchingEvidence = this.evidenceRecords.filter(r => {
        const primary = (r.motif || r.primarySubject).toLowerCase();
        return primary === cleanMotif;
      });

      if (matchingEvidence.length === 0) {
        // Explicit NO_RELIABLE_SOURCE gap record
        const gapClaimId = `claim-gap-${cleanMotif}`;
        const gapProvenance: ProvenanceChain = {
          claimId: gapClaimId,
          claimText: `No reliable source found for "${cleanMotif}".`,
          motif: cleanMotif,
          nodes: [],
          isContested: false,
          verificationTimestamp: new Date().toISOString()
        };

        const gapClaim: ClaimRecord = {
          id: gapClaimId,
          text: 'No sufficiently reliable source was found for this specific claim.',
          claimType: 'cultural_historical',
          motif: cleanMotif,
          sourceIds: [],
          highestSourceTier: 'TIER_5',
          supportStatus: 'NO_RELIABLE_SOURCE',
          confidence: 0,
          limitations: 'No audited manuscript or peer-reviewed critical edition supports this symbol in the historical catalog.',
          provenance: gapProvenance
        };

        claimRecords.push(gapClaim);
        this.claimCache.set(gapClaimId, gapClaim);
      } else {
        for (const evidence of matchingEvidence) {
          const verification = this.verifier.verifyClaim(evidence.claim, cleanMotif, [evidence]);
          const claimId = `claim-${evidence.id}`;

          const claimRecord: ClaimRecord = {
            id: claimId,
            text: evidence.claim,
            claimType: 'cultural_historical',
            motif: cleanMotif,
            sourceIds: [evidence.source.id],
            highestSourceTier: evidence.sourceTier || 'TIER_1',
            supportStatus: verification.supportStatus,
            confidence: verification.confidence,
            limitations: evidence.limitations || evidence.whatIsUncertain,
            uncertainty: evidence.uncertainty || evidence.whatIsUncertain,
            provenance: verification.provenance,
            culturalContext: {
              specificCommunity: evidence.specificCommunity || evidence.communityOrSchool,
              geographicRegion: evidence.geographicRegion || evidence.geographicContext,
              historicalPeriod: evidence.historicalPeriod
            }
          };

          claimRecords.push(claimRecord);
          this.claimCache.set(claimId, claimRecord);
        }
      }
    }

    return claimRecords;
  }

  public getProvenanceForClaim(claimId: string): ProvenanceChain | undefined {
    return this.claimCache.get(claimId)?.provenance;
  }
}
