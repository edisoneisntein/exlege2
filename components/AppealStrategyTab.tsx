import React, { useState } from 'react';
import type { AnalysisReport, AIPersonality, CriticalPoint, CaseDocumentType } from '../types';
import InfoTooltip from './InfoTooltip';
import { generateDraftDocx } from '../services/documentGenerator';
import { 
  PenTool, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Settings2, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Zap,
  RefreshCw,
  Scale
} from 'lucide-react';

interface DraftingAssistantTabProps {
    report: AnalysisReport;
    aiPersonality: AIPersonality;
    documentType: CaseDocumentType;
    onGenerateDraft: (report: AnalysisReport, considerations: string) => void;
    isLoading: boolean;
    draftText: string | null;
    error: string | null;
}

type DraftMode = 'exhaustive' | 'manual';

const DraftingAssistantTab: React.FC<DraftingAssistantTabProps> = ({ report, aiPersonality, documentType, onGenerateDraft, isLoading, draftText, error }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [draftMode, setDraftMode] = useState<DraftMode>('exhaustive');
    const [selectedPoints, setSelectedPoints] = useState<Set<string>>(() => new Set(report.criticalPoints.map(p => p.id)));
    const [additionalConsiderations, setAdditionalConsiderations] = useState('');

    const handleModeChange = (mode: DraftMode) => {
        setDraftMode(mode);
        if (mode === 'exhaustive') {
            setSelectedPoints(new Set(report.criticalPoints.map(p => p.id)));
        }
    };
    
    const handleTogglePoint = (id: string) => {
        setSelectedPoints(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleGenerateDraft = () => {
        const pointsToDraft = report.criticalPoints.filter(p => selectedPoints.has(p.id));
        const reportForDrafting: AnalysisReport = { ...report, criticalPoints: pointsToDraft };
        onGenerateDraft(reportForDrafting, additionalConsiderations);
    };

    const handleCopy = () => {
        if (!draftText) return;
        navigator.clipboard.writeText(draftText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };
    
    const handleExportDraft = async () => {
        if (!draftText) return;
        setIsExporting(true);
        try {
            await generateDraftDocx(draftText, 'Borrador_Inicial.docx');
        } catch (err) {
            console.error("Failed to export draft:", err);
        } finally {
            setIsExporting(false);
        }
    };

    const { title, description, buttonText } = {
        'RULING': { 
            title: 'Asistente de Redacción de Apelación (Borrador Inicial)',
            description: 'Seleccione los hallazgos que desea incluir y el motor redactará un borrador estructurado del recurso.',
            buttonText: 'Generar Borrador de Apelación',
        },
        'LAWSUIT': { 
            title: 'Asistente de Redacción de Contestación (Borrador Inicial)',
            description: 'Seleccione las debilidades a explotar y el motor redactará un borrador formal de la contestación.',
            buttonText: 'Generar Borrador de Contestación',
        },
        'ANSWER': { 
            title: 'Asistente de Redacción de Réplica (Borrador Inicial)',
            description: 'Seleccione los puntos a refutar y el motor redactará un borrador de réplica judicial.',
            buttonText: 'Generar Borrador de Réplica',
        },
        'OTHER': { 
            title: 'Asistente de Redacción Estratégica (Borrador Inicial)',
            description: 'Seleccione los hallazgos a incluir y el motor redactará un borrador judicial completo.',
            buttonText: 'Generar Borrador de Documento',
        }
    }[documentType];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-100 font-garamond">
            {/* Left Panel: Config and Considerations */}
            <div className="lg:col-span-1 relative bg-[#12071d]/90 backdrop-blur-2xl p-6 rounded-3xl border border-[#C5A059]/40 shadow-[0_15px_40px_rgba(0,0,0,0.8)] h-full flex flex-col space-y-5 overflow-hidden court-gold-frame">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#FFE898] to-transparent" />
                
                <div className="flex items-center gap-2.5 border-b border-[#C5A059]/30 pb-3">
                    <div className="p-2 rounded-xl bg-[#2a133d] border border-[#C5A059]/50 text-[#FFE898]">
                        <Settings2 className="w-4 h-4 text-[#FFE898]" />
                    </div>
                    <h3 className="text-sm font-cinzel font-bold text-[#FFE898] uppercase tracking-wider">Configuración de Redacción</h3>
                </div>
                
                <div>
                    <label className="text-xs font-cinzel font-bold text-amber-200/80 mb-2 block uppercase tracking-wider">Modo de Inclusión</label>
                    <div className="grid grid-cols-2 gap-2 text-center text-xs font-cinzel">
                        <button 
                            onClick={() => handleModeChange('exhaustive')} 
                            disabled={!!draftText} 
                            className={`p-3 rounded-2xl cursor-pointer border transition-all font-bold ${
                                draftMode === 'exhaustive' 
                                    ? 'border-[#FFE898] bg-[#2a133d] text-[#FFE898] shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                                    : 'border-[#C5A059]/30 bg-[#0d0718] text-slate-400 hover:text-[#DFBA73]'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <span className="block text-xs font-bold">Exhaustivo</span>
                            <span className="text-[10px] text-amber-200/60 font-garamond font-normal">Incluir todo</span>
                        </button>
                        <button 
                            onClick={() => handleModeChange('manual')} 
                            disabled={!!draftText} 
                            className={`p-3 rounded-2xl cursor-pointer border transition-all font-bold ${
                                draftMode === 'manual' 
                                    ? 'border-[#FFE898] bg-[#2a133d] text-[#FFE898] shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                                    : 'border-[#C5A059]/30 bg-[#0d0718] text-slate-400 hover:text-[#DFBA73]'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <span className="block text-xs font-bold">Manual</span>
                            <span className="text-[10px] text-amber-200/60 font-garamond font-normal">Seleccionar</span>
                        </button>
                    </div>
                </div>

                <div className="flex-grow flex flex-col min-h-0">
                    <label className="text-xs font-cinzel font-bold text-amber-200/80 mb-2 flex items-center justify-between">
                        <span>Hallazgos ({selectedPoints.size}/{report.criticalPoints.length})</span>
                        <InfoTooltip text={draftMode === 'exhaustive' ? 'Modo Exhaustivo: Se incluirán todos los hallazgos identificados para crear el argumento más denso y completo posible.' : 'Modo Manual: Active las casillas de los hallazgos que desea que la IA utilice para construir el borrador.'} />
                    </label>
                    <div className="flex-grow bg-[#0d0718] p-3 rounded-2xl text-xs text-slate-300 mb-4 overflow-y-auto border border-[#C5A059]/25 scrollbar-thin max-h-60 lg:max-h-80 shadow-inner">
                        {report.criticalPoints.length > 0 ? (
                             <ul className="space-y-2">
                                {report.criticalPoints.map(point => (
                                    <li key={point.id} className="p-2.5 rounded-xl bg-[#170926] border border-[#C5A059]/30">
                                        <label htmlFor={`cp-checkbox-${point.id}`} className={`flex items-start gap-2.5 transition-opacity ${draftMode === 'manual' || selectedPoints.has(point.id) ? 'opacity-100' : 'opacity-40'} ${draftText ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                            <input 
                                                id={`cp-checkbox-${point.id}`}
                                                name={`cp-checkbox-${point.id}`}
                                                type="checkbox" 
                                                checked={selectedPoints.has(point.id)} 
                                                onChange={() => handleTogglePoint(point.id)}
                                                disabled={draftMode === 'exhaustive' || !!draftText}
                                                className="mt-0.5 rounded border-[#C5A059] text-[#DFBA73] focus:ring-[#FFE898]"
                                            />
                                            <div className="flex-1 text-xs space-y-1 font-garamond">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                                                        point.verificationStatus === 'VERIFICADA' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                                                        point.verificationStatus === 'PARCIALMENTE_VERIFICADA' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                                                        point.verificationStatus === 'NO_VERIFICADA' ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' :
                                                        'bg-[#2a133d] text-[#FFE898] border-[#C5A059]/40'
                                                    }`}>
                                                        {point.verificationStatus || 'VERIFICADA'}
                                                    </span>
                                                    <span className="font-cinzel font-bold text-[#FFE898] text-[10px]">{point.type}</span>
                                                </div>
                                                {point.title && <p className="text-slate-200 font-medium line-clamp-1">{point.title}</p>}
                                            </div>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-slate-500 italic">No se encontraron hallazgos en el análisis.</p>
                        )}
                    </div>
                </div>

                 <div>
                    <label htmlFor="considerations" className="flex items-center text-xs font-cinzel font-bold text-amber-200/80 mb-2 uppercase tracking-wider">
                        <span>Instrucciones Especiales</span>
                        <InfoTooltip text="Añada aquí cualquier instrucción de último minuto, como un tono específico o un argumento que deba tener prioridad." />
                    </label>
                    <textarea
                        id="considerations"
                        name="considerations"
                        value={additionalConsiderations}
                        onChange={(e) => setAdditionalConsiderations(e.target.value)}
                        placeholder="Ej: Dar prioridad al vicio de procedimiento. Tono deferente pero riguroso..."
                        rows={3}
                        className="w-full p-3 bg-[#0d0718] border border-[#C5A059]/30 focus:border-[#FFE898] rounded-xl focus:outline-none text-slate-100 text-xs font-garamond placeholder-slate-500 shadow-inner"
                        disabled={!!draftText}
                    />
                </div>
            </div>

            {/* Right Panel: Generator and Output */}
            <div className="lg:col-span-2 relative bg-[#12071d]/90 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-[#C5A059]/40 shadow-[0_15px_40px_rgba(0,0,0,0.8)] flex flex-col justify-between overflow-hidden court-gold-frame">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#FFE898] to-transparent" />
                
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-[#2a133d] rounded-xl border border-[#C5A059]/50 text-[#FFE898]">
                            <PenTool className="w-5 h-5 text-[#FFE898]" />
                        </div>
                        <div>
                            <h3 className="text-lg sm:text-xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] via-[#FFE898] to-[#DFBA73]">{title}</h3>
                            <p className="text-xs text-amber-200/70 font-garamond mt-0.5">{description}</p>
                        </div>
                    </div>
                    
                    {!draftText && !error && (
                        <div className="my-6">
                            <button
                                onClick={handleGenerateDraft}
                                disabled={isLoading || selectedPoints.size === 0}
                                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-[#DFBA73] via-[#FFE898] to-[#C5A059] hover:from-[#FFE898] hover:to-[#DFBA73] text-[#08040d] font-cinzel font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.35)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin text-[#08040d]" />
                                        <span>Generando Borrador Forense...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4 text-[#08040d]" />
                                        <span>{buttonText}</span>
                                    </>
                                )}
                            </button>
                            {selectedPoints.size === 0 && (
                                <p className="text-xs font-garamond text-rose-400 mt-2 text-center">Debe seleccionar al menos un hallazgo para generar un borrador.</p>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="my-4 p-4 text-xs font-garamond text-rose-300 bg-rose-950/40 rounded-2xl border border-rose-500/40 flex items-center justify-between">
                            <span><strong>Error:</strong> {error}</span>
                            <button onClick={handleGenerateDraft} className="underline font-bold text-rose-200 hover:text-white">
                                Reintentar
                            </button>
                        </div>
                    )}
                    
                    <div className="mt-4 relative">
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="draft-output" className="text-xs font-cinzel font-bold text-amber-200/80 uppercase tracking-wider">
                                {draftText ? "Borrador Judicial Estructurado" : "Consola de Redacción"}
                            </label>
                            {draftText && (
                                <div className="flex gap-2 font-cinzel">
                                    <button
                                        onClick={handleCopy}
                                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#2a133d] hover:bg-[#3d1c58] text-[#FFE898] border border-[#C5A059]/40 flex items-center gap-1.5 transition-colors"
                                    >
                                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#DFBA73]" />}
                                        <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
                                    </button>
                                    <button
                                        onClick={handleExportDraft}
                                        disabled={isExporting}
                                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#DFBA73] to-[#C5A059] hover:from-[#FFE898] hover:to-[#DFBA73] text-[#08040d] flex items-center gap-1.5 shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-50 transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5 text-[#08040d]" />
                                        <span>{isExporting ? 'Exportando...' : 'Exportar (.docx)'}</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <textarea
                            id="draft-output"
                            name="draft-output"
                            readOnly
                            value={draftText || (isLoading ? 'Generando borrador procesal con base en hallazgos y doctrina seleccionada...' : '')}
                            placeholder="El borrador generado se renderizará en esta consola..."
                            rows={16}
                            className="w-full p-4 bg-[#0d0718] border border-[#C5A059]/30 focus:border-[#FFE898] rounded-2xl focus:outline-none text-slate-100 text-xs sm:text-sm font-garamond whitespace-pre-wrap leading-relaxed shadow-inner"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DraftingAssistantTab;
