/**
 * Source Quality Hierarchy for Somnithos.
 * 
 * Epistemic Rules:
 * - TIER_1: Primary historical sources, manuscripts, archaeological/museum records, original religious/literary texts.
 * - TIER_2: Peer-reviewed academic research, academic books, university research, scholarly critical editions.
 * - TIER_3: Institutional/reference sources, museum catalogs, library archives, academic research databases.
 * - TIER_4: Reputable secondary scholarship, academic surveys.
 * - TIER_5: General web material.
 * 
 * CRITICAL RULE:
 * TIER_5 general web material must NEVER be treated as primary or scholarly evidence.
 */

export type SourceTier =
  | 'TIER_1'
  | 'TIER_2'
  | 'TIER_3'
  | 'TIER_4'
  | 'TIER_5';

export interface SourceTierInfo {
  tier: SourceTier;
  label: string;
  description: string;
  acceptedForFactualClaims: boolean;
}

export const SOURCE_TIER_DEFINITIONS: Record<SourceTier, SourceTierInfo> = {
  TIER_1: {
    tier: 'TIER_1',
    label: 'Primary Historical Source',
    description: 'Original ancient/historical manuscripts, cuneiform tablets, papyri, archaeological records, and primary religious texts.',
    acceptedForFactualClaims: true
  },
  TIER_2: {
    tier: 'TIER_2',
    label: 'Peer-Reviewed Research & Scholarly Edition',
    description: 'Empirical sleep neuroscience journals, peer-reviewed cognitive psychology, critical scholarly translations, and university press editions.',
    acceptedForFactualClaims: true
  },
  TIER_3: {
    tier: 'TIER_3',
    label: 'Institutional Archive & Research Database',
    description: 'Museum archives (e.g., British Museum), institutional repositories, academic dream research databases (e.g., DreamResearch.net / UCSC, DreamBank, SDDb).',
    acceptedForFactualClaims: true
  },
  TIER_4: {
    tier: 'TIER_4',
    label: 'Secondary Scholarship',
    description: 'Academic commentaries, encyclopedias of antiquity, peer-evaluated historiographies analyzing primary records.',
    acceptedForFactualClaims: true
  },
  TIER_5: {
    tier: 'TIER_5',
    label: 'General Web & Unverified Material',
    description: 'General online articles, popular blogs, unverified dictionaries. Strictly prohibited from serving as factual baseline.',
    acceptedForFactualClaims: false
  }
};

export function isScholarlyOrPrimaryTier(tier: SourceTier): boolean {
  return tier === 'TIER_1' || tier === 'TIER_2' || tier === 'TIER_3' || tier === 'TIER_4';
}

export function getSourceTierLabel(tier: SourceTier): string {
  return SOURCE_TIER_DEFINITIONS[tier]?.label || tier;
}
