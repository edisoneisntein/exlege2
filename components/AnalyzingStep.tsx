import React, { useState, useEffect, useRef, memo } from 'react';
import type { Agent, AgentStatus } from '../types';
import { useAnalysis } from '../context/AnalysisContext';
import HelpButton from './HelpButton';
import { SovereignLiveConsole } from './SovereignLiveConsole';
import { motion } from 'motion/react';
import { 
  Globe, 
  BookOpen, 
  Cpu, 
  FileSearch, 
  Scale, 
  RotateCw, 
  Zap, 
  ShieldAlert, 
  Network, 
  Layers,
  Terminal,
  Activity,
  Gavel,
  Crown
} from 'lucide-react';

const multiAgentAnalysts: Agent[] = [
  {
    id: 'web_research',
    name: 'Investigador Jurisprudencial Web',
    description: 'Rastrea fallos de unificación y precedentes en tiempo real.',
    icon: <Globe className="w-5 h-5 text-[#f5d76e]" />,
  },
  {
    id: 'narrative',
    name: 'Deconstructor Hermenéutico',
    description: 'Deconstruye la ratio decidendi y sesgos de juzgamiento.',
    icon: <BookOpen className="w-5 h-5 text-[#f5d76e]" />,
  },
  {
    id: 'logic',
    name: 'Auditor de Lógica e Incongruencia',
    description: 'Aísla falacias formales, peticiones de principio y sofismas.',
    icon: <Scale className="w-5 h-5 text-[#f5d76e]" />,
  },
  {
    id: 'evidence',
    name: 'Magistrado Auditor de Pruebas',
    description: 'Contrasta la apreciación errónea de hechos con los folios.',
    icon: <FileSearch className="w-5 h-5 text-[#f5d76e]" />,
  },
  {
    id: 'law',
    name: 'Auditor Normativo & Constitucional',
    description: 'Verifica la aplicación indebida de la norma e infracción directa.',
    icon: <Gavel className="w-5 h-5 text-[#f5d76e]" />,
  },
  {
    id: 'iterator',
    name: 'Fiscal de Pases Cruzados',
    description: 'Auditoría en pases recursivos de deconstrucción multinivel.',
    icon: <RotateCw className="w-5 h-5 text-[#f5d76e]" />,
  },
  {
    id: 'fracture',
    name: 'Estratega de Punto de Quiebre',
    description: 'Enfoca la ofensiva procesal sobre la debilidad angular del fallo.',
    icon: <Zap className="w-5 h-5 text-[#f5d76e]" />,
  },
  {
    id: 'shielding',
    name: 'Blindaje Judicial & Réplicas',
    description: 'Anticipa contra-argumentos de la contraparte y los neutraliza.',
    icon: <ShieldAlert className="w-5 h-5 text-[#f5d76e]" />,
  },
  {
    id: 'coherence',
    name: 'Curador de Coherencia Fáctica',
    description: 'Mapea discordancias fácticas entre afirmaciones y folios.',
    icon: <Network className="w-5 h-5 text-[#f5d76e]" />,
  },
  {
    id: 'synthesizer',
    name: 'Plenario de Síntesis Estratégica',
    description: 'Consolida la matriz final de vulnerabilidades y pretensiones.',
    icon: <Layers className="w-5 h-5 text-[#f5d76e]" />,
  },
];

const StatusIndicator: React.FC<{ status: AgentStatus }> = memo(({ status }) => {
  const styles: Record<AgentStatus, { bg: string; text: string; label: string; border: string }> = {
    PENDIENTE: { bg: 'bg-[#180924]', text: 'text-slate-400', label: 'En Espera', border: 'border-[#3d1e56]' },
    TRABAJANDO: { bg: 'bg-[#3b1c54]', text: 'text-[#f5d76e]', label: 'Deliberando', border: 'border-[#FFE898]' },
    COMPLETADO: { bg: 'bg-[#1b2b1a]', text: 'text-emerald-400', label: 'Dictaminado', border: 'border-emerald-600/50' },
    FALLO: { bg: 'bg-[#3a0f19]', text: 'text-rose-300', label: 'Objeción', border: 'border-rose-500/50' },
  };
  const current = styles[status] || styles.PENDIENTE;
  return (
    <span className={`px-2.5 py-0.5 text-[10px] font-cinzel font-bold rounded-full border ${current.bg} ${current.text} ${current.border} flex items-center gap-1.5`}>
      {status === 'TRABAJANDO' && <span className="w-1.5 h-1.5 rounded-full bg-[#f5d76e] animate-ping" />}
      {current.label}
    </span>
  );
});

interface AgentCardProps {
    agent: Agent;
    status: AgentStatus;
}

const AgentCard: React.FC<AgentCardProps> = memo(({ agent, status }) => {
    const isWorking = status === 'TRABAJANDO';
    const isDone = status === 'COMPLETADO';

    return (
        <div className={`p-4 rounded-2xl border transition-all duration-300 flex items-center space-x-3.5 ${
            isWorking 
                ? 'bg-[#220d36]/95 border-[#FFE898] shadow-[0_0_25px_rgba(212,175,55,0.25)] ring-1 ring-[#d4af37]/40' 
                : isDone
                ? 'bg-[#12071d]/90 border-emerald-500/40 shadow-md'
                : 'bg-[#0e0617]/70 border-[#3d1e56]/60 opacity-80'
        }`}>
            <div className={`p-2.5 rounded-xl border flex-shrink-0 ${
                isWorking 
                    ? 'bg-[#3d1c58] border-[#FFE898] shadow-[0_0_12px_rgba(212,175,55,0.35)]' 
                    : isDone
                    ? 'bg-[#1c301c] border-emerald-500/40'
                    : 'bg-[#1a0c26] border-[#3d1e56]'
            }`}>
                {agent.icon}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-xs font-cinzel font-bold text-white truncate">{agent.name}</h4>
                <p className="text-[11px] text-amber-200/70 font-garamond italic truncate text-xs">{agent.description}</p>
            </div>
            <div className="flex-shrink-0">
                <StatusIndicator status={status} />
            </div>
        </div>
    );
});

