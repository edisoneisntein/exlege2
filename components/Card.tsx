import React, { memo } from 'react';

interface CardProps {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  badge?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, icon, children, className = '', badge }) => {
  return (
    <div className={`relative bg-[#12071d]/90 backdrop-blur-2xl border border-[#C5A059]/40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(212,175,55,0.12)] overflow-hidden transition-all duration-300 ${className}`}>
      {/* Top Sovereign Gold Filigree Edge Beam */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#FFE898] to-transparent pointer-events-none" />
      
      {title && (
        <div className="px-6 py-4 border-b border-[#3d1e56]/80 flex items-center justify-between bg-[#1a0c28]/80 backdrop-blur-md">
          <div className="flex items-center space-x-3.5">
            {icon && (
              <div className="p-2 bg-[#2d1242] text-[#f5d76e] rounded-xl border border-[#d4af37]/60 flex-shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.25)]">
                {icon}
              </div>
            )}
            <div className="text-sm sm:text-base font-cinzel font-bold text-white tracking-wide">{title}</div>
          </div>
          {badge && <div>{badge}</div>}
        </div>
      )}
      <div className="p-6 md:p-8 text-slate-200 font-sans">
        {children}
      </div>
    </div>
  );
};

export default memo(Card);

