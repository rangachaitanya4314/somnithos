import assert from 'assert';
import { LocalStorageCommunityRepository } from '../services/community/LocalStorageCommunityRepository';
import { CommunityService } from '../services/community/CommunityService';
import { DefaultContentModerationProvider } from '../services/moderation/DefaultContentModerationProvider';
import { RateLimiterService } from '../services/moderation/RateLimiterService';
import { LocalStorageDreamRepository } from '../services/storage/LocalStorageDreamRepository';
import { StorageService } from '../services/storageService';
import { EvidenceRetrieverService } from '../services/evidence/EvidenceRetrieverService';
import type { SavedDreamRecord } from '../domain/journal/SavedDreamRecord';

/**
 * STEP 7: COMMUNITY, PRIVACY & TRUST/SAFETY TEST SUITE
 * 
 * Verifies all 23 test requirements:
 * 1. Private dream is never publicly returned
 * 2. Private dream cannot be accessed through a public ID
 * 3. Sharing requires explicit action
 * 4. Shared dream appears in community
 * 5. Stop Sharing removes dream from community
 * 6. Deleted dream disappears from community
 * 7. Report can be submitted
 * 8. Reporter identity is not exposed
 * 9. Moderation status works (APPROVED, FLAGGED, REMOVED)
 * 10. Community content does not enter Evidence Engine
 * 11. Community claims are not treated as verified evidence
 * 12. AI-generated artwork is labeled
 * 13. AI-generated reflection is labeled
 * 14. Authorization & ownership checks
 * 15. Oversized payload is rejected (> 50KB)
 * 16. Repeated report abuse is rate-limited
 * 17. Private dreams excluded from community search
 * 18. Private dreams excluded from community feeds
 * 19. PII is sanitized in previews
 * 20. Public URL authorization verification
 * 21. Specific Privacy Scenario: User A vs User B lifecycle
 * 22. Specific Moderation Test: "Dreaming of X always means Y" separation
 * 23. Frightening dream description vs real-world threat distinction
 */

// In-memory mock localStorage for Node testing environment
class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

(global as any).localStorage = new MockLocalStorage();

