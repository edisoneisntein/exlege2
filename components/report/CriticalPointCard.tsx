import React, { useState, memo } from 'react';
import type { CriticalPoint, Attachment, Annotation, SeverityLevel, ConfidenceLevel, VerificationStatus, DecisionLevel, AnalogyGrade } from '../../types';
import InfoTooltip from '../InfoTooltip';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  Scale, 
  Cpu, 
  FileText, 
  CheckCircle2, 
  Zap, 
  Sparkles, 
  Terminal, 
  MessageSquare, 
  Send
} from 'lucide-react';

const Section: React.FC<{title: string; children: React.ReactNode, icon?: React.ReactNode, titleColor?: string, tooltip?: string}> = memo(({ title, children, icon, titleColor = 'text-[#DFBA73]', tooltip }) => (
    <div className="border-t border-[#C5A059]/20 pt-4 mt-4 first:mt-0 first:pt-0 first:border-none">
        <h4 className={`font-cinzel font-bold text-xs sm:text-sm flex items-center gap-2 mb-2 ${titleColor}`}>
            {icon}
            <span>{title}</span>
            {tooltip && <InfoTooltip text={tooltip} />}
        </h4>
        <div className="text-xs sm:text-sm text-slate-300 space-y-2 leading-relaxed font-serif">{children}</div>
    </div>
));

Section.displayName = 'Section';

const getVerificationStatusBadge = (status?: VerificationStatus) => {
    switch (status) {
        case 'VERIFICADA':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-cinzel font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 rounded-full" title="Evidencia suficiente e incontrovertible en el expediente">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    VERIFICADA
                </span>
            );
        case 'PARCIALMENTE_VERIFICADA':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-cinzel font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40 rounded-full" title="Evidencia parcial - requiere pieza probatoria complementaria">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    PARCIALMENTE VERIFICADA
                </span>
            );
        case 'NO_VERIFICADA':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-cinzel font-bold bg-rose-500/15 text-rose-300 border border-rose-500/40 rounded-full" title="Información insuficiente - Bloqueada de afirmaciones categóricas">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    NO VERIFICADA (BLOQUEADA)
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-cinzel font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    VERIFICADA
                </span>
            );
    }
};

const getDecisionLevelBadge = (level?: DecisionLevel) => {
    if (!level) return null;
    const styles: Record<DecisionLevel, string> = {
        'Confirmado': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        'Probable': 'bg-[#DFBA73]/15 text-[#FFE898] border-[#DFBA73]/40',
        'Controvertido': 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        'Insuficientemente_probado': 'bg-orange-500/10 text-orange-300 border-orange-500/30',
        'Contradictorio': 'bg-rose-500/10 text-rose-300 border-rose-500/30',
        'No_evaluable': 'bg-slate-800 text-slate-400 border-slate-700'
    };
    return (
        <span className={`px-2 py-0.5 text-[10px] font-cinzel font-bold rounded-full border ${styles[level] || 'bg-slate-800 text-slate-300'}`}>
            Nivel: {level.replace('_', ' ')}
        </span>
    );
};

const getAnalogyGradeBadge = (grade?: AnalogyGrade | string) => {
    switch (grade) {
        case 'Alto':
            return <span className="px-2 py-0.5 text-[10px] font-cinzel font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded">Analogía: Alto Grado</span>;
        case 'Medio':
            return <span className="px-2 py-0.5 text-[10px] font-cinzel font-bold bg-[#DFBA73]/20 text-[#FFE898] border border-[#DFBA73]/40 rounded">Analogía: Grado Medio</span>;
        case 'Bajo':
            return <span className="px-2 py-0.5 text-[10px] font-cinzel font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded">Analogía: Grado Bajo</span>;
        default:
            return grade ? <span className="px-2 py-0.5 text-[10px] font-cinzel font-bold bg-slate-800 text-slate-300 border border-slate-700 rounded">Analogía: {grade}</span> : null;
    }
};

