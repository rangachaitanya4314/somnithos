import type { ResearchRecord } from '../../domain/research/ResearchRecord';
import { PSYCHOLOGY_KNOWLEDGE_CLAIMS } from '../psychologySources';

/**
 * Seed repository of peer-reviewed sleep science, cognitive psychology, and neuroscience models.
 * Strictly non-diagnostic and non-deterministic.
 */

export const MOCK_RESEARCH_RECORDS: ResearchRecord[] = PSYCHOLOGY_KNOWLEDGE_CLAIMS.map(psy => ({
  id: psy.id,
  title: psy.conceptName,
  conceptName: psy.conceptName,
  authors: psy.researchers,
  researchers: psy.researchers,
  year: psy.publicationYear,
  publicationYear: psy.publicationYear,
  journal: psy.originalPublication,
  institution: psy.source.institutionOrPublisher,
  journalOrInstitution: psy.source.institutionOrPublisher,
  originalPublication: psy.originalPublication,
  researchType: psy.epistemicType,
  epistemicType: psy.epistemicType,
  doi: psy.source.identifierOrUrl.includes('DOI:') ? psy.source.identifierOrUrl.replace('DOI:', '').trim() : undefined,
  url: psy.source.identifierOrUrl.startsWith('http') ? psy.source.identifierOrUrl : undefined,
  doiOrIdentifier: psy.source.identifierOrUrl,
  finding: psy.summary,
  summary: psy.summary,
  limitations: psy.documentedLimitations,
  documentedLimitations: psy.documentedLimitations,
  dreamFeature: psy.relevanceToDreamThemes,
  relevanceToDreamFeature: psy.relevanceToDreamThemes,
  relevanceToDreamThemes: psy.relevanceToDreamThemes,
  citation: `${psy.researchers} (${psy.publicationYear}). "${psy.conceptName}". ${psy.originalPublication}.`,
  nonDiagnosticDisclaimer: psy.nonDiagnosticDisclaimer,
  evidenceLevel: psy.evidenceLevel,
  sourceTier: 'TIER_2',
  retrievedAt: psy.source.lastVerifiedDate || '2026-08-28',
  source: {
    ...psy.source,
    sourceTier: 'TIER_2',
    retrievedAt: psy.source.lastVerifiedDate || '2026-08-28'
  }
}));
