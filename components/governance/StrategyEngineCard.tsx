import React, { memo, useState, useMemo, useCallback } from 'react';
import type { CriticalPoint } from '../../types';

interface StrategyEngineCardProps {
    readonly criticalPoints: CriticalPoint[];
    readonly onSelectFinding?: (cpId: string) => void;
}

// --- SUBCOMPONENTES AUXILIARES ---

interface SubsidiaryThesesListProps {
    readonly theses?: string[];
}

const SubsidiaryThesesList: React.FC<SubsidiaryThesesListProps> = memo(({ theses }) => {
    if (theses && theses.length > 0) {
        return (
            <>
                {theses.map((subThesis, sIdx) => (
                    <div key={sIdx} className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-lg">
                        <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                            <span className="px-2 py-0.5 rounded bg-amber-900/80 text-amber-200 font-mono text-[10px]">
                                Línea Subsidiaria {sIdx + 1}
                            </span>
                            <span className="text-[11px] text-slate-400">En defecto de la tesis principal:</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{subThesis}</p>
                    </div>
                ))}
            </>
        );
    }

    return (
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-lg">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <span className="px-2 py-0.5 rounded bg-amber-900/80 text-amber-200 font-mono text-[10px]">Línea Subsidiaria 1</span>
                <span className="text-[11px] text-slate-400">En defecto de la tesis principal:</span>
            </div>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Inexistencia de causal de rechazo de plano y procedencia de readecuación del trámite procesal o inaplicación de sanción.
            </p>
        </div>
    );
});
SubsidiaryThesesList.displayName = 'SubsidiaryThesesList';


// --- COMPONENTE PRINCIPAL ---

