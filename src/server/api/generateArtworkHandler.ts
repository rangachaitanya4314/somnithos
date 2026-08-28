import type { ArtworkSpecification } from '../../domain/artwork/ArtworkSpecification';
import { createArtworkSpecification } from '../../domain/artwork/ArtworkSpecification';
import { RealArtworkProvider } from '../artwork/RealArtworkProvider';
import { MockArtworkProvider } from '../artwork/MockArtworkProvider';

export interface GenerateArtworkRequestBody {
  specification?: ArtworkSpecification;
  submission?: any;
  features?: any;
  stylePresetKey?: string;
  isRegenerate?: boolean;
  variationSeed?: number;
}

export interface GenerateArtworkApiResponse {
  status: number;
  body: {
    success: boolean;
    artwork?: any;
    error?: string;
  };
}

export async function handleGenerateArtworkRequest(
  body: GenerateArtworkRequestBody
): Promise<GenerateArtworkApiResponse> {
  try {
    let spec: ArtworkSpecification | undefined = body.specification;

    // If specification not directly passed, build it from submission + features
    if (!spec && body.submission && body.features) {
      spec = createArtworkSpecification(
        body.submission,
        body.features,
        body.stylePresetKey || 'nocturne'
      );
    }

    if (!spec) {
      return {
        status: 400,
        body: {
          success: false,
          error: 'Invalid request: ArtworkSpecification or submission + features is required.'
        }
      };
    }

    // Validation: dreamId must exist
    if (!spec.originalDreamId) {
      spec.originalDreamId = 'dream-' + Date.now();
    }

    // Validation: sourceDreamFeatures must exist
    if (!spec.sourceDreamFeatures) {
      spec.sourceDreamFeatures = {
        dominantMotifs: spec.dominantSubjects || [],
        secondaryMotifs: spec.secondarySubjects || [],
        detectedSymbols: (spec.dominantSubjects || []).concat(spec.secondarySubjects || []),
        emotionalSignals: spec.emotionalTone || [],
        detectedEmotions: spec.emotionalTone || [],
        setting: spec.setting || [],
        detectedLocations: spec.setting || [],
        socialElements: spec.people || [],
        unusualEvents: spec.surrealElements || [],
        movementPatterns: spec.movement || [],
        sensoryImagery: [spec.lighting, spec.atmosphere],
        detectedColors: spec.colors || [],
        detectedThemes: spec.setting || [],
        motifsWhyNoticed: {},
        ambiguityLevel: 'moderate',
        daytimeResidueProbability: 'low'
      };
    }

    // Sanitize any private data strings
    spec.mustAvoid = Array.from(new Set(spec.mustAvoid.concat(['personal identification', 'phone numbers', 'addresses'])));

    const realProvider = new RealArtworkProvider(
      process.env.IMAGEN_API_KEY || process.env.GEMINI_API_KEY || '',
      new MockArtworkProvider()
    );

    const stylePresetKey = body.stylePresetKey || 'nocturne';
    const artwork = body.isRegenerate
      ? await realProvider.regenerateArtwork(spec, stylePresetKey, body.variationSeed || Date.now())
      : await realProvider.generateArtwork(spec, stylePresetKey);

    return {
      status: 200,
      body: {
        success: true,
        artwork
      }
    };
  } catch (err: any) {
    return {
      status: 500,
      body: {
        success: false,
        error: err.message || 'Artwork generation failed'
      }
    };
  }
}
