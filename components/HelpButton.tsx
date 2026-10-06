
import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { HelpCircle } from 'lucide-react';

interface HelpButtonProps {
    className?: string;
}

const HelpButton: React.FC<HelpButtonProps> = ({ className = '' }) => {
    const { toggleManual } = useAnalysis();
    return (
        <button
            onClick={() => toggleManual(true)}
            className={`inline-flex items-center gap-2 text-xs font-cinzel font-bold text-[#f5d76e] hover:text-[#FFE898] bg-[#2a133d]/70 hover:bg-[#3d1c58] px-3.5 py-1.5 rounded-xl border border-[#C5A059]/50 transition-colors shadow-sm ${className}`}
        >
            <HelpCircle className="h-4 w-4 text-[#f5d76e]" />
            Consultar Manual de Protocolo
        </button>
    );
};

export default HelpButton;
