import type { ResearchRecord, ResearchRecordMatch } from '../../domain/research/ResearchRecord';
import type { ResearchRepository } from '../../domain/research/ResearchRepository';
import { MOCK_RESEARCH_RECORDS } from '../../data/mock/mockResearchData';

/**
 * Concrete Mock Implementation of ResearchRepository.
 * Matches peer-reviewed cognitive and neuroscientific research without making deterministic diagnoses.
 */

export class MockResearchRepository implements ResearchRepository {
  private records: ResearchRecord[];

  constructor(seedRecords: ResearchRecord[] = MOCK_RESEARCH_RECORDS) {
    this.records = seedRecords;
  }

  public matchResearch(themesAndEmotions: string[]): ResearchRecordMatch[] {
    const matches: ResearchRecordMatch[] = [];
    const normalized = new Set(themesAndEmotions.map(t => t.toLowerCase().trim()));

    for (const record of this.records) {
      const themes = record.relevanceToDreamFeature || record.relevanceToDreamThemes || [];
      const isRelevant = themes.some(theme =>
        normalized.has(theme.toLowerCase().trim())
      );

      if (isRelevant) {
        matches.push({
          researchRecord: record,
          psychologyClaim: record,
          relevanceReason: `Relevant to detected dream themes (${themes.slice(0, 3).join(', ')}) through cognitive model: ${record.title || record.conceptName}.`
        });
      }
    }

    // Default to Continuity Hypothesis if no specific specialized model matched
    if (matches.length === 0 && this.records.length > 0) {
      const continuityRecord = this.records.find(r => r.id === 'psy-continuity-domhoff');
      if (continuityRecord) {
        matches.push({
          researchRecord: continuityRecord,
          psychologyClaim: continuityRecord,
          relevanceReason: 'Baseline cognitive neuroscience framework analyzing continuity between waking thoughts and dream imagery.'
        });
      }
    }

    return matches;
  }

  public getRecordById(id: string): ResearchRecord | undefined {
    return this.records.find(r => r.id === id);
  }

  public getAllRecords(): ResearchRecord[] {
    return [...this.records];
  }
}
