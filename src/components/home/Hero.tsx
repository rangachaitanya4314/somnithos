import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldCheck, ArrowRight, BookMarked, Telescope, Eye, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { RcHeroMonogram } from './RcHeroMonogram';
import { SonicSignatureService } from '../../services/sonicSignatureService';
import { useI18n } from '../../services/i18n/I18nContext';
import type { AppView } from '../layout/Header';

interface HeroProps {
  onNavigate: (view: AppView) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const { t } = useI18n();
  const [isSoundActive, setIsSoundActive] = useState<boolean>(() => SonicSignatureService.isEnabled());
  const [animKey, setAnimKey] = useState<number>(0);

  useEffect(() => {
    // Play synchronized RC monogram sonic signature on hero reveal
    SonicSignatureService.playRcSonicSignature();
  }, [animKey]);

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = SonicSignatureService.toggleSound();
    setIsSoundActive(nextState);
  };

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimKey(prev => prev + 1);
    SonicSignatureService.playRcSonicSignature(true);
  };

  return (
    <section className="hero-section" key={animKey}>
      {/* Sound & Replay Controls Header */}
      <div className="hero-sound-controls">
        <button
          className={`hero-sound-pill ${isSoundActive ? 'active' : ''}`}
          onClick={handleToggleSound}
          title={isSoundActive ? 'Sound signature active (Click to mute)' : 'Sound muted (Click to enable)'}
          aria-label={isSoundActive ? 'Mute sonic signature' : 'Enable sonic signature'}
        >
          {isSoundActive ? <Volume2 size={13} className="text-gold" /> : <VolumeX size={13} />}
          <span>{isSoundActive ? 'Sound: On' : 'Sound: Off'}</span>
        </button>

        <button
          className="hero-sound-pill hero-replay-pill"
          onClick={handleReplay}
          title="Replay RC Reveal & Sonic Signature"
          aria-label="Replay RC animation and sound"
        >
          <RotateCcw size={12} />
          <span>Replay Reveal</span>
        </button>
      </div>

      {/* 1. Subtle Atmospheric Star & Nebula Canvas */}
      <div className="hero-ambient-canvas" aria-hidden="true">
        <div className="constellation-glow"></div>
        <div className="ambient-fog fog-left"></div>
        <div className="ambient-fog fog-right"></div>
        <div className="star-twinkle s1"></div>
        <div className="star-twinkle s2"></div>
        <div className="star-twinkle s3"></div>
        <div className="star-twinkle s4"></div>
      </div>

      {/* 2. Independent RC Monogram Animated Layer (Background < RC < Foreground) */}
      <div className="hero-rc-backdrop-wrapper" aria-hidden="true">
        <div className="rc-monogram-entrance">
          <div className="rc-monogram-breathe">
            <RcHeroMonogram />
          </div>
        </div>
      </div>

      <div className="container hero-inner">
        {/* Top Archival Epistemic Badge (Reveals ~2.6s) */}
        <div className="hero-pill-badge hero-anim-badge">
          <ShieldCheck size={14} className="pill-icon text-gold" />
          <span>Ancient Archives × Modern Observatory × Creative Synthesis</span>
        </div>

        {/* Phase 3: Brand Reveal with Filigree Accents (3.0s) */}
        <div className="hero-brand-emblem hero-anim-brand">
          <span className="brand-filigree-line left-line" aria-hidden="true"></span>
          <span className="hero-brand-eyebrow">SOMNITHOS</span>
          <span className="brand-filigree-line right-line" aria-hidden="true"></span>
        </div>

        {/* Phase 4: Main Headline - 2 Lines matching visual reference (3.4s) */}
        <h1 className="hero-headline hero-anim-headline">
          <span className="headline-line1">{t.home.heroTagline}</span>
          <span className="headline-line2">{t.home.heroTitle}</span>
        </h1>

        {/* Phase 5: Supporting Message (3.8s) */}
        <p className="hero-subheadline hero-anim-subheadline">
          {t.home.heroSubtitle}
        </p>

        {/* Phase 6: CTA Action Buttons (4.2s) */}
        <div className="hero-cta-group hero-anim-actions">
          <button
            className="btn btn-primary hero-btn-gold"
            onClick={() => onNavigate('submit')}
          >
            <Sparkles size={17} />
            <span>{t.home.heroCta}</span>
            <ArrowRight size={17} className="btn-arrow" />
          </button>

          <button
            className="btn btn-secondary hero-btn-midnight"
            onClick={() => onNavigate('symbols')}
          >
            <BookMarked size={17} />
            <span>{t.home.heroSecondaryCta}</span>
          </button>
        </div>

        {/* Two-Layer Distinction Architecture (Evidence vs Imagination) */}
        <div className="hero-layers-card hero-anim-layers">
          {/* Layer 1: Evidence (Archival / Museum Vitrine) */}
          <div className="layer-item evidence-layer-item">
            <div className="layer-header">
              <div className="layer-icon-badge evidence-badge">
                <Telescope size={15} />
              </div>
              <div className="layer-meta">
                <span className="layer-tag">LAYER 1 · EVIDENCE</span>
                <span className="layer-subtag">Documented Knowledge</span>
              </div>
            </div>
            <h3 className="layer-title">Traceable Scholarship</h3>
            <p className="layer-desc">
              Grounded strictly in documented primary manuscripts (e.g. <em>Papyrus Chester Beatty III</em>, Artemidorus), peer-reviewed sleep neuroscience (e.g. <em>Revonsuo, Walker</em>), and verified historical quotations.
            </p>
            <div className="layer-guarantee">
              <ShieldCheck size={13} className="text-gold" />
              <span>Strict Rule: Never invent factual claims or traditions.</span>
            </div>
          </div>

          <div className="layer-divider-vertical" aria-hidden="true">
            <div className="divider-orb"></div>
          </div>

          {/* Layer 2: Imagination (Celestial / Creative Exploration) */}
          <div className="layer-item imagination-layer-item">
            <div className="layer-header">
              <div className="layer-icon-badge imagination-badge">
                <Eye size={15} />
              </div>
              <div className="layer-meta">
                <span className="layer-tag">LAYER 2 · IMAGINATION</span>
                <span className="layer-subtag">AI-Generated Creative Exploration</span>
              </div>
            </div>
            <h3 className="layer-title">Personal Reflection & Art</h3>
            <p className="layer-desc">
              Intimate symbolic reflections, poetic resonance, and faithful generative dream artwork—explicitly labeled as original creative explorations inspired by your narrative.
            </p>
            <div className="layer-guarantee">
              <Sparkles size={13} className="text-cyan" />
              <span>Original reflection & artwork inspired by your dream.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
