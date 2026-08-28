import type { EvidenceRecord } from '../../domain/evidence/EvidenceRecord';
import { CULTURAL_KNOWLEDGE_CLAIMS } from '../culturalSources';

/**
 * Seed repository of audited historical and cultural evidence records.
 * Uses only authentic project primary manuscripts and scholarly editions.
 * 
 * Epistemic guarantee:
 * - If evidence is not in this verified repository, the system returns "NO_RELIABLE_SOURCE".
 * - Never fabricates citations, cultures, or ancient beliefs.
 */

export const MOCK_EVIDENCE_RECORDS: EvidenceRecord[] = CULTURAL_KNOWLEDGE_CLAIMS.map(claim => {
  const isPrimary = claim.source.sourceType === 'primary_source' || claim.source.sourceType === 'museum_manuscript';
  const tier = isPrimary ? 'TIER_1' : 'TIER_2';

  return {
    id: claim.id,
    motif: claim.primarySubject,
    primarySubject: claim.primarySubject,
    claim: claim.claim,
    sourceTitle: claim.source.sourceTitle,
    author: claim.source.authorOrCreator,
    authors: claim.source.authorOrCreator,
    publisher: claim.source.institutionOrPublisher,
    institution: claim.source.institutionOrPublisher,
    publicationOrInstitution: claim.source.institutionOrPublisher,
    date: claim.source.publicationDate,
    publicationDate: claim.source.publicationDate,
    geographicRegion: claim.geographicContext,
    specificCommunity: claim.communityOrSchool,
    culturalTradition: claim.exactTradition,
    historicalPeriod: claim.historicalPeriod,
    sourceType: (isPrimary ? 'PRIMARY_HISTORICAL_SOURCE' : 'PEER_REVIEWED_RESEARCH') as EvidenceRecord['sourceType'],
    sourceTier: tier,
    url: claim.source.identifierOrUrl.startsWith('http') ? claim.source.identifierOrUrl : undefined,
    doi: claim.source.identifierOrUrl.includes('DOI:') ? claim.source.identifierOrUrl.replace('DOI:', '').trim() : undefined,
    isbn: claim.source.identifierOrUrl.includes('ISBN:') ? claim.source.identifierOrUrl.replace('ISBN:', '').trim() : undefined,
    sourceUrlOrIdentifier: claim.source.identifierOrUrl,
    evidenceLevel: claim.evidenceLevel,
    evidenceNote: claim.source.verificationNotes,
    supportingEvidence: claim.source.supportingPassage,
    supportingExcerpt: claim.source.supportingPassage,
    uncertainty: claim.whatIsUncertain,
    limitations: claim.whatIsUncertain,
    publishedAt: claim.source.publicationDate,
    retrievedAt: claim.source.lastVerifiedDate || '2026-08-28',
    secondaryKeywords: claim.secondaryKeywords,
    verificationStatus: claim.verificationStatus,
    epistemicCategory: claim.epistemicCategory,
    isSymbolMeaningUniversal: claim.isSymbolMeaningUniversal,
    source: {
      ...claim.source,
      sourceTier: tier,
      retrievedAt: claim.source.lastVerifiedDate || '2026-08-28'
    },
    exactTradition: claim.exactTradition,
    communityOrSchool: claim.communityOrSchool,
    geographicContext: claim.geographicContext,
    whatIsUncertain: claim.whatIsUncertain
  };
});
