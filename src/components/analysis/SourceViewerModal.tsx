import React from 'react';
import type { FactualKnowledgeClaim, PsychologyTheoryClaim } from '../../types/dream';
import { EvidenceBadge } from '../common/EvidenceBadge';
import {
  X,
  BookCheck,
  AlertCircle,
  History,
  Compass,
  ExternalLink,
  BookOpen,
  ShieldCheck,
  Quote
} from 'lucide-react';

export type SourceViewerTarget =
  | { type: 'cultural'; claim: FactualKnowledgeClaim; relevanceReason: string }
  | { type: 'psychology'; claim: PsychologyTheoryClaim; relevanceReason: string };

interface SourceViewerModalProps {
  target: SourceViewerTarget | null;
  onClose: () => void;
}

export const SourceViewerModal: React.FC<SourceViewerModalProps> = ({ target, onClose }) => {
  if (!target) return null;

  const isCultural = target.type === 'cultural';
  const culturalClaim = isCultural ? target.claim : null;
  const psyClaim = !isCultural ? target.claim : null;
  const source = isCultural ? culturalClaim!.source : psyClaim!.source;

  const isUrl = (val?: string) => {
    if (!val) return false;
    return val.startsWith('http://') || val.startsWith('https://') || val.includes('doi.org');
  };

  const getSourceUrl = () => {
    if (source.identifierOrUrl && isUrl(source.identifierOrUrl)) {
      return source.identifierOrUrl;
    }
    if (source.identifierOrUrl && source.identifierOrUrl.includes('DOI:')) {
      const doi = source.identifierOrUrl.replace('DOI:', '').trim();
      return `https://doi.org/${doi}`;
    }
    return null;
  };

  const sourceUrl = getSourceUrl();

  return (
    <div
      className="source-drawer-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="source-drawer-title"
    >
      <div
        className="source-drawer-panel"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="source-drawer-header">
          <div className="drawer-header-meta">
            <div className="drawer-badge">
              <ShieldCheck size={13} className="text-gold" />
              <span>PRIMARY ARCHIVE & PROVENANCE</span>
            </div>
            <h2 id="source-drawer-title" className="drawer-title">
              Why am I seeing this?
            </h2>
            <p className="drawer-subtitle">
              Every factual insight in Somnithos is traceable to verified primary texts or peer-reviewed research.
            </p>
          </div>
          <button
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close source provenance drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="source-drawer-body">
          {/* 1. Relevance to Dream */}
          <div className="drawer-section relevance-card">
            <div className="section-eyebrow-small">
              <Compass size={13} className="text-cyan" />
              <span>RELEVANCE TO YOUR DREAM</span>
            </div>
            <p className="relevance-text">{target.relevanceReason}</p>
          </div>

          {/* 2. Documented Claim & Evidence Badge */}
          <div className="drawer-section claim-card">
            <div className="section-eyebrow-small">
              <BookOpen size={13} className="text-gold" />
              <span>DOCUMENTED CLAIM</span>
            </div>
            <p className="claim-text">
              &quot;{isCultural ? culturalClaim!.claim : psyClaim!.summary}&quot;
            </p>
            <div className="claim-badges-row">
              <EvidenceBadge
                level={isCultural ? culturalClaim!.evidenceLevel : psyClaim!.evidenceLevel}
                showExplanation
              />
            </div>
          </div>

          {/* 3. Cultural & Historical Provenance Grid */}
          {isCultural && culturalClaim && (
            <div className="drawer-section provenance-vitrine">
              <div className="section-eyebrow-small">
                <History size={13} className="text-gold" />
                <span>HISTORICAL & REGIONAL SPECIFICITY</span>
              </div>
              <div className="vitrine-grid">
                <div className="vitrine-cell">
                  <span className="cell-label">Specific Tradition:</span>
                  <span className="cell-value-primary">{culturalClaim.exactTradition}</span>
                  <span className="cell-value-sub">{culturalClaim.communityOrSchool}</span>
                </div>

                <div className="vitrine-cell">
                  <span className="cell-label">Region & Geography:</span>
                  <span className="cell-value-primary">{culturalClaim.geographicContext}</span>
                </div>

                <div className="vitrine-cell">
                  <span className="cell-label">Historical Period:</span>
                  <span className="cell-value-primary">{culturalClaim.historicalPeriod}</span>
                </div>

                <div className="vitrine-cell">
                  <span className="cell-label">Epistemic Scope:</span>
                  <span className="cell-value-primary">
                    {culturalClaim.epistemicCategory.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <span className="cell-value-sub">
                    {culturalClaim.isSymbolMeaningUniversal
                      ? 'Universal motif'
                      : 'Culture-specific interpretation'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Cognitive Neuroscience / Psychology Provenance */}
          {!isCultural && psyClaim && (
            <div className="drawer-section provenance-vitrine">
              <div className="section-eyebrow-small">
                <BookCheck size={13} className="text-cyan" />
                <span>COGNITIVE NEUROSCIENCE FRAMEWORK</span>
              </div>
              <div className="vitrine-grid">
                <div className="vitrine-cell">
                  <span className="cell-label">Lead Investigators:</span>
                  <span className="cell-value-primary">{psyClaim.researchers}</span>
                </div>

                <div className="vitrine-cell">
                  <span className="cell-label">Academic Publisher / Institution:</span>
                  <span className="cell-value-primary">{psyClaim.source.institutionOrPublisher}</span>
                </div>

                <div className="vitrine-cell">
                  <span className="cell-label">Publication & Year:</span>
                  <span className="cell-value-primary">
                    {psyClaim.publicationYear} ({psyClaim.source.sourceTitle})
                  </span>
                </div>

                <div className="vitrine-cell">
                  <span className="cell-label">Epistemic Classification:</span>
                  <span className="cell-value-primary">
                    {psyClaim.epistemicType.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Non-Diagnostic Disclaimer */}
              <div className="non-diagnostic-box">
                <ShieldCheck size={14} className="text-gold" />
                <span>{psyClaim.nonDiagnosticDisclaimer}</span>
              </div>
            </div>
          )}

          {/* 5. Primary Source Citation & Archival Accession */}
          <div className="drawer-section citation-vitrine">
            <div className="section-eyebrow-small">
              <BookOpen size={13} className="text-gold" />
              <span>PRIMARY SOURCE & CITATION</span>
            </div>

            <div className="citation-card-inner">
              <h4 className="citation-title">{source.sourceTitle}</h4>

              <div className="citation-meta-list">
                <div className="citation-row">
                  <span className="c-label">Author / Creator:</span>
                  <span className="c-value">{source.authorOrCreator}</span>
                </div>

                <div className="citation-row">
                  <span className="c-label">Publisher / Archive:</span>
                  <span className="c-value">{source.institutionOrPublisher}</span>
                </div>

                <div className="citation-row">
                  <span className="c-label">Date & Composition:</span>
                  <span className="c-value">{source.publicationDate}</span>
                </div>

                {source.identifierOrUrl && (
                  <div className="citation-row">
                    <span className="c-label">Accession / DOI / ISBN:</span>
                    <span className="c-value font-mono">{source.identifierOrUrl}</span>
                  </div>
                )}

                {source.pageChapterSection && (
                  <div className="citation-row">
                    <span className="c-label">Section / Recension:</span>
                    <span className="c-value">{source.pageChapterSection}</span>
                  </div>
                )}
              </div>

              {/* Translated Supporting Excerpt */}
              {source.supportingPassage && (
                <div className="supporting-passage-vitrine">
                  <div className="passage-label">
                    <Quote size={13} className="text-gold" />
                    <span>Translated Primary Excerpt / Supporting Evidence:</span>
                  </div>
                  <blockquote className="passage-blockquote">
                    {source.supportingPassage}
                  </blockquote>
                </div>
              )}

              {/* Read Source External Action */}
              {sourceUrl && (
                <div className="read-source-action">
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm read-source-btn"
                  >
                    <ExternalLink size={14} />
                    <span>Read Verified Academic Source</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* 6. Documented Uncertainties & Scholarly Boundaries */}
          <div className="drawer-section uncertainty-card">
            <div className="uncertainty-title-row">
              <AlertCircle size={15} className="text-amber" />
              <span>Uncertainties & Scholarly Boundaries</span>
            </div>
            <p className="uncertainty-desc">
              {isCultural ? culturalClaim!.whatIsUncertain : psyClaim!.documentedLimitations}
            </p>
          </div>

          {/* 7. Epistemic Transparency Assurance */}
          <div className="drawer-methodology-footer">
            <ShieldCheck size={14} className="text-gold" />
            <div>
              <strong>Epistemic Guarantee:</strong> Somnithos never fabricates traditions or asserts clinical diagnostics. Record verified on <code>{source.lastVerifiedDate}</code>.
            </div>
          </div>
        </div>

        {/* Drawer Bottom Bar */}
        <div className="source-drawer-footer">
          <button className="btn btn-primary btn-block" onClick={onClose}>
            Close Provenance Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
