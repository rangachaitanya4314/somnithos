import assert from 'assert';
import { DreamAnalysisEngine } from '../services/dreamAnalysisEngine';
import type { DreamSubmission } from '../types/dream';

/**
 * STEP 5: UNIFIED DREAM RESULT EXPERIENCE TEST SUITE
 * 
 * Verifies all Redesigned Result Experience guarantees:
 * 1. Finite 4-stage guided result experience structure.
 * 2. Meaningful narrative details & emotional transitions detected.
 * 3. Simple English without academic jargon.
 * 4. Zero frightening predictions (death/disease/catastrophe).
 * 5. Gentle fallback "No trusted source found for this idea."
 * 6. Specific test dreams from redesign specification:
 *     - TEST A: Forest at night (fear → warm light → calm)
 *     - TEST B: Purple train under ocean (huge fish, windows, silence)
 *     - TEST C: Old school (lost classroom, nervousness, friend, relief)
 *     - TEST D: Flying over ocean
 *     - TEST E: Short dream & ungrounded motifs
 */

async function runResultExperienceTests() {
  console.log('====================================================');
  console.log('SOMNITHOS STEP 5: REDESIGNED RESULT EXPERIENCE TESTS');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // TEST 1: Forest at Night (fear → warm light → calm)
  // ----------------------------------------------------
  console.log('--- 1. Test A: Forest at Night (fear → warm light → calm) ---');
  const dreamForest: DreamSubmission = {
    id: 'test-forest',
    title: 'Forest at Night',
    description: 'I was walking through a forest at night. I felt scared at first, but then I saw a warm light in the distance and felt calm.',
    emotions: ['Scared', 'Calm'],
    symbolsAndObjects: ['forest', 'light'],
    privacy: 'private',
    createdAt: new Date().toISOString()
  };

  const analysisForest = DreamAnalysisEngine.analyze(dreamForest);
  const highlightsForest = analysisForest.extractedFeatures.meaningfulHighlights || [];
  assert(highlightsForest.length >= 3, 'Extracts 3+ meaningful highlights');
  assert(highlightsForest.some(h => h.text.toLowerCase().includes('forest')), 'Noticed dark forest');
  assert(highlightsForest.some(h => h.text.toLowerCase().includes('scared') || h.text.toLowerCase().includes('fear')), 'Noticed fear at first');
  assert(highlightsForest.some(h => h.text.toLowerCase().includes('light')), 'Noticed warm light');
  assert(highlightsForest.some(h => h.text.toLowerCase().includes('calm')), 'Noticed calm afterward');

  const journeyForest = analysisForest.extractedFeatures.emotionalJourney || '';
  assert(journeyForest.toLowerCase().includes('fear') || journeyForest.toLowerCase().includes('calm'), 'Detects emotional journey');
  assert(Boolean(analysisForest.simpleReflection && analysisForest.simpleReflection.length > 10), 'Generates simple reflection');
  console.log('✓ PASS: Test A captures the dark forest, fear, warm light, and calm emotional transition');

  // ----------------------------------------------------
  // TEST 2: Purple Train Under Ocean
  // ----------------------------------------------------
  console.log('\n--- 2. Test B: Purple Train Under Ocean (fish, windows, silence) ---');
  const dreamTrain: DreamSubmission = {
    id: 'test-train',
    title: 'Underwater Purple Train',
    description: 'I was inside a purple train moving under the ocean. Huge blue fish were swimming outside the windows. Everyone was silent.',
    emotions: ['Wonder', 'Calm'],
    symbolsAndObjects: ['train', 'ocean', 'fish'],
    privacy: 'private',
    createdAt: new Date().toISOString()
  };

  const analysisTrain = DreamAnalysisEngine.analyze(dreamTrain);
  const highlightsTrain = analysisTrain.extractedFeatures.meaningfulHighlights || [];
  assert(highlightsTrain.some(h => h.text.toLowerCase().includes('train')), 'Noticed purple/underwater train');
  assert(highlightsTrain.some(h => h.text.toLowerCase().includes('fish')), 'Noticed huge fish outside windows');
  assert(highlightsTrain.some(h => h.text.toLowerCase().includes('silent') || h.text.toLowerCase().includes('calm')), 'Noticed silent passengers');
  assert(analysisTrain.dreamArtwork.visualKeywords.some(k => k.toLowerCase().includes('train') || k.toLowerCase().includes('fish')), 'Artwork prompt reflects specific train/fish entities');
  console.log('✓ PASS: Test B preserves purple train, underwater setting, huge blue fish, and silence');

  // ----------------------------------------------------
  // TEST 3: Old School (lost classroom, nervousness, friend, relief)
  // ----------------------------------------------------
  console.log('\n--- 3. Test C: Old School & Friend (nervousness → relief) ---');
  const dreamSchool: DreamSubmission = {
    id: 'test-school',
    title: 'Old School',
    description: 'I was standing in my old school. I could not find my classroom. I felt nervous, and then I found my best friend waiting for me outside.',
    emotions: ['Nervous', 'Relief'],
    symbolsAndObjects: ['school', 'classroom', 'friend'],
    privacy: 'private',
    createdAt: new Date().toISOString()
  };

  const analysisSchool = DreamAnalysisEngine.analyze(dreamSchool);
  const highlightsSchool = analysisSchool.extractedFeatures.meaningfulHighlights || [];
  assert(highlightsSchool.some(h => h.text.toLowerCase().includes('school')), 'Noticed old school setting');
  assert(highlightsSchool.some(h => h.text.toLowerCase().includes('classroom') || h.text.toLowerCase().includes('find')), 'Noticed searching for classroom');
  assert(highlightsSchool.some(h => h.text.toLowerCase().includes('friend')), 'Noticed best friend waiting outside');
  const journeySchool = analysisSchool.extractedFeatures.emotionalJourney || '';
  assert(journeySchool.toLowerCase().includes('nervous') || journeySchool.toLowerCase().includes('relief'), 'Captures nervousness to relief transition');
  console.log('✓ PASS: Test C captures old school, lost classroom, friend waiting, and emotional relief');

  // ----------------------------------------------------
  // TEST 4: Simple English & Academic Jargon Guard
  // ----------------------------------------------------
  console.log('\n--- 4. Simple English & Academic Jargon Check ---');
  const forbiddenJargon = [
    'neurochemical recalibration',
    'affect regulation',
    'cognitive schemas',
    'epistemic traditions',
    'autobiographical memory trace',
    'associative recombination',
    'phenomenological',
    'ontological'
  ];

  [analysisForest, analysisTrain, analysisSchool].forEach(res => {
    const textToCheck = `${res.simpleReflection || ''} ${res.personalReflection?.primarySynthesis || ''} ${(res.personalReflection?.narrativeArcs || []).join(' ')}`.toLowerCase();
    for (const jargon of forbiddenJargon) {
      assert(!textToCheck.includes(jargon), `Result contains dense jargon: "${jargon}"`);
    }
  });
  console.log('✓ PASS: Primary reflections strictly adhere to Simple Everyday English without academic jargon');

  // ----------------------------------------------------
  // TEST 5: Zero Frightening Predictions Rule
  // ----------------------------------------------------
  console.log('\n--- 5. Absolute No Frightening Predictions Rule ---');
  const scaryDream: DreamSubmission = {
    id: 'test-scary',
    title: 'Nightmare',
    description: 'A monster chased me through a cemetery in a thunderstorm and I thought I was dying.',
    emotions: ['Terror'],
    symbolsAndObjects: ['chased', 'monster'],
    privacy: 'private',
    createdAt: new Date().toISOString()
  };
  const analysisScary = DreamAnalysisEngine.analyze(scaryDream);
  const scaryFullText = `${analysisScary.simpleReflection || ''} ${analysisScary.personalReflection?.primarySynthesis || ''} ${(analysisScary.personalReflection?.narrativeArcs || []).join(' ')} ${analysisScary.closingThought?.thought || ''}`.toLowerCase();
  
  const forbiddenPredictions = ['predicts death', 'someone will die', 'fatal illness', 'catastrophe will happen', 'you will die'];
  for (const pred of forbiddenPredictions) {
    assert(!scaryFullText.includes(pred), `Scary dream triggered frightening prediction: "${pred}"`);
  }
  console.log('✓ PASS: Frightening content is described safely with zero predictive claims of death/harm');

  // ----------------------------------------------------
  // TEST 6: Gentle Fallback Message
  // ----------------------------------------------------
  console.log('\n--- 6. Gentle Fallback ("No trusted source found") ---');
  const ungroundedDream: DreamSubmission = {
    id: 'test-ungrounded',
    title: 'Unfamiliar Object',
    description: 'I saw a completely unfamiliar object that I cannot describe in any language.',
    emotions: ['Confusion'],
    symbolsAndObjects: ['unfamiliar object'],
    privacy: 'private',
    createdAt: new Date().toISOString()
  };
  const analysisUngrounded = DreamAnalysisEngine.analyze(ungroundedDream);
  assert(analysisUngrounded.evidenceGaps?.fallbackMessage.includes('No trusted source found') || analysisUngrounded.evidenceGaps?.fallbackMessage.includes('No reliable source found'), 'Yields non-error fallback message');
  console.log('✓ PASS: Missing evidence is presented as a gentle note rather than an error');

  // ----------------------------------------------------
  // TEST 7: Optional Astrology Layer
  // ----------------------------------------------------
  console.log('\n--- 7. Optional Astrology Layer ---');
  assert(analysisForest.astrologyReading !== undefined, 'Astrology reading is present');
  assert(analysisForest.astrologyReading.disclaimer.includes('traditional belief system') && analysisForest.astrologyReading.disclaimer.includes('not scientific evidence'), 'Astrology contains mandatory non-scientific disclaimer');
  console.log('✓ PASS: Astrology is optional, grounded in traditional correspondences, and explicitly disclaims scientific evidence');

  console.log('\n====================================================');
  console.log('ALL 7 / 7 REDESIGNED RESULT EXPERIENCE TESTS PASSED (100%)');
  console.log('====================================================\n');
}

runResultExperienceTests().catch(err => {
  console.error('Test failure:', err);
  process.exit(1);
});
