import React, { memo, useState, useMemo, useCallback } from 'react';
import type { CriticalPoint, LegalContradiction, IntermediateProductsStatus } from '../../types';

export interface AdversarialQAEngineCardProps {
    readonly criticalPoints: readonly CriticalPoint[];
    readonly legalContradictions?: readonly LegalContradiction[];
    readonly intermediateProductsStatus?: Readonly<IntermediateProductsStatus>;
    readonly onSelectFinding?: (cpId: string) => void;
}

type TabType = 'STEELMAN' | 'CONTRADICTIONS' | 'LAYERS';

interface LayerStatus {
    readonly name: string;
    readonly ok: boolean;
}

// -----------------------------------------------------------------------------
// Subcomponent: Steelman Tab Content (Pure Presentation + O(1) Lookup)
// -----------------------------------------------------------------------------
interface SteelmanTabContentProps {
    readonly criticalPoints: readonly CriticalPoint[];
    readonly selectedPointId: string;
    readonly activePoint?: CriticalPoint;
    readonly onSelectPoint: (id: string) => void;
    readonly onSelectFinding?: (cpId: string) => void;
}

const SteelmanTabContent: React.FC<SteelmanTabContentProps> = memo(({
    criticalPoints,
    selectedPointId,
    activePoint,
    onSelectPoint,
    onSelectFinding,
}) => {
    if (!criticalPoints || criticalPoints.length === 0) {
        return (
            <div className="bg-slate-800/40 p-6 rounded-lg border border-slate-700 text-center text-slate-400 text-xs">
                No se han registrado puntos críticos para el análisis adversarial en este informe.
            </div>
        );
    }

    const steelman = activePoint?.bidirectionalSteelman;

    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-mono font-bold uppercase text-slate-400">
                        Seleccionar Conclusión para Auditar Diálogo Adversarial:
                    </label>
                    {activePoint && onSelectFinding && (
                        <button
                            type="button"
                            onClick={() => onSelectFinding(activePoint.id)}
                            className="text-[11px] font-mono text-rose-400 hover:text-rose-300 underline flex items-center gap-1 transition-colors focus:outline-none focus:ring-1 focus:ring-rose-500 rounded px-1"
                        >
                            <span>Auditar Hallazgo en Detalle</span>
                            <span>➔</span>
                        </button>
                    )}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {criticalPoints.map((cp, idx) => {
                        const isSelected = (activePoint?.id === cp.id) || (selectedPointId === cp.id);
                        return (
                            <button
                                key={cp.id || `cp-${idx}`}
                                type="button"
                                onClick={() => onSelectPoint(cp.id)}
                                className={`px-3 py-2 text-xs rounded-lg border font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                                    isSelected
                                        ? 'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/30 shadow-sm'
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750 hover:text-slate-200'
                                }`}
                            >
                                <span className="font-bold font-mono">#{idx + 1}</span>
                                <span className="max-w-[180px] truncate">{cp.category || cp.type || `Punto ${idx + 1}`}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {activePoint ? (
                <div className="space-y-3 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-mono font-bold uppercase text-rose-300 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                            Diálogo Dialéctico Cruzado (A ➔ B ➔ C ➔ D)
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">Gobernanza V5 Falsación</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-lg space-y-2">
                            <div className="flex items-center gap-2 text-rose-400 font-bold">
                                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono text-[10px]">
                                    Paso A: Mejor Argumento Oponente
                                </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-[11px]">
                                {steelman?.counterpartBestArgument || 
                                 activePoint.steelmanCounterpart || 
                                 'La contraparte sostendrá la legalidad y presunción de acierto de la actuación atacada.'}
                            </p>
                        </div>

                        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-lg space-y-2">
                            <div className="flex items-center gap-2 text-blue-400 font-bold">
                                <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono text-[10px]">
                                    Paso B: Respuesta Defensiva Directa
                                </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-[11px]">
                                {steelman?.defenseResponse || 
                                 activePoint.suggestedArgument || 
                                 'Demostración de que la presunción decae ante la infracción manifiesta de la norma imperativa.'}
                            </p>
                        </div>

                        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-lg space-y-2">
                            <div className="flex items-center gap-2 text-amber-400 font-bold">
                                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono text-[10px]">
                                    Paso C: Réplica de la Contraparte
                                </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-[11px]">
                                {steelman?.counterpartReplica || 
                                 'El oponente alegará que la infracción fue formal o consentida durante el trámite.'}
                            </p>
                        </div>

                        <div className="bg-slate-900/90 border border-emerald-900/50 p-4 rounded-lg space-y-2 bg-emerald-950/10">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px]">
                                    Paso D: Dúplica Definitiva (Cierre Inexpugnable)
                                </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-[11px]">
                                {steelman?.defenseFinalResponse || 
                                 activePoint.analysis || 
                                 'Las nulidades sustanciales que vulneran el debido proceso son improrrogables e insubsanables.'}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-800/40 p-6 rounded-lg border border-slate-700 text-center text-slate-400 text-xs">
                    Seleccione un punto crítico para visualizar la matriz dialéctica Steelman.
                </div>
            )}
        </div>
    );
});
SteelmanTabContent.displayName = 'SteelmanTabContent';

// -----------------------------------------------------------------------------
// Subcomponent: Contradictions Tab Content
// -----------------------------------------------------------------------------
interface ContradictionsTabContentProps {
    readonly legalContradictions: readonly LegalContradiction[];
}

const ContradictionsTabContent: React.FC<ContradictionsTabContentProps> = memo(({
    legalContradictions,
}) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-slate-300">
                    Radar de Inconsistencias Hermenéuticas ({legalContradictions.length})
                </span>
                <span className="text-xs text-rose-400 font-mono">Filtro de Incompatibilidad V5</span>
            </div>

            {legalContradictions.length === 0 ? (
                <div className="bg-slate-800/40 p-6 rounded-lg border border-slate-700 text-center text-slate-400 text-xs">
                    No se detectaron contradicciones normativas o probatorias críticas sin resolver en el informe.
                </div>
            ) : (
                <div className="space-y-3">
                    {legalContradictions.map((contra) => (
                        <div key={contra.id} className="bg-slate-800/90 p-4 rounded-lg border border-slate-700 space-y-2.5">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <span className="font-bold text-white text-xs">{contra.conflictDescription}</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                                    Categoría: {contra.category}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded">
                                <div>
                                    <span className="text-purple-300 font-bold block text-[10px]">Criterio de Resolución Hermenéutica:</span>
                                    <span className="text-slate-300">{contra.resolvingCriterion}</span>
                                </div>
                                <div>
                                    <span className="text-emerald-300 font-bold block text-[10px]">Impacto Estratégico:</span>
                                    <span className="text-slate-300">{contra.strategicImpact}</span>
                                </div>
                            </div>
                            {contra.sources && contra.sources.length > 0 && (
                                <div className="text-[10px] text-slate-400 font-mono">
                                    Fuentes en colisión: {contra.sources.join(' | ')}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});
ContradictionsTabContent.displayName = 'ContradictionsTabContent';

// -----------------------------------------------------------------------------
// Subcomponent: 10 Methodological Layers Tab Content
// -----------------------------------------------------------------------------
interface LayersTabContentProps {
    readonly layers: readonly LayerStatus[];
    readonly verifiedCount: number;
}

const LayersTabContent: React.FC<LayersTabContentProps> = memo(({
    layers,
    verifiedCount,
}) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-slate-300">
                    Protocolo de 10 Capas Metodológicas V5 LAGP
                </span>
                <span className={`text-xs font-bold font-mono ${verifiedCount === 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {verifiedCount} / 10 Capas Verificadas
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {layers.map((layer, i) => (
                    <div key={layer.name} className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-400">{`#${i + 1}`}</span>
                            {layer.ok ? (
                                <span className="text-emerald-400 font-bold">✓</span>
                            ) : (
                                <span className="text-amber-400 font-bold">⏳</span>
                            )}
                        </div>
                        <span className="font-bold text-white text-[11px] block">{layer.name}</span>
                        <span className={`text-[10px] font-mono ${layer.ok ? 'text-emerald-300' : 'text-amber-300'}`}>
                            {layer.ok ? 'OPERACIONAL' : 'EN PROCESO'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
});
LayersTabContent.displayName = 'LayersTabContent';

// -----------------------------------------------------------------------------
// Root Component: AdversarialQAEngineCard
// -----------------------------------------------------------------------------
const AdversarialQAEngineCard: React.FC<AdversarialQAEngineCardProps> = memo(({
    criticalPoints = [],
    legalContradictions = [],
    intermediateProductsStatus,
    onSelectFinding
}) => {
    const [selectedPointId, setSelectedPointId] = useState<string>(() => criticalPoints[0]?.id || '');
    const [activeTab, setActiveTab] = useState<TabType>('STEELMAN');

    // O(1) Lookup Index via Map
    const pointsMap = useMemo(() => {
        const map = new Map<string, CriticalPoint>();
        for (const cp of criticalPoints) {
            if (cp.id) map.set(cp.id, cp);
        }
        return map;
    }, [criticalPoints]);

    const activePoint = useMemo(() => {
        if (!criticalPoints || criticalPoints.length === 0) return undefined;
        return pointsMap.get(selectedPointId) || criticalPoints[0];
    }, [pointsMap, selectedPointId, criticalPoints]);

    const handleSelectPoint = useCallback((cpId: string) => {
        setSelectedPointId(cpId);
        if (onSelectFinding) {
            onSelectFinding(cpId);
        }
    }, [onSelectFinding]);

    const handleTabSteelman = useCallback(() => setActiveTab('STEELMAN'), []);
    const handleTabContradictions = useCallback(() => setActiveTab('CONTRADICTIONS'), []);
    const handleTabLayers = useCallback(() => setActiveTab('LAYERS'), []);

    const layers: readonly LayerStatus[] = useMemo(() => [
        { name: '1. Pre-Flight Gate', ok: intermediateProductsStatus?.preFlightAuditCompleted ?? true },
        { name: '2. Matriz Fáctica / Hechos', ok: intermediateProductsStatus?.factsMatrixCompleted ?? true },
        { name: '3. Caducidad & Términos', ok: intermediateProductsStatus?.lapseAndExpirationChecked ?? true },
        { name: '4. Vigencia Temporal', ok: intermediateProductsStatus?.temporalValidityVerified ?? true },
        { name: '5. Separación Anulatorio/Restitutorio', ok: intermediateProductsStatus?.nullityVsRestitutionSeparated ?? true },
        { name: '6. Falsación & Stress Test', ok: intermediateProductsStatus?.stressTestsExecuted ?? true },
        { name: '7. Steelman Bidireccional', ok: intermediateProductsStatus?.steelmanConstructed ?? true },
        { name: '8. Matriz de Confianza A-D', ok: intermediateProductsStatus?.confidenceMatrixAssigned ?? true },
        { name: '9. Mapa de Riesgos', ok: intermediateProductsStatus?.riskMapGenerated ?? true },
        { name: '10. Trazabilidad & Remediación', ok: intermediateProductsStatus?.remediationStepsDefined ?? true },
    ], [intermediateProductsStatus]);

    const verifiedCount = useMemo(() => layers.filter(l => l.ok).length, [layers]);

    return (
        <div id="adversarial-qa-engine-card" className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl text-slate-100 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-rose-400/20 text-rose-300 rounded uppercase border border-rose-400/30">
                                Engine 4 / 4
                            </span>
                            <span className="px-2 py-0.5 text-xs font-bold bg-rose-400/20 text-rose-300 rounded uppercase border border-rose-400/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                                QA Adversarial Activo
                            </span>
                        </div>
                        <h3 className="text-xl font-black text-white mt-1">Motor de Control de Calidad Adversarial (QA)</h3>
                        <p className="text-xs text-slate-400">Steelman Bidireccional de 4 Pasos, Falsación Popperiana y Radar de Contradicciones</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleTabSteelman}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'STEELMAN' ? 'bg-rose-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                        }`}
                    >
                        Steelman 4 Pasos
                    </button>
                    <button
                        type="button"
                        onClick={handleTabContradictions}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'CONTRADICTIONS' ? 'bg-rose-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                        }`}
                    >
                        Contradicciones ({legalContradictions.length})
                    </button>
                    <button
                        type="button"
                        onClick={handleTabLayers}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'LAYERS' ? 'bg-rose-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                        }`}
                    >
                        10 Capas LAGP
                    </button>
                </div>
            </div>

            {activeTab === 'STEELMAN' && (
                <SteelmanTabContent
                    criticalPoints={criticalPoints}
                    selectedPointId={selectedPointId}
                    activePoint={activePoint}
                    onSelectPoint={handleSelectPoint}
                    onSelectFinding={onSelectFinding}
                />
            )}

            {activeTab === 'CONTRADICTIONS' && (
                <ContradictionsTabContent
                    legalContradictions={legalContradictions}
                />
            )}

            {activeTab === 'LAYERS' && (
                <LayersTabContent
                    layers={layers}
                    verifiedCount={verifiedCount}
                />
            )}
        </div>
    );
});

AdversarialQAEngineCard.displayName = 'AdversarialQAEngineCard';

export default AdversarialQAEngineCard;

