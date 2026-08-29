import type { DreamInput } from '../dream/DreamInput';
import type { DreamFeatures } from '../dream/DreamFeatures';
import type { EvidenceRecordMatch } from '../evidence/EvidenceRecord';
import type { ResearchRecordMatch } from '../research/ResearchRecord';
import type { PersonalReflection } from './PersonalReflection';
import type { CreativeReflection } from './CreativeReflection';
import type { ArtworkPrompt } from './ArtworkPrompt';
import type { ClosingThought } from './ClosingThought';
import type { VerifiedQuote } from '../../types/dream';

/**
 * Combined Dream Analysis Result Model.
 * Preserves full provenance and clean boundary between Evidence (World 1) and Imagination (World 2).
 */

export interface DreamAnalysisResult {
  id: string;
  submissionId: string;
  createdAt: string;

  // 1. Original User Input
  input: DreamInput;

  // 2. Structured Extracted Features
  extractedFeatures: DreamFeatures;

  // 3. World 1: Audited Historical & Cultural Evidence
  historicalEvidence: EvidenceRecordMatch[];
  culturalPerspectives: EvidenceRecordMatch[]; // Backwards compatibility alias
  culturalPerspectivesNotFound: boolean;

  // 4. World 1: Peer-Reviewed Psychological & Neuroscientific Research
  scientificResearch: ResearchRecordMatch[];
  psychologyPerspectives: ResearchRecordMatch[]; // Backwards compatibility alias

  // 5. Evidence Gaps & Fallbacks
  evidenceGaps: {
    ungroundedMotifs: string[];
    hasUngroundedMotifs: boolean;
    fallbackMessage: string;
  };

  // 6. World 2: Exploratory Personal Interpretation
  personalReflection: PersonalReflection;
  personalInterpretation: PersonalReflection; // Backwards compatibility alias

  // 7. World 2: Poetic / Imaginative Creative Reflection
  creativeReflection: CreativeReflection;
  originalReflection: CreativeReflection; // Backwards compatibility alias

  // 8. World 2: Structured Artwork Prompt
  artworkPrompt: ArtworkPrompt;
  dreamArtwork: ArtworkPrompt; // Backwards compatibility alias

  // 9. World 2: Original Closing Thought
  closingThought: ClosingThought;

  // 10. Optional Verified Primary Quotation
  verifiedQuoteMatch?: VerifiedQuote;

  // 11. Discrete Verified Claims with Provenance Chains
  claims?: import('../evidence/ClaimRecord').ClaimRecord[];

  // 12. Redesigned Simple Reflection & Astrology
  simpleReflection?: string;
  astrologyReading?: {
    element?: string;
    planetaryTheme?: string;
    reading: string;
    disclaimer: string;
  };

  // 13. Epistemic Provenance Notes
  methodologyNotes: string;
}
