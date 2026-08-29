import type { DreamAnalysisProvider } from '../../domain/analysis/DreamAnalysisProvider';
import type { DreamInput } from '../../domain/dream/DreamInput';
import type { DreamFeatures } from '../../domain/dream/DreamFeatures';
import type { EvidenceRecordMatch } from '../../domain/evidence/EvidenceRecord';
import type { ResearchRecordMatch } from '../../domain/research/ResearchRecord';
import type { PersonalReflection } from '../../domain/analysis/PersonalReflection';
import type { CreativeReflection } from '../../domain/analysis/CreativeReflection';
import type { ArtworkPrompt } from '../../domain/analysis/ArtworkPrompt';
import type { ClosingThought } from '../../domain/analysis/ClosingThought';
import type { DreamAnalysisResult } from '../../domain/analysis/DreamAnalysisResult';
import { normalizeDreamInput } from '../../domain/dream/DreamInput';
import { MockDreamAnalysisProvider } from '../../services/analysis/MockDreamAnalysisProvider';
import { EvidenceRetrieverService } from '../../services/evidence/EvidenceRetrieverService';
import { GeminiClient } from '../gemini/GeminiClient';
import { AnalysisValidationLayer } from '../validation/AnalysisValidationLayer';

/**
 * Gemini Dream Analysis Provider.
 * Implements DreamAnalysisProvider by using Gemini for reasoning, personal reflection,
 * creative synthesis, and artwork prompt synthesis, while routing all factual historical
 * and scientific claims strictly through the Evidence Engine.
 */

export class GeminiDreamAnalysisProvider implements DreamAnalysisProvider {
  private client: GeminiClient;
  private evidenceRetriever: EvidenceRetrieverService;
  private fallbackProvider: MockDreamAnalysisProvider;

  constructor(
    client: GeminiClient = new GeminiClient(),
    evidenceRetriever: EvidenceRetrieverService = new EvidenceRetrieverService(),
    fallbackProvider: MockDreamAnalysisProvider = new MockDreamAnalysisProvider()
  ) {
    this.client = client;
    this.evidenceRetriever = evidenceRetriever;
    this.fallbackProvider = fallbackProvider;
  }

  public extractDreamFeatures(rawInput: DreamInput): DreamFeatures {
    // Feature extraction utilizes the proven multi-motif extraction engine
    return this.fallbackProvider.extractDreamFeatures(rawInput);
  }

  public retrieveEvidence(features: DreamFeatures): EvidenceRecordMatch[] {
    return this.fallbackProvider.retrieveEvidence(features);
  }

  public retrieveResearch(features: DreamFeatures): ResearchRecordMatch[] {
    return this.fallbackProvider.retrieveResearch(features);
  }

  public generatePersonalReflection(input: DreamInput, features: DreamFeatures): PersonalReflection {
    return this.fallbackProvider.generatePersonalReflection(input, features);
  }

  public generateCreativeReflection(input: DreamInput, features: DreamFeatures): CreativeReflection {
    return this.fallbackProvider.generateCreativeReflection(input, features);
  }

  public generateArtworkPrompt(input: DreamInput, features: DreamFeatures): ArtworkPrompt {
    return this.fallbackProvider.generateArtworkPrompt(input, features);
  }

  public generateClosingThought(input: DreamInput, features: DreamFeatures): ClosingThought {
    return this.fallbackProvider.generateClosingThought(input, features);
  }

