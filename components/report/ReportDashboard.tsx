import React, { memo } from 'react';
import type { AnalysisReport, CaseDocumentType } from '../../types';
import { FileText, Target, Sparkles, Users } from 'lucide-react';

const MetricCard: React.FC<{label: string, value: string | number, colorClass: string, icon: React.ReactNode, glowColor: string}> = memo(({label, value, colorClass, icon, glowColor}) => (
    <div className={`relative bg-[#12071d]/90 backdrop-blur-2xl p-5 rounded-2xl border border-[#C5A059]/30 hover:border-[#C5A059]/60 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.8),${glowColor}] overflow-hidden group court-gold-frame`}>
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#DFBA73]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
            <h4 className="text-[11px] font-cinzel font-bold text-[#DFBA73] uppercase tracking-wider">{label}</h4>
            <div className="p-2 bg-[#1a0c2a] rounded-xl border border-[#C5A059]/25 text-[#FFE898]">
                {icon}
            </div>
        </div>
        <p className={`text-2xl sm:text-3xl font-black font-cinzel tracking-tight ${colorClass}`}>{value}</p>
    </div>
));

interface ReportDashboardProps {
    report: AnalysisReport;
    docType: CaseDocumentType;
}

const ReportDashboard: React.FC<ReportDashboardProps> = memo(({ report, docType }) => {
    const docTypeLabels: Record<CaseDocumentType, string> = {
        'RULING': 'Fallo / Sentencia',
        'LAWSUIT': 'Demanda',
        'ANSWER': 'Contestación',
        'OTHER': 'Expediente'
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <MetricCard 
                label="Tipo Procesal" 
                value={docTypeLabels[docType]} 
                colorClass="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300 text-lg sm:text-xl truncate" 
                icon={<FileText className="w-4 h-4 text-[#DFBA73]" />}
                glowColor="0_0_20px_rgba(197,160,89,0.1)"
            />
            <MetricCard 
                label="Hallazgos Críticos" 
                value={report.criticalPoints.length} 
                colorClass="text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] via-[#FFE898] to-[#C5A059]" 
                icon={<Target className="w-4 h-4 text-[#FFE898]" />}
                glowColor="0_0_25px_rgba(197,160,89,0.2)"
            />
            <MetricCard 
                label="Tesis Subsidiarias" 
                value={report.alternativeTheories.length} 
                colorClass="text-transparent bg-clip-text bg-gradient-to-r from-[#FFE898] to-[#DFBA73]" 
                icon={<Sparkles className="w-4 h-4 text-[#DFBA73]" />}
                glowColor="0_0_20px_rgba(223,186,115,0.15)"
            />
            <MetricCard 
                label="Actores Clave" 
                value={report.narrativeAnalysis.stakeholderAnalysis.length} 
                colorClass="text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] to-amber-200" 
                icon={<Users className="w-4 h-4 text-amber-300" />}
                glowColor="0_0_20px_rgba(197,160,89,0.12)"
            />
        </div>
    );
});

export default ReportDashboard;

