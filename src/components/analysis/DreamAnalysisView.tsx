import React, { useState, useEffect, useRef } from 'react';
import type {
  DreamSubmission,
  DreamAnalysisResult
} from '../../types/dream';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { SourceViewerModal } from './SourceViewerModal';
import type { SourceViewerTarget } from './SourceViewerModal';
import { AuditReportModal } from '../common/AuditReportModal';
import { ART_PRESETS } from '../../services/dreamArtGenerator';
import { ImageGenerationService } from '../../services/imageGenerationService';
import type { ImageProviderType } from '../../services/imageGenerationService';
import { StorageService } from '../../services/storageService';
import {
  Sparkles,
  ShieldCheck,
  Brain,
  History,
  BookOpen,
  Palette,
  Download,
  Bookmark,
  Share2,
  AlertTriangle,
  RefreshCw,
  Compass,
  Check,
  Copy,
  Info,
  ChevronRight,
  FileCheck,
  Cpu,
  Eye,
  Scroll,
  Feather,
  Quote,
  ArrowRight,
  BookMarked
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DreamAnalysisViewProps {
  submission: DreamSubmission;
  analysis: DreamAnalysisResult;
  onNewDream: () => void;
  onViewCommunity: () => void;
}

export const DreamAnalysisView: React.FC<DreamAnalysisViewProps> = ({
  submission,
  analysis,
  onNewDream,
  onViewCommunity
}) => {
  const [activeSection, setActiveSection] = useState<string>('narrative');
  const [sourceModalTarget, setSourceModalTarget] = useState<SourceViewerTarget | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [currentStylePreset, setCurrentStylePreset] = useState<string>('nocturne');
  const [selectedProvider, setSelectedProvider] = useState<ImageProviderType>('real_ai');
  const [artDataUrl, setArtDataUrl] = useState<string>('');
  const [isGeneratingArt, setIsGeneratingArt] = useState<boolean>(false);
  const [variationSeed, setVariationSeed] = useState<number>(0);
  const [artworkMetadata, setArtworkMetadata] = useState<{ isFallback: boolean; notes: string } | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [copiedQuote, setCopiedQuote] = useState<boolean>(false);
  const [showPromptDetails, setShowPromptDetails] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render artistic dream visualization via modular ImageGenerationService
  useEffect(() => {
    let isCancelled = false;
    const generate = async () => {
      setIsGeneratingArt(true);
      try {
        ImageGenerationService.setProvider(selectedProvider);
        const res = await ImageGenerationService.generateArtwork({
          submission,
          features: analysis.extractedFeatures,
          stylePresetKey: currentStylePreset,
          variationSeed: 0,
          canvasTarget: canvasRef.current || undefined
        });

        if (!isCancelled) {
          setArtDataUrl(res.imageUrl);
          setArtworkMetadata({ isFallback: res.isFallback, notes: res.notes });
        }
      } catch (err) {
        console.warn('Artwork generation error:', err);
      } finally {
        if (!isCancelled) {
          setIsGeneratingArt(false);
        }
      }
    };

    generate();

    return () => {
      isCancelled = true;
    };
  }, [submission, analysis.extractedFeatures, currentStylePreset, selectedProvider]);

  const handleRegenerateArtwork = async () => {
    if (isGeneratingArt) return;
    const nextSeed = variationSeed + 1;
    setVariationSeed(nextSeed);
    setIsGeneratingArt(true);
    try {
      ImageGenerationService.setProvider(selectedProvider);
      const res = await ImageGenerationService.generateArtwork({
        submission,
        features: analysis.extractedFeatures,
        stylePresetKey: currentStylePreset,
        isRegenerate: true,
        variationSeed: nextSeed,
        canvasTarget: canvasRef.current || undefined
      });
      setArtDataUrl(res.imageUrl);
      setArtworkMetadata({ isFallback: res.isFallback, notes: res.notes });
    } catch (err) {
      console.warn('Regeneration error:', err);
    } finally {
      setIsGeneratingArt(false);
    }
  };

  // Check if saved already
  useEffect(() => {
    const saved = StorageService.getSavedDreamAnalyses();
    if (saved.some(s => s.submission.id === submission.id)) {
      setIsSaved(true);
    }
  }, [submission.id]);

  const handleSaveDream = () => {
    StorageService.saveDreamAnalysis(submission, analysis);
    setIsSaved(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#c5a059', '#38bdf8', '#818cf8']
    });
  };

  const handlePublishCommunity = () => {
    StorageService.publishToCommunity(submission, analysis);
    setIsPublished(true);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#34d399', '#38bdf8', '#c5a059']
    });
  };

  const handleDownloadArtwork = () => {
    if (!artDataUrl) return;
    const a = document.createElement('a');
    a.href = artDataUrl;
    a.download = `${(submission.title || 'somnithos-artwork').toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyReflection = () => {
    navigator.clipboard.writeText(
      `"${analysis.originalReflection.message}"\n\n— Original reflection inspired by your dream | Somnithos`
    );
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2500);
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(`section-${id}`);
    if (el) {
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="analysis-dashboard-container container">
      {/* 1. Top Dream Header & Extracted Features Banner */}
      <header className="analysis-hero-card">
        <div className="hero-top-meta">
          <div className="analysis-status-pill">
            <span className="status-dot green"></span>
            <span>SYNTHESIS COMPLETE · EVIDENCE & IMAGINATION ALIGNED</span>
          </div>

          <div className="hero-meta-right">
            <button
              className="audit-badge-trigger-btn"
              onClick={() => setIsAuditModalOpen(true)}
              title="Inspect system provenance and dataset verification audit"
            >
              <FileCheck size={14} className="text-gold" />
              <span>Provenance & Audit Report</span>
            </button>
            <span className="analysis-timestamp">
              {new Date(analysis.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>

        <h1 className="analysis-dream-title">
          {submission.title || 'Nocturnal Dream Experience'}
        </h1>

        {/* Extracted Emotions & Tonal Chips */}
        <div className="dream-emotions-row">
          {analysis.extractedFeatures.detectedEmotions.map((emo, idx) => (
            <span key={idx} className="dream-emotion-chip">
              <Sparkles size={12} className="text-gold" />
              <span>{emo}</span>
            </span>
          ))}
          {analysis.extractedFeatures.detectedEmotions.length === 0 && (
            <span className="dream-emotion-chip subtle">
              <span>Reflective Nocturne</span>
            </span>
          )}
        </div>

        {/* Narrative Quote Vitrine */}
        <div className="narrative-vitrine">
          <Quote size={16} className="vitrine-quote-icon text-gold" />
          <blockquote className="analysis-dream-excerpt">
            &quot;{submission.description}&quot;
          </blockquote>
        </div>

        {/* Structured Extraction Facets Bar */}
        <div className="extracted-facets-bar">
          <div className="facet-group">
            <span className="facet-label">Detected Motifs:</span>
            <div className="facet-tags">
              {analysis.extractedFeatures.detectedSymbols.length > 0 ? (
                analysis.extractedFeatures.detectedSymbols.map((s, idx) => (
                  <span key={idx} className="facet-tag motif-tag">
                    #{s}
                  </span>
                ))
              ) : (
                <span className="facet-tag muted">None specific</span>
              )}
            </div>
          </div>

          <div className="facet-group">
            <span className="facet-label">Visual Atmosphere:</span>
            <div className="facet-tags">
              {analysis.dreamArtwork.visualKeywords.length > 0 ? (
                analysis.dreamArtwork.visualKeywords.slice(0, 4).map((vk, idx) => (
                  <span key={idx} className="facet-tag color-tag">
                    {vk}
                  </span>
                ))
              ) : (
                <span className="facet-tag muted">Somnithos Palette</span>
              )}
            </div>
          </div>

          <div className="facet-group meta-group">
            <span className="facet-label">Cognitive Ambiguity:</span>
            <span className="ambiguity-pill">{analysis.extractedFeatures.ambiguityLevel.toUpperCase()}</span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="analysis-actions-row">
          <button
            className={`btn ${isSaved ? 'btn-saved' : 'btn-secondary'}`}
            onClick={handleSaveDream}
            disabled={isSaved}
          >
            {isSaved ? (
              <>
                <Check size={16} />
                <span>Archived in My Dreams</span>
              </>
            ) : (
              <>
                <Bookmark size={16} />
                <span>Save to Dream Archive</span>
              </>
            )}
          </button>

          {submission.privacy === 'anonymous_public' && (
            <button
              className={`btn ${isPublished ? 'btn-saved' : 'btn-secondary'}`}
              onClick={handlePublishCommunity}
              disabled={isPublished}
            >
              {isPublished ? (
                <>
                  <Check size={16} />
                  <span>Shared to Sanctuary</span>
                </>
              ) : (
                <>
                  <Share2 size={16} />
                  <span>Publish Anonymously</span>
                </>
              )}
            </button>
          )}

          <button className="btn btn-ghost" onClick={onNewDream}>
            <RefreshCw size={16} />
            <span>Analyze Another Dream</span>
          </button>
        </div>
      </header>

      {/* 2. Visual Journey Navigation Bar */}
      <nav className="dream-journey-nav" aria-label="Dream Exploration Journey">
        <div className="journey-track">
          <button
            className={`journey-step-btn ${activeSection === 'narrative' ? 'active' : ''}`}
            onClick={() => scrollToSection('narrative')}
          >
            <span className="journey-num">01</span>
            <span className="journey-label">YOUR DREAM</span>
          </button>

          <span className="journey-arrow">→</span>

          <button
            className={`journey-step-btn ${activeSection === 'meanings' ? 'active' : ''}`}
            onClick={() => scrollToSection('meanings')}
          >
            <span className="journey-num">02</span>
            <span className="journey-label">POSSIBLE MEANINGS</span>
          </button>

          <span className="journey-arrow">→</span>

          <button
            className={`journey-step-btn ${activeSection === 'traditions' ? 'active' : ''}`}
            onClick={() => scrollToSection('traditions')}
          >
            <span className="journey-num">03</span>
            <span className="journey-label">HUMAN TRADITIONS</span>
          </button>

          <span className="journey-arrow">→</span>

          <button
            className={`journey-step-btn ${activeSection === 'research' ? 'active' : ''}`}
            onClick={() => scrollToSection('research')}
          >
            <span className="journey-num">04</span>
            <span className="journey-label">MODERN RESEARCH</span>
          </button>

          <span className="journey-arrow">→</span>

          <button
            className={`journey-step-btn ${activeSection === 'reflection' ? 'active' : ''}`}
            onClick={() => scrollToSection('reflection')}
          >
            <span className="journey-num">05</span>
            <span className="journey-label">YOUR REFLECTION</span>
          </button>

          <span className="journey-arrow">→</span>

          <button
            className={`journey-step-btn ${activeSection === 'artwork' ? 'active' : ''}`}
            onClick={() => scrollToSection('artwork')}
          >
            <span className="journey-num">06</span>
            <span className="journey-label">IMAGINED</span>
          </button>
        </div>
      </nav>

      {/* 3. Main Journey Flow Sections */}
      <main className="analysis-sections-stack">
        {/* ========================================================================= */}
        {/* 01. YOUR DREAM (Context & Archetypal Framing) */}
        {/* ========================================================================= */}
        <section id="section-narrative" className="analysis-card journey-card narrative-context-card">
          <div className="card-eyebrow-row">
            <span className="eyebrow-text neutral-eyebrow">
              <Scroll size={14} className="text-gold" />
              <span>STEP 01 · YOUR NOCTURNAL EXPERIENCE</span>
            </span>
            <span className="section-step-indicator">01 / 06</span>
          </div>

          <h2 className="card-main-title">The Dream Narrative</h2>
          <p className="card-subtitle">
            An overview of the setting, sensory textures, and key motifs recalled from sleep.
          </p>

          <div className="narrative-summary-grid">
            <div className="summary-item">
              <span className="summary-label">Primary Atmosphere:</span>
              <span className="summary-value">
                {analysis.extractedFeatures.detectedEmotions.join(', ') || 'Nocturnal Contemplation'}
              </span>
            </div>

            {submission.location && (
              <div className="summary-item">
                <span className="summary-label">Setting & Space:</span>
                <span className="summary-value">{submission.location}</span>
              </div>
            )}

            {submission.animals && (
              <div className="summary-item">
                <span className="summary-label">Creatures & Figures:</span>
                <span className="summary-value">{submission.animals.join(', ')}</span>
              </div>
            )}

            {submission.beforeDream && (
              <div className="summary-item">
                <span className="summary-label">Pre-Sleep Mindset:</span>
                <span className="summary-value">{submission.beforeDream}</span>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 02. POSSIBLE MEANINGS (Personal Interpretation - Soft & Intimate) */}
        {/* ========================================================================= */}
        <section id="section-meanings" className="analysis-card journey-card personal-interpretation-card">
          <div className="card-eyebrow-row">
            <span className="eyebrow-text imagination-eyebrow">
              <Sparkles size={14} className="text-cyan" />
              <span>STEP 02 · IMAGINATION LAYER · PERSONAL INTUITION</span>
            </span>
            <span className="creative-label-pill">Non-Dogmatic / Creative Reading</span>
          </div>

          <h2 className="card-main-title">Your Dream, Personally</h2>
          <p className="card-subtitle">
            Exploratory perspectives reflecting your unique narrative, emotional tone, and symbolic imagery.
          </p>

          <div className="interpretation-content-grid">
            <div className="narrative-arcs-block">
              <h4 className="sub-heading">Possible Explorations</h4>
              <div className="arcs-list">
                {analysis.personalInterpretation.narrativeArcs.map((arc, i) => (
                  <div key={i} className="arc-item">
                    <span className="arc-num">0{i + 1}</span>
                    <p className="arc-text">
                      <strong>
                        {i === 0
                          ? 'One possible reading: '
                          : i === 1
                          ? 'Your dream could be exploring: '
                          : 'Another way to look at it: '}
                      </strong>
                      {arc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="symbolic-echoes-block">
              <h4 className="sub-heading">Atmospheric Echoes</h4>
              <div className="echoes-list">
                {analysis.personalInterpretation.symbolicEchoes.map((echo, i) => (
                  <div key={i} className="echo-item">
                    <Sparkles size={14} className="echo-icon text-gold" />
                    <p className="echo-text">{echo}</p>
                  </div>
                ))}
              </div>

              <div className="suggestive-questions-box">
                <h5 className="questions-title">Questions for Personal Reflection:</h5>
                <ul className="questions-list">
                  {analysis.personalInterpretation.suggestiveQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 03. HUMAN TRADITIONS (Cultural Evidence - Interactive Archive) */}
        {/* ========================================================================= */}
        <section id="section-traditions" className="analysis-card journey-card evidence-card">
          <div className="card-eyebrow-row">
            <span className="eyebrow-text evidence-eyebrow">
              <History size={14} className="text-gold" />
              <span>STEP 03 · EVIDENCE LAYER · DOCUMENTED HUMAN TRADITIONS</span>
            </span>
            <span className="evidence-rule-hint">
              <ShieldCheck size={13} className="text-gold" />
              <span>Grounded in Authenticated Primary Texts</span>
            </span>
          </div>

          <h2 className="card-main-title">Cultural & Historical Archive</h2>
          <p className="card-subtitle">
            Documented oneirological traditions from verified ancient manuscripts, philological commentaries, and critical translations.
          </p>

          {/* Cultural Claims Grid or "No Reliable Source Found" */}
          {analysis.culturalPerspectives.length > 0 ? (
            <div className="cultural-claims-grid">
              {analysis.culturalPerspectives.map((match, idx) => {
                const claim = match.claim;
                return (
                  <article key={idx} className="cultural-claim-card archival-vitrine-card">
                    <div className="claim-card-top">
                      <div className="tradition-info">
                        <span className="tradition-title">{claim.exactTradition}</span>
                        <span className="tradition-context">
                          {claim.geographicContext} · {claim.historicalPeriod}
                        </span>
                      </div>
                      <EvidenceBadge level={claim.evidenceLevel} />
                    </div>

                    <p className="claim-statement">&quot;{claim.claim}&quot;</p>

                    {/* Supporting Passage Excerpt */}
                    {claim.source.supportingPassage && (
                      <div className="claim-excerpt-box">
                        <div className="excerpt-label">
                          <BookMarked size={13} className="text-gold" />
                          <span>Documented Excerpt:</span>
                        </div>
                        <blockquote className="excerpt-text">{claim.source.supportingPassage}</blockquote>
                      </div>
                    )}

                    {/* Source Citation & Prominent "Why am I seeing this?" */}
                    <div className="claim-card-bottom">
                      <div className="source-mini-cite">
                        <BookOpen size={13} className="text-gold" />
                        <span>
                          {claim.source.sourceTitle} ({claim.source.publicationDate})
                        </span>
                      </div>
                      <button
                        className="why-seeing-this-btn prominent-why-btn"
                        onClick={() =>
                          setSourceModalTarget({
                            type: 'cultural',
                            claim,
                            relevanceReason: match.relevanceReason
                          })
                        }
                      >
                        <Compass size={14} className="text-gold" />
                        <span>Why am I seeing this?</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="no-source-found-box">
              <div className="no-source-icon">
                <AlertTriangle size={24} className="text-amber" />
              </div>
              <div className="no-source-content">
                <h4 className="no-source-title">No Reliable Source Found</h4>
                <p className="no-source-text">
                  Somnithos searched authenticated historical archives and primary manuscripts, but found no verified cultural records matching the specific motif combinations in your description.
                </p>
                <p className="no-source-policy">
                  <strong>Epistemic Guarantee:</strong> Rather than filling this gap with invented folklore or vague regional generalizations, we openly report that no reliable historical source was verified.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 04. MODERN RESEARCH (Sleep Science & Cognitive Neuroscience) */}
        {/* ========================================================================= */}
        <section id="section-research" className="analysis-card journey-card psychology-card">
          <div className="card-eyebrow-row">
            <span className="eyebrow-text science-eyebrow">
              <Brain size={14} className="text-cyan" />
              <span>STEP 04 · EVIDENCE LAYER · MODERN SLEEP SCIENCE</span>
            </span>
            <span className="non-diagnostic-badge">
              <ShieldCheck size={13} className="text-gold" />
              <span>Non-Diagnostic Cognitive Framework</span>
            </span>
          </div>

          <h2 className="card-main-title">Modern Sleep & Cognitive Research</h2>
          <p className="card-subtitle">
            How contemporary cognitive neuroscience models sleep mentation, memory consolidation, and affective regulation.
          </p>

          <div className="psychology-claims-grid">
            {analysis.psychologyPerspectives.map((match, idx) => {
              const psy = match.psychologyClaim;
              return (
                <article key={idx} className="psychology-claim-card science-vitrine-card">
                  <div className="claim-card-top">
                    <div>
                      <span className={`psy-model-type-badge ${psy.epistemicType}`}>
                        {psy.epistemicType.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <h4 className="psy-concept-name">{psy.conceptName}</h4>
                      <span className="psy-researcher-line">
                        {psy.researchers} ({psy.publicationYear}) · {psy.source.institutionOrPublisher}
                      </span>
                    </div>
                    <EvidenceBadge level={psy.evidenceLevel} />
                  </div>

                  <p className="psy-summary-text">{psy.summary}</p>

                  {/* Documented Limitations */}
                  <div className="psy-limitations-box">
                    <div className="limitation-label">
                      <Info size={13} className="text-cyan" />
                      <span>Documented Scope & Limitations:</span>
                    </div>
                    <div className="limitation-text">{psy.documentedLimitations}</div>
                  </div>

                  {/* Source citation & "Why am I seeing this?" */}
                  <div className="claim-card-bottom">
                    <div className="source-mini-cite">
                      <BookOpen size={13} className="text-cyan" />
                      <span>
                        {psy.source.sourceTitle} ({psy.publicationYear})
                      </span>
                    </div>
                    <button
                      className="why-seeing-this-btn prominent-why-btn"
                      onClick={() =>
                        setSourceModalTarget({
                          type: 'psychology',
                          claim: psy,
                          relevanceReason: match.relevanceReason
                        })
                      }
                    >
                      <Compass size={14} className="text-cyan" />
                      <span>Why am I seeing this?</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 05. YOUR REFLECTION (Emotional Closing & Authentic Quotes) */}
        {/* ========================================================================= */}
        <section id="section-reflection" className="analysis-card journey-card reflection-closing-card">
          <div className="card-eyebrow-row">
            <span className="eyebrow-text imagination-eyebrow">
              <Feather size={14} className="text-gold" />
              <span>STEP 05 · A THOUGHT TO CARRY WITH YOU</span>
            </span>
            <span className="section-step-indicator">05 / 06</span>
          </div>

          <h2 className="card-main-title">A Thought to Carry With You</h2>
          <p className="card-subtitle">
            An evocative meditation synthesizing the mood and imagery of your dream.
          </p>

          <div className="reflection-quote-wrapper">
            <blockquote className="reflection-message">
              &quot;{analysis.originalReflection.message}&quot;
            </blockquote>

            <div className="reflection-attribution">
              <span className="attribution-tag">
                {analysis.originalReflection.label}
              </span>
              <button
                className="copy-quote-btn"
                onClick={handleCopyReflection}
                title="Copy reflection to clipboard"
              >
                {copiedQuote ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedQuote ? 'Copied to Clipboard' : 'Copy Reflection'}</span>
              </button>
            </div>
          </div>

          {/* Verified Historical Quotation (if matched) */}
          {analysis.verifiedQuoteMatch && (
            <div className="verified-historical-quote-box">
              <div className="v-quote-header">
                <BookOpen size={14} className="text-gold" />
                <span>Historical Resonance from Verified Text:</span>
              </div>
              <blockquote className="authentic-quote-text">
                &quot;{analysis.verifiedQuoteMatch.exactQuote}&quot;
              </blockquote>
              <div className="quote-provenance-footer">
                <div className="quote-author-info">
                  <strong>{analysis.verifiedQuoteMatch.author}</strong>, <em>{analysis.verifiedQuoteMatch.workTitle}</em>
                  <span className="quote-pub-date"> ({analysis.verifiedQuoteMatch.publicationOrManuscriptDate})</span>
                </div>
                <p className="quote-context-note">
                  {analysis.verifiedQuoteMatch.historicalContext}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 06. IMAGINED (Cinematic Dream Artwork) */}
        {/* ========================================================================= */}
        <section id="section-artwork" className="analysis-card journey-card artwork-card">
          <div className="card-eyebrow-row">
            <span className="eyebrow-text imagination-eyebrow">
              <Palette size={14} className="text-cyan" />
              <span>STEP 06 · IMAGINATION LAYER · ARTISTIC VISUALIZATION</span>
            </span>
            <span className="artwork-disclaimer-pill">
              {artworkMetadata?.isFallback ? 'Procedural Fallback Artwork' : 'AI-Generated Artwork'}
            </span>
          </div>

          <div className="artwork-header-flex">
            <div>
              <h2 className="card-main-title">{analysis.dreamArtwork.label}</h2>
              <p className="card-subtitle">{analysis.dreamArtwork.subLabel}</p>
            </div>

            {/* Provider & Theme Selectors */}
            <div className="artwork-controls-toolbar">
              {/* Generation Engine Selector */}
              <div className="provider-selector-bar">
                <span className="presets-label-mini">
                  <Cpu size={12} className="text-gold" />
                  <span>Engine:</span>
                </span>
                <div className="provider-pills">
                  <button
                    className={`provider-pill ${selectedProvider === 'real_ai' ? 'active' : ''}`}
                    onClick={() => setSelectedProvider('real_ai')}
                    title="Somnithos AI Artwork Engine (Server API with safe fallback)"
                  >
                    AI Dream Engine
                  </button>
                  <button
                    className={`provider-pill ${selectedProvider === 'procedural_canvas' ? 'active' : ''}`}
                    onClick={() => setSelectedProvider('procedural_canvas')}
                    title="Real-time HTML5 Canvas layered procedural shader synthesis"
                  >
                    Procedural Canvas
                  </button>
                </div>
              </div>

              {/* Style Presets Selector */}
              <div className="style-presets-bar">
                <span className="presets-label-mini">Atmospheric Theme:</span>
                <div className="presets-pills">
                  {Object.values(ART_PRESETS).map(preset => (
                    <button
                      key={preset.id}
                      className={`preset-pill ${currentStylePreset === preset.id ? 'active' : ''}`}
                      onClick={() => setCurrentStylePreset(preset.id)}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cinematic Canvas Frame */}
          <div className="artwork-display-frame">
            {artDataUrl && selectedProvider !== 'procedural_canvas' ? (
              <img
                src={artDataUrl}
                alt="Dream Visualization"
                className="dream-image-element"
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px' }}
              />
            ) : null}

            <canvas
              ref={canvasRef}
              className="dream-canvas-element"
              style={{ display: artDataUrl && selectedProvider !== 'procedural_canvas' ? 'none' : 'block' }}
            />

            {isGeneratingArt && (
              <div className="artwork-generating-overlay">
                <Sparkles size={24} className="spinning text-gold" />
                <span>Imagining your dream...</span>
              </div>
            )}

            <div className="artwork-overlay-controls">
              <button
                className="art-control-btn regenerate-btn"
                onClick={handleRegenerateArtwork}
                disabled={isGeneratingArt}
                title="Regenerate visualization variation preserving dream details"
              >
                <RefreshCw size={16} className={isGeneratingArt ? 'spinning' : ''} />
                <span>Regenerate</span>
              </button>
              <button
                className="art-control-btn download-btn"
                onClick={handleDownloadArtwork}
                title="Download high-resolution dream art"
              >
                <Download size={16} />
                <span>Download Artwork</span>
              </button>
              <button
                className="art-control-btn inspect-prompt-btn"
                onClick={() => setShowPromptDetails(!showPromptDetails)}
              >
                {showPromptDetails ? <Eye size={16} /> : <Info size={16} />}
                <span>{showPromptDetails ? 'Hide Art Prompt' : 'Inspect Prompt'}</span>
              </button>
            </div>
          </div>

          {/* Prompt details drawer */}
          {showPromptDetails && (
            <div className="art-prompt-details-box">
              <div className="prompt-header-row">
                <h5 className="prompt-details-title">Generative Visualization Prompt:</h5>
                <span className="provider-indicator-tag">
                  Active Engine: {selectedProvider === 'procedural_canvas' ? 'Procedural Canvas (Offline)' : 'Generative AI API'}
                </span>
              </div>
              <p className="prompt-details-text">&quot;{analysis.dreamArtwork.promptUsed}&quot;</p>
              
              <div className="extracted-elements-section">
                <span className="elements-title">Faithfully Extracted Narrative Objects:</span>
                <div className="prompt-keywords">
                  {analysis.dreamArtwork.visualKeywords.map((kw, i) => (
                    <span key={i} className="kw-tag">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <p className="prompt-note">
                *Somnithos dynamically renders these specific narrative objects, lighting, and textures to mirror your dream storyline.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* 4. Bottom Navigation & Exploration Actions */}
      <footer className="analysis-bottom-nav">
        <button className="btn btn-primary btn-lg" onClick={onNewDream}>
          <Sparkles size={18} />
          <span>Explore Another Dream</span>
          <ArrowRight size={16} />
        </button>
        <button className="btn btn-secondary btn-lg" onClick={onViewCommunity}>
          <Share2 size={18} />
          <span>Browse Community Dream Sanctuary</span>
        </button>
      </footer>

      {/* 5. Source Viewer Side Drawer */}
      <SourceViewerModal
        target={sourceModalTarget}
        onClose={() => setSourceModalTarget(null)}
      />

      {/* 6. Audit & Provenance Report Modal */}
      <AuditReportModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </div>
  );
};
