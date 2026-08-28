/**
 * Strongly-typed model for creative and poetic reflection.
 * 
 * Epistemic Rules:
 * - Represents original, imaginative literature inspired by the dream imagery.
 * - Explicitly labeled as "Original reflection inspired by your dream."
 * - Never falsely attributed to historical figures, philosophers, or ancient texts.
 */

export interface CreativeReflection {
  poeticReflection: string;
  message: string; // Backwards compatibility alias
  metaphor: string;
  symbolicNarrative?: string;
  atmosphericLanguage?: string;
  label: 'Original reflection inspired by your dream';
  isAIGenerated: true;
  isOriginal: true;
}
