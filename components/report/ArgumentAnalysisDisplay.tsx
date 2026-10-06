import React, { memo } from 'react';
import type { ArgumentAnalysis } from '../../types';
import { ShieldAlert, BookOpen, Sparkles, ChevronDown } from 'lucide-react';

const SolidityScore: React.FC<{ score: number }> = memo(({ score }) => {
    const percentage = score * 10;
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    let strokeColor = 'text-[#FFE898]';
    let glowColor = 'rgba(212,175,55,0.4)';
    if (score < 4) {
        strokeColor = 'text-rose-400';
        glowColor = 'rgba(244,63,94,0.3)';
    } else if (score < 7) {
        strokeColor = 'text-amber-400';
        glowColor = 'rgba(251,191,36,0.3)';
    }

    return (
        <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle className="text-[#180926]" strokeWidth="8" stroke="currentColor" fill="transparent" r={radius} cx="50" cy="50" />
                <circle
                    className={`${strokeColor} transition-all duration-1000 ease-out`}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="50"
                    cy="50"
                    style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
                />
            </svg>
            <div className={`absolute inset-0 flex flex-col items-center justify-center font-cinzel font-bold ${strokeColor}`}>
                <span className="text-3xl tracking-tight">{score}</span>
                <span className="text-[10px] text-amber-200/70 font-mono uppercase">/ 10 PTS</span>
            </div>
        </div>
    );
});

SolidityScore.displayName = 'SolidityScore';

const Section: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode; colorClass?: string }> = memo(({ 
    title, 
    children, 
    icon,
    colorClass = 'text-[#DFBA73]'
}) => (
    <div className="border-t border-[#C5A059]/20 pt-5 mt-5">
        <h4 className={`font-cinzel font-bold text-xs sm:text-sm flex items-center gap-2 mb-3 ${colorClass}`}>
            {icon}
            <span className="uppercase tracking-wider">{title}</span>
        </h4>
        <div className="text-xs sm:text-sm text-slate-300 space-y-2.5 leading-relaxed font-serif">{children}</div>
    </div>
));

Section.displayName = 'Section';

const ArgumentAnalysisDisplay: React.FC<{ analysis: ArgumentAnalysis }> = memo(({ analysis }) => {
    if (!analysis) return null;

    return (
        <div className="mt-6 space-y-6 animate-fade-in text-slate-100">
            <div className="relative bg-[#0e0717]/90 backdrop-blur-2xl p-6 rounded-3xl border border-[#C5A059]/40 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.08)] flex flex-col sm:flex-row items-center gap-6 overflow-hidden">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#FFE898]/50 to-transparent" />
                <SolidityScore score={analysis.solidityScore} />
                <div className="space-y-1.5 text-center sm:text-left">
                    <span className="text-[10px] font-cinzel tracking-widest text-[#DFBA73] uppercase font-bold">Evaluación Forense</span>
                    <h3 className="text-base sm:text-lg font-cinzel font-bold text-white">Análisis de Solidez Estructural</h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-serif">{analysis.solidityReasoning}</p>
                </div>
            </div>

            {analysis.identifiedCounterArguments && analysis.identifiedCounterArguments.length > 0 && (
                <Section 
                    title="Contraargumentos de la Oposición" 
                    icon={<ShieldAlert className="h-4 w-4 text-rose-400" />}
                    colorClass="text-rose-400"
                >
                    {analysis.identifiedCounterArguments.map((item, index) => (
                        <details key={`counter-${index}`} className="group bg-[#12071d]/90 p-4 rounded-2xl border border-[#C5A059]/30 hover:border-rose-500/40 transition-colors">
                            <summary className="font-cinzel font-bold text-xs sm:text-sm text-amber-100 cursor-pointer list-none flex items-center justify-between">
                                <span>{item.counterArgument}</span>
                                <ChevronDown className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform" />
                            </summary>
                            <div className="mt-3 pt-3 border-t border-[#C5A059]/20 text-xs text-slate-300 space-y-1">
                                <span className="font-cinzel font-bold text-rose-300 block uppercase text-[10px]">Estrategia de Refutación:</span> 
                                <p className="text-slate-300 font-serif">{item.rebuttalStrategy}</p>
                            </div>
                        </details>
                    ))}
                </Section>
            )}

            {analysis.supportiveJurisprudence && (
                <Section 
                    title="Soporte Jurisprudencial Grounded" 
                    icon={<BookOpen className="h-4 w-4 text-[#FFE898]" />}
                    colorClass="text-[#FFE898]"
                >
                    <div className="p-4 bg-[#12071d]/90 rounded-2xl border border-[#C5A059]/30 font-serif text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner">
                        {analysis.supportiveJurisprudence}
                    </div>
                </Section>
            )}

            {analysis.rhetoricalSuggestions && analysis.rhetoricalSuggestions.length > 0 && (
                <Section 
                    title="Sugerencias de Pulido Retórico" 
                    icon={<Sparkles className="h-4 w-4 text-[#DFBA73]" />}
                    colorClass="text-[#DFBA73]"
                >
                    <div className="space-y-2">
                        {analysis.rhetoricalSuggestions.map((suggestion, index) => (
                            <div key={`sug-${index}`} className="p-3 bg-[#12071d]/60 rounded-xl border border-[#C5A059]/20 text-xs text-slate-300 flex items-start gap-2.5">
                                <span className="font-cinzel font-bold text-[#FFE898] text-xs">0{index + 1}.</span>
                                <span className="font-serif">{suggestion}</span>
                            </div>
                        ))}
                    </div>
                </Section>
            )}
        </div>
    );
});

ArgumentAnalysisDisplay.displayName = 'ArgumentAnalysisDisplay';

export default ArgumentAnalysisDisplay;
