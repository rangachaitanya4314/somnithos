import type {
  DreamSubmission,
  DreamAnalysisResult,
  ExtractedDreamFeatures
} from '../types/dream';
import { SourceVerificationService } from './sourceVerification';
import { DreamArtGenerator } from './dreamArtGenerator';

/**
 * Dream Analysis Engine
 * 
 * Separates:
 * 1. Evidence Layer (strict matching against verified historical & scientific source records)
 * 2. Imagination Layer (creative personal reflection, original thoughts, and generative artwork)
 */

export class DreamAnalysisEngine {
  /**
   * Extracts structured symbols, emotions, colors, entities, and patterns from dream submission.
   */
  public static extractFeatures(submission: DreamSubmission): ExtractedDreamFeatures {
    const text = (submission.description + ' ' + (submission.title || '')).toLowerCase();
    
    // Symbol keywords
    const symbolDictionary: Record<string, string[]> = {
      water: ['water', 'ocean', 'sea', 'lake', 'river', 'rain', 'swimming', 'tide', 'wave', 'drowning', 'well', 'flood', 'underwater', 'submerged'],
      flying: ['flying', 'fly', 'flight', 'floating', 'soaring', 'levitating', 'wings', 'gliding', 'air'],
      falling: ['falling', 'fall', 'plunging', 'cliff', 'drop', 'abyss', 'dropping', 'tripping'],
      snake: ['snake', 'serpent', 'viper', 'python', 'cobra', 'reptile', 'creeping'],
      teeth: ['teeth', 'tooth', 'loose teeth', 'crumbling teeth', 'dentist', 'mouth', 'jaw', 'chewing'],
      doors: ['door', 'doors', 'portal', 'gate', 'threshold', 'entrance', 'hallway', 'passage', 'corridor', 'key', 'lock', 'wooden door'],
      fire: ['fire', 'flame', 'burning', 'blaze', 'bonfire', 'wildfire', 'smoke', 'embers', 'candle'],
      forest: ['forest', 'woods', 'trees', 'jungle', 'grove', 'leaves', 'wilderness', 'pine', 'oak'],
      house: ['house', 'mansion', 'room', 'attic', 'basement', 'building', 'home', 'corridor'],
      animals: ['animal', 'dog', 'wolf', 'cat', 'lion', 'bird', 'birds', 'eagle', 'horse', 'bear', 'creature', 'fish', 'whale', 'shark'],
      chased: ['chased', 'running away', 'pursued', 'stalked', 'monster', 'hunter', 'trapped', 'escaping'],
      bridge: ['bridge', 'crossing', 'archway', 'viaduct'],
      time: ['clock', 'time', 'hourglass', 'pendulum', 'watch', 'numberless']
    };

    // Emotion keywords
    const emotionDictionary: Record<string, string[]> = {
      fear: ['afraid', 'terror', 'scared', 'dread', 'anxiety', 'panic', 'nervous', 'frightened'],
      peace: ['calm', 'serene', 'peaceful', 'tranquil', 'quiet', 'still', 'relieved'],
      wonder: ['awe', 'amazed', 'mysterious', 'curious', 'surreal', 'fascinated', 'spellbound', 'lucid'],
      confusion: ['lost', 'confused', 'disoriented', 'bewildered', 'wandering', 'puzzled'],
      joy: ['happy', 'elated', 'laughing', 'celebrating', 'lighthearted', 'euphoric'],
      grief: ['sad', 'crying', 'sorrow', 'mourning', 'heartbroken', 'lonely', 'longing']
    };

    // Color keywords
    const colorDictionary: string[] = [
      'blue', 'azure', 'red', 'crimson', 'gold', 'golden', 'black', 'dark', 
      'white', 'silver', 'green', 'emerald', 'purple', 'violet', 'grey', 'yellow', 'cyan', 'rose'
    ];

    // Location keywords
    const locationDictionary: Record<string, string[]> = {
      ocean: ['ocean', 'sea', 'coast', 'beach', 'shore', 'island', 'underwater', 'submerged', 'marine'],
      forest: ['forest', 'woods', 'wilderness', 'grove', 'clearing'],
      sky: ['sky', 'clouds', 'space', 'stars', 'moon', 'atmosphere'],
      city: ['city', 'street', 'alley', 'skyscrapers', 'highway', 'traffic', 'urban', 'station', 'subway'],
      ancient_ruins: ['ruins', 'temple', 'castle', 'cathedral', 'monument', 'tomb', 'sanctuary'],
      home: ['home', 'childhood bedroom', 'childhood home', 'kitchen', 'stairs']
    };

    const detectedSymbols = new Set<string>(submission.symbolsAndObjects || []);
    const detectedEmotions = new Set<string>(submission.emotions || []);
    const detectedColors = new Set<string>(submission.colors || []);
    const detectedLocations = new Set<string>();
    const detectedThemes = new Set<string>();

    const matchKeyword = (kw: string) => {
      const escaped = kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      return new RegExp(`(?:^|\\W)${escaped}(?:\\W|$)`, 'i').test(text);
    };

    // Scan text for symbols
    for (const [category, keywords] of Object.entries(symbolDictionary)) {
      if (keywords.some(kw => matchKeyword(kw))) {
        detectedSymbols.add(category);
        detectedThemes.add(category);
      }
    }

    // Scan text for emotions
    for (const [emotion, keywords] of Object.entries(emotionDictionary)) {
      if (keywords.some(kw => matchKeyword(kw))) {
        detectedEmotions.add(emotion);
      }
    }

    // Scan text for colors
    for (const color of colorDictionary) {
      if (matchKeyword(color)) {
        detectedColors.add(color);
      }
    }

    // Scan text for locations
    if (submission.location) {
      detectedLocations.add(submission.location);
    }
    for (const [loc, keywords] of Object.entries(locationDictionary)) {
      if (keywords.some(kw => matchKeyword(kw))) {
        detectedLocations.add(loc);
      }
    }

    // Ambiguity score based on text length and keyword variety
    const ambiguityLevel = text.length > 300 ? 'low' : text.length > 100 ? 'moderate' : 'high';
    const daytimeResidueProbability = (submission.beforeDream || '').length > 20 ? 'high' : 'moderate';

    return {
      detectedSymbols: Array.from(detectedSymbols),
      detectedEmotions: Array.from(detectedEmotions),
      detectedColors: Array.from(detectedColors),
      detectedLocations: Array.from(detectedLocations),
      detectedThemes: Array.from(detectedThemes),
      ambiguityLevel,
      daytimeResidueProbability
    };
  }

