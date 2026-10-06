import React, { memo } from 'react';
import type { EvidentiaryInconsistency } from '../../types';
import InfoTooltip from '../InfoTooltip';
import { FileText, AlertOctagon, Sparkles, Layers } from 'lucide-react';

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

const EvidentiaryInconsistencyCard: React.FC<{ inconsistency: EvidentiaryInconsistency }> = memo(({ inconsistency }) => {
    if (!inconsistency) return null;

    return (
        <div className="relative bg-[#0e0717]/90 backdrop-blur-2xl border border-[#C5A059]/40 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(212,175,55,0.08)] p-6 md:p-8 space-y-4 overflow-hidden">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#FFE898]/50 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 text-xs font-cinzel font-bold rounded-full bg-[#8a2232]/40 text-[#FFE898] border border-[#C5A059]/50 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                    <AlertOctagon className="w-3.5 h-3.5 text-[#FFE898]" />
                    <span>INCONSISTENCIA PROBATORIA DIRECTA</span>
                </div>
            </div>

            <Section title="Afirmación Fáctica en el Documento Principal" icon={<FileText className="w-4 h-4 text-[#DFBA73]" />} titleColor="text-[#FFE898]">
                <blockquote className="border-l-2 border-[#C5A059]/60 bg-[#12071d]/90 pl-4 py-2.5 rounded-r-xl text-amber-100/90 italic text-xs font-serif">
                    "{inconsistency.claimInDocument}"
                </blockquote>
            </Section>

            <Section title="Prueba Contradictoria en Expediente" icon={<Layers className="w-4 h-4 text-[#DFBA73]" />} titleColor="text-[#FFE898]">
                <blockquote className="border-l-2 border-[#DFBA73] bg-[#12071d]/90 pl-4 py-3 rounded-r-2xl text-amber-200/90 italic text-xs">
                    <p className="font-serif leading-relaxed">"{inconsistency.contradictoryEvidenceExcerpt}"</p>
                    <footer className="text-[11px] text-right text-[#DFBA73] font-mono font-bold mt-2 pt-1 border-t border-[#C5A059]/20">
                        Fuente Probatoria: {inconsistency.evidenceFileName}
                    </footer>
                </blockquote>
            </Section>

            <Section title="Análisis de la Inconsistencia" icon={<Sparkles className="w-4 h-4 text-[#DFBA73]" />} titleColor="text-[#FFE898]">
                <p className="text-slate-300 bg-[#12071d]/60 p-3.5 rounded-xl border border-[#C5A059]/20 text-xs sm:text-sm font-serif leading-relaxed">{inconsistency.analysis}</p>
            </Section>
        </div>
    );
});

EvidentiaryInconsistencyCard.displayName = 'EvidentiaryInconsistencyCard';

export default EvidentiaryInconsistencyCard;