const getSeverityBadge = (severity?: SeverityLevel | string) => {
    switch (severity) {
        case 'CRÍTICA':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-cinzel font-bold bg-[#8a2232]/40 text-[#FFE898] border border-[#C5A059]/60 rounded-full shadow-[0_0_12px_rgba(212,175,55,0.2)]">
                    <Flame className="w-3.5 h-3.5 text-[#FFE898]" />
                    VULNERABILIDAD CRÍTICA
                </span>
            );
        case 'ALTA':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-cinzel font-bold bg-orange-500/15 text-orange-300 border border-orange-500/40 rounded-full">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                    RIESGO ALTO
                </span>
            );
        case 'MEDIA':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-cinzel font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40 rounded-full">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    RIESGO MEDIO
                </span>
            );
        case 'BAJA':
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-cinzel font-bold bg-[#DFBA73]/15 text-[#FFE898] border border-[#DFBA73]/40 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#DFBA73]" />
                    OBSERVACIÓN TÉCNICA
                </span>
            );
        default:
            return null;
    }
};

const getConfidenceBadge = (confidence?: ConfidenceLevel) => {
    switch (confidence) {
        case 'A':
            return <span title="[A] Hecho probado y cotejado directamente con documento primario" className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded">Nivel A: Hecho Probado</span>;
        case 'B':
            return <span title="[B] Evidencia suficiente + inferencia razonable" className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#DFBA73]/15 text-[#FFE898] border border-[#DFBA73]/40 rounded">Nivel B: Evidencia + Inferencia</span>;
        case 'C':
            return <span title="[C] Inferencia plausible - requiere prueba complementaria" className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded">Nivel C: Hipótesis Plausible</span>;
        case 'D':
            return <span title="[D] Información insuficiente o contradictoria" className="px-2 py-0.5 text-[10px] font-mono font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30 rounded">Nivel D: Insuficiente</span>;
        default:
            return null;
    }
};

export interface CriticalPointCardProps {
    criticalPoint: CriticalPoint;
    evidenceFiles?: Attachment[];
    allEvidence?: Attachment[];
    annotations?: Annotation[];
    onAddAnnotation: (text: string) => void;
}