  /**
   * Orchestrates the complete Somnithos dream analysis pipeline.
   */
  public async analyzeDream(rawInput: DreamInput): Promise<DreamAnalysisResult> {
    const input = normalizeDreamInput(rawInput);

    // 1. Feature Extraction
    const extractedFeatures = this.extractDreamFeatures(input);

    // 2. Strict Evidence & Research Retrieval (Ground Truth)
    const verifiedEvidence = this.retrieveEvidence(extractedFeatures);
    const verifiedResearch = this.retrieveResearch(extractedFeatures);
    const verifiedClaims = this.evidenceRetriever.findSupportingClaims(extractedFeatures.detectedSymbols);

    // If no API key configured or fallback requested, use Mock provider immediately
    if (!this.client.hasApiKey()) {
      const mockResult = this.fallbackProvider.analyzeDream(input);
      const validation = AnalysisValidationLayer.validateAndSanitize(
        mockResult,
        input,
        extractedFeatures,
        verifiedEvidence,
        verifiedResearch,
        verifiedClaims
      );
      return validation.sanitizedResult;
    }

    const targetLang = input.language || input.targetLanguage || 'en';
    const langNames: Record<string, string> = {
      en: 'English (simple, everyday English)',
      te: 'Telugu (తెలుగు - natural, conversational Telugu, not overly formal or academic)',
      ta: 'Tamil (தமிழ் - natural, conversational Tamil, not overly formal or academic)',
      hi: 'Hindi (हिन्दी - natural, conversational Hindi, not overly formal or academic)'
    };

    // 3. Prepare Structured Gemini Synthesis Prompt
    const systemInstruction = `You are the synthesis engine for Somnithos, an evidence-first dream exploration platform.
Your task is to synthesize a simple, personal, and calm dream exploration experience based on the user's dream narrative.

TARGET LANGUAGE: ${langNames[targetLang] || 'English'}
IMPORTANT: Write all user-facing text (meaningfulHighlights text, emotionalJourney, simpleReflection, personalReflection, suggestiveQuestions, astrology reading) naturally in ${langNames[targetLang] || 'English'}. Keep the tone natural, conversational, and gentle.

CORE PRINCIPLE: "Simple on the surface. Powerful underneath."

STRICT RULES:
1. NATURAL EVERYDAY LANGUAGE:
   Use clear, everyday language in the requested target language. An average speaker should understand the result immediately.
   NEVER use unnecessary academic or psychological jargon.
2. MEANINGFUL NARRATIVE HIGHLIGHTS (3–5 items):
   Do NOT simply extract isolated nouns (like "water", "forest").
   Understand the story, actions, relationships, and emotional changes (e.g. fear → warm light → calm, or purple train with huge blue fish under the ocean, or searching for a classroom and finding a friend).
   Format 3–5 items with a relevant emoji for each in the target language.
3. EMOTIONAL JOURNEY:
   Explicitly identify the emotional trajectory in the target language (e.g. "Fear → Warm Light → Calm", "Nervousness → Relief").
4. ONE SIMPLE REFLECTION (3–4 Short Lines):
   Provide ONE gentle, thoughtful reflection of exactly 3–4 short lines under "simpleReflection".
   Use non-diagnostic, exploratory language (e.g. "One possible way to look at it...", "It may reflect...", "It could be connected to...", "You might relate this to...").
   Never diagnose or claim certainty.
5. ABSOLUTELY NO FRIGHTENING PREDICTIONS:
   NEVER say or imply that a dream predicts death, dying, someone's death, serious illness, disease, disaster, tragedy, physical harm, or future catastrophe.
6. ARTWORK PROMPT:
   Must visually represent the ACTUAL dream (specific objects, locations, actions, characters, emotional mood, distinct colors) in English for image generation stability.
7. EVIDENCE ENGINE AS GROUND TRUTH:
   Never invent historical citations, traditions, or scientific studies. Only reference the provided context. If no evidence matches, do not fabricate claims.
8. RETURN ONLY VALID JSON:
   Return valid JSON with:
   - extractedFeatures: { meaningfulHighlights: [{emoji, text}], emotionalJourney, dominantMotifs, emotionalSignals, setting, detectedColors, movementPatterns }
   - simpleReflection: string (3-4 short lines in ${targetLang})
   - personalReflection: { title, possibleInterpretations, primarySynthesis, suggestiveQuestions, uncertaintyStatement }
   - creativeReflection: { message, label, isAIGenerated: true, poeticReflection, metaphor }
   - artworkPrompt: { promptUsed, title, styleTheme, visualKeywords }
   - closingThought: { thought, label, isOriginal: true }
   - astrologyReading: { element, planetaryTheme, reading, disclaimer }`;

    const userPrompt = JSON.stringify({
      targetLanguage: targetLang,
      dreamNarrative: input.narrative,
      dreamTitle: input.title || '',
      extractedFeatures: {
        dominantMotifs: extractedFeatures.dominantMotifs,
        emotions: extractedFeatures.emotionalSignals,
        setting: extractedFeatures.setting,
        colors: extractedFeatures.detectedColors,
        movement: extractedFeatures.movementPatterns,
        meaningfulHighlights: extractedFeatures.meaningfulHighlights,
        emotionalJourney: extractedFeatures.emotionalJourney,
        simpleReflection: extractedFeatures.simpleReflection
      },
      providedEvidenceContext: verifiedEvidence.map(e => ({
        motif: e.evidenceRecord.motif,
        tradition: e.evidenceRecord.culturalTradition || e.evidenceRecord.exactTradition,
        period: e.evidenceRecord.historicalPeriod,
        claim: e.evidenceRecord.claim,
        sourceId: e.evidenceRecord.source.id
      })),
      providedResearchContext: verifiedResearch.map(r => ({
        id: r.researchRecord.id,
        concept: r.researchRecord.conceptName,
        findings: r.researchRecord.summary
      }))
    });

    const response = await this.client.generateStructuredContent<Partial<DreamAnalysisResult>>(
      systemInstruction,
      userPrompt
    );

    if (!response.success || !response.data) {
      // Fallback cleanly during development or API disruption
      const mockResult = this.fallbackProvider.analyzeDream(input);
      const validation = AnalysisValidationLayer.validateAndSanitize(
        mockResult,
        input,
        extractedFeatures,
        verifiedEvidence,
        verifiedResearch,
        verifiedClaims
      );
      return validation.sanitizedResult;
    }

    // 4. Pass Gemini Output through the Strict Validation Layer
    const validation = AnalysisValidationLayer.validateAndSanitize(
      response.data,
      input,
      extractedFeatures,
      verifiedEvidence,
      verifiedResearch,
      verifiedClaims
    );

    return validation.sanitizedResult;
  }
}
