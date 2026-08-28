import type { CommunityModerationStatus, CommunityReport } from './CommunityDream';

export interface PIIDetectionResult {
  hasPII: boolean;
  detectedTypes: Array<'phone' | 'email' | 'address' | 'social_handle'>;
  sanitizedText: string;
}

export interface ModerationResult {
  status: CommunityModerationStatus;
  reasons: string[];
  piiResult?: PIIDetectionResult;
  isHarmfulThreat: boolean;
  isFrighteningDreamDescription: boolean;
}

/**
 * Replaceable moderation provider interface.
 * Designed to decouple rule-based, ML, or third-party Trust & Safety systems.
 */
export interface ContentModerationProvider {
  /**
   * Moderates a dream before public community distribution.
   */
  moderateDream(content: {
    title: string;
    narrative: string;
    motifs: string[];
  }): Promise<ModerationResult>;

  /**
   * Evaluates a report submitted against a community dream.
   */
  moderateReport(report: CommunityReport): Promise<{
    shouldFlag: boolean;
    shouldRemove: boolean;
    reason: string;
  }>;

  /**
   * Scans text for unintended personally identifiable information.
   */
  detectAndSanitizePII(text: string): PIIDetectionResult;
}
