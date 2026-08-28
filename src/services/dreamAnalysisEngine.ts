import type {
  DreamSubmission,
  DreamAnalysisResult,
  ExtractedDreamFeatures
} from '../types/dream';
import { MockDreamAnalysisProvider } from './analysis/MockDreamAnalysisProvider';

/**
 * Dream Analysis Engine
 * 
 * Main entry point delegating to the modular DreamAnalysisProvider pipeline.
 * Separates:
 * 1. Evidence Layer (strict matching against verified historical & scientific source records)
 * 2. Imagination Layer (creative personal reflection, original thoughts, and generative artwork)
 */

export class DreamAnalysisEngine {
  private static defaultProvider = new MockDreamAnalysisProvider();

  /**
   * Extracts structured symbols, emotions, colors, entities, and patterns from dream submission.
   */
  public static extractFeatures(submission: DreamSubmission): ExtractedDreamFeatures {
    return this.defaultProvider.extractDreamFeatures(submission);
  }

  /**
   * Main entry point to analyze a dream submission.
   */
  public static analyze(submission: DreamSubmission): DreamAnalysisResult {
    return this.defaultProvider.analyzeDream(submission) as DreamAnalysisResult;
  }
}
