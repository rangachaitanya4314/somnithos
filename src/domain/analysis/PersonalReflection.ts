/**
 * Strongly-typed model for personal exploratory interpretation.
 * 
 * Epistemic Rules:
 * - Never presented as established scientific truth or prophecy.
 * - Always framed in cautious, exploratory language: "One possible reading...", "This could reflect...".
 * - Contains reflective questions inviting user introspection.
 */

export interface PersonalReflection {
  title: string;
  possibleInterpretations: string[];
  narrativeArcs: string[]; // Backwards compatibility alias
  primarySynthesis?: string;
  emotionalReading: string;
  emotionalResonance?: string;
  symbolicEchoes: string[];
  suggestiveQuestions: string[];
  uncertaintyStatement: string;
  poeticReflection?: string;
  message?: string;
}
