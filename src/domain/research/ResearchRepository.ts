import type { ResearchRecord, ResearchRecordMatch } from './ResearchRecord';

/**
 * Interface for retrieving peer-reviewed sleep science & cognitive neuroscience records.
 */
export interface ResearchRepository {
  /**
   * Matches research models and empirical findings based on detected themes, emotions, and motifs.
   */
  matchResearch(themesAndEmotions: string[]): ResearchRecordMatch[];

  /**
   * Retrieves a specific research record by ID.
   */
  getRecordById(id: string): ResearchRecord | undefined;

  /**
   * Retrieves all research records in the repository.
   */
  getAllRecords(): ResearchRecord[];
}
