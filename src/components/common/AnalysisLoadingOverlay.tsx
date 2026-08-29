import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Feather, Palette } from 'lucide-react';
import { useI18n } from '../../services/i18n/I18nContext';

interface AnalysisLoadingOverlayProps {
  isOpen: boolean;
}

export const AnalysisLoadingOverlay: React.FC<AnalysisLoadingOverlayProps> = ({ isOpen }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const { t } = useI18n();

  const steps = [
    { icon: Sparkles, text: t.loadingOverlay.step1 },
    { icon: Feather, text: t.loadingOverlay.step2 },
    { icon: ShieldCheck, text: t.loadingOverlay.step3 },
    { icon: Palette, text: t.loadingOverlay.step4 }
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIdx(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIdx(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 500);

    return () => clearInterval(interval);
  }, [isOpen, steps.length]);

  if (!isOpen) return null;

  const ActiveIcon = steps[currentStepIdx].icon;

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

        <h3 className="loading-step-title">{steps[currentStepIdx].text}</h3>
        <p className="loading-step-subtitle">
          {t.loadingOverlay.subtitle}
        </p>

        <div className="loading-progress-track">
          {steps.map((step, idx) => (
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

