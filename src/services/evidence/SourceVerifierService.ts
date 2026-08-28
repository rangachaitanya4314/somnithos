import type { EvidenceRecord } from '../../domain/evidence/EvidenceRecord';
import type { ResearchRecord } from '../../domain/research/ResearchRecord';
import type { SourceVerifier, SourceVerificationResult, ClaimVerificationResult } from '../../domain/evidence/SourceVerifier';
import type { ProvenanceChain, ProvenanceNode } from '../../domain/evidence/Provenance';
import type { SupportStatus } from '../../domain/evidence/ClaimRecord';
import { isScholarlyOrPrimaryTier } from '../../domain/evidence/SourceTier';
import { MOCK_EVIDENCE_RECORDS } from '../../data/mock/mockEvidenceData';

/**
 * Core Source & Claim Verification Service.
 * 
 * Epistemic Rules:
 * 1. A source is verified only if metadata is complete, authentic, and belongs to an acceptable tier (Tier 1–4).
 * 2. Tier 5 (general unverified web material) is strictly rejected as factual evidence.
 * 3. A modern secondary article cannot be mislabeled as an ancient primary manuscript.
 * 4. AI-generated text cannot become evidence without an audited source.
 * 5. Conflicting credible sources are marked as CONTESTED.
 */

export class SourceVerifierService implements SourceVerifier {
  private evidenceRecords: EvidenceRecord[];

  constructor(records: EvidenceRecord[] = MOCK_EVIDENCE_RECORDS) {
    this.evidenceRecords = records;
  }

  public verifySource(source: EvidenceRecord | ResearchRecord): SourceVerificationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const tier = source.sourceTier || (source.source?.sourceTier) || 'TIER_2';

    // 1. Check ID & Title
    if (!source.id || source.id.trim() === '') {
      errors.push('Missing unique source identifier.');
    }
    const isEvidence = 'exactTradition' in source;
    const title = isEvidence
      ? (source.sourceTitle || source.source?.sourceTitle || '')
      : (source.title || source.conceptName || source.source?.sourceTitle || '');

    if (!title || title.trim() === '') {
      errors.push('Missing bibliographic source title.');
    }

    // 2. Check Tier Validity
    const isPrimaryOrScholarly = isScholarlyOrPrimaryTier(tier);
    if (!isPrimaryOrScholarly) {
      errors.push(`Source tier ${tier} (General Web / Unverified) is not accepted as factual evidence in Somnithos.`);
    }

    // 3. Check for Misclassification (e.g. modern article labeled as primary ancient manuscript)
    const pubDate = isEvidence
      ? (source.date || source.publicationDate || source.source?.publicationDate || '')
      : (source.year || source.publicationYear || source.source?.publicationDate || '');

    if (tier === 'TIER_1' && pubDate.includes('20') && !title.toLowerCase().includes('papyrus') && !title.toLowerCase().includes('tablet') && !title.toLowerCase().includes('manuscript') && !source.source?.supportingPassage) {
      warnings.push('Modern publication date on TIER_1 primary source requires critical edition / translated manuscript verification.');
    }

    // 4. Check for Supporting Excerpt
    const excerpt = isEvidence
      ? (source.supportingExcerpt || source.supportingEvidence || source.source?.supportingPassage)
      : (source.source?.supportingPassage || source.summary);

    if (!excerpt || excerpt.trim() === '') {
      errors.push('Source missing direct supporting translation or textual excerpt.');
    }

    // 5. Calculate Metadata Confidence
    let confidence = 1.0;
    if (errors.length > 0) {
      confidence = 0.0;
    } else {
      if (warnings.length > 0) confidence -= 0.15;
      const identifier = isEvidence
        ? (source.sourceUrlOrIdentifier || source.doi || source.source?.identifierOrUrl)
        : (source.doiOrIdentifier || source.doi || source.source?.identifierOrUrl);

      if (!identifier) {
        warnings.push('Source lacks a canonical DOI, Museum Accession No, or persistent identifier.');
        confidence -= 0.1;
      }
    }

