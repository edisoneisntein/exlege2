import React, { memo } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import type { ComparativeFinding } from '../types';
import Card from './Card';
import PageLoader from './PageLoader';
import HelpButton from './HelpButton';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  RotateCcw, 
  GitCompare, 
  Sparkles, 
  ArrowLeft,
  Quote,
  Scale
} from 'lucide-react';

interface FindingListProps {
    title: string;
    findings: Omit<ComparativeFinding, 'id'>[];
    icon: React.ReactNode;
    colorScheme: 'emerald' | 'rose' | 'amber';
    badgeLabel: string;
}

const FindingList: React.FC<FindingListProps> = memo(({ title, findings, icon, colorScheme, badgeLabel }) => {
    const colorStyles = {
        emerald: {
            border: 'border-emerald-500/30',
            quoteA: 'border-l-[#DFBA73] bg-[#2a133d]/40 text-amber-100',
            quoteB: 'border-l-emerald-400 bg-emerald-950/20 text-emerald-200',
            tag: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        },
        rose: {
            border: 'border-rose-500/30',
            quoteA: 'border-l-[#DFBA73] bg-[#2a133d]/40 text-amber-100',
            quoteB: 'border-l-rose-400 bg-rose-950/20 text-rose-200',
            tag: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        },
        amber: {
            border: 'border-amber-500/30',
            quoteA: 'border-l-amber-400 bg-amber-950/20 text-amber-200',
            quoteB: 'border-l-[#C5A059] bg-[#180926] text-slate-200',
            tag: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        }
    }[colorScheme];

    if (findings.length === 0) {
        return (
            <Card 
                title={title} 
                icon={icon}
                badge={
                    <span className={`text-[10px] font-cinzel px-2.5 py-0.5 rounded-full border ${colorStyles.tag}`}>
                        {badgeLabel} (0)
                    </span>
                }
            >
                <p className="text-xs font-garamond text-amber-200/60 italic">No se detectaron hallazgos en esta categoría procesal.</p>
            </Card>
        );
    }

    return (
        <Card 
            title={title} 
            icon={icon}
            badge={
                <span className={`text-[10px] font-cinzel font-bold px-2.5 py-0.5 rounded-full border ${colorStyles.tag}`}>
                    {badgeLabel} ({findings.length})
                </span>
            }
        >
            <div className="space-y-4 font-garamond">
                {findings.map((finding, index) => (
                    <div key={index} className="p-4 sm:p-5 bg-[#0e0717]/90 rounded-2xl border border-[#C5A059]/30 text-xs sm:text-sm space-y-3 shadow-inner">
                        <div>
                            <p className="font-cinzel font-bold text-[#FFE898] text-[11px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <Quote className="w-3.5 h-3.5 text-[#DFBA73]" />
                                <span>Afirmación en Documento A:</span>
                            </p>
                            <blockquote className={`border-l-2 p-3 rounded-r-xl text-xs sm:text-sm italic ${colorStyles.quoteA}`}>
                                "{finding.claimInDocA}"
                            </blockquote>
                        </div>
                        {finding.claimInDocB && (
                            <div>
                                <p className="font-cinzel font-bold text-[#E8CA7A] text-[11px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <Quote className="w-3.5 h-3.5 text-[#DFBA73]" />
                                    <span>Afirmación en Documento B:</span>
                                </p>
                                <blockquote className={`border-l-2 p-3 rounded-r-xl text-xs sm:text-sm italic ${colorStyles.quoteB}`}>
                                    "{finding.claimInDocB}"
                                </blockquote>
                            </div>
                        )}
                         <div className="pt-2.5 border-t border-[#C5A059]/20">
                            <p className="font-cinzel font-bold text-white text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-[#FFE898]" />
                                <span>Dictamen & Deconstrucción Cognitiva:</span>
                            </p>
                            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed pl-1">{finding.analysis}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
});

const ComparativeReportStep: React.FC = () => {
    const { comparativeAnalysisResult, goBack, fullReset, isLoading } = useAnalysis();

    if (isLoading && !comparativeAnalysisResult) {
        return <PageLoader />;
    }

    if (!comparativeAnalysisResult) {
        return (
            <div className="text-center p-8 bg-[#12071d]/90 border border-rose-500/40 rounded-3xl backdrop-blur-2xl max-w-lg mx-auto space-y-4">
                <h2 className="text-xl font-bold text-rose-300 font-cinzel">Error en el Análisis Comparativo</h2>
                <p className="text-amber-200/70 text-xs font-garamond">No se pudo generar el informe comparativo cruzado. Por favor, reintente la operación.</p>
                <button onClick={goBack} className="px-5 py-2 bg-[#1a0c26] border border-[#C5A059]/50 text-[#FFE898] rounded-xl font-cinzel text-xs hover:border-[#FFE898]">Volver al Cockpit</button>
            </div>
        );
    }
    
    const { agreedFacts, disputedFacts, unansweredArguments } = comparativeAnalysisResult;

    return (
        <div className="space-y-6 max-w-5xl mx-auto py-2">
            {/* Top Navigation Bar */}
            <div className="flex justify-between items-center pb-2">
                <motion.button 
                    whileHover={{ x: -4 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={fullReset} 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#180926]/90 border border-[#C5A059]/40 text-xs font-cinzel font-bold text-[#f5d76e] hover:text-white hover:border-[#FFE898] transition-all shadow-md"
                >
                    <ArrowLeft className="w-3.5 h-3.5 text-[#f5d76e]" />
                    <span>Retornar al Cockpit</span>
                </motion.button>
                <HelpButton />
            </div>

            <div className="space-y-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8a2232]/30 border border-[#C5A059]/40 text-[#FFE898] text-xs font-cinzel font-bold">
                    <GitCompare className="w-3.5 h-3.5 text-[#DFBA73]" />
                    <span>DICTAMEN COMPARATIVO FORENSE</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFFDF0] via-[#E8CA7A] to-[#C5A059] tracking-wide">
                    Confrontación y Mapa de Fricción Procesal
                </h2>
            </div>

            <FindingList
                title="Hechos Coincidentes (Puntos Pacíficos)"
                findings={agreedFacts}
                colorScheme="emerald"
                badgeLabel="COINCIDENCIAS"
                icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            />
            <FindingList
                title="Hechos en Discrepancia & Falsedad Probatoria"
                findings={disputedFacts}
                colorScheme="rose"
                badgeLabel="DISCREPANCIAS"
                icon={<AlertTriangle className="w-5 h-5 text-rose-400" />}
            />
             <FindingList
                title="Argumentos Sin Respuesta (Falta de Contradicción)"
                findings={unansweredArguments}
                colorScheme="amber"
                badgeLabel="SIN CONTESTAR"
                icon={<HelpCircle className="w-5 h-5 text-amber-400" />}
            />
            
            <div className="mt-8 pt-6 border-t border-[#C5A059]/30 flex justify-center">
                <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={fullReset} 
                    className="flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-[#DFBA73] via-[#FFE898] to-[#C5A059] hover:from-[#FFE898] hover:to-[#DFBA73] text-[#08040d] font-cinzel font-bold text-xs sm:text-sm rounded-2xl shadow-[0_0_25px_rgba(212,175,55,0.35)] transition-all"
                >
                    <RotateCcw className="w-4 h-4 text-[#08040d]" />
                    <span>Iniciar Nuevo Análisis Forense (Cockpit)</span>
                </motion.button>
            </div>
        </div>
    );
};

export default ComparativeReportStep;
