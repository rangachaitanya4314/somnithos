export type PatternType =
  | 'MOTIF'
  | 'EMOTION'
  | 'SETTING'
  | 'ACTION'
  | 'EMOTIONAL_SEQUENCE'
  | 'RECURRING_ELEMENT';

export interface DreamPattern {
  id: string;
  type: PatternType;
  label: string;
  count: number;
  totalDreams: number;
  dreamIds: string[];
  firstObservedAt: string;
  lastObservedAt: string;
  supportingFeatures: string[];
  description: string;
  confidence: number; // 0.0 to 1.0
}
