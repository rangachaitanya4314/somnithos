import React, { useState } from 'react';
import { Moon, Sparkles, BookOpen, HelpCircle, Users, Bookmark, Menu, X, Volume2, VolumeX, ShieldCheck, Globe, ChevronDown } from 'lucide-react';
import { SonicSignatureService } from '../../services/sonicSignatureService';
import { AuditReportModal } from '../common/AuditReportModal';
import { useI18n } from '../../services/i18n/I18nContext';
import type { LanguageCode } from '../../services/i18n/types';

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
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const { language, setLanguage, supportedLanguages, t } = useI18n();

  const toggleAmbientAudio = () => {
    const nextState = SonicSignatureService.toggleSound();
    setIsAudioPlaying(nextState);
  };

  const handleNavClick = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const handleLanguageSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsLangDropdownOpen(false);
  };

  const currentLangObj = supportedLanguages.find(l => l.code === language) || supportedLanguages[0];

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
              <span className="brand-name">{t.common.somnithosPill}</span>
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
              <span>{t.common.newDream}</span>
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
              <span>{t.common.community}</span>
            </button>
            <button
              className={`nav-link saved-btn ${currentView === 'saved' ? 'active' : ''}`}
              onClick={() => handleNavClick('saved')}
              title="View saved dreams"
            >
              <Bookmark size={14} />
              <span>{t.common.save}</span>
              {savedCount > 0 && <span className="badge-count">{savedCount}</span>}
            </button>

            {/* Language Selector Dropdown */}
            <div className="lang-selector-wrapper" style={{ position: 'relative' }}>
              <button
                className="nav-link lang-selector-btn"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                title="Change language"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Globe size={14} />
                <span>{currentLangObj.nativeName}</span>
                <ChevronDown size={12} style={{ opacity: 0.7 }} />
              </button>

              {isLangDropdownOpen && (
                <div
                  className="lang-dropdown-menu"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    background: 'rgba(10, 16, 32, 0.95)',
                    border: '1px solid var(--border-gold)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.4rem',
                    minWidth: '130px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(16px)',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem'
                  }}
                >
                  {supportedLanguages.map(langOpt => (
                    <button
                      key={langOpt.code}
                      onClick={() => handleLanguageSelect(langOpt.code)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.45rem 0.75rem',
                        background: language === langOpt.code ? 'rgba(197, 160, 89, 0.15)' : 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        color: language === langOpt.code ? 'var(--text-gold)' : 'var(--text-primary)',
                        fontSize: '0.85rem',
                        fontWeight: language === langOpt.code ? 600 : 400,
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      <span>{langOpt.nativeName}</span>
                      {language === langOpt.code && <span style={{ fontSize: '0.75rem' }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

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
            {/* Mobile Language Switcher Row */}
            <div style={{ display: 'flex', gap: '0.4rem', padding: '0.5rem 0.2rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              {supportedLanguages.map(langOpt => (
                <button
                  key={langOpt.code}
                  onClick={() => {
                    handleLanguageSelect(langOpt.code);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    flex: 1,
                    minWidth: '70px',
                    padding: '0.35rem 0.5rem',
                    background: language === langOpt.code ? 'rgba(197, 160, 89, 0.2)' : 'rgba(255,255,255,0.05)',
                    border: language === langOpt.code ? '1px solid var(--border-gold)' : '1px solid transparent',
                    borderRadius: 'var(--radius-sm)',
                    color: language === langOpt.code ? 'var(--text-gold)' : 'var(--text-primary)',
                    fontSize: '0.82rem',
                    fontWeight: language === langOpt.code ? 600 : 400,
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  {langOpt.nativeName}
                </button>
              ))}
            </div>

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
              <span>{t.common.newDream}</span>
            </button>
            <button
              className={`mobile-nav-link ${currentView === 'symbols' ? 'active' : ''}`}
              onClick={() => handleNavClick('symbols')}
            >
              <BookOpen size={16} />
              <span>Dream Symbols</span>
            </button>
            <button
              className={`mobile-nav-link ${currentView === 'faq' ? 'active' : ''}`}
              onClick={() => handleNavClick('faq')}
            >
              <HelpCircle size={16} />
              <span>Science & FAQ</span>
            </button>
            <button
              className={`mobile-nav-link ${currentView === 'community' ? 'active' : ''}`}
              onClick={() => handleNavClick('community')}
            >
              <Users size={16} />
              <span>{t.common.community}</span>
            </button>
            <button
              className={`mobile-nav-link ${currentView === 'saved' ? 'active' : ''}`}
              onClick={() => handleNavClick('saved')}
            >
              <Bookmark size={16} />
              <span>{t.common.save} ({savedCount})</span>
            </button>
            <button
              className="mobile-nav-link"
              onClick={() => {
                setIsAuditModalOpen(true);
                setMobileMenuOpen(false);
              }}
            >
              <ShieldCheck size={16} />
              <span>Audit & Provenance</span>
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
