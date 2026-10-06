import React, { memo, useState, useCallback, useRef } from 'react';
import type { AppWorkflow } from '../types';
import { useAnalysis } from '../context/AnalysisContext';
import { resolveJurisdictionPack } from '../services/governance/jurisdictionPacks';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  FileSearch2, 
  Scale, 
  Gavel, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Send, 
  Mic, 
  ChevronRight, 
  Award,
  BookOpen,
  ArrowRight,
  SlidersHorizontal,
  Flame,
  Check
} from 'lucide-react';

import courtMedallionImg from '../src/assets/images/court_medallion_justice_1788314381677.jpg';
import waxSealImg from '../src/assets/images/notarial_wax_seal_1788314394405.jpg';
import courtPillarImg from '../src/assets/images/court_corinthian_pillar_1788314434760.jpg';

interface EntryStepProps {
    readonly onSelectWorkflow: (workflow: AppWorkflow) => void;
}

export const EntryStep: React.FC<EntryStepProps> = memo(({ onSelectWorkflow }) => {
    const { activeJurisdiction, toggleConfigModal, setNarrativeText } = useAnalysis();
    const currentPack = resolveJurisdictionPack(activeJurisdiction || 'CO');
    const [activeHover, setActiveHover] = useState<'design' | 'upload' | 'comparative'>('upload');
    const [quickPrompt, setQuickPrompt] = useState<string>('');
    const [hasError, setHasError] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handlePromptSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        const trimmedPrompt = quickPrompt.trim();
        if (!trimmedPrompt) {
            setHasError(true);
            if (inputRef.current) {
                inputRef.current.focus();
            }
            setTimeout(() => setHasError(false), 2000);
            return;
        }

        // Store narrative text in global analysis context
        setNarrativeText(trimmedPrompt);
        setQuickPrompt('');
        setHasError(false);

        // Transition seamlessly into narrative workflow
        onSelectWorkflow('design');
    }, [quickPrompt, setNarrativeText, onSelectWorkflow]);

    return (
        <div className="relative w-full max-w-[1400px] mx-auto py-4 px-2 sm:px-4 lg:px-6 select-none">
            
            {/* Flanking Stately Corinthian Gold Columns on Desktop */}
            <div className="hidden 2xl:block fixed left-2 top-20 bottom-10 w-24 pointer-events-none z-0 opacity-40">
                <img 
                    src={courtPillarImg} 
                    alt="Columna Imperial Izquierda" 
                    className="w-full h-full object-contain filter drop-shadow-[0_0_25px_rgba(212,175,55,0.3)]"
                    referrerPolicy="no-referrer"
                />
            </div>
            <div className="hidden 2xl:block fixed right-2 top-20 bottom-10 w-24 pointer-events-none z-0 opacity-40 scale-x-[-1]">
                <img 
                    src={courtPillarImg} 
                    alt="Columna Imperial Derecha" 
                    className="w-full h-full object-contain filter drop-shadow-[0_0_25px_rgba(212,175,55,0.3)]"
                    referrerPolicy="no-referrer"
                />
            </div>

            {/* Ambient Background Velvet and Gold Illumination */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-4/5 h-80 bg-gradient-to-b from-amber-500/15 via-purple-900/20 to-transparent blur-3xl pointer-events-none rounded-full" />
            <div className="absolute top-1/3 -right-24 w-96 h-96 bg-purple-950/40 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-10 -left-24 w-96 h-96 bg-amber-900/20 rounded-full blur-[140px] pointer-events-none" />

            {/* Grand Monumental Header: EX LEGE — SOVEREIGN COURT */}
            <div className="text-center space-y-2 relative z-10 pt-2 pb-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-cinzel font-black tracking-[0.22em] text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF0] via-[#E8CA7A] to-[#A37B2E] drop-shadow-[0_4px_25px_rgba(212,175,55,0.4)]">
                        EX LEGE
                    </h1>
                    
                    <div className="flex items-center justify-center gap-3 mt-2">
                        <span className="h-px w-12 sm:w-24 bg-gradient-to-r from-transparent to-[#D4AF37]" />
                        <p className="font-cinzel text-xs sm:text-sm lg:text-base tracking-[0.28em] text-[#D8B668] font-bold uppercase drop-shadow">
                            SOVEREIGN COURT — THE SUPREME COURT PROTOCOL
                        </p>
                        <span className="h-px w-12 sm:w-24 bg-gradient-to-l from-transparent to-[#D4AF37]" />
                    </div>

                    {/* Authentication Status Bar */}
                    <div className="flex items-center justify-center gap-4 sm:gap-8 mt-3 text-[11px] font-cinzel font-semibold tracking-wider text-amber-200/80 uppercase">
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_8px_#D4AF37]" />
                            AUTENTICACIÓN NOTARIAL ACTIVA
                        </span>
                        <span className="text-amber-500/50">•</span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                            TRAZABILIDAD LEGAL VINCULANTE
                        </span>
                        <span className="text-amber-500/50 hidden sm:inline">•</span>
                        <span className="hidden sm:inline text-amber-300/90 font-mono text-[10px]">
                            {currentPack.flag} {currentPack.name} ({currentPack.code})
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Sovereign Court Stage: 3-Column Grand Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch relative z-10">
                
                {/* LEFT COLUMN: PROTOCOLOS DE LITIGACIÓN ESTRATÉGICA (4 Cols) */}
                <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
                    
                    {/* Section Title Pill */}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1d0d2b]/80 border border-[#8a6827]/60 shadow-[0_4px_15px_rgba(0,0,0,0.6)] backdrop-blur-md">
                        <div className="p-1 rounded bg-[#d4af37]/20 text-[#f5d76e]">
                            <Award className="w-4 h-4" />
                        </div>
                        <span className="font-cinzel text-xs font-bold tracking-widest text-[#f5d76e] uppercase">
                            Protocolos de Litigación Estratégica
                        </span>
                    </div>

                    {/* Card 1: Diseñar Estrategia desde Cero */}
                    <motion.div
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onMouseEnter={() => setActiveHover('design')}
                        onClick={() => onSelectWorkflow('design')}
                        className={`group relative p-5 rounded-2xl cursor-pointer transition-all duration-300 court-gold-frame ${
                            activeHover === 'design' ? 'court-gold-frame-active ring-1 ring-[#e6ca65]' : 'hover:border-[#DFBA73]'
                        }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2a133d] to-[#12071a] border border-[#d4af37]/70 flex items-center justify-center text-[#f5d76e] group-hover:scale-110 group-hover:border-[#ffeaa7] transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] flex-shrink-0">
                                <Gavel className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-cinzel text-sm sm:text-base font-bold text-white group-hover:text-[#f7e7a9] transition-colors">
                                        Diseñar Estrategia desde Cero
                                    </h3>
                                    <ChevronRight className="w-4 h-4 text-[#C5A059] group-hover:translate-x-1 transition-transform" />
                                </div>
                                <p className="font-garamond text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed italic">
                                    Construye un argumento desde cero con análisis predictivo, teoría del caso y precedentes vinculantes.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: Analizar un Documento Existente */}
                    <motion.div
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onMouseEnter={() => setActiveHover('upload')}
                        onClick={() => onSelectWorkflow('upload')}
                        className={`group relative p-5 rounded-2xl cursor-pointer transition-all duration-300 court-gold-frame ${
                            activeHover === 'upload' ? 'court-gold-frame-active ring-2 ring-[#e6ca65]' : 'hover:border-[#DFBA73]'
                        }`}
                    >
                        <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#8a2232] to-[#b32d43] border border-[#ff8597] text-[9px] font-cinzel font-bold text-white tracking-widest uppercase shadow-md">
                            PROTOCOLO PRINCIPAL
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2a133d] to-[#12071a] border border-[#d4af37] flex items-center justify-center text-[#f5d76e] group-hover:scale-110 group-hover:border-[#ffeaa7] transition-all shadow-[0_0_20px_rgba(212,175,55,0.35)] flex-shrink-0">
                                <FileSearch2 className="w-6 h-6 text-[#f5d76e]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-cinzel text-sm sm:text-base font-bold text-white group-hover:text-[#f7e7a9] transition-colors">
                                        Analizar un Documento Existente
                                    </h3>
                                    <ChevronRight className="w-4 h-4 text-[#C5A059] group-hover:translate-x-1 transition-transform" />
                                </div>
                                <p className="font-garamond text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed italic">
                                    Sube y examina contratos, demandas, contestaciones o fallos judiciales con validación notarial y auditoría pre-flight.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 3: Análisis Comparativo */}
                    <motion.div
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onMouseEnter={() => setActiveHover('comparative')}
                        onClick={() => onSelectWorkflow('comparative')}
                        className={`group relative p-5 rounded-2xl cursor-pointer transition-all duration-300 court-gold-frame ${
                            activeHover === 'comparative' ? 'court-gold-frame-active ring-1 ring-[#e6ca65]' : 'hover:border-[#DFBA73]'
                        }`}
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2a133d] to-[#12071a] border border-[#d4af37]/70 flex items-center justify-center text-[#f5d76e] group-hover:scale-110 group-hover:border-[#ffeaa7] transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] flex-shrink-0">
                                <Scale className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-cinzel text-sm sm:text-base font-bold text-white group-hover:text-[#f7e7a9] transition-colors">
                                        Análisis Comparativo
                                    </h3>
                                    <ChevronRight className="w-4 h-4 text-[#C5A059] group-hover:translate-x-1 transition-transform" />
                                </div>
                                <p className="font-garamond text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed italic">
                                    Compara jurisprudencia, piezas contradictorias y recursos de alzada con cotejo adversarial y trazabilidad vinculante.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Bottom Class-I Seal Certificate */}
                    <div className="p-3 rounded-xl bg-[#140a1e]/90 border border-[#C5A059]/40 flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-slate-950 font-bold text-[10px] shadow">
                                ★
                            </div>
                            <div>
                                <span className="font-cinzel font-bold text-[10px] text-[#f5d76e] block tracking-wider">
                                    CERT. AUTENTICADO — TRIBUNAL SUPREMO
                                </span>
                                <span className="text-[9px] font-mono text-slate-400 block">
                                    VALOR JURÍDICO PROBATORIO: CLASE-I
                                </span>
                            </div>
                        </div>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>

                </div>

                {/* CENTER COLUMN: GRAND SOVEREIGN MEDALLION (4 Cols) */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-2 sm:p-4">
                    
                    {/* The Grand Gold Medallion of Lady Justice */}
                    <div className="relative group cursor-pointer" onClick={() => onSelectWorkflow('upload')}>
                        {/* Shimmering Aura */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-[#DFBA73]/30 via-[#A37B2E]/40 to-[#DFBA73]/30 rounded-full blur-2xl animate-pulse pointer-events-none" />
                        
                        {/* Medallion Circle Box */}
                        <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-full p-2.5 bg-gradient-to-tr from-[#684b1b] via-[#DFBA73] to-[#FFF6D5] shadow-[0_0_60px_rgba(212,175,55,0.45),0_20px_50px_rgba(0,0,0,0.9)] transition-transform duration-700 group-hover:scale-105">
                            <div className="w-full h-full rounded-full overflow-hidden relative bg-[#13081e] border-2 border-[#FFE898]">
                                <img 
                                    src={courtMedallionImg} 
                                    alt="Medallón de Justicia Suprema - Lex Iustitia Sovereignitas" 
                                    className="w-full h-full object-cover filter contrast-125 brightness-105"
                                    referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#140620]/70 via-transparent to-[#FFE898]/10 pointer-events-none" />
                            </div>
                        </div>

                        {/* Hanging Wax Seals Ribbons Cluster below medallion */}
                        <div className="flex justify-center items-center gap-2 -mt-6 relative z-20">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9c1b2f] to-[#590915] border border-[#ff8597] shadow-lg flex items-center justify-center text-[10px] text-amber-200 font-cinzel font-bold">
                                ⚜
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c49735] to-[#6d4f13] border border-[#ffea9f] shadow-lg flex items-center justify-center text-xs text-slate-950 font-bold">
                                ⚖
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9c1b2f] to-[#590915] border border-[#ff8597] shadow-lg flex items-center justify-center text-[10px] text-amber-200 font-cinzel font-bold">
                                ⚔
                            </div>
                        </div>
                    </div>

                    {/* Subtitle Caption */}
                    <div className="mt-5 space-y-1">
                        <p className="font-cinzel text-xs sm:text-sm font-bold tracking-[0.2em] text-[#F5E298] uppercase">
                            PROTOCOLO SUPREMO // NIVEL SOVEREIGN
                        </p>
                        <p className="font-mono text-[10px] sm:text-[11px] text-amber-400/80 tracking-widest uppercase">
                            REGISTRO INMUTABLE • BLOCKCHAIN JURÍDICO V5
                        </p>
                    </div>

                </div>

                {/* RIGHT COLUMN: SELLO NOTARIAL IMPERIAL & MOTOR COGNITIVO (4 Cols) */}
                <div className="lg:col-span-4 flex flex-col justify-between court-panel-velvet p-6 rounded-3xl border border-[#C5A059]/50 shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative overflow-hidden">
                    
                    {/* Top Ornate Gold Border Line */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#FFE898] to-transparent" />
                    
                    {/* Top Seal Section */}
                    <div className="text-center space-y-3">
                        <span className="font-cinzel text-xs font-black tracking-[0.2em] text-[#f5d76e] uppercase block">
                            SELLO NOTARIAL IMPERIAL
                        </span>

                        {/* Real 3D Wax Seal Image */}
                        <div className="relative flex justify-center items-center py-1">
                            <motion.div 
                                animate={{ rotate: [0, 1.5, 0, -1.5, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                                className="w-32 h-32 sm:w-36 sm:h-36 relative"
                            >
                                <img 
                                    src={waxSealImg} 
                                    alt="Sello Notarial Imperial de Autenticidad" 
                                    className="w-full h-full object-contain filter drop-shadow-[0_10px_25px_rgba(156,27,47,0.6)]"
                                    referrerPolicy="no-referrer"
                                />
                            </motion.div>
                        </div>

                        {/* Gold Ribbon Tag */}
                        <div className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-[#6b4e18] via-[#DFBA73] to-[#6b4e18] border border-[#FFE898] shadow-md">
                            <span className="font-cinzel text-[10px] font-black text-slate-950 tracking-widest uppercase">
                                CERTIFICADO DE AUTENTICIDAD
                            </span>
                        </div>
                    </div>

                    {/* Middle Section: Motor Cognitivo Telemetry */}
                    <div className="my-5 p-4 rounded-2xl bg-[#0e0617]/90 border border-[#8a6827]/40 text-xs font-mono space-y-2.5 shadow-inner">
                        <div className="flex items-center justify-between pb-2 border-b border-[#3b2352]">
                            <span className="font-cinzel font-bold text-[#f5d76e] text-[11px] uppercase tracking-wider">
                                MOTOR COGNITIVO — ESTADO
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                ACTIVO
                            </span>
                        </div>

                        <div className="space-y-1.5 text-[11px]">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Estado:</span>
                                <span className="text-amber-200 font-bold">SUPREMO <span className="text-emerald-400 font-normal">(OPERATIVO)</span></span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Cifrado:</span>
                                <span className="text-[#FFE898] font-mono flex items-center gap-1">
                                    <Lock className="w-3 h-3 text-[#DFBA73]" />
                                    SUPREME-AES256-QKD
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Trazabilidad:</span>
                                <span className="text-emerald-300 flex items-center gap-1 font-bold">
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    CADENA NOTARIAL VERIFICADA
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-[#3b2352]/60">
                                <span className="text-slate-400">Integridad Hash:</span>
                                <span className="text-slate-300 font-mono text-[10px]">0x4B8F...29E1</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Registration Banner */}
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#2a133d] to-[#170a24] border border-[#d4af37]/60 text-center shadow-md">
                        <span className="font-cinzel text-[10px] font-extrabold text-[#f5d76e] tracking-widest uppercase block">
                            REGISTRADO — NOTARÍA SUPREMA Nº 0006/SOV
                        </span>
                    </div>

                </div>

            </div>

            {/* Bottom Command Prompt Bar: Exactly matching the sovereign mockup */}
            <div className="pt-6 max-w-5xl mx-auto relative z-20">
                <form onSubmit={handlePromptSubmit} className="relative group">
                    <div className={`absolute -inset-1 bg-gradient-to-r ${hasError ? 'from-rose-500 via-[#8a2232] to-rose-500 opacity-90' : 'from-[#C5A059] via-[#8a2232] to-[#C5A059] opacity-40 group-hover:opacity-80'} rounded-2xl blur-md transition duration-500 pointer-events-none`} />
                    
                    <motion.div 
                        animate={hasError ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className={`relative flex items-center bg-[#13081e]/95 border-2 ${hasError ? 'border-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.4)]' : 'border-[#DFBA73] shadow-[0_10px_35px_rgba(0,0,0,0.9),0_0_25px_rgba(212,175,55,0.2)]'} rounded-2xl px-5 py-3.5 backdrop-blur-2xl transition-all`}
                    >
                        <div className={`p-2 rounded-xl border mr-3.5 shadow-inner transition-colors ${hasError ? 'bg-rose-950/60 border-rose-500/60 text-rose-300' : 'bg-[#2a133d] border-[#d4af37]/50 text-[#f5d76e]'}`}>
                            <Sparkles className="w-4 h-4" />
                        </div>
                        
                        <input 
                            ref={inputRef}
                            id="entry-quick-prompt"
                            name="entry-quick-prompt"
                            type="text"
                            value={quickPrompt}
                            onChange={(e) => {
                                setQuickPrompt(e.target.value);
                                if (hasError) setHasError(false);
                            }}
                            placeholder={hasError ? "Por favor escribe la descripción o hechos de tu caso antes de iniciar..." : "Describe tu caso, alegato o carga documento para iniciar el protocolo supremo..."}
                            className={`flex-1 bg-transparent text-xs sm:text-sm ${hasError ? 'text-rose-100 placeholder-rose-300/70 font-semibold' : 'text-slate-100 placeholder-slate-400 font-garamond italic'} text-base focus:outline-none`}
                        />

                        <div className="flex items-center gap-3 pl-3 border-l border-[#4c2967]">
                            <button
                                type="button"
                                onClick={() => onSelectWorkflow('design')}
                                className="p-2 text-amber-300 hover:text-white hover:bg-[#2e1544] rounded-xl transition-colors cursor-pointer"
                                title="Dictado por voz procesal solemne"
                            >
                                <Mic className="w-4 h-4" />
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                className="px-6 py-2.5 bg-gradient-to-r from-[#59143a] via-[#8a2232] to-[#59143a] hover:from-[#731a4b] hover:to-[#731a4b] text-white rounded-xl text-xs font-cinzel font-black tracking-widest uppercase shadow-[0_0_20px_rgba(138,34,50,0.6)] border border-[#ff8597] flex items-center gap-2 cursor-pointer"
                            >
                                <span>Iniciar</span>
                                <ChevronRight className="w-4 h-4 text-amber-200" />
                            </motion.button>
                        </div>
                    </motion.div>
                </form>
            </div>

        </div>
    );
});

EntryStep.displayName = 'EntryStep';
export default EntryStep;