const CriticalPointCard: React.FC<CriticalPointCardProps> = memo(({ 
    criticalPoint, 
    evidenceFiles,
    allEvidence, 
    annotations = [], 
    onAddAnnotation 
}) => {
    const [newAnnotation, setNewAnnotation] = useState('');
    const resolvedEvidence = evidenceFiles || allEvidence || [];

    const handleAnnotationSubmit = () => {
        if (newAnnotation.trim()) {
            onAddAnnotation(newAnnotation.trim());
            setNewAnnotation('');
        }
    };
    
    return (
        <div id={`cp-card-${criticalPoint.id}`} className="relative bg-[#0e0717]/90 backdrop-blur-2xl border border-[#C5A059]/40 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.08)] p-6 md:p-8 space-y-4 overflow-hidden transition-all duration-300">
            {/* Top Glowing Beam */}
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#FFE898]/60 to-transparent pointer-events-none" />

            {/* Header: Title, Safety Gate, Severity, Decision Level, Category, Confidence */}
            <div className="flex items-start justify-between flex-wrap gap-3 pb-3 border-b border-[#C5A059]/20">
                <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center flex-wrap gap-2">
                        {getVerificationStatusBadge(criticalPoint.verificationStatus)}
                        {getSeverityBadge(criticalPoint.severity)}
                        {getDecisionLevelBadge(criticalPoint.decisionLevel)}
                        {getConfidenceBadge(criticalPoint.confidenceLevel)}
                        {criticalPoint.category && (
                            <span className="px-2.5 py-0.5 text-[10px] font-cinzel font-semibold bg-[#180926] text-[#FFE898] rounded-full border border-[#C5A059]/40">
                                {criticalPoint.category}
                            </span>
                        )}
                        <span className="inline-block px-3 py-0.5 text-[10px] font-cinzel font-bold rounded-full bg-[#DFBA73]/15 text-[#FFE898] border border-[#DFBA73]/40">
                            {criticalPoint.type}
                        </span>
                    </div>
                    {criticalPoint.title && (
                        <h4 className="text-base sm:text-lg font-cinzel font-bold text-white leading-snug pt-1">
                            {criticalPoint.title}
                        </h4>
                    )}
                </div>

                {criticalPoint.estimatedEffort && (
                    <span className="text-[11px] font-cinzel bg-[#12071d] text-[#FFE898] font-bold px-3 py-1 rounded-xl border border-[#C5A059]/40 flex items-center gap-1.5 shadow-inner">
                        <Zap className="w-3.5 h-3.5 text-[#DFBA73]" />
                        <span>{criticalPoint.estimatedEffort}</span>
                    </span>
                )}
            </div>
            
            {/* Excerpt */}
            <Section title="Extracto del Documento (Evidencia Forense)" icon={<FileText className="w-4 h-4 text-[#DFBA73]" />} tooltip="Cita literal o extracto directo del fallo/expediente auditado.">
                <blockquote className="border-l-2 border-[#DFBA73] bg-[#12071d]/90 py-3 px-4 rounded-r-2xl text-amber-100 font-serif text-xs sm:text-sm italic shadow-inner">
                    "{criticalPoint.excerpt}"
                </blockquote>
            </Section>

            {/* Evidencia Observada & Problema Técnico */}
            {criticalPoint.observedEvidenceAndTechnicalProblem && (
                <div className="p-4 bg-[#12071d]/90 rounded-2xl border border-rose-500/30 text-xs">
                    <h5 className="font-cinzel font-bold text-white mb-1.5 flex items-center gap-2 text-xs">
                        <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
                        <span className="text-rose-300">Evidencia Observada & Problema Técnico (In Judicando / In Procedendo)</span>
                    </h5>
                    <p className="text-slate-300 leading-relaxed font-serif">{criticalPoint.observedEvidenceAndTechnicalProblem}</p>
                </div>
            )}

            {/* Descomposición en 4 Niveles */}
            {criticalPoint.fourLevelDecomposition ? (
                <div className="p-4 bg-[#12071d]/90 rounded-2xl border border-[#C5A059]/30 space-y-3 text-xs shadow-inner">
                    <div className="flex items-center justify-between">
                        <h5 className="font-cinzel font-bold text-[#FFE898] flex items-center gap-2 text-xs">
                            <Cpu className="w-4 h-4 text-[#DFBA73]" />
                            <span>Silogismo Jurídico Estricto: Descomposición en 4 Niveles</span>
                        </h5>
                        <span className="text-[10px] font-cinzel font-bold text-[#FFE898] uppercase tracking-wider bg-[#DFBA73]/20 px-2.5 py-0.5 rounded-full border border-[#DFBA73]/40">
                            Protocolo V5 LAGP
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 pt-1">
                        <div className="bg-[#08040d] p-3 rounded-xl border border-[#C5A059]/30">
                            <span className="font-cinzel font-bold text-[#DFBA73] block text-[11px] mb-1">1. Hecho Verificado:</span>
                            <span className="text-slate-300 font-serif">{criticalPoint.fourLevelDecomposition.verifiedFact}</span>
                        </div>
                        <div className="bg-[#08040d] p-3 rounded-xl border border-[#C5A059]/30">
                            <span className="font-cinzel font-bold text-[#FFE898] block text-[11px] mb-1">2. Norma Aplicable:</span>
                            <span className="text-slate-300 font-serif">{criticalPoint.fourLevelDecomposition.applicableNorm}</span>
                        </div>
                        <div className="bg-[#08040d] p-3 rounded-xl border border-[#C5A059]/30">
                            <span className="font-cinzel font-bold text-amber-400 block text-[11px] mb-1">3. Inferencia Lógica:</span>
                            <span className="text-slate-300 font-serif">{criticalPoint.fourLevelDecomposition.inference}</span>
                        </div>
                        <div className="bg-[#08040d] p-3 rounded-xl border border-[#C5A059]/30">
                            <span className="font-cinzel font-bold text-emerald-400 block text-[11px] mb-1">4. Conclusión Jurídica:</span>
                            <span className="text-slate-200 font-serif font-semibold">{criticalPoint.fourLevelDecomposition.legalConclusion}</span>
                        </div>
                    </div>
                </div>
            ) : criticalPoint.decompositionMatrix ? (
                <div className="p-4 bg-[#12071d]/90 rounded-2xl border border-[#C5A059]/30 space-y-3 text-xs shadow-inner">
                    <div className="flex items-center justify-between">
                        <h5 className="font-cinzel font-bold text-[#FFE898] flex items-center gap-2 text-xs">
                            <Cpu className="w-4 h-4 text-[#DFBA73]" />
                            <span>Matriz de Descomposición en 3 Niveles</span>
                        </h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                        <div className="bg-[#08040d] p-3 rounded-xl border border-[#C5A059]/30">
                            <span className="font-cinzel font-bold text-[#DFBA73] block text-[11px] mb-1">1. Hecho Verificado:</span>
                            <span className="text-slate-300 font-serif">{criticalPoint.decompositionMatrix.verifiedFact}</span>
                        </div>
                        <div className="bg-[#08040d] p-3 rounded-xl border border-[#C5A059]/30">
                            <span className="font-cinzel font-bold text-amber-400 block text-[11px] mb-1">2. Inferencia Lógica:</span>
                            <span className="text-slate-300 font-serif">{criticalPoint.decompositionMatrix.inference}</span>
                        </div>
                        <div className="bg-[#08040d] p-3 rounded-xl border border-[#C5A059]/30">
                            <span className="font-cinzel font-bold text-emerald-400 block text-[11px] mb-1">3. Conclusión Jurídica:</span>
                            <span className="text-slate-200 font-serif">{criticalPoint.decompositionMatrix.legalConclusion}</span>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Cadena de Trazabilidad Forense */}
            {criticalPoint.traceabilityChain && (
                <div className="p-4 bg-[#12071d]/90 text-slate-100 rounded-2xl border border-[#C5A059]/30 text-xs space-y-2.5">
                    <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-2">
                        <h5 className="font-cinzel font-bold text-[#FFE898] flex items-center gap-2 text-xs">
                            <Terminal className="w-4 h-4 text-[#DFBA73]" />
                            <span>Cadena de Trazabilidad Forense Completa</span>
                        </h5>
                        <span className="text-[10px] uppercase font-cinzel text-amber-200/70">AUDIT TRAIL V5</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px] pt-1">
                        <div className="bg-[#08040d] p-2.5 rounded-xl border border-[#C5A059]/20">
                            <span className="text-amber-400 font-cinzel font-bold block mb-1">1. Conclusión</span>
                            <p className="text-slate-300 font-serif">{criticalPoint.traceabilityChain.conclusion}</p>
                        </div>
                        <div className="bg-[#08040d] p-2.5 rounded-xl border border-[#C5A059]/20">
                            <span className="text-[#FFE898] font-cinzel font-bold block mb-1">2. Argumento</span>
                            <p className="text-slate-300 font-serif">{criticalPoint.traceabilityChain.argument}</p>
                        </div>
                        <div className="bg-[#08040d] p-2.5 rounded-xl border border-[#C5A059]/20">
                            <span className="text-[#DFBA73] font-cinzel font-bold block mb-1">3. Precedente</span>
                            <p className="text-slate-300 font-serif">{criticalPoint.traceabilityChain.normOrPrecedent}</p>
                        </div>
                        <div className="bg-[#08040d] p-2.5 rounded-xl border border-[#C5A059]/20">
                            <span className="text-emerald-400 font-cinzel font-bold block mb-1">4. Hecho Probado</span>
                            <p className="text-slate-300 font-serif">{criticalPoint.traceabilityChain.fact}</p>
                        </div>
                        <div className="bg-[#08040d] p-2.5 rounded-xl border border-[#C5A059]/20">
                            <span className="text-rose-400 font-cinzel font-bold block mb-1">5. Folio / Doc</span>
                            <p className="text-slate-300 font-mono text-[10px]">{criticalPoint.traceabilityChain.sourceDocumentAndFolio}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Separación de Efectos: Anulatorio vs Restitutorio */}
            {criticalPoint.effectSeparation && (
                <div className="p-4 bg-[#12071d]/90 rounded-2xl border border-[#C5A059]/30 text-xs space-y-2.5">
                    <h5 className="font-cinzel font-bold text-[#FFE898] flex items-center gap-2 text-xs">
                        <Scale className="w-4 h-4 text-[#DFBA73]" />
                        <span>Separación de Efectos Procesales & Carga Probatoria</span>
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <div className="bg-[#08040d] p-3 rounded-xl border border-[#C5A059]/30">
                            <strong className="text-[#FFE898] font-cinzel block text-[11px] mb-1">Efecto Anulatorio (Invalidez del Acto):</strong>
                            <p className="text-slate-300 font-serif">{criticalPoint.effectSeparation.annulmentEffect}</p>
                        </div>
                        <div className="bg-[#08040d] p-3 rounded-xl border border-[#C5A059]/30">
                            <strong className="text-amber-400 font-cinzel block text-[11px] mb-1">Efecto Restitutorio (Restablecimiento/Patrimonial):</strong>
                            <p className="text-slate-300 font-serif">{criticalPoint.effectSeparation.restitutionEffect}</p>
                        </div>
                    </div>
                    <div className="bg-[#08040d] p-2.5 rounded-xl text-slate-300 text-[11px] border border-[#C5A059]/30">
                        <strong className="text-[#DFBA73] font-cinzel">Carga Probatoria Individualizada:</strong> {criticalPoint.effectSeparation.evidentiaryBurden}
                    </div>
                </div>
            )}

            {/* Matriz de Aplicabilidad de Precedentes */}
            {criticalPoint.precedentApplicabilityMatrix && criticalPoint.precedentApplicabilityMatrix.length > 0 && (
                <div className="p-4 bg-[#12071d]/90 rounded-2xl border border-[#C5A059]/30 text-xs space-y-3">
                    <h5 className="font-cinzel font-bold text-[#FFE898] flex items-center gap-2 text-xs">
                        <Scale className="w-4 h-4 text-[#DFBA73]" />
                        <span>Matriz de Aplicabilidad de Precedentes & Analogía Fáctica</span>
                    </h5>
                    <div className="space-y-2.5">
                        {criticalPoint.precedentApplicabilityMatrix.map((item, idx) => (
                            <div key={`prec-${idx}`} className="bg-[#08040d] p-3.5 rounded-xl border border-[#C5A059]/20 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C5A059]/20 pb-2">
                                    <div className="flex items-center gap-2 flex-wrap font-mono">
                                        <span className="text-[#DFBA73] font-bold">[{item.sourceType}]</span>
                                        <span className="text-white font-bold">{item.citation}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {getAnalogyGradeBadge(item.analogyGrade)}
                                        <span className="px-2 py-0.5 bg-[#DFBA73]/15 text-[#FFE898] rounded text-[10px] font-cinzel font-bold border border-[#DFBA73]/40">
                                            {item.legalStrength}
                                        </span>
                                        <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-300 rounded text-[10px] font-cinzel font-bold border border-emerald-500/30">
                                            Vigencia: {item.temporalValidity}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
                                    <div className="bg-[#12071d] p-2.5 rounded-lg border border-[#C5A059]/20">
                                        <strong className="text-slate-300 font-cinzel block mb-1">Hechos Comparables:</strong>
                                        <p className="text-slate-400 font-serif">{item.comparableFacts}</p>
                                    </div>
                                    <div className="bg-[#12071d] p-2.5 rounded-lg border border-[#C5A059]/20">
                                        <strong className="text-[#FFE898] font-cinzel block mb-1">Ratio Decidendi Aplicable:</strong>
                                        <p className="text-slate-300 font-serif font-medium">{item.applicableRatio}</p>
                                    </div>
                                    <div className="bg-[#12071d] p-2.5 rounded-lg border border-[#C5A059]/20">
                                        <strong className="text-amber-400 font-cinzel block mb-1">Distingos / Diferencias:</strong>
                                        <p className="text-slate-400 font-serif">{item.keyDifferences}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Analysis & Suggested Argument */}
            <Section title="Análisis Técnico de la Vulnerabilidad" icon={<Cpu className="w-4 h-4 text-[#DFBA73]" />}>
                <p className="leading-relaxed">{criticalPoint.analysis}</p>
            </Section>

            <Section title="Argumento Central para Recurso o Memorial" icon={<Sparkles className="w-4 h-4 text-[#DFBA73]" />}>
                <p className="font-serif font-medium text-amber-100 bg-[#12071d] p-3.5 rounded-xl border border-[#C5A059]/30 leading-relaxed">{criticalPoint.suggestedArgument}</p>
            </Section>

            {/* Steelman Bidireccional */}
            {criticalPoint.bidirectionalSteelman && (
                <div className="p-4 bg-[#12071d]/90 text-slate-100 rounded-2xl space-y-3 text-xs border border-[#C5A059]/40">
                    <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-2">
                        <span className="font-cinzel font-bold text-[#FFE898] flex items-center gap-2">
                            <Zap className="w-4 h-4 text-[#DFBA73]" />
                            <span>Steelman Bidireccional (Simulación Adversarial de 4 Pasos)</span>
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-[#DFBA73] font-cinzel">PROTOCOLO V5</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-[#08040d] p-3 rounded-xl border border-rose-500/30">
                            <strong className="text-rose-400 font-cinzel block mb-1 text-[11px]">A. Mejor Versión del Argumento Opositor/Juez:</strong>
                            <p className="text-slate-300 font-serif">{criticalPoint.bidirectionalSteelman.counterpartBestArgument}</p>
                        </div>
                        <div className="bg-[#08040d] p-3 rounded-xl border border-emerald-500/30">
                            <strong className="text-emerald-400 font-cinzel block mb-1 text-[11px]">B. Mejor Respuesta Inicial de la Defensa:</strong>
                            <p className="text-slate-300 font-serif">{criticalPoint.bidirectionalSteelman.defenseResponse}</p>
                        </div>
                        <div className="bg-[#08040d] p-3 rounded-xl border border-amber-500/30">
                            <strong className="text-amber-400 font-cinzel block mb-1 text-[11px]">C. Réplica Anticipada del Adversario:</strong>
                            <p className="text-slate-300 font-serif">{criticalPoint.bidirectionalSteelman.counterpartReplica}</p>
                        </div>
                        <div className="bg-[#08040d] p-3 rounded-xl border border-[#C5A059]/40">
                            <strong className="text-[#FFE898] font-cinzel block mb-1 text-[11px]">D. Respuesta Final Incontestable de la Defensa:</strong>
                            <p className="text-slate-300 font-serif">{criticalPoint.bidirectionalSteelman.defenseFinalResponse}</p>
                        </div>
                    </div>

                    <div className="bg-[#08040d] p-3 rounded-xl border border-[#DFBA73]/30 text-[11px]">
                        <strong className="text-[#FFE898] font-cinzel">⚖️ Dictamen de Prevalencia en Litigio:</strong>
                        <p className="text-amber-100/90 mt-1 font-serif">{criticalPoint.bidirectionalSteelman.prevailingPartyReasoning}</p>
                    </div>
                </div>
            )}

            {/* Falsation Test */}
            {criticalPoint.falsationTest && (
                <div className="p-3.5 bg-[#12071d]/90 rounded-2xl border border-rose-500/30 text-xs">
                    <strong className="text-rose-400 font-cinzel block mb-1 text-[11px]">Prueba de Falsación (Distinción de Contradicción vs Ausencia de Respaldo):</strong>
                    <p className="text-slate-300 font-serif">{criticalPoint.falsationTest}</p>
                </div>
            )}

            {/* Remediation Steps */}
            {criticalPoint.remediationStrategyAndSteps && criticalPoint.remediationStrategyAndSteps.length > 0 && (
                <div className="p-4 bg-[#12071d]/90 rounded-2xl border border-emerald-500/30 text-xs space-y-2">
                    <h5 className="font-cinzel font-bold text-emerald-400 flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Ruta de Remediación Técnica Paso a Paso</span>
                    </h5>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1 font-serif">
                        {criticalPoint.remediationStrategyAndSteps.map((step, idx) => (
                            <li key={`step-${idx}`} className="leading-relaxed">{step}</li>
                        ))}
                    </ol>
                </div>
            )}
            
            {criticalPoint.fracturePointAnalysis && (
                <div className="p-4 bg-[#12071d]/90 rounded-2xl border border-[#C5A059]/40 shadow-inner">
                    <Section title="Análisis de Punto de Fractura" titleColor="text-[#FFE898]" icon={<Zap className="w-4 h-4 text-[#DFBA73]" />}>
                        <div className="space-y-2 text-xs font-serif">
                            <p><strong className="text-[#DFBA73] font-cinzel">Tesis del Punto de Fractura:</strong> {criticalPoint.fracturePointAnalysis.fracturePointThesis}</p>
                            <p><strong className="text-amber-400 font-cinzel">Principio Violado:</strong> {criticalPoint.fracturePointAnalysis.underlyingPrinciple}</p>
                            <p><strong className="text-emerald-400 font-cinzel">Implicación Estratégica:</strong> {criticalPoint.fracturePointAnalysis.strategicImplication}</p>
                        </div>
                    </Section>
                </div>
            )}

            {criticalPoint.jurisprudentialShielding && criticalPoint.jurisprudentialShielding.length > 0 && (
                <div className="p-4 bg-[#12071d]/90 rounded-2xl border border-[#C5A059]/40 shadow-inner">
                    <Section title="Blindaje Jurisprudencial" titleColor="text-[#FFE898]" icon={<ShieldCheck className="w-4 h-4 text-[#DFBA73]" />}>
                        <div className="space-y-2.5">
                            {criticalPoint.jurisprudentialShielding.map((shield, index) => (
                                <div key={`shield-${index}`} className="text-xs bg-[#08040d] p-3 rounded-xl border border-[#C5A059]/20 space-y-1">
                                    <p><strong className="text-rose-400 font-cinzel">Ataque Anticipado:</strong> "{shield.anticipatedAttack}"</p>
                                    <p><strong className="text-emerald-400 font-cinzel">Precedente Defensivo:</strong> {shield.defensivePrecedent}</p>
                                </div>
                            ))}
                        </div>
                    </Section>
                </div>
            )}
            
            {resolvedEvidence.length > 0 && (
                 <Section title="Evidencia Vinculada (Expediente)" titleColor="text-emerald-400" icon={<FileText className="w-4 h-4 text-emerald-400" />}>
                    <div className="flex flex-wrap gap-2">
                        {resolvedEvidence.map(file => (
                            <div key={file.name} className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-cinzel font-semibold px-3 py-1 rounded-xl flex items-center gap-1.5">
                                <span>{file.evidenceType === 'IMAGE' ? '🖼️' : '📄'}</span>
                                <span>{file.name}</span>
                            </div>
                        ))}
                    </div>
                </Section>
            )}
            
            {/* Team Annotations */}
            <Section title="Anotaciones del Equipo Legal" titleColor="text-[#DFBA73]" icon={<MessageSquare className="w-4 h-4 text-[#DFBA73]" />}>
                <div className="space-y-3">
                    {annotations && annotations.length > 0 ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {annotations.map(note => (
                                <div key={note.id} className="bg-[#08040d] p-3 rounded-xl border-l-2 border-[#DFBA73] border border-[#C5A059]/30">
                                    <p className="text-slate-200 font-serif">{note.text}</p>
                                    <p className="text-[10px] font-mono text-amber-200/60 text-right mt-1">-- {note.author}, {new Date(note.timestamp).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-amber-200/50 italic text-xs font-serif">No hay anotaciones para este hallazgo.</p>
                    )}
                    <div className="flex gap-2">
                         <input
                            id={`annotation-input-${criticalPoint.id}`}
                            name={`annotation-input-${criticalPoint.id}`}
                            value={newAnnotation}
                            onChange={(e) => setNewAnnotation(e.target.value)}
                            placeholder="Añadir anotación para el equipo..."
                            className="flex-grow text-xs p-2.5 bg-[#08040d] border border-[#C5A059]/40 rounded-xl focus:outline-none focus:border-[#FFE898] text-white placeholder-amber-200/40 font-serif"
                        />
                        <button 
                            onClick={handleAnnotationSubmit} 
                            className="px-4 py-2 bg-gradient-to-r from-[#DFBA73] to-[#C5A059] hover:from-[#FFE898] hover:to-[#DFBA73] text-[#08040d] text-xs font-cinzel font-bold rounded-xl transition-all disabled:opacity-40 shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center gap-1.5" 
                            disabled={!newAnnotation.trim()}
                        >
                            <Send className="w-3.5 h-3.5" />
                            <span>Añadir</span>
                        </button>
                    </div>
                </div>
            </Section>
        </div>
    );
});

CriticalPointCard.displayName = 'CriticalPointCard';

export default CriticalPointCard;
