import type { DreamInput } from '../dream/DreamInput';
import type { DreamFeatures } from '../dream/DreamFeatures';
import type { EvidenceRecordMatch } from '../evidence/EvidenceRecord';
import type { ResearchRecordMatch } from '../research/ResearchRecord';
import type { PersonalReflection } from './PersonalReflection';
import type { CreativeReflection } from './CreativeReflection';
import type { ArtworkPrompt } from './ArtworkPrompt';
import type { ClosingThought } from './ClosingThought';
import type { DreamAnalysisResult } from './DreamAnalysisResult';

/**
 * Provider interface for dream analysis in Somnithos.
 * Enables interchangeable providers (e.g. MockDreamAnalysisProvider, GeminiDreamAnalysisProvider).
 */

export interface DreamAnalysisProvider {
  /**
   * Extracts multi-modal features, dominant and secondary motifs, and perceptual details from a dream input.
   */
  extractDreamFeatures(input: DreamInput): DreamFeatures;

  /**
   * Retrieves verified historical and cultural evidence records matching the extracted features.
   */
  retrieveEvidence(features: DreamFeatures): EvidenceRecordMatch[];

  /**
   * Retrieves peer-reviewed psychology and neuroscience records matching the extracted features.
   */
  retrieveResearch(features: DreamFeatures): ResearchRecordMatch[];

  /**
   * Synthesizes cautious personal exploratory interpretation with reflective questions.
   */
  generatePersonalReflection(input: DreamInput, features: DreamFeatures): PersonalReflection;

  /**
   * Generates poetic and creative reflection inspired by the dream atmosphere.
   */
  generateCreativeReflection(input: DreamInput, features: DreamFeatures): CreativeReflection;

  /**
   * Builds structured artwork generation prompt with visual elements and emotional tone.
   */
  generateArtworkPrompt(input: DreamInput, features: DreamFeatures): ArtworkPrompt;

  /**
   * Produces an original closing thought (never falsely attributed to historical figures).
   */
  generateClosingThought(input: DreamInput, features: DreamFeatures): ClosingThought;

  /**
   * Executes the end-to-end analysis pipeline.
   */
  analyzeDream(input: DreamInput): Promise<DreamAnalysisResult> | DreamAnalysisResult;
}
