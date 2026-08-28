import type { DreamInput } from '../../domain/dream/DreamInput';
import { normalizeDreamInput } from '../../domain/dream/DreamInput';
import type { DreamFeatures } from '../../domain/dream/DreamFeatures';
import type { EvidenceRecordMatch } from '../../domain/evidence/EvidenceRecord';
import type { ResearchRecordMatch } from '../../domain/research/ResearchRecord';
import type { PersonalReflection } from '../../domain/analysis/PersonalReflection';
import type { CreativeReflection } from '../../domain/analysis/CreativeReflection';
import type { ArtworkPrompt } from '../../domain/analysis/ArtworkPrompt';
import type { ClosingThought } from '../../domain/analysis/ClosingThought';
import type { DreamAnalysisResult } from '../../domain/analysis/DreamAnalysisResult';
import type { DreamAnalysisProvider } from '../../domain/analysis/DreamAnalysisProvider';
import type { EvidenceRepository } from '../../domain/evidence/EvidenceRepository';
import type { ResearchRepository } from '../../domain/research/ResearchRepository';
import { MockEvidenceRepository } from './MockEvidenceRepository';
import { MockResearchRepository } from './MockResearchRepository';
import { DreamArtGenerator } from '../dreamArtGenerator';
import { SourceVerificationService } from '../sourceVerification';

/**
 * Deterministic Mock Dream Analysis Provider.
 * Implements DreamAnalysisProvider and serves as the architectural blueprint
 * for future providers (e.g. GeminiDreamAnalysisProvider).
 */

import { EvidenceRetrieverService } from '../evidence/EvidenceRetrieverService';

export class MockDreamAnalysisProvider implements DreamAnalysisProvider {
  private evidenceRepo: EvidenceRepository;
  private researchRepo: ResearchRepository;
  private evidenceRetriever: EvidenceRetrieverService;

  constructor(
    evidenceRepo: EvidenceRepository = new MockEvidenceRepository(),
    researchRepo: ResearchRepository = new MockResearchRepository(),
    evidenceRetriever: EvidenceRetrieverService = new EvidenceRetrieverService()
  ) {
    this.evidenceRepo = evidenceRepo;
    this.researchRepo = researchRepo;
    this.evidenceRetriever = evidenceRetriever;
  }

