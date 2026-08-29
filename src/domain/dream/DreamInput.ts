/**
 * Strongly-typed input model for user dream submissions.
 * Supports rich multi-modal contextual fields with optionality.
 */

export interface DreamInput {
  id?: string;
  title?: string;
  narrative?: string; // Core dream description narrative
  description?: string; // Backwards-compatibility alias for narrative
  emotions?: string[];
  mood?: string;
  setting?: string;
  location?: string; // Alias for setting
  people?: string;
  importantPeople?: string; // Alias for people
  creatures?: string[];
  animals?: string[]; // Alias for creatures
  objects?: string[];
  symbolsAndObjects?: string[]; // Backwards-compatibility alias
  symbols?: string[];
  actions?: string[];
  movement?: string[];
  colors?: string[];
  sensoryDetails?: string[];
  recurringElements?: string;
  beforeDream?: string; // Daytime residue / waking context
  afterWaking?: string;
  userInterpretation?: string;
  culturalBackground?: string;
  privacy?: 'private' | 'anonymous_public';
  createdAt?: string;
  language?: 'en' | 'te' | 'ta' | 'hi';
  targetLanguage?: 'en' | 'te' | 'ta' | 'hi';
}

/**
 * Normalizes user dream input to ensure consistent field resolution.
 */
export function normalizeDreamInput(input: Partial<DreamInput>): DreamInput & { narrative: string; description: string } {
  const narrative = input.narrative || input.description || '';
  const language = input.language || input.targetLanguage || 'en';
  return {
    id: input.id || 'dream-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
    title: input.title || '',
    narrative,
    description: narrative,
    emotions: input.emotions || [],
    mood: input.mood || '',
    setting: input.setting || input.location || '',
    location: input.location || input.setting || '',
    people: input.people || input.importantPeople || '',
    importantPeople: input.importantPeople || input.people || '',
    creatures: input.creatures || input.animals || [],
    animals: input.animals || input.creatures || [],
    objects: input.objects || [],
    symbolsAndObjects: input.symbolsAndObjects || input.symbols || [],
    symbols: input.symbols || input.symbolsAndObjects || [],
    actions: input.actions || [],
    movement: input.movement || [],
    colors: input.colors || [],
    sensoryDetails: input.sensoryDetails || [],
    recurringElements: input.recurringElements || '',
    beforeDream: input.beforeDream || '',
    afterWaking: input.afterWaking || '',
    userInterpretation: input.userInterpretation || '',
    culturalBackground: input.culturalBackground || '',
    privacy: input.privacy || 'private',
    createdAt: input.createdAt || new Date().toISOString(),
    language,
    targetLanguage: language
  };
}
