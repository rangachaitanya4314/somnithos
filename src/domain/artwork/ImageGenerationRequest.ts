import type { ArtworkSpecification } from './ArtworkSpecification';

export interface ImageGenerationRequest {
  specification: ArtworkSpecification;
  positivePrompt: string;
  negativePrompt: string;
  aspectRatio: '1:1' | '16:9' | '4:3' | '9:16';
  stylePreset: string;
  safetySettings?: Record<string, string>;
  variationSeed?: number;
}

/**
 * Deterministically transforms an ArtworkSpecification into an ImageGenerationRequest.
 * Prioritizes concrete dream details > spatial composition > atmosphere > artistic treatment.
 */
export function transformSpecificationToRequest(
  spec: ArtworkSpecification,
  variationSeed: number = 0,
  aspectRatio: '1:1' | '16:9' | '4:3' | '9:16' = '16:9'
): ImageGenerationRequest {
  const variationAngles = [
    'Cinematic wide perspective',
    'Atmospheric three-quarter interior angle',
    'Evocative eye-level depth of field',
    'Dramatic illuminated side view'
  ];
  const angle = variationAngles[variationSeed % variationAngles.length];

  // 1. Concrete dream entities (Must Include)
  const concreteEntities = spec.mustInclude.length > 0
    ? spec.mustInclude.join(', ')
    : spec.dominantSubjects.join(', ');

  // 2. Lighting & Color Palette
  const colorStr = spec.colors.length > 0 ? `rendered in palette of ${spec.colors.join(', ')}` : '';
  const lightingStr = spec.lighting ? `with ${spec.lighting}` : '';

  // 3. Surreal Elements & Atmosphere
  const surrealStr = spec.surrealElements.length > 0 ? `featuring surreal elements of ${spec.surrealElements.join(' and ')}` : '';
  const atmosphereStr = spec.atmosphere ? `conveying an evocative mood of ${spec.atmosphere}` : '';

  // 4. Style & Composition
  const styleStr = spec.artisticStyle;

  const positivePrompt = `${angle} depicting ${concreteEntities}. ${colorStr} ${lightingStr}. ${surrealStr}. ${spec.spatialComposition}. ${atmosphereStr}. Masterpiece, ${styleStr}, fine painterly brushwork, delicate water reflections, and rich atmospheric dream-logic depth.`;

  const negativePrompt = spec.negativePrompt || 'blurry, distorted, oversaturated, generic fantasy, cartoon, numbers on clock, low quality, watermark, signature';

  return {
    specification: spec,
    positivePrompt,
    negativePrompt,
    aspectRatio,
    stylePreset: spec.artisticStyle,
    variationSeed
  };
}
