import React, { memo, useMemo, useState, useCallback } from 'react';
import type { AlternativeTheory } from '../types';
import { Sparkles, Copy, Check, GitBranch, ArrowUpRight, Scale, Shield } from 'lucide-react';

interface AlternativeTheoriesCardProps {
    readonly theories: readonly AlternativeTheory[];
    readonly onSelectTheory?: (theoryId: string) => void;
}

interface StrengthIndicatorProps {
    readonly strength: 'High' | 'Medium' | 'Low';
}

const STRENGTH_STYLES = {
    High: { 
        badge: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]', 
        dot: 'bg-emerald-400', 
        label: 'Alta Probabilidad' 
    },
    Medium: { 
        badge: 'bg-[#C5A059]/20 border-[#DFBA73]/50 text-[#FFE898] shadow-[0_0_10px_rgba(212,175,55,0.2)]', 
        dot: 'bg-[#D4AF37]', 
        label: 'Media / Subsidiaria' 
    },
    Low: { 
        badge: 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]', 
        dot: 'bg-rose-400', 
        label: 'Baja / Contingente' 
    },
} as const;

const StrengthIndicator: React.FC<StrengthIndicatorProps> = memo(({ strength }) => {
    const config = useMemo(() => {
        return STRENGTH_STYLES[strength] || STRENGTH_STYLES.Medium;
    }, [strength]);

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold rounded-xl border ${config.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`}></span>
            <span>{config.label}</span>
        </span>
    );
});

StrengthIndicator.displayName = 'StrengthIndicator';

export const AlternativeTheoriesCard: React.FC<AlternativeTheoriesCardProps> = memo(({ 
    theories,
    onSelectTheory 
}) => {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopyTheory = useCallback((theory: AlternativeTheory, idOrIndex: string) => {
        const textContent = `TEORÍA ALTERNATIVA: ${theory.title}
Fuerza Argumental: ${theory.strength}
Descripción: ${theory.description}
--------------------------------------------------`;
        navigator.clipboard.writeText(textContent);
        setCopiedId(idOrIndex);
        setTimeout(() => setCopiedId(null), 2000);
    }, []);

    if (!theories || theories.length === 0) {
        return (
            <div className="court-gold-frame p-6 text-center text-amber-200/60 font-cinzel text-xs">
                No hay teorías del caso alternativas registradas para este expediente.
            </div>
        );
    }

    return (
        <div className="court-gold-frame p-6 sm:p-8 space-y-6 text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#C5A059]/30 pb-5">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#2a133d] text-[#f5d76e] rounded-2xl border border-[#C5A059]/50 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                        <GitBranch className="h-6 w-6 text-[#f5d76e]" />
                    </div>
                    <div>
                        <span className="text-[10px] font-cinzel tracking-widest text-[#f5d76e] uppercase font-bold block">
                            STRATEGIC CASE BRANCHING • TEORÍAS CONCURRENTES
                        </span>
                        <h3 className="text-xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFFDF0] via-[#E8CA7A] to-[#C5A059] tracking-wide mt-0.5">
                            Teorías del Caso Alternativas
                        </h3>
                        <p className="text-xs text-amber-200/70 font-garamond italic text-sm">
                            Líneas argumentales subsidiarias, defensas concurrentes y subsidiariedad táctica
                        </p>
                    </div>
                </div>
                <div className="hidden sm:block text-right">
                    <span className="text-xs font-cinzel font-bold bg-[#2a133d] text-[#f5d76e] px-3.5 py-1.5 rounded-xl border border-[#C5A059]/60 shadow-inner">
                        Total: {theories.length} {theories.length === 1 ? 'Línea' : 'Líneas'}
                    </span>
                </div>
            </div>
            
            {/* List of Theories */}
            <div className="space-y-4">
                {theories.map((theory, index) => {
                    const uniqueKey = theory.title || `theory-${index}`;
                    const isCopied = copiedId === uniqueKey;

                    return (
                        <div 
                            key={uniqueKey} 
                            className="bg-[#12071d]/80 border border-[#8a6827]/40 hover:border-[#DFBA73] p-5 rounded-2xl space-y-3 transition-all duration-300 shadow-inner group"
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="px-2.5 py-1 text-xs font-cinzel font-black bg-[#2a133d] text-[#f5d76e] rounded-lg border border-[#C5A059]/50 shadow-sm">
                                        #{index + 1}
                                    </span>
                                    <h4 className="text-sm sm:text-base font-cinzel font-bold text-white tracking-wide">{theory.title}</h4>
                                </div>
                                
                                <div className="flex items-center gap-2 self-end sm:self-center">
                                    <StrengthIndicator strength={theory.strength} />
                                    
                                    <button
                                        type="button"
                                        onClick={() => handleCopyTheory(theory, uniqueKey)}
                                        className="p-2 text-amber-300 hover:text-white bg-[#1a0c26] hover:bg-[#28133b] border border-[#8a6827] rounded-xl transition-colors"
                                        title="Copiar teoría individual"
                                    >
                                        {isCopied ? (
                                            <span className="text-emerald-400 text-xs font-mono px-1 flex items-center gap-1">
                                                <Check className="w-3.5 h-3.5" /> Copiado
                                            </span>
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </button>

                                    {onSelectTheory && (
                                        <button
                                            type="button"
                                            onClick={() => onSelectTheory(uniqueKey)}
                                            className="px-3 py-1.5 text-xs font-cinzel font-bold bg-[#2a133d] hover:bg-[#3d1c58] text-[#f5d76e] border border-[#C5A059]/60 rounded-xl transition-colors flex items-center gap-1 shadow"
                                        >
                                            <span>Revisar</span>
                                            <ArrowUpRight className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="pl-4 border-l-2 border-[#8a6827]/60 group-hover:border-[#DFBA73] transition-colors space-y-1.5 pt-1">
                                <span className="text-[10px] font-cinzel text-[#f5d76e] uppercase tracking-wider block font-bold">
                                    Descripción Narrativa y Tesis Subsidiaria
                                </span>
                                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-garamond italic text-base">{theory.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

AlternativeTheoriesCard.displayName = 'AlternativeTheoriesCard';

export default AlternativeTheoriesCard;
