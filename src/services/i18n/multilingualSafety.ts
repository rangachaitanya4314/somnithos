/**
 * Multilingual Safety Filter for Somnithos
 * Enforces zero-frightening predictions, no claims of death/illness/disaster,
 * and gentle phrasing across English, Telugu, Tamil, and Hindi.
 */

export interface MultilingualSafetyRule {
  language: 'en' | 'te' | 'ta' | 'hi' | 'all';
  forbiddenTerms: string[];
  replacement: string;
}

export const MULTILINGUAL_SAFETY_PATTERNS: MultilingualSafetyRule[] = [
  // English
  {
    language: 'en',
    forbiddenTerms: [
      'you will die',
      'someone will die',
      'predicts death',
      'fatal illness',
      'impending doom',
      'catastrophe will happen',
      'destined to suffer',
      'death is coming',
      'sign of death',
      'warning of death',
      'imminent disaster'
    ],
    replacement: 'a moment of emotional intensity'
  },
  // Telugu
  {
    language: 'te',
    forbiddenTerms: [
      'చనిపోతారు',
      'మరణం సంభవిస్తుంది',
      'చనిపోతావు',
      'మరణం తప్పదు',
      'మరణానికి సంకేతం',
      'తీవ్రమైన అనారోగ్యం వస్తుంది',
      'విపత్తు జరగబోతోంది',
      'నాశనం కాబోతోంది',
      'దురదృష్టం ఖాయం'
    ],
    replacement: 'తీవ్రమైన మానసిక భావనల అనుభవం'
  },
  // Tamil
  {
    language: 'ta',
    forbiddenTerms: [
      'இறந்துவிடுவீர்கள்',
      'மரணம் நிகழும்',
      'இறப்பு நிச்சயம்',
      'மரணத்தின் அறிகுறி',
      'கடுமையான நோய் வரும்',
      'பேரழிவு ஏற்படப்போகிறது',
      'அழிவு நிச்சயம்',
      'துரதிர்ஷ்டம் ஏற்படும்'
    ],
    replacement: 'ஆழ்ந்த மன உணர்வுகளின் வெளிப்பாடு'
  },
  // Hindi
  {
    language: 'hi',
    forbiddenTerms: [
      'आपकी मृत्यु होगी',
      'कोई मर जाएगा',
      'मौत की भविष्यवाणी',
      'मौत का संकेत',
      'गंभीर बीमारी होगी',
      'विनाश होने वाला है',
      'बड़ी आपदा आएगी',
      'अनहोनी तय है'
    ],
    replacement: 'गहरी आंतरिक भावनाओं का अनुभव'
  }
];

export class MultilingualSafetyFilter {
  /**
   * Sanitizes text across English, Telugu, Tamil, and Hindi to prevent harmful/frightening claims.
   */
  public static sanitize(text: string): string {
    if (!text) return '';
    let sanitized = text;

    for (const rule of MULTILINGUAL_SAFETY_PATTERNS) {
      for (const term of rule.forbiddenTerms) {
        if (sanitized.toLowerCase().includes(term.toLowerCase())) {
          const regex = new RegExp(term, 'gi');
          sanitized = sanitized.replace(regex, rule.replacement);
        }
      }
    }

    return sanitized;
  }

  /**
   * Checks if any forbidden frightening prediction exists in the text.
   */
  public static containsFrighteningPrediction(text: string): boolean {
    if (!text) return false;
    const lower = text.toLowerCase();
    for (const rule of MULTILINGUAL_SAFETY_PATTERNS) {
      for (const term of rule.forbiddenTerms) {
        if (lower.includes(term.toLowerCase())) {
          return true;
        }
      }
    }
    return false;
  }
}