  /**
   * 1. DREAM EXTRACTION LAYER
   */
  public extractDreamFeatures(rawInput: DreamInput): DreamFeatures {
    const input = normalizeDreamInput(rawInput);
    const text = (input.narrative + ' ' + (input.title || '')).toLowerCase();

    // Dictionaries for semantic extraction
    const motifDictionary: Record<string, string[]> = {
      water: ['water', 'ocean', 'sea', 'lake', 'river', 'rain', 'swimming', 'tide', 'wave', 'drowning', 'well', 'flood', 'flooded', 'underwater', 'submerged'],
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
      time: ['clock', 'time', 'hourglass', 'pendulum', 'watch', 'numberless'],
      searching: ['searching', 'looking for', 'lost', "couldn't find", 'find', 'seeking', 'wandering'],
      family: ['family', 'mother', 'father', 'sister', 'brother', 'child', 'parents', 'relatives']
    };

    const emotionDictionary: Record<string, string[]> = {
      fear: ['afraid', 'terror', 'scared', 'dread', 'anxiety', 'panic', 'nervous', 'frightened', 'fear'],
      peace: ['calm', 'serene', 'peaceful', 'tranquil', 'quiet', 'still', 'relieved', 'peace', 'relief'],
      wonder: ['awe', 'amazed', 'mysterious', 'curious', 'surreal', 'fascinated', 'spellbound', 'lucid', 'wonder'],
      confusion: ['lost', 'confused', 'disoriented', 'bewildered', 'wandering', 'puzzled', 'uncertainty'],
      joy: ['happy', 'elated', 'laughing', 'celebrating', 'lighthearted', 'euphoric', 'joy'],
      grief: ['sad', 'crying', 'sorrow', 'mourning', 'heartbroken', 'lonely', 'longing']
    };

    const locationDictionary: Record<string, string[]> = {
      ocean: ['ocean', 'sea', 'coast', 'beach', 'shore', 'island', 'underwater', 'submerged', 'marine'],
      forest: ['forest', 'woods', 'wilderness', 'grove', 'clearing'],
      sky: ['sky', 'clouds', 'space', 'stars', 'moon', 'atmosphere'],
      city: ['city', 'street', 'alley', 'skyscrapers', 'highway', 'traffic', 'urban', 'station', 'subway', 'building'],
      ancient_ruins: ['ruins', 'temple', 'castle', 'cathedral', 'monument', 'tomb', 'sanctuary'],
      home: ['home', 'bedroom', 'kitchen', 'stairs', 'hallway']
    };

    const colorDictionary = [
      'blue', 'azure', 'red', 'crimson', 'gold', 'golden', 'black', 'dark',
      'white', 'silver', 'green', 'emerald', 'purple', 'violet', 'grey', 'yellow', 'cyan', 'rose', 'neon'
    ];

    const socialKeywords = ['family', 'mother', 'father', 'friend', 'friends', 'stranger', 'crowd', 'passengers', 'people', 'child'];
    const movementKeywords = ['flying', 'falling', 'running', 'walking', 'swimming', 'climbing', 'soaring', 'plunging', 'floating', 'riding', 'gliding'];
    const unusualEventKeywords = ['flying without wings', 'underwater train', 'floating clock', 'talking beast', 'numberless clock', 'shapeshifting', 'submarine in space'];

    const detectedSymbols = new Set<string>(input.symbolsAndObjects || []);
    const detectedEmotions = new Set<string>(input.emotions || []);
    const detectedColors = new Set<string>(input.colors || []);
    const detectedLocations = new Set<string>();
    const detectedThemes = new Set<string>();
    const socialElements = new Set<string>();
    const movementPatterns = new Set<string>(input.movement || []);
    const sensoryImagery = new Set<string>(input.sensoryDetails || []);
    const unusualEvents = new Set<string>();
    const motifsWhyNoticed: Record<string, string> = {};

    const matchKeyword = (kw: string) => {
      const escaped = kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      return new RegExp(`(?:^|\\W)${escaped}(?:\\W|$)`, 'i').test(text);
    };

    // Scan for motifs
    for (const [category, keywords] of Object.entries(motifDictionary)) {
      const matched = keywords.filter(kw => matchKeyword(kw));
      if (matched.length > 0) {
        detectedSymbols.add(category);
        detectedThemes.add(category);
        motifsWhyNoticed[category] = `Observed in narrative via mention of "${matched.join('", "')}".`;
      }
    }

    // Add user provided symbols
    (input.symbolsAndObjects || []).forEach(sym => {
      detectedSymbols.add(sym);
      if (!motifsWhyNoticed[sym]) {
        motifsWhyNoticed[sym] = 'Explicitly provided in user dream motifs selection.';
      }
    });

    // Scan for emotions
    for (const [emotion, keywords] of Object.entries(emotionDictionary)) {
      if (keywords.some(kw => matchKeyword(kw))) {
        detectedEmotions.add(emotion);
      }
    }

    // Scan for colors
    for (const color of colorDictionary) {
      if (matchKeyword(color)) {
        detectedColors.add(color);
      }
    }

    // Scan for locations
    if (input.setting) {
      detectedLocations.add(input.setting);
    }
    for (const [loc, keywords] of Object.entries(locationDictionary)) {
      if (keywords.some(kw => matchKeyword(kw))) {
        detectedLocations.add(loc);
      }
    }

    // Scan for social elements
    if (input.people) {
      socialElements.add(input.people);
    }
    for (const soc of socialKeywords) {
      if (matchKeyword(soc)) {
        socialElements.add(soc);
      }
    }

    // Scan for movement
    for (const mov of movementKeywords) {
      if (matchKeyword(mov)) {
        movementPatterns.add(mov);
      }
    }

    // Scan for unusual events
    for (const un of unusualEventKeywords) {
      if (matchKeyword(un)) {
        unusualEvents.add(un);
      }
    }
    if (detectedSymbols.has('flying') && !text.includes('airplane')) {
      unusualEvents.add('Unassisted flight / levitation');
    }

    // Separate dominant vs secondary motifs
    const symbolsArray = Array.from(detectedSymbols);
    const dominantMotifs = symbolsArray.slice(0, 3);
    const secondaryMotifs = symbolsArray.slice(3);

    const ambiguityLevel = text.length > 300 ? 'low' : text.length > 100 ? 'moderate' : 'high';
    const daytimeResidueProbability = (input.beforeDream || '').length > 20 ? 'high' : 'moderate';

    return {
      dominantMotifs,
      secondaryMotifs,
      detectedSymbols: symbolsArray,
      emotionalSignals: Array.from(detectedEmotions),
      detectedEmotions: Array.from(detectedEmotions),
      setting: Array.from(detectedLocations),
      detectedLocations: Array.from(detectedLocations),
      socialElements: Array.from(socialElements),
      unusualEvents: Array.from(unusualEvents),
      movementPatterns: Array.from(movementPatterns),
      sensoryImagery: Array.from(sensoryImagery),
      detectedColors: Array.from(detectedColors),
      detectedThemes: Array.from(detectedThemes),
      possibleRecurringPatterns: input.recurringElements ? [input.recurringElements] : undefined,
      motifsWhyNoticed,
      ambiguityLevel,
      daytimeResidueProbability
    };
  }

