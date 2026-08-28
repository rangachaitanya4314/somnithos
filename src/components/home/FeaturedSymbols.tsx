import React from 'react';
import { DREAM_SYMBOLS } from '../../data/dreamSymbols';
import { ArrowRight, ShieldCheck, BookOpen } from 'lucide-react';
import type { AppView } from '../layout/Header';

interface FeaturedSymbolsProps {
  onNavigate: (view: AppView) => void;
  onSelectSymbol?: (symbolId: string) => void;
}

export const FeaturedSymbols: React.FC<FeaturedSymbolsProps> = ({ onNavigate, onSelectSymbol }) => {
  const featured = DREAM_SYMBOLS.slice(0, 6);

  return (
    <section className="featured-symbols-section" aria-labelledby="featured-symbols-title">
      <div className="container">
        <div className="section-header-flex">
          <div className="section-header-text">
            <span className="section-eyebrow">EVIDENCE-GROUNDED SYMBOL CATALOG</span>
            <h2 id="featured-symbols-title" className="section-title">Explore Dream Motifs</h2>
            <p className="section-subtitle">
              We never claim dream symbols have single universal meanings. Discover how motifs are analyzed across documented historical traditions and cognitive research models.
            </p>
          </div>
          <button className="btn btn-secondary section-header-action" onClick={() => onNavigate('symbols')}>
            <BookOpen size={16} className="text-gold" />
            <span>View All Symbols ({DREAM_SYMBOLS.length})</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="symbols-cards-grid">
          {featured.map(sym => (
            <article
              key={sym.id}
              className="symbol-card"
              onClick={() => {
                if (onSelectSymbol) onSelectSymbol(sym.id);
                onNavigate('symbols');
              }}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (onSelectSymbol) onSelectSymbol(sym.id);
                  onNavigate('symbols');
                }
              }}
            >
              <div className="symbol-card-header">
                <span className="symbol-category-tag">{sym.category.toUpperCase()}</span>
                <span className="symbol-source-count">
                  <ShieldCheck size={13} className="text-gold" />
                  <span>{sym.documentedCulturalInterpretations.length + sym.psychologicalPerspectives.length} Sources</span>
                </span>
              </div>

              <h3 className="symbol-name">{sym.symbol}</h3>
              
              <p className="symbol-desc">{sym.summaryDescription}</p>

              <div className="symbol-card-bottom">
                <div className="symbol-related-tags">
                  {sym.relatedSymbols.slice(0, 3).map((r, i) => (
                    <span key={i} className="related-tag">
                      #{r}
                    </span>
                  ))}
                </div>
                <span className="symbol-view-cta">
                  <span>Explore Motif</span>
                  <ArrowRight size={14} />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
