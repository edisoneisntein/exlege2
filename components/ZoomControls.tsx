import React from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const ZoomControls: React.FC = () => {
    const { zoomLevel, changeZoom, canZoomIn, canZoomOut } = useAnalysis();

    return (
        <div className="fixed bottom-4 right-4 z-[200] flex items-center bg-[#12071d]/95 backdrop-blur-md rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.8)] border border-[#C5A059]/40 overflow-hidden court-gold-frame">
            <button
                onClick={() => changeZoom('out')}
                className="p-2.5 text-[#DFBA73] hover:text-[#FFE898] hover:bg-[#2a133d] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Alejar"
                title="Alejar vista"
                disabled={!canZoomOut}
            >
                <ZoomOut className="w-4 h-4" />
            </button>
            <button
                onClick={() => changeZoom('reset')}
                className="px-3 py-1.5 text-xs font-cinzel font-bold text-[#FFE898] border-x border-[#C5A059]/30 hover:bg-[#2a133d] transition-colors min-w-[55px] text-center flex items-center justify-center gap-1"
                aria-label="Restablecer zoom al 100%"
                title="Restablecer escala al 100%"
            >
                <span>{Math.round(zoomLevel * 100)}%</span>
            </button>
            <button
                onClick={() => changeZoom('in')}
                className="p-2.5 text-[#DFBA73] hover:text-[#FFE898] hover:bg-[#2a133d] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Acercar"
                title="Acercar vista"
                disabled={!canZoomIn}
            >
                <ZoomIn className="w-4 h-4" />
            </button>
        </div>
    );
};

export default ZoomControls;
