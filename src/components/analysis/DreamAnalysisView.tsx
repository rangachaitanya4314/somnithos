import React, { useState, useEffect, useRef } from 'react';
import type {
  DreamSubmission,
  DreamAnalysisResult,
  EvidenceRecord,
  ResearchRecord
} from '../../types/dream';
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
  Palette,
  Download,
  Bookmark,
  Share2,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Quote,
  Compass,
  X,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  ArrowRight,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DreamAnalysisViewProps {
  submission: DreamSubmission;
  analysis: DreamAnalysisResult;
  onNewDream: () => void;
  onViewCommunity: () => void;
}

type StageNumber = 1 | 2 | 3 | 4;

type ExploreCategory = 'research' | 'beliefs' | 'astrology' | 'patterns' | null;

export const DreamAnalysisView: React.FC<DreamAnalysisViewProps> = ({
  submission,
  analysis,
  onNewDream,
  onViewCommunity
}) => {
  const [currentStage, setCurrentStage] = useState<StageNumber>(1);
  const [unlockedStage, setUnlockedStage] = useState<StageNumber>(1);
  const [exploreModal, setExploreModal] = useState<ExploreCategory>(null);
  const [sourceModalTarget, setSourceModalTarget] = useState<SourceViewerTarget | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [currentStylePreset, setCurrentStylePreset] = useState<string>('nocturne');
  const [selectedProvider] = useState<ImageProviderType>('real_ai');
  const [artDataUrl, setArtDataUrl] = useState<string>('');
  const [isGeneratingArt, setIsGeneratingArt] = useState<boolean>(false);
  const [variationSeed, setVariationSeed] = useState<number>(0);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [isNarrativeExpanded, setIsNarrativeExpanded] = useState<boolean>(false);

  // Astrology form inputs
  const [birthDate, setBirthDate] = useState<string>('');
  const [birthTime, setBirthTime] = useState<string>('');
  const [birthPlace, setBirthPlace] = useState<string>('');
  const [astrologyResult, setAstrologyResult] = useState<{
    element: string;
    signEstimate?: string;
    planetaryTheme: string;
    reading: string;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Natural reveal progression (0s -> ~2s -> ~4s)
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setUnlockedStage(prev => (prev < 2 ? 2 : prev));
    }, 1600);

    const timer2 = setTimeout(() => {
      setUnlockedStage(prev => (prev < 3 ? 3 : prev));
    }, 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Render artwork
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
          setUnlockedStage(4);
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

  const handleCalculateAstrology = (e: React.FormEvent) => {
    e.preventDefault();
    let sign = 'Aries';
    let element = 'Fire';
    let planetaryTheme = 'Mars & The Sun (Action & Awakening)';

    if (birthDate) {
      const month = new Date(birthDate).getMonth() + 1;
      const day = new Date(birthDate).getDate();

      if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) { sign = 'Aries'; element = 'Fire'; planetaryTheme = 'Mars (Courage & Vitality)'; }
      else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) { sign = 'Taurus'; element = 'Earth'; planetaryTheme = 'Venus (Grounded Harmony)'; }
      else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) { sign = 'Gemini'; element = 'Air'; planetaryTheme = 'Mercury (Curiosity & Connection)'; }
      else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) { sign = 'Cancer'; element = 'Water'; planetaryTheme = 'The Moon (Memory & Emotion)'; }
      else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) { sign = 'Leo'; element = 'Fire'; planetaryTheme = 'The Sun (Identity & Warmth)'; }
      else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) { sign = 'Virgo'; element = 'Earth'; planetaryTheme = 'Mercury (Order & Discernment)'; }
      else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) { sign = 'Libra'; element = 'Air'; planetaryTheme = 'Venus (Balance & Relationships)'; }
      else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) { sign = 'Scorpio'; element = 'Water'; planetaryTheme = 'Pluto & Mars (Transformation)'; }
      else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) { sign = 'Sagittarius'; element = 'Fire'; planetaryTheme = 'Jupiter (Expansive Perspective)'; }
      else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) { sign = 'Capricorn'; element = 'Earth'; planetaryTheme = 'Saturn (Structure & Endurance)'; }
      else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) { sign = 'Aquarius'; element = 'Air'; planetaryTheme = 'Uranus (Originality & Vision)'; }
      else { sign = 'Pisces'; element = 'Water'; planetaryTheme = 'Neptune (The Subconscious & Intuition)'; }
    }

    const narrative = (submission.description || '').toLowerCase();
    let dreamCorrespondence = `In traditional astrology, your ${sign} (${element} element) energy interacts with the nocturnal themes of your dream. `;
    if (narrative.includes('water') || narrative.includes('ocean') || narrative.includes('fish')) {
      dreamCorrespondence += 'Water elements suggest an emphasis on processing deep, intuitive feelings in a quiet, unhurried space.';
    } else if (narrative.includes('forest') || narrative.includes('tree') || narrative.includes('school') || narrative.includes('friend')) {
      dreamCorrespondence += 'Grounding and relational themes suggest paying attention to stable routines and the people who make you feel secure.';
    } else if (narrative.includes('light') || narrative.includes('fire')) {
      dreamCorrespondence += 'Light imagery resonates with finding a renewed sense of direction or personal clarity.';
    } else {
      dreamCorrespondence += 'The symbolism indicates a time for gentle reflection and aligning your waking focus with what matters most to you.';
    }

    setAstrologyResult({
      signEstimate: sign,
      element,
      planetaryTheme,
      reading: dreamCorrespondence
    });
  };

  const stageTitles: Record<StageNumber, string> = {
    1: 'YOUR DREAM',
    2: 'WHAT STOOD OUT',
    3: 'ONE POSSIBLE WAY TO LOOK AT IT',
    4: 'YOUR DREAM — IMAGINED'
  };

  const highlights = analysis.extractedFeatures.meaningfulHighlights || [
    { emoji: '🌌', text: 'You were navigating a distinctive nocturnal setting.' },
    { emoji: '💭', text: `You experienced emotions of ${analysis.extractedFeatures.emotionalSignals.join(' and ') || 'reflection'}.` },
    { emoji: '🕊️', text: 'Your mind moved through a meaningful transition.' }
  ];

  const emotionalJourney = analysis.extractedFeatures.emotionalJourney || 
    (analysis.extractedFeatures.emotionalSignals.length > 1 
      ? analysis.extractedFeatures.emotionalSignals.join(' → ') 
      : 'Observation → Quiet Awareness');

  const simpleReflection = analysis.simpleReflection || 
    analysis.personalReflection?.primarySynthesis || 
    'One possible way to look at it is that your mind is organizing everyday experiences and feelings in a calm, reflective space.';

  const descriptionText = submission.description || '';
  const isLongDescription = descriptionText.length > 280;

  const scientificStudies = analysis.scientificResearch || [];
  const historicalEvidence = analysis.historicalEvidence || [];

  return (
    <div className="guided-result-root container">
      {/* Top Meta Bar */}
      <header className="guided-header">
        <div className="guided-header-top">
          <div className="somnithos-pill">
            <Sparkles size={14} className="text-gold" />
            <span>SOMNITHOS GUIDED EXPERIENCE</span>
          </div>

          <div className="guided-header-actions">
            <button
              className="audit-badge-trigger-btn"
              onClick={() => setIsAuditModalOpen(true)}
              title="Inspect system provenance and dataset verification audit"
            >
              <FileCheck size={14} className="text-gold" />
              <span>Audit & Provenance</span>
            </button>

            <button className="btn btn-ghost btn-sm" onClick={onViewCommunity}>
              <Users size={14} />
              <span>Community</span>
            </button>

            <button className="btn btn-ghost btn-sm" onClick={onNewDream}>
              <RefreshCw size={14} />
              <span>New Dream</span>
            </button>
          </div>
        </div>

        {/* Guided Stage Tracker */}
        <div className="guided-stage-nav" role="navigation" aria-label="Dream Exploration Stages">
          <button
            className="stage-nav-arrow"
            onClick={() => setCurrentStage(prev => (Math.max(1, prev - 1) as StageNumber))}
            disabled={currentStage === 1}
            aria-label="Previous stage"
          >
            <ChevronLeft size={18} />
            <span className="hide-mobile">Back</span>
          </button>

          <div className="stage-dots-container">
            {([1, 2, 3, 4] as StageNumber[]).map(s => {
              const isCurrent = currentStage === s;
              const isAvailable = s <= unlockedStage;
              return (
                <button
                  key={s}
                  className={`stage-dot-btn ${isCurrent ? 'active' : ''} ${isAvailable ? 'available' : 'locked'}`}
                  onClick={() => setCurrentStage(s)}
                  aria-label={`Go to Stage ${s}: ${stageTitles[s]}`}
                >
                  <span className="stage-dot-number">{s}</span>
                  <span className="stage-dot-label hide-mobile">{stageTitles[s]}</span>
                </button>
              );
            })}
          </div>

          <button
            className="stage-nav-arrow"
            onClick={() => setCurrentStage(prev => (Math.min(4, prev + 1) as StageNumber))}
            disabled={currentStage === 4}
            aria-label="Next stage"
          >
            <span className="hide-mobile">Next</span>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Stage Title Sub-indicator */}
        <div className="stage-status-indicator">
          <span className="stage-counter-badge">{currentStage} of 4</span>
          <h2 className="current-stage-title">{stageTitles[currentStage]}</h2>
        </div>
      </header>

      {/* Main Guided Screen Flow */}
      <main className="guided-main-card">
        {/* ========================================================================= */}
        {/* STAGE 1: YOUR DREAM */}
        {/* ========================================================================= */}
        {currentStage === 1 && (
          <section className="stage-view stage-fade-in" aria-label="Stage 1: Your Dream">
            <h1 className="dream-hero-title">
              {submission.title || 'Your Nocturnal Dream'}
            </h1>

            <div className="dream-wording-vitrine">
              <Quote size={20} className="vitrine-quote-icon text-gold" />
              <blockquote className={`dream-original-quote ${!isNarrativeExpanded && isLongDescription ? 'clamped' : ''}`}>
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
                      <span>Show full dream</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="stage-actions-footer">
              <div className="reveal-hint-text">
                <Sparkles size={14} className="text-gold" />
                <span>We noticed the meaningful story behind your words.</span>
              </div>

              <button
                className="btn btn-primary btn-lg"
                onClick={() => setCurrentStage(2)}
              >
                <span>See What Stood Out</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2: WHAT STOOD OUT */}
        {/* ========================================================================= */}
        {currentStage === 2 && (
          <section className="stage-view stage-fade-in" aria-label="Stage 2: What Stood Out">
            <div className="stage-eyebrow">
              <Sparkles size={14} className="text-gold" />
              <span>NARRATIVE & EMOTIONAL OBSERVATIONS</span>
            </div>

            <h2 className="stage-heading">What Stood Out in Your Dream</h2>
            <p className="stage-lead-p">
              Rather than generic labels, here are the meaningful moments, unusual details, and emotional changes we noticed:
            </p>

            {/* Emotional Arc Badge */}
            {emotionalJourney && (
              <div className="emotional-arc-card">
                <span className="emotional-arc-label">Emotional Shift</span>
                <div className="emotional-arc-pill">
                  <span className="arc-path">{emotionalJourney}</span>
                </div>
              </div>
            )}

            {/* 3-5 Meaningful Highlight Cards */}
            <div className="highlights-list-grid">
              {highlights.map((h, idx) => (
                <div key={idx} className="highlight-item-card">
                  <span className="highlight-emoji">{h.emoji}</span>
                  <p className="highlight-text">{h.text}</p>
                </div>
              ))}
            </div>

            <div className="stage-actions-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentStage(1)}
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>

              <button
                className="btn btn-primary btn-lg"
                onClick={() => setCurrentStage(3)}
              >
                <span>How to Look at It</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* STAGE 3: ONE POSSIBLE WAY TO LOOK AT IT */}
        {/* ========================================================================= */}
        {currentStage === 3 && (
          <section className="stage-view stage-fade-in" aria-label="Stage 3: One Possible Way to Look at It">
            <div className="stage-eyebrow">
              <Compass size={14} className="text-gold" />
              <span>CALM & EXPLORATORY REFLECTION</span>
            </div>

            <h2 className="stage-heading">One Possible Way to Look at It</h2>
            <p className="stage-lead-p">
              Every dream belongs only to you. Here is one simple way to reflect on it without dogmatic claims or diagnoses:
            </p>

            <div className="single-reflection-card">
              <p className="primary-reflection-text">
                &ldquo;{simpleReflection}&rdquo;
              </p>

              {analysis.personalReflection?.suggestiveQuestions?.[0] && (
                <div className="reflection-question-box">
                  <span className="question-intro">A quiet question to consider:</span>
                  <p className="question-content">
                    {analysis.personalReflection.suggestiveQuestions[0]}
                  </p>
                </div>
              )}

              <div className="reflection-disclaimer-note">
                <ShieldCheck size={14} className="text-emerald" />
                <span>Non-diagnostic reflection intended for personal introspection.</span>
              </div>
            </div>

            <div className="stage-actions-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentStage(2)}
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>

              <button
                className="btn btn-primary btn-lg"
                onClick={() => setCurrentStage(4)}
              >
                <span>See Your Dream Imagined</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* STAGE 4: YOUR DREAM — IMAGINED & EXPLORE MORE */}
        {/* ========================================================================= */}
        {currentStage === 4 && (
          <section className="stage-view stage-fade-in" aria-label="Stage 4: Your Dream Imagined">
            <div className="stage-eyebrow">
              <Palette size={14} className="text-gold" />
              <span>FAITHFUL ARTISTIC VISUALIZATION</span>
            </div>

            <h2 className="stage-heading">Your Dream — Imagined</h2>
            <p className="stage-lead-p">
              An artwork synthesized specifically from your description, preserving your objects, mood, and colors:
            </p>

            {/* Dream Artwork Vitrine */}
            <div className="artwork-display-frame">
              <div className="canvas-wrapper">
                {artDataUrl ? (
                  <img
                    src={artDataUrl}
                    alt={submission.title || 'Surreal Dream Artwork'}
                    className="rendered-artwork-img"
                  />
                ) : (
                  <div className="artwork-loading-placeholder">
                    <Sparkles size={28} className="spinner text-gold" />
                    <span>Painting your dream...</span>
                  </div>
                )}
                {/* Hidden canvas for procedural generation fallback */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>

              {/* Artwork Controls & Actions */}
              <div className="artwork-toolbar-row">
                <div className="style-preset-selector">
                  <Palette size={14} className="text-gold" />
                  <span className="preset-label">Theme:</span>
                  <select
                    className="style-dropdown"
                    value={currentStylePreset}
                    onChange={e => setCurrentStylePreset(e.target.value)}
                    disabled={isGeneratingArt}
                  >
                    {Object.values(ART_PRESETS).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="artwork-buttons-group">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleRegenerateArtwork}
                    disabled={isGeneratingArt}
                    title="Vary the artistic composition"
                  >
                    <RefreshCw size={14} className={isGeneratingArt ? 'spinner' : ''} />
                    <span>Regenerate</span>
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleDownloadArtwork}
                    disabled={!artDataUrl}
                    title="Download high-resolution image"
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </button>

                  <button
                    className={`btn btn-sm ${isSaved ? 'btn-saved' : 'btn-secondary'}`}
                    onClick={handleSaveDream}
                    disabled={isSaved}
                  >
                    <Bookmark size={14} />
                    <span>{isSaved ? 'Saved' : 'Save Dream'}</span>
                  </button>

                  {submission.privacy === 'anonymous_public' && (
                    <button
                      className={`btn btn-sm ${isPublished ? 'btn-saved' : 'btn-secondary'}`}
                      onClick={handlePublishCommunity}
                      disabled={isPublished}
                    >
                      <Share2 size={14} />
                      <span>{isPublished ? 'Shared' : 'Share'}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="artwork-epistemic-disclaimer">
                <span>Your Dream — Imagined · An artistic visualization inspired by your description. Not scientific evidence.</span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* EXPLORE MORE (Optional Choices Hub) */}
            {/* ========================================================================= */}
            <div className="explore-more-container">
              <div className="explore-more-header">
                <h3 className="explore-more-title">Explore More If You Wish</h3>
                <p className="explore-more-desc">
                  Choose what you are curious about. Research and traditional perspectives are always optional.
                </p>
              </div>

              <div className="explore-choices-grid">
                {/* 1. Research */}
                <button
                  className="explore-choice-card"
                  onClick={() => setExploreModal('research')}
                >
                  <div className="choice-icon-wrap bg-cyan-subtle">
                    <Brain size={22} className="text-cyan" />
                  </div>
                  <div className="choice-text-wrap">
                    <h4 className="choice-title">🔬 Sleep & Mind Research</h4>
                    <p className="choice-desc">How science explains REM sleep, emotion processing, and memory sorting.</p>
                  </div>
                  <ChevronRight size={18} className="choice-arrow text-cyan" />
                </button>

                {/* 2. Old Dream Beliefs */}
                <button
                  className="explore-choice-card"
                  onClick={() => setExploreModal('beliefs')}
                >
                  <div className="choice-icon-wrap bg-gold-subtle">
                    <BookOpen size={22} className="text-gold" />
                  </div>
                  <div className="choice-text-wrap">
                    <h4 className="choice-title">🏺 Old Dream Beliefs</h4>
                    <p className="choice-desc">Historical records from antiquity, manuscripts, and cultural traditions.</p>
                  </div>
                  <ChevronRight size={18} className="choice-arrow text-gold" />
                </button>

                {/* 3. Astrology */}
                <button
                  className="explore-choice-card"
                  onClick={() => setExploreModal('astrology')}
                >
                  <div className="choice-icon-wrap bg-purple-subtle">
                    <Sparkles size={22} className="text-purple" />
                  </div>
                  <div className="choice-text-wrap">
                    <h4 className="choice-title">✨ Astrology (Optional)</h4>
                    <p className="choice-desc">Traditional astrological element & planetary correspondences (non-scientific).</p>
                  </div>
                  <ChevronRight size={18} className="choice-arrow text-purple" />
                </button>

                {/* 4. My Dream Patterns */}
                <button
                  className="explore-choice-card"
                  onClick={() => setExploreModal('patterns')}
                >
                  <div className="choice-icon-wrap bg-emerald-subtle">
                    <Compass size={22} className="text-emerald" />
                  </div>
                  <div className="choice-text-wrap">
                    <h4 className="choice-title">🧠 My Dream Patterns</h4>
                    <p className="choice-desc">Check recurring emotions and motifs across all your saved dreams.</p>
                  </div>
                  <ChevronRight size={18} className="choice-arrow text-emerald" />
                </button>
              </div>
            </div>

            {/* Bottom Final Action Bar */}
            <div className="stage-actions-footer stage-final-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentStage(3)}
              >
                <ChevronLeft size={16} />
                <span>Back to Reflection</span>
              </button>

              <button
                className="btn btn-primary"
                onClick={onNewDream}
              >
                <RefreshCw size={16} />
                <span>Explore Another Dream</span>
              </button>
            </div>
          </section>
        )}
      </main>

      {/* ========================================================================= */}
      {/* OPTIONAL MODALS / DRAWERS FOR EXPLORE MORE */}
      {/* ========================================================================= */}

      {/* 1. Research Modal */}
      {exploreModal === 'research' && (
        <div className="modal-backdrop" onClick={() => setExploreModal(null)}>
          <div className="modal-dialog explore-modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <Brain size={20} className="text-cyan" />
                <h3>Sleep Science & Psychology Research</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setExploreModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="simple-science-intro">
                <h4>In Simple Everyday English:</h4>
                <p>
                  Dreams may sometimes help the brain process strong emotions connected to waking memories. During REM sleep, the brain reorganizes recent experiences and integrates them with older memories in a safe, offline state.
                </p>
              </div>

              <h4 className="research-subheading">Documented Scientific Studies:</h4>
              {scientificStudies.length > 0 ? (
                <div className="research-records-list">
                  {scientificStudies.map((item, idx) => (
                    <div key={idx} className="research-item-card">
                      <div className="research-item-header">
                        <span className="research-concept-tag">{item.researchRecord.conceptName}</span>
                        <span className="research-discipline-tag">{item.researchRecord.epistemicType || 'empirical finding'}</span>
                      </div>
                      <p className="research-summary-text">{item.researchRecord.summary}</p>
                      <div className="research-citation-row">
                        <span className="research-citation">{item.researchRecord.citation || item.researchRecord.originalPublication}</span>
                        {item.researchRecord.doi && (
                          <span className="research-doi">DOI: {item.researchRecord.doi}</span>
                        )}
                        <button
                          className="btn-link-view"
                          onClick={() => {
                            setSourceModalTarget({
                              type: 'psychology',
                              claim: item.researchRecord as ResearchRecord,
                              relevanceReason: item.relevanceReason
                            });
                          }}
                        >
                          View study record →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-sources-soft-text">No specific scientific studies matched this particular imagery.</p>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setExploreModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Old Dream Beliefs Modal */}
      {exploreModal === 'beliefs' && (
        <div className="modal-backdrop" onClick={() => setExploreModal(null)}>
          <div className="modal-dialog explore-modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <BookOpen size={20} className="text-gold" />
                <h3>Historical Cultural Traditions</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setExploreModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="beliefs-intro-box">
                <p>
                  These are historical perspectives from ancient manuscripts and cultural traditions. They reflect historical beliefs, not universal predictions.
                </p>
              </div>

              {historicalEvidence.length > 0 ? (
                <div className="beliefs-records-list">
                  {historicalEvidence.map((ev, idx) => (
                    <div key={idx} className="belief-item-card">
                      <div className="belief-item-header">
                        <span className="belief-tradition-tag">
                          {ev.evidenceRecord?.culturalTradition || ev.traditionLabel || 'Documented Tradition'}
                        </span>
                        <span className="belief-period-tag">{ev.evidenceRecord?.historicalPeriod}</span>
                      </div>
                      <p className="belief-claim-text">&ldquo;{ev.evidenceRecord?.claim || ev.claim?.claim}&rdquo;</p>
                      <div className="belief-source-row">
                        <span className="belief-source-title">{ev.evidenceRecord?.source?.sourceTitle || 'Historical Source'}</span>
                        <button
                          className="btn-link-view"
                          onClick={() => {
                            if (ev.evidenceRecord) {
                              setSourceModalTarget({
                                type: 'cultural',
                                claim: ev.evidenceRecord as EvidenceRecord,
                                relevanceReason: ev.relevanceReason
                              });
                            }
                          }}
                        >
                          View source record →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-sources-soft-card">
                  <p>No trusted source found for this idea.</p>
                  <span className="no-source-subtext">Somnithos only shows audited, historical manuscripts and never invents ancient traditions.</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setExploreModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Astrology Modal */}
      {exploreModal === 'astrology' && (
        <div className="modal-backdrop" onClick={() => setExploreModal(null)}>
          <div className="modal-dialog explore-modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <Sparkles size={20} className="text-purple" />
                <h3>Astrological Perspectives</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setExploreModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Mandatory Disclaimer */}
              <div className="astrology-disclaimer-banner">
                <ShieldCheck size={16} className="text-gold" />
                <p>
                  <strong>Note:</strong> Astrology is a traditional belief system. It is not scientific evidence.
                </p>
              </div>

              {!astrologyResult ? (
                <form className="astrology-birth-form" onSubmit={handleCalculateAstrology}>
                  <p className="astrology-prompt-text">
                    Optionally provide birth details to explore traditional astrological correspondences for your dream. (We do not ask for your name).
                  </p>

                  <div className="form-group-row">
                    <div className="form-field">
                      <label><Calendar size={14} /> Date of Birth</label>
                      <input
                        type="date"
                        value={birthDate}
                        onChange={e => setBirthDate(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-field">
                      <label><Clock size={14} /> Time of Birth (Optional)</label>
                      <input
                        type="time"
                        value={birthTime}
                        onChange={e => setBirthTime(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label><MapPin size={14} /> Birth Place (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. London, Tokyo, Chicago"
                      value={birthPlace}
                      onChange={e => setBirthPlace(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-full">
                    <span>Calculate Astrological Reading</span>
                  </button>
                </form>
              ) : (
                <div className="astrology-result-view">
                  <div className="astrology-tags-row">
                    <span className="astro-tag">{astrologyResult.signEstimate}</span>
                    <span className="astro-tag">{astrologyResult.element} Element</span>
                    <span className="astro-tag">{astrologyResult.planetaryTheme}</span>
                  </div>

                  <p className="astrology-reading-p">
                    {astrologyResult.reading}
                  </p>

                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setAstrologyResult(null)}
                  >
                    <span>Change birth info</span>
                  </button>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setExploreModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Patterns Modal */}
      {exploreModal === 'patterns' && (
        <div className="modal-backdrop" onClick={() => setExploreModal(null)}>
          <div className="modal-dialog explore-modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <Compass size={20} className="text-emerald" />
                <h3>My Dream Patterns</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setExploreModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="patterns-summary-box">
                <h4>Motifs in This Dream:</h4>
                <div className="motifs-tag-cloud">
                  {(analysis.extractedFeatures.dominantMotifs || []).map((m, i) => (
                    <span key={i} className="motif-pill">{m}</span>
                  ))}
                  {(analysis.extractedFeatures.emotionalSignals || []).map((e, i) => (
                    <span key={i} className="motif-pill emotion-pill">{e}</span>
                  ))}
                </div>

                <p className="pattern-insight-p">
                  As you record more dreams in your personal archive, Somnithos discovers recurring emotional themes and imagery transitions over time.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setExploreModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Source Viewer Modal */}
      {sourceModalTarget && (
        <SourceViewerModal
          target={sourceModalTarget}
          onClose={() => setSourceModalTarget(null)}
        />
      )}

      {/* Audit Report Modal */}
      <AuditReportModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </div>
  );
};
