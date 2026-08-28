import type { DreamInput } from '../../domain/dream/DreamInput';
import type { DreamAnalysisResult } from '../../domain/analysis/DreamAnalysisResult';
import { GeminiDreamAnalysisProvider } from '../analysis/GeminiDreamAnalysisProvider';

/**
 * Server API Handler for POST /api/analyze-dream.
 */

export interface ApiAnalyzeDreamResponse {
  success: boolean;
  result?: DreamAnalysisResult;
  error?: string;
}

export async function handleAnalyzeDreamRequest(
  body: any,
  provider: GeminiDreamAnalysisProvider = new GeminiDreamAnalysisProvider()
): Promise<{ status: number; body: ApiAnalyzeDreamResponse }> {
  try {
    if (!body || typeof body !== 'object') {
      return {
        status: 400,
        body: {
          success: false,
          error: 'Invalid request body. Expected a JSON object with dream details.'
        }
      };
    }

    const narrative = body.narrative || body.description || '';
    if (typeof narrative !== 'string' || narrative.trim().length === 0) {
      return {
        status: 400,
        body: {
          success: false,
          error: 'Dream narrative is required.'
        }
      };
    }

    const dreamInput: DreamInput = {
      id: body.id,
      title: body.title,
      narrative: narrative.trim(),
      description: narrative.trim(),
      emotions: Array.isArray(body.emotions) ? body.emotions : [],
      mood: body.mood,
      setting: body.setting,
      location: body.location,
      people: body.people,
      importantPeople: body.importantPeople,
      creatures: Array.isArray(body.creatures) ? body.creatures : [],
      animals: Array.isArray(body.animals) ? body.animals : [],
      objects: Array.isArray(body.objects) ? body.objects : [],
      symbolsAndObjects: Array.isArray(body.symbolsAndObjects) ? body.symbolsAndObjects : [],
      symbols: Array.isArray(body.symbols) ? body.symbols : [],
      actions: Array.isArray(body.actions) ? body.actions : [],
      movement: Array.isArray(body.movement) ? body.movement : [],
      colors: Array.isArray(body.colors) ? body.colors : [],
      sensoryDetails: Array.isArray(body.sensoryDetails) ? body.sensoryDetails : [],
      recurringElements: body.recurringElements,
      beforeDream: body.beforeDream,
      afterWaking: body.afterWaking,
      userInterpretation: body.userInterpretation,
      culturalBackground: body.culturalBackground,
      privacy: body.privacy || 'private',
      createdAt: body.createdAt || new Date().toISOString()
    };

    const result = await provider.analyzeDream(dreamInput);

    return {
      status: 200,
      body: {
        success: true,
        result
      }
    };
  } catch (err: any) {
    return {
      status: 500,
      body: {
        success: false,
        error: 'An error occurred while processing the dream analysis.'
      }
    };
  }
}
