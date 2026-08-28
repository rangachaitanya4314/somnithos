import React, { useState, useEffect, useMemo } from 'react';
import { StorageService } from '../../services/storageService';
import type { SavedDreamRecord } from '../../domain/journal/SavedDreamRecord';
import type { DreamSubmission, DreamAnalysisResult } from '../../types/dream';
import { DreamPatternEngine } from '../../services/patterns/DreamPatternEngine';
import type { DreamPattern } from '../../domain/patterns/DreamPattern';
import {
  Bookmark,
  Trash2,
  ArrowRight,
  Calendar,
  Sparkles,
  Activity,
  Scroll,
  Palette,
  Search,
  Filter,
  Lock,
  Globe,
  Clock,
  LayoutGrid,
  List,
  AlertTriangle,
  X,
  ChevronRight,
  TrendingUp,
  HelpCircle
} from 'lucide-react';

interface SavedDreamsViewProps {
  onSelectDream: (submission: DreamSubmission, analysis: DreamAnalysisResult) => void;
  onNewDream: () => void;
}

type ViewTab = 'journal' | 'patterns';
type LayoutMode = 'grid' | 'timeline';

export const SavedDreamsView: React.FC<SavedDreamsViewProps> = ({ onSelectDream, onNewDream }) => {
  const [activeTab, setActiveTab] = useState<ViewTab>('journal');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [dreams, setDreams] = useState<SavedDreamRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEmotionFilter, setSelectedEmotionFilter] = useState<string>('all');
  const [selectedMotifFilter, setSelectedMotifFilter] = useState<string>('all');
  const [selectedPrivacyFilter, setSelectedPrivacyFilter] = useState<'all' | 'PRIVATE' | 'SHARED_ANONYMOUSLY'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Deletion Confirmation Modal State
  const [dreamToDelete, setDreamToDelete] = useState<SavedDreamRecord | null>(null);

  // Pattern Detail Drawer State
  const [selectedPattern, setSelectedPattern] = useState<DreamPattern | null>(null);

  // Load dreams from repository
  const loadDreams = async () => {
    const records = await StorageService.getSavedDreams();
    setDreams(records);
  };

  useEffect(() => {
    loadDreams();
  }, []);

  // Compute detected patterns across all saved dreams
  const detectedPatterns = useMemo(() => {
    return DreamPatternEngine.detectPatterns(dreams);
  }, [dreams]);

  // Extract unique emotions and motifs for filter pills
  const { allEmotions, allMotifs } = useMemo(() => {
    const emos = new Set<string>();
    const mots = new Set<string>();

    dreams.forEach(d => {
      d.emotions.forEach(e => emos.add(e.toLowerCase()));
      d.motifs.forEach(m => mots.add(m.toLowerCase()));
    });

    return {
      allEmotions: Array.from(emos).sort(),
      allMotifs: Array.from(mots).sort()
    };
  }, [dreams]);

  // Filter and search dreams
  const filteredDreams = useMemo(() => {
    let result = [...dreams];

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(d => {
        const matchTitle = d.title.toLowerCase().includes(q);
        const matchNarrative = d.originalNarrative.toLowerCase().includes(q);
        const matchMotifs = d.motifs.some(m => m.toLowerCase().includes(q));
        const matchEmotions = d.emotions.some(e => e.toLowerCase().includes(q));
        return matchTitle || matchNarrative || matchMotifs || matchEmotions;
      });
    }

    // 2. Emotion Filter
    if (selectedEmotionFilter !== 'all') {
      result = result.filter(d =>
        d.emotions.some(e => e.toLowerCase() === selectedEmotionFilter.toLowerCase())
      );
    }

    // 3. Motif Filter
    if (selectedMotifFilter !== 'all') {
      result = result.filter(d =>
        d.motifs.some(m => m.toLowerCase() === selectedMotifFilter.toLowerCase())
      );
    }

    // 4. Privacy Filter
    if (selectedPrivacyFilter !== 'all') {
      result = result.filter(d => d.privacyStatus === selectedPrivacyFilter);
    }

    // 5. Sorting
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [dreams, searchQuery, selectedEmotionFilter, selectedMotifFilter, selectedPrivacyFilter, sortOrder]);

  const handleConfirmDelete = async () => {
    if (!dreamToDelete) return;
    await StorageService.getRepository().deleteDream(dreamToDelete.dreamId);
    setDreamToDelete(null);
    await loadDreams();
  };

  const handleTogglePrivacy = async (dream: SavedDreamRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = dream.privacyStatus === 'PRIVATE' ? 'SHARED_ANONYMOUSLY' : 'PRIVATE';
    await StorageService.updateDreamPrivacy(dream.dreamId, newStatus);
    await loadDreams();
  };

  const handleOpenDream = (record: SavedDreamRecord) => {
    const submission: DreamSubmission = {
      id: record.dreamId,
      title: record.title,
      description: record.originalNarrative,
      emotions: record.emotions,
      symbolsAndObjects: record.motifs,
      location: record.setting?.[0],
      privacy: record.privacyStatus === 'SHARED_ANONYMOUSLY' ? 'anonymous_public' : 'private',
      createdAt: record.createdAt
    };
    onSelectDream(submission, record.analysisResult as any);
  };

  return (
    <div className="saved-dreams-container container">
      {/* 1. Header & Section Badging */}
      <header className="saved-header">
        <div className="saved-eyebrow-badge">
          <Scroll size={14} className="text-gold" />
          <span>PERSONAL ARCHIVE · DREAM JOURNAL & PATTERNS</span>
        </div>
        <h1 className="saved-title">Your Private Dream Journal</h1>
        <p className="saved-sub">
          A confidential, persistent record of your nocturnal experiences, audited cultural perspectives, sleep science models, and recurring narrative patterns over time.
        </p>

        {/* Tab Switcher */}
        <div className="journal-tabs-bar">
          <button
            className={`journal-tab-btn ${activeTab === 'journal' ? 'active' : ''}`}
            onClick={() => setActiveTab('journal')}
          >
            <Bookmark size={15} />
            <span>Dream Archive</span>
            <span className="tab-count-badge">{dreams.length}</span>
          </button>

          <button
            className={`journal-tab-btn ${activeTab === 'patterns' ? 'active' : ''}`}
            onClick={() => setActiveTab('patterns')}
          >
            <Activity size={15} />
            <span>Recurring Patterns</span>
            {detectedPatterns.length > 0 && (
              <span className="tab-count-badge gold">{detectedPatterns.length}</span>
            )}
          </button>
        </div>
      </header>

      {/* 2. TAB 1: DREAM JOURNAL ARCHIVE */}
      {activeTab === 'journal' && (
        <div className="journal-view-content">
          {/* Controls & Search Bar */}
          {dreams.length > 0 && (
            <div className="journal-controls-card">
              <div className="journal-search-row">
                <div className="search-input-wrap">
                  <Search size={16} className="search-icon text-gold" />
                  <input
                    type="text"
                    className="journal-search-input"
                    placeholder="Search dreams by title, narrative details, motifs, or emotions..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* View Mode Toggle */}
                <div className="layout-toggle-pills">
                  <button
                    className={`layout-btn ${layoutMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setLayoutMode('grid')}
                    title="Grid Card View"
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    className={`layout-btn ${layoutMode === 'timeline' ? 'active' : ''}`}
                    onClick={() => setLayoutMode('timeline')}
                    title="Chronological Timeline View"
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>

              {/* Filter Pills Row */}
              <div className="journal-filters-row">
                <div className="filter-group">
                  <span className="filter-label">
                    <Filter size={12} className="text-gold" />
                    <span>Emotion:</span>
                  </span>
                  <select
                    className="filter-select"
                    value={selectedEmotionFilter}
                    onChange={e => setSelectedEmotionFilter(e.target.value)}
                  >
                    <option value="all">All Emotions</option>
                    {allEmotions.map(emo => (
                      <option key={emo} value={emo}>
                        {emo.charAt(0).toUpperCase() + emo.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <span className="filter-label">Motif:</span>
                  <select
                    className="filter-select"
                    value={selectedMotifFilter}
                    onChange={e => setSelectedMotifFilter(e.target.value)}
                  >
                    <option value="all">All Motifs</option>
                    {allMotifs.map(mot => (
                      <option key={mot} value={mot}>
                        #{mot}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <span className="filter-label">Privacy:</span>
                  <select
                    className="filter-select"
                    value={selectedPrivacyFilter}
                    onChange={e => setSelectedPrivacyFilter(e.target.value as any)}
                  >
                    <option value="all">All Dreams</option>
                    <option value="PRIVATE">Private Only</option>
                    <option value="SHARED_ANONYMOUSLY">Shared Anonymously</option>
                  </select>
                </div>

                <div className="filter-group sort-group">
                  <span className="filter-label">Sort:</span>
                  <select
                    className="filter-select"
                    value={sortOrder}
                    onChange={e => setSortOrder(e.target.value as any)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Dream Items List / Grid */}
          {filteredDreams.length > 0 ? (
            layoutMode === 'grid' ? (
              <div className="saved-entries-grid">
                {filteredDreams.map(dream => (
                  <article
                    key={dream.dreamId}
                    className="saved-entry-card"
                    onClick={() => handleOpenDream(dream)}
                  >
                    <div className="entry-card-layout">
                      {/* Artwork Thumbnail */}
                      {dream.artworkReference?.artworkUrl ? (
                        <div className="entry-thumbnail-box">
                          <img
                            src={dream.artworkReference.artworkUrl}
                            alt={dream.title}
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
                              {new Date(dream.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </span>

                          <div className="entry-actions-top">
                            {/* Privacy Toggle Badge */}
                            <button
                              className={`privacy-toggle-btn ${dream.privacyStatus === 'PRIVATE' ? 'private' : 'shared'}`}
                              onClick={e => handleTogglePrivacy(dream, e)}
                              title={
                                dream.privacyStatus === 'PRIVATE'
                                  ? 'Private to your local vault. Click to share anonymously.'
                                  : 'Shared anonymously to community sanctuary. Click to make private.'
                              }
                            >
                              {dream.privacyStatus === 'PRIVATE' ? (
                                <>
                                  <Lock size={12} />
                                  <span>Private</span>
                                </>
                              ) : (
                                <>
                                  <Globe size={12} />
                                  <span>Shared</span>
                                </>
                              )}
                            </button>

                            <button
                              className="delete-entry-btn"
                              onClick={e => {
                                e.stopPropagation();
                                setDreamToDelete(dream);
                              }}
                              title="Delete from archive"
                              aria-label="Delete saved dream"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        <h3 className="entry-title">{dream.title}</h3>

                        <p className="entry-excerpt">
                          &quot;{dream.originalNarrative.length > 130
                            ? dream.originalNarrative.substring(0, 130) + '...'
                            : dream.originalNarrative}&quot;
                        </p>

                        {/* Emotion & Motif Tags */}
                        <div className="entry-tags-row">
                          {dream.emotions.slice(0, 2).map((emo, idx) => (
                            <span key={`emo-${idx}`} className="entry-emotion-tag">
                              {emo}
                            </span>
                          ))}
                          {dream.motifs.slice(0, 3).map((sym, idx) => (
                            <span key={`sym-${idx}`} className="entry-tag">
                              #{sym}
                            </span>
                          ))}
                        </div>

                        {/* Reflection Quote Preview */}
                        {dream.creativeReflection && (
                          <div className="entry-reflection-preview">
                            <Sparkles size={12} className="text-gold" />
                            <span>&quot;{dream.creativeReflection}&quot;</span>
                          </div>
                        )}

                        <div className="entry-footer">
                          <span className="sources-count">
                            {dream.analysisResult.culturalPerspectives?.length || 0} Cultural · {dream.analysisResult.psychologyPerspectives?.length || 0} Science
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
              /* TIMELINE VIEW */
              <div className="journal-timeline-view">
                <div className="timeline-spine"></div>
                {filteredDreams.map(dream => (
                  <div
                    key={dream.dreamId}
                    className="timeline-item-card"
                    onClick={() => handleOpenDream(dream)}
                  >
                    <div className="timeline-dot"></div>
                    <div className="timeline-date-label">
                      {new Date(dream.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      }).toUpperCase()}
                    </div>

                    <div className="timeline-card-body">
                      <div className="timeline-card-header">
                        <h4 className="timeline-dream-title">{dream.title}</h4>
                        <div className="timeline-badges-row">
                          <span className={`privacy-mini-badge ${dream.privacyStatus === 'PRIVATE' ? 'private' : 'shared'}`}>
                            {dream.privacyStatus === 'PRIVATE' ? <Lock size={10} /> : <Globe size={10} />}
                            <span>{dream.privacyStatus === 'PRIVATE' ? 'Private' : 'Shared'}</span>
                          </span>
                          <button
                            className="delete-entry-btn mini-btn"
                            onClick={e => {
                              e.stopPropagation();
                              setDreamToDelete(dream);
                            }}
                            title="Delete dream"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <p className="timeline-excerpt">
                        &quot;{dream.originalNarrative.length > 160
                          ? dream.originalNarrative.substring(0, 160) + '...'
                          : dream.originalNarrative}&quot;
                      </p>

                      <div className="timeline-tags">
                        {dream.motifs.slice(0, 4).map((mot, i) => (
                          <span key={i} className="timeline-motif-pill">#{mot}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : dreams.length > 0 ? (
            <div className="no-filter-matches-box">
              <Search size={28} className="text-muted" />
              <h4>No Dreams Match Your Filter</h4>
              <p>Try clearing your search query or selecting &quot;All Emotions&quot; and &quot;All Motifs&quot;.</p>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedEmotionFilter('all');
                  setSelectedMotifFilter('all');
                  setSelectedPrivacyFilter('all');
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="saved-empty-state">
              <div className="empty-icon-box">
                <Bookmark size={36} className="text-gold" />
              </div>
              <h3>Your Personal Archive is Empty</h3>
              <p>
                Save your dream analyses to build a private nocturnal archive and discover recurring narrative patterns over time.
              </p>
              <button className="btn btn-primary" onClick={onNewDream}>
                <Sparkles size={16} />
                <span>Tell Me Your Dream →</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. TAB 2: RECURRING PATTERN EXPLORER */}
      {activeTab === 'patterns' && (
        <div className="patterns-view-content">
          <div className="pattern-intro-banner">
            <div className="pattern-intro-left">
              <TrendingUp size={20} className="text-gold" />
              <div>
                <h3 className="pattern-intro-title">Your Observed Nocturnal Patterns</h3>
                <p className="pattern-intro-desc">
                  Strictly descriptive observations across your dream history. Somnithos documents what motifs, settings, and emotional sequences recur without fabricating psychological diagnoses.
                </p>
              </div>
            </div>
            <div className="pattern-stat-box">
              <span className="stat-big-num">{detectedPatterns.length}</span>
              <span className="stat-label">Observed Patterns</span>
            </div>
          </div>

          {detectedPatterns.length > 0 ? (
            <div className="patterns-cards-grid">
              {detectedPatterns.map(pattern => (
                <div
                  key={pattern.id}
                  className="pattern-explorer-card"
                  onClick={() => setSelectedPattern(pattern)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedPattern(pattern);
                  }}
                >
                  <div className="pattern-card-top">
                    <span className={`pattern-type-tag ${pattern.type.toLowerCase()}`}>
                      {pattern.type.replace(/_/g, ' ')}
                    </span>
                    <span className="pattern-freq-pill">
                      {pattern.count} {pattern.count === 1 ? 'dream' : 'dreams'}
                    </span>
                  </div>

                  <h4 className="pattern-card-title">{pattern.label}</h4>
                  <p className="pattern-card-desc">{pattern.description}</p>

                  <div className="pattern-card-footer">
                    <span className="pattern-date-span">
                      <Clock size={12} className="text-gold" />
                      <span>
                        {new Date(pattern.firstObservedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        {' — '}
                        {new Date(pattern.lastObservedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </span>

                    <span className="pattern-inspect-link">
                      <span>View Timeline</span>
                      <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="pattern-empty-state">
              <div className="empty-icon-box">
                <Activity size={36} className="text-gold" />
              </div>
              <h3>Patterns Emerge with Time</h3>
              <p>
                You need a few saved dreams before Somnithos can identify recurring motifs, settings, or emotional sequences.
              </p>
              <button className="btn btn-secondary" onClick={onNewDream}>
                <Sparkles size={16} />
                <span>Explore Another Dream</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. PATTERN DETAIL DRAWER */}
      {selectedPattern && (
        <div className="pattern-drawer-backdrop" onClick={() => setSelectedPattern(null)}>
          <div
            className="pattern-drawer-panel"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-label={`Pattern detail for ${selectedPattern.label}`}
          >
            <div className="drawer-header">
              <div>
                <span className="pattern-type-tag gold">{selectedPattern.type.replace(/_/g, ' ')}</span>
                <h3 className="drawer-title">{selectedPattern.label}</h3>
              </div>
              <button className="drawer-close-btn" onClick={() => setSelectedPattern(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              <div className="pattern-summary-box">
                <p className="pattern-primary-statement">{selectedPattern.description}</p>
                <div className="pattern-confidence-row">
                  <span className="confidence-label">Observed Frequency:</span>
                  <span className="confidence-val">
                    {selectedPattern.count} out of {selectedPattern.totalDreams} saved dreams ({Math.round(selectedPattern.confidence * 100)}%)
                  </span>
                </div>
              </div>

              {/* Chronological Pattern Timeline */}
              <div className="pattern-occurrences-section">
                <h4 className="occurrences-title">Occurrences Across Time</h4>
                <div className="pattern-timeline-list">
                  {DreamPatternEngine.getDreamsForPattern(selectedPattern, dreams).map((matchDream) => (
                    <div
                      key={matchDream.dreamId}
                      className="pattern-occurrence-item"
                      onClick={() => {
                        setSelectedPattern(null);
                        handleOpenDream(matchDream);
                      }}
                    >
                      <div className="occurrence-date-pill">
                        {new Date(matchDream.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>

                      <div className="occurrence-info">
                        <h5 className="occurrence-dream-title">{matchDream.title}</h5>
                        <p className="occurrence-excerpt">&quot;{matchDream.originalNarrative}&quot;</p>
                      </div>

                      <button className="open-synthesis-mini-btn" title="Open complete dream analysis">
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pattern-non-diagnostic-note">
                <HelpCircle size={14} className="text-gold" />
                <span>
                  Somnithos does not assign fixed universal psychological meanings to patterns. Recurring elements represent observed nocturnal themes across your personal archive.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. DELETE CONFIRMATION MODAL */}
      {dreamToDelete && (
        <div className="confirm-delete-backdrop" onClick={() => setDreamToDelete(null)}>
          <div
            className="confirm-delete-modal"
            onClick={e => e.stopPropagation()}
            role="alertdialog"
            aria-label="Confirm Dream Deletion"
          >
            <div className="delete-modal-icon-row">
              <AlertTriangle size={28} className="text-amber" />
              <h3>Delete Saved Dream</h3>
            </div>

            <p className="delete-modal-text">
              Are you sure you want to permanently delete <strong>&quot;{dreamToDelete.title}&quot;</strong> from your private dream archive?
            </p>

            <p className="delete-modal-subtext">
              This action will remove the dream record, extracted features, and generated artwork from your local storage vault.
            </p>

            <div className="delete-modal-actions">
              <button className="btn btn-ghost" onClick={() => setDreamToDelete(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>
                <Trash2 size={16} />
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
