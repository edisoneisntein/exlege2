import React, { memo } from 'react';
import type { PredictiveAnalysis } from '../types';
import InfoTooltip from './InfoTooltip';
import { TrendingUp, Target, Lightbulb, Activity, ShieldCheck, Scale } from 'lucide-react';

const SuccessProbabilityMeter: React.FC<{ probability: number }> = memo(({ probability }) => {
    const getMeterColor = (p: number) => {
        if (p < 40) return 'from-rose-500 to-red-600 shadow-[0_0_15px_rgba(244,63,94,0.5)]';
        if (p < 70) return 'from-[#C5A059] to-[#DFBA73] shadow-[0_0_15px_rgba(212,175,55,0.5)]';
        return 'from-emerald-400 to-[#E8CA7A] shadow-[0_0_15px_rgba(16,185,129,0.5)]';
    };

    const colorClass = getMeterColor(probability);

    return (
        <div className="w-full">
            <div className="flex justify-between text-[10px] font-cinzel font-bold text-[#f5d76e]/70 mb-1.5 uppercase tracking-wider">
                <span>Baja</span>
                <span>Media</span>
                <span>Alta</span>
            </div>
            <div className="w-full bg-[#08040d] border border-[#8a6827]/60 rounded-full h-3.5 p-0.5 overflow-hidden shadow-inner">
                <div
                    className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-1000 ease-out`}
                    style={{ width: `${probability}%` }}
                ></div>
            </div>
             <div className="text-center mt-4">
                <span className="text-3xl sm:text-4xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFFDF0] via-[#E8CA7A] to-[#C5A059] tracking-tight">
                    {probability}%
                </span>
                <p className="text-xs font-cinzel font-bold text-amber-200/70 mt-1 uppercase tracking-wider">
                    Probabilidad de Prosperidad del Recurso
                </p>
            </div>
        </div>
    );
});

SuccessProbabilityMeter.displayName = 'SuccessProbabilityMeter';

const PredictiveAnalysisCard: React.FC<{ analysis: PredictiveAnalysis }> = ({ analysis }) => {
    return (
        <div className="court-gold-frame p-6 sm:p-8 text-slate-100 space-y-6">
            <div className="flex items-center space-x-4 pb-5 border-b border-[#C5A059]/30">
                <div className="p-3 bg-[#2a133d] text-[#f5d76e] rounded-2xl border border-[#C5A059]/50 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                    <TrendingUp className="h-6 w-6 text-[#f5d76e]" />
                </div>
                <div>
                    <span className="text-[10px] font-cinzel tracking-widest text-[#f5d76e] uppercase font-bold block">
                        FORENSIC PROBABILITY ENGINE • ANÁLISIS PROSPECTIVO
                    </span>
                    <h3 className="text-xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFFDF0] via-[#E8CA7A] to-[#C5A059] tracking-wide flex items-center gap-2 mt-0.5">
                        Análisis Predictivo de Éxito Procesal
                        <InfoTooltip text="Esta es una estimación generada por el protocolo analítico, basada en la tipología y gravedad de vulnerabilidades detectadas en el expediente." />
                    </h3>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 flex flex-col items-center justify-center p-6 bg-[#12071d]/90 border border-[#8a6827]/50 rounded-2xl shadow-inner">
                   <SuccessProbabilityMeter probability={analysis.estimatedSuccessProbability} />
                </div>
                <div className="md:col-span-2 space-y-4">
                    <div>
                        <h4 className="font-cinzel font-bold text-[#f5d76e] mb-2.5 text-xs uppercase tracking-wider flex items-center gap-2">
                            <Target className="w-4 h-4 text-[#f5d76e]" />
                            Puntos de Fricción Clave
                        </h4>
                        <div className="space-y-2.5">
                            {analysis.keyFrictionPoints.map(point => (
                                <div key={point.criticalPointId} className="p-3.5 bg-[#12071d]/80 border-l-4 border-[#C5A059] border-y border-r border-[#8a6827]/40 rounded-r-xl shadow-inner">
                                    <p className="font-cinzel font-bold text-xs sm:text-sm text-[#f5d76e]">{point.criticalPointType}</p>
                                    <p className="text-xs text-slate-300 font-garamond italic text-base mt-1 leading-relaxed">{point.reason}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-cinzel font-bold text-emerald-400 mb-2 text-xs uppercase tracking-wider flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-emerald-400" />
                            Recomendación Estratégica Proactiva
                        </h4>
                        <p className="text-xs sm:text-sm text-amber-100/90 bg-[#12071d]/90 p-4 rounded-2xl border border-emerald-500/30 leading-relaxed font-garamond italic text-base shadow-inner">
                            {analysis.strategicRecommendation}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(PredictiveAnalysisCard);