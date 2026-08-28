import React, { useState } from 'react';
import { Moon, ShieldCheck, FileCheck } from 'lucide-react';
import type { AppView } from './Header';
import { AuditReportModal } from '../common/AuditReportModal';

interface FooterProps {
  onNavigate: (view: AppView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
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
                Where dreams meet meaning. Exploring nocturnal consciousness through rigorous history, cognitive neuroscience, and artistic imagination.
              </p>
              <button
                className="footer-trust-badge"
                onClick={() => setIsAuditModalOpen(true)}
                style={{ cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left', padding: 0 }}
              >
                <ShieldCheck size={16} className="trust-icon" />
                <span>Evidence-First Scholarship · View Audit</span>
              </button>
            </div>

            {/* Quick Links */}
            <div className="footer-col">
              <h4 className="footer-heading">Navigation</h4>
              <ul className="footer-links">
                <li>
                  <button onClick={() => onNavigate('home')}>Home</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('submit')}>Describe Your Dream</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('symbols')}>Dream Symbols Dictionary</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('faq')}>Science & FAQ</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('community')}>Anonymous Community Wall</button>
                </li>
              </ul>
            </div>

            {/* Epistemic Standards */}
            <div className="footer-col">
              <h4 className="footer-heading">Epistemic Standard</h4>
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
                    View System Provenance Audit
                  </button>
                </li>
              </ul>
            </div>

            {/* Disclaimer Col */}
            <div className="footer-col disclaimer-col">
              <h4 className="footer-heading">Methodology Note</h4>
              <p className="footer-disclaimer">
                Somnithos presents documented cultural beliefs as historical traditions and neuroscience models as cognitive theories. Dreams are not used to make psychiatric diagnoses or deterministic predictions. Creative reflections and artwork are explicitly labeled as original AI-generated interpretations.
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom-bar">
            <div className="copyright">
              © {new Date().getFullYear()} Somnithos. Built with intellectual rigor & creative wonder.
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
