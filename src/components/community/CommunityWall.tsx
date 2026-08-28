import React, { useState } from 'react';
import type { CommunityDreamPost } from '../../types/dream';
import { StorageService } from '../../services/storageService';
import {
  Search,
  Sparkles,
  Heart,
  HelpCircle,
  Sun,
  Bookmark,
  Flag,
  Check,
  X,
  Lock,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CommunityWall: React.FC = () => {
  const [posts, setPosts] = useState<CommunityDreamPost[]>(() => StorageService.getCommunityPosts());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmotionFilter, setSelectedEmotionFilter] = useState<string>('all');
  const [reportModalPost, setReportModalPost] = useState<CommunityDreamPost | null>(null);
  const [reportReason, setReportReason] = useState<string>('inappropriate');
  const [reportSubmitted, setReportSubmitted] = useState<boolean>(false);
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());

  const emotionsList = ['all', 'Wonder', 'Peace', 'Curiosity', 'Fear', 'Awe', 'Nostalgia'];

  const handleToggleReaction = (postId: string, type: 'resonated' | 'mystified' | 'comforted') => {
    const result = StorageService.toggleReaction(postId, type);
    if (result.success) {
      setPosts(StorageService.getCommunityPosts());
      if (!StorageService.hasUserReacted(postId, type)) {
        // Just unreacted
      } else {
        // Just reacted
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.85 }
        });
      }
    }
  };

  const handleSavePost = (post: CommunityDreamPost) => {
    setSavedPosts(prev => {
      const next = new Set(prev);
      if (next.has(post.id)) {
        next.delete(post.id);
      } else {
        next.add(post.id);
      }
      return next;
    });
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setReportModalPost(null);
    }, 1800);
  };

  const filteredPosts = posts.filter(post => {
    const matchesEmotion =
      selectedEmotionFilter === 'all' ||
      post.emotions.some(e => e.toLowerCase() === selectedEmotionFilter.toLowerCase());
    const matchesQuery =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.fullDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.symbols.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      post.originalReflection.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEmotion && matchesQuery;
  });

  return (
    <div className="community-wall-container container">
      {/* Header */}
      <div className="community-header">
        <div className="community-eyebrow-badge">
          <Lock size={14} />
          <span>STRICT PRIVACY GUARANTEE · ZERO IDENTIFIERS STORED</span>
        </div>
        <h1 className="community-title">Anonymous Dream Sanctuary</h1>
        <p className="community-sub">
          A collective tapestry of nocturnal thoughts, reflections, and surreal visions shared anonymously by dreamers worldwide.
        </p>

        {/* Search & Filter */}
        <div className="community-filter-row">
          <div className="comm-search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="comm-search-input"
              placeholder="Search community dreams by motif or feeling..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                <X size={16} />
              </button>
            )}
          </div>

          <div className="comm-emotion-pills">
            {emotionsList.map(emo => (
              <button
                key={emo}
                className={`comm-emo-pill ${selectedEmotionFilter === emo ? 'active' : ''}`}
                onClick={() => setSelectedEmotionFilter(emo)}
              >
                {emo === 'all' ? 'All Emotions' : emo}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="community-posts-grid">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => {
            const hasResonated = StorageService.hasUserReacted(post.id, 'resonated');
            const hasMystified = StorageService.hasUserReacted(post.id, 'mystified');
            const hasComforted = StorageService.hasUserReacted(post.id, 'comforted');
            const isSaved = savedPosts.has(post.id);

            return (
              <div key={post.id} className="community-post-card">
                {/* Post Top Meta */}
                <div className="post-top-meta">
                  <div className="meta-left">
                    <span className="anon-badge">ANONYMOUS DREAMER</span>
                    {post.isDemoData && (
                      <span className="demo-data-badge" title="Pre-packaged sample dream for demonstration">
                        DEMO SAMPLE
                      </span>
                    )}
                  </div>
                  <span className="post-time">{post.isDemoData ? 'Sample Entry' : post.postedAt}</span>
                </div>

                <h3 className="post-title">{post.title}</h3>
                <p className="post-description">&quot;{post.fullDescription}&quot;</p>

                {/* Motifs and Emotions */}
                <div className="post-tags-row">
                  {post.symbols.map((sym, i) => (
                    <span key={i} className="post-motif-tag">
                      #{sym}
                    </span>
                  ))}
                  {post.emotions.map((emo, i) => (
                    <span key={i} className="post-emotion-tag">
                      {emo}
                    </span>
                  ))}
                </div>

                {/* Original Reflection */}
                <div className="post-reflection-box">
                  <Sparkles size={14} className="reflection-icon" />
                  <p className="reflection-text">&quot;{post.originalReflection}&quot;</p>
                </div>

                {/* Reaction and Action Bar */}
                <div className="post-actions-bar">
                  <div className="reactions-group">
                    <button
                      className={`reaction-btn ${hasResonated ? 'active' : ''}`}
                      onClick={() => handleToggleReaction(post.id, 'resonated')}
                      title="Resonated with this dream"
                    >
                      <Heart size={14} />
                      <span>Resonated ({post.reactions.resonated})</span>
                    </button>

                    <button
                      className={`reaction-btn ${hasMystified ? 'active' : ''}`}
                      onClick={() => handleToggleReaction(post.id, 'mystified')}
                      title="Mystified by this dream"
                    >
                      <HelpCircle size={14} />
                      <span>Mystified ({post.reactions.mystified})</span>
                    </button>

                    <button
                      className={`reaction-btn ${hasComforted ? 'active' : ''}`}
                      onClick={() => handleToggleReaction(post.id, 'comforted')}
                      title="Found comfort in this dream"
                    >
                      <Sun size={14} />
                      <span>Comforted ({post.reactions.comforted})</span>
                    </button>
                  </div>

                  <div className="post-right-actions">
                    <button
                      className={`save-post-btn ${isSaved ? 'saved' : ''}`}
                      onClick={() => handleSavePost(post)}
                      title="Save this dream reflection"
                    >
                      <Bookmark size={15} />
                    </button>
                    <button
                      className="flag-post-btn"
                      onClick={() => setReportModalPost(post)}
                      title="Report inappropriate content"
                    >
                      <Flag size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="community-empty-state">
            <p>No community dreams matched your search filters.</p>
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
      </div>

      {/* Report Modal */}
      {reportModalPost && (
        <div className="modal-overlay" onClick={() => setReportModalPost(null)}>
          <div className="modal-content report-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-icon-wrap">
                <AlertCircle size={20} className="alert-red" />
                <h3 className="modal-title">Report Community Dream</h3>
              </div>
              <button className="close-btn" onClick={() => setReportModalPost(null)}>
                <X size={20} />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="report-success-state">
                <Check size={32} className="success-green" />
                <h4>Thank you for keeping the sanctuary safe.</h4>
                <p>Our automated curation team has received your report for review.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit}>
                <div className="modal-body">
                  <p className="report-intro">
                    You are reporting the dream: <strong>&quot;{reportModalPost.title}&quot;</strong>.
                  </p>

                  <div className="form-group">
                    <label className="form-label">Reason for Report:</label>
                    <select
                      className="form-select"
                      value={reportReason}
                      onChange={e => setReportReason(e.target.value)}
                    >
                      <option value="inappropriate">Inappropriate or offensive content</option>
                      <option value="privacy">Contains personally identifiable information</option>
                      <option value="harassment">Harassment or harmful language</option>
                      <option value="spam">Spam or promotional material</option>
                    </select>
                  </div>

                  <p className="report-disclaimer">
                    Somnithos is an anonymous sanctuary dedicated to thoughtful reflection and evidence-first scholarship. All reports are promptly investigated.
                  </p>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setReportModalPost(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
