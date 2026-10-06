import React, { memo, useMemo, useCallback } from 'react';
import type { VerificationStatus, DecisionLevel, ConfidenceLevel, CriticalPoint } from '../../types';

export interface ConfidenceIndicatorBarProps {
    readonly criticalPoints: readonly CriticalPoint[];
    readonly selectedFilter?: string;
    readonly onFilterSelect?: (filter: string) => void;
}

export interface VerificationStatusConfig {
    readonly label: string;
    readonly colorClass: string;
    readonly badgeBg: string;
    readonly pillBg: string;
    readonly icon: string;
    readonly description: string;
}

export interface DecisionLevelConfig {
    readonly label: string;
    readonly color: string;
    readonly badge: string;
}

export interface ConfidenceGradeConfig {
    readonly grade: string;
    readonly label: string;
    readonly color: string;
}

// -----------------------------------------------------------------------------
// Strategy Pattern: Inmutable Static Lookups (O(1), Cyclomatic Complexity M=1)
// -----------------------------------------------------------------------------
const VERIFICATION_STATUS_STRATEGY: Readonly<Record<VerificationStatus, VerificationStatusConfig>> = {
    VERIFICADA: {
        label: 'VERIFICADA',
        colorClass: 'bg-emerald-500 text-white border-emerald-600',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        pillBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        icon: '🟢',
        description: 'Certeza probatoria directa o respaldo normativo pleno en el expediente.'
    },
    PARCIALMENTE_VERIFICADA: {
        label: 'PARCIALMENTE VERIFICADA',
        colorClass: 'bg-amber-500 text-white border-amber-600',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        pillBg: 'bg-amber-100 text-amber-800 border-amber-300',
        icon: '🟡',
        description: 'Indicios o inferencias plausibles con vacíos documentales pendientes de prueba.'
    },
    NO_VERIFICADA: {
        label: 'NO VERIFICADA',
        colorClass: 'bg-rose-600 text-white border-rose-700',
        badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        pillBg: 'bg-rose-100 text-rose-800 border-rose-300',
        icon: '🔴',
        description: 'Información insuficiente. Bloqueada para afirmaciones categóricas en juicio.'
    }
};

const DEFAULT_VERIFICATION_STATUS: VerificationStatusConfig = {
    label: 'VERIFICADA',
    colorClass: 'bg-emerald-600 text-white border-emerald-700',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    pillBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: '🟢',
    description: 'Certeza probatoria directa.'
};

const DECISION_LEVEL_STRATEGY: Readonly<Record<DecisionLevel, DecisionLevelConfig>> = {
    Confirmado: { label: 'Confirmado', color: 'bg-emerald-600 text-white', badge: 'bg-emerald-950/70 text-emerald-300 border-emerald-800' },
    Probable: { label: 'Probable', color: 'bg-blue-600 text-white', badge: 'bg-blue-950/70 text-blue-300 border-blue-800' },
    Controvertido: { label: 'Controvertido', color: 'bg-amber-600 text-white', badge: 'bg-amber-950/70 text-amber-300 border-amber-800' },
    Insuficientemente_probado: { label: 'Insuficientemente Probado', color: 'bg-orange-600 text-white', badge: 'bg-orange-950/70 text-orange-300 border-orange-800' },
    Contradictorio: { label: 'Contradictorio', color: 'bg-rose-600 text-white', badge: 'bg-rose-950/70 text-rose-300 border-rose-800' },
    No_evaluable: { label: 'No Evaluable', color: 'bg-slate-600 text-white', badge: 'bg-slate-800 text-slate-300 border-slate-700' }
};

const DEFAULT_DECISION_LEVEL: DecisionLevelConfig = {
    label: 'No Evaluable',
    color: 'bg-slate-600 text-white',
    badge: 'bg-slate-800 text-slate-300 border-slate-700'
};

