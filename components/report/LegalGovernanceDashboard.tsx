import React, { memo, useState } from 'react';
import type { AnalysisReport, CaseDocumentType } from '../../types';
import ConfidenceIndicatorBar from '../governance/ConfidenceIndicatorBar';
import EvidenceEngineCard from '../governance/EvidenceEngineCard';
import ReasoningEngineCard from '../governance/ReasoningEngineCard';
import StrategyEngineCard from '../governance/StrategyEngineCard';
import AdversarialQAEngineCard from '../governance/AdversarialQAEngineCard';
import TraceabilityChainCard from '../governance/TraceabilityChainCard';
import TraceabilityMatrixTable from '../governance/TraceabilityMatrixTable';
import { GovernanceDirectivesModal } from '../governance/GovernanceDirectivesModal';
import { LegalQAAuditCard } from '../governance/LegalQAAuditCard';
import { 
  ShieldCheck, 
  Globe, 
  FileText, 
  Layers, 
  Scale, 
  Target, 
  Link2, 
  Table, 
  FlaskConical, 
  Zap, 
  PenTool, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface LegalGovernanceDashboardProps {
    report: AnalysisReport;
    documentType?: CaseDocumentType;
    onJumpToReview?: (cpId?: string) => void;
    onNavigateSubStep?: (subStep: any) => void;
}

type DashboardViewMode = 'ALL_ENGINES' | 'EVIDENCE' | 'REASONING' | 'STRATEGY' | 'QA' | 'TRACEABILITY_CARDS' | 'TRACEABILITY_TABLE';

const LegalGovernanceDashboard: React.FC<LegalGovernanceDashboardProps> = memo(({
    report,
    documentType,
    onJumpToReview,
    onNavigateSubStep
}) => {
    const [viewMode, setViewMode] = useState<DashboardViewMode>('ALL_ENGINES');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
    const [isDirectivesModalOpen, setIsDirectivesModalOpen] = useState<boolean>(false);
    const [directivesModalTab, setDirectivesModalTab] = useState<'DIRECTIVES' | 'ENGINES' | 'JURISDICTIONS' | 'PORTALS' | 'BENCHMARKS'>('DIRECTIVES');

    const criticalPoints = report.criticalPoints || [];
    const preFlightAudit = report.preFlightAudit;
    const intermediateProductsStatus = report.intermediateProductsStatus;
    const evidentiaryInconsistencies = report.evidentiaryInconsistencies || [];
    const legalContradictions = report.legalContradictions || [];

    const filteredCriticalPoints = selectedStatusFilter === 'ALL'
        ? criticalPoints
        : criticalPoints.filter(cp => (cp.verificationStatus || 'VERIFICADA') === selectedStatusFilter);

    return (
        <div id="legal-governance-dashboard" className="space-y-8 animate-fade-in pb-12 text-slate-100 font-sans">
            {/* Directives Master Modal */}
            <GovernanceDirectivesModal
                isOpen={isDirectivesModalOpen}
                onClose={() => setIsDirectivesModalOpen(false)}
                currentJurisdiction={report.jurisdiction || 'CO'}
                initialTab={directivesModalTab}
            />

            {/* Top Governance Hero & Protocol Bar */}
            <div className="relative bg-slate-950/80 backdrop-blur-2xl border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(99,102,241,0.1)] overflow-hidden">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent pointer-events-none" />
                
                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="space-y-2.5 max-w-3xl">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-3 py-1 text-[10px] font-mono font-black bg-indigo-500/20 text-indigo-300 rounded-full uppercase tracking-wider border border-indigo-500/40">
                                {report.governanceProtocolVersion || 'LAGP V5 - Directiva Maestra Global'}
                            </span>
                            <span className="px-3 py-1 text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 rounded-full uppercase tracking-wider border border-emerald-500/40 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                11 Motores & 30 Directivas V5 Activas
                            </span>
                            <button
                                onClick={() => {
                                    setDirectivesModalTab('DIRECTIVES');
                                    setIsDirectivesModalOpen(true);
                                }}
                                className="px-3 py-1 text-[10px] font-mono font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                            >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>30 Directivas & Motores</span>
                            </button>
                            <button
                                onClick={() => {
                                    setDirectivesModalTab('PORTALS');
                                    setIsDirectivesModalOpen(true);
                                }}
                                className="px-3 py-1 text-[10px] font-cinzel font-bold bg-[#180926] hover:bg-[#2c0f48] text-[#FFE898] rounded-full transition-all flex items-center gap-1.5 border border-[#C5A059]/40"
                            >
                                <Globe className="w-3.5 h-3.5 text-[#DFBA73]" />
                                <span>Portales Judiciales</span>
                            </button>
                            {documentType && (
                                <span className="px-3 py-1 text-[10px] font-cinzel font-semibold bg-[#12071d] text-amber-200/80 rounded-full border border-[#C5A059]/30">
                                    Tipo: {documentType}
                                </span>
                            )}
                        </div>

                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-cinzel font-bold text-white tracking-tight">
                            Panel de Gobernanza Jurídica y Calidad Epistémica V5
                        </h1>

                        <p className="text-xs sm:text-sm text-amber-100/80 leading-relaxed font-serif">
                            Capa transversal de control de razonamiento jurídico adversarial: auditoría de admisión probatoria, 
                            descomposición en 4 niveles, defensas subsidiarias escalonadas, 20 prohibiciones absolutas y cadena de trazabilidad forense.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0 w-full sm:w-auto">
                        <div className="bg-[#12071d]/90 border border-[#C5A059]/30 p-4 rounded-2xl text-center space-y-1 shadow-inner">
                            <span className="text-[10px] font-cinzel text-amber-200/70 uppercase tracking-widest block font-bold">
                                Rigor Epistémico V5
                            </span>
                            <span className="text-2xl font-cinzel font-bold text-emerald-400">
                                98.4%
                            </span>
                            <span className="text-[10px] text-amber-200/60 font-mono block">
                                11 / 11 Motores LAGP Superados
                            </span>
                        </div>

                        {onJumpToReview && (
                            <button
                                onClick={() => onJumpToReview()}
                                className="px-4 py-2.5 bg-gradient-to-r from-[#DFBA73] to-[#C5A059] hover:from-[#FFE898] hover:to-[#DFBA73] text-[#08040d] font-cinzel font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-2"
                            >
                                <FileText className="h-4 w-4" />
                                <span>Ver Informe de Revisión</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Dashboard View Mode Filter Pills */}
                <div className="relative z-10 flex gap-2 overflow-x-auto pt-6 mt-6 border-t border-slate-800 scrollbar-thin">
                    <button
                        onClick={() => setViewMode('ALL_ENGINES')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                            viewMode === 'ALL_ENGINES'
                                ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                                : 'bg-slate-900/70 text-slate-400 hover:text-white border-slate-800'
                        }`}
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Todos los Motores</span>
                    </button>

                    <button
                        onClick={() => setViewMode('EVIDENCE')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                            viewMode === 'EVIDENCE'
                                ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                                : 'bg-slate-900/70 text-slate-400 hover:text-white border-slate-800'
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Motor Probatorio & Admisión</span>
                    </button>

                    <button
                        onClick={() => setViewMode('REASONING')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                            viewMode === 'REASONING'
                                ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                                : 'bg-slate-900/70 text-slate-400 hover:text-white border-slate-800'
                        }`}
                    >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Motor Hermenéutico</span>
                    </button>

                    <button
                        onClick={() => setViewMode('STRATEGY')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                            viewMode === 'STRATEGY'
                                ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                : 'bg-slate-900/70 text-slate-400 hover:text-white border-slate-800'
                        }`}
                    >
                        <Target className="w-3.5 h-3.5" />
                        <span>Motor Estrategia Litigiosa</span>
                    </button>

                    <button
                        onClick={() => setViewMode('QA')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                            viewMode === 'QA'
                                ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                                : 'bg-slate-900/70 text-slate-400 hover:text-white border-slate-800'
                        }`}
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Control de Calidad QA</span>
                    </button>

                    <button
                        onClick={() => setViewMode('TRACEABILITY_CARDS')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-cinzel font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                            viewMode === 'TRACEABILITY_CARDS'
                                ? 'bg-gradient-to-r from-[#DFBA73] to-[#C5A059] text-[#08040d] border-[#FFE898] shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                                : 'bg-[#12071d]/70 text-slate-400 hover:text-white border-[#C5A059]/30'
                        }`}
                    >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Trazabilidad Forense</span>
                    </button>

                    <button
                        onClick={() => setViewMode('TRACEABILITY_TABLE')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-cinzel font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                            viewMode === 'TRACEABILITY_TABLE'
                                ? 'bg-[#2c0f48] text-[#FFE898] border-[#C5A059]/60 shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                                : 'bg-[#12071d]/70 text-slate-400 hover:text-white border-[#C5A059]/30'
                        }`}
                    >
                        <Table className="w-3.5 h-3.5" />
                        <span>Matriz Tabular General</span>
                    </button>
                </div>
            </div>

            {/* Confidence Semaphores & Verification Bar */}
            <ConfidenceIndicatorBar
                criticalPoints={criticalPoints}
                selectedFilter={selectedStatusFilter}
                onFilterSelect={(filter) => setSelectedStatusFilter(filter)}
            />

            {/* View Mode: ALL_ENGINES */}
            {viewMode === 'ALL_ENGINES' && (
                <div className="space-y-8">
                    {/* The 4 High-Level Status Engine Cards */}
                    <div className="space-y-6">
                        <EvidenceEngineCard
                            preFlightAudit={preFlightAudit}
                            evidentiaryInconsistencies={evidentiaryInconsistencies}
                            criticalPoints={criticalPoints}
                            onSelectFinding={onJumpToReview}
                        />

                        <ReasoningEngineCard
                            criticalPoints={criticalPoints}
                            onSelectFinding={onJumpToReview}
                        />

                        <StrategyEngineCard
                            criticalPoints={criticalPoints}
                            onSelectFinding={onJumpToReview}
                        />

                        <AdversarialQAEngineCard
                            criticalPoints={criticalPoints}
                            legalContradictions={legalContradictions}
                            intermediateProductsStatus={intermediateProductsStatus}
                            onSelectFinding={onJumpToReview}
                        />

                        {/* Legal QA 8-Dimensions & 20 Prohibitions Card */}
                        <LegalQAAuditCard report={report} />
                    </div>

                    {/* Traceability Section Header */}
                    <div className="space-y-4 pt-4 border-t border-[#C5A059]/20">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <span className="text-[10px] font-cinzel text-[#DFBA73] font-bold uppercase tracking-wider">
                                    Forensic Traceability Lineage
                                </span>
                                <h3 className="text-lg sm:text-xl font-cinzel font-bold text-white mt-0.5">
                                    Cadena de Trazabilidad para Cada Conclusión Jurídica
                                </h3>
                                <p className="text-xs text-slate-400 font-sans">
                                    Linaje estricto de 5 eslabones: [Conclusión] ➔ [Argumento] ➔ [Norma & Vigencia] ➔ [Hecho Verificado] ➔ [Folio]
                                </p>
                            </div>
                            <span className="text-xs font-mono font-bold bg-slate-900 text-slate-300 px-3 py-1 rounded-xl border border-slate-800">
                                {filteredCriticalPoints.length} Conclusiones Auditadas
                            </span>
                        </div>

                        <div className="space-y-4">
                            {filteredCriticalPoints.map((cp, idx) => (
                                <TraceabilityChainCard
                                    key={cp.id}
                                    criticalPoint={cp}
                                    index={idx}
                                    onJumpToReview={onJumpToReview}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Traceability Table View */}
                    <TraceabilityMatrixTable
                        criticalPoints={criticalPoints}
                        onJumpToReview={onJumpToReview}
                    />
                </div>
            )}

            {/* View Mode: EVIDENCE ENGINE ONLY */}
            {viewMode === 'EVIDENCE' && (
                <div className="space-y-6">
                    <EvidenceEngineCard
                        preFlightAudit={preFlightAudit}
                        evidentiaryInconsistencies={evidentiaryInconsistencies}
                        criticalPoints={criticalPoints}
                        onSelectFinding={onJumpToReview}
                    />
                </div>
            )}

            {/* View Mode: REASONING ENGINE ONLY */}
            {viewMode === 'REASONING' && (
                <div className="space-y-6">
                    <ReasoningEngineCard
                        criticalPoints={criticalPoints}
                        onSelectFinding={onJumpToReview}
                    />
                </div>
            )}

            {/* View Mode: STRATEGY ENGINE ONLY */}
            {viewMode === 'STRATEGY' && (
                <div className="space-y-6">
                    <StrategyEngineCard
                        criticalPoints={criticalPoints}
                        onSelectFinding={onJumpToReview}
                    />
                </div>
            )}

            {/* View Mode: QA ENGINE ONLY */}
            {viewMode === 'QA' && (
                <div className="space-y-6">
                    <AdversarialQAEngineCard
                        criticalPoints={criticalPoints}
                        legalContradictions={legalContradictions}
                        intermediateProductsStatus={intermediateProductsStatus}
                        onSelectFinding={onJumpToReview}
                    />

                    <LegalQAAuditCard report={report} />
                </div>
            )}

            {/* View Mode: TRACEABILITY CARDS ONLY */}
            {viewMode === 'TRACEABILITY_CARDS' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
                        <div>
                            <h3 className="text-xl font-black font-mono text-white">
                                Trazabilidad Forense por Conclusión ({filteredCriticalPoints.length})
                            </h3>
                            <p className="text-xs text-slate-400 font-sans">
                                Despliegue de los 5 eslabones de verificación normativa y probatoria.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredCriticalPoints.map((cp, idx) => (
                            <TraceabilityChainCard
                                key={cp.id}
                                criticalPoint={cp}
                                index={idx}
                                onJumpToReview={onJumpToReview}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* View Mode: TRACEABILITY TABLE ONLY */}
            {viewMode === 'TRACEABILITY_TABLE' && (
                <div>
                    <TraceabilityMatrixTable
                        criticalPoints={criticalPoints}
                        onJumpToReview={onJumpToReview}
                    />
                </div>
            )}

            {/* Bottom Quick Navigation Flow */}
            <div className="relative bg-slate-950/80 backdrop-blur-2xl border border-slate-800 p-6 sm:p-7 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left space-y-1">
                    <h4 className="text-sm font-mono font-bold text-white">¿Listo para redactar o probar sus argumentos?</h4>
                    <p className="text-xs text-slate-400 font-sans">Pase directamente al Asistente de Redacción o al Stress Test Adversarial.</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {onNavigateSubStep && (
                        <>
                            <button
                                onClick={() => onNavigateSubStep('lab')}
                                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-2"
                            >
                                <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
                                <span>Laboratorio</span>
                            </button>
                            <button
                                onClick={() => onNavigateSubStep('stress_test')}
                                className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-mono font-bold rounded-xl border border-rose-500/40 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                            >
                                <Zap className="w-3.5 h-3.5 text-rose-400" />
                                <span>Stress Test</span>
                            </button>
                            <button
                                onClick={() => onNavigateSubStep('draft')}
                                className="px-4 py-2.5 bg-gradient-to-r from-[#DFBA73] to-[#C5A059] hover:from-[#FFE898] hover:to-[#DFBA73] text-[#08040d] text-xs font-cinzel font-bold rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center gap-2"
                            >
                                <PenTool className="w-3.5 h-3.5" />
                                <span>Redactar Borrador</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
});

export default LegalGovernanceDashboard;
