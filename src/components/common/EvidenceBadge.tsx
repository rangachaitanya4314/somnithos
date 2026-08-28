import React from 'react';
import type { EvidenceLevel } from '../../types/dream';
import { ShieldCheck, BookOpen, Clock, HelpCircle, Sparkles } from 'lucide-react';

interface EvidenceBadgeProps {
  level: EvidenceLevel;
  showExplanation?: boolean;
  className?: string;
}

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({
  level,
  showExplanation = false,
  className = ''
}) => {
  const getBadgeConfig = () => {
    switch (level) {
      case 'HIGH':
        return {
          label: 'EVIDENCE: HIGH',
          icon: ShieldCheck,
          colorClass: 'badge-high',
          desc: 'Established through peer-reviewed research or undisputed primary manuscript provenance.'
        };
      case 'MODERATE':
        return {
          label: 'EVIDENCE: MODERATE',
          icon: BookOpen,
          colorClass: 'badge-moderate',
          desc: 'Documented in academic literature or peer-reviewed models with bounded scope.'
        };
      case 'HISTORICAL':
        return {
          label: 'HISTORICAL BELIEF',
          icon: Clock,
          colorClass: 'badge-historical',
          desc: 'Documented ancient/historical text. Verifies the belief existed historically, not that it is scientific fact.'
        };
      case 'TRADITIONAL':
        return {
          label: 'CULTURAL TRADITION',
          icon: Sparkles,
          colorClass: 'badge-traditional',
          desc: 'Documented cultural or folkloric tradition, distinct from empirical neuroscience.'
        };
      case 'UNCERTAIN':
      default:
        return {
          label: 'UNCERTAIN EVIDENCE',
          icon: HelpCircle,
          colorClass: 'badge-uncertain',
          desc: 'Limited or debated archival documentation.'
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <div className={`evidence-badge-container ${className}`}>
      <span className={`evidence-badge ${config.colorClass}`} title={config.desc}>
        <Icon size={13} className="badge-icon" />
        <span className="badge-text">{config.label}</span>
      </span>
      {showExplanation && (
        <span className="evidence-badge-explanation">{config.desc}</span>
      )}
    </div>
  );
};