const AnalyzingStep: React.FC = () => {
    const { analysisLog } = useAnalysis();
    const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentStatus>>({});
    const [lastLogMessage, setLastLogMessage] = useState('');
    const logRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const newStatuses: Record<string, AgentStatus> = {};
        
        analysisLog.forEach(entry => {
            if (entry.agentId && entry.status) {
                newStatuses[entry.agentId] = entry.status;
            }
        });

        setAgentStatuses(prev => ({...prev, ...newStatuses}));
        
        if (analysisLog.length > 0) {
            setLastLogMessage(analysisLog[analysisLog.length - 1].log);
        }

        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
        
    }, [analysisLog]);

    const completedCount = Object.values(agentStatuses).filter(s => s === 'COMPLETADO').length;
    const progressPercent = Math.round((completedCount / multiAgentAnalysts.length) * 100);

    return (
        <div className="space-y-6 max-w-5xl mx-auto py-2">
            
            {/* Holographic Header */}
            <div className="text-center space-y-2 relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2d1242] border border-[#d4af37]/50 text-[#f5d76e] text-xs font-cinzel font-bold">
                    <Crown className="w-3.5 h-3.5 text-[#f5d76e]" />
                    <span>CÁMARA DELIBERATORIA • TRIBUNAL SUPREMO COGNITIVO</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-cinzel font-black text-white tracking-wide">
                    Ejecutando Autopsia Forense de la Providencia
                </h2>
                <p className="text-xs sm:text-sm text-amber-200/80 font-garamond italic text-base max-w-2xl mx-auto">
                    El consorcio de 10 magistrados analistas sesiona en pleno para deconstruir la decisión judicial y estructurar el recurso implacable.
                </p>
                <div className="flex justify-center pt-1">
                  <HelpButton />
                </div>
            </div>

            {/* Global Progress Bar */}
            <div className="p-5 bg-[#12071d]/90 border border-[#C5A059]/40 rounded-2xl backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.1)] space-y-2">
                <div className="flex justify-between items-center text-xs font-cinzel">
                    <span className="text-amber-100 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#f5d76e] animate-ping" />
                        <span>Progreso de Deliberación Forense: {progressPercent}%</span>
                    </span>
                    <span className="text-[#f5d76e] font-bold">{completedCount} / {multiAgentAnalysts.length} Magistrados Dictaminaron</span>
                </div>
                <div className="w-full h-2.5 bg-[#09040e] rounded-full overflow-hidden border border-[#3d1e56]">
                    <motion.div 
                        className="h-full bg-gradient-to-r from-[#8a2232] via-[#d4af37] to-[#FFE898] rounded-full shadow-[0_0_12px_rgba(212,175,55,0.6)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(5, progressPercent)}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Agent Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {multiAgentAnalysts.map(agent => (
                    <AgentCard key={agent.id} agent={agent} status={agentStatuses[agent.id] || 'PENDIENTE'} />
                ))}
            </div>

            {/* Sovereign Live Telemetry Console */}
            <div className="pt-2">
                <SovereignLiveConsole 
                    logs={analysisLog} 
                    isWorking={Object.values(agentStatuses).some(s => s === 'TRABAJANDO')}
                    maxHeightClass="max-h-52"
                />
            </div>

            {/* Terminal Logs */}
            <div className="space-y-2 pt-2">
                 <div className="flex items-center justify-between text-xs font-cinzel text-amber-200/80">
                     <span className="flex items-center gap-2 text-[#f5d76e] font-bold">
                         <Terminal className="w-4 h-4 text-[#f5d76e]" />
                         <span>Acta de Deliberación & Telemetría Forense:</span>
                     </span>
                     <span className="text-[10px] text-amber-300/60 font-mono tracking-wider">REGISTRO PROTOCOLAR</span>
                 </div>
                 <div ref={logRef} className="h-44 bg-[#0a0412]/95 p-4 rounded-2xl border border-[#C5A059]/40 overflow-y-auto font-garamond text-sm space-y-1.5 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] backdrop-blur-2xl text-slate-200" aria-live="off">
                     {analysisLog.map((entry, i) => (
                         <div key={i} className="leading-relaxed flex items-start gap-2">
                            <span className="text-[#f5d76e] font-mono select-none text-[10px] flex-shrink-0 mt-0.5">{`[ACTA #${i+1}]`}</span>
                            <span className="text-slate-200 font-garamond text-sm">{entry.log}</span>
                         </div>
                     ))}
                      {Object.values(agentStatuses).some(s => s === 'TRABAJANDO') && (
                        <div className="flex items-center gap-2 text-[#f5d76e] text-xs pt-1 font-cinzel">
                            <div className="w-3.5 h-3.5 border-2 border-[#f5d76e]/30 border-t-[#f5d76e] rounded-full animate-spin" />
                            <span>Magistrados deliberando sobre tesis y nulidades...</span>
                        </div>
                      )}
                 </div>
                 <div aria-live="polite" className="sr-only">
                    {lastLogMessage}
                 </div>
            </div>
        </div>
    );
};

export default AnalyzingStep;
