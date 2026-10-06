import React, { memo } from 'react';
import type { LegalActionProposal, CaseDocumentType } from '../types';
import Card from './Card';
import HelpButton from './HelpButton';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Crown, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles,
  ScrollText
} from 'lucide-react';

interface StrategyProposalStepProps {
    proposals: LegalActionProposal[];
    onSelect: (docType: CaseDocumentType) => void;
    onBack: () => void;
}

const StrategyProposalStep: React.FC<StrategyProposalStepProps> = ({ proposals, onSelect, onBack }) => {
    if (proposals.length === 0) {
        return (
             <div className="text-center p-12 bg-[#12071d] rounded-3xl border border-[#C5A059]/40 shadow-2xl">
                <h2 className="text-xl font-bold font-cinzel text-white">Sintetizando Propuestas Soberanas...</h2>
                <p className="text-amber-200/60 mt-2 font-serif text-sm">Un momento mientras el consejo de magistrados evalúa las vertientes del caso.</p>
                <div className="w-8 h-8 border-2 border-[#C5A059]/30 border-t-[#FFE898] rounded-full animate-spin mx-auto mt-6" />
            </div>
        );
    }
    
    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
             <div className="flex justify-between items-center pb-2">
                <motion.button 
                    whileHover={{ x: -4 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={onBack} 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#180926]/90 border border-[#C5A059]/40 text-xs font-cinzel font-bold text-[#f5d76e] hover:text-white hover:border-[#FFE898] transition-all shadow-md"
                >
                    <ArrowLeft className="w-3.5 h-3.5 text-[#f5d76e]" />
                    <span>Volver a la narración fáctica</span>
                </motion.button>
                <HelpButton />
            </div>

            <Card
                title="Consejo de Estrategia Judicial: Propuestas Fácticas"
                icon={<Crown className="w-6 h-6 text-[#f5d76e]" />}
                badge={
                    <span className="text-[10px] font-cinzel font-bold px-2.5 py-0.5 rounded-full bg-[#8a2232]/30 text-[#FFE898] border border-[#C5A059]/50">
                        {proposals.length} CURSOS FORMULADOS
                    </span>
                }
            >
                <p className="text-amber-100/80 text-xs sm:text-sm mb-6 leading-relaxed font-serif">
                    El motor de inteligencia jurídica ha analizado la teoría fáctica y estructurado los siguientes cursos de acción. Revise las ventajas jurídicas y riesgos procesales de cada opción y seleccione el vector decisivo.
                </p>

                <div className="space-y-6">
                    {proposals.map((proposal, index) => (
                        <div 
                            key={index} 
                            className="p-6 sm:p-7 bg-[#180926]/90 rounded-3xl border border-[#C5A059]/40 hover:border-[#FFE898]/70 shadow-[0_10px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(212,175,55,0.08)] transition-all duration-300 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C5A059]/10 to-transparent pointer-events-none rounded-bl-full" />
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div>
                                    <span className="text-[10px] font-cinzel font-bold tracking-widest text-[#f5d76e] uppercase">
                                        Estrategia #{index + 1}
                                    </span>
                                    <h3 className="text-lg sm:text-xl font-black font-cinzel text-white group-hover:text-[#FFE898] transition-colors mt-0.5">
                                        {proposal.titulo}
                                    </h3>
                                </div>
                                <span className="text-[11px] font-cinzel px-3 py-1 rounded-full bg-[#8a2232]/30 border border-[#C5A059]/40 text-[#FFE898] font-bold whitespace-nowrap">
                                    {proposal.tipo_documento_sugerido}
                                </span>
                            </div>

                            <p className="text-amber-100/80 text-xs sm:text-sm mb-5 leading-relaxed font-serif">
                                {proposal.descripcion}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                                <div className="bg-[#12071d]/90 p-4 rounded-2xl border border-emerald-500/30">
                                    <h4 className="font-cinzel font-bold text-emerald-400 mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        <span>Ventajas Estratégicas</span>
                                    </h4>
                                    <ul className="space-y-1.5 text-amber-100/90 font-serif text-xs">
                                        {proposal.ventajas.map((pro, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="text-emerald-400 font-bold">•</span>
                                                <span>{pro}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-[#12071d]/90 p-4 rounded-2xl border border-rose-500/30">
                                    <h4 className="font-cinzel font-bold text-rose-400 mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                                        <span>Riesgos & Contingencias</span>
                                    </h4>
                                    <ul className="space-y-1.5 text-amber-100/90 font-serif text-xs">
                                         {proposal.riesgos.map((con, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="text-rose-400 font-bold">•</span>
                                                <span>{con}</span>
                                            </li>
                                         ))}
                                    </ul>
                                </div>
                            </div>
                            
                            <div className="mt-6 flex justify-end">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onSelect(proposal.tipo_documento_sugerido)}
                                    className="inline-flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-[#8a2232] to-[#59143a] hover:from-[#a32a3c] hover:to-[#6d1a47] text-white font-cinzel font-bold text-xs sm:text-sm rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_20px_rgba(212,175,55,0.2)] border border-[#FFE898]/60 transition-all"
                                >
                                    <span>Proceder con esta Estrategia</span>
                                    <ChevronRight className="w-4 h-4 text-[#FFE898]" />
                                </motion.button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default memo(StrategyProposalStep);
