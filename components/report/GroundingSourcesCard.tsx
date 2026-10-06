import React, { memo } from 'react';
import type { GroundingSource } from '../../types';
import { Globe, ExternalLink } from 'lucide-react';

interface GroundingSourcesCardProps {
    sources?: GroundingSource[];
}

const GroundingSourcesCard: React.FC<GroundingSourcesCardProps> = memo(({ sources = [] }) => {
    if (!sources || sources.length === 0) return null;

    return (
        <div className="relative bg-[#08040d]/90 backdrop-blur-2xl p-6 sm:p-7 rounded-3xl border border-[#DFBA73]/30 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(223,186,115,0.08)] overflow-hidden">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#DFBA73]/50 to-transparent pointer-events-none" />
            
            <h3 className="text-base sm:text-lg font-bold font-serif text-amber-100/90 mb-4 flex items-center gap-2.5">
                <div className="p-2 bg-[#DFBA73]/10 rounded-xl border border-[#DFBA73]/30 text-[#DFBA73]">
                    <Globe className="h-5 w-5" />
                </div>
                <span>Fuentes de Investigación Web ({sources.length})</span>
            </h3>

            <ul className="space-y-2.5 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {sources.map((source) => (
                    <li key={source.uri} className="text-xs bg-slate-900/60 p-3 rounded-xl border border-amber-500/10 hover:border-[#DFBA73]/40 transition-colors">
                        <a 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-amber-200/80 hover:text-[#DFBA73] flex items-center justify-between gap-2 font-mono"
                        >
                            <span className="truncate">{source.title || source.uri}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
});

GroundingSourcesCard.displayName = 'GroundingSourcesCard';

export default GroundingSourcesCard;
