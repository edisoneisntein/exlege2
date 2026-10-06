import React, { useState, useMemo, memo, useCallback } from 'react';
import type { AnalysisReport } from '../../types';
import { runLegalQAAudit, type LegalQAAuditResult } from '../../services/governance/legalQaEngine';
import { ShieldCheck, Scale, AlertTriangle, CheckCircle2, Award, BookOpen } from 'lucide-react';

// =============================================================================
// TYPES & PROPS
// =============================================================================
export interface LegalQAAuditCardProps {
    readonly report: AnalysisReport;
}

export type LegalQATab = 'DIMENSIONS' | 'PROHIBITIONS' | 'RECOMMENDATIONS';

type AuditedDimension = LegalQAAuditResult['auditedDimensions'][number];
type ProhibitionAudit = LegalQAAuditResult['prohibitionsAudit'][number];

// =============================================================================
// SUB-COMPONENT: EmptyState
// =============================================================================
interface EmptyStateProps {
    readonly message: string;
}

const EmptyState = memo<EmptyStateProps>(({ message }) => (
    <div className="w-full py-8 px-4 flex flex-col items-center justify-center text-amber-200/60 bg-[#0d0515]/70 rounded-2xl border border-[#8a6827]/40">
        <Scale className="h-8 w-8 mb-2 text-[#DFBA73] opacity-60" />
        <p className="text-xs font-cinzel font-medium">{message}</p>
    </div>
));
EmptyState.displayName = 'EmptyState';

// =============================================================================
// SUB-COMPONENT: DimensionsTab
// =============================================================================
interface DimensionsTabProps {
    readonly dimensions: readonly AuditedDimension[];
}