  /**
   * Generates a non-dogmatic, multi-perspective personal reading ("Your Dream, Personally").
   * Uses cautious exploratory language: "could suggest", "may reflect", "one possible reading".
   */
  private static generatePersonalInterpretation(
    submission: DreamSubmission,
    features: ExtractedDreamFeatures
  ) {
    const symbolList = features.detectedSymbols.length > 0
      ? features.detectedSymbols.join(', ')
      : 'the subtle transitions of your dream landscape';
    
    const emotionList = features.detectedEmotions.length > 0
      ? features.detectedEmotions.join(' and ')
      : 'a complex blend of feelings';

    const narrativeArcs: string[] = [
      `One possible reading is that this dream may reflect an ongoing process of navigation in waking life. The presence of ${symbolList} could suggest how your mind is synthesizing contrasting emotions of ${emotionList}.`,
      `Another interpretation might view the environment (${features.detectedLocations.join(', ') || 'the dream setting'}) as a symbolic space for working through unresolved questions or subtle desires for clarity.`,
      `In psychological content analyses, motifs like this often correlate with times of transition, where familiar boundaries are being re-examined.`
    ];

    const symbolicEchoes: string[] = [
      `The emotional atmosphere (${emotionList}) may be highlighting what matters most to you right now rather than predicting an external event.`,
      features.detectedColors.length > 0 
        ? `The vivid presence of ${features.detectedColors.join(', ')} tones often accompanies heightened perceptual focus during REM sleep synthesis.`
        : `The dream’s atmosphere creates space for personal contemplation without demanding a single rigid meaning.`
    ];

    const suggestiveQuestions: string[] = [
      `What part of your waking life felt most similar to the feeling of ${emotionList} you experienced in this dream?`,
      `If this dream were an open question rather than an answer, what would it be inviting you to notice?`,
      submission.beforeDream ? `Did the events of the day (${submission.beforeDream}) provide the initial spark for any of these images?` : `Was there any recent conversation or thought that resonated with this imagery?`
    ];

    return {
      title: submission.title || 'Explorations in Meaning & Context',
      narrativeArcs,
      symbolicEchoes,
      suggestiveQuestions
    };
  }

