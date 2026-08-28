import { CULTURAL_KNOWLEDGE_CLAIMS } from '../data/culturalSources';
import { PSYCHOLOGY_KNOWLEDGE_CLAIMS } from '../data/psychologySources';
import { VERIFIED_QUOTATIONS } from '../data/verifiedQuotes';
import type {
  FactualKnowledgeClaim,
  PsychologyTheoryClaim,
  VerifiedQuote,
  CulturalPerspectiveMatch,
  PsychologyPerspectiveMatch
} from '../types/dream';

/**
 * Strict Source Verification and Evidence Resolution Service
 * 
 * Epistemic Rules:
 * - Only return claims that explicitly match verified source records.
 * - Never invent or assume undocumented historical beliefs.
 * - If no exact match is verified in the knowledge base, return an empty list to trigger "No reliable source found."
 */

export class SourceVerificationService {
  /**
   * Finds verified cultural claims strictly matching the extracted dream symbols/keywords.
   * If none match, returns an empty array to trigger "No reliable source found."
   */
  public static matchCulturalSources(keywords: string[]): CulturalPerspectiveMatch[] {
    const matches: CulturalPerspectiveMatch[] = [];
    const normalizedKeywords = new Set(keywords.map(k => k.toLowerCase().trim()));

    for (const claim of CULTURAL_KNOWLEDGE_CLAIMS) {
      const subject = claim.primarySubject.toLowerCase().trim();
      const subjectMatch = normalizedKeywords.has(subject);

      const secondaryMatch = claim.secondaryKeywords?.some(sec => {
        const secNorm = sec.toLowerCase().trim();
        return normalizedKeywords.has(secNorm);
      });

      if (subjectMatch || secondaryMatch) {
        matches.push({
          claim,
          evidenceRecord: claim,
          relevanceReason: `Matched verified record for "${claim.primarySubject}" in ${claim.exactTradition} (${claim.historicalPeriod}).`,
          traditionLabel: `${claim.exactTradition} • ${claim.geographicContext}`
        });
      }
    }

    return matches;
  }

  /**
   * Finds peer-reviewed psychological and neuroscientific research claims.
   */
  public static matchPsychologySources(themesAndEmotions: string[]): PsychologyPerspectiveMatch[] {
    const matches: PsychologyPerspectiveMatch[] = [];
    const normalized = new Set(themesAndEmotions.map(t => t.toLowerCase().trim()));

    for (const psyClaim of PSYCHOLOGY_KNOWLEDGE_CLAIMS) {
      const isRelevant = psyClaim.relevanceToDreamThemes.some(theme =>
        normalized.has(theme.toLowerCase().trim())
      );

      if (isRelevant) {
        matches.push({
          psychologyClaim: psyClaim,
          researchRecord: psyClaim,
          relevanceReason: `Relevant to detected dream themes (${psyClaim.relevanceToDreamThemes.slice(0, 3).join(', ')}) through ${psyClaim.conceptName}.`
        });
      }
    }

    // Default to Continuity hypothesis if no specialized model matches
    if (matches.length === 0 && PSYCHOLOGY_KNOWLEDGE_CLAIMS.length > 0) {
      const continuityClaim = PSYCHOLOGY_KNOWLEDGE_CLAIMS.find(p => p.id === 'psy-continuity-domhoff');
      if (continuityClaim) {
        matches.push({
          psychologyClaim: continuityClaim,
          researchRecord: continuityClaim,
          relevanceReason: 'Baseline cognitive framework analyzing continuity between waking thoughts and dream imagery.'
        });
      }
    }

    return matches;
  }

  /**
   * Matches authentic verified quotations with strict provenance.
   * If no verified quote matches, returns undefined (never fabricates).
   */
  public static matchVerifiedQuote(themes: string[]): VerifiedQuote | undefined {
    const normalized = new Set(themes.map(t => t.toLowerCase().trim()));

    for (const quote of VERIFIED_QUOTATIONS) {
      const matched = quote.theme.some(qTheme =>
        normalized.has(qTheme.toLowerCase().trim())
      );
      if (matched) {
        return quote;
      }
    }

    return undefined;
  }

  /**
   * Returns a specific verified claim by ID for deep inspection in the Source Viewer.
   */
  public static getClaimById(id: string): FactualKnowledgeClaim | undefined {
    return CULTURAL_KNOWLEDGE_CLAIMS.find(c => c.id === id);
  }

  /**
   * Returns a specific psychology claim by ID.
   */
  public static getPsychologyClaimById(id: string): PsychologyTheoryClaim | undefined {
    return PSYCHOLOGY_KNOWLEDGE_CLAIMS.find(p => p.id === id);
  }
}
