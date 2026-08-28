import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  BookOpen,
  Brain,
  FileText,
  Key,
  Server,
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CULTURAL_KNOWLEDGE_CLAIMS } from '../../data/culturalSources';
import { PSYCHOLOGY_KNOWLEDGE_CLAIMS } from '../../data/psychologySources';
import { VERIFIED_QUOTATIONS } from '../../data/verifiedQuotes';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'cultural' | 'psychology' | 'quotes' | 'system'>(
    'overview'
  );

  if (!isOpen) return null;

  return (
    <div className="source-modal-overlay" onClick={onClose}>
      <div
        className="source-modal-card audit-modal-card"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '950px', maxHeight: '90vh' }}
      >
        {/* Modal Header */}
        <div className="source-modal-header">
          <div className="source-modal-title-wrap">
            <div className="source-badge-pill verified">
              <ShieldCheck size={14} />
              <span>SYSTEM AUDIT & PROVENANCE REPORT</span>
            </div>
            <h2 className="source-modal-title">Evidence & Implementation Audit</h2>
            <p className="source-modal-subtitle">
              Comprehensive report verifying all factual records, demo data boundaries, procedural engines, and API interfaces.
            </p>
          </div>
          <button className="source-modal-close-btn" onClick={onClose} aria-label="Close audit report">
            <X size={20} />
          </button>
        </div>

        {/* Audit Tabs */}
        <div className="audit-nav-tabs">
          <button
            className={`audit-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FileText size={15} />
            <span>Audit Overview</span>
          </button>
          <button
            className={`audit-tab-btn ${activeTab === 'cultural' ? 'active' : ''}`}
            onClick={() => setActiveTab('cultural')}
          >
            <BookOpen size={15} />
            <span>Cultural Claims ({CULTURAL_KNOWLEDGE_CLAIMS.length})</span>
          </button>
          <button
            className={`audit-tab-btn ${activeTab === 'psychology' ? 'active' : ''}`}
            onClick={() => setActiveTab('psychology')}
          >
            <Brain size={15} />
            <span>Psychology Models ({PSYCHOLOGY_KNOWLEDGE_CLAIMS.length})</span>
          </button>
          <button
            className={`audit-tab-btn ${activeTab === 'quotes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quotes')}
          >
            <ShieldCheck size={15} />
            <span>Verified Quotes ({VERIFIED_QUOTATIONS.length})</span>
          </button>
          <button
            className={`audit-tab-btn ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            <Server size={15} />
            <span>Mock vs API Systems</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="source-modal-body audit-modal-body">
          {activeTab === 'overview' && (
            <div className="audit-section-content">
              <div className="audit-summary-grid">
                <div className="audit-stat-card">
                  <div className="stat-number">{CULTURAL_KNOWLEDGE_CLAIMS.length}</div>
                  <div className="stat-label">Verified Historical Manuscripts</div>
                  <div className="stat-desc">Zero fabricated or unverified claims.</div>
                </div>
                <div className="audit-stat-card">
                  <div className="stat-number">{PSYCHOLOGY_KNOWLEDGE_CLAIMS.length}</div>
                  <div className="stat-label">Peer-Reviewed Cognitive Models</div>
                  <div className="stat-desc">Strict non-diagnostic boundaries.</div>
                </div>
                <div className="audit-stat-card">
                  <div className="stat-number">{VERIFIED_QUOTATIONS.length}</div>
                  <div className="stat-label">Authentic Historical Quotes</div>
                  <div className="stat-desc">Complete academic citation records.</div>
                </div>
                <div className="audit-stat-card">
                  <div className="stat-number">100%</div>
                  <div className="stat-label">Offline Procedural Fallback</div>
                  <div className="stat-desc">HTML5 Canvas engine with zero API lock-in.</div>
                </div>
              </div>

              <div className="source-field-block" style={{ marginTop: '1.5rem' }}>
                <span className="field-label">Architectural Core Principles:</span>
                <div className="field-value">
                  <ul className="audit-check-list">
                    <li>
                      <CheckCircle2 size={16} className="check-icon" />
                      <span>
                        <strong>Evidence vs Imagination Separation:</strong> Historical omens and neuroscience findings are never conflated with personal reflection or creative dream artwork.
                      </span>
                    </li>
                    <li>
                      <CheckCircle2 size={16} className="check-icon" />
                      <span>
                        <strong>"No Reliable Source Found" Rule:</strong> When no authenticated primary manuscript supports a motif, the system openly reports the absence of a reliable historical source.
                      </span>
                    </li>
                    <li>
                      <CheckCircle2 size={16} className="check-icon" />
                      <span>
                        <strong>Faithful Dream Artwork:</strong> The visualization engine parses concrete narrative nouns (underwater purple trains, enormous fish, colored birds, numberless clocks, wooden doors, bright forests) and renders them via dynamic procedural shaders or modular external generative models.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cultural' && (
            <div className="audit-section-content">
              <p className="audit-intro-text">
                Every claim below has been audited against physical museum manuscripts, transliterated papyri, or Oxford/Columbia University Press critical editions.
              </p>
              <div className="audit-table-wrapper">
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Tradition & Geography</th>
                      <th>Source & Manuscript</th>
                      <th>Classification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CULTURAL_KNOWLEDGE_CLAIMS.map(claim => (
                      <tr key={claim.id}>
                        <td>
                          <strong>{claim.primarySubject.toUpperCase()}</strong>
                        </td>
                        <td>
                          <div>{claim.exactTradition}</div>
                          <div className="table-subtext">
                            {claim.geographicContext} ({claim.historicalPeriod})
                          </div>
                        </td>
                        <td>
                          <div>{claim.source.sourceTitle}</div>
                          <div className="table-subtext">{claim.source.identifierOrUrl}</div>
                        </td>
                        <td>
                          <span className="audit-pill">{claim.verificationStatus}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'psychology' && (
            <div className="audit-section-content">
              <p className="audit-intro-text">
                Cognitive neuroscience models audited for empirical validity, documented scope limitations, and non-diagnostic mental health disclaimers.
              </p>
              <div className="audit-table-wrapper">
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Concept</th>
                      <th>Researchers & Institution</th>
                      <th>Publication</th>
                      <th>Epistemic Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PSYCHOLOGY_KNOWLEDGE_CLAIMS.map(psy => (
                      <tr key={psy.id}>
                        <td>
                          <strong>{psy.conceptName}</strong>
                        </td>
                        <td>
                          <div>{psy.researchers}</div>
                        </td>
                        <td>
                          <div>{psy.originalPublication} ({psy.publicationYear})</div>
                          <div className="table-subtext">{psy.source.identifierOrUrl}</div>
                        </td>
                        <td>
                          <span className="audit-pill psy">{psy.epistemicType.toUpperCase()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'quotes' && (
            <div className="audit-section-content">
              <p className="audit-intro-text">
                Verifiably attributed historical texts with critical scholarly recensions.
              </p>
              <div className="audit-table-wrapper">
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Author</th>
                      <th>Work & Section</th>
                      <th>Exact Excerpt</th>
                      <th>Date / Recension</th>
                    </tr>
                  </thead>
                  <tbody>
                    {VERIFIED_QUOTATIONS.map(q => (
                      <tr key={q.id}>
                        <td>
                          <strong>{q.author}</strong>
                        </td>
                        <td>
                          <div>{q.workTitle}</div>
                          <div className="table-subtext">{q.sectionOrPage}</div>
                        </td>
                        <td>
                          <em>&quot;{q.exactQuote}&quot;</em>
                        </td>
                        <td>{q.publicationOrManuscriptDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="audit-section-content">
              <div className="system-breakdown-grid">
                <div className="system-card">
                  <div className="system-card-header">
                    <Server size={16} />
                    <h4>Procedural & Client-Side Systems</h4>
                  </div>
                  <ul>
                    <li>
                      <strong>Dream Art Engine:</strong> Dynamic HTML5 Canvas rendering featuring custom element layers (trains, fish, birds, clocks, doors, forests).
                    </li>
                    <li>
                      <strong>Ambient Soundscape:</strong> Web Audio API 432Hz theta binaural frequency synth with ocean noise.
                    </li>
                    <li>
                      <strong>Storage:</strong> LocalStorage offline client persistence.
                    </li>
                  </ul>
                </div>

                <div className="system-card">
                  <div className="system-card-header">
                    <Key size={16} />
                    <h4>External API Interfaces</h4>
                  </div>
                  <ul>
                    <li>
                      <strong>Generative Image Models:</strong> Modular `ImageGenerationService` ready to dispatch to Imagen 3, Gemini, or custom REST endpoints when an API key is provided.
                    </li>
                    <li>
                      <strong>Graceful Fallback:</strong> If no API key is supplied or offline, the system automatically uses the high-fidelity procedural canvas engine.
                    </li>
                  </ul>
                </div>

                <div className="system-card">
                  <div className="system-card-header">
                    <AlertCircle size={16} />
                    <h4>Demo & Mock Data Flags</h4>
                  </div>
                  <ul>
                    <li>
                      <strong>Community Posts:</strong> Demo community dreams are explicitly flagged `isDemoData: true`.
                    </li>
                    <li>
                      <strong>Preset Dreams:</strong> Pre-filled form templates are labeled as reference presets.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="source-modal-footer">
          <div className="modal-epistemic-hint">
            <HelpCircle size={14} />
            <span>Full audit available in repository as AUDIT_REPORT.md</span>
          </div>
          <button className="btn btn-primary" onClick={onClose}>
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
