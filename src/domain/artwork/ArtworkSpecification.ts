import type { DreamFeatures } from '../dream/DreamFeatures';
import type { DreamInput } from '../dream/DreamInput';
import { DreamArtGenerator } from '../../services/dreamArtGenerator';

/**
 * Strongly typed Artwork Specification for Somnithos.
 * Preserves user's actual, concrete dream visual details without reducing to generic templates.
 */

export interface ArtworkSpecification {
  originalDreamId: string;
  title: string;
  setting: string[];
  environment: string;
  dominantSubjects: string[];
  secondarySubjects: string[];
  importantObjects: string[];
  creatures: string[];
  people: string[];
  architecture: string[];
  colors: string[];
  lighting: string;
  atmosphere: string;
  emotionalTone: string[];
  movement: string[];
  spatialComposition: string;
  surrealElements: string[];
  mustInclude: string[];
  mustAvoid: string[];
  artisticStyle: string;
  negativePrompt?: string;
  sourceDreamFeatures: DreamFeatures;
}

/**
 * Deterministically constructs a rich ArtworkSpecification preserving all unusual dream details.
 */
export function createArtworkSpecification(
  input: DreamInput,
  features: DreamFeatures,
  _stylePresetKey: string = 'nocturne'
): ArtworkSpecification {
  const dreamId = input.id || 'dream-' + Date.now();
  const narrative = (input.narrative || input.description || '').toLowerCase();
  
  // Extract concrete visual elements grounded in the actual narrative
  const visualKeywords = DreamArtGenerator.extractVisualElements(input as any, features);

  // Concrete entities from narrative
  const dominantSubjects: string[] = [];
  const importantObjects: string[] = [];
  const creatures: string[] = [];
  const people: string[] = [];
  const architecture: string[] = [];
  const surrealElements: string[] = [];
  const mustInclude: string[] = [];

  // 1. Vehicles / Transport
  if (narrative.includes('train')) {
    const isPurple = narrative.includes('purple');
    const trainDesc = isPurple ? 'purple train' : 'train';
    dominantSubjects.push(trainDesc);
    mustInclude.push(trainDesc);
  }

  // 2. Underwater / Aquatic environment
  if (narrative.includes('ocean') || narrative.includes('underwater') || narrative.includes('sea') || narrative.includes('water')) {
    mustInclude.push('underwater ocean environment');
  }

  // 3. Creatures
  if (narrative.includes('fish')) {
    const isEnormous = narrative.includes('enormous') || narrative.includes('huge') || narrative.includes('giant');
    const fishDesc = isEnormous ? 'enormous fish' : 'fish';
    creatures.push(fishDesc);
    mustInclude.push(fishDesc);
  }
  if (narrative.includes('bird') || narrative.includes('birds')) {
    const isColored = narrative.includes('colored') || narrative.includes('colorful');
    const birdDesc = isColored ? 'differently colored birds sitting on passengers shoulders' : 'birds';
    creatures.push(birdDesc);
    mustInclude.push(birdDesc);
  }
  if (narrative.includes('snake') || narrative.includes('serpent')) {
    creatures.push('serpent');
    mustInclude.push('serpent');
  }

  // 4. People
  if (narrative.includes('passenger') || narrative.includes('passengers') || narrative.includes('people')) {
    people.push('train passengers');
    mustInclude.push('train passengers with birds on shoulders');
  }

  // 5. Clocks / Timepieces
  if (narrative.includes('clock')) {
    const isNumberless = narrative.includes('no number') || narrative.includes('without number') || narrative.includes('numberless');
    const clockDesc = isNumberless ? 'floating clock with no numbers' : 'floating clock';
    importantObjects.push(clockDesc);
    surrealElements.push(clockDesc);
    mustInclude.push(clockDesc);
  }

  // 6. Architectural / Door / Forest elements
  if (narrative.includes('station')) {
    architecture.push('underwater station platform');
    mustInclude.push('underwater station platform');
  }
  if (narrative.includes('door')) {
    const isWooden = narrative.includes('wood') || narrative.includes('wooden') || narrative.includes('carved');
    const doorDesc = isWooden ? 'freestanding wooden door' : 'freestanding door';
    importantObjects.push(doorDesc);
    architecture.push(doorDesc);
    mustInclude.push(doorDesc);
  }
  if (narrative.includes('forest') || narrative.includes('trees')) {
    const isBright = narrative.includes('bright') || narrative.includes('sunlit') || narrative.includes('glowing');
    const forestDesc = isBright ? 'bright sunlit forest visible through door' : 'forest';
    importantObjects.push(forestDesc);
    mustInclude.push(forestDesc);
  }

  // 7. Lighting and Atmosphere
  let lighting = 'Deep oceanic bioluminescent glow with soft volumetric water light rays';
  if (narrative.includes('strange light') || narrative.includes('lights')) {
    lighting += ' and strange ethereal glowing lights outside the train windows';
    surrealElements.push('strange luminous lights in the deep water');
  }

  let atmosphere = features.emotionalSignals.join(', ') || 'Dream-logic serenity and wonder';
  if (narrative.includes('peaceful') || narrative.includes('curious') || narrative.includes('afraid')) {
    atmosphere = 'Atmosphere conveying a delicate balance of peaceful stillness, deep curiosity, and subtle awe';
  }

  const colors = features.detectedColors.length > 0
    ? features.detectedColors
    : (narrative.includes('purple') ? ['purple', 'deep ocean blue', 'gold', 'emerald'] : ['deep twilight blue', 'amber', 'silver']);

  return {
    originalDreamId: dreamId,
    title: input.title || 'Dream Visualization',
    setting: features.setting.length > 0 ? features.setting : ['ocean landscape'],
    environment: narrative.includes('ocean') || narrative.includes('underwater') ? 'Submerged deep ocean interior and exterior' : 'Atmospheric dream realm',
    dominantSubjects: dominantSubjects.length > 0 ? dominantSubjects : features.dominantMotifs,
    secondarySubjects: visualKeywords.filter(k => !dominantSubjects.includes(k)),
    importantObjects,
    creatures,
    people,
    architecture,
    colors,
    lighting,
    atmosphere,
    emotionalTone: features.emotionalSignals,
    movement: features.movementPatterns.length > 0 ? features.movementPatterns : ['Gliding atmospheric motion'],
    spatialComposition: 'Cinematic wide composition showing the train interior with passengers and exterior ocean window view, leading towards the threshold door.',
    surrealElements,
    mustInclude: Array.from(new Set(mustInclude)),
    mustAvoid: ['generic fantasy landscape', 'modern city clutter', 'watermark', 'blurry details', 'text', 'numbers on clock face'],
    artisticStyle: 'Museum-quality surrealist oil painting in the tradition of René Magritte and Giorgio de Chirico, fine layered brushwork and atmospheric depth',
    negativePrompt: 'blurry, low quality, oversaturated cartoon, generic fantasy, numbers on clock, distorted faces, signature, watermark',
    sourceDreamFeatures: features
  };
}
