import React, { memo } from 'react';
import { Clock, BookOpen, Target, Scale, GitMerge } from 'lucide-react';

interface MetricCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = memo(({ label, value, icon }) => (
    <div className="bg-[#12071d]/90 p-4 rounded-2xl shadow-lg border border-[#8a6827]/50 flex items-center space-x-3.5 hover:border-[#DFBA73] transition-colors">
        <div className="p-2.5 rounded-xl bg-[#2a133d] border border-[#C5A059]/50 text-[#f5d76e] shadow-inner flex-shrink-0">
            {icon}
        </div>
        <div className="min-w-0">
            <h4 className="text-[10px] font-cinzel font-bold text-[#DFBA73] uppercase tracking-wider truncate">{label}</h4>
            <p className="text-xl sm:text-2xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFFDF0] via-[#E8CA7A] to-[#C5A059] tracking-tight">{value}</p>
        </div>
    </div>
));

MetricCard.displayName = 'MetricCard';

interface PerformanceMetricsProps {
    elapsedTime: string;
    processedPages: number;
    humanTimeEstimate: string;
    logicalConnections: string;
    findingsCount: number;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = memo(({
    elapsedTime,
    processedPages,
    humanTimeEstimate,
    logicalConnections,
    findingsCount,
}) => {
    return (
        <div className="w-full max-w-5xl grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6 animate-fade-in-up">
            <MetricCard
                label="Tiempo de Análisis"
                value={elapsedTime}
                icon={<Clock className="w-5 h-5 text-[#f5d76e]" />}
            />
            <MetricCard
                label="Folios Procesados"
                value={processedPages}
                icon={<BookOpen className="w-5 h-5 text-[#f5d76e]" />}
            />
            <MetricCard
                label="Vulnerabilidades"
                value={findingsCount}
                icon={<Target className="w-5 h-5 text-[#f5d76e]" />}
            />
            <MetricCard
                label="Tiempo Humano Est."
                value={humanTimeEstimate}
                icon={<Scale className="w-5 h-5 text-[#f5d76e]" />}
            />
            <MetricCard
                label="Nexos Lógicos"
                value={logicalConnections}
                icon={<GitMerge className="w-5 h-5 text-[#f5d76e]" />}
            />
        </div>
    );
});

PerformanceMetrics.displayName = 'PerformanceMetrics';

export default PerformanceMetrics;