import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, ShieldCheck, Feather, Palette } from 'lucide-react';

interface AnalysisLoadingOverlayProps {
  isOpen: boolean;
}

const STEPS = [
  { icon: Sparkles, text: 'Reading your dream...' },
  { icon: BookOpen, text: 'Finding relevant knowledge...' },
  { icon: ShieldCheck, text: 'Separating evidence from interpretation...' },
  { icon: Feather, text: 'Creating your personal reflection...' },
  { icon: Palette, text: 'Imagining your dream...' }
];

export const AnalysisLoadingOverlay: React.FC<AnalysisLoadingOverlayProps> = ({ isOpen }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIdx(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIdx(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const ActiveIcon = STEPS[currentStepIdx].icon;

  return (
    <div className="analysis-loading-backdrop" role="dialog" aria-modal="true" aria-label="Analyzing dream">
      <div className="analysis-loading-card">
        <div className="loading-orbit-rings">
          <div className="orbit-ring ring-1"></div>
          <div className="orbit-ring ring-2"></div>
          <div className="orbit-center-icon">
            <ActiveIcon size={28} className="text-gold spinning-slow" />
          </div>
        </div>

        <h3 className="loading-step-title">{STEPS[currentStepIdx].text}</h3>
        <p className="loading-step-subtitle">
          Somnithos grounds insights in audited human sources and creates your personal reflection.
        </p>

        <div className="loading-progress-track">
          {STEPS.map((step, idx) => (
            <div
              key={idx}
              className={`loading-progress-dot ${idx === currentStepIdx ? 'active' : ''} ${idx < currentStepIdx ? 'completed' : ''}`}
              title={step.text}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
