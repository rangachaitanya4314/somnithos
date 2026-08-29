import React, { useState } from 'react';
import { Moon, ShieldCheck, FileCheck } from 'lucide-react';
import type { AppView } from './Header';
import { AuditReportModal } from '../common/AuditReportModal';
import { useI18n } from '../../services/i18n/I18nContext';

interface FooterProps {
  onNavigate: (view: AppView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useI18n();
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  return (
    <>
      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-top-grid">
            {/* Brand Col */}
            <div className="footer-col brand-col">
              <div className="brand footer-brand">
                <Moon size={20} className="brand-moon" />
                <span className="brand-name">SOMNITHOS</span>
              </div>
              <p className="footer-tagline">
                {t.footer.brandTagline}
              </p>
              <button
                className="footer-trust-badge"
                onClick={() => setIsAuditModalOpen(true)}
                style={{ cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left', padding: 0 }}
              >
                <ShieldCheck size={16} className="trust-icon" />
                <span>{t.common.auditProvenance}</span>
              </button>
            </div>

            {/* Quick Links */}
            <div className="footer-col">
              <h4 className="footer-heading">Navigation</h4>
              <ul className="footer-links">
                <li>
                  <button onClick={() => onNavigate('home')}>{t.common.home}</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('submit')}>{t.common.describeDream}</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('symbols')}>{t.common.symbolsDictionary}</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('faq')}>{t.common.faq}</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('community')}>{t.common.community}</button>
                </li>
              </ul>
            </div>

            {/* Epistemic Standards */}
            <div className="footer-col">
              <h4 className="footer-heading">{t.footer.epistemicStandard}</h4>
              <ul className="footer-links">
                <li>
                  <span className="footer-text-link">Primary Historical Sources Only</span>
                </li>
                <li>
                  <span className="footer-text-link">Peer-Reviewed Cognitive Science</span>
                </li>
                <li>
                  <span className="footer-text-link">No Hallucinated Traditions</span>
                </li>
                <li>
                  <span className="footer-text-link">Transparent &quot;Why Am I Seeing This?&quot;</span>
                </li>
                <li>
                  <button
                    className="footer-text-link"
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0 }}
                    onClick={() => setIsAuditModalOpen(true)}
                  >
                    <FileCheck size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    {t.common.auditProvenance}
                  </button>
                </li>
              </ul>
            </div>

            {/* Disclaimer Col */}
            <div className="footer-col disclaimer-col">
              <h4 className="footer-heading">{t.footer.disclaimerHeading}</h4>
              <p className="footer-disclaimer">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom-bar">
            <div className="copyright">
              {t.footer.copyright}
            </div>
            <div className="footer-status-indicator">
              <span className="status-dot"></span>
              <span>All Sources Traceable & Verified</span>
            </div>
          </div>
        </div>
      </footer>

      <AuditReportModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </>
  );
};
