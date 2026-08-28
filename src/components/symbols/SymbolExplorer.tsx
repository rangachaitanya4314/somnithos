import React, { useState } from 'react';
import { DREAM_SYMBOLS } from '../../data/dreamSymbols';
import type { DreamSymbolItem } from '../../types/dream';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { SourceViewerModal } from '../analysis/SourceViewerModal';
import type { SourceViewerTarget } from '../analysis/SourceViewerModal';
import {
  Search,
  ShieldCheck,
  Brain,
  History,
  AlertCircle,
  Compass,
  ChevronRight,
  X,
  BookOpen,
  Sparkles,
  Scroll,
  BookMarked
} from 'lucide-react';

interface SymbolExplorerProps {
  initialSelectedSymbolId?: string;
}

export const SymbolExplorer: React.FC<SymbolExplorerProps> = ({ initialSelectedSymbolId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeSymbolModal, setActiveSymbolModal] = useState<DreamSymbolItem | null>(() => {
    if (initialSelectedSymbolId) {
      return DREAM_SYMBOLS.find(s => s.id === initialSelectedSymbolId) || null;
    }
    return null;
  });
  const [sourceModalTarget, setSourceModalTarget] = useState<SourceViewerTarget | null>(null);

  const categories = [
    { id: 'all', label: 'All Archival Motifs' },
    { id: 'nature', label: 'Nature & Elements' },
    { id: 'movement', label: 'Movement & Sensation' },
    { id: 'creatures', label: 'Creatures & Beasts' },
    { id: 'body', label: 'Body & Somatosensory' },
    { id: 'places', label: 'Places & Portals' }
  ];

  const filteredSymbols = DREAM_SYMBOLS.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesQuery =
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summaryDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.relatedSymbols.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="symbols-explorer-container container">
      {/* Header */}
      <div className="symbols-header">
        <div className="submit-badge">
          <Scroll size={14} className="text-gold" />
          <span>EPITEMIC MOTIF COMPENDIUM</span>
        </div>
        <h1 className="symbols-title">Dream Symbols & Motifs</h1>
        <p className="symbols-sub">
          A source-first catalog exploring nocturnal imagery across documented historical texts and cognitive psychology models.
        </p>

        {/* Epistemic disclaimer banner */}
        <div className="symbol-epistemic-disclaimer">
          <ShieldCheck size={18} className="disclaimer-icon text-gold" />
          <div className="disclaimer-text">
            <strong>Methodology Standard:</strong> Somnithos firmly rejects dogmatic &quot;universal dream dictionaries.&quot; Every entry connects strictly to specific historical manuscripts or peer-reviewed cognitive neuroscience.
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="search-filter-row">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon text-gold" />
            <input
              type="text"
              className="search-input"
              placeholder="Search a symbol, feeling, or theme..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                <X size={16} />
              </button>
            )}
          </div>

          <div className="category-filter-pills">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Symbols */}
      <div className="symbols-cards-grid-full">
        {filteredSymbols.length > 0 ? (
          filteredSymbols.map(sym => (
            <article
              key={sym.id}
              className="symbol-full-card"
              onClick={() => setActiveSymbolModal(sym)}
            >
              <div className="card-top-row">
                <span className="symbol-cat-badge">{sym.category.toUpperCase()}</span>
                <span className="source-counter-badge">
                  <ShieldCheck size={12} className="text-gold" />
                  <span>
                    {sym.documentedCulturalInterpretations.length + sym.psychologicalPerspectives.length} Sources
                  </span>
                </span>
              </div>

              <h3 className="symbol-card-title">{sym.symbol}</h3>
              <p className="symbol-card-desc">{sym.summaryDescription}</p>

              <div className="card-sources-preview">
                {sym.documentedCulturalInterpretations.length > 0 && (
                  <div className="source-preview-item">
                    <History size={13} className="text-gold" />
                    <span>{sym.documentedCulturalInterpretations[0].exactTradition}</span>
                  </div>
                )}
                {sym.psychologicalPerspectives.length > 0 && (
                  <div className="source-preview-item">
                    <Brain size={13} className="text-cyan" />
                    <span>{sym.psychologicalPerspectives[0].conceptName}</span>
                  </div>
                )}
              </div>

              <div className="card-bottom-row">
                <div className="related-tags-list">
                  {sym.relatedSymbols.slice(0, 3).map((r, i) => (
                    <span key={i} className="related-pill">
                      #{r}
                    </span>
                  ))}
                </div>
                <span className="view-detail-btn">
                  <span>Explore Motif</span>
                  <ChevronRight size={14} />
                </span>
              </div>
            </article>
          ))
        ) : (
          <div className="empty-symbols-state">
            <p>No symbols matched your search query &quot;{searchQuery}&quot;.</p>
            <button className="btn btn-secondary" onClick={() => setSearchQuery('')}>
              Reset Search Filter
            </button>
          </div>
        )}
      </div>

      {/* Symbol Detail Modal */}
      {activeSymbolModal && (
        <div className="modal-overlay" onClick={() => setActiveSymbolModal(null)}>
          <div className="modal-content symbol-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="symbol-cat-badge">{activeSymbolModal.category.toUpperCase()}</span>
                <h2 className="modal-title">{activeSymbolModal.symbol}</h2>
              </div>
              <button
                className="close-btn"
                onClick={() => setActiveSymbolModal(null)}
                aria-label="Close symbol modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* 1. What is Documented (General Overview) */}
              <div className="modal-section">
                <h4 className="section-label">1. What is Documented</h4>
                <p className="detail-summary-text">{activeSymbolModal.summaryDescription}</p>
              </div>

              {/* 2. Cultural Perspectives & Historical Context */}
              <div className="modal-section">
                <div className="section-header-inline">
                  <History size={16} className="text-gold" />
                  <h4 className="section-label">2. Cultural Perspectives & Historical Manuscripts</h4>
                </div>

                {activeSymbolModal.documentedCulturalInterpretations.length > 0 ? (
                  <div className="detail-claims-list">
                    {activeSymbolModal.documentedCulturalInterpretations.map((claim, idx) => (
                      <div key={idx} className="detail-claim-item">
                        <div className="claim-item-top">
                          <div>
                            <span className="claim-tradition-title">{claim.exactTradition}</span>
                            <span className="claim-tradition-sub">
                              {claim.geographicContext} · {claim.historicalPeriod}
                            </span>
                          </div>
                          <EvidenceBadge level={claim.evidenceLevel} />
                        </div>
                        <p className="claim-item-statement">&quot;{claim.claim}&quot;</p>

                        {claim.source.supportingPassage && (
                          <div className="claim-item-quote">
                            <BookMarked size={13} className="text-gold inline-icon" />
                            <span>&quot;{claim.source.supportingPassage}&quot;</span>
                          </div>
                        )}

                        <div className="claim-item-footer">
                          <span className="source-name">
                            <BookOpen size={12} className="text-gold inline-icon" />
                            {claim.source.sourceTitle} ({claim.source.publicationDate})
                          </span>
                          <button
                            className="why-seeing-this-btn"
                            onClick={() =>
                              setSourceModalTarget({
                                type: 'cultural',
                                claim,
                                relevanceReason: `Documented primary record for ${activeSymbolModal.symbol}.`
                              })
                            }
                          >
                            <Compass size={13} className="text-gold" />
                            <span>Why Am I Seeing This?</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-claims-notice">
                    No verified ancient or regional manuscripts in our primary repository currently catalogue this symbol as a standardized omen.
                  </div>
                )}
              </div>

              {/* 3. Modern Research & Cognitive Science */}
              <div className="modal-section">
                <div className="section-header-inline">
                  <Brain size={16} className="text-cyan" />
                  <h4 className="section-label">3. Modern Research & Cognitive Findings</h4>
                </div>

                <div className="detail-claims-list">
                  {activeSymbolModal.psychologicalPerspectives.map((psy, idx) => (
                    <div key={idx} className="detail-claim-item">
                      <div className="claim-item-top">
                        <div>
                          <span className="claim-tradition-title">{psy.conceptName}</span>
                          <span className="claim-tradition-sub">
                            {psy.researchers} ({psy.publicationYear}) · {psy.source.institutionOrPublisher}
                          </span>
                        </div>
                        <EvidenceBadge level={psy.evidenceLevel} />
                      </div>
                      <p className="claim-item-statement">{psy.summary}</p>
                      <div className="limitation-item-note">
                        <strong>Scope & Limitations:</strong> {psy.documentedLimitations}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Possible Personal Associations */}
              <div className="modal-section">
                <div className="section-header-inline">
                  <Sparkles size={16} className="text-cyan" />
                  <h4 className="section-label">4. Possible Personal Associations</h4>
                </div>
                <div className="personal-associations-box">
                  <p className="detail-summary-text">
                    In contemporary dream psychology, symbols are not fixed prophecies. When reflecting on <strong>{activeSymbolModal.symbol}</strong>, consider what waking life transitions, sensory memories, or emotional states it evokes for you personally.
                  </p>
                  <div className="related-tags-list" style={{ marginTop: '8px' }}>
                    {activeSymbolModal.relatedSymbols.map((r, i) => (
                      <span key={i} className="related-pill">
                        #{r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Uncertainty & Contextual Contingency */}
              <div className="modal-section uncertainty-box">
                <div className="uncertainty-header">
                  <AlertCircle size={16} className="text-amber" />
                  <span>5. Uncertainty & Epistemic Boundaries</span>
                </div>
                <p className="uncertainty-text">{activeSymbolModal.uncertaintiesAndContingencies}</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="primary-action-btn" onClick={() => setActiveSymbolModal(null)}>
                Close Motif Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Source Viewer Modal */}
      <SourceViewerModal
        target={sourceModalTarget}
        onClose={() => setSourceModalTarget(null)}
      />
    </div>
  );
};
