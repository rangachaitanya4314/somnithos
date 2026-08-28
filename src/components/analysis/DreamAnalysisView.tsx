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
  ChevronDown,
  ChevronUp,
  FileCheck,
  Cpu,
  Eye,
  Scroll,
  Feather,
  Quote,
  ArrowRight,
  HelpCircle
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
  const [isNarrativeExpanded, setIsNarrativeExpanded] = useState<boolean>(false);
  const [showContextDetails, setShowContextDetails] = useState<boolean>(false);
  const [selectedMotifDetail, setSelectedMotifDetail] = useState<string | null>(null);

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

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Generate grounded questions to consider from dream features
  const getReflectionQuestions = (): string[] => {
    const questions: string[] = [];
    const motifs = analysis.extractedFeatures.dominantMotifs || analysis.extractedFeatures.detectedSymbols || [];
    const emotions = analysis.extractedFeatures.emotionalSignals || analysis.extractedFeatures.detectedEmotions || [];

    if (motifs.includes('water') || motifs.includes('ocean')) {
      questions.push('What was the quality of the water—still, turbulent, or luminous—and did it reflect how you currently navigate changes in waking life?');
    }
    if (motifs.includes('flying') || motifs.includes('falling')) {
      questions.push('When your perspective shifted in altitude or gravity, did you feel a sense of release, loss of control, or heightened clarity?');
    }
    if (motifs.includes('doors') || motifs.includes('train') || motifs.includes('portal')) {
      questions.push('As you approached the threshold or vehicle, what feeling accompanied the transition to what lay on the other side?');
    }
    if (emotions.length > 0) {
      questions.push(`The feelings of ${emotions.slice(0, 2).join(' and ')} appeared distinctly in your narrative. Where in your waking life have similar feelings surfaced recently?`);
    }

    questions.push('What part of the dream stayed with you longest upon waking?');
    return questions.slice(0, 3);
  };

  const reflectionQuestions = getReflectionQuestions();
  const descriptionText = submission.description || '';
  const isLongDescription = descriptionText.length > 320;

  return (
    <div className="dream-analysis-root container">
      {/* 1. Result Header */}
      <header className="analysis-header">
        <div className="analysis-top-nav-row">
          <div className="somnithos-pill">
            <Sparkles size={14} className="text-gold" />
            <span>SOMNITHOS SYNTHESIS · RESULT JOURNEY</span>
          </div>

          <div className="analysis-meta-right">
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

        <p className="analysis-intro-lead">
          Here&apos;s what Somnithos found in your dream. Below is an exploration of elements observed in your narrative, contextualized through documented historical traditions, modern sleep research, and personal creative reflection.
        </p>

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
            <span>Explore Another Dream</span>
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
            className={`journey-step-btn ${activeSection === 'noticed' ? 'active' : ''}`}
            onClick={() => scrollToSection('noticed')}
          >
            <span className="journey-num">02</span>
            <span className="journey-label">NOTICED</span>
          </button>

          <span className="journey-arrow">→</span>

          <button
            className={`journey-step-btn ${activeSection === 'evidence' ? 'active' : ''}`}
            onClick={() => scrollToSection('evidence')}
          >
            <span className="journey-num">03</span>
            <span className="journey-label">EVIDENCE</span>
          </button>

          <span className="journey-arrow">→</span>

          <button
            className={`journey-step-btn ${activeSection === 'research' ? 'active' : ''}`}
            onClick={() => scrollToSection('research')}
          >
            <span className="journey-num">04</span>
            <span className="journey-label">RESEARCH</span>
          </button>

          <span className="journey-arrow">→</span>

          <button
            className={`journey-step-btn ${activeSection === 'personal' ? 'active' : ''}`}
            onClick={() => scrollToSection('personal')}
          >
            <span className="journey-num">05</span>
            <span className="journey-label">PERSONAL</span>
          </button>

          <span className="journey-arrow">→</span>

          <button
            className={`journey-step-btn ${activeSection === 'thought' ? 'active' : ''}`}
            onClick={() => scrollToSection('thought')}
          >
            <span className="journey-num">06</span>
            <span className="journey-label">THOUGHT</span>
          </button>

          <span className="journey-arrow">→</span>

          <button
            className={`journey-step-btn ${activeSection === 'artwork' ? 'active' : ''}`}
            onClick={() => scrollToSection('artwork')}
          >
            <span className="journey-num">07</span>
            <span className="journey-label">IMAGINED</span>
          </button>
        </div>
      </nav>

      {/* 3. Main Journey Flow Sections */}
      <main className="analysis-sections-stack">
        {/* ========================================================================= */}
        {/* 01. YOUR DREAM (Opening Narrative) */}
        {/* ========================================================================= */}
        <section id="section-narrative" className="analysis-card journey-card narrative-context-card">
          <div className="card-eyebrow-row">
            <span className="eyebrow-text neutral-eyebrow">
              <Scroll size={14} className="text-gold" />
              <span>STEP 01 · YOUR NOCTURNAL EXPERIENCE</span>
            </span>
            <span className="section-step-indicator">01 / 07</span>
          </div>

          <h2 className="card-main-title">The Dream Narrative</h2>
          <p className="card-subtitle">
            An overview of the setting, sensory textures, and key narrative recalled from sleep.
          </p>

          <div className="narrative-vitrine">
            <Quote size={16} className="vitrine-quote-icon text-gold" />
            <blockquote className={`analysis-dream-excerpt ${!isNarrativeExpanded && isLongDescription ? 'clamped' : ''}`}>
              &quot;{descriptionText}&quot;
            </blockquote>
            {isLongDescription && (
              <button
                className="expand-narrative-btn"
                onClick={() => setIsNarrativeExpanded(!isNarrativeExpanded)}
              >
                {isNarrativeExpanded ? (
                  <>
                    <ChevronUp size={14} />
                    <span>Show less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    <span>Show complete narrative</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Optional Context Details Accordion */}
          {(submission.location || submission.animals || submission.beforeDream || submission.afterWaking) && (
            <div className="context-details-wrapper">
              <button
                className="context-details-toggle"
                onClick={() => setShowContextDetails(!showContextDetails)}
              >
                <Info size={14} className="text-cyan" />
                <span>{showContextDetails ? 'Hide contextual notes' : 'Show contextual notes (setting, pre-sleep state)'}</span>
                {showContextDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showContextDetails && (
                <div className="narrative-summary-grid">
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

                  {submission.afterWaking && (
                    <div className="summary-item">
                      <span className="summary-label">Awakening Mood:</span>
                      <span className="summary-value">{submission.afterWaking}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 02. WHAT SOMNITHOS NOTICED (Detected Elements, Not Meanings) */}
        {/* ========================================================================= */}
        <section id="section-noticed" className="analysis-card journey-card noticed-card">
          <div className="card-eyebrow-row">
            <span className="eyebrow-text observation-eyebrow">
              <Eye size={14} className="text-gold" />
              <span>STEP 02 · OBSERVATIONAL LAYER · DETECTED MOTIFS</span>
            </span>
            <span className="section-step-indicator">02 / 07</span>
          </div>

          <h2 className="card-main-title">What Somnithos Noticed</h2>
          <p className="card-subtitle">
            These are elements we detected in your description. They are concrete observations from your narrative, not universal omens or fixed meanings.
          </p>

          <div className="noticed-motifs-grid">
            {analysis.extractedFeatures.dominantMotifs.map((motif, idx) => {
              const isSelected = selectedMotifDetail === motif;
              const whyNoticed = analysis.extractedFeatures.motifsWhyNoticed?.[motif] ||
                `Identified '${motif}' referenced in your narrative context.`;

              return (
                <div
                  key={idx}
                  className={`noticed-motif-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedMotifDetail(isSelected ? null : motif)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedMotifDetail(isSelected ? null : motif);
                    }
                  }}
                  title="Click to view why Somnithos noticed this element"
                >
                  <div className="motif-card-header">
                    <span className="motif-name-badge">
                      <Sparkles size={12} className="text-gold" />
                      <span>{motif.charAt(0).toUpperCase() + motif.slice(1)}</span>
                    </span>
                    <span className="motif-tap-hint">
                      {isSelected ? 'Hide' : 'Why noticed?'}
                    </span>
                  </div>

                  <p className="motif-card-note">
                    {isSelected ? whyNoticed : `Detected in your dream description.`}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 03. WHAT HUMAN KNOWLEDGE SAYS (Historical Traditions) */}
        {/* ========================================================================= */}
        <section id="section-evidence" className="analysis-card journey-card evidence-card">
          <div className="card-eyebrow-row">
            <span className="eyebrow-text history-eyebrow">
              <History size={14} className="text-gold" />
              <span>STEP 03 · EVIDENCE LAYER · HISTORICAL TRADITIONS</span>
            </span>
            <span className="section-step-indicator">03 / 07</span>
          </div>

          <h2 className="card-main-title">What Human Knowledge Says: Historical Perspectives</h2>
          <p className="card-subtitle">
            How documented historical manuscripts, classical treatises, and epistemic traditions recorded similar motifs within specific cultural and temporal contexts.
          </p>

          <div className="cultural-claims-grid">
            {analysis.culturalPerspectivesNotFound || analysis.culturalPerspectives.length === 0 ? (
              <div className="no-reliable-source-box">
                <div className="no-source-header">
                  <AlertTriangle size={18} className="text-amber" />
                  <span className="no-source-title">No Reliable Source Found</span>
                  <span className="no-source-badge">NO RELIABLE SOURCE</span>
                </div>
                <p className="no-source-desc">
                  No sufficiently reliable source was found for this specific claim. Somnithos does not invent or fabricate cultural traditions when verified historical records are unavailable.
                </p>
              </div>
            ) : (
              analysis.culturalPerspectives.map((match, idx) => {
                const claim = match.claim;
                return (
                  <article key={idx} className="archival-vitrine-card">
                    <div className="claim-card-top">
                      <div className="tradition-info">
                        <span className="tradition-scope-tag">DOCUMENTED TRADITION</span>
                        <h4 className="tradition-title">
                          {(claim as any).tradition || (claim as any).exactTradition || (claim as any).culturalTradition || 'Historical Tradition'}
                        </h4>
                        <span className="tradition-context">
                          {(claim.source as any).geographicRegion || (claim.source as any).institutionOrPublisher || (claim as any).geographicContext || ''} · {(claim.source as any).historicalPeriod || (claim as any).historicalPeriod || (claim.source as any).publicationDate || ''}
                        </span>
                      </div>
                      <EvidenceBadge level={claim.evidenceLevel} />
                    </div>

                    <p className="claim-statement">{claim.claim}</p>

                    {/* Excerpt */}
                    <div className="claim-excerpt-box">
                      <div className="excerpt-label">
                        <BookOpen size={13} className="text-gold" />
                        <span>Source Excerpt from Manuscript:</span>
                      </div>
                      <blockquote className="excerpt-text">
                        &quot;{claim.supportingExcerpt}&quot;
                      </blockquote>
                    </div>

                    {/* Source citation footer & "Why am I seeing this?" */}
                    <div className="claim-card-bottom">
                      <div className="source-mini-cite">
                        <History size={13} className="text-gold" />
                        <span>
                          {claim.source.sourceTitle || (claim.source as any).manuscriptOrWork} ({claim.source.publicationDate || (claim.source as any).approximateDate})
                        </span>
                      </div>
                      <button
                        className="why-seeing-this-btn prominent-why-btn"
                        onClick={() =>
                          setSourceModalTarget({
                            type: 'cultural',
                            claim: claim as any,
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
              })
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 04. MODERN SLEEP & COGNITIVE RESEARCH */}
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
        {/* EVIDENTIARY DIVIDER: Documented Knowledge vs Personal Reading */}
        {/* ========================================================================= */}
        <div className="epistemic-boundary-divider" role="separator" aria-label="Divider between documented evidence and personal reflection">
          <div className="divider-line"></div>
          <div className="divider-badge-box">
            <span className="divider-tag evidence-tag">
              <BookOpen size={12} />
              <span>DOCUMENTED KNOWLEDGE</span>
            </span>
            <span className="divider-vs">⟷</span>
            <span className="divider-tag reflection-tag">
              <Sparkles size={12} />
              <span>PERSONAL INTERPRETATION</span>
            </span>
          </div>
          <p className="divider-caption">
            The sections above are grounded in verified historical records and peer-reviewed cognitive research. The sections below are exploratory personal and creative reflections for your contemplative inquiry.
          </p>
          <div className="divider-line"></div>
        </div>

        {/* ========================================================================= */}
        {/* 05. YOUR PERSONAL READING (Personal Interpretation) */}
        {/* ========================================================================= */}
        <section id="section-personal" className="analysis-card journey-card personal-interpretation-card">
          <div className="card-eyebrow-row">
            <span className="eyebrow-text imagination-eyebrow">
              <Sparkles size={14} className="text-cyan" />
              <span>STEP 05 · REFLECTION LAYER · PERSONAL READING</span>
            </span>
            <span className="section-step-indicator">05 / 07</span>
          </div>

          <h2 className="card-main-title">Your Dream, Personally</h2>
          <p className="card-subtitle">
            One possible reading synthesizing your emotions, context, and motifs. This is an invitation to personal inquiry, not an objective diagnosis.
          </p>

          <div className="personal-synthesis-body">
            <p className="primary-interpretation-para">
              {analysis.personalInterpretation.primarySynthesis || (analysis.personalInterpretation as any).narrativeArcs?.[0] || 'One possible reading invites contemplative reflection on the feelings and images recalled from your sleep.'}
            </p>

            {(analysis.personalInterpretation.emotionalResonance || (analysis.personalInterpretation as any).emotionalReading) && (
              <div className="resonance-callout">
                <span className="resonance-label">Affective Resonance:</span>
                <p className="resonance-text">
                  {analysis.personalInterpretation.emotionalResonance || (analysis.personalInterpretation as any).emotionalReading}
                </p>
              </div>
            )}

            {/* Questions to Consider */}
            <div className="suggestive-questions-box">
              <div className="questions-header">
                <HelpCircle size={15} className="text-gold" />
                <h5 className="questions-title">Questions to Consider</h5>
              </div>
              <ul className="questions-list">
                {reflectionQuestions.map((q, idx) => (
                  <li key={idx} className="question-item">{q}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 06. A THOUGHT TO CARRY (Original Reflection & Verified Quote) */}
        {/* ========================================================================= */}
        <section id="section-thought" className="analysis-card journey-card reflection-closing-card">
          <div className="card-eyebrow-row">
            <span className="eyebrow-text imagination-eyebrow">
              <Feather size={14} className="text-gold" />
              <span>STEP 06 · A THOUGHT TO CARRY WITH YOU</span>
            </span>
            <span className="section-step-indicator">06 / 07</span>
          </div>

          <h2 className="card-main-title">A Thought to Carry</h2>
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
        {/* 07. YOUR DREAM — IMAGINED (Dream Artwork Visualization) */}
        {/* ========================================================================= */}
        <section id="section-artwork" className="analysis-card journey-card artwork-card">
          <div className="card-eyebrow-row">
            <span className="eyebrow-text imagination-eyebrow">
              <Palette size={14} className="text-cyan" />
              <span>STEP 07 · IMAGINATION LAYER · ARTISTIC VISUALIZATION</span>
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
                  Active Engine: {selectedProvider === 'procedural_canvas' ? 'Procedural Canvas (Offline)' : 'AI Dream Engine'}
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

      {/* 6. Provenance & Verification Audit Modal */}
      <AuditReportModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </div>
  );
};
