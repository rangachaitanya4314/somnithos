/**
 * Structured dream feature extraction model.
 * Captures semantic components, motifs, sensory details, and perceptual evidence.
 * Retains clear provenance for "Why did Somnithos notice this?"
 */

export interface DreamFeatures {
  // Dominant and secondary motif extraction
  dominantMotifs: string[];
  secondaryMotifs: string[];
  detectedSymbols: string[]; // Backwards-compatibility alias combining motifs

  // Emotional tone signals
  emotionalSignals: string[];
  detectedEmotions: string[]; // Backwards-compatibility alias

  // Setting and environmental layers
  setting: string[];
  detectedLocations: string[]; // Backwards-compatibility alias

  // Social & relational dynamics
  socialElements: string[];

  // Dream logic and unusual events
  unusualEvents: string[];

  // Kinesthetic and movement patterns
  movementPatterns: string[];

  // Sensory details and color palette
  sensoryImagery: string[];
  detectedColors: string[];
  detectedThemes: string[];

  // Recurring patterns
  possibleRecurringPatterns?: string[];

  // Meaningful narrative observations (Redesigned 3-5 highlights)
  meaningfulHighlights?: { emoji: string; text: string }[];
  meaningfulDetails?: string[];
  emotionalJourney?: string;
  simpleReflection?: string;

  // Explicit explanations for feature detection ("Why did Somnithos notice this?")
  motifsWhyNoticed: Record<string, string>;

  // Structural scores
  ambiguityLevel: 'low' | 'moderate' | 'high';
  daytimeResidueProbability: 'low' | 'moderate' | 'high';
}
