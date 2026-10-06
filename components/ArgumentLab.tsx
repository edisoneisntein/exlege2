import React, { useState, memo } from 'react';
import type { FullAnalysisResult, ArgumentAnalysis } from '../types';
import { stressTestArgument } from '../services/geminiService';
import InfoTooltip from './InfoTooltip';
import ArgumentAnalysisDisplay from './report/ArgumentAnalysisDisplay';
import { FlaskConical, Zap, AlertCircle, RefreshCw } from 'lucide-react';

const LoadingSpinner: React.FC<{ message: string }> = memo(({ message }) => (
    <div className="flex flex-col items-center justify-center p-8 my-4 space-y-3 bg-[#12071d]/80 rounded-2xl border border-[#C5A059]/30">
        <RefreshCw className="h-8 w-8 text-[#DFBA73] animate-spin" />
        <p className="font-cinzel text-xs sm:text-sm text-[#FFE898] tracking-wider uppercase">{message}</p>
    </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

interface ArgumentLabProps {
    fullResult: FullAnalysisResult;
}

const ArgumentLab: React.FC<ArgumentLabProps> = memo(({ fullResult }) => {
    const [userArgument, setUserArgument] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<ArgumentAnalysis | null>(null);

    const handleAnalyze = async () => {
        if (!userArgument.trim()) {
            setError('Por favor, ingrese un argumento para analizar.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await stressTestArgument(userArgument, fullResult);
            setAnalysisResult(result);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Ocurrió un error inesperado al procesar el argumento.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative bg-[#0e0717]/90 backdrop-blur-2xl border border-[#C5A059]/40 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(212,175,55,0.08)] text-slate-100 overflow-hidden space-y-6">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#FFE898]/50 to-transparent pointer-events-none" />

            <div className="flex items-start justify-between flex-wrap gap-4 border-b border-[#C5A059]/20 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#DFBA73]/15 rounded-2xl border border-[#DFBA73]/30 text-[#DFBA73] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                        <FlaskConical className="w-6 h-6 text-[#FFE898]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 text-[10px] font-cinzel font-bold bg-[#8a2232]/40 text-[#FFE898] rounded-full uppercase tracking-wider border border-[#C5A059]/40">
                                War Room V5
                            </span>
                            <span className="text-amber-200/70 font-mono text-[10px]">
                                STRESS TESTING ENGINE
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-white mt-1 flex items-center gap-2">
                            <span>Laboratorio de Argumentación</span>
                            <InfoTooltip text="Ponga a prueba sus propios argumentos. La IA los analizará en el contexto del caso, evaluará su solidez, anticipará contra-argumentos y sugerirá mejoras." />
                        </h2>
                    </div>
                </div>
            </div>

            <p className="text-xs sm:text-sm text-amber-100/80 font-serif leading-relaxed italic">
                Esta es su sala de guerra procesal. Escriba un argumento, una tesis de nulidad o una línea de defensa y sométala a un riguroso "stress test" por parte del motor de razonamiento jurídico adversarial.
            </p>

            <div className="space-y-4">
                <textarea
                    id="argument-lab-input"
                    name="argument-lab-input"
                    value={userArgument}
                    onChange={(e) => setUserArgument(e.target.value)}
                    placeholder="Ej: 'La decisión del a quo incurre en un error de hecho al ignorar la prueba documental obrante a folio 23, que demuestra fehacientemente el pago de la obligación...'"
                    rows={6}
                    className="w-full p-4 bg-[#12071d]/90 border border-[#C5A059]/30 focus:border-[#FFE898] rounded-2xl focus:outline-none text-slate-100 text-xs sm:text-sm font-serif placeholder-amber-200/40 shadow-inner"
                    disabled={isLoading}
                />
                
                <div className="flex justify-end">
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !userArgument.trim()}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-[#DFBA73] to-[#C5A059] hover:from-[#FFE898] hover:to-[#DFBA73] text-[#08040d] font-cinzel font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        <Zap className="w-4 h-4" />
                        <span>Ejecutar Stress Test de Argumento</span>
                    </button>
                </div>
            </div>

            {isLoading && <LoadingSpinner message="Sometiendo argumento a colisión adversarial y escaneo de precedentes..." />}

            {error && (
                <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-2xl flex items-center gap-3 text-rose-300 text-xs font-mono">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {analysisResult && (
                <div className="pt-4 border-t border-[#C5A059]/20">
                    <ArgumentAnalysisDisplay analysis={analysisResult} />
                </div>
            )}
        </div>
    );
});

ArgumentLab.displayName = 'ArgumentLab';

export default ArgumentLab;
