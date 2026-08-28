import React, { useState, useEffect } from 'react';
import type { CommunityDreamRecord, ReportCategory } from '../../domain/community/CommunityDream';
import { CommunityService } from '../../services/community/CommunityService';
import {
  Search,
  Sparkles,
  Heart,
  HelpCircle,
  Sun,
  Flag,
  Check,
  X,
  Lock,
  AlertCircle,
  UserX,
  Palette,
  Feather,
  Info,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CommunityWall: React.FC = () => {
  const [dreams, setDreams] = useState<CommunityDreamRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmotionFilter, setSelectedEmotionFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Report Modal State
  const [reportModalDream, setReportModalDream] = useState<CommunityDreamRecord | null>(null);
  const [reportCategory, setReportCategory] = useState<ReportCategory>('harassment');
  const [reportExplanation, setReportExplanation] = useState<string>('');
  const [reportSubmitted, setReportSubmitted] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportIsSubmitting, setReportIsSubmitting] = useState<boolean>(false);

  // Block Modal State
  const [blockModalAuthor, setBlockModalAuthor] = useState<{ authorId: string; dreamTitle: string } | null>(null);
  const [blockSuccessMessage, setBlockSuccessMessage] = useState<string | null>(null);

  const emotionsList = ['all', 'Wonder', 'Peace', 'Curiosity', 'Fear', 'Awe', 'Nostalgia'];

  const loadFeed = async () => {
    setIsLoading(true);
    try {
      const feed = await CommunityService.getCommunityFeed({
        emotion: selectedEmotionFilter !== 'all' ? selectedEmotionFilter : undefined,
        searchQuery: searchQuery.trim() || undefined
      });
      setDreams(feed);
    } catch (e) {
      console.warn('Failed to load community feed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [selectedEmotionFilter, searchQuery]);

  const handleToggleReaction = async (dream: CommunityDreamRecord, type: 'resonated' | 'mystified' | 'comforted') => {
    const result = await CommunityService.toggleReaction(dream.id, type);
    if (result.success) {
      loadFeed();
      if (CommunityService.hasUserReacted(dream.id, type)) {
        confetti({
          particleCount: 20,
          spread: 40,
          origin: { y: 0.85 }
        });
      }
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalDream) return;

    setReportIsSubmitting(true);
    setReportError(null);

    const result = await CommunityService.reportDream(
      reportModalDream.id,
      reportCategory,
      reportExplanation.trim() || undefined
    );

    setReportIsSubmitting(false);

    if (result.success) {
      setReportSubmitted(true);
      setTimeout(() => {
        setReportSubmitted(false);
        setReportModalDream(null);
        setReportExplanation('');
        loadFeed();
      }, 1800);
    } else {
      setReportError(result.message);
    }
  };

  const handleBlockAuthor = (authorId: string) => {
    CommunityService.blockAuthor(authorId);
    setBlockModalAuthor(null);
    setBlockSuccessMessage('Author has been blocked. Their dreams will no longer appear in your feed.');
    loadFeed();
    setTimeout(() => {
      setBlockSuccessMessage(null);
    }, 3500);
  };

  return (
    <div className="community-wall-container container">
      {/* 1. Header & Strict Anonymity Assurance */}
      <header className="community-header">
        <div className="community-eyebrow-badge">
          <Lock size={14} className="text-gold" />
          <span>STRICT PRIVACY GUARANTEE · ZERO PERSONAL IDENTIFIERS STORED</span>
        </div>
        <h1 className="community-title">Anonymous Dream Sanctuary</h1>
        <p className="community-sub">
          A quiet gallery of human nocturnal experiences, shared anonymously by dreamers worldwide.
        </p>

        {/* Epistemic UGC Boundary Banner */}
        <div className="community-ugc-banner">
          <Info size={16} className="ugc-banner-icon" />
          <div className="ugc-banner-text">
            <strong>Community Experience & User-Generated Content:</strong> Dreams and personal notes shared here represent personal human stories and perspectives. They are not verified historical traditions, scientific evidence, or psychological diagnoses.
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {blockSuccessMessage && (
          <div className="community-alert-toast" role="alert">
            <ShieldCheck size={16} className="text-gold" />
            <span>{blockSuccessMessage}</span>
          </div>
        )}

        {/* Search & Filter Row */}
        <div className="community-filter-row">
          <div className="comm-search-wrapper">
            <Search size={18} className="search-icon" aria-hidden="true" />
            <input
              type="text"
              className="comm-search-input"
              placeholder="Search shared dreams by motif, emotion, or narrative..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search community dreams"
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="comm-emotion-pills" role="tablist" aria-label="Filter dreams by emotion">
            {emotionsList.map(emo => (
              <button
                key={emo}
                role="tab"
                aria-selected={selectedEmotionFilter === emo}
                className={`comm-emo-pill ${selectedEmotionFilter === emo ? 'active' : ''}`}
                onClick={() => setSelectedEmotionFilter(emo)}
              >
                {emo === 'all' ? 'All Emotions' : emo}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 2. Dreams Grid */}
      <main className="community-posts-grid">
        {isLoading ? (
          <div className="community-loading-state">
            <div className="loading-spinner" />
            <p>Gathering nocturnal reflections...</p>
          </div>
        ) : dreams.length > 0 ? (
          dreams.map(dream => {
            const hasResonated = CommunityService.hasUserReacted(dream.id, 'resonated');
            const hasMystified = CommunityService.hasUserReacted(dream.id, 'mystified');
            const hasComforted = CommunityService.hasUserReacted(dream.id, 'comforted');

            return (
              <article key={dream.id} className="community-post-card" aria-labelledby={`dream-title-${dream.id}`}>
                {/* Top Metadata */}
                <div className="post-top-meta">
                  <div className="meta-left">
                    <span className="anon-badge">ANONYMOUS DREAMER</span>
                    {dream.isDemoData && (
                      <span className="demo-data-badge" title="Pre-packaged sample dream for demonstration">
                        DEMO SAMPLE
                      </span>
                    )}
                    <span className="ugc-tag">UGC</span>
                  </div>
                  <span className="post-time">
                    {dream.isDemoData ? 'Archival Sample' : new Date(dream.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {/* Dream Title & Narrative */}
                <h3 id={`dream-title-${dream.id}`} className="post-title">{dream.title}</h3>
                <p className="post-description">&quot;{dream.narrative}&quot;</p>

                {/* Motifs and Emotions */}
                <div className="post-tags-row">
                  {dream.motifs.map((motif, i) => (
                    <span key={i} className="post-motif-tag">
                      #{motif}
                    </span>
                  ))}
                  {dream.emotions.map((emo, i) => (
                    <span key={i} className="post-emotion-tag">
                      {emo}
                    </span>
                  ))}
                </div>

                {/* AI Artwork (if present, with explicit AI labeling) */}
                {dream.artworkReference?.artworkUrl && (
                  <div className="post-artwork-wrap">
                    <img
                      src={dream.artworkReference.artworkUrl}
                      alt={`Artistic visualization for ${dream.title}`}
                      className="post-artwork-img"
                      loading="lazy"
                    />
                    <div className="post-artwork-badge">
                      <Palette size={12} />
                      <span>{dream.artworkReference.label}</span>
                    </div>
                  </div>
                )}

                {/* AI Reflection (if present, with explicit AI labeling) */}
                {dream.aiReflection && (
                  <div className="post-reflection-box">
                    <div className="reflection-badge">
                      <Sparkles size={13} className="text-gold" />
                      <span>{dream.aiReflection.label}</span>
                    </div>
                    <p className="reflection-text">&quot;{dream.aiReflection.reflectionText}&quot;</p>
                  </div>
                )}

                {/* Closing Thought (if present, with explicit AI labeling) */}
                {dream.closingThought && (
                  <div className="post-thought-box">
                    <div className="thought-badge">
                      <Feather size={12} className="text-gold" />
                      <span>{dream.closingThought.label}</span>
                    </div>
                    <p className="thought-text">{dream.closingThought.thoughtText}</p>
                  </div>
                )}

                {/* Action Bar (Reactions, Block, Report) */}
                <div className="post-actions-bar">
                  <div className="reactions-group">
                    <button
                      className={`reaction-btn ${hasResonated ? 'active' : ''}`}
                      onClick={() => handleToggleReaction(dream, 'resonated')}
                      title="Resonated with this dream"
                      aria-label={`Resonated with dream. Current count: ${dream.reactionCount.resonated}`}
                    >
                      <Heart size={14} />
                      <span>Resonated ({dream.reactionCount.resonated})</span>
                    </button>

                    <button
                      className={`reaction-btn ${hasMystified ? 'active' : ''}`}
                      onClick={() => handleToggleReaction(dream, 'mystified')}
                      title="Mystified by this dream"
                      aria-label={`Mystified by dream. Current count: ${dream.reactionCount.mystified}`}
                    >
                      <HelpCircle size={14} />
                      <span>Mystified ({dream.reactionCount.mystified})</span>
                    </button>

                    <button
                      className={`reaction-btn ${hasComforted ? 'active' : ''}`}
                      onClick={() => handleToggleReaction(dream, 'comforted')}
                      title="Found comfort in this dream"
                      aria-label={`Comforted by dream. Current count: ${dream.reactionCount.comforted}`}
                    >
                      <Sun size={14} />
                      <span>Comforted ({dream.reactionCount.comforted})</span>
                    </button>
                  </div>

                  <div className="post-right-actions">
                    <button
                      className="block-author-btn"
                      onClick={() => setBlockModalAuthor({ authorId: dream.anonymousAuthorId, dreamTitle: dream.title })}
                      title="Hide dreams from this author"
                      aria-label="Hide dreams from this author"
                    >
                      <UserX size={14} />
                    </button>
                    <button
                      className="flag-post-btn"
                      onClick={() => setReportModalDream(dream)}
                      title="Report safety or privacy concern"
                      aria-label="Report safety or privacy concern"
                    >
                      <Flag size={14} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="community-empty-state">
            <p>No community dreams matched your current search filters.</p>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearchQuery('');
                setSelectedEmotionFilter('all');
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>

      {/* 3. Report Modal */}
      {reportModalDream && (
        <div className="modal-overlay" onClick={() => setReportModalDream(null)} role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
          <div className="modal-content report-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-icon-wrap">
                <AlertCircle size={20} className="alert-red" />
                <h3 id="report-modal-title" className="modal-title">Report Community Dream</h3>
              </div>
              <button
                className="close-btn"
                onClick={() => setReportModalDream(null)}
                aria-label="Close report dialog"
              >
                <X size={20} />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="report-success-state" role="status">
                <Check size={32} className="success-green" />
                <h4>Thank you for keeping Somnithos safe.</h4>
                <p>Our Trust & Safety curation team has received your report for review.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit}>
                <div className="modal-body">
                  <p className="report-intro">
                    You are reporting: <strong>&quot;{reportModalDream.title}&quot;</strong>.
                  </p>

                  {reportError && (
                    <div className="report-error-alert" role="alert">
                      <AlertCircle size={16} />
                      <span>{reportError}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label" htmlFor="report-category-select">Reason for Report:</label>
                    <select
                      id="report-category-select"
                      className="form-select"
                      value={reportCategory}
                      onChange={e => setReportCategory(e.target.value as ReportCategory)}
                    >
                      <option value="harassment">Harassment or harmful language</option>
                      <option value="sexual_content">Sexually explicit content</option>
                      <option value="graphic_violence">Graphic violence or gore</option>
                      <option value="hateful_content">Hate speech or discrimination</option>
                      <option value="self_harm">Self-harm or suicide encouragement</option>
                      <option value="personal_information">Contains personal / private information</option>
                      <option value="spam">Spam, commercial, or automated bot submission</option>
                      <option value="misleading_attribution">Misleading or fabricated attribution</option>
                      <option value="other">Other safety or policy concern</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="report-explanation">Optional Details:</label>
                    <textarea
                      id="report-explanation"
                      className="form-textarea"
                      placeholder="Add any helpful context (optional)..."
                      rows={3}
                      value={reportExplanation}
                      onChange={e => setReportExplanation(e.target.value)}
                    />
                  </div>

                  <p className="report-disclaimer">
                    Somnithos is an anonymous sanctuary dedicated to calm reflection. Your identity is never exposed to the author of the reported dream.
                  </p>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setReportModalDream(null)}
                    disabled={reportIsSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={reportIsSubmitting}
                  >
                    {reportIsSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 4. Block Author Confirmation Modal */}
      {blockModalAuthor && (
        <div className="modal-overlay" onClick={() => setBlockModalAuthor(null)} role="dialog" aria-modal="true" aria-labelledby="block-modal-title">
          <div className="modal-content block-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-icon-wrap">
                <UserX size={20} className="text-gold" />
                <h3 id="block-modal-title" className="modal-title">Hide Dreams From This Author</h3>
              </div>
              <button
                className="close-btn"
                onClick={() => setBlockModalAuthor(null)}
                aria-label="Close block dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p>
                Would you like to hide all dreams shared by this anonymous author?
              </p>
              <p className="block-note">
                Their dreams will immediately be hidden from your community wall and search results. You can unblock them at any time from your settings.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setBlockModalAuthor(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-secondary block-confirm-btn"
                onClick={() => handleBlockAuthor(blockModalAuthor.authorId)}
              >
                Hide Author
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
