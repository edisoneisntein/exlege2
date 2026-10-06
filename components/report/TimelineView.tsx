import React, { memo } from 'react';
import type { TimelineEvent } from '../../types';
import { Calendar, Clock } from 'lucide-react';

interface TimelineViewProps {
    events?: TimelineEvent[];
}

const TimelineItem: React.FC<{ event: TimelineEvent; side: 'left' | 'right' }> = memo(({ event, side }) => {
    const isLeft = side === 'left';
    return (
        <div className="mb-8 flex justify-between flex-row-reverse items-center w-full relative">
            {isLeft && <div className="order-1 w-5/12 hidden md:block"></div>}
            
            <div className="z-20 flex items-center justify-center order-1 bg-gradient-to-br from-[#FFE898] via-[#DFBA73] to-[#C5A059] shadow-[0_0_20px_rgba(212,175,55,0.7)] w-9 h-9 rounded-full border-2 border-[#08040d]">
                <Calendar className="h-4 w-4 text-[#08040d]" />
            </div>

            <div className={`order-1 bg-[#0e0717]/90 backdrop-blur-2xl border border-[#C5A059]/40 hover:border-[#FFE898] rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(223,186,115,0.05)] w-full md:w-5/12 px-6 py-5 transition-all duration-300 ${isLeft ? 'md:text-right' : 'text-left'}`}>
                <div className={`flex items-center gap-2 mb-2 ${isLeft ? 'md:justify-end' : 'justify-start'}`}>
                    <Clock className="w-3.5 h-3.5 text-[#DFBA73] shrink-0" />
                    <span className="text-xs font-mono font-bold text-[#FFE898] uppercase tracking-wider">{event.date}</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-200 font-serif">{event.description}</p>
                {event.source && (
                    <p className="text-[11px] font-mono text-amber-200/70 mt-3 pt-2 border-t border-[#C5A059]/20">
                        <span className="text-[#DFBA73] font-bold">Fuente:</span> {event.source}
                    </p>
                )}
            </div>
            
            {!isLeft && <div className="order-1 w-5/12 hidden md:block"></div>}
        </div>
    );
});

TimelineItem.displayName = 'TimelineItem';

const TimelineView: React.FC<TimelineViewProps> = memo(({ events = [] }) => {
    if (!events || events.length === 0) {
        return (
            <div className="text-center p-12 bg-[#0e0717]/60 border border-[#C5A059]/30 rounded-3xl text-amber-100/70 font-serif italic text-xs sm:text-sm">
                No se detectaron hitos cronológicos estructurados en los documentos cargados.
            </div>
        );
    }

    return (
        <div className="relative wrap p-4 sm:p-10">
            <div className="absolute border-opacity-30 border-[#C5A059]/40 h-full border-l-2 left-4 md:left-1/2 -ml-px pointer-events-none"></div>
            <div className="space-y-4">
                {events.map((event, index) => (
                    <TimelineItem key={event.id || `${event.date}-${index}`} event={event} side={index % 2 === 0 ? 'right' : 'left'} />
                ))}
            </div>
        </div>
    );
});

TimelineView.displayName = 'TimelineView';

export default TimelineView;
