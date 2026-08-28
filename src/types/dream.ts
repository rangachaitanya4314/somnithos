export type EvidenceLevel = 'HIGH' | 'MODERATE' | 'HISTORICAL' | 'TRADITIONAL' | 'UNCERTAIN';

export type SourceType =
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
  lastVerifiedDate: string;
  verificationNotes: string;
}

export interface FactualKnowledgeClaim {
  id: string;
  claim: string;
  exactTradition: string; // Narrowest context, e.g. "Ramesside New Kingdom Scribal Oneirology"
  communityOrSchool: string; // e.g. "Deir el-Medina scribal community"
  geographicContext: string; // e.g. "Thebes, Upper Egypt"
  historicalPeriod: string; // e.g. "19th Dynasty, c. 1275 BCE"
  epistemicCategory: EpistemicCategory;
  evidenceLevel: EvidenceLevel;
  verificationStatus: VerificationStatus;
  primarySubject: string; // Symbol or psychological theme (e.g., "water", "falling", "flying", "snake", "teeth")
  secondaryKeywords: string[];
  source: VerifiedSourceRecord;
  whatIsUncertain: string;
  isSymbolMeaningUniversal: boolean; // Almost always false - dream symbols are culturally & personally contingent
}

export interface PsychologyTheoryClaim {
  id: string;
  conceptName: string;
  researchers: string;
  originalPublication: string;
  publicationYear: string;
  epistemicType: 'empirical_finding' | 'theoretical_model' | 'historical_framework' | 'disputed_hypothesis';
  evidenceLevel: EvidenceLevel;
  summary: string;
  relevanceToDreamThemes: string[];
  documentedLimitations: string;
  source: VerifiedSourceRecord;
  nonDiagnosticDisclaimer: string;
}

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

export interface DreamSubmission {
  id: string;
  title?: string;
  description: string;
  emotions: string[];
  importantPeople?: string;
  animals?: string[];
  symbolsAndObjects: string[];
  location?: string;
  colors?: string[];
  beforeDream?: string;
  afterWaking?: string;
  userInterpretation?: string;
  culturalBackground?: string;
  privacy: 'private' | 'anonymous_public';
  createdAt: string;
}

export interface ExtractedDreamFeatures {
  detectedSymbols: string[];
  detectedEmotions: string[];
  detectedColors: string[];
  detectedLocations: string[];
  detectedThemes: string[];
  ambiguityLevel: 'low' | 'moderate' | 'high';
  daytimeResidueProbability: 'low' | 'moderate' | 'high';
}

export interface CulturalPerspectiveMatch {
  claim: FactualKnowledgeClaim;
  relevanceReason: string;
  traditionLabel: string;
}

export interface PsychologyPerspectiveMatch {
  psychologyClaim: PsychologyTheoryClaim;
  relevanceReason: string;
}

export interface DreamAnalysisResult {
  id: string;
  submissionId: string;
  createdAt: string;
  extractedFeatures: ExtractedDreamFeatures;
  culturalPerspectives: CulturalPerspectiveMatch[];
  culturalPerspectivesNotFound: boolean;
  psychologyPerspectives: PsychologyPerspectiveMatch[];
  personalInterpretation: {
    title: string;
    narrativeArcs: string[];
    symbolicEchoes: string[];
    suggestiveQuestions: string[];
  };
  originalReflection: {
    message: string;
    label: string; // "Original reflection inspired by your dream"
    isAIGenerated: true;
  };
  verifiedQuoteMatch?: VerifiedQuote;
  dreamArtwork: {
    imageUrl: string;
    promptUsed: string;
    styleTheme: string;
    title: string;
    label: string; // "Your Dream — Imagined"
    subLabel: string; // "An artistic visualization inspired by your description."
    visualKeywords: string[];
  };
}

export interface DreamSymbolItem {
  id: string;
  symbol: string;
  category: 'nature' | 'movement' | 'body' | 'objects' | 'places' | 'creatures';
  summaryDescription: string;
  documentedCulturalInterpretations: FactualKnowledgeClaim[];
  psychologicalPerspectives: PsychologyTheoryClaim[];
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
