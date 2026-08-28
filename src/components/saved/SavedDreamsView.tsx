import React, { useState } from 'react';
import { StorageService } from '../../services/storageService';
import type { SavedDreamEntry } from '../../services/storageService';
import type { DreamSubmission, DreamAnalysisResult } from '../../types/dream';
import {
  Bookmark,
  Trash2,
  ArrowRight,
  Calendar,
  Sparkles,
  Activity,
  Scroll,
  Palette
} from 'lucide-react';

interface SavedDreamsViewProps {
  onSelectDream: (submission: DreamSubmission, analysis: DreamAnalysisResult) => void;
  onNewDream: () => void;
}

export const SavedDreamsView: React.FC<SavedDreamsViewProps> = ({ onSelectDream, onNewDream }) => {
  const [savedEntries, setSavedEntries] = useState<SavedDreamEntry[]>(() =>
    StorageService.getSavedDreamAnalyses()
  );

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    StorageService.deleteSavedDream(id);
    setSavedEntries(StorageService.getSavedDreamAnalyses());
  };

  // Calculate recurring patterns across saved entries
  const getRecurringPatterns = () => {
    const symbolCounts: Record<string, number> = {};
    const emotionCounts: Record<string, number> = {};

    savedEntries.forEach(entry => {
      entry.analysis.extractedFeatures.detectedSymbols.forEach(s => {
        symbolCounts[s] = (symbolCounts[s] || 0) + 1;
      });
      entry.analysis.extractedFeatures.detectedEmotions.forEach(e => {
        emotionCounts[e] = (emotionCounts[e] || 0) + 1;
      });
    });

    const topSymbols = Object.entries(symbolCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { topSymbols, topEmotions };
  };

  const { topSymbols, topEmotions } = getRecurringPatterns();

  return (
    <div className="saved-dreams-container container">
      {/* Header */}
      <div className="saved-header">
        <div className="saved-eyebrow-badge">
          <Scroll size={14} className="text-gold" />
          <span>PERSONAL ARCHIVE · LOCAL VAULT</span>
        </div>
        <h1 className="saved-title">Your Saved Dream Archive</h1>
        <p className="saved-sub">
          Chronological record of your nocturnal experiences, cultural perspectives, psychology models, and generated dream visualizations.
        </p>
      </div>

      {/* Recurring Patterns Insight Box (if saved entries exist) */}
      {savedEntries.length > 0 && (topSymbols.length > 0 || topEmotions.length > 0) && (
        <section className="patterns-insight-card" aria-label="Recurring Nocturnal Patterns">
          <div className="patterns-header-row">
            <div className="patterns-title-wrap">
              <Activity size={16} className="text-gold" />
              <h3 className="patterns-title">Recurring Nocturnal Patterns</h3>
            </div>
            <span className="patterns-count-badge">
              Across {savedEntries.length} Saved {savedEntries.length === 1 ? 'Dream' : 'Dreams'}
            </span>
          </div>

          <div className="patterns-grid">
            {topSymbols.length > 0 && (
              <div className="pattern-group">
                <span className="pattern-group-label">Frequent Archetypes & Motifs:</span>
                <div className="pattern-tags-row">
                  {topSymbols.map(([sym, count]) => (
                    <span key={sym} className="pattern-tag motif-pattern">
                      <span>#{sym}</span>
                      <span className="pattern-count">×{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {topEmotions.length > 0 && (
              <div className="pattern-group">
                <span className="pattern-group-label">Dominant Affective Tones:</span>
                <div className="pattern-tags-row">
                  {topEmotions.map(([emo, count]) => (
                    <span key={emo} className="pattern-tag emotion-pattern">
                      <span>{emo}</span>
                      <span className="pattern-count">×{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Entries List */}
      {savedEntries.length > 0 ? (
        <div className="saved-entries-grid">
          {savedEntries.map(entry => (
            <article
              key={entry.submission.id}
              className="saved-entry-card"
              onClick={() => onSelectDream(entry.submission, entry.analysis)}
            >
              <div className="entry-card-layout">
                {/* Artwork Thumbnail (if available) */}
                {entry.analysis.dreamArtwork.imageUrl ? (
                  <div className="entry-thumbnail-box">
                    <img
                      src={entry.analysis.dreamArtwork.imageUrl}
                      alt={entry.submission.title || 'Dream visualization'}
                      className="entry-thumb-img"
                    />
                    <span className="thumb-badge">Art</span>
                  </div>
                ) : (
                  <div className="entry-thumbnail-box placeholder">
                    <Palette size={20} className="text-muted" />
                  </div>
                )}

                <div className="entry-content-box">
                  <div className="entry-top-meta">
                    <span className="entry-date">
                      <Calendar size={13} className="text-gold" />
                      <span>
                        {new Date(entry.savedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </span>
                    <button
                      className="delete-entry-btn"
                      onClick={e => handleDelete(entry.submission.id, e)}
                      title="Remove from archive"
                      aria-label="Delete saved dream"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <h3 className="entry-title">
                    {entry.submission.title || 'Untitled Nocturnal Experience'}
                  </h3>

                  <p className="entry-excerpt">
                    &quot;{entry.submission.description.length > 130
                      ? entry.submission.description.substring(0, 130) + '...'
                      : entry.submission.description}&quot;
                  </p>

                  {/* Emotion & Motif Tags */}
                  <div className="entry-tags-row">
                    {entry.analysis.extractedFeatures.detectedEmotions.slice(0, 2).map((emo, idx) => (
                      <span key={`emo-${idx}`} className="entry-emotion-tag">
                        {emo}
                      </span>
                    ))}
                    {entry.analysis.extractedFeatures.detectedSymbols.slice(0, 3).map((sym, idx) => (
                      <span key={`sym-${idx}`} className="entry-tag">
                        #{sym}
                      </span>
                    ))}
                  </div>

                  {/* Reflection Quote Preview */}
                  <div className="entry-reflection-preview">
                    <Sparkles size={12} className="text-gold" />
                    <span>&quot;{entry.analysis.originalReflection.message}&quot;</span>
                  </div>

                  <div className="entry-footer">
                    <span className="sources-count">
                      {entry.analysis.culturalPerspectives.length} Cultural Sources · {entry.analysis.psychologyPerspectives.length} Science Models
                    </span>
                    <span className="view-link">
                      <span>Open Synthesis</span>
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="saved-empty-state">
          <div className="empty-icon-box">
            <Bookmark size={36} className="text-gold" />
          </div>
          <h3>Your Personal Archive is Empty</h3>
          <p>
            When you explore a dream in Somnithos, you can save the complete synthesis (cultural perspectives, psychology breakdown, and dream artwork) to revisit and discover recurring patterns over time.
          </p>
          <button className="btn btn-primary" onClick={onNewDream}>
            <Sparkles size={16} />
            <span>Explore Your First Dream</span>
          </button>
        </div>
      )}
    </div>
  );
};
