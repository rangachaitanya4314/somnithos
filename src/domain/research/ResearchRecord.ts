import type { EvidenceLevel } from '../evidence/EvidenceLevel';
import type { SourceTier } from '../evidence/SourceTier';
import type { VerifiedSourceRecord } from '../evidence/EvidenceRecord';

/**
 * Strongly-typed model for empirical sleep science, cognitive psychology, and neuroscience findings.
 * Never deterministic; explicitly non-diagnostic.
 */

export interface ResearchRecord {
  id: string;
  title?: string; // Concept or hypothesis name (e.g., "Threat Simulation Theory (TST)")
  conceptName: string; // Primary concept name
  authors?: string; // Researchers / Principal Investigators
  researchers: string; // Researchers name string
  year?: string; // Publication year (e.g. "2000")
  publicationYear: string; // Publication year
  journal?: string; // Journal name
  institution?: string; // University or institute (e.g. "Center for Human Sleep Science, UC Berkeley")
  journalOrInstitution?: string; // Publishing journal or academic institution
  originalPublication: string; // Publication details
  researchType?: 'empirical_finding' | 'theoretical_model' | 'historical_framework' | 'disputed_hypothesis';
  epistemicType: 'empirical_finding' | 'theoretical_model' | 'historical_framework' | 'disputed_hypothesis';
  doi?: string;
  url?: string;
  doiOrIdentifier?: string; // Canonical DOI or identifier
  sample?: string; // Sample size / demographics (e.g. "N=34 healthy young adults in polysomnography protocol")
  finding?: string; // Observed empirical or theoretical findings
  summary: string; // Core summary
  limitations?: string; // Documented boundaries, constraints, or sample limitations
  documentedLimitations: string; // Detailed limitations
  dreamFeature?: string[]; // Dream themes/emotions where this model is applicable
  relevanceToDreamFeature?: string[]; // Dream themes/emotions where this model is applicable
  relevanceToDreamThemes: string[]; // Themes list
  citation?: string; // Academic bibliographic citation
  nonDiagnosticDisclaimer: string; // Mandatory non-diagnostic clinical disclaimer
  evidenceLevel: EvidenceLevel;
  sourceTier: SourceTier; // Quality tier
  retrievedAt?: string;
  source: VerifiedSourceRecord;
}

export interface ResearchRecordMatch {
  researchRecord: ResearchRecord;
  psychologyClaim: ResearchRecord;
  relevanceReason: string;
}
