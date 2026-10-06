import React, { memo } from 'react';
import type { NarrativeAnalysis } from '../types';
import { BookOpen, User, Users, Compass, Eye, ShieldAlert, Award } from 'lucide-react';

interface NarrativeAnalysisCardProps {
  analysis: NarrativeAnalysis;
}

const Section: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="border-t border-[#C5A059]/30 pt-5 mt-5 first:border-0 first:pt-0 first:mt-0">
        <div className="flex items-center text-[#f5d76e] mb-3 gap-2.5">
            <div className="p-2 bg-[#2a133d] rounded-xl border border-[#C5A059]/50 text-[#f5d76e] shadow-sm">
                {icon}
            </div>
            <h4 className="font-cinzel font-bold text-sm tracking-wide text-white">{title}</h4>
        </div>
        <div className="text-xs sm:text-sm text-slate-300 space-y-2 leading-relaxed font-garamond italic text-base pl-2">
            {children}
        </div>
    </div>
);

const NarrativeAnalysisCard: React.FC<NarrativeAnalysisCardProps> = ({ analysis }) => {
    return (
        <div className="court-gold-frame p-6 sm:p-8 text-slate-100 space-y-4">
            <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-[#C5A059]/30">
                <div className="p-3 bg-[#2a133d] text-[#f5d76e] rounded-2xl border border-[#C5A059]/50 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                    <BookOpen className="h-6 w-6 text-[#f5d76e]" />
                </div>
                <div>
                    <span className="text-[10px] font-cinzel tracking-widest text-[#f5d76e] uppercase font-bold block">
                        COGNITIVE & BEHAVIORAL PROFILING • PERFILES DE DECISIÓN
                    </span>
                    <h3 className="text-xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFFDF0] via-[#E8CA7A] to-[#C5A059] tracking-wide mt-0.5">
                        Análisis Narrativo y de Actores
                    </h3>
                </div>
            </div>

            <Section
                title="La Historia Inferida del Caso"
                icon={<Compass className="h-4 w-4 text-[#f5d76e]" />}
            >
                <p className="bg-[#12071d]/80 p-4 rounded-2xl border border-[#8a6827]/40 shadow-inner not-italic font-garamond text-base text-slate-200">
                    {analysis.inferredStory}
                </p>
            </Section>
            
            <Section
                title="Perfil del Decisor (Inferido)"
                icon={<User className="h-4 w-4 text-[#f5d76e]" />}
            >
                <p className="bg-[#12071d]/80 p-4 rounded-2xl border border-[#8a6827]/40 shadow-inner not-italic font-garamond text-base text-slate-200">
                    {analysis.decisionMakerProfile}
                </p>
            </Section>

            {analysis.stakeholderAnalysis && analysis.stakeholderAnalysis.length > 0 && (
                <Section
                    title={`Análisis de Actores Clave (${analysis.stakeholderAnalysis.length} Stakeholders)`}
                    icon={<Users className="h-4 w-4 text-[#f5d76e]" />}
                >
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                       {analysis.stakeholderAnalysis.map((stakeholder, index) => (
                           <div key={index} className="p-4 bg-[#12071d]/90 border border-[#8a6827]/50 rounded-2xl space-y-2 hover:border-[#DFBA73] transition-colors shadow-inner">
                               <div className="flex items-center justify-between">
                                   <h5 className="font-cinzel font-bold text-white text-xs sm:text-sm">{stakeholder.actor}</h5>
                                   <span className="px-2.5 py-0.5 bg-[#2a133d] text-[10px] font-cinzel font-bold text-[#f5d76e] rounded-md border border-[#C5A059]/40">
                                       {stakeholder.role}
                                   </span>
                               </div>
                               <div className="space-y-1.5 text-xs pt-1 font-sans">
                                 <p className="flex items-start gap-1.5">
                                     <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                     <span><strong className="text-emerald-300 font-cinzel font-bold">Intereses Visibles:</strong> <span className="text-slate-300">{stakeholder.visibleInterests}</span></span>
                                 </p>
                                 <p className="flex items-start gap-1.5">
                                     <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                     <span><strong className="text-amber-300 font-cinzel font-bold">Intereses Ocultos (Hipótesis):</strong> <span className="text-slate-300">{stakeholder.hiddenInterests}</span></span>
                                 </p>
                               </div>
                           </div>
                       ))}
                   </div>
                </Section>
            )}
        </div>
    );
};

export default memo(NarrativeAnalysisCard);