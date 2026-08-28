import React from 'react';
import { Hero } from './Hero';
import { EvidenceTrustBanner } from './EvidenceTrustBanner';
import { HowItWorks } from './HowItWorks';
import { FeaturedSymbols } from './FeaturedSymbols';
import type { AppView } from '../layout/Header';
import { COMMUNITY_DEMO_DREAMS } from '../../data/communityDemo';
import { FAQ_ITEMS } from '../../data/faqsData';
import { Users, HelpCircle, ArrowRight, Sparkles, MessageSquareHeart } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: AppView) => void;
  onSelectSymbol?: (symbolId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onSelectSymbol }) => {
  return (
    <div className="home-view">
      {/* 1. Cinematic Hero */}
      <Hero onNavigate={onNavigate} />

      {/* 2. Scientific & Historical Trust Banner */}
      <EvidenceTrustBanner />

      {/* 3. Step-by-Step Experience Flow */}
      <HowItWorks onNavigate={onNavigate} />

      {/* 4. Featured Evidence-Grounded Symbols */}
      <FeaturedSymbols onNavigate={onNavigate} onSelectSymbol={onSelectSymbol} />

      {/* 5. Community Glimpse Section */}
      <section className="home-community-preview-section" aria-labelledby="community-preview-title">
        <div className="container">
          <div className="section-header-flex">
            <div className="section-header-text">
              <span className="section-eyebrow">ANONYMOUS DREAM SANCTUARY</span>
              <h2 id="community-preview-title" className="section-title">Community Reflections</h2>
              <p className="section-subtitle">
                Explore nocturnal stories shared anonymously by dreamers worldwide. Completely private with zero personal identifiers stored.
              </p>
            </div>
            <button className="btn btn-secondary section-header-action" onClick={() => onNavigate('community')}>
              <Users size={16} className="text-gold" />
              <span>Enter Sanctuary Wall</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="community-cards-grid">
            {COMMUNITY_DEMO_DREAMS.slice(0, 3).map(post => (
              <article
                key={post.id}
                className="home-comm-card"
                onClick={() => onNavigate('community')}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigate('community');
                  }
                }}
              >
                <div className="comm-card-header">
                  <span className="comm-card-badge">ANONYMOUS DREAM</span>
                  <span className="comm-demo-pill">DEMO SAMPLE</span>
                </div>

                <h3 className="comm-card-title">{post.title}</h3>
                
                <p className="comm-card-excerpt">&quot;{post.excerpt}&quot;</p>

                <div className="comm-card-tags">
                  {post.emotions.slice(0, 2).map((e, i) => (
                    <span key={i} className="comm-tag">
                      {e}
                    </span>
                  ))}
                  {post.symbols.slice(0, 2).map((s, i) => (
                    <span key={`sym-${i}`} className="comm-motif-tag">
                      #{s}
                    </span>
                  ))}
                </div>

                <div className="comm-card-reflection">
                  <Sparkles size={14} className="comm-sparkle" />
                  <p className="comm-reflection-text">&quot;{post.originalReflection}&quot;</p>
                </div>

                <div className="comm-card-footer">
                  <span className="reaction-stat">
                    <MessageSquareHeart size={14} className="text-gold" />
                    <span>{post.reactions.resonated + post.reactions.mystified + post.reactions.comforted} reflections</span>
                  </span>
                  <span className="post-date">Sample Entry</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Quick FAQ Teaser */}
      <section className="home-faq-teaser-section">
        <div className="container">
          <div className="faq-teaser-card">
            <div className="faq-teaser-content">
              <span className="section-eyebrow">RIGOROUS SCHOLARSHIP</span>
              <h2 className="section-title">Have Questions About Sleep & Dreams?</h2>
              <p className="section-subtitle">
                Read peer-reviewed answers on why we forget dreams, how memory consolidation works, and how ancient civilizations categorized nocturnal visions.
              </p>
              <button className="btn btn-primary" onClick={() => onNavigate('faq')}>
                <HelpCircle size={18} />
                <span>Explore All Science FAQs ({FAQ_ITEMS.length})</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
