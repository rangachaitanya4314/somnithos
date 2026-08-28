import { MockDreamAnalysisProvider } from '../services/analysis/MockDreamAnalysisProvider';
import { MockEvidenceRepository } from '../services/analysis/MockEvidenceRepository';
import { MockResearchRepository } from '../services/analysis/MockResearchRepository';
import type { DreamInput } from '../domain/dream/DreamInput';
import { CULTURAL_KNOWLEDGE_CLAIMS } from '../data/culturalSources';
import { PSYCHOLOGY_KNOWLEDGE_CLAIMS } from '../data/psychologySources';

console.log('====================================================');
console.log('SOMNITHOS CORE ARCHITECTURE & DATA PIPELINE TESTS');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${testName}`);
    if (details) console.error(`   Details: ${details}`);
    throw new Error(`Test failed: ${testName}`);
  }
  passedTests++;
  console.log(`✓ PASS: ${testName}`);
}

const provider = new MockDreamAnalysisProvider();
const evidenceRepo = new MockEvidenceRepository();
const researchRepo = new MockResearchRepository();

// TEST 1: Dream Feature Extraction
console.log('\n--- 1. Dream Feature Extraction ---');
const dream1: DreamInput = {
  id: 'test-dream-1',
  title: 'Flooded City and Flight',
  narrative: 'I was walking through a flooded city at night. I could not find my family. Then I suddenly began flying above the ocean. I felt frightened at first but then peaceful.',
  emotions: ['fear', 'peace'],
  privacy: 'private'
};

const features1 = provider.extractDreamFeatures(dream1);
assert(features1.detectedSymbols.includes('water'), 'Extracts "water" motif from "flooded" / "ocean"');
assert(features1.detectedSymbols.includes('flying'), 'Extracts "flying" motif');
assert(features1.dominantMotifs.length > 0, 'Populates dominant motifs');
assert(features1.setting.includes('city') || features1.setting.includes('ocean'), 'Extracts setting elements ("city", "ocean")');
assert(features1.emotionalSignals.includes('fear') && features1.emotionalSignals.includes('peace'), 'Extracts emotional signals');
assert(features1.socialElements.includes('family'), 'Extracts social elements ("family")');
assert(Boolean(features1.motifsWhyNoticed['water']), 'Maintains "Why did Somnithos notice this?" explanation for motifs');

// TEST 2: Multiple Motifs Extraction
console.log('\n--- 2. Multiple Motifs Extraction ---');
const dreamMulti: DreamInput = {
  narrative: 'A giant serpent was coiled around an ancient wooden door inside a burning dark forest on a cliff dropping into the sea.',
  privacy: 'private'
};
const featuresMulti = provider.extractDreamFeatures(dreamMulti);
assert(featuresMulti.detectedSymbols.includes('snake'), 'Extracts "snake" motif');
assert(featuresMulti.detectedSymbols.includes('doors'), 'Extracts "doors" motif');
assert(featuresMulti.detectedSymbols.includes('fire'), 'Extracts "fire" motif');
assert(featuresMulti.detectedSymbols.includes('forest'), 'Extracts "forest" motif');
assert(featuresMulti.detectedSymbols.includes('falling') || featuresMulti.detectedSymbols.includes('water'), 'Extracts "falling" or "water" motif');

// TEST 3: Emotional Features Extraction
console.log('\n--- 3. Emotional Signals & Ambiguity Scoring ---');
const dreamEmotional: DreamInput = {
  narrative: 'I felt intense terror and dread as shadows moved, but then an overwhelming sensation of awe and tranquil wonder washed over me.',
  privacy: 'private'
};
const featuresEmotional = provider.extractDreamFeatures(dreamEmotional);
assert(featuresEmotional.emotionalSignals.includes('fear'), 'Detects fear emotion cluster');
assert(featuresEmotional.emotionalSignals.includes('wonder'), 'Detects wonder emotion cluster');
assert(featuresEmotional.emotionalSignals.includes('peace'), 'Detects peace emotion cluster');
assert(['low', 'moderate', 'high'].includes(featuresEmotional.ambiguityLevel), 'Assigns valid ambiguity score');

// TEST 4: Evidence Matching
console.log('\n--- 4. Audited Evidence Matching ---');
const evidenceMatches = evidenceRepo.matchEvidence(['water', 'flying']);
assert(evidenceMatches.length >= 2, 'Matches verified records for water and flying');
const waterMatch = evidenceMatches.find(m => m.evidenceRecord.primarySubject === 'water');
assert(Boolean(waterMatch), 'Found water primary source record');
assert(Boolean(waterMatch?.evidenceRecord.culturalTradition?.includes('Ramesside') || waterMatch?.evidenceRecord.exactTradition?.includes('Ramesside')), 'Water record grounds specifically in Ramesside Egyptian Scribal Oneirology');
assert(Boolean(waterMatch?.evidenceRecord.source.institutionOrPublisher?.includes('British Museum')), 'Water record cites British Museum EA 10683 Gardiner edition');

// TEST 5: Source-First Fallback & No Reliable Source Found Guarantee
console.log('\n--- 5. Source-First Fallback (Never Inventing Sources) ---');
const ungroundedInput: DreamInput = {
  id: 'test-ungrounded',
  title: 'Quantum Submarine in 3045',
  narrative: 'I was calibrating a holographic titanium synthesizer inside a quantum submarine traveling through tachyon space in the year 3045.',
  symbolsAndObjects: ['submarine', 'synthesizer', 'tachyon'],
  privacy: 'private'
};

const ungroundedResult = provider.analyzeDream(ungroundedInput);
assert(ungroundedResult.historicalEvidence.length === 0, 'Returns 0 historical evidence matches for ungrounded modern/sci-fi objects');
assert(ungroundedResult.culturalPerspectivesNotFound === true, 'Sets culturalPerspectivesNotFound flag to true');
assert(ungroundedResult.evidenceGaps.hasUngroundedMotifs === true, 'Flags presence of ungrounded motifs');
assert(ungroundedResult.evidenceGaps.fallbackMessage === 'No reliable source found for this specific claim.', 'Provides explicit "No reliable source found" message');

// TEST 6: Cultural Specificity (Prohibiting Pan-Regional Generalizations)
console.log('\n--- 6. Cultural Specificity & Academic Rigor ---');
CULTURAL_KNOWLEDGE_CLAIMS.forEach(claim => {
  assert(Boolean(claim.exactTradition), `Record ${claim.id} specifies exact tradition`);
  assert(Boolean(claim.geographicContext), `Record ${claim.id} specifies geographic boundaries`);
  assert(Boolean(claim.historicalPeriod), `Record ${claim.id} specifies historical period`);
  assert(Boolean(claim.source.sourceTitle), `Record ${claim.id} provides complete bibliographic source title`);
  assert(Boolean(claim.source.supportingPassage), `Record ${claim.id} provides exact translated supporting passage`);
  assert(claim.isSymbolMeaningUniversal === false, `Record ${claim.id} confirms symbol meaning is contingent, not universal`);
});

// TEST 7: Research Record Separation & Non-Diagnostic Safeguards
console.log('\n--- 7. Research Record Separation & Safeguards ---');
const researchMatches = researchRepo.matchResearch(['fear', 'wonder']);
assert(researchMatches.length > 0, 'Matches peer-reviewed research for emotional processing');
const tst = researchMatches.find(r => r.researchRecord.id === 'psy-threat-simulation-revonsuo');
if (tst) {
  assert(tst.researchRecord.researchers.includes('Revonsuo'), 'TST cites Antti Revonsuo');
  assert(Boolean(tst.researchRecord.limitations), 'TST documents scientific limitations');
  assert(Boolean(tst.researchRecord.nonDiagnosticDisclaimer), 'TST contains non-diagnostic disclaimer');
}
PSYCHOLOGY_KNOWLEDGE_CLAIMS.forEach(psy => {
  assert(Boolean(psy.nonDiagnosticDisclaimer), `Psychology record ${psy.id} enforces non-diagnostic clinical disclaimer`);
});

// TEST 8: Personal Reflection Labeling & Exploratory Phrasing
console.log('\n--- 8. Personal Reflection Phrasing (World 2) ---');
const personalRef = provider.generatePersonalReflection(dream1, features1);
assert(personalRef.possibleInterpretations.length > 0, 'Generates possible interpretations');
const hasCautiousPhrasing = personalRef.possibleInterpretations.some(
  arc => arc.includes('One possible reading') || arc.includes('could suggest') || arc.includes('may reflect')
);
assert(hasCautiousPhrasing, 'Uses exploratory, non-dogmatic language ("One possible reading...", "could suggest...")');
assert(personalRef.suggestiveQuestions.length > 0, 'Includes open questions for user self-reflection');
assert(Boolean(personalRef.uncertaintyStatement), 'Contains explicit uncertainty disclaimer');

// TEST 9: Creative Reflection Labeling (World 2)
console.log('\n--- 9. Creative Reflection Labeling (World 2) ---');
const creativeRef = provider.generateCreativeReflection(dream1, features1);
assert(creativeRef.label === 'Original reflection inspired by your dream', 'Explicitly labels creative reflection');
assert(creativeRef.isAIGenerated === true, 'Flags AI generation for creative reflection');
assert(creativeRef.isOriginal === true, 'Flags originality');
assert(Boolean(creativeRef.poeticReflection), 'Generates poetic reflection message');
assert(Boolean(creativeRef.metaphor), 'Generates imaginative metaphor');

// TEST 10: Original Closing Thought (World 2)
console.log('\n--- 10. Original Closing Thought (World 2) ---');
const closingThought = provider.generateClosingThought(dream1, features1);
assert(closingThought.label === 'An original thought inspired by your dream.', 'Explicitly labels closing thought');
assert(closingThought.isOriginal === true, 'Flags originality');
assert(Boolean(closingThought.thought), 'Produces an original closing thought');

// TEST 11: Artwork Prompt Generation (World 2)
console.log('\n--- 11. Artwork Prompt Generation ---');
const artworkPrompt = provider.generateArtworkPrompt(dream1, features1);
assert(Boolean(artworkPrompt.promptText), 'Synthesizes structured artwork prompt');
assert(artworkPrompt.label === 'Your Dream — Imagined', 'Artwork label is "Your Dream — Imagined"');
assert(artworkPrompt.visualKeywords.length > 0, 'Extracts grounded visual keywords');

// TEST 12: Provenance Preservation in Final Response
console.log('\n--- 12. Full Provenance Preservation ---');
const fullResult = provider.analyzeDream(dream1);
assert(Boolean(fullResult.id), 'Result has unique ID');
assert(Boolean(fullResult.input), 'Preserves original dream input');
assert(Boolean(fullResult.extractedFeatures), 'Preserves extracted features');
assert(fullResult.historicalEvidence.length > 0, 'Preserves historical evidence matches');
assert(fullResult.scientificResearch.length > 0, 'Preserves scientific research matches');
assert(Boolean(fullResult.personalReflection), 'Preserves personal reflection');
assert(Boolean(fullResult.creativeReflection), 'Preserves creative reflection');
assert(Boolean(fullResult.artworkPrompt), 'Preserves artwork prompt');
assert(Boolean(fullResult.closingThought), 'Preserves closing thought');
assert(Boolean(fullResult.methodologyNotes), 'Preserves methodology notes');

// TEST 13: Required Manual Verification Dream Scenarios
console.log('\n--- 13. Verification of User Requested Dream Scenarios ---');

// Scenario A: "I was flying over an ocean at night."
const scenarioA: DreamInput = {
  narrative: 'I was flying over an ocean at night.',
  privacy: 'private'
};
const resultA = provider.analyzeDream(scenarioA);
assert(resultA.extractedFeatures.detectedSymbols.includes('flying'), 'Scenario A detects flying');
assert(resultA.extractedFeatures.detectedSymbols.includes('water'), 'Scenario A detects water/ocean');
assert(resultA.historicalEvidence.length >= 2, 'Scenario A matches historical evidence for flying & ocean');

// Scenario B: "I was falling through a dark building."
const scenarioB: DreamInput = {
  narrative: 'I was falling through a dark building.',
  privacy: 'private'
};
const resultB = provider.analyzeDream(scenarioB);
assert(resultB.extractedFeatures.detectedSymbols.includes('falling'), 'Scenario B detects falling');
assert(resultB.extractedFeatures.detectedColors.includes('dark'), 'Scenario B detects dark color/tone');
assert(resultB.extractedFeatures.setting.includes('city') || resultB.extractedFeatures.dominantMotifs.includes('house'), 'Scenario B detects building/structure');

// Scenario C: "I saw a completely unfamiliar object that I cannot describe."
const scenarioC: DreamInput = {
  narrative: 'I saw a completely unfamiliar object that I cannot describe.',
  privacy: 'private'
};
const resultC = provider.analyzeDream(scenarioC);
assert(resultC.historicalEvidence.length === 0, 'Scenario C does NOT hallucinate any cultural traditions');
assert(resultC.culturalPerspectivesNotFound === true, 'Scenario C sets culturalPerspectivesNotFound to true');
assert(resultC.evidenceGaps.fallbackMessage === 'No reliable source found for this specific claim.', 'Scenario C outputs "No reliable source found"');

console.log('\n====================================================');
console.log(`ALL ${passedTests} / ${totalTests} TESTS COMPLETED WITH 100% SUCCESS`);
console.log('====================================================\n');
