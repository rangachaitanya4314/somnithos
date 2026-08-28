import type { EvidenceLevel } from './EvidenceLevel';
import type { SourceTier } from './SourceTier';

export type SourceType =
  | 'PRIMARY_HISTORICAL_SOURCE'
  | 'ARCHAEOLOGICAL_RECORD'
  | 'PEER_REVIEWED_RESEARCH'
  | 'SECONDARY_SCHOLARSHIP'
  | 'primary_source'
  | 'peer_reviewed_journal'
  | 'academic_book'
  | 'university_archive'
  | 'museum_manuscript'
  | 'scholarly_edition'
  | 'critical_commentary';

export type EpistemicCategory =
  | 'primary_religious_text'
  | 'later_scholarly_commentary'
  | 'historical_oneiromancy'
  | 'folk_tradition'
  | 'empirical_neuroscience_finding'
  | 'cognitive_psychological_model'
  | 'historical_psychoanalytic_theory'
  | 'speculative_interpretation';

export type VerificationStatus =
  | 'VERIFIED_PRIMARY'
  | 'VERIFIED_PEER_REVIEWED'
  | 'VERIFIED_SCHOLARLY_TRANSLATION'
  | 'HISTORICALLY_DOCUMENTED_BELIEF'
  | 'ATTRIBUTION_DEBATED';

export interface VerifiedSourceRecord {
  id: string;
  sourceTitle: string;
  authorOrCreator: string;
  institutionOrPublisher: string;
  publicationDate: string; // e.g. "c. 1275 BCE", "1977", "2000"
  identifierOrUrl: string; // DOI, Museum Accession No (e.g. BM EA 10683), or canonical academic URL
  pageChapterSection?: string;
  supportingPassage: string; // Exact translated excerpt or documented summary
  sourceType: SourceType;
  sourceTier?: SourceTier;
  url?: string;
  doi?: string;
  isbn?: string;
  language?: string;
  originalPublication?: string;
  publishedAt?: string;
  retrievedAt?: string;
  lastVerifiedDate: string;
  verificationNotes: string;
}

export interface EvidenceRecord {
  id: string;
  motif?: string; // Target motif / subject (e.g. "water", "falling", "flying", "snake", "teeth")
  primarySubject: string; // Primary subject keyword
  claim: string; // Specific historical/cultural claim
  sourceTitle?: string;
  author?: string;
  authors?: string;
  publisher?: string;
  institution?: string;
  publicationOrInstitution?: string;
  date?: string; // Historical period or manuscript date
  publicationDate?: string;
  geographicRegion?: string; // Specific geographic context
  specificCommunity?: string; // Specific school / scribe community
  culturalTradition?: string; // Specific tradition
  historicalPeriod: string; // Historical timeframe
  sourceType?: SourceType;
  sourceTier?: SourceTier; // Quality tier
  url?: string;
  doi?: string;
  isbn?: string;
  language?: string;
  originalPublication?: string;
  sourceUrlOrIdentifier?: string; // DOI, Museum Accession, or academic URL
  evidenceLevel: EvidenceLevel;
  evidenceNote?: string; // Critical evaluation note
  supportingEvidence?: string;
  supportingExcerpt?: string; // Exact translation / quote
  uncertainty?: string; // What remains uncertain or debated
  limitations?: string;
  scholarlyDisagreement?: string;
  publishedAt?: string;
  retrievedAt?: string;
  secondaryKeywords?: string[];
  verificationStatus?: VerificationStatus;
  epistemicCategory: EpistemicCategory;
  isSymbolMeaningUniversal: boolean; // Dream symbols are culturally & personally contingent
  source: VerifiedSourceRecord; // Underlying verified source record

  // Specific community & historical fields
  exactTradition: string;
  communityOrSchool: string;
  geographicContext: string;
  whatIsUncertain: string;
}

export interface EvidenceRecordMatch {
  claim: EvidenceRecord;
  evidenceRecord: EvidenceRecord;
  relevanceReason: string;
  traditionLabel: string;
  isFallbackNoSource?: boolean;
}
