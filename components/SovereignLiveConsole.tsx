import React, { useState } from 'react';
import { Terminal, Shield, Sparkles, ChevronDown, ChevronUp, CheckCircle2, Clock, Wrench } from 'lucide-react';
import type { AnalysisProgress } from '../types';

interface SovereignLiveConsoleProps {
    logs: AnalysisProgress[];
    title?: string;
    subtitle?: string;
    isWorking?: boolean;
    maxHeightClass?: string;
    defaultExpanded?: boolean;
}

export const SovereignLiveConsole: React.FC<SovereignLiveConsoleProps> = ({
    logs,
    title = 'Consola de Telemetría Soberana • Invocación en Tiempo Real',
    subtitle = 'Monitoreo de agentes autónomos, consultas jurisprudenciales y cotejo de acervo probatorio.',
    isWorking = false,
    maxHeightClass = 'max-h-56',
    defaultExpanded = true
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    // Filtrar logs de supervisor o herramientas si se desea destacar
    const supervisorLogs = logs.filter(l => 
        l.agentId === 'supervisor' || 
        l.log.includes('[Agente Supervisor]') || 
        l.log.includes('[Herramienta') || 
        l.log.includes('[Memoria') || 
        l.log.includes('[Bucle')
    );

    const displayLogs = supervisorLogs.length > 0 ? supervisorLogs : logs;

    return (
        <div className="w-full bg-[#0d0617]/95 border border-[#C5A059]/50 rounded-2xl overflow-hidden shadow-[0_12px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.15)] backdrop-blur-xl">
            {/* Header / Bar */}
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-4 py-3 bg-gradient-to-r from-[#170a24] via-[#220d36] to-[#12071d] border-b border-[#DFBA73]/30 flex items-center justify-between cursor-pointer select-none transition-all hover:bg-[#25103a]"
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-[#301449] border border-[#FFE898]/50 text-[#FFE898] flex-shrink-0 shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                        <Terminal className="w-4 h-4 text-[#DFBA73]" />
                    </div>
                    <div className="truncate">
                        <div className="flex items-center gap-2">
                            <span className="font-cinzel font-bold text-xs sm:text-sm text-[#FFE898] truncate">{title}</span>
                            {isWorking && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                                    <span>EN VIVO</span>
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-amber-200/60 font-serif truncate hidden sm:block">{subtitle}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[11px] font-mono text-[#DFBA73]/80 bg-[#0a0412] px-2 py-0.5 rounded-md border border-[#DFBA73]/20">
                        {displayLogs.length} eventos
                    </span>
                    <button className="text-[#DFBA73] hover:text-[#FFE898]">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Body */}
            {isExpanded && (
                <div className={`p-4 bg-[#08030f] overflow-y-auto ${maxHeightClass} font-mono text-xs space-y-2 scrollbar-thin`}>
                    {displayLogs.length === 0 ? (
                        <div className="text-center py-4 text-amber-200/40 italic font-serif text-xs">
                            A la espera de activación del Supervisor de Consorcio...
                        </div>
                    ) : (
                        displayLogs.map((item, idx) => {
                            const isSupervisor = item.agentId === 'supervisor' || item.log.includes('Supervisor') || item.log.includes('Herramienta');
                            const isTool = item.log.includes('herramienta') || item.log.includes('searchJurisprudence') || item.log.includes('verifyEvidenceIntegrity');

                            return (
                                <div 
                                    key={idx} 
                                    className={`p-2.5 rounded-xl border transition-all leading-relaxed flex items-start gap-2.5 ${
                                        isTool 
                                            ? 'bg-[#1b0d2d] border-[#DFBA73]/40 text-amber-100 shadow-[0_0_12px_rgba(212,175,55,0.15)]'
                                            : isSupervisor
                                            ? 'bg-[#140822] border-amber-500/30 text-amber-200/90'
                                            : 'bg-[#0f0619] border-[#3d1e56]/50 text-slate-300'
                                    }`}
                                >
                                    <div className="mt-0.5 flex-shrink-0">
                                        {isTool ? (
                                            <Wrench className="w-3.5 h-3.5 text-[#FFE898]" />
                                        ) : isSupervisor ? (
                                            <Shield className="w-3.5 h-3.5 text-amber-400" />
                                        ) : (
                                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                            <span className="text-[10px] font-bold text-[#DFBA73] font-cinzel">
                                                {item.agentId ? item.agentId.toUpperCase() : 'TELEMETRÍA'}
                                            </span>
                                            <span className="text-[9px] text-amber-200/50 font-mono">#{idx + 1}</span>
                                        </div>
                                        <p className="text-[11px] font-garamond sm:text-xs text-slate-200 break-words leading-normal">
                                            {item.log}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};
