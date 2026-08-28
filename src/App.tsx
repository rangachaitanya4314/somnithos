import React, { useState, useEffect } from 'react';
import { AmbientBackground } from './components/layout/AmbientBackground';
import { Header } from './components/layout/Header';
import type { AppView } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomeView } from './components/home/HomeView';
import { DreamSubmitForm } from './components/submit/DreamSubmitForm';
import { DreamAnalysisView } from './components/analysis/DreamAnalysisView';
import { SymbolExplorer } from './components/symbols/SymbolExplorer';
import { FAQSection } from './components/faq/FAQSection';
import { CommunityWall } from './components/community/CommunityWall';
import { SavedDreamsView } from './components/saved/SavedDreamsView';
import type { DreamSubmission, DreamAnalysisResult } from './types/dream';
import { DreamAnalysisApiService } from './services/api/dreamAnalysisApi';
import { DreamAnalysisEngine } from './services/dreamAnalysisEngine';
import { AnalysisLoadingOverlay } from './components/common/AnalysisLoadingOverlay';
import { StorageService } from './services/storageService';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [activeSubmission, setActiveSubmission] = useState<DreamSubmission | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<DreamAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [selectedSymbolId, setSelectedSymbolId] = useState<string | undefined>(undefined);
  const [savedCount, setSavedCount] = useState<number>(0);

  // Update saved dreams counter
  useEffect(() => {
    const saved = StorageService.getSavedDreamAnalyses();
    setSavedCount(saved.length);
  }, [currentView, activeAnalysis]);

  // Handle dream submission via API
  const handleDreamSubmit = async (submission: DreamSubmission) => {
    setIsAnalyzing(true);
    setActiveSubmission(submission);

    try {
      const startTime = Date.now();
      const result = await DreamAnalysisApiService.analyzeDream(submission);
      const elapsed = Date.now() - startTime;
      const remainingDelay = Math.max(0, 650 - elapsed);

      setTimeout(() => {
        setActiveAnalysis(result as unknown as DreamAnalysisResult);
        setIsAnalyzing(false);
        setCurrentView('analysis');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, remainingDelay);
    } catch {
      // Fallback
      const fallbackResult = DreamAnalysisEngine.analyze(submission);
      setActiveAnalysis(fallbackResult);
      setIsAnalyzing(false);
      setCurrentView('analysis');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSavedDream = (submission: DreamSubmission, analysis: DreamAnalysisResult) => {
    setActiveSubmission(submission);
    setActiveAnalysis(analysis);
    setCurrentView('analysis');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSymbolFromHome = (symbolId: string) => {
    setSelectedSymbolId(symbolId);
    setCurrentView('symbols');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-root">
      {/* 1. Starfield & Nebula Ambient Background */}
      <AmbientBackground />
      <AnalysisLoadingOverlay isOpen={isAnalyzing} />

      {/* 2. Top Header Navigation */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        savedCount={savedCount}
      />

      {/* 3. Main Views */}
      <main className="main-content">
        {currentView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onSelectSymbol={handleSelectSymbolFromHome}
          />
        )}

        {currentView === 'submit' && (
          <DreamSubmitForm
            onSubmit={handleDreamSubmit}
            isAnalyzing={isAnalyzing}
          />
        )}

        {currentView === 'analysis' && activeSubmission && activeAnalysis && (
          <DreamAnalysisView
            submission={activeSubmission}
            analysis={activeAnalysis}
            onNewDream={() => handleNavigate('submit')}
            onViewCommunity={() => handleNavigate('community')}
          />
        )}

        {currentView === 'symbols' && (
          <SymbolExplorer initialSelectedSymbolId={selectedSymbolId} />
        )}

        {currentView === 'faq' && <FAQSection />}

        {currentView === 'community' && <CommunityWall />}

        {currentView === 'saved' && (
          <SavedDreamsView
            onSelectDream={handleSelectSavedDream}
            onNewDream={() => handleNavigate('submit')}
          />
        )}
      </main>

      {/* 4. Global Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default App;
