import assert from 'assert';
import { MockDreamAnalysisProvider } from '../services/analysis/MockDreamAnalysisProvider';
import { MultilingualSafetyFilter } from '../services/i18n/multilingualSafety';
import { enTranslations } from '../services/i18n/translations/en';
import { teTranslations } from '../services/i18n/translations/te';
import { taTranslations } from '../services/i18n/translations/ta';
import { hiTranslations } from '../services/i18n/translations/hi';
import { normalizeDreamInput } from '../domain/dream/DreamInput';
import type { DreamSubmission } from '../types/dream';
import type { LanguageCode } from '../services/i18n/types';

/**
 * STEP 8: MULTILINGUAL SUPPORT & TRANSLATION TEST SUITE
 * 
 * Verifies multilingual capabilities for English, Telugu (తెలుగు), Tamil (தமிழ்), and Hindi (हिन्दी):
 * 1. Translation dictionary completeness across all 4 languages.
 * 2. Natural conversational AI generation in each language (3-4 short lines).
 * 3. Multilingual safety filter preventing frightening predictions across all 4 languages.
 * 4. Artwork visual detail and prompt preservation across all languages.
 */

async function runMultilingualSupportTests() {
  console.log('====================================================');
  console.log('SOMNITHOS STEP 8: MULTILINGUAL SUPPORT & SAFETY TESTS');
  console.log('====================================================\n');

  const provider = new MockDreamAnalysisProvider();
  const BENCHMARK_DREAM_TEXT = 'I was walking through a forest at night. I felt scared, but then I saw a warm light and felt calm.';

  const createSubmission = (lang: LanguageCode): DreamSubmission => ({
    id: `sub-test-${lang}`,
    title: 'Benchmark Forest Dream',
    description: BENCHMARK_DREAM_TEXT,
    emotions: ['Fear', 'Peace'],
    symbolsAndObjects: ['forest', 'light', 'night'],
    location: 'Forest at night',
    colors: ['gold', 'dark green'],
    privacy: 'private',
    createdAt: new Date().toISOString(),
    language: lang,
    targetLanguage: lang
  });

  // ----------------------------------------------------
  // TEST 1: Dictionary Completeness
  // ----------------------------------------------------
  console.log('--- 1. Verification of Translation Dictionaries (EN, TE, TA, HI) ---');
  const dictionaries = {
    en: enTranslations,
    te: teTranslations,
    ta: taTranslations,
    hi: hiTranslations
  };
  const langs: LanguageCode[] = ['en', 'te', 'ta', 'hi'];

  langs.forEach(lang => {
    const dict = dictionaries[lang];
    assert.ok(dict.common.somnithosPill, `Missing somnithosPill in ${lang}`);
    assert.ok(dict.common.newDream, `Missing newDream in ${lang}`);
    assert.ok(dict.steps.step1, `Missing step1 in ${lang}`);
    assert.ok(dict.steps.step2, `Missing step2 in ${lang}`);
    assert.ok(dict.steps.step3, `Missing step3 in ${lang}`);
    assert.ok(dict.steps.step4, `Missing step4 in ${lang}`);
    assert.ok(dict.stage1.eyebrow, `Missing stage1 eyebrow in ${lang}`);
    assert.ok(dict.stage2.heading, `Missing stage2 heading in ${lang}`);
    assert.ok(dict.stage3.heading, `Missing stage3 heading in ${lang}`);
    assert.ok(dict.stage4.heading, `Missing stage4 heading in ${lang}`);
    assert.ok(dict.exploreMore.title, `Missing exploreMore title in ${lang}`);
    assert.ok(dict.modals.researchHeader, `Missing modals researchHeader in ${lang}`);
    assert.ok(dict.modals.beliefsHeader, `Missing modals beliefsHeader in ${lang}`);
    assert.ok(dict.modals.astrologyHeader, `Missing modals astrologyHeader in ${lang}`);
    assert.ok(dict.modals.patternsHeader, `Missing modals patternsHeader in ${lang}`);
  });
  console.log('✓ PASS: All 4 language dictionaries contain complete, valid string sets\n');

  // ----------------------------------------------------
  // TEST 2: English Conversational Response
  // ----------------------------------------------------
  console.log('--- 2. English Natural Response & 3-4 Line Length ---');
  const enRes = provider.analyzeDream(normalizeDreamInput(createSubmission('en')));
  assert.ok(enRes.extractedFeatures.meaningfulHighlights && enRes.extractedFeatures.meaningfulHighlights.length >= 3);
  const enLines = (enRes.simpleReflection || '').split('\n').filter(Boolean);
  assert.ok(enLines.length >= 3 && enLines.length <= 4, `Expected 3-4 lines in English, got ${enLines.length}`);
  assert.match(enRes.simpleReflection || '', /(You may|This could|One possible way|You might)/i);
  console.log('✓ PASS: English reflection generated in 3-4 simple lines with gentle phrasing\n');

  // ----------------------------------------------------
  // TEST 3: Telugu Conversational Response
  // ----------------------------------------------------
  console.log('--- 3. Telugu (తెలుగు) Natural Response & 3-4 Line Length ---');
  const teRes = provider.analyzeDream(normalizeDreamInput(createSubmission('te')));
  assert.ok(teRes.extractedFeatures.meaningfulHighlights && teRes.extractedFeatures.meaningfulHighlights.length >= 3);
  const teLines = (teRes.simpleReflection || '').split('\n').filter(Boolean);
  assert.ok(teLines.length >= 3 && teLines.length <= 4, `Expected 3-4 lines in Telugu, got ${teLines.length}`);
  assert.match(teRes.simpleReflection || '', /(దృక్కోణం|అనిపించవచ్చు|సూచించవచ్చు|తోడ్పడుతుంది|ఆలోచించవచ్చు)/);
  console.log('✓ PASS: Telugu reflection generated in natural conversational Telugu with 3-4 lines\n');

  // ----------------------------------------------------
  // TEST 4: Tamil Conversational Response
  // ----------------------------------------------------
  console.log('--- 4. Tamil (தமிழ்) Natural Response & 3-4 Line Length ---');
  const taRes = provider.analyzeDream(normalizeDreamInput(createSubmission('ta')));
  assert.ok(taRes.extractedFeatures.meaningfulHighlights && taRes.extractedFeatures.meaningfulHighlights.length >= 3);
  const taLines = (taRes.simpleReflection || '').split('\n').filter(Boolean);
  assert.ok(taLines.length >= 3 && taLines.length <= 4, `Expected 3-4 lines in Tamil, got ${taLines.length}`);
  assert.match(taRes.simpleReflection || '', /(பார்வை|இருக்கலாம்|காட்டக்கூடும்|உதவக்கூடும்|சிந்திக்கலாம்)/);
  console.log('✓ PASS: Tamil reflection generated in natural conversational Tamil with 3-4 lines\n');

  // ----------------------------------------------------
  // TEST 5: Hindi Conversational Response
  // ----------------------------------------------------
  console.log('--- 5. Hindi (हिन्दी) Natural Response & 3-4 Line Length ---');
  const hiRes = provider.analyzeDream(normalizeDreamInput(createSubmission('hi')));
  assert.ok(hiRes.extractedFeatures.meaningfulHighlights && hiRes.extractedFeatures.meaningfulHighlights.length >= 3);
  const hiLines = (hiRes.simpleReflection || '').split('\n').filter(Boolean);
  assert.ok(hiLines.length >= 3 && hiLines.length <= 4, `Expected 3-4 lines in Hindi, got ${hiLines.length}`);
  assert.match(hiRes.simpleReflection || '', /(नजरिया|हो सकता है|दर्शाता है|मददगार|सोच सकते हैं)/);
  console.log('✓ PASS: Hindi reflection generated in natural conversational Hindi with 3-4 lines\n');

  // ----------------------------------------------------
  // TEST 6: Artwork Visual Detail Preservation Across Languages
  // ----------------------------------------------------
  console.log('--- 6. Artwork Visual Detail Preservation Across Languages ---');
  const allResults = langs.map(l => provider.analyzeDream(normalizeDreamInput(createSubmission(l))));
  allResults.forEach(res => {
    assert.ok(res.artworkPrompt);
    assert.ok(res.artworkPrompt.promptText.length > 0);
    assert.ok(res.extractedFeatures.setting.length > 0 || res.extractedFeatures.dominantMotifs.length > 0);
    assert.ok(res.extractedFeatures.detectedColors.length > 0);
  });
  console.log('✓ PASS: Visual attributes and artwork specifications faithfully preserved across all 4 languages\n');

  // ----------------------------------------------------
  // TEST 7: Multilingual Safety Filtering
  // ----------------------------------------------------
  console.log('--- 7. Multilingual Safety Filtering (EN, TE, TA, HI) ---');
  // EN
  const enUnsafe = 'This dream predicts you will die tomorrow and encounter fatal illness.';
  const enSafe = MultilingualSafetyFilter.sanitize(enUnsafe);
  assert.ok(!enSafe.includes('you will die'));
  assert.ok(enSafe.includes('a moment of emotional intensity'));

  // TE
  const teUnsafe = 'ఈ కల ద్వారా మీకు మరణం సంభవిస్తుంది మరియు విపత్తు జరగబోతోంది.';
  const teSafe = MultilingualSafetyFilter.sanitize(teUnsafe);
  assert.ok(!teSafe.includes('మరణం సంభవిస్తుంది'));
  assert.ok(teSafe.includes('తీవ్రమైన మానసిక భావనల అనుభవం'));

  // TA
  const taUnsafe = 'இந்த கனவு உங்களுக்கு மரணம் நிகழும் என்று கூறுகிறது.';
  const taSafe = MultilingualSafetyFilter.sanitize(taUnsafe);
  assert.ok(!taSafe.includes('மரணம் நிகழும்'));
  assert.ok(taSafe.includes('ஆழ்ந்த மன உணர்வுகளின் வெளிப்பாடு'));

  // HI
  const hiUnsafe = 'यह सपना भविष्यवाणी करता है कि आपकी मृत्यु होगी और विनाश होने वाला है।';
  const hiSafe = MultilingualSafetyFilter.sanitize(hiUnsafe);
  assert.ok(!hiSafe.includes('आपकी मृत्यु होगी'));
  assert.ok(hiSafe.includes('गहरी आंतरिक भावनाओं का अनुभव'));
  console.log('✓ PASS: Multilingual safety filter neutralizes frightening predictions in all 4 languages\n');

  console.log('====================================================');
  console.log('ALL MULTILINGUAL SUPPORT & SAFETY TESTS PASSED (100%)');
  console.log('====================================================\n');
}

runMultilingualSupportTests().catch(err => {
  console.error('Multilingual tests failed:', err);
  process.exit(1);
});
