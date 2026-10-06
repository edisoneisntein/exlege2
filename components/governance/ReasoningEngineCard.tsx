import React, { memo, useState, useMemo, useCallback } from 'react';
import type { CriticalPoint, PrecedentApplicabilityItem } from '../../types';

interface ReasoningEngineCardProps {
    readonly criticalPoints: readonly CriticalPoint[];
    readonly onSelectFinding?: (cpId: string) => void;
}

// --- SUBCOMPONENTES MEMOIZADOS ---

interface FourLevelGridProps {
    readonly activePoint: CriticalPoint;
}

const FourLevelGrid = memo(({ activePoint }: FourLevelGridProps) => (
    <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            <span>Protocolo de Descomposición en 4 Niveles (Anti-Salto Deductivo)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            {/* Nivel 1 */}
            <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800 space-y-1.5 flex flex-col">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 w-fit">
                    Nivel 1: Hecho Verificado
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px] flex-1">
                    {activePoint.fourLevelDecomposition?.verifiedFact ||
                     activePoint.observedEvidenceAndTechnicalProblem ||
                     'Hecho fáctico individualizado con constancia probatoria directa en el expediente.'}
                </p>
            </div>

            {/* Nivel 2 */}
            <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800 space-y-1.5 flex flex-col">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 w-fit">
                    Nivel 2: Norma & Vigencia
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px] flex-1">
                    {activePoint.fourLevelDecomposition?.applicableNorm ||
                     activePoint.traceabilityChain?.normOrPrecedent ||
                     'Norma imperativa aplicable con verificación de vigencia temporal al momento de los hechos.'}
                </p>
            </div>

            {/* Nivel 3 */}
            <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800 space-y-1.5 flex flex-col">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 w-fit">
                    Nivel 3: Inferencia Lógica
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px] flex-1">
                    {activePoint.fourLevelDecomposition?.inference ||
                     activePoint.suggestedArgument ||
                     'Subsunción lógica deductiva que conecta el supuesto fáctico con el mandato normativo sin saltos.'}
                </p>
            </div>

            {/* Nivel 4 */}
            <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800 space-y-1.5 flex flex-col">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 w-fit">
                    Nivel 4: Conclusión Forzosa
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px] flex-1">
                    {activePoint.fourLevelDecomposition?.legalConclusion ||
                     activePoint.traceabilityChain?.conclusion ||
                     'Resultado hermenéutico vinculante y forzoso derivado del silogismo perfecto.'}
                </p>
            </div>
        </div>
    </div>
));
FourLevelGrid.displayName = 'FourLevelGrid';

interface PrecedentsMatrixProps {
    readonly precedents: readonly PrecedentApplicabilityItem[];
}

