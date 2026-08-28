import React, { useState } from 'react';
import { FAQ_ITEMS } from '../../data/faqsData';
import { EvidenceBadge } from '../common/EvidenceBadge';
import { Search, ChevronDown, ChevronUp, HelpCircle, ShieldCheck, BookOpen, Brain, History, Sparkles, X } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set([FAQ_ITEMS[0].id, FAQ_ITEMS[1].id]));

  const categories = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'sleep_science', label: 'Sleep & Neuroscience', icon: Brain },
    { id: 'psychology', label: 'Psychology & Memory', icon: Sparkles },
    { id: 'culture_history', label: 'Culture & History', icon: History },
    { id: 'mythology_folklore', label: 'Mythology & Folklore', icon: BookOpen },
    { id: 'evidence_methodology', label: 'Evidence & Standards', icon: ShieldCheck }
  ];

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredFaqs = FAQ_ITEMS.filter(faq => {
    const matchesCat = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesQuery =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answerMarkdown.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="faq-page-container container">
      {/* Header */}
      <div className="faq-header">
        <span className="section-eyebrow">RESEARCH & METHODOLOGY COMPENDIUM</span>
        <h1 className="faq-title">Science, Culture & Evidence FAQ</h1>
        <p className="faq-sub">
          Peer-reviewed explanations on sleep neurobiology, memory consolidation, and historical dream traditions.
        </p>

        {/* Search Bar */}
        <div className="faq-search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="faq-search-input"
            placeholder="Search questions (e.g. why do we forget dreams, REM sleep, snakes, evidence rules)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="faq-category-pills">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                className={`faq-cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <Icon size={14} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion FAQ List */}
      <div className="faq-list-stack">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map(faq => {
            const isExpanded = expandedIds.has(faq.id);
            return (
              <div key={faq.id} className={`faq-accordion-item ${isExpanded ? 'expanded' : ''}`}>
                <div
                  className="faq-question-row"
                  onClick={() => toggleExpand(faq.id)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                >
                  <div className="question-text-wrap">
                    <h3 className="faq-question-text">{faq.question}</h3>
                    <EvidenceBadge level={faq.evidenceStatus} />
                  </div>
                  <button className="expand-icon-btn" aria-label="Toggle answer">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="faq-answer-body">
                    <div className="faq-markdown-content">
                      {faq.answerMarkdown.split('\n\n').map((paragraph, pIdx) => {
                        if (paragraph.startsWith('* ') || paragraph.startsWith('1. ') || paragraph.startsWith('2. ') || paragraph.startsWith('3. ')) {
                          return (
                            <ul key={pIdx} className="faq-markdown-list">
                              {paragraph.split('\n').map((line, lIdx) => (
                                <li key={lIdx} dangerouslySetInnerHTML={{
                                  __html: line
                                    .replace(/^[\*\d\.]+\s+/, '')
                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                }} />
                              ))}
                            </ul>
                          );
                        }
                        return (
                          <p
                            key={pIdx}
                            dangerouslySetInnerHTML={{
                              __html: paragraph
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="faq-empty-state">
            <p>No questions matched your search query &quot;{searchQuery}&quot;.</p>
            <button className="btn btn-secondary" onClick={() => setSearchQuery('')}>
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