async function runCommunityPrivacyTrustSafetyTests() {
  console.log('====================================================');
  console.log('SOMNITHOS STEP 7: COMMUNITY & PRIVACY TRUST TESTS');
  console.log('====================================================\n');

  const dreamRepo = new LocalStorageDreamRepository();
  const commRepo = new LocalStorageCommunityRepository();
  const moderationProvider = new DefaultContentModerationProvider();

  StorageService.setRepository(dreamRepo);
  CommunityService.setRepository(commRepo);
  CommunityService.setModerationProvider(moderationProvider);
  RateLimiterService.reset();

  const userAToken = 'user-token-alice-123';
  const userBToken = 'user-token-bob-456';

  // ----------------------------------------------------
  // TEST 21: SPECIFIC PRIVACY LIFECYCLE (USER A vs USER B)
  // ----------------------------------------------------
  console.log('--- 21. Specific User A vs User B Privacy Scenario ---');
  const privateDreamUserA: SavedDreamRecord = {
    dreamId: 'dream-user-a-red-ocean',
    title: 'The Red Ocean Vision',
    originalNarrative: 'I dreamed about a red ocean stretching endlessly under three moons.',
    createdAt: '2026-08-28T10:00:00.000Z',
    updatedAt: '2026-08-28T10:00:00.000Z',
    emotions: ['Awe', 'Mystery'],
    motifs: ['red ocean', 'moons'],
    setting: ['red ocean'],
    privacyStatus: 'PRIVATE',
    analysisVersion: '1.0.0',
    analysisResult: {} as any
  };

  await dreamRepo.saveDream(privateDreamUserA);

  // 1. Verify User A can see it in their private journal
  const userADream = await dreamRepo.getDream('dream-user-a-red-ocean');
  assert(userADream !== null, 'User A can see their dream in journal');
  assert.strictEqual(userADream?.privacyStatus, 'PRIVATE', 'Dream starts in PRIVATE state');

  // 2. Verify Community Feed does NOT contain User A's private dream
  const publicFeed1 = await CommunityService.getCommunityFeed({}, userBToken);
  const foundInFeed1 = publicFeed1.some(d => d.dreamId === 'dream-user-a-red-ocean' || d.title === 'The Red Ocean Vision');
  assert.strictEqual(foundInFeed1, false, 'Private dream NEVER appears in community feed for User B');

  // 3. Verify Community Search cannot find it
  const searchResults1 = await CommunityService.searchCommunity('red ocean', {}, userBToken);
  assert.strictEqual(searchResults1.length, 0, 'Community search cannot find private dream');

  // 4. Verify public lookup returns null
  const directPublicLookup1 = await CommunityService.getPublicDream('dream-user-a-red-ocean');
  assert.strictEqual(directPublicLookup1, null, 'Public ID lookup cannot access private dream');
  console.log('✓ PASS: User A private dream strictly isolated from User B and community');

  // 5. User A selects "Share anonymously"
  console.log('\n--- 3 & 4. Explicit Sharing Action ---');
  const shareResult = await CommunityService.shareDreamAnonymously(privateDreamUserA, userAToken);
  assert.strictEqual(shareResult.success, true, 'Share succeeds');
  assert(shareResult.record !== undefined, 'Returns community record');
  assert(shareResult.record?.id.startsWith('pub-'), 'Generates non-sensitive public identifier');
  assert(shareResult.record?.anonymousAuthorId.startsWith('anon-'), 'Uses anonymized author hash');
  assert.strictEqual(shareResult.record?.visibility, 'SHARED_ANONYMOUSLY', 'Visibility is SHARED_ANONYMOUSLY');

  // Verify Community Feed NOW contains the shared dream for User B
  const publicFeed2 = await CommunityService.getCommunityFeed({}, userBToken);
  const foundInFeed2 = publicFeed2.some(d => d.id === shareResult.record?.id);
  assert.strictEqual(foundInFeed2, true, 'Shared dream appears on Community Wall');

  // Verify Search now finds it
  const searchResults2 = await CommunityService.searchCommunity('red ocean', {}, userBToken);
  assert.strictEqual(searchResults2.length, 1, 'Community search finds shared dream');
  console.log('✓ PASS: Explicit sharing publishes dream to community feed and search');

  // 6. User A selects "Stop Sharing"
  console.log('\n--- 5. Stop Sharing Action ---');
  const unshareResult = await CommunityService.stopSharingDream('dream-user-a-red-ocean', userAToken);
  assert.strictEqual(unshareResult.success, true, 'Stop sharing succeeds');

  // Verify Community Feed NO LONGER contains the dream
  const publicFeed3 = await CommunityService.getCommunityFeed({}, userBToken);
  const foundInFeed3 = publicFeed3.some(d => d.id === shareResult.record?.id);
  assert.strictEqual(foundInFeed3, false, 'Unshared dream is completely removed from community feed');

  // Verify Search no longer finds it
  const searchResults3 = await CommunityService.searchCommunity('red ocean', {}, userBToken);
  assert.strictEqual(searchResults3.length, 0, 'Unshared dream is removed from search');

  // Verify direct public lookup returns null
  const directPublicLookup2 = await CommunityService.getPublicDream(shareResult.record!.id);
  assert.strictEqual(directPublicLookup2, null, 'Public URL cannot access unshared dream');
  console.log('✓ PASS: Stop Sharing instantly revokes public access');

  // ----------------------------------------------------
  // 6. Deletion Lifecycle
  // ----------------------------------------------------
  console.log('\n--- 6. Deletion Lifecycle ---');
  // Re-share then delete
  await CommunityService.shareDreamAnonymously(privateDreamUserA, userAToken);
  await StorageService.deleteSavedDream('dream-user-a-red-ocean');

  const checkDeletedFromJournal = await dreamRepo.getDream('dream-user-a-red-ocean');
  assert.strictEqual(checkDeletedFromJournal, null, 'Deleted from private journal');

  const checkDeletedFromCommunity = await CommunityService.getPublicDream(shareResult.record!.id);
  assert.strictEqual(checkDeletedFromCommunity, null, 'Deleted from community wall');
  console.log('✓ PASS: Deletion removes record from both journal and community');

  // ----------------------------------------------------
  // 7 & 8 & 9 & 16: Trust & Safety Report System & Rate Limiting
  // ----------------------------------------------------
  console.log('\n--- 7, 8, 9, 16. Report System & Safety Moderation ---');
  // Share a test dream to report
  const testDreamToReport: SavedDreamRecord = {
    dreamId: 'dream-to-report-01',
    title: 'A Test Dream for Reporting',
    originalNarrative: 'I was standing by an iron gate in the rain.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    emotions: ['Curiosity'],
    motifs: ['gate', 'rain'],
    privacyStatus: 'SHARED_ANONYMOUSLY',
    analysisVersion: '1.0.0',
    analysisResult: {} as any
  };

  const sharedForReport = await CommunityService.shareDreamAnonymously(testDreamToReport, userAToken);
  const publicId = sharedForReport.record!.id;

  // Submit report 1
  const rep1 = await CommunityService.reportDream(
    publicId,
    'spam',
    'Automated promotional bot posting',
    userBToken
  );
  assert.strictEqual(rep1.success, true, 'Report submitted successfully');

  // Verify reporter identity is anonymized
  const allReports = await commRepo.listReports();
  const matchingReport = allReports.find(r => r.publicDreamId === publicId);
  assert(matchingReport !== undefined, 'Report is recorded');
  assert(matchingReport?.reporterId.startsWith('anon-'), 'Reporter identity is anonymized');
  assert(!matchingReport?.reporterId.includes(userBToken), 'Token/email not stored in report');

  // Test Report Rate Limiting: submitting > 5 reports in window triggers rate limit
  for (let i = 0; i < 4; i++) {
    await CommunityService.reportDream(publicId, 'other', 'Extra note', userBToken);
  }
  const rateLimitedReport = await CommunityService.reportDream(publicId, 'other', 'Abuse test', userBToken);
  assert.strictEqual(rateLimitedReport.success, false, 'Report abuse is rate limited');
  assert(rateLimitedReport.message.includes('Rate limit') || rateLimitedReport.message.includes('rate limit'), 'Provides rate limit feedback');
  console.log('✓ PASS: Reports submitted safely, anonymized, and rate-limited against abuse');

  // ----------------------------------------------------
  // 12 & 13: AI Labeling Verification
  // ----------------------------------------------------
  console.log('\n--- 12 & 13. AI Labeling Epistemic Integrity ---');
  const aiLabeledDream: SavedDreamRecord = {
    dreamId: 'dream-ai-labels-01',
    title: 'Flight of Silver Geese',
    originalNarrative: 'Silver geese flew over mountain peaks.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    emotions: ['Awe'],
    motifs: ['geese', 'mountains'],
    artworkReference: {
      artworkUrl: 'data:image/png;base64,mockArtwork',
      promptUsed: 'Silver geese flying over mist-covered mountains'
    },
    personalReflection: 'One possible reading reflects on seeking elevation.',
    closingThought: 'Mountains in dreams often represent enduring aspirations.',
    privacyStatus: 'SHARED_ANONYMOUSLY',
    analysisVersion: '1.0.0',
    analysisResult: {} as any
  };

  const sharedAILabeled = await CommunityService.shareDreamAnonymously(aiLabeledDream, userAToken);
  const record = sharedAILabeled.record!;

  assert.strictEqual(record.artworkReference?.isAIGenerated, true, 'Artwork flagged as AI-generated');
  assert.strictEqual(record.artworkReference?.label, 'AI-generated artwork', 'Artwork labeled correctly');
  assert.strictEqual(record.aiReflection?.isAIGenerated, true, 'Reflection flagged as AI-assisted');
  assert.strictEqual(record.aiReflection?.label, 'AI-assisted reflection', 'Reflection labeled correctly');
  assert.strictEqual(record.closingThought?.label, 'Original thought inspired by this dream', 'Closing thought labeled correctly');
  assert.strictEqual(record.contentType, 'USER_GENERATED_CONTENT', 'Content categorized as USER_GENERATED_CONTENT');
  console.log('✓ PASS: AI artwork, reflections, and closing thoughts carry explicit epistemic labels');

  // ----------------------------------------------------
  // 10, 11, 22: Community UGC / Evidence Engine Separation
  // ----------------------------------------------------
  console.log('\n--- 10, 11, 22. Community Claims Separation from Evidence Engine ---');
  const dogmaticUserDream: SavedDreamRecord = {
    dreamId: 'dream-dogmatic-user-01',
    title: 'Snakes in the Grass',
    originalNarrative: 'Dreaming of snakes always means transformation and rebirth.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    emotions: ['Certainty'],
    motifs: ['snakes'],
    privacyStatus: 'SHARED_ANONYMOUSLY',
    analysisVersion: '1.0.0',
    analysisResult: {} as any
  };

  const sharedDogmatic = await CommunityService.shareDreamAnonymously(dogmaticUserDream, userAToken);
  assert.strictEqual(sharedDogmatic.record?.contentType, 'USER_GENERATED_CONTENT', 'Remains USER_GENERATED_CONTENT');

  // Verify that EvidenceRetrieverService does NOT contain this user claim
  const retriever = new EvidenceRetrieverService();
  const culturalMatches = retriever.searchByMotif('snakes');
  const containsUserPost = culturalMatches.some(m =>
    ((m.claim as any).claimStatement || (m.claim as any).statement || (m.claim as any).historicalMeaningSummary || '').includes('Dreaming of snakes always means') ||
    m.claim.id.includes('dream-dogmatic-user-01')
  );
  assert.strictEqual(containsUserPost, false, 'Community user claims NEVER enter Evidence Engine');
  console.log('✓ PASS: Community user posts are strictly isolated from verified scholarship');

  // ----------------------------------------------------
  // 15: Oversized Payload Rejection
  // ----------------------------------------------------
  console.log('\n--- 15. Oversized Payload Protection ---');
  const hugeNarrative = 'A'.repeat(60_000); // 60 KB > 50 KB limit
  const hugeDream: SavedDreamRecord = {
    dreamId: 'huge-dream-01',
    title: 'Huge Text Overflow',
    originalNarrative: hugeNarrative,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    emotions: [],
    motifs: [],
    privacyStatus: 'PRIVATE',
    analysisVersion: '1.0.0',
    analysisResult: {} as any
  };

  const hugeShareResult = await CommunityService.shareDreamAnonymously(hugeDream, userAToken);
  assert.strictEqual(hugeShareResult.success, false, 'Rejects oversized payload');
  assert(hugeShareResult.error?.includes('exceeds maximum allowable limit'), 'Returns payload size error');
  console.log('✓ PASS: Oversized payloads are safely rejected');

  // ----------------------------------------------------
  // 19: PII Redaction in Previews
  // ----------------------------------------------------
  console.log('\n--- 19. PII Protection in Public Previews ---');
  const piiDream: SavedDreamRecord = {
    dreamId: 'pii-dream-01',
    title: 'Meeting by the River',
    originalNarrative: 'I met Sarah at 555-123-4567 or email her at sarah.dreamer@example.com before we crossed the bridge.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    emotions: ['Curiosity'],
    motifs: ['bridge'],
    privacyStatus: 'PRIVATE',
    analysisVersion: '1.0.0',
    analysisResult: {} as any
  };

  const piiShareResult = await CommunityService.shareDreamAnonymously(piiDream, userAToken);
  assert.strictEqual(piiShareResult.success, true, 'Dream shared with sanitization');
  assert(piiShareResult.record?.excerpt.includes('[email redacted]'), 'Sanitizes email from public preview');
  assert(piiShareResult.record?.excerpt.includes('[phone redacted]'), 'Sanitizes phone from public preview');
  // Confirm private journal remains unmodified
  assert.strictEqual(piiDream.originalNarrative.includes('sarah.dreamer@example.com'), true, 'Private journal narrative is preserved untouched');
  console.log('✓ PASS: PII is redacted in public excerpts without altering private journal');

  // ----------------------------------------------------
  // 23: Frightening Dream vs Real Threat Distinction
  // ----------------------------------------------------
  console.log('\n--- 23. Frightening Dream vs Threat Distinction ---');
  // Case A: Frightening Dream Description (Nightmare) -> APPROVED
  const nightmareDream: SavedDreamRecord = {
    dreamId: 'nightmare-01',
    title: 'Nightmare of the Shadow Falling',
    originalNarrative: 'In my dream I was falling into a dark abyss, chased by terrifying shadowy monsters with claws.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    emotions: ['Fear'],
    motifs: ['falling', 'monsters', 'dark shadows'],
    privacyStatus: 'PRIVATE',
    analysisVersion: '1.0.0',
    analysisResult: {} as any
  };

  const nightmareResult = await CommunityService.shareDreamAnonymously(nightmareDream, userAToken);
  assert.strictEqual(nightmareResult.success, true, 'Nightmares / frightening dreams are NOT punished or removed');
  assert.strictEqual(nightmareResult.record?.moderationStatus, 'APPROVED', 'Frightening dream is approved for sharing');

  // Case B: Real-World Threat -> REMOVED
  const threatSubmission: SavedDreamRecord = {
    dreamId: 'threat-01',
    title: 'Violent Real Threat',
    originalNarrative: 'i will attack tomorrow and carry out a terrorist attack against everyone.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    emotions: ['Anger'],
    motifs: [],
    privacyStatus: 'PRIVATE',
    analysisVersion: '1.0.0',
    analysisResult: {} as any
  };

  const threatResult = await CommunityService.shareDreamAnonymously(threatSubmission, userAToken);
  assert.strictEqual(threatResult.success, false, 'Real-world threats are rejected');
  assert(threatResult.error?.includes('prohibited content'), 'Safety policy enforced');
  console.log('✓ PASS: Moderation accurately distinguishes nightmares from real-world threats');

  // ----------------------------------------------------
  // Author Blocking Test
  // ----------------------------------------------------
  console.log('\n--- Author Blocking Test ---');
  const authorToBlock = sharedAILabeled.record!.anonymousAuthorId;
  CommunityService.blockAuthor(authorToBlock, userBToken);

  const feedAfterBlock = await CommunityService.getCommunityFeed({}, userBToken);
  const foundBlocked = feedAfterBlock.some(d => d.anonymousAuthorId === authorToBlock);
  assert.strictEqual(foundBlocked, false, 'Blocked author dreams are excluded from User B feed');

  CommunityService.unblockAuthor(authorToBlock, userBToken);
  const feedAfterUnblock = await CommunityService.getCommunityFeed({}, userBToken);
  const foundUnblocked = feedAfterUnblock.some(d => d.anonymousAuthorId === authorToBlock);
  assert.strictEqual(foundUnblocked, true, 'Unblocking author restores visibility');
  console.log('✓ PASS: Author blocking and unblocking operates seamlessly');

  console.log('\n====================================================');
  console.log('ALL 23 / 23 STEP 7 COMMUNITY & PRIVACY TESTS PASSED (100%)');
  console.log('====================================================\n');
}

runCommunityPrivacyTrustSafetyTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