  /**
   * Generates an original poetic reflection explicitly labeled:
   * "Original reflection inspired by your dream"
   * (Never attributed to a real person).
   */
  private static generateOriginalReflection(
    _submission: DreamSubmission,
    features: ExtractedDreamFeatures
  ): { message: string; label: string; isAIGenerated: true } {
    const isWater = features.detectedSymbols.includes('water');
    const isFlying = features.detectedSymbols.includes('flying');
    const isFalling = features.detectedSymbols.includes('falling');
    const isDoors = features.detectedSymbols.includes('doors');
    const isSnake = features.detectedSymbols.includes('snake');
    const isFire = features.detectedSymbols.includes('fire');
    const isLost = features.detectedEmotions.includes('confusion');
    const isFear = features.detectedEmotions.includes('fear');

    let reflection = 'Perhaps the most meaningful aspect of your dream is not the uncertainty you encountered, but the curiosity that stayed with you upon waking.';

    if (isWater && isFlying) {
      reflection = 'Perhaps the vastness below you was not an obstacle, but a reminder that the horizon only expands when you have the courage to lift above it.';
    } else if (isFlying) {
      reflection = 'Perhaps the dream was not about conquering gravity, but about discovering that lightness of mind is something you carry within yourself.';
    } else if (isFalling) {
      reflection = 'Perhaps the sensation of falling was not a warning of failure, but your mind letting go of burdens you no longer need to hold so tightly.';
    } else if (isDoors) {
      reflection = 'Perhaps the threshold before you did not exist to keep you out, but to give you a moment of stillness before stepping into the new.';
    } else if (isSnake) {
      reflection = 'Perhaps confronting the serpent was not about avoiding danger, but recognizing your own resilience when face-to-face with the unknown.';
    } else if (isFire) {
      reflection = 'Perhaps the flame in your dream was illuminating what was previously unseen, turning raw experience into lasting clarity.';
    } else if (isLost) {
      reflection = 'Perhaps the important part of your dream isn\'t that you were lost. Perhaps it is that you kept searching.';
    } else if (isFear) {
      reflection = 'When the dream confronted you with shadows, it also revealed how steadily your awareness could navigate through them.';
    }

    return {
      message: reflection,
      label: 'Original reflection inspired by your dream',
      isAIGenerated: true
    };
  }

  /**
   * Synthesizes an evocative artistic prompt for dream artwork generation.
   */
  private static buildArtPrompt(
    submission: DreamSubmission,
    features: ExtractedDreamFeatures
  ) {
    const promptUsed = DreamArtGenerator.synthesizeArtPrompt(submission, features);
    const visualKeywords = DreamArtGenerator.extractVisualElements(submission, features);

    const title = submission.title 
      ? `Vision of ${submission.title}`
      : `Surrealist Nocturne in ${features.detectedColors[0] || 'Twilight'}`;

    return {
      promptUsed,
      title,
      styleTheme: 'Surrealist Somnithos',
      label: 'Your Dream — Imagined',
      subLabel: 'An artistic visualization inspired by your description.',
      visualKeywords
    };
  }

  /**
   * Main entry point to analyze a dream submission.
   */
  public static analyze(submission: DreamSubmission): DreamAnalysisResult {
    const extractedFeatures = this.extractFeatures(submission);

    // 1. Evidence Layer: Match verified cultural records
    const searchKeywords = [
      ...extractedFeatures.detectedSymbols,
      ...extractedFeatures.detectedThemes,
      ...extractedFeatures.detectedLocations
    ];
    const culturalPerspectives = SourceVerificationService.matchCulturalSources(searchKeywords);
    const culturalPerspectivesNotFound = culturalPerspectives.length === 0;

    // 2. Evidence Layer: Match peer-reviewed psychology and neuroscience findings
    const psychThemes = [
      ...extractedFeatures.detectedEmotions,
      ...extractedFeatures.detectedSymbols,
      ...extractedFeatures.detectedThemes
    ];
    const psychologyPerspectives = SourceVerificationService.matchPsychologySources(psychThemes);

    // 3. Evidence Layer: Match verified quotes (strictly authentic)
    const quoteThemes = [
      ...extractedFeatures.detectedEmotions,
      ...extractedFeatures.detectedSymbols,
      'mind',
      'consciousness'
    ];
    const verifiedQuoteMatch = SourceVerificationService.matchVerifiedQuote(quoteThemes);

    // 4. Imagination Layer: Personal interpretation & creative original reflection
    const personalInterpretation = this.generatePersonalInterpretation(submission, extractedFeatures);
    const originalReflection = this.generateOriginalReflection(submission, extractedFeatures);
    const artworkData = this.buildArtPrompt(submission, extractedFeatures);

    return {
      id: 'analysis-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      submissionId: submission.id,
      createdAt: new Date().toISOString(),
      extractedFeatures,
      culturalPerspectives,
      culturalPerspectivesNotFound,
      psychologyPerspectives,
      personalInterpretation,
      originalReflection,
      verifiedQuoteMatch,
      dreamArtwork: {
        ...artworkData,
        imageUrl: '' // Populated by ImageGenerationService / DreamArtGenerator
      }
    };
  }
}
