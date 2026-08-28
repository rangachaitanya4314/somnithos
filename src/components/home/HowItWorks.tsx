import React from 'react';
import { PenTool, Brain, History, Palette, ArrowRight } from 'lucide-react';
import type { AppView } from '../layout/Header';

interface HowItWorksProps {
  onNavigate: (view: AppView) => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onNavigate }) => {
  const steps = [
    {
      number: '01',
      title: 'Describe Your Dream',
      icon: PenTool,
      desc: 'Submit your dream narrative, emotional texture, settings, and symbols. Share only what you are comfortable sharing—private by default.'
    },
    {
      number: '02',
      title: 'Traceable Cultural Context',
      icon: History,
      desc: 'Discover documented historical traditions from specific ancient schools and manuscripts, accompanied by verified citations and evidence ratings.'
    },
    {
      number: '03',
      title: 'Modern Sleep Psychology',
      icon: Brain,
      desc: 'Examine cognitive models (e.g., Threat Simulation, Emotional Depressurization, Memory Consolidation) without pseudoscientific diagnostic labels.'
    },
    {
      number: '04',
      title: 'Imagination & Dream Art',
      icon: Palette,
      desc: 'Receive an original creative reflection and generate a unique surreal visualization inspired by the mood and narrative of your dream.'
    }
  ];

  return (
    <section className="how-it-works-section">
      <div className="container">
        <div className="section-header-center">
          <span className="section-eyebrow">THE EXPERIENCE FLOW</span>
          <h2 className="section-title">How Somnithos Works</h2>
          <p className="section-subtitle">
            A seamless journey moving from structured feature extraction to rigorous scholarship and artistic reflection.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="step-card">
                <div className="step-num">{step.number}</div>
                <div className="step-icon-box">
                  <Icon size={22} />
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="flow-cta-box">
          <button className="btn btn-primary" onClick={() => onNavigate('submit')}>
            <span>Begin Your Dream Journey</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};
