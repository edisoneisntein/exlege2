import React, { useState } from 'react';
import { Crown, CheckCircle2, ChevronDown, ChevronUp, AlertTriangle, ArrowRight, ShieldCheck, FileCheck2, Sparkles } from 'lucide-react';
import type { RefinementLoopResult } from '../services/gemini/refinementLoop';

interface RefinementTransparencyCardProps {
    result: RefinementLoopResult;
}

export const RefinementTransparencyCard: React.FC<RefinementTransparencyCardProps> = ({ result }) => {
    const [openIteration, setOpenIteration] = useState<number | null>(result.history.length > 0 ? result.history.length : 1);

    const toggleIteration = (index: number) => {
        setOpenIteration(openIteration === index ? null : index);
    };

    return (
        <div className="mb-6 bg-gradient-to-b from-[#130720] to-[#0a0311] border border-[#DFBA73]/50 rounded-2xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(212,175,55,0.2)]">
            {/* Header con resumen e insignia soberana */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1f0b32] via-[#2a1042] to-[#170826] border-b border-[#DFBA73]/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-[#DFBA73] to-[#9a7629] text-[#08040d] shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                            <Crown className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-cinzel font-black text-white flex items-center gap-2">
                                <span>Bucle de Reflexión Autónomo • Dictamen del Magistrado Auditor</span>
                            </h3>
                            <p className="text-xs text-amber-200/70 font-garamond italic">
                                Ciclo de autocrítica y perfeccionamiento procesal en múltiples pasadas
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className={`px-3 py-1 text-xs font-cinzel font-bold rounded-xl border flex items-center gap-1.5 shadow-md ${
                            result.approved 
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50' 
                                : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                        }`}>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{result.approved ? 'APROBADO CON RIGOR' : 'OPTIMIZADO'}</span>
                        </span>
                        <span className="px-3 py-1 text-xs font-mono font-bold rounded-xl bg-[#26103a] text-[#FFE898] border border-[#DFBA73]/40">
                            {result.finalScore}/100 pts
                        </span>
                    </div>
                </div>

                {/* Score Progression Bar */}
                <div className="mt-3 pt-3 border-t border-[#DFBA73]/20 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                    <span className="font-cinzel font-bold text-amber-200 text-[11px] uppercase tracking-wider">
                        Evolución de Rigor Procesal:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                        {result.history.map((h, i) => (
                            <React.Fragment key={i}>
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0e0416] border border-[#DFBA73]/30">
                                    <span className="text-[10px] font-mono text-amber-300/70">Pase {h.iterationIndex}:</span>
                                    <span className={`font-mono font-bold ${h.evaluation.score >= 95 ? 'text-emerald-400' : 'text-[#FFE898]'}`}>
                                        {h.evaluation.score}%
                                    </span>
                                </div>
                                {i < result.history.length - 1 && (
                                    <ArrowRight className="w-3.5 h-3.5 text-[#DFBA73]/60" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Summary Text */}
            <div className="px-4 sm:px-5 py-3 bg-[#0d0517] border-b border-[#DFBA73]/20">
                <p className="text-xs sm:text-sm text-amber-100/90 font-serif leading-relaxed flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#DFBA73] flex-shrink-0 mt-0.5" />
                    <span>{result.summary}</span>
                </p>
            </div>

            {/* Iterations Accordion */}
            <div className="p-4 sm:p-5 space-y-3">
                <h4 className="font-cinzel font-bold text-xs text-amber-200/90 uppercase tracking-wider mb-2">
                    Desglose de Auditoría & Correcciones por Pase:
                </h4>

                {result.history.map((iter) => {
                    const isOpen = openIteration === iter.iterationIndex;
                    const { evaluation } = iter;

                    return (
                        <div 
                            key={iter.iterationIndex}
                            className="border border-[#DFBA73]/30 rounded-xl overflow-hidden bg-[#11061d] transition-all"
                        >
                            <button 
                                onClick={() => toggleIteration(iter.iterationIndex)}
                                className="w-full p-3 bg-[#170926] hover:bg-[#200d36] flex items-center justify-between text-left transition-colors"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`p-1 rounded-md text-xs font-mono font-bold ${
                                        evaluation.score >= 95 ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300'
                                    }`}>
                                        #{iter.iterationIndex}
                                    </div>
                                    <span className="font-cinzel font-bold text-xs sm:text-sm text-white truncate">
                                        Pase {iter.iterationIndex}: {evaluation.status} ({evaluation.score}/100 pts)
                                    </span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border hidden sm:inline-block font-mono ${
                                        evaluation.admissibilityRisk === 'BAJO' 
                                            ? 'text-emerald-300 border-emerald-500/40 bg-emerald-950/40' 
                                            : 'text-amber-300 border-amber-500/40 bg-amber-950/40'
                                    }`}>
                                        Riesgo de Inadmisión: {evaluation.admissibilityRisk}
                                    </span>
                                </div>
                                <div className="text-[#DFBA73]">
                                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                            </button>

                            {isOpen && (
                                <div className="p-4 space-y-3 text-xs font-serif bg-[#0c0414] border-t border-[#DFBA73]/20">
                                    {/* Dictamen del Magistrado */}
                                    <div className="p-3 bg-[#150824] rounded-lg border border-[#DFBA73]/20">
                                        <div className="font-cinzel font-bold text-[11px] text-[#FFE898] mb-1 flex items-center gap-1.5">
                                            <ShieldCheck className="w-3.5 h-3.5 text-[#DFBA73]" />
                                            <span>Dictamen del Magistrado Auditor:</span>
                                        </div>
                                        <p className="text-slate-200 leading-relaxed italic text-xs">
                                            "{evaluation.critique}"
                                        </p>
                                    </div>

                                    {/* Debilidades y Remediaciones */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-lg space-y-1.5">
                                            <div className="font-cinzel font-bold text-[11px] text-rose-300 flex items-center gap-1.5">
                                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                                                <span>Debilidades Detectadas:</span>
                                            </div>
                                            <ul className="space-y-1 pl-1 text-slate-300">
                                                {evaluation.identifiedWeaknesses.map((w, idx) => (
                                                    <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                                                        <span className="text-rose-400 font-bold">•</span>
                                                        <span>{w}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg space-y-1.5">
                                            <div className="font-cinzel font-bold text-[11px] text-emerald-300 flex items-center gap-1.5">
                                                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                                                <span>Correcciones y Remediaciones Exigidas:</span>
                                            </div>
                                            <ul className="space-y-1 pl-1 text-slate-300">
                                                {evaluation.requiredRemediations.map((r, idx) => (
                                                    <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                                                        <span className="text-emerald-400 font-bold">✓</span>
                                                        <span>{r}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
