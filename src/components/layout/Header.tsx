import React, { useState } from 'react';
import { Moon, Sparkles, BookOpen, HelpCircle, Users, Bookmark, Menu, X, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { SonicSignatureService } from '../../services/sonicSignatureService';
import { AuditReportModal } from '../common/AuditReportModal';

export type AppView = 'home' | 'submit' | 'analysis' | 'symbols' | 'faq' | 'community' | 'saved';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, savedCount }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(() => SonicSignatureService.isEnabled());
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const toggleAmbientAudio = () => {
    const nextState = SonicSignatureService.toggleSound();
    setIsAudioPlaying(nextState);
  };

  const handleNavClick = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="site-header">
        <div className="header-inner container">
          {/* Brand */}
          <div className="brand" onClick={() => handleNavClick('home')} role="button" tabIndex={0}>
            <div className="brand-icon-wrap">
              <Moon size={22} className="brand-moon" />
              <Sparkles size={13} className="brand-sparkle" />
            </div>
            <div className="brand-text">
              <span className="brand-name">SOMNITHOS</span>
              <span className="brand-sub">Where dreams meet meaning.</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="desktop-nav">
            <button
              className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => handleNavClick('home')}
            >
              Home
            </button>
            <button
              className={`nav-link ${currentView === 'submit' || currentView === 'analysis' ? 'active' : ''}`}
              onClick={() => handleNavClick('submit')}
            >
              <Sparkles size={14} />
              <span>Explore Dream</span>
            </button>
            <button
              className={`nav-link ${currentView === 'symbols' ? 'active' : ''}`}
              onClick={() => handleNavClick('symbols')}
            >
              <BookOpen size={14} />
              <span>Dream Symbols</span>
            </button>
            <button
              className={`nav-link ${currentView === 'faq' ? 'active' : ''}`}
              onClick={() => handleNavClick('faq')}
            >
              <HelpCircle size={14} />
              <span>Science & FAQ</span>
            </button>
            <button
              className={`nav-link ${currentView === 'community' ? 'active' : ''}`}
              onClick={() => handleNavClick('community')}
            >
              <Users size={14} />
              <span>Community Wall</span>
            </button>
            <button
              className={`nav-link saved-btn ${currentView === 'saved' ? 'active' : ''}`}
              onClick={() => handleNavClick('saved')}
              title="View saved dreams"
            >
              <Bookmark size={14} />
              <span>Saved</span>
              {savedCount > 0 && <span className="badge-count">{savedCount}</span>}
            </button>

            {/* Audit Report Trigger */}
            <button
              className="nav-link audit-nav-btn"
              onClick={() => setIsAuditModalOpen(true)}
              title="Open System Provenance & Dataset Verification Audit"
            >
              <ShieldCheck size={14} />
              <span>Audit</span>
            </button>

            <button
              className={`nav-link sound-toggle-btn ${isAudioPlaying ? 'active' : ''}`}
              onClick={toggleAmbientAudio}
              title={isAudioPlaying ? 'Mute ambient soundscape' : 'Play meditative ambient soundscape'}
            >
              {isAudioPlaying ? <Volume2 size={15} /> : <VolumeX size={15} />}
              <span>{isAudioPlaying ? 'Ambient: On' : 'Ambient: Off'}</span>
            </button>
          </nav>

          {/* Mobile Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <button
              className={`mobile-nav-link ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => handleNavClick('home')}
            >
              Home
            </button>
            <button
              className={`mobile-nav-link ${currentView === 'submit' ? 'active' : ''}`}
              onClick={() => handleNavClick('submit')}
            >
              <Sparkles size={16} />
              <span>Explore My Dream</span>
            </button>
            <button
              className={`mobile-nav-link ${currentView === 'symbols' ? 'active' : ''}`}
              onClick={() => handleNavClick('symbols')}
            >
              <BookOpen size={16} />
              <span>Dream Symbols Dictionary</span>
            </button>
            <button
              className={`mobile-nav-link ${currentView === 'faq' ? 'active' : ''}`}
              onClick={() => handleNavClick('faq')}
            >
              <HelpCircle size={16} />
              <span>Science & Methodology FAQ</span>
            </button>
            <button
              className={`mobile-nav-link ${currentView === 'community' ? 'active' : ''}`}
              onClick={() => handleNavClick('community')}
            >
              <Users size={16} />
              <span>Community Wall</span>
            </button>
            <button
              className={`mobile-nav-link ${currentView === 'saved' ? 'active' : ''}`}
              onClick={() => handleNavClick('saved')}
            >
              <Bookmark size={16} />
              <span>Saved Dreams ({savedCount})</span>
            </button>
            <button
              className="mobile-nav-link"
              onClick={() => {
                setIsAuditModalOpen(true);
                setMobileMenuOpen(false);
              }}
            >
              <ShieldCheck size={16} />
              <span>Audit & Provenance Report</span>
            </button>
            <button
              className={`mobile-nav-link ${isAudioPlaying ? 'active' : ''}`}
              onClick={toggleAmbientAudio}
            >
              {isAudioPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>{isAudioPlaying ? 'Mute Ambient Sound' : 'Play Ambient Sound'}</span>
            </button>
          </div>
        )}
      </header>

      {/* Audit Report Modal */}
      <AuditReportModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </>
  );
};
