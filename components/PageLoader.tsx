
import React from 'react';
import { Scale } from 'lucide-react';

const PageLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-[#8a6827]/40 border-t-[#FFE898] animate-spin shadow-[0_0_20px_rgba(212,175,55,0.4)]" />
            <div className="absolute inset-0 flex items-center justify-center text-[#f5d76e]">
                <Scale className="w-4 h-4 text-[#f5d76e]" />
            </div>
        </div>
        <p className="text-sm font-cinzel font-bold text-[#f5d76e] tracking-wider uppercase">Cargando Protocolo...</p>
      </div>
    </div>
  );
};

export default PageLoader;