const PrecedentsMatrix = memo(({ precedents }: PrecedentsMatrixProps) => {
    if (!precedents || precedents.length === 0) return null;

    return (
        <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-slate-300">
                <span>Test de Analogía Jurisprudencial y Precedente Vinculante</span>
                <span className="text-purple-400">{precedents.length} Criterios Aplicados</span>
            </div>

            <div className="space-y-2">
                {precedents.map((prec, i) => (
                    <div key={`${prec.citation}-${i}`} className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="font-bold text-white font-mono">{prec.citation}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                prec.analogyGrade === 'Alto' ? 'bg-emerald-900/70 text-emerald-300 border border-emerald-700' :
                                prec.analogyGrade === 'Medio' ? 'bg-amber-900/70 text-amber-300 border border-amber-700' :
                                'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
                                Analogía: {prec.analogyGrade}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                            <div className="bg-slate-950 p-2 rounded">
                                <span className="text-slate-400 font-bold block">Hechos Comparables:</span>
                                <span className="text-slate-300">{prec.comparableFacts}</span>
                            </div>
                            <div className="bg-slate-950 p-2 rounded">
                                <span className="text-purple-300 font-bold block">Ratio Decidendi:</span>
                                <span className="text-slate-300">{prec.applicableRatio}</span>
                            </div>
                            <div className="bg-slate-950 p-2 rounded">
                                <span className="text-amber-300 font-bold block">Distingo / Diferencias:</span>
                                <span className="text-slate-300">{prec.keyDifferences}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});
PrecedentsMatrix.displayName = 'PrecedentsMatrix';

// --- COMPONENTE PRINCIPAL ---

export const ReasoningEngineCard: React.FC<ReasoningEngineCardProps> = memo(({
    criticalPoints,
    onSelectFinding
}) => {
    // 1. Manejo seguro de estado inicial
    const [selectedPointId, setSelectedPointId] = useState<string>('');

    // 2. Memoización del cálculo del punto activo (evita escaneo en cada render)
    const activePoint = useMemo(() => {
        if (!criticalPoints || criticalPoints.length === 0) return null;
        
        const found = criticalPoints.find(cp => cp.id === selectedPointId);
        return found || criticalPoints[0];
    }, [criticalPoints, selectedPointId]);

    // 3. Callback estabilizado para selección de pestañas
    const handleSelectPoint = useCallback((id: string) => {
        setSelectedPointId(id);
    }, []);

    // 4. Integración de prop onSelectFinding
    const handleInspectFinding = useCallback(() => {
        if (onSelectFinding && activePoint) {
            onSelectFinding(activePoint.id);
        }
    }, [onSelectFinding, activePoint]);

    return (
        <div id="reasoning-engine-card" className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl text-slate-100 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-purple-400/20 text-purple-300 rounded uppercase border border-purple-400/30">
                                Engine 2 / 4
                            </span>
                            <span className="px-2 py-0.5 text-xs font-bold bg-purple-400/20 text-purple-300 rounded uppercase border border-purple-400/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                Rigor Hermenéutico V5
                            </span>
                        </div>
                        <h3 className="text-xl font-black text-white mt-1">Motor de Razonamiento Lógico y Hermenéutico</h3>
                        <p className="text-xs text-slate-400">Descomposición en 4 Niveles, Jerarquía de 10 Rangos Normativos y Test de Analogía de Precedentes</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-mono">SILOGISMOS AUDITADOS</span>
                        <span className="text-xl font-extrabold text-purple-400 font-mono">{criticalPoints?.length || 0} Puntos</span>
                    </div>
                </div>
            </div>

            {/* Manejo de Empty State */}
            {(!criticalPoints || criticalPoints.length === 0) ? (
                <div className="w-full py-10 flex flex-col items-center justify-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/50">
                    <span className="text-3xl mb-2 opacity-40">⚖️</span>
                    <p className="text-sm font-medium">No hay silogismos auditados disponibles para revisión.</p>
                </div>
            ) : (
                <>
                    {/* Sub-Tabs / Selector for Critical Points */}
                    <div className="space-y-2">
                        <label className="text-xs font-mono font-bold uppercase text-slate-400">
                            Inspeccionar Silogismo y Descomposición por Hallazgo:
                        </label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                            {criticalPoints.map((cp, idx) => {
                                const isActive = activePoint?.id === cp.id;
                                return (
                                    <button
                                        key={cp.id}
                                        type="button"
                                        onClick={() => handleSelectPoint(cp.id)}
                                        aria-pressed={isActive}
                                        className={`px-3 py-2 text-xs rounded-lg border font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                                            isActive
                                                ? 'bg-purple-950/80 border-purple-500 text-purple-200 ring-2 ring-purple-500/30'
                                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                                        }`}
                                    >
                                        <span className="font-bold font-mono">#{idx + 1}</span>
                                        <span className="max-w-[180px] truncate">{cp.category || cp.type}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                            cp.verificationStatus === 'VERIFICADA' ? 'bg-emerald-900 text-emerald-300' : 'bg-amber-900 text-amber-300'
                                        }`}>
                                            {cp.verificationStatus === 'VERIFICADA' ? '🟢' : '🟡'}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {activePoint && (
                        <div className="space-y-5 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div>
                                    <span className="text-[11px] font-mono text-purple-400 uppercase font-bold">
                                        Conclusión Central Auditada:
                                    </span>
                                    <h4 className="text-base font-bold text-white mt-0.5">
                                        {activePoint.traceabilityChain?.conclusion || activePoint.type}
                                    </h4>
                                </div>
                                <div className="flex flex-col gap-2 items-end shrink-0">
                                    <span className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
                                        Nivel de Certeza: {activePoint.confidenceLevel || 'A'}
                                    </span>
                                    {onSelectFinding && (
                                        <button 
                                            type="button"
                                            onClick={handleInspectFinding}
                                            className="text-[10px] font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                                        >
                                            Ver en Auditoría &rarr;
                                        </button>
                                    )}
                                </div>
                            </div>

                            <FourLevelGrid activePoint={activePoint} />
                            
                            <PrecedentsMatrix precedents={activePoint.precedentApplicabilityMatrix || []} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
});

ReasoningEngineCard.displayName = 'ReasoningEngineCard';
export default ReasoningEngineCard;
