

import React, { useState } from 'react';
import type { LegalActionProposal } from '../types';
import { proposeLegalActions } from '../services/geminiService';
import Card from './Card';
import HelpButton from './HelpButton';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  ArrowLeft, 
  Send, 
  FileText, 
  ShieldCheck, 
  Cpu, 
  Lightbulb, 
  AlertCircle,
  Clock,
  Briefcase
} from 'lucide-react';

interface NarrativeInputStepProps {
    onNarrativeSubmit: (narrative: string, proposals: LegalActionProposal[]) => void;
    onBack: () => void;
    initialNarrative?: string;
}

const TEMPLATE_EXAMPLES = [
  {
    title: 'Despido Injustificado / Laboral',
    text: 'El 15 de enero de 2024, el trabajador fue despedido verbalmente sin justa causa comprobada ni pago oportuno de liquidación de prestaciones sociales e indemnización legal.',
  },
  {
    title: 'Incumplimiento Contractual / Civil',
    text: 'La parte demandada incumplió la entrega de la obra civil pactada en el contrato N° 458-2023 en la fecha límite acordada, generando perjuicios económicos y lucro cesante directo.',
  },
  {
    title: 'Vulneración de Derechos / Tutela',
    text: 'La entidad prestadora de salud negó la autorización de un procedimiento quirúrgico de urgencia y medicamentos vitales, vulnerando el derecho fundamental a la salud y a la vida digna.',
  }
];

const NarrativeInputStep: React.FC<NarrativeInputStepProps> = ({ onNarrativeSubmit, onBack, initialNarrative = '' }) => {
    const [narrative, setNarrative] = useState(initialNarrative);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!narrative.trim()) {
            setError('La narración de hechos no puede estar vacía.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const proposals = await proposeLegalActions(narrative);

            if(proposals.length === 0) {
                 throw new Error("El motor cognitivo no pudo determinar una acción legal viable. Por favor, agregue mayores precisiones cronológicas o fácticas.");
            }
            onNarrativeSubmit(narrative, proposals);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Ocurrió un error desconocido al procesar la teoría.';
            setError(message);
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            
            {/* Top Navigation Bar */}
            <div className="flex justify-between items-center pb-2">
                <motion.button 
                    whileHover={{ x: -4 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={onBack} 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#180926]/90 border border-[#C5A059]/40 text-xs font-cinzel font-bold text-[#f5d76e] hover:text-white hover:border-[#FFE898] transition-all shadow-md"
                >
                    <ArrowLeft className="w-3.5 h-3.5 text-[#f5d76e]" />
                    <span>Retornar al Cockpit</span>
                </motion.button>
                <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8a2232]/20 border border-[#C5A059]/40 text-[11px] font-cinzel text-[#f5d76e]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#f5d76e]" />
                        <span>Blindaje de Datos Soberano</span>
                    </span>
                    <HelpButton />
                </div>
            </div>

            {/* Main Holographic Input Card */}
            <Card
                title="Diseñar Estrategia: Narración de Hechos & Teoría Fáctica"
                icon={<Sparkles className="w-5 h-5 text-[#f5d76e]" />}
                badge={
                    <span className="text-[10px] font-cinzel font-bold px-2.5 py-0.5 rounded-full bg-[#8a2232]/30 text-[#FFE898] border border-[#C5A059]/50">
                        V5 COGNITIVE GENERATOR
                    </span>
                }
            >
                <div className="space-y-4">
                    <p className="text-amber-100/80 text-xs sm:text-sm leading-relaxed font-serif">
                        Describa los hechos del caso en lenguaje natural, cronología fáctica o pretensiones deseadas. El motor procesará la teoría para estructurar pretensiones viables, identificar vicios procedimentales y proponer planes de acción.
                    </p>

                    {/* Quick Template Chips */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                        <span className="text-[11px] font-cinzel text-amber-200/70 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3 text-[#f5d76e]" />
                            <span>Plantillas rápidas:</span>
                        </span>
                        {TEMPLATE_EXAMPLES.map((tpl, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setNarrative(tpl.text)}
                                className="text-[11px] font-cinzel px-3 py-1 rounded-lg bg-[#180926] border border-[#3d1e56] text-amber-200/70 hover:border-[#C5A059]/50 hover:text-white transition-colors"
                            >
                                {tpl.title}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-950/50 border border-rose-500/40 rounded-2xl flex items-start gap-3 text-rose-200 text-xs font-serif">
                            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold font-cinzel">Error en la deconstrucción:</span> {error}
                            </div>
                        </div>
                    )}

                    {/* Cyber Textarea */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#d4af37]/20 via-[#8a2232]/20 to-[#d4af37]/20 rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition duration-500 pointer-events-none" />
                        <textarea
                            id="narrative-input"
                            name="narrative-input"
                            value={narrative}
                            onChange={(e) => setNarrative(e.target.value)}
                            placeholder="Ej: El día 15 de marzo de 2024, mi cliente Juan Pérez fue despedido de su trabajo en la empresa XYZ sin justa causa ni previo aviso..."
                            rows={12}
                            className="relative w-full p-4 bg-[#180926] border border-[#3d1e56] rounded-2xl focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/40 text-amber-100 text-sm leading-relaxed font-serif placeholder-amber-100/30 shadow-inner"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Telemetry Bar */}
                    <div className="flex items-center justify-between text-[11px] font-cinzel text-amber-200/60 px-1">
                        <div className="flex items-center gap-4">
                            <span>Caracteres: {narrative.length}</span>
                            <span>Palabras aprox: {narrative.trim() ? narrative.trim().split(/\s+/).length : 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#f5d76e]">
                            <Cpu className="w-3 h-3 text-[#f5d76e]" />
                            <span>Modelo: Gemini 2.5 Strategic Core</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Action Button */}
            <div className="flex justify-center pt-2">
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmit}
                    disabled={isLoading || !narrative.trim()}
                    className="relative group px-10 py-3.5 bg-gradient-to-r from-[#8a2232] to-[#59143a] hover:from-[#a32a3c] hover:to-[#6d1a47] text-white border border-[#FFE898]/70 text-sm font-cinzel font-bold rounded-2xl shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_45px_rgba(212,175,55,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Deconstruyendo Teoría del Caso...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 text-[#FFE898]" />
                            <span>Generar Propuestas de Estrategia Jurídica</span>
                            <Send className="w-3.5 h-3.5 text-[#FFE898]" />
                        </>
                    )}
                </motion.button>
            </div>
        </div>
    );
};

export default NarrativeInputStep;