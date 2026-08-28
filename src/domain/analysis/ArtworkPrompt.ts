/**
 * Strongly-typed model for structured artwork generation prompt synthesis.
 * Built from setting, dominant imagery, emotional tone, colors, and dream atmosphere.
 * Clearly separated from evidence.
 */

export interface ArtworkPrompt {
  promptText: string;
  promptUsed: string; // Backwards compatibility alias
  title: string;
  styleTheme: string;
  settingImagery: string;
  dominantImagery: string[];
  emotionalTone: string;
  colorPalette: string[];
  movementAtmosphere: string;
  label: 'Your Dream — Imagined';
  subLabel: 'An artistic visualization inspired by your description.';
  visualKeywords: string[];
  imageUrl?: string; // Populated once rendered
}
