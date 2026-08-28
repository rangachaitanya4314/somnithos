import type { DreamInput } from '../../domain/dream/DreamInput';
import type { DreamAnalysisResult } from '../../domain/analysis/DreamAnalysisResult';
import { DreamAnalysisEngine } from '../dreamAnalysisEngine';

/**
 * Client-Side API Gateway for Dream Analysis.
 * Communicates with backend POST /api/analyze-dream.
 * Provides seamless offline / mock fallback if backend is unreachable.
 */

export class DreamAnalysisApiService {
  /**
   * Submits a dream for full epistemic analysis.
   */
  public static async analyzeDream(input: DreamInput): Promise<DreamAnalysisResult> {
    try {
      const response = await fetch('/api/analyze-dream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.result) {
          return json.result;
        }
      }
    } catch {
      // Backend unavailable or running in pure client mode
    }

    // Fallback to client-side deterministic engine
    return DreamAnalysisEngine.analyze(input as any) as unknown as DreamAnalysisResult;
  }
}
