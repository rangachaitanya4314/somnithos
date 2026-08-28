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

    // 3. Prepare Structured Gemini Synthesis Prompt
    const systemInstruction = `You are the synthesis engine for Somnithos, an evidence-first dream exploration platform.
Your task is to synthesize personal reflection, creative reflection, and a museum-quality artwork prompt based on the user's dream narrative.

STRICT EPISTEMIC RULES:
1. THE EVIDENCE ENGINE IS THE ONLY SOURCE OF FACTUAL TRUTH. Never invent historical citations, traditions, or scientific studies.
2. If the provided evidence is empty, do not invent cultural traditions.
3. Personal reflection must be cautious and exploratory (e.g. "One possible reading is...", "could suggest..."). Never be dogmatic.
4. Creative reflection must be labeled "Original reflection inspired by your dream." and be poetic.
5. The artwork prompt must preserve ALL unusual dream details (e.g. specific objects, strange colors, creatures, spatial compositions).
6. Closing thought must be an original thought labeled "An original thought inspired by your dream." Never attribute it to a real historical person.
7. Return ONLY a valid JSON object matching the requested schema.`;

    const userPrompt = JSON.stringify({
      dreamNarrative: input.narrative,
      dreamTitle: input.title || '',
      extractedFeatures: {
        dominantMotifs: extractedFeatures.dominantMotifs,
        emotions: extractedFeatures.emotionalSignals,
        setting: extractedFeatures.setting,
        colors: extractedFeatures.detectedColors,
        movement: extractedFeatures.movementPatterns
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
