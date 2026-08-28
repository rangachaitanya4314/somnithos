/**
 * Server-side Gemini API Client.
 * 
 * Epistemic & Security Rules:
 * 1. API key is strictly read from server environment (process.env.GEMINI_API_KEY).
 * 2. Never exposes API keys or error traces containing credentials to client code.
 * 3. Enforces strict prompt separation: developer system instructions vs untrusted user narrative.
 * 4. Requests structured JSON responses with schema constraints.
 */

export interface GeminiClientOptions {
  apiKey?: string;
  model?: string;
  timeoutMs?: number;
}

export interface GeminiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  isFallback?: boolean;
}

export class GeminiClient {
  private apiKey: string;
  private model: string;
  private timeoutMs: number;

  constructor(options: GeminiClientOptions = {}) {
    this.apiKey = options.apiKey || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY || '' : '');
    this.model = options.model || (typeof process !== 'undefined' ? process.env?.GEMINI_MODEL || 'gemini-1.5-flash' : 'gemini-1.5-flash');
    this.timeoutMs = options.timeoutMs || 15000;
  }

  public hasApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Generates structured JSON using Gemini with developer system instructions.
   */
  public async generateStructuredContent<T = any>(
    systemInstruction: string,
    userContent: string
  ): Promise<GeminiResponse<T>> {
    if (!this.hasApiKey()) {
      return {
        success: false,
        error: 'GEMINI_API_KEY is not configured on the server.',
        isFallback: true
      };
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const payload = {
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userContent }]
          }
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.2, // Low temperature for high fidelity to provided evidence
          topP: 0.95
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timer);

      if (!response.ok) {
        const status = response.status;
        const errText = await response.text().catch(() => 'Unknown server error');
        return {
          success: false,
          error: `Gemini API returned status ${status}: ${errText.slice(0, 100)}`,
          isFallback: true
        };
      }

      const resultJson: any = await response.json();
      const rawText = resultJson?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        return {
          success: false,
          error: 'Gemini returned an empty candidate or missing text part.',
          isFallback: true
        };
      }

      try {
        const parsed = JSON.parse(rawText) as T;
        return {
          success: true,
          data: parsed
        };
      } catch (parseErr) {
        return {
          success: false,
          error: `Failed to parse Gemini structured JSON response: ${(parseErr as Error).message}`,
          isFallback: true
        };
      }
    } catch (err: any) {
      clearTimeout(timer);
      const isAbort = err?.name === 'AbortError';
      return {
        success: false,
        error: isAbort ? 'Gemini API request timed out.' : (err?.message || 'Network error communicating with Gemini.'),
        isFallback: true
      };
    }
  }
}
