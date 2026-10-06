
import React from 'react';
import { X } from 'lucide-react';

interface DockedPanelProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const DockedPanel: React.FC<DockedPanelProps> = ({ title, isOpen, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
      <div 
        className="h-[calc(100vh-8rem)] bg-[#0d0718]/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex flex-col border border-[#C5A059]/30 rounded-2xl overflow-hidden court-gold-frame"
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
      >
        <style>{`
            @keyframes slide-in-right {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .animate-slide-in-right { animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}</style>
        <header className="flex-shrink-0 bg-gradient-to-r from-[#12071d] via-[#1a0c2a] to-[#12071d] border-b border-[#C5A059]/25 z-10 px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 id="panel-title" className="font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] via-[#FFE898] to-[#C5A059] text-base tracking-wide flex items-center gap-2">
              <span className="text-sm">⚖️</span>
              <span>{title}</span>
            </h2>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-xl text-[#C5A059]/70 hover:text-[#FFE898] hover:bg-[#C5A059]/15 border border-transparent hover:border-[#C5A059]/30 transition-all duration-200" 
              aria-label="Cerrar panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto min-h-0 animate-slide-in-right bg-[#08040d]/90 scrollbar-thin">
          {children}
        </div>
      </div>
  );
};

export default DockedPanel;
