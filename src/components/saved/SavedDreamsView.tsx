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
  BookOpen,
  Heart,
  Compass
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

  // Privacy Confirmation Modal State
  const [privacyModalDream, setPrivacyModalDream] = useState<SavedDreamRecord | null>(null);
  const [privacyAction, setPrivacyAction] = useState<'SHARE' | 'STOP_SHARING'>('SHARE');

  const handleConfirmDelete = async () => {
    if (!dreamToDelete) return;
    StorageService.deleteSavedDream(dreamToDelete.dreamId);
    setDreamToDelete(null);
    await loadDreams();
  };

  const handleOpenPrivacyModal = (dream: SavedDreamRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setPrivacyModalDream(dream);
    setPrivacyAction(dream.privacyStatus === 'PRIVATE' ? 'SHARE' : 'STOP_SHARING');
  };

  const handleConfirmPrivacyToggle = async () => {
    if (!privacyModalDream) return;
    const newStatus = privacyAction === 'SHARE' ? 'SHARED_ANONYMOUSLY' : 'PRIVATE';
    await StorageService.updateDreamPrivacy(privacyModalDream.dreamId, newStatus);
    setPrivacyModalDream(null);
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
                              onClick={e => handleOpenPrivacyModal(dream, e)}
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
                          <button
                            className={`privacy-mini-badge ${dream.privacyStatus === 'PRIVATE' ? 'private' : 'shared'}`}
                            onClick={e => handleOpenPrivacyModal(dream, e)}
                            title={
                              dream.privacyStatus === 'PRIVATE'
                                ? 'Click to share anonymously with community'
                                : 'Click to stop sharing and make private'
                            }
                          >
                            {dream.privacyStatus === 'PRIVATE' ? <Lock size={10} /> : <Globe size={10} />}
                            <span>{dream.privacyStatus === 'PRIVATE' ? 'Private' : 'Shared'}</span>
                          </button>
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
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="empty-archive-state">
              <div className="empty-icon-box">
                <BookOpen size={36} className="text-gold" />
              </div>
              <h3>Your Dream Vault is Quiet</h3>
              <p>
                Analyze a dream and tap <strong>&quot;Save to Dream Journal&quot;</strong> to privately archive your nocturnal journeys.
              </p>
              <button className="btn btn-primary" onClick={onNewDream}>
                <Sparkles size={16} />
                <span>Begin Dream Analysis</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. RECURRING PATTERNS VIEW */}
      {activeTab === 'patterns' && (
        <div className="patterns-view-wrapper">
          <div className="patterns-header-box">
            <div className="patterns-title-row">
              <h3>Observed Recurring Patterns</h3>
              <span className="patterns-count-badge">
                {detectedPatterns.length} {detectedPatterns.length === 1 ? 'Pattern Detected' : 'Patterns Detected'}
              </span>
            </div>
            <p className="patterns-subtitle">
              Patterns represent observed repetitions across your saved dreams (&ge; 2 occurrences). Somnithos provides descriptive observations, not psychological diagnoses.
            </p>
          </div>

          {detectedPatterns.length > 0 ? (
            <div className="patterns-grid">
              {detectedPatterns.map(pattern => (
                <div
                  key={pattern.id}
                  className="pattern-card"
                  onClick={() => setSelectedPattern(pattern)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPattern(pattern);
                    }
                  }}
                >
                  <div className="pattern-card-top">
                    <span className="pattern-type-tag">
                      {pattern.type === 'MOTIF' && <Sparkles size={12} />}
                      {pattern.type === 'EMOTION' && <Heart size={12} />}
                      {pattern.type === 'EMOTIONAL_SEQUENCE' && <TrendingUp size={12} />}
                      {pattern.type === 'SETTING' && <Compass size={12} />}
                      <span>{pattern.type.replace('_', ' ')}</span>
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
            aria-modal="true"
            aria-labelledby="pattern-drawer-title"
          >
            <div className="pattern-drawer-header">
              <div>
                <span className="drawer-eyebrow">OBSERVED PATTERN DETAIL</span>
                <h3 id="pattern-drawer-title" className="drawer-title">{selectedPattern.label}</h3>
              </div>
              <button
                className="close-drawer-btn"
                onClick={() => setSelectedPattern(null)}
                aria-label="Close pattern drawer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="pattern-drawer-content">
              {/* Stats Bar */}
              <div className="pattern-stats-row">
                <div className="stat-box">
                  <span className="stat-num">{selectedPattern.count}</span>
                  <span className="stat-lbl">Dream Occurrences</span>
                </div>
                <div className="stat-box">
                  <span className="stat-num">{Math.round((selectedPattern.confidence || 0) * 100)}%</span>
                  <span className="stat-lbl">Archive Presence</span>
                </div>
                <div className="stat-box">
                  <span className="stat-num">{selectedPattern.type.replace('_', ' ')}</span>
                  <span className="stat-lbl">Pattern Dimension</span>
                </div>
              </div>

              {/* Descriptive Observation */}
              <div className="pattern-summary-box">
                <h4>Observational Summary</h4>
                <p>{selectedPattern.description}</p>
                <div className="pattern-date-span-box">
                  <Calendar size={14} className="text-gold" />
                  <span>
                    Observed between {new Date(selectedPattern.firstObservedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} and {new Date(selectedPattern.lastObservedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
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
                      role="button"
                      tabIndex={0}
                    >
                      <div className="occurrence-meta">
                        <span className="occurrence-date">
                          {new Date(matchDream.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span className={`occurrence-privacy ${matchDream.privacyStatus === 'PRIVATE' ? 'private' : 'shared'}`}>
                          {matchDream.privacyStatus === 'PRIVATE' ? <Lock size={10} /> : <Globe size={10} />}
                          <span>{matchDream.privacyStatus === 'PRIVATE' ? 'Private' : 'Shared'}</span>
                        </span>
                      </div>

                      <h5 className="occurrence-dream-title">{matchDream.title}</h5>
                      <p className="occurrence-snippet">&quot;{matchDream.originalNarrative}&quot;</p>

                      <button className="open-synthesis-mini-btn" title="Open complete dream analysis">
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. PRIVACY CONFIRMATION MODAL (Step 7 Explicit Consent Flow) */}
      {privacyModalDream && (
        <div className="modal-overlay" onClick={() => setPrivacyModalDream(null)} role="dialog" aria-modal="true">
          <div className="modal-content privacy-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-icon-wrap">
                {privacyAction === 'SHARE' ? (
                  <Globe size={22} className="text-gold" />
                ) : (
                  <Lock size={22} className="text-gold" />
                )}
                <h3 className="modal-title">
                  {privacyAction === 'SHARE' ? 'Share Dream Anonymously' : 'Stop Sharing Dream'}
                </h3>
              </div>
              <button
                className="close-btn"
                onClick={() => setPrivacyModalDream(null)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {privacyAction === 'SHARE' ? (
                <>
                  <p className="privacy-modal-lead">
                    This will share your dream anonymously with the Somnithos community without your personal identity.
                  </p>
                  <div className="privacy-comparison-box">
                    <div className="comparison-item">
                      <Lock size={14} className="text-gold" />
                      <div>
                        <strong>Private (Default):</strong> Only you can view this dream in your local vault.
                      </div>
                    </div>
                    <div className="comparison-item">
                      <Globe size={14} className="text-gold" />
                      <div>
                        <strong>Shared Anonymously:</strong> Visible to the community gallery without your name, email, or account metadata.
                      </div>
                    </div>
                  </div>
                  <p className="privacy-modal-subtext">
                    You can revoke sharing and return this dream to private status at any time.
                  </p>
                </>
              ) : (
                <>
                  <p className="privacy-modal-lead">
                    Are you sure you want to stop sharing <strong>&quot;{privacyModalDream.title}&quot;</strong>?
                  </p>
                  <p className="privacy-modal-subtext">
                    This dream will immediately be removed from the public community wall and search listings. It will remain safely in your private journal.
                  </p>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setPrivacyModalDream(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmPrivacyToggle}
              >
                {privacyAction === 'SHARE' ? 'Share Anonymously' : 'Stop Sharing'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. DELETE CONFIRMATION MODAL */}
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
              This action will remove the dream record, extracted features, and generated artwork from your local storage vault and community listings.
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
