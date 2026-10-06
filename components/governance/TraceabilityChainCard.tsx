import React, { memo, useState, useMemo, useCallback } from 'react';
import type { CriticalPoint } from '../../types';
import { getVerificationStatusConfig, getDecisionLevelConfig, getConfidenceGradeConfig } from './ConfidenceIndicatorBar';
import { Copy, Check, ExternalLink, ChevronDown, ChevronUp, Scale, ShieldCheck } from 'lucide-react';

interface TraceabilityChainCardProps {
    readonly criticalPoint: CriticalPoint;
    readonly index: number;
    readonly onJumpToReview?: (cpId: string) => void;
}

// Configuración de los 5 eslabones para renderizado dinámico (Evita repetición de JSX)
interface ChainLink {
    readonly title: string;
    readonly color: string;
    readonly value: string;
    readonly isMono?: boolean;
    readonly bgStyle?: string;
}

export const TraceabilityChainCard: React.FC<TraceabilityChainCardProps> = memo(({
    criticalPoint,
    index,
    onJumpToReview
}) => {
    const [copied, setCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Memorización de configuraciones y cadenas para evitar recálculos en renders innecesarios
    const { traceabilityChain: chain, verificationStatus, decisionLevel, confidenceLevel, fourLevelDecomposition } = criticalPoint;

    const verification = useMemo(() => getVerificationStatusConfig(verificationStatus), [verificationStatus]);
    const decision = useMemo(() => getDecisionLevelConfig(decisionLevel), [decisionLevel]);
    const confidence = useMemo(() => getConfidenceGradeConfig(confidenceLevel), [confidenceLevel]);

    const conclusion = useMemo(() => 
        chain?.conclusion || fourLevelDecomposition?.legalConclusion || criticalPoint.type,
        [chain?.conclusion, fourLevelDecomposition?.legalConclusion, criticalPoint.type]
    );

    const argument = useMemo(() => 
        chain?.argument || criticalPoint.suggestedArgument || criticalPoint.analysis,
        [chain?.argument, criticalPoint.suggestedArgument, criticalPoint.analysis]
    );

    const norm = useMemo(() => 
        chain?.normOrPrecedent || fourLevelDecomposition?.applicableNorm || 'Norma imperativa aplicable',
        [chain?.normOrPrecedent, fourLevelDecomposition?.applicableNorm]
    );

    const fact = useMemo(() => 
        chain?.fact || fourLevelDecomposition?.verifiedFact || criticalPoint.observedEvidenceAndTechnicalProblem || criticalPoint.excerpt || 'Hecho verificado en el expediente',
        [chain?.fact, fourLevelDecomposition?.verifiedFact, criticalPoint.observedEvidenceAndTechnicalProblem, criticalPoint.excerpt]
    );

    const source = useMemo(() => 
        chain?.sourceDocumentAndFolio || 'Expediente Principal / Pruebas Anexas',
        [chain?.sourceDocumentAndFolio]
    );

    const links: ChainLink[] = useMemo(() => [
        { title: '1. Conclusión', color: 'text-emerald-300', value: conclusion },
        { title: '2. Argumento', color: 'text-[#FFE898]', value: argument },
        { title: '3. Norma / Precedente', color: 'text-[#E8CA7A]', value: norm },
        { title: '4. Hecho Verificado', color: 'text-amber-300', value: fact },
        { title: '5. Documento / Folio', color: 'text-[#DFBA73]', value: source, isMono: true, bgStyle: 'bg-[#0a0410]' },
    ], [conclusion, argument, norm, fact, source]);

    const handleCopyLineage = useCallback(() => {
        const fullText = `[TRAZABILIDAD FORENSE SOVEREIGN - CARGO #${index + 1}]
1. CONCLUSIÓN: ${conclusion}
2. ARGUMENTO: ${argument}
3. NORMA/PRECEDENTE: ${norm}
4. HECHO VERIFICADO: ${fact}
5. FUENTE/FOLIO: ${source}
ESTADO: ${verification.label} | CONFIANZA: ${confidence.grade} | DECISIÓN: ${decision.label}`;

        navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [index, conclusion, argument, norm, fact, source, verification.label, confidence.grade, decision.label]);

    const handleJump = useCallback(() => {
        if (onJumpToReview) {
            onJumpToReview(criticalPoint.id);
        }
    }, [onJumpToReview, criticalPoint.id]);

    const toggleExpand = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    return (
        <div id={`traceability-chain-card-${criticalPoint.id}`} className="court-gold-frame p-5 space-y-4">
            {/* Header with Badges & Action */}
            <div className="flex items-start justify-between flex-wrap gap-3 border-b border-[#C5A059]/30 pb-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-2.5 py-1 text-xs font-cinzel font-black bg-[#2a133d] text-[#f5d76e] rounded-lg border border-[#C5A059]/50 shadow-sm">
                        Cargo #{index + 1}
                    </span>

                    {/* Verification Semaphore Badge */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-cinzel font-bold rounded-md border ${verification.badgeBg}`}>
                        <span>{verification.icon}</span>
                        <span>{verification.label}</span>
                    </span>

                    {/* Decision Level Badge */}
                    <span className={`px-2.5 py-0.5 text-xs font-cinzel font-bold rounded border ${decision.badge}`}>
                        {decision.label}
                    </span>

                    {/* Confidence Grade */}
                    <span className={`px-2.5 py-0.5 text-xs font-cinzel font-bold rounded border ${confidence.color}`}>
                        {confidence.grade}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopyLineage}
                        className="px-3 py-1 text-xs font-cinzel font-bold rounded-xl bg-[#1a0c26] hover:bg-[#28133b] text-amber-200 border border-[#8a6827] flex items-center gap-1.5 transition-colors shadow-inner"
                        title="Copiar cadena de trazabilidad jurídica completa al portapapeles"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-300">Copiada</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5 text-[#DFBA73]" />
                                <span>Copiar Cadena</span>
                            </>
                        )}
                    </button>

                    {onJumpToReview && (
                        <button
                            onClick={handleJump}
                            className="px-3 py-1 text-xs font-cinzel font-bold rounded-xl bg-[#2a133d] hover:bg-[#3d1c58] text-[#f5d76e] flex items-center gap-1 border border-[#C5A059]/60 transition-colors shadow"
                            title="Ver en pestaña de Revisión y Hallazgos"
                        >
                            <span>Examinar</span>
                            <ExternalLink className="w-3 h-3 text-[#f5d76e]" />
                        </button>
                    )}
                </div>
            </div>

            {/* Category and Title */}
            <div>
                <span className="text-[10px] font-cinzel text-[#f5d76e] uppercase tracking-wider block font-bold">
                    {criticalPoint.category || criticalPoint.type}
                </span>
                <h4 className="text-sm sm:text-base font-cinzel font-bold text-white mt-0.5">
                    {conclusion}
                </h4>
            </div>

            {/* 5-Step Visual Lineage Flow */}
            <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] font-cinzel font-bold text-amber-200/80 uppercase tracking-wider">
                    <span>Cadena de Linaje y Respaldo Notarial (5 Eslabones)</span>
                    <button
                        onClick={toggleExpand}
                        className="text-[#f5d76e] hover:text-[#FFE898] text-xs font-cinzel flex items-center gap-1"
                    >
                        {isExpanded ? (
                            <>
                                <span>Contraer vista</span>
                                <ChevronUp className="w-3.5 h-3.5" />
                            </>
                        ) : (
                            <>
                                <span>Expandir auditoría</span>
                                <ChevronDown className="w-3.5 h-3.5" />
                            </>
                        )}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
                    {links.map((link, idx) => (
                        <div key={idx} className={`bg-[#0d0515] p-3 rounded-xl border border-[#8a6827]/40 relative space-y-1.5 shadow-inner ${link.bgStyle || ''}`}>
                            <span className={`text-[10px] font-cinzel font-bold block ${link.color}`}>
                                {link.title}
                            </span>
                            <p className={`text-xs line-clamp-3 font-garamond italic text-sm ${link.isMono ? 'text-amber-200/90 font-mono font-medium not-italic text-xs' : 'text-slate-200'}`} title={link.value}>
                                {link.value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Expanded Detailed Audit */}
            {isExpanded && (
                <div className="pt-3 border-t border-[#C5A059]/30 space-y-3 text-xs bg-[#0d0515]/90 p-4 rounded-xl border border-[#8a6827]/40">
                    {criticalPoint.observedEvidenceAndTechnicalProblem && (
                        <div>
                            <span className="text-[#f5d76e] font-cinzel font-bold block text-xs">Problema Técnico y Evidencia:</span>
                            <p className="text-slate-300 font-garamond italic text-sm mt-0.5">{criticalPoint.observedEvidenceAndTechnicalProblem}</p>
                        </div>
                    )}
                    {fourLevelDecomposition?.applicableNorm && (
                        <div>
                            <span className="text-[#FFE898] font-cinzel font-bold block text-xs">Norma Jurídica y Vigencia:</span>
                            <p className="text-slate-300 font-garamond italic text-sm mt-0.5">{fourLevelDecomposition.applicableNorm}</p>
                        </div>
                    )}
                    {criticalPoint.remediationStrategyAndSteps && criticalPoint.remediationStrategyAndSteps.length > 0 && (
                        <div>
                            <span className="text-emerald-300 font-cinzel font-bold block text-xs">Estrategia y Pasos Técnicos de Remediación:</span>
                            <ul className="list-disc list-inside text-slate-300 font-garamond italic text-sm space-y-1 mt-1">
                                {criticalPoint.remediationStrategyAndSteps.map((step, sIdx) => (
                                    <li key={sIdx}>{step}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

TraceabilityChainCard.displayName = 'TraceabilityChainCard';

export default TraceabilityChainCard;
