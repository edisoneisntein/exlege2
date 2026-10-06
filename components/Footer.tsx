import React, { memo } from 'react';
import { ShieldAlert, Scale, Award } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#08040d] text-amber-200/60 mt-16 border-t border-[#C5A059]/30 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative text-center p-6 border border-[#C5A059]/50 bg-[#12071d]/90 backdrop-blur-2xl rounded-3xl max-w-4xl mx-auto shadow-[0_15px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(212,175,55,0.15)] overflow-hidden">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#FFE898] to-transparent pointer-events-none" />
            
            <h3 className="font-cinzel font-bold text-sm text-[#f5d76e] mb-2 flex items-center justify-center gap-2 tracking-widest uppercase">
                <Scale className="w-4 h-4 text-[#f5d76e]" />
                Descargo de Responsabilidad Profesional & Fe Pública
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-garamond italic text-base">
                Esta plataforma es un sistema de deconstrucción y litigación estratégica asistida por inteligencia artificial para <strong>magistrados, jueces y profesionales del derecho</strong>. Las determinaciones finales corresponden exclusivamente al criterio y debida diligencia del jurista.
            </p>
        </div>
        <div className="text-center text-amber-400/60 text-xs font-cinzel tracking-wider mt-6 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse inline-block" />
            <p>&copy; {new Date().getFullYear()} EX LEGE • THE SUPREME COURT PROTOCOL • REGISTRO INMUTABLE VINCULANTE</p>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);
