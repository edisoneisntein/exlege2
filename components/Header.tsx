import React, { memo } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { resolveJurisdictionPack } from '../services/governance/jurisdictionPacks';
import { Scale, RotateCcw, Settings, HelpCircle, Shield, Award } from 'lucide-react';

const Header: React.FC = () => {
  const { toggleManual, toggleConfigModal, activeJurisdiction, fullReset, currentScreen } = useAnalysis();
  const currentPack = resolveJurisdictionPack(activeJurisdiction || 'CO');
  
  return (
    <header className="bg-[#0e0717]/90 backdrop-blur-2xl border-b border-[#C5A059]/40 sticky top-0 z-50 shadow-[0_6px_30px_rgba(0,0,0,0.9)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="relative bg-gradient-to-br from-[#d4af37] via-[#9e7d3b] to-[#594017] w-10 h-10 sm:w-11 sm:h-11 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.4)] border border-[#FFE898] flex items-center justify-center flex-shrink-0 text-slate-950">
                   <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-[#14081e]" strokeWidth={2.4} />
                   <div className="absolute inset-0 rounded-xl bg-amber-400/20 animate-pulse pointer-events-none" />
                </div>
                <div className="text-left">
                    <h1 className="text-base sm:text-lg font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFFDF0] via-[#E8CA7A] to-[#C5A059] tracking-wider leading-tight flex items-center gap-2">
                      EX LEGE
                      <span className="text-[9px] font-cinzel px-2 py-0.5 rounded-full bg-[#3b1c54] text-[#f5d76e] border border-[#d4af37]/60 font-bold tracking-widest shadow">SOVEREIGN</span>
                    </h1>
                    <p className="text-[10px] sm:text-[11px] text-[#DFBA73] font-cinzel tracking-wider uppercase">TRIBUNAL SUPREMO & LITIGACIÓN ESTRATÉGICA</p>
                </div>
                 {currentScreen !== 'analyzing' && currentScreen !== 'entry' && (
                  <button
                    onClick={fullReset}
                    className="ml-4 hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-cinzel font-bold text-[#f5d76e] bg-[#2a133d] border border-[#d4af37]/60 rounded-xl hover:bg-[#3d1c58] hover:border-[#FFE898] hover:text-white transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                    aria-label="Iniciar un nuevo análisis y reiniciar el flujo"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Nuevo Recurso
                  </button>
                )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Jurisdiction & Portals Configuration Button */}
                <button
                  onClick={() => toggleConfigModal(true, 'PORTALS')}
                  className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-cinzel font-bold text-amber-100 bg-[#1a0c26] border border-[#8a6827] hover:border-[#DFBA73] rounded-xl hover:bg-[#28133b] hover:text-[#FFE898] transition-all shadow-inner"
                  title="Configurar Portales Judiciales, Legislación de País y Notaría"
                >
                  <span className="text-base sm:text-lg">{currentPack.flag}</span>
                  <span className="hidden md:inline">{currentPack.name}</span>
                  <span className="text-amber-400/60 font-normal hidden lg:inline">• Fuero</span>
                  <Settings className="w-3.5 h-3.5 text-[#DFBA73] ml-0.5" />
                </button>

                <button
                  onClick={() => toggleManual(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-cinzel font-semibold text-amber-200/90 bg-[#1a0c26] border border-[#8a6827] hover:border-[#DFBA73] rounded-xl hover:bg-[#28133b] hover:text-white transition-all shadow-inner"
                >
                  <HelpCircle className="w-4 h-4 text-[#DFBA73] flex-shrink-0" />
                  <span className="hidden sm:inline">Estatuto</span>
                </button>
            </div>
        </div>
      </div>
    </header>
  );
};

export default memo(Header);
