import React, { memo, useState, useMemo, useCallback } from 'react';
import type { PreFlightAudit, EvidentiaryInconsistency, CriticalPoint, VerificationStatus } from '../../types';

export interface EvidenceEngineCardProps {
    readonly preFlightAudit?: Readonly<PreFlightAudit>;
    readonly evidentiaryInconsistencies?: readonly EvidentiaryInconsistency[];
    readonly criticalPoints: readonly CriticalPoint[];
    readonly onSelectFinding?: (cpId: string) => void;
}

// -----------------------------------------------------------------------------
// Subcomponent: Metrics Grid
// -----------------------------------------------------------------------------
interface MetricsGridProps {
    readonly functionalCompetence?: string;
    readonly proceduralTerms?: string;
    readonly inconsistenciesCount: number;
}

const MetricsGrid: React.FC<MetricsGridProps> = memo(({
    functionalCompetence,
    proceduralTerms,
    inconsistenciesCount
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Competencia Funcional */}
            <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700/80 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>Competencia Funcional</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                    {functionalCompetence || 'Auditoría de jurisdicción y competencia funcional validada sin excepciones procesales inhibitorias.'}
                </p>
            </div>

            {/* 2. Caducidad & Términos */}
            <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700/80 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Caducidad y Prescripción</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                    {proceduralTerms || 'Términos de interposición de recursos y caducidad de la acción dentro de los plazos legales vigentes.'}
                </p>
            </div>

            {/* 3. Inconsistencias Probatorias */}
            <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>Inconsistencias Forenses</span>
                    </div>
                    <span className="text-xs font-mono font-bold bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800">
                        {inconsistenciesCount} Detectadas
                    </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                    {inconsistenciesCount > 0 
                        ? `${inconsistenciesCount} contradicciones directas entre afirmaciones fácticas y el material probatorio anexado.`
                        : 'No se detectaron contradicciones abiertas entre las afirmaciones del expediente y los documentos de prueba.'}
                </p>
            </div>
        </div>
    );
});
MetricsGrid.displayName = 'MetricsGrid';

// -----------------------------------------------------------------------------
// Subcomponent: Document Gaps
// -----------------------------------------------------------------------------
interface DocumentGapsSectionProps {
    readonly documentGaps: readonly string[];
}

