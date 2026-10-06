import React from 'react';
import type { ComparativeAnalysisReport, ComparativeFinding } from '../types';
import PageLoader from './PageLoader';
import { AlertTriangle, CheckCircle2, GitCompare, ShieldCheck, X } from 'lucide-react';

interface FinalValidationReportModalProps {
    report: ComparativeAnalysisReport | null;
    isLoading: boolean;
    error: string | null;
    onClose: () => void;
}

const ReportSection: React.FC<{ 
    title: string; 
    findings: Omit<ComparativeFinding, 'id'>[]; 
    icon: React.ReactNode; 
    isAlert?: boolean; 
    emptyText: string 
}> = ({ title, findings, icon, isAlert = false, emptyText }) => {
    const cardColor = isAlert 
        ? 'bg-rose-950/20 border-rose-500/40' 
        : 'bg-[#12071d] border-[#C5A059]/30 court-gold-frame';
    const titleColor = isAlert ? 'text-rose-400' : 'text-[#FFE898]';

    return (
        <div className={`p-5 rounded-2xl border ${cardColor} space-y-3`}>
            <h4 className={`font-cinzel font-bold text-sm sm:text-base flex items-center gap-2.5 ${titleColor}`}>
                {icon} 
                <span>{title}</span>
            </h4>
            {findings.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                    {findings.map((finding, index) => (
                        <div key={index} className="p-3.5 bg-[#0d0718] rounded-xl border border-[#C5A059]/20 text-xs space-y-1.5 font-garamond">
                            {finding.claimInDocA && (
                                <p className="text-slate-300">
                                    <strong className="font-mono text-[10px] text-slate-500 uppercase block mb-0.5">Argumento Original:</strong> 
                                    <em className="text-slate-300 font-garamond italic">"{finding.claimInDocA}"</em>
                                </p>
                            )}
                            {finding.claimInDocB && (
                                <p className="text-slate-300">
                                    <strong className="font-mono text-[10px] text-[#DFBA73] uppercase block mb-0.5">Respuesta en Borrador:</strong> 
                                    <em className="text-[#FFE898] font-garamond italic">"{finding.claimInDocB}"</em>
                                </p>
                            )}
                            <div className="pt-2 border-t border-[#C5A059]/20">
                                <strong className="font-mono text-[10px] text-emerald-400 uppercase block mb-0.5">Análisis Forense IA:</strong> 
                                <p className="text-slate-300 font-garamond leading-relaxed">{finding.analysis}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs font-garamond text-slate-400 italic px-2">{emptyText}</p>
            )}
        </div>
    );
};

const FinalValidationReportModal: React.FC<FinalValidationReportModalProps> = ({ report, isLoading, error, onClose }) => {
    return (
        <div className="fixed inset-0 bg-[#08040d]/85 backdrop-blur-md z-[100] flex items-center justify-center p-4" aria-modal="true">
            <div className="relative bg-[#12071d] border border-[#C5A059]/40 p-6 sm:p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] w-full max-w-4xl max-h-[90vh] flex flex-col text-slate-100 overflow-hidden court-gold-frame">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#C5A059]/60 to-transparent" />
                
                <div className="flex justify-between items-center mb-4 flex-shrink-0 border-b border-[#C5A059]/25 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#2a133d] rounded-xl border border-[#C5A059]/40 text-[#DFBA73] shadow-[0_0_10px_rgba(197,160,89,0.2)]">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-[10px] font-mono tracking-widest text-[#DFBA73] uppercase font-bold">QA Gatekeeper V5</span>
                            <h3 className="text-lg sm:text-xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] to-[#FFE898]">Informe de Control de Calidad Final</h3>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-[#FFE898] hover:bg-[#2a133d] border border-transparent hover:border-[#C5A059]/40 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin">
                    {isLoading && <PageLoader />}
                    {error && <div className="p-4 text-xs font-mono text-rose-300 bg-rose-950/30 border border-rose-500/40 rounded-2xl">{error}</div>}
                    {report && (
                        <div className="space-y-4">
                            <ReportSection
                                title="Argumentos del Doc. Original SIN Respuesta"
                                findings={report.unansweredArguments}
                                icon={<AlertTriangle className="h-4 w-4 text-rose-400" />}
                                isAlert={true}
                                emptyText="¡Excelente! Todos los argumentos del documento original fueron abordados en el borrador final."
                            />
                            <ReportSection
                                title="Hechos Coincidentes / Argumentos Abordados"
                                findings={report.agreedFacts}
                                icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                                emptyText="No se encontraron coincidencias claras."
                            />
                            <ReportSection
                                title="Discrepancias Identificadas"
                                findings={report.disputedFacts}
                                icon={<GitCompare className="h-4 w-4 text-[#DFBA73]" />}
                                emptyText="No se encontraron discrepancias entre los documentos."
                            />
                        </div>
                    )}
                </div>
                <div className="mt-6 flex justify-end flex-shrink-0">
                    <button onClick={onClose} className="px-6 py-2.5 bg-[#0d0718] hover:bg-[#2a133d] border border-[#C5A059]/30 text-[#DFBA73] hover:text-[#FFE898] text-xs font-cinzel font-bold rounded-xl transition-colors">Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default FinalValidationReportModal;
