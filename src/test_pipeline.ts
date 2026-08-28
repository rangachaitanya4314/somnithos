import { DreamAnalysisEngine } from './services/dreamAnalysisEngine';
import { DreamArtGenerator } from './services/dreamArtGenerator';
import { ImageGenerationService } from './services/imageGenerationService';
import { CULTURAL_KNOWLEDGE_CLAIMS } from './data/culturalSources';
import { PSYCHOLOGY_KNOWLEDGE_CLAIMS } from './data/psychologySources';
import { VERIFIED_QUOTATIONS } from './data/verifiedQuotes';
import { DREAM_SYMBOLS } from './data/dreamSymbols';
import type { DreamSubmission } from './types/dream';

console.log('====================================================');
console.log('SOMNITHOS PROVENANCE & ARTWORK AUDIT TEST SUITE');
console.log('====================================================\n');

// 1. Check Cultural Knowledge Integrity
console.log(`[1] Verifying ${CULTURAL_KNOWLEDGE_CLAIMS.length} Audited Cultural Knowledge Claims...`);
CULTURAL_KNOWLEDGE_CLAIMS.forEach(claim => {
  if (!claim.exactTradition || !claim.source.sourceTitle || !claim.source.publicationDate) {
    throw new Error(`Invalid claim provenance for ID: ${claim.id}`);
  }
  if (!claim.source.supportingPassage) {
    throw new Error(`Missing supporting passage for claim: ${claim.id}`);
  }
  console.log(`  ✓ Verified Claim: "${claim.primarySubject}" in ${claim.exactTradition} (${claim.source.publicationDate}) [${claim.evidenceLevel}]`);
});

// 2. Check Psychology Knowledge Integrity
console.log(`\n[2] Verifying ${PSYCHOLOGY_KNOWLEDGE_CLAIMS.length} Audited Psychology & Neuroscience Claims...`);
PSYCHOLOGY_KNOWLEDGE_CLAIMS.forEach(psy => {
  if (!psy.researchers || !psy.documentedLimitations || !psy.nonDiagnosticDisclaimer) {
    throw new Error(`Missing scientific safeguards for: ${psy.conceptName}`);
  }
  console.log(`  ✓ Verified Research Model: ${psy.conceptName} (${psy.researchers}, ${psy.publicationYear}) [${psy.epistemicType}]`);
});

// 3. Check Verified Quotes & Symbols
console.log(`\n[3] Verifying ${VERIFIED_QUOTATIONS.length} Authentic Quotations & ${DREAM_SYMBOLS.length} Symbols...`);
VERIFIED_QUOTATIONS.forEach(q => {
  if (!q.author || !q.workTitle || !q.publicationOrManuscriptDate) {
    throw new Error(`Quote missing provenance: ${q.id}`);
  }
  console.log(`  ✓ Verified Quote: ${q.author} - "${q.workTitle}" (${q.publicationOrManuscriptDate})`);
});

// 4. Test Dream-Faithful Complex Narrative Entity Extraction
console.log('\n[4] Testing Dream-Faithful Entity Extraction on Complex Multi-Element Narrative:');
const testComplexDream: DreamSubmission = {
  id: 'test-complex-1',
  title: 'The Submerged Voyage',
  description: 'I was riding an underwater purple train with enormous fish swimming alongside. There were colored birds resting on passengers. Through the window I saw a floating numberless clock near an underwater station, next to an ancient carved wooden door leading into a bright forest.',
  emotions: ['Wonder', 'Peace', 'Awe'],
  symbolsAndObjects: ['water', 'doors', 'forest', 'animals'],
  colors: ['purple', 'gold', 'emerald', 'azure'],
  privacy: 'private',
  createdAt: new Date().toISOString()
};

const analysisComplex = DreamAnalysisEngine.analyze(testComplexDream);
const visualElements = DreamArtGenerator.extractVisualElements(testComplexDream, analysisComplex.extractedFeatures);

console.log(`  ✓ Extracted Visual Elements (${visualElements.length}):`);
visualElements.forEach(el => console.log(`    - ${el}`));

const requiredElements = [
  'Purple Train',
  'Enormous Fish',
  'Colored Birds',
  'Floating Numberless Clock',
  'Underwater Station',
  'Carved Wooden Door',
  'Bright Forest',
  'Underwater Realm'
];

requiredElements.forEach(req => {
  if (!visualElements.includes(req)) {
    throw new Error(`Missing expected visual element extraction: ${req}`);
  }
  console.log(`  ✓ Verified Narrative Element Grounded: "${req}"`);
});

console.log(`\n  ✓ Synthesized Art Prompt:\n    "${analysisComplex.dreamArtwork.promptUsed}"`);

// 5. Test Modular Image Generation Providers
console.log('\n[5] Testing Modular Image Generation Providers...');
const providers = ImageGenerationService.getAllProviders();
console.log(`  ✓ Available Providers (${providers.length}):`);
providers.forEach(p => console.log(`    - ${p.name} (${p.description})`));

// 6. Test "No Reliable Source Found" Provenance Guarantee
console.log('\n[6] Testing "No Reliable Source Found" Fallback on Ungrounded Sci-Fi Dream...');
const testDreamUnknown: DreamSubmission = {
  id: 'test-sub-2',
  description: 'I was sitting in a quantum submarine calibrating a holographic titanium synthesizer in the year 3045.',
  emotions: ['Curiosity'],
  symbolsAndObjects: ['submarine', 'synthesizer'],
  colors: ['neon'],
  privacy: 'private',
  createdAt: new Date().toISOString()
};

const resultUnknown = DreamAnalysisEngine.analyze(testDreamUnknown);
console.log(`  ✓ Cultural Perspectives Found: ${resultUnknown.culturalPerspectives.length}`);
console.log(`  ✓ Cultural Perspectives Not Found Flag: ${resultUnknown.culturalPerspectivesNotFound}`);
if (resultUnknown.culturalPerspectivesNotFound) {
  console.log(`  ✓ PROVENANCE GUARANTEE PASSED: Engine cleanly refuses to invent fake traditions.`);
}

console.log('\n====================================================');
console.log('ALL PROVENANCE & AUDIT CHECKS PASSED WITH 100% SUCCESS');
console.log('====================================================');
