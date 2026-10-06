
import React from 'react';
import { HelpCircle } from 'lucide-react';

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="relative inline-block ml-1.5 group align-middle">
        <HelpCircle className="h-3.5 w-3.5 text-[#DFBA73] cursor-help hover:text-[#FFE898] transition-colors inline-block" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 text-xs text-amber-100 bg-[#14081e]/95 border border-[#C5A059]/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none shadow-[0_10px_25px_rgba(0,0,0,0.8)] backdrop-blur-xl font-garamond italic text-sm">
            {text}
        </div>
    </div>
);

export default InfoTooltip;
