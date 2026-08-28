/**
 * Strongly-typed model for an original closing thought.
 * 
 * Epistemic Rules:
 * - Must be an ORIGINAL line inspired by the user's dream.
 * - Must NOT be falsely attributed to philosophers, writers, religious figures, or historical people.
 * - Explicitly labeled as "An original thought inspired by your dream."
 */

export interface ClosingThought {
  thought: string;
  label: 'An original thought inspired by your dream.';
  isOriginal: true;
}
