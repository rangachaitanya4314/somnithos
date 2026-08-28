export type PrivacyStatus = 'PRIVATE' | 'SHARED_ANONYMOUSLY';

export interface SavedDreamRecord {
  dreamId: string;
  title: string;
  originalNarrative: string;
  createdAt: string;
  updatedAt: string;
  emotions: string[];
  motifs: string[];
  setting?: string[];
  analysisResult: any;
  evidenceReferences?: string[];
  researchReferences?: string[];
  personalReflection?: string;
  creativeReflection?: string;
  artworkReference?: {
    artworkUrl?: string;
    artworkProvider?: string;
    promptUsed?: string;
  };
  closingThought?: string;
  privacyStatus: PrivacyStatus;
  analysisVersion: string;
}