const CONFIDENCE_GRADE_STRATEGY: Readonly<Record<ConfidenceLevel, ConfidenceGradeConfig>> = {
    A: { grade: 'Nivel A (95-100%)', label: 'Certeza Directa', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' },
    B: { grade: 'Nivel B (80-94%)', label: 'Evidencia + Inferencia', color: 'text-blue-400 bg-blue-950/60 border-blue-800' },
    C: { grade: 'Nivel C (60-79%)', label: 'Plausible / Controvertible', color: 'text-amber-400 bg-amber-950/60 border-amber-800' },
    D: { grade: 'Nivel D (<60%)', label: 'No Verificada', color: 'text-rose-400 bg-rose-950/60 border-rose-800' },
    X: { grade: 'Nivel X', label: 'No Evaluable', color: 'text-slate-400 bg-slate-800 border-slate-700' }
};

const DEFAULT_CONFIDENCE_GRADE: ConfidenceGradeConfig = {
    grade: 'Nivel X',
    label: 'No Evaluable',
    color: 'text-slate-400 bg-slate-800 border-slate-700'
};

// -----------------------------------------------------------------------------
// Pure Public Accessors (Preserving API Contracts)
// -----------------------------------------------------------------------------
export const getVerificationStatusConfig = (status?: VerificationStatus): VerificationStatusConfig => {
    if (!status) return DEFAULT_VERIFICATION_STATUS;
    return VERIFICATION_STATUS_STRATEGY[status] ?? DEFAULT_VERIFICATION_STATUS;
};

export const getDecisionLevelConfig = (level?: DecisionLevel): DecisionLevelConfig => {
    if (!level) return DEFAULT_DECISION_LEVEL;
    return DECISION_LEVEL_STRATEGY[level] ?? DEFAULT_DECISION_LEVEL;
};

export const getConfidenceGradeConfig = (level?: ConfidenceLevel): ConfidenceGradeConfig => {
    if (!level) return DEFAULT_CONFIDENCE_GRADE;
    return CONFIDENCE_GRADE_STRATEGY[level] ?? DEFAULT_CONFIDENCE_GRADE;
};

// -----------------------------------------------------------------------------
// Internal Aggregation Model
// -----------------------------------------------------------------------------
interface AggregatedStats {
    readonly total: number;
    readonly verifiedCount: number;
    readonly partialCount: number;
    readonly notVerifiedCount: number;
    readonly verifiedPct: number;
    readonly partialPct: number;
    readonly notVerifiedPct: number;
    readonly levelACount: number;
    readonly levelBCount: number;
    readonly levelCCount: number;
    readonly levelDCount: number;
}

const EMPTY_STATS: AggregatedStats = {
    total: 0,
    verifiedCount: 0,
    partialCount: 0,
    notVerifiedCount: 0,
    verifiedPct: 0,
    partialPct: 0,
    notVerifiedPct: 0,
    levelACount: 0,
    levelBCount: 0,
    levelCCount: 0,
    levelDCount: 0
};

// -----------------------------------------------------------------------------
// Root Component: ConfidenceIndicatorBar
// -----------------------------------------------------------------------------
const ConfidenceIndicatorBar: React.FC<ConfidenceIndicatorBarProps> = memo(({
    criticalPoints = [],
    selectedFilter = 'ALL',
    onFilterSelect
}) => {
    const stats = useMemo<AggregatedStats>(() => {
        if (!Array.isArray(criticalPoints) || criticalPoints.length === 0) {
            return EMPTY_STATS;
        }

        const total = criticalPoints.length;
        let verifiedCount = 0;
        let partialCount = 0;
        let notVerifiedCount = 0;
        let levelACount = 0;
        let levelBCount = 0;
        let levelCCount = 0;
        let levelDCount = 0;

        for (let i = 0; i < total; i++) {
            const cp = criticalPoints[i];
            if (!cp) continue;

            const vStatus = cp.verificationStatus ?? 'VERIFICADA';
            if (vStatus === 'VERIFICADA') {
                verifiedCount++;
            } else if (vStatus === 'PARCIALMENTE_VERIFICADA') {
                partialCount++;
            } else if (vStatus === 'NO_VERIFICADA') {
                notVerifiedCount++;
            }

            const cLevel = cp.confidenceLevel ?? 'A';
            if (cLevel === 'A') {
                levelACount++;
            } else if (cLevel === 'B') {
                levelBCount++;
            } else if (cLevel === 'C') {
                levelCCount++;
            } else {
                levelDCount++;
            }
        }

        const verifiedPct = Math.round((verifiedCount / total) * 100);
        const partialPct = Math.round((partialCount / total) * 100);
        const notVerifiedPct = Math.round((notVerifiedCount / total) * 100);

        return {
            total,
            verifiedCount,
            partialCount,
            notVerifiedCount,
            verifiedPct,
            partialPct,
            notVerifiedPct,
            levelACount,
            levelBCount,
            levelCCount,
            levelDCount
        };
    }, [criticalPoints]);

    const handleFilterClick = useCallback((filterKey: string) => {
        if (!onFilterSelect) return;
        onFilterSelect(selectedFilter === filterKey ? 'ALL' : filterKey);
    }, [onFilterSelect, selectedFilter]);

    return (
        <div id="confidence-indicator-bar" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl text-slate-100 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div>
                        <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                            V5 Confidence & Verification Governance
                        </span>
                        <h3 className="text-lg font-bold text-white">Semáforos de Verificación y Confianza Epistémica</h3>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">Índice Global de Solidez:</span>
                    <span className={`px-3 py-1 text-sm font-black rounded-lg border font-mono ${
                        stats.verifiedPct >= 70
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
                            : stats.verifiedPct >= 40
                            ? 'bg-amber-950/80 text-amber-300 border-amber-600'
                            : 'bg-rose-950/80 text-rose-300 border-rose-600'
                    }`}>
                        {stats.verifiedPct}% Rigor Epistémico
                    </span>
                </div>
            </div>

            {/* Visual Multi-Segment Bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Distribución de Conclusiones Forenses ({stats.total} Totales)</span>
                    <div className="flex items-center gap-4">
                        <span className="text-emerald-400 font-semibold">🟢 {stats.verifiedCount} Verificadas ({stats.verifiedPct}%)</span>
                        <span className="text-amber-400 font-semibold">🟡 {stats.partialCount} Parciales ({stats.partialPct}%)</span>
                        <span className="text-rose-400 font-semibold">🔴 {stats.notVerifiedCount} Bloqueadas ({stats.notVerifiedPct}%)</span>
                    </div>
                </div>

                <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800 p-0.5 shadow-inner">
                    {stats.verifiedPct > 0 && (
                        <div
                            style={{ width: `${stats.verifiedPct}%` }}
                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-l-full transition-all duration-700"
                            title={`Verificadas: ${stats.verifiedCount} (${stats.verifiedPct}%)`}
                        />
                    )}
                    {stats.partialPct > 0 && (
                        <div
                            style={{ width: `${stats.partialPct}%` }}
                            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-700"
                            title={`Parcialmente Verificadas: ${stats.partialCount} (${stats.partialPct}%)`}
                        />
                    )}
                    {stats.notVerifiedPct > 0 && (
                        <div
                            style={{ width: `${stats.notVerifiedPct}%` }}
                            className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-r-full transition-all duration-700"
                            title={`No Verificadas: ${stats.notVerifiedCount} (${stats.notVerifiedPct}%)`}
                        />
                    )}
                </div>
            </div>

            {/* Interactive Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <button
                    type="button"
                    aria-pressed={selectedFilter === 'VERIFICADA'}
                    onClick={() => handleFilterClick('VERIFICADA')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                        selectedFilter === 'VERIFICADA'
                            ? 'bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500/30'
                            : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            🟢 VERIFICADAS
                        </span>
                        <span className="text-xs font-mono font-bold bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded border border-emerald-800">
                            {stats.verifiedCount}
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                        Certeza probatoria incontrovertible o norma expresa aplicable.
                    </p>
                </button>

                <button
                    type="button"
                    aria-pressed={selectedFilter === 'PARCIALMENTE_VERIFICADA'}
                    onClick={() => handleFilterClick('PARCIALMENTE_VERIFICADA')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                        selectedFilter === 'PARCIALMENTE_VERIFICADA'
                            ? 'bg-amber-950/70 border-amber-500 ring-2 ring-amber-500/30'
                            : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                            🟡 PARCIALMENTE VERIF.
                        </span>
                        <span className="text-xs font-mono font-bold bg-amber-900/60 text-amber-200 px-2 py-0.5 rounded border border-amber-800">
                            {stats.partialCount}
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                        Inferencia lógica razonable con necesidad de pieza probatoria de soporte.
                    </p>
                </button>

                <button
                    type="button"
                    aria-pressed={selectedFilter === 'NO_VERIFICADA'}
                    onClick={() => handleFilterClick('NO_VERIFICADA')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                        selectedFilter === 'NO_VERIFICADA'
                            ? 'bg-rose-950/70 border-rose-500 ring-2 ring-rose-500/30'
                            : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                            🔴 NO VERIFICADAS
                        </span>
                        <span className="text-xs font-mono font-bold bg-rose-900/60 text-rose-200 px-2 py-0.5 rounded border border-rose-800">
                            {stats.notVerifiedCount}
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                        Vacío probatorio. Bloqueadas para afirmaciones absolutas en litigio.
                    </p>
                </button>
            </div>

            {/* Confidence Grades Badges Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-slate-400 font-mono text-[11px]">Niveles de Certidumbre Jurídica:</span>
                <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded bg-slate-800/90 text-emerald-300 border border-emerald-900/50 font-mono">
                        A: Certeza Directa ({stats.levelACount})
                    </span>
                    <span className="px-2.5 py-1 rounded bg-slate-800/90 text-blue-300 border border-blue-900/50 font-mono">
                        B: Evidencia+Inferencia ({stats.levelBCount})
                    </span>
                    <span className="px-2.5 py-1 rounded bg-slate-800/90 text-amber-300 border border-amber-900/50 font-mono">
                        C: Plausible ({stats.levelCCount})
                    </span>
                    <span className="px-2.5 py-1 rounded bg-slate-800/90 text-rose-300 border border-rose-900/50 font-mono">
                        D/X: No Verificado ({stats.levelDCount})
                    </span>
                </div>
            </div>
        </div>
    );
});

ConfidenceIndicatorBar.displayName = 'ConfidenceIndicatorBar';

export default ConfidenceIndicatorBar;