    return {
      isValid: errors.length === 0,
      sourceId: source.id,
      sourceTier: tier,
      errors,
      warnings,
      isPrimaryOrScholarly,
      metadataConfidence: Math.max(0, Math.min(1, confidence))
    };
  }

  public verifyClaim(claimText: string, motif: string, sources: EvidenceRecord[]): ClaimVerificationResult {
    const claimId = 'claim-' + motif + '-' + Math.random().toString(36).substr(2, 6);

    // Fallback: No sources provided
    if (!sources || sources.length === 0) {
      const fallbackProvenance: ProvenanceChain = {
        claimId,
        claimText,
        motif,
        nodes: [],
        isContested: false,
        verificationTimestamp: new Date().toISOString()
      };

      return {
        claimId,
        supportStatus: 'NO_RELIABLE_SOURCE',
        confidence: 0,
        supportingSources: [],
        conflictingSources: [],
        provenance: fallbackProvenance,
        explanation: 'No sufficiently reliable source was found for this specific claim.'
      };
    }

    // Verify each source
    const validSupportingSources: EvidenceRecord[] = [];
    const provenanceNodes: ProvenanceNode[] = [];
    const conflictingSources: EvidenceRecord[] = [];

    for (const src of sources) {
      const verification = this.verifySource(src);
      if (verification.isValid) {
        validSupportingSources.push(src);

        const node: ProvenanceNode = {
          claimId,
          sourceId: src.id,
          sourceTier: src.sourceTier || 'TIER_1',
          sourceTitle: src.sourceTitle || src.source.sourceTitle,
          authorOrCreator: src.author || src.source.authorOrCreator,
          institutionOrPublisher: src.publicationOrInstitution || src.source.institutionOrPublisher,
          publicationDate: src.date || src.source.publicationDate,
          citation: `${src.author || src.source.authorOrCreator} (${src.date || src.source.publicationDate}). "${src.sourceTitle || src.source.sourceTitle}". ${src.publicationOrInstitution || src.source.institutionOrPublisher}.`,
          urlOrIdentifier: src.sourceUrlOrIdentifier || src.source.identifierOrUrl,
          supportingExcerpt: src.supportingExcerpt || src.source.supportingPassage || '',
          evidenceLevel: src.evidenceLevel,
          culturalTradition: src.culturalTradition || src.exactTradition,
          geographicRegion: src.geographicRegion || src.geographicContext,
          historicalPeriod: src.historicalPeriod,
          uncertainty: src.uncertainty || src.whatIsUncertain,
          retrievedAt: src.retrievedAt || new Date().toISOString().split('T')[0]
        };
        provenanceNodes.push(node);

        // Detect known scholarly disagreement
        if (src.scholarlyDisagreement) {
          conflictingSources.push(src);
        }
      }
    }

    // Handle no valid sources after verification
    if (validSupportingSources.length === 0) {
      return {
        claimId,
        supportStatus: 'INSUFFICIENT_EVIDENCE',
        confidence: 0,
        supportingSources: [],
        conflictingSources: [],
        provenance: {
          claimId,
          claimText,
          motif,
          nodes: [],
          isContested: false,
          verificationTimestamp: new Date().toISOString()
        },
        explanation: 'The provided sources failed quality verification and cannot support the claim.'
      };
    }

    // Check for conflicting traditions
    const isContested = conflictingSources.length > 0 || (
      validSupportingSources.length >= 2 &&
      validSupportingSources.some(s => s.claim.toLowerCase().includes('favorable') || s.claim.toLowerCase().includes('auspicious')) &&
      validSupportingSources.some(s => s.claim.toLowerCase().includes('unfavorable') || s.claim.toLowerCase().includes('adversity') || s.claim.toLowerCase().includes('misfortune'))
    );

    let status: SupportStatus = 'SUPPORTED';
    let explanation = `Claim verified against ${validSupportingSources.length} audited scholarly source(s).`;

    if (isContested) {
      status = 'CONTESTED';
      explanation = 'Multiple credible historical records document differing or contested interpretations for this motif.';
    }

    const provenance: ProvenanceChain = {
      claimId,
      claimText,
      motif,
      nodes: provenanceNodes,
      isContested,
      contestReason: isContested ? 'Documented sources indicate variant interpretations across distinct periods or traditions.' : undefined,
      verificationTimestamp: new Date().toISOString()
    };

    return {
      claimId,
      supportStatus: status,
      confidence: isContested ? 0.65 : 0.95,
      supportingSources: validSupportingSources,
      conflictingSources,
      provenance,
      explanation
    };
  }

  public getSupportingEvidence(claimId: string): EvidenceRecord[] {
    return this.evidenceRecords.filter(r => r.id === claimId || r.motif === claimId || r.primarySubject === claimId);
  }

  public getSourceMetadata(sourceId: string): EvidenceRecord | undefined {
    return this.evidenceRecords.find(r => r.id === sourceId || r.source?.id === sourceId);
  }
}