const DocumentGapsSection: React.FC<DocumentGapsSectionProps> = memo(({ documentGaps }) => {
    if (!documentGaps || documentGaps.length === 0) return null;

    return (
        <div className="bg-amber-950/30 border border-amber-900/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Vacíos Documentales en el Expediente (Prohibición de Afirmaciones Absolutas)</span>
                </div>
                <span className="text-[11px] font-mono text-amber-400">Regla V5 de Certeza Negativa</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {documentGaps.map((gap, i) => (
                    <li key={`gap-${i}`} className="flex items-start gap-2 bg-slate-900/80 p-2.5 rounded border border-slate-800">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{gap}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
});
DocumentGapsSection.displayName = 'DocumentGapsSection';

// -----------------------------------------------------------------------------
// Subcomponent: Inconsistencies Section
// -----------------------------------------------------------------------------
interface InconsistenciesSectionProps {
    readonly evidentiaryInconsistencies: readonly EvidentiaryInconsistency[];
    readonly isExpanded: boolean;
    readonly onToggleExpand: () => void;
}

const InconsistenciesSection: React.FC<InconsistenciesSectionProps> = memo(({
    evidentiaryInconsistencies,
    isExpanded,
    onToggleExpand
}) => {
    if (!evidentiaryInconsistencies || evidentiaryInconsistencies.length === 0) return null;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <span>Colisiones entre Documento Principal y Pruebas</span>
                </h4>
                <button
                    type="button"
                    onClick={onToggleExpand}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                >
                    {isExpanded ? 'Ocultar Detalle' : `Ver ${evidentiaryInconsistencies.length} Inconsistencias`}
                </button>
            </div>

            {isExpanded && (
                <div className="space-y-3">
                    {evidentiaryInconsistencies.map((inc) => (
                        <div key={inc.id} className="bg-slate-800/90 rounded-lg p-4 border border-rose-900/40 space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div className="bg-rose-950/40 p-3 rounded border border-rose-900/50 space-y-1">
                                    <strong className="text-rose-300 block font-bold">Afirmación en Documento / Fallo:</strong>
                                    <p className="text-slate-300 italic">"{inc.claimInDocument}"</p>
                                </div>
                                <div className="bg-emerald-950/40 p-3 rounded border border-emerald-900/50 space-y-1">
                                    <strong className="text-emerald-300 block font-bold">Prueba en Conflicto ({inc.evidenceFileName}):</strong>
                                    <p className="text-slate-300 italic">"{inc.contradictoryEvidenceExcerpt}"</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 pt-1">
                                <strong className="text-slate-300">Análisis Forense:</strong> {inc.analysis}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});
InconsistenciesSection.displayName = 'InconsistenciesSection';

// -----------------------------------------------------------------------------
// Root Component: EvidenceEngineCard
// -----------------------------------------------------------------------------
const EvidenceEngineCard: React.FC<EvidenceEngineCardProps> = memo(({
    preFlightAudit,
    evidentiaryInconsistencies = [],
    criticalPoints,
    onSelectFinding: _onSelectFinding
}) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    const toggleExpanded = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    // Single-pass aggregated calculation (O(n))
    const { verifiedFactsCount, unverifiedCount, totalPoints } = useMemo(() => {
        if (!Array.isArray(criticalPoints) || criticalPoints.length === 0) {
            return { verifiedFactsCount: 0, unverifiedCount: 0, totalPoints: 0 };
        }

        let verified = 0;
        let unverified = 0;
        const total = criticalPoints.length;

        for (let i = 0; i < total; i++) {
            const cp = criticalPoints[i];
            if (!cp) continue;

            const status = cp.verificationStatus ?? 'VERIFICADA';
            if (status === 'VERIFICADA') {
                verified++;
            } else if (status === 'NO_VERIFICADA') {
                unverified++;
            }
        }

        return {
            verifiedFactsCount: verified,
            unverifiedCount: unverified,
            totalPoints: total
        };
    }, [criticalPoints]);

    const documentGaps = preFlightAudit?.documentGaps ?? [];

    const gateStatus: VerificationStatus = preFlightAudit?.verificationGate ?? 
        (unverifiedCount === 0 ? 'VERIFICADA' : 'PARCIALMENTE_VERIFICADA');

    return (
        <div id="evidence-engine-card" className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl text-slate-100 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-blue-400/20 text-blue-300 rounded uppercase border border-blue-400/30">
                                Engine 1 / 4
                            </span>
                            <span className="px-2 py-0.5 text-xs font-bold bg-emerald-400/20 text-emerald-300 rounded uppercase border border-emerald-400/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                Gate: {gateStatus}
                            </span>
                        </div>
                        <h3 className="text-xl font-black text-white mt-1">Motor Probatorio y de Admisión Forense</h3>
                        <p className="text-xs text-slate-400">Pre-Flight Safety Gate, Inconsistencias Fácticas, Vacíos Documentales y Competencia</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-mono">HECHOS VERIFICADOS</span>
                        <span className="text-xl font-extrabold text-blue-400 font-mono">{verifiedFactsCount} / {totalPoints}</span>
                    </div>
                </div>
            </div>

            {/* Core Metrics Grid */}
            <MetricsGrid
                functionalCompetence={preFlightAudit?.functionalCompetenceReview}
                proceduralTerms={preFlightAudit?.proceduralTermsAudit}
                inconsistenciesCount={evidentiaryInconsistencies.length}
            />

            {/* Document Gaps Section */}
            <DocumentGapsSection documentGaps={documentGaps} />

            {/* Inconsistencies List */}
            <InconsistenciesSection
                evidentiaryInconsistencies={evidentiaryInconsistencies}
                isExpanded={isExpanded}
                onToggleExpand={toggleExpanded}
            />
        </div>
    );
});

EvidenceEngineCard.displayName = 'EvidenceEngineCard';

export default EvidenceEngineCard;

