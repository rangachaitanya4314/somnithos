/**
 * Epistemic evidence classification levels for Somnithos.
 * 
 * IMPORTANT:
 * These labels describe the historical/bibliographic evidence status of the record,
 * NOT how "true" or "predictive" a dream interpretation is.
 */

export type EvidenceLevel =
  | 'HIGH'
  | 'MODERATE'
  | 'HISTORICAL'
  | 'TRADITIONAL'
  | 'UNCERTAIN'
  | 'NO_RELIABLE_SOURCE';
