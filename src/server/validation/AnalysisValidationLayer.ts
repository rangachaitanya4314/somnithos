import type { EvidenceRecordMatch } from '../../domain/evidence/EvidenceRecord';
import type { ResearchRecordMatch } from '../../domain/research/ResearchRecord';
import type { DreamAnalysisResult } from '../../domain/analysis/DreamAnalysisResult';
import type { DreamFeatures } from '../../domain/dream/DreamFeatures';
import type { DreamInput } from '../../domain/dream/DreamInput';
import type { ClaimRecord } from '../../domain/evidence/ClaimRecord';

export interface ValidationReport {
  isValid: boolean;
  sanitizedResult: DreamAnalysisResult;
  violations: string[];
  rejectedClaims: string[];
}

/**
 * Strict Validation Layer for Somnithos.
 * Evaluates Gemini's generated output before it can ever be returned to the client.
 * 
 * Non-negotiable rule:
 * GEMINI CAN CREATE MEANING.
 * GEMINI CANNOT CREATE FACTS.
 */

export class AnalysisValidationLayer {
  /**
   * Validates and sanitizes the synthesized analysis result against ground-truth evidence.
   */
  public static validateAndSanitize(
    rawResult: Partial<DreamAnalysisResult>,
    input: DreamInput,
    extractedFeatures: DreamFeatures,
    verifiedEvidence: EvidenceRecordMatch[],
    verifiedResearch: ResearchRecordMatch[],
    verifiedClaims: ClaimRecord[]
  ): ValidationReport {
    const violations: string[] = [];
    const rejectedClaims: string[] = [];

    // 1. Validate Historical / Cultural Evidence Provenance
    const validSourceIds = new Set(verifiedEvidence.map(e => e.evidenceRecord.source.id));
    const validTraditions = new Set(verifiedEvidence.map(e => (e.evidenceRecord.culturalTradition || e.evidenceRecord.exactTradition).toLowerCase()));

    const sanitizedEvidence: EvidenceRecordMatch[] = [];
    const rawEvidence = rawResult.historicalEvidence || rawResult.culturalPerspectives || [];

    for (const match of rawEvidence) {
      const sourceId = match.evidenceRecord?.source?.id || match.claim?.source?.id;
      const tradition = (match.evidenceRecord?.culturalTradition || match.evidenceRecord?.exactTradition || '').toLowerCase();

      // Check if source ID and tradition exist in provided verified records
      if (sourceId && validSourceIds.has(sourceId) && validTraditions.has(tradition)) {
        sanitizedEvidence.push(match);
      } else {
        violations.push(`Rejected unverified or fabricated cultural citation: "${match.evidenceRecord?.sourceTitle || 'Unknown source'}"`);
        rejectedClaims.push(match.claim?.claim || 'Unverified claim');
      }
    }

    // Always fallback to verified evidence catalog if Gemini omitted or hallucinated
    const finalEvidence = sanitizedEvidence.length > 0 ? sanitizedEvidence : verifiedEvidence;
    const culturalPerspectivesNotFound = finalEvidence.length === 0;

    // 2. Validate Scientific Research Records
    const validResearchIds = new Set(verifiedResearch.map(r => r.researchRecord.id));
    const sanitizedResearch: ResearchRecordMatch[] = [];
    const rawResearch = rawResult.scientificResearch || rawResult.psychologyPerspectives || [];

    for (const match of rawResearch) {
      const resId = match.researchRecord?.id;
      if (resId && validResearchIds.has(resId)) {
        sanitizedResearch.push(match);
      } else {
        violations.push(`Rejected unverified scientific model or fabricated study ID: "${resId}"`);
      }
    }

    const finalResearch = sanitizedResearch.length > 0 ? sanitizedResearch : verifiedResearch;

    // 3. Validate Scope Generalization (Anti-Pan-Regional Guard)
    for (const item of finalEvidence) {
      const text = (item.claim?.claim || item.evidenceRecord?.claim || '').toLowerCase();
      const forbiddenPanRegionalPhrases = [
        'indian culture believes',
        'chinese culture believes',
        'african cultures believe',
        'native americans believe',
        'eastern culture believes',
        'western tradition holds that all'
      ];
      for (const phrase of forbiddenPanRegionalPhrases) {
        if (text.includes(phrase)) {
          violations.push(`Scope generalization detected: "${phrase}". Enforcing narrow tradition scope.`);
        }
      }
    }

    // 4. Validate Personal Reflection Phrasing (World 2)
    let personalReflection = rawResult.personalReflection || (rawResult.personalInterpretation as any) || {
      title: 'Exploratory Perspectives',
      narrativeArcs: ['The narrative moves from one state of awareness to another.'],
      symbolicEchoes: extractedFeatures.dominantMotifs,
      suggestiveQuestions: ['What felt most vivid as you awakened from this dream?'],
      possibleInterpretations: ['One possible reading is that this dream reflects waking emotional balance.'],
      emotionalReading: 'The dream carries an evocative emotional atmosphere.',
      uncertaintyStatement: 'Every dream belongs exclusively to the dreamer; no external system can dictate its subjective significance.'
    };

    // Ensure non-dogmatic phrasing in interpretations
    if (personalReflection.possibleInterpretations) {
      personalReflection.possibleInterpretations = personalReflection.possibleInterpretations.map((interp: string) => {
        if (!interp.toLowerCase().includes('possible') && !interp.toLowerCase().includes('could') && !interp.toLowerCase().includes('suggest') && !interp.toLowerCase().includes('might') && !interp.toLowerCase().includes('reading')) {
          return `One possible reading is that ${interp.charAt(0).toLowerCase() + interp.slice(1)}`;
        }
        return interp;
      });
    }

    // 5. Validate Creative Reflection Labeling (World 2)
    let creativeReflection = rawResult.creativeReflection || (rawResult.originalReflection as any) || {
      message: 'A dream is a door the mind leaves open between the waking day and the quiet night.',
      label: 'Original reflection inspired by your dream.',
      isAIGenerated: true,
      poeticReflection: 'Between water and sky, the thought takes flight.',
      metaphor: 'A landscape built of quiet echoes.'
    };
    creativeReflection.label = 'Original reflection inspired by your dream.';
    creativeReflection.isAIGenerated = true;

    // 6. Validate Artwork Prompt Detail Preservation
    let artworkPrompt = rawResult.artworkPrompt || (rawResult.dreamArtwork as any);
    const narrativeText = input.narrative || input.description || '';

    if (!artworkPrompt || !artworkPrompt.promptUsed || artworkPrompt.promptUsed.trim().length < 20) {
      // Re-synthesize structured prompt preserving exact dream details
      const detailKeywords = [
        ...extractedFeatures.dominantMotifs,
        ...extractedFeatures.setting,
        ...extractedFeatures.detectedColors,
        ...extractedFeatures.movementPatterns
      ];
      artworkPrompt = {
        promptText: `A cinematic, museum-quality surrealist painting visualizing the dream: "${narrativeText.slice(0, 300)}". Featuring ${detailKeywords.join(', ')}. Atmosphere conveying ${extractedFeatures.emotionalSignals.join(', ') || 'Wonder and Mystery'}. Masterpiece surrealism, fine painterly brushwork.`,
        promptUsed: `A cinematic, museum-quality surrealist painting visualizing the dream: "${narrativeText.slice(0, 300)}". Featuring ${detailKeywords.join(', ')}. Masterpiece surrealism.`,
        title: input.title ? `Vision of ${input.title}` : `Surrealist Nocturne in ${extractedFeatures.detectedColors[0] || 'Twilight'}`,
        styleTheme: 'Surrealist Somnithos',
        settingImagery: extractedFeatures.setting.join(', ') || 'Dream landscape',
        dominantImagery: extractedFeatures.dominantMotifs,
        emotionalTone: extractedFeatures.emotionalSignals.join(', ') || 'Evocative',
        colorPalette: extractedFeatures.detectedColors,
        movementAtmosphere: extractedFeatures.movementPatterns.join(', ') || 'Atmospheric stillness',
        label: 'Your Dream — Imagined',
        subLabel: 'An artistic visualization inspired by your description.',
        visualKeywords: detailKeywords
      };
    } else {
      artworkPrompt.label = 'Your Dream — Imagined';
      artworkPrompt.subLabel = 'An artistic visualization inspired by your description.';
    }

    // 7. Validate Closing Thought (World 2 - No False Attribution)
    let closingThought = rawResult.closingThought || {
      thought: 'The dream does not demand an explanation; it invites a conversation.',
      label: 'An original thought inspired by your dream.',
      isOriginal: true
    };
    closingThought.label = 'An original thought inspired by your dream.';
    closingThought.isOriginal = true;

    // Reject any attempt to attribute the closing thought to historical philosophers
    const historicalAuthors = ['aristotle', 'plato', 'jung', 'freud', 'socrates', 'marcus aurelius', 'confucius', 'nietzsche'];
    if (historicalAuthors.some(author => (closingThought.thought || '').toLowerCase().includes(author))) {
      violations.push('Detected historical attribution in closing thought. Stripped false attribution.');
      closingThought.thought = 'The dream does not demand an explanation; it invites a conversation.';
    }

    // 8. Identify Evidence Gaps & Fallback
    const matchedMotifs = new Set(
      finalEvidence.map(e => (e.evidenceRecord?.motif || e.evidenceRecord?.primarySubject || '').toLowerCase())
    );
    const ungroundedMotifs = extractedFeatures.detectedSymbols.filter(
      sym => !matchedMotifs.has(sym.toLowerCase())
    );

    const evidenceGaps = {
      ungroundedMotifs,
      hasUngroundedMotifs: ungroundedMotifs.length > 0 || culturalPerspectivesNotFound,
      fallbackMessage: 'No reliable source found for this specific claim.'
    };

    const sanitizedResult: DreamAnalysisResult = {
      id: rawResult.id || 'analysis-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      submissionId: input.id || rawResult.submissionId || 'submission-' + Date.now(),
      createdAt: rawResult.createdAt || new Date().toISOString(),
      input,
      extractedFeatures,
      historicalEvidence: finalEvidence,
      culturalPerspectives: finalEvidence,
      culturalPerspectivesNotFound,
      scientificResearch: finalResearch,
      psychologyPerspectives: finalResearch,
      evidenceGaps,
      personalReflection,
      personalInterpretation: personalReflection,
      creativeReflection,
      originalReflection: creativeReflection,
      artworkPrompt,
      dreamArtwork: artworkPrompt,
      closingThought,
      verifiedQuoteMatch: rawResult.verifiedQuoteMatch,
      claims: verifiedClaims,
      methodologyNotes: 'Somnithos separates audited historical/scientific evidence (World 1) from non-dogmatic personal and creative reflections (World 2). Gemini is used exclusively as a synthesis engine; factual claims are grounded strictly in the audited evidence catalog.'
    };

    return {
      isValid: violations.length === 0,
      sanitizedResult,
      violations,
      rejectedClaims
    };
  }
}