  /**
   * 2. EVIDENCE RETRIEVAL LAYER
   */
  public retrieveEvidence(features: DreamFeatures): EvidenceRecordMatch[] {
    const searchKeywords = [
      ...features.dominantMotifs,
      ...features.secondaryMotifs
    ];
    return this.evidenceRepo.matchEvidence(searchKeywords);
  }

  /**
   * 3. RESEARCH RETRIEVAL LAYER
   */
  public retrieveResearch(features: DreamFeatures): ResearchRecordMatch[] {
    const psychThemes = [
      ...features.emotionalSignals,
      ...features.dominantMotifs,
      ...features.secondaryMotifs
    ];
    return this.researchRepo.matchResearch(psychThemes);
  }

  /**
   * 4. PERSONAL REFLECTION LAYER (World 2 - Cautious Introspection)
   */
  public generatePersonalReflection(rawInput: DreamInput, features: DreamFeatures): PersonalReflection {
    const input = normalizeDreamInput(rawInput);
    const symbolList = features.detectedSymbols.length > 0
      ? features.detectedSymbols.join(', ')
      : 'the imagery of your dream';

    const emotionList = features.emotionalSignals.length > 0
      ? features.emotionalSignals.join(' and ')
      : 'a subtle blend of emotions';

    const narrativeArcs = [
      `One possible reading is that this dream may reflect an ongoing process of navigation in waking life. The presence of ${symbolList} could suggest how your mind is synthesizing contrasting emotions of ${emotionList}.`,
      `Another interpretation might view the environment (${features.setting.join(', ') || 'the setting'}) as a symbolic space for working through unresolved questions or subtle desires for clarity.`,
      `In psychological content analyses, motifs like this often correlate with times of transition, where familiar boundaries are being re-examined.`
    ];

    const emotionalReading = features.emotionalSignals.length > 0
      ? `The emotional trajectory (${features.emotionalSignals.join(' → ')}) indicates an active process of recalibrating internal feelings.`
      : 'The dream carries an open, contemplative emotional tone.';

    const symbolicEchoes = [
      `The emotional atmosphere (${emotionList}) may be highlighting what matters most to you right now rather than predicting an external event.`,
      features.detectedColors.length > 0
        ? `The vivid presence of ${features.detectedColors.join(', ')} tones often accompanies heightened perceptual focus during REM sleep synthesis.`
        : `The dream’s atmosphere creates space for personal contemplation without demanding a single rigid meaning.`
    ];

    const suggestiveQuestions = [
      `What part of your waking life felt most similar to the feeling of ${emotionList} you experienced in this dream?`,
      `If this dream were an open question rather than an answer, what would it be inviting you to notice?`,
      input.beforeDream
        ? `Did the events of the day (${input.beforeDream}) provide the initial spark for any of these images?`
        : `Was there any recent conversation or thought that resonated with this imagery?`
    ];

    const uncertaintyStatement = 'All interpretations are exploratory suggestions for personal reflection; Somnithos rejects dogmatic assertions of universal dream meanings.';

    return {
      title: input.title || 'Explorations in Meaning & Context',
      possibleInterpretations: narrativeArcs,
      narrativeArcs,
      emotionalReading,
      symbolicEchoes,
      suggestiveQuestions,
      uncertaintyStatement
    };
  }

