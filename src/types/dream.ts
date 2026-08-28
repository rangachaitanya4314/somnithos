import type { EvidenceLevel as DomainEvidenceLevel } from '../domain/evidence/EvidenceLevel';
import type { EvidenceRecord, VerifiedSourceRecord as DomainVerifiedSourceRecord, SourceType as DomainSourceType, EpistemicCategory as DomainEpistemicCategory, VerificationStatus as DomainVerificationStatus, EvidenceRecordMatch } from '../domain/evidence/EvidenceRecord';
import type { ResearchRecord, ResearchRecordMatch } from '../domain/research/ResearchRecord';
import type { DreamInput as DomainDreamInput } from '../domain/dream/DreamInput';
import type { DreamFeatures as DomainDreamFeatures } from '../domain/dream/DreamFeatures';
import type { PersonalReflection as DomainPersonalReflection } from '../domain/analysis/PersonalReflection';
import type { CreativeReflection as DomainCreativeReflection } from '../domain/analysis/CreativeReflection';
import type { ArtworkPrompt as DomainArtworkPrompt } from '../domain/analysis/ArtworkPrompt';
import type { ClosingThought as DomainClosingThought } from '../domain/analysis/ClosingThought';

import type { SourceTier as DomainSourceTier } from '../domain/evidence/SourceTier';
import type { ClaimRecord as DomainClaimRecord, SupportStatus as DomainSupportStatus, ClaimType as DomainClaimType } from '../domain/evidence/ClaimRecord';
import type { ProvenanceChain as DomainProvenanceChain, ProvenanceNode as DomainProvenanceNode } from '../domain/evidence/Provenance';

export type SourceTier = DomainSourceTier;
export type ClaimRecord = DomainClaimRecord;
export type SupportStatus = DomainSupportStatus;
export type ClaimType = DomainClaimType;
export type ProvenanceChain = DomainProvenanceChain;
export type ProvenanceNode = DomainProvenanceNode;
export type EvidenceLevel = DomainEvidenceLevel;
export type SourceType = DomainSourceType;
export type EpistemicCategory = DomainEpistemicCategory;
export type VerificationStatus = DomainVerificationStatus;
export type VerifiedSourceRecord = DomainVerifiedSourceRecord;
export type FactualKnowledgeClaim = EvidenceRecord;
export type PsychologyTheoryClaim = ResearchRecord;
export type CulturalPerspectiveMatch = EvidenceRecordMatch;
export type PsychologyPerspectiveMatch = ResearchRecordMatch;
export type CreativeReflection = DomainCreativeReflection;
export type ArtworkPrompt = DomainArtworkPrompt;
export type PersonalReflection = DomainPersonalReflection;
export type ClosingThought = DomainClosingThought;
export type DreamInput = DomainDreamInput;
export type DreamFeatures = DomainDreamFeatures;

export interface VerifiedQuote {
  id: string;
  exactQuote: string;
  author: string;
  workTitle: string;
  sectionOrPage?: string;
  publicationOrManuscriptDate: string;
  publisherOrInstitution: string;
  identifierOrUrl: string;
  theme: string[];
  verificationStatus: 'VERIFIED_PRIMARY' | 'VERIFIED_SCHOLARLY_TRANSLATION';
  historicalContext: string;
}

export type DreamSubmission = DomainDreamInput & {
  id: string;
  description: string;
  emotions: string[];
  symbolsAndObjects: string[];
  privacy: 'private' | 'anonymous_public';
  createdAt: string;
};

export type ExtractedDreamFeatures = DomainDreamFeatures;

export interface DreamAnalysisResult {
  id: string;
  submissionId: string;
  createdAt: string;
  input?: DomainDreamInput;
  extractedFeatures: ExtractedDreamFeatures;
  historicalEvidence?: EvidenceRecordMatch[];
  culturalPerspectives: EvidenceRecordMatch[];
  culturalPerspectivesNotFound: boolean;
  scientificResearch?: ResearchRecordMatch[];
  psychologyPerspectives: ResearchRecordMatch[];
  evidenceGaps?: {
    ungroundedMotifs: string[];
    hasUngroundedMotifs: boolean;
    fallbackMessage: string;
  };
  personalReflection?: DomainPersonalReflection;
  personalInterpretation: {
    title: string;
    narrativeArcs: string[];
    symbolicEchoes: string[];
    suggestiveQuestions: string[];
    primarySynthesis?: string;
    emotionalResonance?: string;
    possibleInterpretations?: string[];
    emotionalReading?: string;
    uncertaintyStatement?: string;
  };
  originalReflection: {
    message: string;
    label: string; // "Original reflection inspired by your dream"
    isAIGenerated: true;
    poeticReflection?: string;
    metaphor?: string;
  };
  closingThought?: DomainClosingThought;
  verifiedQuoteMatch?: VerifiedQuote;
  artworkPrompt?: DomainArtworkPrompt;
  claims?: DomainClaimRecord[];
  dreamArtwork: {
    imageUrl: string;
    promptUsed: string;
    styleTheme: string;
    title: string;
    label: string; // "Your Dream — Imagined"
    subLabel: string; // "An artistic visualization inspired by your description."
    visualKeywords: string[];
  };
  methodologyNotes?: string;
}

export interface DreamSymbolItem {
  id: string;
  symbol: string;
  category: 'nature' | 'movement' | 'body' | 'objects' | 'places' | 'creatures';
  summaryDescription: string;
  documentedCulturalInterpretations: EvidenceRecord[];
  psychologicalPerspectives: ResearchRecord[];
  uncertaintiesAndContingencies: string;
  relatedSymbols: string[];
}

export interface FAQItem {
  id: string;
  question: string;
  category: 'sleep_science' | 'psychology' | 'culture_history' | 'mythology_folklore' | 'evidence_methodology';
  answerMarkdown: string;
  evidenceStatus: EvidenceLevel;
  primarySources?: VerifiedSourceRecord[];
}

export interface CommunityDreamPost {
  id: string;
  submissionId: string;
  title: string;
  excerpt: string;
  fullDescription: string;
  emotions: string[];
  symbols: string[];
  originalReflection: string;
  artworkUrl?: string;
  reactions: {
    resonated: number;
    mystified: number;
    comforted: number;
  };
  postedAt: string;
  isDemoData?: boolean;
}
