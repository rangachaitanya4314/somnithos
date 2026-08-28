import type { DreamPattern } from '../../domain/patterns/DreamPattern';
import type { SavedDreamRecord } from '../../domain/journal/SavedDreamRecord';
import type { DreamAnalysisResult } from '../../types/dream';

export class DreamPatternEngine {
  private static readonly MIN_OCCURRENCE_THRESHOLD = 2;

  /**
   * Discovers observed recurring patterns across a set of saved dream records.
   * Strictly descriptive and non-diagnostic.
   */
  public static detectPatterns(dreams: SavedDreamRecord[] | Array<{ submission: any; analysis: DreamAnalysisResult; savedAt?: string }>): DreamPattern[] {
    if (!dreams || dreams.length < this.MIN_OCCURRENCE_THRESHOLD) {
      return [];
    }

    const normalizedDreams: SavedDreamRecord[] = dreams.map(d => {
      if ('dreamId' in d) {
        return d as SavedDreamRecord;
      }
      const entry = d as { submission: any; analysis: DreamAnalysisResult; savedAt?: string };
      return {
        dreamId: entry.submission.id,
        title: entry.submission.title || 'Untitled',
        originalNarrative: entry.submission.description || '',
        createdAt: entry.submission.createdAt || entry.savedAt || new Date().toISOString(),
        updatedAt: entry.savedAt || new Date().toISOString(),
        emotions: entry.submission.emotions || entry.analysis.extractedFeatures.detectedEmotions || [],
        motifs: entry.analysis.extractedFeatures.dominantMotifs || entry.analysis.extractedFeatures.detectedSymbols || [],
        setting: entry.analysis.extractedFeatures.setting || (entry.submission.location ? [entry.submission.location] : []),
        analysisResult: entry.analysis as any,
        privacyStatus: entry.submission.privacy === 'anonymous_public' ? 'SHARED_ANONYMOUSLY' : 'PRIVATE',
        analysisVersion: '1.0.0'
      };
    });

    const totalDreams = normalizedDreams.length;
    const patterns: DreamPattern[] = [];

    // Sort dreams chronologically (oldest to newest) to get first/last observed dates
    const chronoSorted = [...normalizedDreams].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // 1. Detect Motif Recurrence
    const motifMap = new Map<string, { count: number; dreamIds: string[]; dates: string[]; features: Set<string> }>();
    for (const dream of chronoSorted) {
      const uniqueMotifs = new Set(dream.motifs.map(m => m.toLowerCase().trim()));
      uniqueMotifs.forEach(motif => {
        if (!motif) return;
        const entry = motifMap.get(motif) || { count: 0, dreamIds: [], dates: [], features: new Set() };
        entry.count += 1;
        entry.dreamIds.push(dream.dreamId);
        entry.dates.push(dream.createdAt);
        entry.features.add(motif);
        motifMap.set(motif, entry);
      });
    }

    motifMap.forEach((data, motifKey) => {
      if (data.count >= this.MIN_OCCURRENCE_THRESHOLD) {
        const formattedLabel = motifKey.charAt(0).toUpperCase() + motifKey.slice(1);
        patterns.push({
          id: `pattern-motif-${motifKey}`,
          type: 'MOTIF',
          label: formattedLabel,
          count: data.count,
          totalDreams,
          dreamIds: data.dreamIds,
          firstObservedAt: data.dates[0],
          lastObservedAt: data.dates[data.dates.length - 1],
          supportingFeatures: Array.from(data.features),
          description: `${formattedLabel} appeared in ${data.count} of your ${totalDreams} saved dreams.`,
          confidence: Math.round((data.count / totalDreams) * 100) / 100
        });
      }
    });

    // 2. Detect Emotion Recurrence
    const emotionMap = new Map<string, { count: number; dreamIds: string[]; dates: string[]; features: Set<string> }>();
    for (const dream of chronoSorted) {
      const uniqueEmotions = new Set(dream.emotions.map(e => e.toLowerCase().trim()));
      uniqueEmotions.forEach(emo => {
        if (!emo) return;
        const entry = emotionMap.get(emo) || { count: 0, dreamIds: [], dates: [], features: new Set() };
        entry.count += 1;
        entry.dreamIds.push(dream.dreamId);
        entry.dates.push(dream.createdAt);
        entry.features.add(emo);
        emotionMap.set(emo, entry);
      });
    }

    emotionMap.forEach((data, emoKey) => {
      if (data.count >= this.MIN_OCCURRENCE_THRESHOLD) {
        const formattedLabel = emoKey.charAt(0).toUpperCase() + emoKey.slice(1);
        patterns.push({
          id: `pattern-emotion-${emoKey}`,
          type: 'EMOTION',
          label: formattedLabel,
          count: data.count,
          totalDreams,
          dreamIds: data.dreamIds,
          firstObservedAt: data.dates[0],
          lastObservedAt: data.dates[data.dates.length - 1],
          supportingFeatures: Array.from(data.features),
          description: `${formattedLabel} was experienced across ${data.count} of your saved dreams.`,
          confidence: Math.round((data.count / totalDreams) * 100) / 100
        });
      }
    });

    // 3. Detect Emotional Sequences (e.g. Fear -> Calm, Confusion -> Wonder)
    const sequenceMap = new Map<string, { count: number; dreamIds: string[]; dates: string[]; from: string; to: string }>();
    for (const dream of chronoSorted) {
      const emos = dream.emotions.map(e => e.toLowerCase().trim());
      if (emos.length >= 2) {
        for (let i = 0; i < emos.length - 1; i++) {
          const from = emos[i];
          const to = emos[i + 1];
          if (from && to && from !== to) {
            const seqKey = `${from} -> ${to}`;
            const entry = sequenceMap.get(seqKey) || { count: 0, dreamIds: [], dates: [], from, to };
            if (!entry.dreamIds.includes(dream.dreamId)) {
              entry.count += 1;
              entry.dreamIds.push(dream.dreamId);
              entry.dates.push(dream.createdAt);
              sequenceMap.set(seqKey, entry);
            }
          }
        }
      }
    }

    sequenceMap.forEach((data, seqKey) => {
      if (data.count >= this.MIN_OCCURRENCE_THRESHOLD) {
        const fromLabel = data.from.charAt(0).toUpperCase() + data.from.slice(1);
        const toLabel = data.to.charAt(0).toUpperCase() + data.to.slice(1);
        const formattedLabel = `${fromLabel} → ${toLabel}`;
        patterns.push({
          id: `pattern-seq-${seqKey.replace(/\s+/g, '-')}`,
          type: 'EMOTIONAL_SEQUENCE',
          label: formattedLabel,
          count: data.count,
          totalDreams,
          dreamIds: data.dreamIds,
          firstObservedAt: data.dates[0],
          lastObservedAt: data.dates[data.dates.length - 1],
          supportingFeatures: [data.from, data.to],
          description: `You described a transition from ${data.from} to ${data.to} in ${data.count} dreams.`,
          confidence: Math.round((data.count / totalDreams) * 100) / 100
        });
      }
    });

    // 4. Detect Setting Recurrence
    const settingMap = new Map<string, { count: number; dreamIds: string[]; dates: string[]; features: Set<string> }>();
    for (const dream of chronoSorted) {
      const uniqueSettings = new Set((dream.setting || []).map(s => s.toLowerCase().trim()));
      uniqueSettings.forEach(set => {
        if (!set) return;
        const entry = settingMap.get(set) || { count: 0, dreamIds: [], dates: [], features: new Set() };
        entry.count += 1;
        entry.dreamIds.push(dream.dreamId);
        entry.dates.push(dream.createdAt);
        entry.features.add(set);
        settingMap.set(set, entry);
      });
    }

    settingMap.forEach((data, setKey) => {
      if (data.count >= this.MIN_OCCURRENCE_THRESHOLD) {
        const formattedLabel = setKey.charAt(0).toUpperCase() + setKey.slice(1);
        patterns.push({
          id: `pattern-setting-${setKey}`,
          type: 'SETTING',
          label: formattedLabel,
          count: data.count,
          totalDreams,
          dreamIds: data.dreamIds,
          firstObservedAt: data.dates[0],
          lastObservedAt: data.dates[data.dates.length - 1],
          supportingFeatures: Array.from(data.features),
          description: `A ${setKey} setting appeared across ${data.count} of your saved dreams.`,
          confidence: Math.round((data.count / totalDreams) * 100) / 100
        });
      }
    });

    // Sort patterns by frequency (highest count first), then confidence
    return patterns.sort((a, b) => b.count - a.count || b.confidence - a.confidence);
  }

  /**
   * Filters saved dreams matching a specific pattern.
   */
  public static getDreamsForPattern(pattern: DreamPattern, dreams: SavedDreamRecord[]): SavedDreamRecord[] {
    const idSet = new Set(pattern.dreamIds);
    return dreams.filter(d => idSet.has(d.dreamId));
  }
}
