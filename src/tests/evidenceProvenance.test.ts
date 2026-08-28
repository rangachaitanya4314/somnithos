import { SourceVerifierService } from '../services/evidence/SourceVerifierService';
import { EvidenceRetrieverService } from '../services/evidence/EvidenceRetrieverService';
import { MockEvidenceSearchProvider } from '../services/evidence/MockEvidenceSearchProvider';
import { MockDreamAnalysisProvider } from '../services/analysis/MockDreamAnalysisProvider';
import { MOCK_EVIDENCE_RECORDS } from '../data/mock/mockEvidenceData';
import { MOCK_RESEARCH_RECORDS } from '../data/mock/mockResearchData';
import type { EvidenceRecord } from '../domain/evidence/EvidenceRecord';
import type { DreamInput } from '../domain/dream/DreamInput';

/**
 * STEP 2: EVIDENCE RETRIEVAL & PROVENANCE ENGINE TEST SUITE
 * 
 * Verifies all 10 core requirements:
 * 1. A verified source can support a claim.
 * 2. A source that does not support the claim is rejected.
 * 3. Missing source returns NO_RELIABLE_SOURCE.
 * 4. Narrow cultural evidence does not become a broad regional claim.
 * 5. Conflicting sources become CONTESTED.
 * 6. Research findings remain separate from interpretation.
 * 7. Source provenance survives the entire pipeline.
 * 8. A modern secondary source is not mislabeled as a primary historical source.
 * 9. An AI-generated statement cannot become evidence without a source.
 * 10. A universal symbol meaning cannot be generated as a factual claim.
 */

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    throw new Error(`Test failed: ${testName}`);
  }
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('SOMNITHOS STEP 2: EVIDENCE & PROVENANCE ENGINE TESTS');
  console.log('====================================================\n');

  const verifier = new SourceVerifierService();
  const retriever = new EvidenceRetrieverService();
  const searchProvider = new MockEvidenceSearchProvider();
  const dreamProvider = new MockDreamAnalysisProvider();

  // ----------------------------------------------------
  // TEST 1: A verified source can support a claim
  // ----------------------------------------------------
  console.log('--- 1. Verified Source Supports a Claim ---');
  const waterSource = MOCK_EVIDENCE_RECORDS.find(r => r.motif === 'water')!;
  const sourceVerification = verifier.verifySource(waterSource);
  assert(sourceVerification.isValid === true, 'Water source passes strict metadata verification');
  assert(sourceVerification.isPrimaryOrScholarly === true, 'Water source is recognized as primary/scholarly tier');

  const claimResult = verifier.verifyClaim(waterSource.claim, 'water', [waterSource]);
  assert(claimResult.supportStatus === 'SUPPORTED', 'Claim backed by verified manuscript has SUPPORTED status');
  assert(claimResult.confidence >= 0.9, 'Claim confidence is >= 0.9');
  assert(claimResult.provenance.nodes.length === 1, 'Provenance node is populated with manuscript metadata');
  assert(claimResult.provenance.nodes[0].sourceTitle.includes('Papyrus Chester Beatty III'), 'Provenance links to Papyrus Chester Beatty III');

  // ----------------------------------------------------
  // TEST 2: A source that does not support the claim is rejected
  // ----------------------------------------------------
  console.log('\n--- 2. Source Rejection & Failure Handling ---');
  const invalidSource: EvidenceRecord = {
    ...waterSource,
    id: 'invalid-source-99',
    supportingExcerpt: '',
    supportingEvidence: '',
    source: {
      ...waterSource.source,
      supportingPassage: ''
    }
  };
  const invalidVerification = verifier.verifySource(invalidSource);
  assert(invalidVerification.isValid === false, 'Source lacking supporting excerpt is rejected as invalid');
  assert(invalidVerification.errors.some(e => e.includes('direct supporting translation')), 'Flags missing supporting passage error');

  const rejectedClaim = verifier.verifyClaim('Arbitrary unsupported statement', 'water', [invalidSource]);
  assert(rejectedClaim.supportStatus === 'INSUFFICIENT_EVIDENCE', 'Claim with invalid source returns INSUFFICIENT_EVIDENCE');

  // ----------------------------------------------------
  // TEST 3: Missing source returns NO_RELIABLE_SOURCE
  // ----------------------------------------------------
  console.log('\n--- 3. Missing Source Fallback (NO_RELIABLE_SOURCE) ---');
  const missingClaim = verifier.verifyClaim('Dreams of tachyon lasers mean cosmic energy', 'tachyon', []);
  assert(missingClaim.supportStatus === 'NO_RELIABLE_SOURCE', 'Empty sources return NO_RELIABLE_SOURCE');
  assert(missingClaim.confidence === 0, 'Confidence is 0 for ungrounded claims');
  assert(missingClaim.explanation.includes('No sufficiently reliable source'), 'Returns explicit fallback explanation');

  const gapClaims = retriever.findSupportingClaims(['quantum_computer', 'tachyon']);
  assert(gapClaims.length === 2, 'Returns gap claim records for modern/ungrounded symbols');
  assert(gapClaims.every(c => c.supportStatus === 'NO_RELIABLE_SOURCE'), 'All gap claims have NO_RELIABLE_SOURCE status');

  // ----------------------------------------------------
  // TEST 4: Narrow cultural evidence does not become a broad regional claim
  // ----------------------------------------------------
  console.log('\n--- 4. Cultural Precision & Scope Preservation ---');
  const vedicRecord = MOCK_EVIDENCE_RECORDS.find(r => r.id === 'claim-vedic-state-01')!;
  assert(!vedicRecord.culturalTradition?.includes('All Eastern Philosophy'), 'Does not use vague pan-regional labels');
  assert(vedicRecord.exactTradition === 'Classical Upanishadic Epistemic Oneirology', 'Preserves exact Upanishadic epistemic tradition');
  assert(vedicRecord.communityOrSchool.includes('Brahmavadin'), 'Preserves specific Brahmavadin philosophical school');
  assert(vedicRecord.geographicContext.includes('Videha & Kuru-Pancala'), 'Preserves specific geographic kingdoms');

  const snakeRecord = MOCK_EVIDENCE_RECORDS.find(r => r.id === 'claim-meso-snake-01')!;
  assert(snakeRecord.exactTradition === 'Assyro-Babylonian Royal Oneiromantic Series (Iškar Zaqīqu)', 'Snake record specifies exact Assyro-Babylonian series');
  assert(snakeRecord.communityOrSchool.includes('Neo-Assyrian Court Diviners'), 'Specifies court diviner community');

  // ----------------------------------------------------
  // TEST 5: Conflicting sources become CONTESTED
  // ----------------------------------------------------
  console.log('\n--- 5. Conflicting Credible Sources Become CONTESTED ---');
  const favorableWater: EvidenceRecord = {
    ...waterSource,
    id: 'favorable-water-test',
    claim: 'Drinking clear water is cataloged as a favorable omen of life sustenance.'
  };
  const unfavorableWater: EvidenceRecord = {
    ...waterSource,
    id: 'unfavorable-water-test',
    claim: 'Looking into dark deep water is cataloged as an unfavorable omen of adversity and misfortune.'
  };
  const contestedResult = verifier.verifyClaim('Water in dreams', 'water', [favorableWater, unfavorableWater]);
  assert(contestedResult.supportStatus === 'CONTESTED', 'Conflicting polarities on water mark claim as CONTESTED');
  assert(contestedResult.provenance.isContested === true, 'Provenance chain is flagged as contested');
  assert(contestedResult.provenance.nodes.length === 2, 'Preserves both conflicting sources in provenance chain');

  // ----------------------------------------------------
  // TEST 6: Research findings remain separate from interpretation
  // ----------------------------------------------------
  console.log('\n--- 6. Research Findings Separation & Safeguards ---');
  const tstRecord = MOCK_RESEARCH_RECORDS.find(r => r.id === 'psy-tst-revonsuo')!;
  assert(tstRecord.sourceTier === 'TIER_2', 'Research record belongs to Tier 2 peer-reviewed science');
  assert(tstRecord.nonDiagnosticDisclaimer.includes('not indicate personal anxiety disorder or pathology'), 'Enforces non-diagnostic clinical disclaimer');
  assert(!tstRecord.summary.includes('therefore your dream predicts'), 'Does not convert empirical hypothesis into universal omen');

  const matchedResearch = retriever.searchResearch(['chased', 'fear']);
  assert(matchedResearch.length > 0, 'Retrieves threat simulation research for threat themes');
  assert(matchedResearch.some(m => m.researchRecord.conceptName.includes('Threat Simulation Theory')), 'Finds TST model');

  // ----------------------------------------------------
  // TEST 7: Source provenance survives the entire pipeline
  // ----------------------------------------------------
  console.log('\n--- 7. End-to-End Pipeline Provenance Preservation ---');
  const dreamInput: DreamInput = {
    narrative: 'I was standing before a massive carved wooden door leading into a quiet forest.',
    emotions: ['wonder', 'peace'],
    setting: 'forest, doorway'
  };
  const analysis = dreamProvider.analyzeDream(dreamInput);
  assert(analysis.claims !== undefined && analysis.claims.length > 0, 'Analysis attaches discrete ClaimRecord objects');
  
  const doorClaim = analysis.claims?.find(c => c.motif === 'doors');
  assert(doorClaim !== undefined, 'Found door motif claim record in analysis output');
  assert(doorClaim?.supportStatus === 'SUPPORTED', 'Door claim is SUPPORTED by verified manuscripts');
  assert(doorClaim?.provenance !== undefined, 'Door claim retains provenance chain');
  assert(doorClaim?.provenance.nodes.length! >= 1, 'Door claim has verified provenance nodes');
  assert(doorClaim?.culturalContext?.specificCommunity !== undefined, 'Door claim preserves specific community context');

  // ----------------------------------------------------
  // TEST 8: Modern secondary source is not mislabeled as primary historical source
  // ----------------------------------------------------
  console.log('\n--- 8. Source Tier Integrity & Misclassification Prevention ---');
  const tier5Source: EvidenceRecord = {
    ...waterSource,
    id: 'tier-5-test-source',
    sourceTier: 'TIER_5',
    source: {
      ...waterSource.source,
      sourceTier: 'TIER_5'
    }
  };
  const tier5Verification = verifier.verifySource(tier5Source);
  assert(tier5Verification.isValid === false, 'Tier 5 web source is rejected from serving as factual evidence');
  assert(tier5Verification.isPrimaryOrScholarly === false, 'Tier 5 is not marked as primary or scholarly');

  // ----------------------------------------------------
  // TEST 9: AI-generated statement cannot become evidence without a source
  // ----------------------------------------------------
  console.log('\n--- 9. Prohibition of AI Hallucinations as Evidence ---');
  const aiGeneratedClaim = verifier.verifyClaim(
    'Ancient traditions in 5000 BCE believed that flying represents spiritual ascension over machines.',
    'flying',
    [] // No verified source
  );
  assert(aiGeneratedClaim.supportStatus === 'NO_RELIABLE_SOURCE', 'AI statement without verified source is assigned NO_RELIABLE_SOURCE');
  assert(aiGeneratedClaim.supportingSources.length === 0, 'No supporting sources attached');

  // ----------------------------------------------------
  // TEST 10: Universal symbol dictionary is rejected as factual truth
  // ----------------------------------------------------
  console.log('\n--- 10. Rejection of Universal Symbol Dictionaries ---');
  for (const record of MOCK_EVIDENCE_RECORDS) {
    assert(record.isSymbolMeaningUniversal === false, `Symbol record ${record.id} confirms meaning is contingent, not universal`);
  }

  // ----------------------------------------------------
  // Search Provider Adapter Tests
  // ----------------------------------------------------
  console.log('\n--- 11. Search Adapter Provider Tests ---');
  const searchResults = await searchProvider.search('Artemidorus');
  assert(searchResults.length > 0, 'Search provider finds records matching Artemidorus');
  assert(Boolean(searchResults[0]?.evidenceRecord?.sourceTitle?.includes('Oneirocritica') || searchResults[0]?.evidenceRecord?.source?.sourceTitle?.includes('Oneirocritica')), 'Found Oneirocritica source');

  const retrievedSource = await searchProvider.getSource('claim-eg-water-01');
  assert(retrievedSource !== undefined, 'Search provider retrieves source by ID');

  console.log('\n====================================================');
  console.log(`ALL ${passedTests} / ${totalTests} STEP 2 PROVENANCE TESTS PASSED (100%)`);
  console.log('====================================================\n');
}

runTestSuite().catch(err => {
  console.error('Test execution error:', err);
  if (typeof process !== 'undefined' && process?.exit) {
    process.exit(1);
  }
});
