import React, { useState, useCallback } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { extractTextFromFile } from '../services/fileExtractor';
import type { Attachment } from '../types';
import Card from './Card';
import HelpButton from './HelpButton';
import { motion } from 'motion/react';
import { 
  FileText, 
  Trash2, 
  UploadCloud, 
  ArrowLeft, 
  Scale, 
  GitCompare, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

const FileDisplay: React.FC<{ file: Attachment; onRemove: () => void }> = ({ file, onRemove }) => {
    return (
        <div className="p-4 rounded-2xl bg-[#180926]/90 border border-[#C5A059]/40 flex items-center justify-between shadow-inner">
            <div className="flex items-center space-x-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-[#8a2232]/30 text-[#f5d76e] border border-[#C5A059]/40 flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#FFE898]" />
                </div>
                <div className="min-w-0">
                    <p className="font-serif text-xs sm:text-sm font-bold text-white truncate">{file.name}</p>
                    <p className="text-[11px] font-cinzel text-amber-200/60">
                        {(file.size / 1024).toFixed(1)} KB • <span className="text-emerald-400 font-semibold">{(file.status || 'ready').toUpperCase()}</span>
                    </p>
                </div>
            </div>
            <button 
                onClick={onRemove} 
                className="p-2 text-amber-200/60 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                title="Eliminar archivo"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
};

const FileInput: React.FC<{ onFileAdded: (file: File) => void; isProcessing: boolean; accept: string; label: string }> = ({ onFileAdded, isProcessing, accept, label }) => {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            onFileAdded(event.target.files[0]);
            event.target.value = '';
        }
    };
    return (
        <label className={`flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-2xl bg-[#180926]/60 transition-all duration-300 border-[#C5A059]/40 hover:border-[#FFE898] hover:bg-[#180926]/90 ${isProcessing ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}>
            <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="p-3.5 rounded-2xl bg-[#8a2232]/30 text-[#FFE898] border border-[#C5A059]/50 mb-3 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                    <UploadCloud className="w-7 h-7 text-[#FFE898]" />
                </div>
                <p className="text-xs sm:text-sm font-cinzel font-bold text-white">{label}</p>
                <p className="text-[11px] text-amber-200/60 font-serif mt-1">Arrastre o haga clic (.PDF, .DOCX, .TXT)</p>
            </div>
            <input type="file" className="hidden" onChange={handleFileChange} disabled={isProcessing} accept={accept} />
        </label>
    );
};

const ComparativeUploadStep: React.FC = () => {
    const {
        primaryFile: docA,
        setPrimaryFile: setDocA,
        documentB: docB,
        setDocumentB,
        startComparativeAnalysis,
        isLoading,
        error,
        goBack
    } = useAnalysis();

    const [isProcessingA, setIsProcessingA] = useState(false);
    const [isProcessingB, setIsProcessingB] = useState(false);
    
    const processFile = useCallback(async (file: File, setDoc: React.Dispatch<React.SetStateAction<Attachment | null>>, setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>) => {
        setIsProcessing(true);
        const placeholder: Attachment = { name: file.name, size: file.size, type: file.type, isPrimary: false, status: 'processing', evidenceType: 'DOCUMENT' };
        setDoc(placeholder);
        try {
            const extractedText = await extractTextFromFile(file);
            setDoc({ ...placeholder, status: 'ready', extractedText });
        } catch (err) {
            setDoc({ ...placeholder, status: 'error', error: err instanceof Error ? err.message : 'Error' });
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const isReadyForAnalysis = docA?.status === 'ready' && docB?.status === 'ready' && !isLoading;

    return (
        <div className="space-y-6 max-w-5xl mx-auto py-2">
             <div className="flex justify-between items-center pb-2">
                <motion.button 
                    whileHover={{ x: -4 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={goBack} 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#180926]/90 border border-[#C5A059]/40 text-xs font-cinzel font-bold text-[#f5d76e] hover:text-white hover:border-[#FFE898] transition-all shadow-md"
                >
                    <ArrowLeft className="w-3.5 h-3.5 text-[#f5d76e]" />
                    <span>Retornar al Cockpit</span>
                </motion.button>
                <HelpButton />
            </div>

            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8a2232]/30 border border-[#C5A059]/40 text-[#FFE898] text-xs font-cinzel font-bold">
                    <GitCompare className="w-3.5 h-3.5 text-[#f5d76e]" />
                    <span>MODO DE AUDITORÍA ADVERSARIAL</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-cinzel text-white tracking-wide">
                    Análisis Comparativo & Confrontación Fáctica
                </h2>
                <p className="text-xs sm:text-sm text-amber-100/70 font-serif max-w-2xl mx-auto">
                    Cargue dos piezas procesales (ej. Demanda vs. Contestación o Sentencia vs. Apelación) para cruzar afirmaciones y aislar inconsistencias.
                </p>
            </div>

            {error && (
                <div className="p-4 text-xs font-serif text-rose-200 bg-rose-950/60 border border-rose-500/40 rounded-2xl flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card 
                    title="Pieza Procesal A (Tesis / Demanda)" 
                    icon={<FileText className="w-5 h-5 text-[#f5d76e]" />}
                    badge={
                        <span className="text-[10px] font-cinzel font-bold px-2 py-0.5 rounded bg-[#8a2232]/30 text-[#FFE898] border border-[#C5A059]/40">
                            DOCUMENTO A
                        </span>
                    }
                >
                    {!docA ?
                        <FileInput 
                            onFileAdded={(file) => processFile(file, setDocA, setIsProcessingA)} 
                            isProcessing={isProcessingA} 
                            accept=".pdf,.docx,.txt" 
                            label="Cargar Pieza Procesal A"
                        /> :
                        <FileDisplay file={docA} onRemove={() => setDocA(null)} />
                    }
                </Card>

                <Card 
                    title="Pieza Procesal B (Antítesis / Contestación)" 
                    icon={<Scale className="w-5 h-5 text-[#f5d76e]" />}
                    badge={
                        <span className="text-[10px] font-cinzel font-bold px-2 py-0.5 rounded bg-[#8a2232]/30 text-[#FFE898] border border-[#C5A059]/40">
                            DOCUMENTO B
                        </span>
                    }
                >
                    {!docB ?
                        <FileInput 
                            onFileAdded={(file) => processFile(file, setDocumentB, setIsProcessingB)} 
                            isProcessing={isProcessingB} 
                            accept=".pdf,.docx,.txt" 
                            label="Cargar Pieza Procesal B"
                        /> :
                        <FileDisplay file={docB} onRemove={() => setDocumentB(null)} />
                    }
                </Card>
            </div>

            <div className="text-center pt-4">
                <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={startComparativeAnalysis} 
                    disabled={!isReadyForAnalysis} 
                    className="relative group px-12 py-4 bg-gradient-to-r from-[#8a2232] to-[#59143a] hover:from-[#a32a3c] hover:to-[#6d1a47] text-white text-sm font-cinzel font-bold rounded-2xl shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_45px_rgba(212,175,55,0.5)] border border-[#FFE898]/70 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 inline-flex items-center gap-3 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Ejecutando Confrontación Adversarial...</span>
                        </>
                    ) : (
                        <>
                            <GitCompare className="w-4 h-4 text-[#FFE898]" />
                            <span>Iniciar Confrontación Cruzada</span>
                        </>
                    )}
                </motion.button>
            </div>
        </div>
    );
};

export default ComparativeUploadStep;
