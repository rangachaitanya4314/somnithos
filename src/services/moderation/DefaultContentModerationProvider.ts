import type { ContentModerationProvider, ModerationResult, PIIDetectionResult } from '../../domain/community/ContentModerationProvider';
import type { CommunityReport } from '../../domain/community/CommunityDream';

export class DefaultContentModerationProvider implements ContentModerationProvider {
  // Severe violation patterns (targeted violence, hate speech, illegal acts, real-world threats)
  private static readonly REAL_WORLD_THREAT_PATTERNS = [
    /\b(i will kill|i will murder|i will attack|bomb threat|terrorist attack)\b/i,
    /\b(doxx|swatting|doxxing)\b/i,
    /\b(kill yourself|commit suicide|self harm instructions)\b/i,
    /\b(child porn|csam)\b/i
  ];

  // Dream narrative context keywords (verifying that frightening imagery is in the context of a dream)
  private static readonly DREAM_CONTEXT_PATTERNS = [
    /\b(i dreamed|in my dream|i was dreaming|i woke up|nightmare|surreal|felt like a dream|dreamscape|hallucination|sleep paralysis)\b/i
  ];

  // Common frightening motifs that should NOT be punished if in dream context
  private static readonly FRIGHTENING_DREAM_MOTIFS = [
    'falling', 'chased', 'monsters', 'dark shadows', 'nightmare', 'drowning', 'trapped', 'ghosts', 'darkness'
  ];

  // PII Regex patterns
  private static readonly EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  private static readonly PHONE_PATTERN = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  private static readonly SOCIAL_HANDLE_PATTERN = /(?<=^|\s)@[a-zA-Z0-9_]{3,30}\b/g;
  private static readonly ADDRESS_PATTERN = /\b\d{1,5}\s+(?:[A-Za-z0-9.-]+\s+){1,4}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Way)\b/gi;

  /**
   * Moderates a dream before public community distribution.
   */
  public async moderateDream(content: {
    title: string;
    narrative: string;
    motifs: string[];
  }): Promise<ModerationResult> {
    const fullText = `${content.title} ${content.narrative}`;
    const reasons: string[] = [];

    // 1. Check for real-world threats or severe policy violations
    let isHarmfulThreat = false;
    for (const pattern of DefaultContentModerationProvider.REAL_WORLD_THREAT_PATTERNS) {
      if (pattern.test(fullText)) {
        isHarmfulThreat = true;
        reasons.push('Contains prohibited threat, hate speech, or severe safety violation.');
        break;
      }
    }

    if (isHarmfulThreat) {
      return {
        status: 'REMOVED',
        reasons,
        isHarmfulThreat: true,
        isFrighteningDreamDescription: false
      };
    }

    // 2. Distinguish dream description of frightening imagery from real harms
    const hasDreamContext = DefaultContentModerationProvider.DREAM_CONTEXT_PATTERNS.some(p => p.test(fullText));
    const hasFrighteningMotif = content.motifs.some(m =>
      DefaultContentModerationProvider.FRIGHTENING_DREAM_MOTIFS.some(f => m.toLowerCase().includes(f))
    );

    const isFrighteningDream = hasDreamContext || hasFrighteningMotif;

    // 3. Scan for unintended PII
    const piiResult = this.detectAndSanitizePII(fullText);
    if (piiResult.hasPII) {
      reasons.push(`Contains potential personal information (${piiResult.detectedTypes.join(', ')}). Excerpt will be sanitized.`);
    }

    // Default status: APPROVED (or FLAGGED if heavy PII detected for review)
    return {
      status: 'APPROVED',
      reasons,
      piiResult,
      isHarmfulThreat: false,
      isFrighteningDreamDescription: isFrighteningDream
    };
  }

  /**
   * Evaluates a report submitted against a community dream.
   */
  public async moderateReport(report: CommunityReport): Promise<{
    shouldFlag: boolean;
    shouldRemove: boolean;
    reason: string;
  }> {
    if (report.category === 'sexual_content' || report.category === 'graphic_violence' || report.category === 'self_harm') {
      return {
        shouldFlag: true,
        shouldRemove: false,
        reason: `Flagged for immediate review under category: ${report.category}`
      };
    }

    if (report.category === 'personal_information') {
      return {
        shouldFlag: true,
        shouldRemove: false,
        reason: 'Flagged for privacy and PII inspection'
      };
    }

    return {
      shouldFlag: false,
      shouldRemove: false,
      reason: 'Report logged for review'
    };
  }

  /**
   * Scans text for unintended personally identifiable information.
   */
  public detectAndSanitizePII(text: string): PIIDetectionResult {
    const detectedTypes: Array<'phone' | 'email' | 'address' | 'social_handle'> = [];
    let sanitizedText = text;

    if (DefaultContentModerationProvider.EMAIL_PATTERN.test(text)) {
      detectedTypes.push('email');
      sanitizedText = sanitizedText.replace(DefaultContentModerationProvider.EMAIL_PATTERN, '[email redacted]');
    }

    if (DefaultContentModerationProvider.PHONE_PATTERN.test(text)) {
      detectedTypes.push('phone');
      sanitizedText = sanitizedText.replace(DefaultContentModerationProvider.PHONE_PATTERN, '[phone redacted]');
    }

    if (DefaultContentModerationProvider.SOCIAL_HANDLE_PATTERN.test(text)) {
      detectedTypes.push('social_handle');
      sanitizedText = sanitizedText.replace(DefaultContentModerationProvider.SOCIAL_HANDLE_PATTERN, '[handle redacted]');
    }

    if (DefaultContentModerationProvider.ADDRESS_PATTERN.test(text)) {
      detectedTypes.push('address');
      sanitizedText = sanitizedText.replace(DefaultContentModerationProvider.ADDRESS_PATTERN, '[address redacted]');
    }

    return {
      hasPII: detectedTypes.length > 0,
      detectedTypes,
      sanitizedText
    };
  }
}