export const StrategyEngineCard: React.FC<StrategyEngineCardProps> = memo(({
    criticalPoints,
    onSelectFinding
}) => {
    const [selectedPointId, setSelectedPointId] = useState<string>(() => criticalPoints[0]?.id || '');

    const activePoint = useMemo(() => {
        return criticalPoints.find(cp => cp.id === selectedPointId) || criticalPoints[0];
    }, [criticalPoints, selectedPointId]);

    const subsidiaryCount = useMemo(() => {
        return criticalPoints.filter(cp => cp.subsidiaryDefenseStrategy).length;
    }, [criticalPoints]);

    const handleSelectPoint = useCallback((id: string) => {
        setSelectedPointId(id);
        if (onSelectFinding) {
            onSelectFinding(id);
        }
    }, [onSelectFinding]);

    if (!criticalPoints || criticalPoints.length === 0) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-400 text-xs text-center font-mono">
                No hay puntos críticos disponibles para el Motor Estratégico.
            </div>
        );
    }

    return (
        <div id="strategy-engine-card" className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl text-slate-100 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-emerald-400/20 text-emerald-300 rounded uppercase border border-emerald-400/30">
                                Engine 3 / 4
                            </span>
                            <span className="px-2 py-0.5 text-xs font-bold bg-emerald-400/20 text-emerald-300 rounded uppercase border border-emerald-400/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                Estrategia Escalonada V5
                            </span>
                        </div>
                        <h3 className="text-xl font-black text-white mt-1">Motor Estratégico y Decisión Litigiosa</h3>
                        <p className="text-xs text-slate-400">Defensas Subsidiarias Escalonadas, Separación Estricta de Efectos y Remediación Técnica</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-mono">RUTAS SUBSIDIARIAS</span>
                        <span className="text-xl font-extrabold text-emerald-400 font-mono">
                            {subsidiaryCount > 0 ? `${subsidiaryCount} Estratificadas` : '100% Cobertura'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Strategy Overview KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-800/70 p-3.5 rounded-lg border border-slate-700/80">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Tesis de Ataque Principal</span>
                    <span className="text-sm font-bold text-emerald-400">Nulidad / Invalidez Sustancial</span>
                    <p className="text-[11px] text-slate-400 mt-1">Ataque directo a la validez del acto o resolución cuestionada.</p>
                </div>

                <div className="bg-slate-800/70 p-3.5 rounded-lg border border-slate-700/80">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Separación de Efectos</span>
                    <span className="text-sm font-bold text-blue-400">Anulatorio vs Restitutorio</span>
                    <p className="text-[11px] text-slate-400 mt-1">Cargas probatorias individualizadas para evitar desestimaciones cruzadas.</p>
                </div>

                <div className="bg-slate-800/70 p-3.5 rounded-lg border border-slate-700/80">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Salvaguarda de Riesgo Residual</span>
                    <span className="text-sm font-bold text-amber-400">Contingencia Escalonada</span>
                    <p className="text-[11px] text-slate-400 mt-1">Planes de contingencia en caso de desestimación del cargo principal.</p>
                </div>
            </div>

            {/* Selector for Critical Points */}
            <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase text-slate-400">
                    Seleccionar Cargo para Inspeccionar Estrategia Subsidiaria:
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {criticalPoints.map((cp, idx) => (
                        <button
                            key={cp.id}
                            onClick={() => handleSelectPoint(cp.id)}
                            className={`px-3 py-2 text-xs rounded-lg border font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                                (activePoint?.id === cp.id)
                                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30'
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                            }`}
                        >
                            <span className="font-bold font-mono">#{idx + 1}</span>
                            <span className="max-w-[180px] truncate">{cp.category || cp.type}</span>
                        </button>
                    ))}
                </div>
            </div>

            {activePoint && (
                <div className="space-y-5 bg-slate-950/60 p-5 rounded-xl border border-slate-800">
                    {/* Subsidiary Defense Architecture */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-emerald-300">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            <span>Estructura de Tesis Principal y Líneas Subsidiarias</span>
                        </div>

                        <div className="space-y-2.5">
                            {/* Main Thesis */}
                            <div className="bg-emerald-950/30 border border-emerald-700/50 p-3.5 rounded-lg">
                                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                                    <span className="px-2 py-0.5 rounded bg-emerald-800 text-white font-mono text-[10px]">Tesis Principal (Ataque Primario)</span>
                                </div>
                                <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">
                                    {activePoint.subsidiaryDefenseStrategy?.mainThesis || 
                                     activePoint.traceabilityChain?.conclusion || 
                                     activePoint.suggestedArgument ||
                                     activePoint.type}
                                </p>
                            </div>

                            {/* Subsidiary Theses Component */}
                            <SubsidiaryThesesList theses={activePoint.subsidiaryDefenseStrategy?.subsidiaryTheses} />
                        </div>
                    </div>

                    {/* Effect Separation Grid */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                        <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-slate-300">
                            <span>Separación Estricta de Pretensiones y Cargas de Prueba</span>
                            <span className="text-emerald-400">Regla V5 Anti-Confusión</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-2">
                                <div className="flex items-center gap-2 text-blue-400 font-bold">
                                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono text-[10px]">
                                        Efecto Anulatorio
                                    </span>
                                </div>
                                <p className="text-slate-300 text-[11px]">
                                    {activePoint.effectSeparation?.annulmentEffect || 
                                     'Invalidez y nulidad absoluta del pronunciamiento por vicio sustancial de forma o fondo.'}
                                </p>
                                <div className="bg-slate-950 p-2 rounded text-[11px] border border-slate-800">
                                    <span className="text-blue-300 font-bold block">Carga Probatoria Individualizada:</span>
                                    <span className="text-slate-400">{activePoint.effectSeparation?.evidentiaryBurden || 'Constatación formal del quebrantamiento de garantía procesal.'}</span>
                                </div>
                            </div>

                            <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-2">
                                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px]">
                                        Efecto Restitutorio / Indemnizatorio
                                    </span>
                                </div>
                                <p className="text-slate-300 text-[11px]">
                                    {activePoint.effectSeparation?.restitutionEffect || 
                                     'Restablecimiento del derecho subjetivo lesionado y reincorporación a la situación previa.'}
                                </p>
                                <div className="bg-slate-950 p-2 rounded text-[11px] border border-slate-800">
                                    <span className="text-emerald-300 font-bold block">Carga Probatoria Individualizada:</span>
                                    <span className="text-slate-400">{activePoint.effectSeparation?.evidentiaryBurden || 'Demostración técnica del daño concreto y su nexo causal.'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

StrategyEngineCard.displayName = 'StrategyEngineCard';

export default StrategyEngineCard;
