import React, { useState, useMemo } from 'react';
import type { FullAnalysisResult, Annotation, PredictiveAnalysis } from '../../types';
import ReportDashboard from './ReportDashboard';
import NarrativeAnalysisCard from '../NarrativeAnalysisCard';
import AlternativeTheoriesCard from '../AlternativeTheoriesCard';
import PredictiveAnalysisCard from '../PredictiveAnalysisCard';
import GroundingSourcesCard from './GroundingSourcesCard';
import EvidentiaryInconsistencyCard from './EvidentiaryInconsistencyCard';
import CriticalPointCard from './CriticalPointCard';
import PreFlightAuditCard from './PreFlightAuditCard';
import LegalContradictionsCard from './LegalContradictionsCard';
import HelpButton from '../HelpButton';
import { 
  ShieldCheck, 
  Clock, 
  Filter, 
  FileSearch, 
  Layers, 
  AlertTriangle,
  Compass,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface ReportReviewTabProps {
    fullResult: FullAnalysisResult;
    annotations: Record<string, Annotation[]>;
    addAnnotation: (criticalPointId: string, text: string, author?: string) => void;
    onOpenTimeline: () => void;
    onOpenGovernance?: () => void;
}

const ReportReviewTab: React.FC<ReportReviewTabProps> = ({ fullResult, annotations, addAnnotation, onOpenTimeline, onOpenGovernance }) => {
    const [activeFilter, setActiveFilter] = useState<string>('Todos');
    
    const report = fullResult.report;

    const predictiveAnalysis = useMemo<PredictiveAnalysis | null>(() => {
        if (!report.criticalPoints || report.criticalPoints.length === 0) return null;
        
        let score = 50; // Base score
        const proceduralVices = report.criticalPoints.filter(p => p.type.toLowerCase().includes('procesal')).length;
        const evidenceVices = report.criticalPoints.filter(p => p.type.toLowerCase().includes('prueba')).length;
        const lawVices = report.criticalPoints.filter(p => p.type.toLowerCase().includes('ley')).length;
        
        score += proceduralVices * 10;
        score += evidenceVices * 5;
        score += lawVices * 7;
        score = Math.min(95, Math.max(20, score));

        const keyFrictionPoints = report.criticalPoints.slice(0, 3).map(p => ({
            criticalPointId: p.id,
            criticalPointType: p.type,
            reason: "Este hallazgo representa una clara violación de la norma y tiene un alto potencial de ser atendido en una instancia superior."
        }));

        const strategicRecommendation = proceduralVices > 1 
            ? "La estrategia recomendada es centrar el recurso en los vicios de procedimiento, ya que son los que tienen mayor probabilidad de generar una nulidad. Los demás hallazgos deben usarse como argumentos subsidiarios."
            : "La estrategia recomendada es construir un argumento sólido basado en la incorrecta valoración probatoria y la errónea aplicación de la ley. Es crucial demostrar cómo estos errores llevaron a una conclusión injusta.";

        return { estimatedSuccessProbability: score, keyFrictionPoints, strategicRecommendation };
    }, [report.criticalPoints]);

    const filterCategories: Array<[string, number]> = useMemo(() => {
        const mainCategories = new Map<string, number>();
        report.criticalPoints.forEach(cp => {
            const mainCategory = cp.type.split(':')[0].trim();
            mainCategories.set(mainCategory, (mainCategories.get(mainCategory) || 0) + 1);
        });
        const sortedCategories = Array.from(mainCategories.entries()).sort((a, b) => a[0].localeCompare(b[0]));
        return [['Todos', report.criticalPoints.length], ...sortedCategories];
    }, [report.criticalPoints]);

    const filteredCriticalPoints = useMemo(() => {
        if (activeFilter === 'Todos') return report.criticalPoints;
        return report.criticalPoints.filter(cp => cp.type.startsWith(activeFilter));
    }, [report.criticalPoints, activeFilter]);

    return (
        <div className="space-y-10 animate-fade-in text-slate-100">
            <ReportDashboard report={report} docType={fullResult.documentType} />

            {/* Strategic Command Banner */}
            <div className="text-center relative py-6 px-4">
                <div className="flex items-center justify-center gap-3">
                   <h2 className="text-2xl sm:text-3xl font-black font-cinzel tracking-tight text-white flex items-center gap-3">
                      <Compass className="w-7 h-7 text-[#f5d76e]" />
                      <span className="gold-text-gradient">Centro de Mando Estratégico</span>
                   </h2>
                   <HelpButton />
                </div>
                <p className="mt-2 text-sm sm:text-base text-amber-100/70 font-serif italic">Deconstrucción forense del expediente y formulación de vector de ataque.</p>
                 <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                    {onOpenGovernance && (
                        <button 
                            onClick={onOpenGovernance} 
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#8a2232] to-[#59143a] hover:from-[#a32a3c] hover:to-[#6d1a47] text-white border border-[#FFE898]/70 font-cinzel font-bold text-xs sm:text-sm rounded-2xl shadow-[0_0_25px_rgba(212,175,55,0.25)] transition-all transform hover:scale-[1.02]"
                        >
                            <ShieldCheck className="h-4 w-4 text-[#FFE898]" />
                            <span>Panel de Gobernanza Jurídica</span>
                        </button>
                    )}
                    <button 
                        onClick={onOpenTimeline} 
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#180926]/90 border border-[#C5A059]/40 hover:border-[#FFE898] text-[#f5d76e] hover:text-white font-cinzel font-bold text-xs sm:text-sm rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(212,175,55,0.1)] transition-all"
                    >
                        <Clock className="h-4 w-4 text-[#f5d76e]" />
                        <span>Visualizar Línea de Tiempo</span>
                    </button>
                </div>
            </div>

            {/* Case Overview Card */}
            <div className="relative bg-[#12071d]/90 backdrop-blur-2xl p-6 sm:p-7 rounded-3xl border border-[#C5A059]/50 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.1)] overflow-hidden">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#FFE898] to-transparent pointer-events-none" />
                <h3 className="text-sm font-cinzel font-bold text-[#f5d76e] uppercase tracking-widest mb-2 flex items-center gap-2">
                    <FileSearch className="w-4 h-4 text-[#C5A059]" />
                    Resumen Estratégico del Caso
                </h3>
                <p className="text-sm sm:text-base text-amber-100/90 leading-relaxed font-serif">{report.caseOverview}</p>
            </div>

            <PreFlightAuditCard 
                preFlightAudit={report.preFlightAudit} 
                intermediateProductsStatus={report.intermediateProductsStatus} 
            />

            {report.legalContradictions && report.legalContradictions.length > 0 && (
                <LegalContradictionsCard contradictions={report.legalContradictions} />
            )}

            {predictiveAnalysis && <PredictiveAnalysisCard analysis={predictiveAnalysis} />}
            {report.narrativeAnalysis && <NarrativeAnalysisCard analysis={report.narrativeAnalysis} />}
            {report.alternativeTheories && report.alternativeTheories.length > 0 && (
                <AlternativeTheoriesCard theories={report.alternativeTheories} />
            )}
            {report.groundingSources && report.groundingSources.length > 0 && (
                <GroundingSourcesCard sources={report.groundingSources} />
            )}
            
            {report.evidentiaryInconsistencies && report.evidentiaryInconsistencies.length > 0 && (
                <div className="space-y-6">
                     <div className="flex justify-center items-center gap-3 text-center">
                        <AlertTriangle className="w-6 h-6 text-[#f5d76e]" />
                        <h3 className="text-xl sm:text-2xl font-black font-cinzel gold-text-gradient">Inconsistencias Probatorias Detectadas</h3>
                    </div>
                    <div className="space-y-6">
                        {report.evidentiaryInconsistencies.map(inc => (
                            <EvidentiaryInconsistencyCard key={inc.id} inconsistency={inc} />
                        ))}
                    </div>
                </div>
            )}

             <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 text-center">
                    <Layers className="w-6 h-6 text-[#f5d76e]" />
                    <h3 className="text-xl sm:text-2xl font-black font-cinzel gold-text-gradient">Inventario Forense: Hallazgos y Vulnerabilidades</h3>
                </div>
                {report.criticalPoints.length > 0 ? (
                    <>
                        <div className="bg-[#12071d]/90 backdrop-blur-2xl p-5 rounded-3xl border border-[#C5A059]/40 shadow-xl">
                            <h4 className="font-cinzel font-bold text-[#f5d76e] mb-3 text-xs uppercase tracking-wider flex items-center gap-2">
                                <Filter className="w-3.5 h-3.5 text-[#C5A059]" />
                                Filtrar Hallazgos por Categoría
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {filterCategories.map(([category, count]) => (
                                    <button
                                        key={category}
                                        onClick={() => setActiveFilter(category)}
                                        className={`px-3.5 py-1.5 text-xs font-cinzel font-bold rounded-xl transition-all duration-200 flex items-center gap-2 border ${
                                            activeFilter === category
                                                ? 'bg-gradient-to-r from-[#8a2232] to-[#59143a] text-white border-[#FFE898] shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                                                : 'bg-[#180926] text-amber-200/70 border-[#3d1e56] hover:border-[#C5A059]/50 hover:text-white'
                                        }`}
                                    >
                                        <span>{category}</span>
                                        <span className={`text-[10px] font-mono font-bold rounded-md px-1.5 py-0.5 ${
                                            activeFilter === category ? 'bg-[#12071d] text-[#FFE898]' : 'bg-[#250e38] text-amber-200/60'
                                        }`}>
                                            {count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {filteredCriticalPoints.length > 0 ? (
                            <div className="space-y-6">
                                {filteredCriticalPoints.map(cp => (
                                    <CriticalPointCard 
                                      key={cp.id} 
                                      criticalPoint={cp}
                                      allEvidence={fullResult.allAttachments.filter(f => !f.isPrimary)}
                                      annotations={annotations[cp.id] || []}
                                      onAddAnnotation={(text) => addAnnotation(cp.id, text)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 px-6 bg-[#12071d]/60 border border-[#3d1e56] rounded-3xl">
                                <FileSearch className="mx-auto h-12 w-12 text-[#C5A059]/40 mb-3" />
                                <h3 className="text-sm font-cinzel font-bold text-amber-200/80">Sin Resultados para el Filtro</h3>
                                <p className="mt-1 text-xs text-amber-200/50 font-serif">No hay hallazgos que coincidan con la categoría "{activeFilter}".</p>
                            </div>
                        )}
                    </>
                 ) : (
                    <div className="text-center py-12 px-6 bg-[#12071d]/60 border border-[#3d1e56] rounded-3xl">
                        <CheckCircle className="mx-auto h-12 w-12 text-[#f5d76e] mb-3" />
                        <h3 className="text-sm font-cinzel font-bold text-amber-200/80">Análisis Técnico Sin Novedades</h3>
                        <p className="mt-1 text-xs text-amber-200/50 font-serif">No se identificaron puntos críticos formales en este documento.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default ReportReviewTab;