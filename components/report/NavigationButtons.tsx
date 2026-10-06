import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface NavigationButtonsProps {
    onBack?: () => void;
    onContinue?: () => void;
    backText?: string;
    continueText?: string;
    showContinue?: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ onBack, onContinue, backText, continueText, showContinue = true }) => (
    <div className="mt-8 pt-6 border-t border-[#C5A059]/30 flex justify-between items-center flex-wrap gap-4">
        <div>
            {onBack && backText && (
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#180926]/90 text-amber-200/90 font-cinzel font-bold text-xs sm:text-sm rounded-2xl border border-[#C5A059]/40 hover:border-[#FFE898] hover:text-white hover:bg-[#250f38] transition-all shadow-inner"
                >
                    <ArrowLeft className="w-4 h-4 text-[#DFBA73]" />
                    <span>{backText}</span>
                </button>
            )}
        </div>
        <div>
            {onContinue && continueText && showContinue && (
                 <button
                    onClick={onContinue}
                    className="flex items-center gap-2 px-7 py-2.5 bg-gradient-to-r from-[#DFBA73] via-[#FFE898] to-[#C5A059] hover:from-[#FFE898] hover:to-[#DFBA73] text-[#08040d] font-cinzel font-bold text-xs sm:text-sm rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.35)] transition-all transform hover:scale-[1.02]"
                >
                    <span>{continueText}</span>
                    <ArrowRight className="w-4 h-4 text-[#08040d]" />
                </button>
            )}
        </div>
    </div>
);

export default NavigationButtons;