  /**
   * 5. CREATIVE REFLECTION LAYER (World 2 - Original Literature)
   */
  public generateCreativeReflection(_input: DreamInput, features: DreamFeatures): CreativeReflection {
    const isWater = features.detectedSymbols.includes('water');
    const isFlying = features.detectedSymbols.includes('flying');
    const isFalling = features.detectedSymbols.includes('falling');
    const isDoors = features.detectedSymbols.includes('doors');
    const isSnake = features.detectedSymbols.includes('snake');
    const isFire = features.detectedSymbols.includes('fire');
    const isLost = features.emotionalSignals.includes('confusion');
    const isFear = features.emotionalSignals.includes('fear');

    let reflection = 'Perhaps the most meaningful aspect of your dream is not the uncertainty you encountered, but the curiosity that stayed with you upon waking.';
    let metaphor = 'A quiet lantern carried through an untrodden corridor of night.';

    if (isWater && isFlying) {
      reflection = 'Perhaps the vastness below you was not an obstacle, but a reminder that the horizon only expands when you have the courage to lift above it.';
      metaphor = 'The ocean as a mirror for the limitless expanse of awareness.';
    } else if (isFlying) {
      reflection = 'Perhaps the dream was not about conquering gravity, but about discovering that lightness of mind is something you carry within yourself.';
      metaphor = 'Weightless flight through the unmapped geographies of sleep.';
    } else if (isFalling) {
      reflection = 'Perhaps the sensation of falling was not a warning of failure, but your mind letting go of burdens you no longer need to hold so tightly.';
      metaphor = 'A surrender to gravity that opens into unexpected trust.';
    } else if (isDoors) {
      reflection = 'Perhaps the threshold before you did not exist to keep you out, but to give you a moment of stillness before stepping into the new.';
      metaphor = 'The carved doorway between what has been and what is yet to be.';
    } else if (isSnake) {
      reflection = 'Perhaps confronting the serpent was not about avoiding danger, but recognizing your own resilience when face-to-face with the unknown.';
      metaphor = 'The ancient coiled guardian of dormant strength.';
    } else if (isFire) {
      reflection = 'Perhaps the flame in your dream was illuminating what was previously unseen, turning raw experience into lasting clarity.';
      metaphor = 'A beacon rekindled in the twilight of thought.';
    } else if (isLost) {
      reflection = "Perhaps the important part of your dream isn't that you were lost. Perhaps it is that you kept searching.";
      metaphor = 'A traveler navigating by stars that only become visible in the dark.';
    } else if (isFear) {
      reflection = 'When the dream confronted you with shadows, it also revealed how steadily your awareness could navigate through them.';
      metaphor = 'The courage of a gaze that does not look away.';
    }

    return {
      poeticReflection: reflection,
      message: reflection,
      metaphor,
      label: 'Original reflection inspired by your dream',
      isAIGenerated: true,
      isOriginal: true
    };
  }

  /**
   * 6. ARTWORK PROMPT LAYER (World 2 - Visual Synthesis)
   */
  public generateArtworkPrompt(rawInput: DreamInput, features: DreamFeatures): ArtworkPrompt {
    const input = normalizeDreamInput(rawInput);
    const promptUsed = DreamArtGenerator.synthesizeArtPrompt(input as any, features);
    const visualKeywords = DreamArtGenerator.extractVisualElements(input as any, features);

    const title = input.title
      ? `Vision of ${input.title}`
      : `Surrealist Nocturne in ${features.detectedColors[0] || 'Twilight'}`;

    return {
      promptText: promptUsed,
      promptUsed,
      title,
      styleTheme: 'Surrealist Somnithos',
      settingImagery: features.setting.join(', ') || 'Dream landscape',
      dominantImagery: features.dominantMotifs,
      emotionalTone: features.emotionalSignals.join(', ') || 'Evocative',
      colorPalette: features.detectedColors,
      movementAtmosphere: features.movementPatterns.join(', ') || 'Atmospheric stillness',
      label: 'Your Dream — Imagined',
      subLabel: 'An artistic visualization inspired by your description.',
      visualKeywords
    };
  }

