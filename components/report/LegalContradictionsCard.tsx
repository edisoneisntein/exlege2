import React, { memo } from 'react';
import type { LegalContradiction } from '../../types';
import { Flame } from 'lucide-react';

interface LegalContradictionsCardProps {
    contradictions?: LegalContradiction[];
}

const LegalContradictionsCard: React.FC<LegalContradictionsCardProps> = memo(({ contradictions }) => {
    if (!contradictions || contradictions.length === 0) return null;

    const getCategoryBadgeClass = (category: string) => {
        switch (category) {
            case 'Normativa':
                return 'bg-[#DFBA73]/15 text-[#FFE898] border-[#DFBA73]/40';
            case 'Jurisprudencial':
                return 'bg-[#C5A059]/20 text-[#FFE898] border-[#C5A059]/40';
            case 'Probatoria':
                return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
            case 'Interna':
            default:
                return 'bg-rose-500/15 text-rose-300 border-rose-500/40';
        }
    };

    return (
        <div id="legal-contradictions-card" className="relative bg-[#0e0717]/90 backdrop-blur-2xl text-slate-100 p-6 sm:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(212,175,55,0.08)] border border-[#C5A059]/40 space-y-5 overflow-hidden">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#FFE898]/50 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#C5A059]/20 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-rose-500/15 text-rose-400 rounded-2xl border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                        <Flame className="w-6 h-6 text-rose-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 text-[10px] font-cinzel font-bold bg-[#8a2232]/30 text-[#FFE898] rounded-full uppercase tracking-wider border border-[#C5A059]/40">
                                CONTRADICTION ENGINE V5
                            </span>
                            <span className="text-[11px] text-amber-200/70 font-mono">
                                {contradictions.length} Antinomias Críticas Mapeadas
                            </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-cinzel font-bold text-white mt-1">Matriz de Contradicciones Antinómicas y Fácticas</h3>
                    </div>
                </div>
            </div>

            <p className="text-xs sm:text-sm text-amber-100/75 font-serif italic leading-relaxed">
                El motor de contradicciones V5 detecta colisiones directas entre argumentos, testimonios, pruebas documentales y fuentes normativas invocadas en el caso.
            </p>

            <div className="space-y-4 pt-1">
                {contradictions.map((item, idx) => (
                    <div key={item.id || `contra-${idx}`} className="bg-[#12071d]/90 rounded-2xl p-4 sm:p-5 border border-[#C5A059]/30 space-y-3 shadow-inner">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className={`px-3 py-0.5 text-[11px] font-cinzel font-bold rounded-full border ${getCategoryBadgeClass(item.category)}`}>
                                Contradicción {item.category}
                            </span>
                            {item.sources && item.sources.length > 0 && (
                                <div className="flex items-center gap-1.5 text-[11px] text-amber-200/70 font-mono">
                                    <span className="text-slate-400">Fuentes en colisión:</span>
                                    {item.sources.map((src, i) => (
                                        <span key={`src-${i}`} className="px-2.5 py-0.5 bg-[#08040d] rounded-lg border border-[#C5A059]/30 text-[#FFE898]">
                                            {src}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-[#08040d]/90 p-3.5 rounded-xl border border-rose-500/30 space-y-1">
                            <strong className="text-[11px] font-cinzel font-bold text-rose-300 block uppercase tracking-wider">Conflicto Identificado:</strong>
                            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-serif">{item.conflictDescription}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

LegalContradictionsCard.displayName = 'LegalContradictionsCard';

export default LegalContradictionsCard;
