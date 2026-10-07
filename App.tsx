import React, { lazy, Suspense, memo, useState } from 'react';
import { useAnalysis } from './context/AnalysisContext';
import Header from './components/Header';
import Footer from './components/Footer';
import PageLoader from './components/PageLoader';
import StepIndicator from './components/StepIndicator';
import ZoomControls from './components/ZoomControls';
import PerformanceMetrics from './components/PerformanceMetrics';
import LandingPage from '/src/components/LandingPage.tsx';

// Lazy load components for code-splitting
const EntryStep = lazy(() => import('./components/EntryStep'));
const NarrativeInputStep = lazy(() => import('./components/NarrativeInputStep'));
const StrategyProposalStep = lazy(() => import('./components/StrategyProposalStep'));
const UploadStep = lazy(() => import('./components/UploadStep'));
const AnalyzingStep = lazy(() => import('./components/AnalyzingStep'));
const ReportStep = lazy(() => import('./components/ReportStep'));
const UserManual = lazy(() => import('./components/UserManual'));
const ComparativeUploadStep = lazy(() => import('./components/ComparativeUploadStep'));
const ComparativeReportStep = lazy(() => import('./components/ComparativeReportStep'));
const SettingsAndPrivacyModal = lazy(() => import('./components/governance/SettingsAndPrivacyModal'));

export const App: React.FC = memo(() => {
  const {
    currentScreen,
    isManualOpen,
    toggleManual,
    isConfigModalOpen,
    configModalTab,
    toggleConfigModal,
    selectWorkflow,
    submitNarrative,
    goBack,
    proposedStrategies,
    selectStrategy,
    narrativeText,
    zoomLevel,
    analysisMetrics,
  } = useAnalysis();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <LandingPage onAuthSuccess={handleAuthSuccess} />;
  }

  const showStepIndicator = ['upload', 'analyzing', 'report'].includes(currentScreen) && 
    currentScreen !== 'comparative_upload' && 
    currentScreen !== 'comparative_report';
  
  const showMetricsPanel = ['analyzing', 'report'].includes(currentScreen) && analysisMetrics;

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'entry':
        return <EntryStep onSelectWorkflow={selectWorkflow} />;
      case 'narrative':
        return <NarrativeInputStep initialNarrative={narrativeText} onNarrativeSubmit={submitNarrative} onBack={goBack} />;
      case 'strategyProposal':
        return <StrategyProposalStep proposals={proposedStrategies} onSelect={selectStrategy} onBack={goBack} />;
      case 'upload':
        return <UploadStep />;
      case 'analyzing':
        return <AnalyzingStep />;
      case 'report':
        return <ReportStep />;
      case 'comparative_upload':
        return <ComparativeUploadStep />;
      case 'comparative_report':
        return <ComparativeReportStep />;
      default:
        return <EntryStep onSelectWorkflow={selectWorkflow} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#08040d] text-slate-100 font-sans relative overflow-x-hidden selection:bg-[#8a2232] selection:text-amber-100 flex flex-col">
      {/* Iluminación Ambiental Solemne Velvet & Gold */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-900/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Contenedor con Escala y Perspectiva Estilo Tribunal Supremo */}
      <div 
        className="flex flex-col flex-grow relative z-10 transition-transform duration-300 ease-out"
        style={{
          transform: currentScreen === 'report' ? 'none' : `scale(${zoomLevel})`,
          transformOrigin: 'top center',
          height: zoomLevel < 1 && currentScreen !== 'report' ? `${100 / zoomLevel}vh` : 'auto',
        }}
      >
        <Header />
        
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className={currentScreen === 'report' || currentScreen === 'entry' ? 'w-full max-w-7xl mx-auto' : 'max-w-6xl mx-auto space-y-6'}>
            {showMetricsPanel && (
              <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
                <PerformanceMetrics {...analysisMetrics!} />
              </div>
            )}
            
            {showStepIndicator && <StepIndicator />}
            
            {currentScreen === 'entry' ? (
              <Suspense fallback={<PageLoader />}>
                {renderCurrentScreen()}
                {isManualOpen && <UserManual onClose={() => toggleManual(false)} />}
                {isConfigModalOpen && (
                  <SettingsAndPrivacyModal
                    isOpen={isConfigModalOpen}
                    initialTab={configModalTab}
                    onClose={() => toggleConfigModal(false)}
                  />
                )}
              </Suspense>
            ) : (
              <div className="bg-[#12071d]/90 backdrop-blur-2xl border border-[#C5A059]/40 rounded-3xl shadow-2xl shadow-black/90 p-6 md:p-8 relative">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#FFE898] to-transparent" />
                
                <Suspense fallback={<PageLoader />}>
                  {renderCurrentScreen()}
                  {isManualOpen && <UserManual onClose={() => toggleManual(false)} />}
                  {isConfigModalOpen && (
                    <SettingsAndPrivacyModal
                      isOpen={isConfigModalOpen}
                      initialTab={configModalTab}
                      onClose={() => toggleConfigModal(false)}
                    />
                  )}
                </Suspense>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
        {currentScreen !== 'report' && <ZoomControls />}
      </div>
    </div>
  );
});

App.displayName = 'App';

export default App;