  /**
   * 7. CLOSING THOUGHT LAYER (World 2 - Original Thought)
   */
  public generateClosingThought(_input: DreamInput, features: DreamFeatures): ClosingThought {
    const isFlying = features.detectedSymbols.includes('flying');
    const isWater = features.detectedSymbols.includes('water');

    let thought = 'The dream does not demand an explanation; it invites a conversation.';

    if (isFlying && isWater) {
      thought = 'To soar above deep waters is to realize how vast the mind is when fear gives way to perspective.';
    } else if (isFlying) {
      thought = 'Sometimes the mind lifts itself above waking constraints simply to remember that boundaries are often self-imposed.';
    } else if (isWater) {
      thought = 'Water in dreams always reminds us that emotions are not fixed landscapes, but currents waiting to flow.';
    }

    return {
      thought,
      label: 'An original thought inspired by your dream.',
      isOriginal: true
    };
  }

  /**
   * 8. FULL END-TO-END PIPELINE EXECUTION
   */
  public analyzeDream(rawInput: DreamInput): DreamAnalysisResult {
    const input = normalizeDreamInput(rawInput);

    // Step 1: Feature Extraction
    const extractedFeatures = this.extractDreamFeatures(input);

    // Step 2: Evidence Retrieval
    const historicalEvidence = this.retrieveEvidence(extractedFeatures);
    const culturalPerspectivesNotFound = historicalEvidence.length === 0;

    // Step 3: Identify Evidence Gaps
    const matchedMotifs = new Set(
      historicalEvidence.map(e => (e.evidenceRecord.motif || e.evidenceRecord.primarySubject).toLowerCase())
    );
    const ungroundedMotifs = extractedFeatures.detectedSymbols.filter(
      sym => !matchedMotifs.has(sym.toLowerCase())
    );

    const evidenceGaps = {
      ungroundedMotifs,
      hasUngroundedMotifs: ungroundedMotifs.length > 0,
      fallbackMessage: 'No reliable source found for this specific claim.'
    };

    // Step 4: Research Retrieval
    const scientificResearch = this.retrieveResearch(extractedFeatures);

    // Step 5: Verified Quote Match
    const quoteThemes = [
      ...extractedFeatures.emotionalSignals,
      ...extractedFeatures.dominantMotifs,
      'mind',
      'consciousness'
    ];
    const verifiedQuoteMatch = SourceVerificationService.matchVerifiedQuote(quoteThemes);

    // Step 6: World 2 Personal Reflection
    const personalReflection = this.generatePersonalReflection(input, extractedFeatures);

    // Step 7: World 2 Creative Reflection
    const creativeReflection = this.generateCreativeReflection(input, extractedFeatures);

    // Step 8: World 2 Artwork Prompt
    const artworkPrompt = this.generateArtworkPrompt(input, extractedFeatures);

    // Step 9: World 2 Closing Thought
    const closingThought = this.generateClosingThought(input, extractedFeatures);

    // Step 10: Step 2 Provenance Claim Records
    const claims = this.evidenceRetriever.findSupportingClaims(extractedFeatures.detectedSymbols);

    const methodologyNotes = 'Somnithos separates audited historical/scientific evidence (World 1) from non-dogmatic personal and creative reflections (World 2). If no reliable historical record exists, the system states "No reliable source found" rather than fabricating a tradition.';

    return {
      id: 'analysis-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      submissionId: input.id || 'submission-' + Date.now(),
      createdAt: new Date().toISOString(),
      input,
      extractedFeatures,
      historicalEvidence,
      culturalPerspectives: historicalEvidence,
      culturalPerspectivesNotFound,
      scientificResearch,
      psychologyPerspectives: scientificResearch,
      evidenceGaps,
      personalReflection,
      personalInterpretation: personalReflection,
      creativeReflection,
      originalReflection: creativeReflection,
      artworkPrompt,
      dreamArtwork: artworkPrompt,
      closingThought,
      verifiedQuoteMatch,
      claims,
      methodologyNotes
    };
  }
}