const DimensionsTab = memo<DimensionsTabProps>(({ dimensions }) => {
    if (!dimensions?.length) return <EmptyState message="No hay dimensiones auditadas disponibles." />;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {dimensions.map(dim => (
                <div key={dim.dimension} className="bg-[#0d0515]/90 border border-[#8a6827]/50 rounded-2xl p-4 space-y-2.5 flex flex-col justify-between shadow-inner">
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-cinzel font-black text-slate-100 tracking-wider">
                                {dim.dimension}
                            </span>
                            <span className={`text-[10px] font-cinzel font-bold px-2 py-0.5 rounded-lg ${dim.status === 'APROBADO' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'}`}>
                                {dim.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-[#1a0c26] rounded-full h-2 overflow-hidden border border-[#8a6827]/40">
                                <div
                                    className="h-full bg-gradient-to-r from-[#DFBA73] to-[#FFE898] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                                    style={{ width: `${dim.score || 0}%` }}
                                ></div>
                            </div>
                            <span className="text-[11px] font-cinzel text-[#f5d76e] font-bold">
                                {dim.score || 0}%
                            </span>
                        </div>
                        <p className="text-xs text-slate-300 font-garamond italic text-sm leading-snug">
                            {dim.findings?.[0] || 'Sin hallazgos específicos.'}
                        </p>
                    </div>

                    <div className="pt-2 border-t border-[#8a6827]/30">
                        <span className="text-[9px] font-cinzel text-amber-200/60 uppercase tracking-widest block mb-1 font-bold">
                            Chequeos ejecutados:
                        </span>
                        <div className="space-y-0.5">
                            {dim.checksPerformed?.map((c: string, i: number) => (
                                <div key={i} className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                    <span className="truncate">{c}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
});
DimensionsTab.displayName = 'DimensionsTab';

// =============================================================================
// SUB-COMPONENT: ProhibitionsTab
// =============================================================================
interface ProhibitionsTabProps {
    readonly prohibitions: readonly ProhibitionAudit[];
}

const ProhibitionsTab = memo<ProhibitionsTabProps>(({ prohibitions }) => {
    if (!prohibitions?.length) return <EmptyState message="No se registraron prohibiciones en la auditoría." />;

    return (
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
            {prohibitions.map(prohib => (
                <div key={prohib.prohibitionNumber} className="bg-[#0d0515]/90 border border-[#8a6827]/50 rounded-2xl p-4 flex items-start justify-between gap-4 shadow-inner">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-cinzel font-bold text-[#f5d76e] bg-[#2a133d] px-2 py-0.5 rounded border border-[#C5A059]/50">
                                REGLA #{prohib.prohibitionNumber}
                            </span>
                            <span className="text-xs font-cinzel font-bold text-slate-100">
                                {prohib.description}
                            </span>
                        </div>
                        <p className="text-xs text-slate-300 font-garamond italic text-sm">
                            {prohib.auditNote}
                        </p>
                    </div>

                    <span className="px-2.5 py-1 text-[10px] font-cinzel font-bold bg-emerald-950/80 text-emerald-300 rounded-lg border border-emerald-500/40 flex-shrink-0 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        CUMPLIDO
                    </span>
                </div>
            ))}
        </div>
    );
});
ProhibitionsTab.displayName = 'ProhibitionsTab';

// =============================================================================
// SUB-COMPONENT: RecommendationsTab
// =============================================================================
interface RecommendationsTabProps {
    readonly recommendations: readonly string[];
}

const RecommendationsTab = memo<RecommendationsTabProps>(({ recommendations }) => {
    if (!recommendations?.length) return <EmptyState message="No hay directivas generadas para esta auditoría." />;

    return (
        <div className="bg-[#0d0515]/90 border border-[#8a6827]/50 rounded-2xl p-5 space-y-3 shadow-inner">
            <h4 className="text-xs font-cinzel font-bold text-[#f5d76e] uppercase tracking-wider">
                Directivas de Litigación para la Redacción Procesal:
            </h4>
            <div className="space-y-2">
                {recommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 bg-[#12071d] border border-[#8a6827]/40 rounded-xl text-xs text-slate-200 flex items-start gap-2.5 font-garamond text-sm italic shadow-sm">
                        <span className="text-[#f5d76e] font-cinzel font-bold not-italic">#{idx + 1}</span>
                        <span>{rec}</span>
                    </div>
                ))}
            </div>
        </div>
    );
});
RecommendationsTab.displayName = 'RecommendationsTab';

// =============================================================================
// ROOT COMPONENT: LegalQAAuditCard
// =============================================================================
export const LegalQAAuditCard: React.FC<LegalQAAuditCardProps> = memo(({ report }) => {
    const [activeTab, setActiveTab] = useState<LegalQATab>('DIMENSIONS');

    // Optimización Core: Evitar re-ejecutar el motor de QA en cada render o cambio de pestaña
    const qaResult = useMemo<LegalQAAuditResult | null>(() => {
        if (!report) return null;
        return runLegalQAAudit(report);
    }, [report]);

    // Handler memoizado
    const handleTabChange = useCallback((tab: LegalQATab) => {
        setActiveTab(tab);
    }, []);

    if (!qaResult) {
        return <EmptyState message="Esperando datos del reporte de análisis..." />;
    }

    const { 
        auditedDimensions = [], 
        prohibitionsAudit = [], 
        recommendations = [], 
        qualityScore = 0, 
        overallPassed = false 
    } = qaResult;

    return (
        <div id="legal-qa-audit-card" className="court-gold-frame p-6 sm:p-8 space-y-6 text-slate-100">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#C5A059]/30 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#2a133d] border border-[#C5A059]/50 flex items-center justify-center text-xl shadow-md text-[#f5d76e]">
                        <ShieldCheck className="w-6 h-6 text-[#f5d76e]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-cinzel font-bold text-[#f5d76e] bg-[#2a133d] px-2 py-0.5 rounded border border-[#C5A059]/40">
                                MOTOR 11 • AUDITORÍA DE CALIDAD
                            </span>
                            <span className="text-[10px] font-cinzel font-bold text-amber-200/60 uppercase">
                                Legal QA & Anti-Hallucination
                            </span>
                        </div>
                        <h3 className="text-xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFFDF0] via-[#E8CA7A] to-[#C5A059] tracking-wide mt-0.5">
                            Auditoría de Calidad Jurídica & 20 Prohibiciones Absolutas
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-[#0d0515] px-4 py-2.5 rounded-2xl border border-[#8a6827]/50 shadow-inner">
                    <div className="text-right">
                        <span className="text-[10px] font-cinzel text-[#f5d76e] uppercase tracking-widest block font-bold">
                            Puntaje QA
                        </span>
                        <span className="text-2xl font-cinzel font-black text-[#FFE898]">
                            {qualityScore} / 100
                        </span>
                    </div>
                    <div className={`w-4 h-4 rounded-full ${overallPassed ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse' : 'bg-amber-400'}`}></div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-2 border-b border-[#C5A059]/30 pb-2 text-xs font-cinzel font-bold overflow-x-auto scrollbar-none">
                <button
                    type="button"
                    onClick={() => handleTabChange('DIMENSIONS')}
                    aria-pressed={activeTab === 'DIMENSIONS'}
                    className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap text-xs ${activeTab === 'DIMENSIONS' ? 'bg-[#2a133d] text-[#f5d76e] border border-[#C5A059]/60 shadow-md' : 'text-amber-200/70 hover:text-white bg-[#0d0515]/60 border border-transparent'}`}
                >
                    8 Dimensiones de Calidad ({auditedDimensions.length})
                </button>
                <button
                    type="button"
                    onClick={() => handleTabChange('PROHIBITIONS')}
                    aria-pressed={activeTab === 'PROHIBITIONS'}
                    className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap text-xs ${activeTab === 'PROHIBITIONS' ? 'bg-[#2a133d] text-[#f5d76e] border border-[#C5A059]/60 shadow-md' : 'text-amber-200/70 hover:text-white bg-[#0d0515]/60 border border-transparent'}`}
                >
                    20 Prohibiciones Absolutas (Sección 22)
                </button>
                <button
                    type="button"
                    onClick={() => handleTabChange('RECOMMENDATIONS')}
                    aria-pressed={activeTab === 'RECOMMENDATIONS'}
                    className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap text-xs ${activeTab === 'RECOMMENDATIONS' ? 'bg-[#2a133d] text-[#f5d76e] border border-[#C5A059]/60 shadow-md' : 'text-amber-200/70 hover:text-white bg-[#0d0515]/60 border border-transparent'}`}
                >
                    Recomendaciones de Redacción ({recommendations.length})
                </button>
            </div>

            {/* Tab Contents Orchestration */}
            <div className="pt-2">
                {activeTab === 'DIMENSIONS' && <DimensionsTab dimensions={auditedDimensions} />}
                {activeTab === 'PROHIBITIONS' && <ProhibitionsTab prohibitions={prohibitionsAudit} />}
                {activeTab === 'RECOMMENDATIONS' && <RecommendationsTab recommendations={recommendations} />}
            </div>
        </div>
    );
});
LegalQAAuditCard.displayName = 'LegalQAAuditCard';
export default LegalQAAuditCard;