
import React from 'react';
import { Scale } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Procesando Protocolo...' }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 court-gold-frame max-w-md mx-auto text-center">
        <div className="relative">
            <div className="w-14 h-14 rounded-full border-2 border-[#8a6827]/40 border-t-[#FFE898] animate-spin shadow-[0_0_20px_rgba(212,175,55,0.4)]" />
            <div className="absolute inset-0 flex items-center justify-center text-[#f5d76e]">
                <Scale className="w-5 h-5 text-[#f5d76e]" />
            </div>
        </div>
        <p className="text-base font-cinzel font-bold text-[#f5d76e] tracking-wide">{message}</p>
        <p className="text-xs text-amber-200/70 font-garamond italic text-sm">El motor de deconstrucción jurídica está analizando el expediente.</p>
    </div>
  );
};

export default LoadingSpinner;
