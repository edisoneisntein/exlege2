import React, { useMemo, useCallback, memo } from 'react';
import type { Attachment } from '../types';
import { useAnalysis } from '../context/AnalysisContext';
import { useFileProcessor } from '../hooks/useFileProcessor';
import { useWebSearch } from '../hooks/useWebSearch';
import InfoTooltip from './InfoTooltip';
import HelpButton from './HelpButton';
import { motion } from 'motion/react';
import { 
  FileText, 
  UploadCloud, 
  Layers, 
  Search, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Globe, 
  Languages, 
  Image as ImageIcon, 
  Loader2,
  Scale,
  FileCheck,
  Tag,
  Gavel,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';

const FileInput: React.FC<{ title: string, description: string, onFilesAdded: (files: File[]) => void, isProcessing: boolean, isPrimary?: boolean, accept: string }> = memo(({ title, description, onFilesAdded, isProcessing, isPrimary = false, accept }) => {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    onFilesAdded(Array.from(event.target.files));
    event.target.value = ''; 
  };

  return (
    <div className="w-full">
        <label 
            htmlFor={isPrimary ? 'primary-upload' : `evidence-upload-${title.replace(/\s+/g, '-').toLowerCase()}`} 
            className={`group relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-3xl bg-[#0f0718]/80 backdrop-blur-md transition-all duration-300 overflow-hidden ${
                isProcessing 
                    ? 'cursor-wait border-[#3a1d4f] opacity-60' 
                    : isPrimary 
                      ? 'cursor-pointer border-[#C5A059]/60 hover:border-[#FFE898] hover:bg-[#1a0c28]/90 shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:shadow-[0_0_35px_rgba(212,175,55,0.3)]'
                      : 'cursor-pointer border-[#472265]/70 hover:border-[#C5A059]/60 hover:bg-[#160a22]/80 shadow-inner'
            }`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-purple-900/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center justify-center text-center p-4">
                 <div className={`p-3.5 rounded-2xl border mb-3 transition-all duration-300 group-hover:scale-110 ${
                     isPrimary 
                        ? 'bg-[#2a133d] text-[#f5d76e] border-[#d4af37]/60 group-hover:bg-[#d4af37] group-hover:text-slate-950 shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                        : 'bg-[#1a0c26] text-amber-300/70 border-[#3d1e56] group-hover:border-[#d4af37]/60 group-hover:text-[#f5d76e]'
                 }`}>
                     <UploadCloud className="w-6 h-6" />
                 </div>
                <p className="mb-1 text-sm font-cinzel font-bold text-white group-hover:text-[#f7e7a9] transition-colors">{title}</p>
                <p className="text-xs text-amber-200/60 font-garamond italic text-sm">{description}</p>
            </div>
            <input 
                id={isPrimary ? 'primary-upload' : `evidence-upload-${title.replace(/\s+/g, '-').toLowerCase()}`} 
                name={isPrimary ? 'primary-upload' : `evidence-upload-${title.replace(/\s+/g, '-').toLowerCase()}`} 
                type="file" 
                className="hidden" 
                multiple={!isPrimary} 
                onChange={handleFileChange} 
                disabled={isProcessing} 
                accept={accept} 
            />
        </label>
    </div>
  );
});

FileInput.displayName = 'FileInput';

const FileList: React.FC<{ files: Attachment[], onRemove: (name: string) => void, onTranslate: (file: Attachment) => void, translatingFile: string | null, onTagsChange: (fileName: string, tags: string[]) => void }> = memo(({ files, onRemove, onTranslate, translatingFile, onTagsChange }) => {
    const getFileIcon = (file: Attachment) => {
        if (file.evidenceType === 'IMAGE') return <ImageIcon className="h-5 w-5 text-amber-400 flex-shrink-0" />;
        if (file.evidenceType === 'WEB_SEARCH') return <Globe className="h-5 w-5 text-amber-300 flex-shrink-0" />;
        if (file.type?.startsWith('application/pdf')) return <FileText className="h-5 w-5 text-rose-400 flex-shrink-0" />;
        if (file.type?.includes('word')) return <FileText className="h-5 w-5 text-amber-300 flex-shrink-0" />;
        return <FileCheck className="h-5 w-5 text-slate-300 flex-shrink-0" />;
    };

    const StatusIndicator: React.FC<{ status: Attachment['status']; isTranslated: boolean; error?: string; }> = ({ status, isTranslated, error }) => {
        if (status === 'processing') return (
            <span className="text-xs text-amber-300 flex items-center gap-1.5 font-mono">
                <Loader2 className="animate-spin h-3.5 w-3.5" /> Procesando
            </span>
        );
        if (status === 'error') return (
            <span className="text-xs text-rose-400 flex items-center gap-1.5 cursor-help font-mono" title={error}>
                <AlertCircle className="h-4 w-4" />
                Error
            </span>
        );
        if (status === 'ready' && isTranslated) return (
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="h-4 w-4" /> Traducido
            </span>
        );
        if (status === 'ready') return (
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="h-4 w-4" /> Autenticado
            </span>
        );
        return null;
    };

    return (
        <ul className="space-y-3 mt-4">
            {files.map((file) => (
                <li key={file.name} className="flex flex-col bg-[#0d0615]/90 border border-[#C5A059]/40 hover:border-[#FFE898] p-4 rounded-2xl text-sm transition-all duration-300 shadow-lg">
                    <div className="flex items-center w-full">
                        <div className="flex-shrink-0 mr-3 p-2.5 bg-[#251036] rounded-xl border border-[#d4af37]/50">{getFileIcon(file)}</div>
                        <div className="flex-grow min-w-0">
                            <p className="font-cinzel font-bold text-white truncate text-xs sm:text-sm" title={file.name}>
                                {file.name}
                            </p>
                            <p className="text-amber-200/60 text-[11px] font-mono mt-0.5">{(file.size / 1024).toFixed(2)} KB • HASH: {file.name.slice(0, 8)}</p>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-3 ml-3">
                            <StatusIndicator status={file.status} isTranslated={!!file.translatedText} error={file.error} />
                            {file.evidenceType === 'DOCUMENT' && file.status === 'ready' && !file.translatedText && (
                                <button
                                    onClick={() => onTranslate(file)}
                                    disabled={translatingFile === file.name}
                                    className="p-2 bg-[#2a133d] hover:bg-[#3d1c58] text-[#f5d76e] border border-[#d4af37]/50 rounded-xl disabled:opacity-40 transition-colors"
                                    aria-label={`Traducir el archivo ${file.name} a Español`}
                                    title="Traducir a Español Jurídico"
                                >
                                    {translatingFile === file.name 
                                        ? <Loader2 className="animate-spin h-4 w-4 text-[#f5d76e]" />
                                        : <Languages className="h-4 w-4 text-[#f5d76e]" />
                                    }
                                </button>
                            )}
                            <button
                                onClick={() => onRemove(file.name)}
                                className="text-slate-400 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-950/40 transition-colors"
                                aria-label={`Eliminar el archivo ${file.name}`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    {!file.isPrimary && file.status === 'ready' && (
                        <div className="mt-3 pt-3 border-t border-[#341846] flex items-center gap-2">
                             <Tag className="w-3.5 h-3.5 text-[#f5d76e] shrink-0" />
                             <input
                                type="text"
                                id={`tags-${file.name}`}
                                name={`tags-${file.name}`}
                                placeholder="Añadir etiquetas procesales (ej. contrato, peritaje, cláusula penal)..."
                                defaultValue={file.tags?.join(', ') || ''}
                                onBlur={(e) => onTagsChange(file.name, e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                                className="w-full text-xs px-3 py-1.5 bg-[#170a24] border border-[#3d1e56] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] font-garamond italic"
                            />
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
});

FileList.displayName = 'FileList';

export const UploadStep: React.FC = () => {
  const { 
      error: analysisError, 
      startAnalysis, 
      isLoading,
      primaryFile,
      setPrimaryFile,
      evidenceFiles,
      setEvidenceFiles,
      goBack
  } = useAnalysis();

  const {
      processAndAddFiles,
      handleTranslateFile,
      translatingFile,
      processingError,
      isProcessingAnyFile
  } = useFileProcessor(setPrimaryFile, setEvidenceFiles);

  const webSearch = useWebSearch(useCallback((newFile) => {
      setEvidenceFiles(prev => [...prev, newFile]);
  }, [setEvidenceFiles]));

  const anyFileProcessing = useMemo(() => {
    return isProcessingAnyFile(primaryFile, evidenceFiles) || webSearch.isSearching;
  }, [primaryFile, evidenceFiles, isProcessingAnyFile, webSearch.isSearching]);

  const handleRunAnalysis = () => {
    if (!primaryFile || !primaryFile.extractedText || primaryFile.status !== 'ready') {
      alert("Debe subir y procesar el documento principal para poder iniciar el análisis.");
      return;
    }
    startAnalysis();
  };
    
  const handleRemoveFile = useCallback((name: string) => {
      if (primaryFile && primaryFile.name === name) {
          setPrimaryFile(null);
      } else {
          setEvidenceFiles(prev => prev.filter(f => f.name !== name));
      }
  }, [primaryFile, setPrimaryFile, setEvidenceFiles]);
  
  const handleTagsChange = useCallback((fileName: string, tags: string[]) => {
      setEvidenceFiles(prev => prev.map(f => f.name === fileName ? { ...f, tags } : f));
  }, [setEvidenceFiles]);

  const analysisButtonText = "Iniciar Juicio & Autopsia Forense";

  return (
      <div className="space-y-6 animate-fade-in-slow text-slate-100 max-w-5xl mx-auto">
          {/* Top Navigation Bar: Retornar al Cockpit */}
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
              <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8a2232]/20 border border-[#C5A059]/40 text-[11px] font-cinzel text-[#f5d76e]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#f5d76e]" />
                      <span>Cámara de Radicación Activa</span>
                  </span>
                  <HelpButton />
              </div>
          </div>

          {(analysisError || processingError) && (
              <div className="p-4 mb-4 text-xs sm:text-sm text-rose-300 bg-rose-950/80 rounded-2xl border border-rose-500/50 backdrop-blur-md shadow-lg flex items-center gap-2" role="alert">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <div><span className="font-bold font-cinzel">Fallo Procesal:</span> {analysisError || processingError}</div>
              </div>
          )}

          {/* Tarjeta Paso 1: Documento Principal */}
          <div className="relative bg-[#12071d]/90 backdrop-blur-2xl border border-[#C5A059]/50 rounded-3xl p-7 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(212,175,55,0.15)] space-y-5 overflow-hidden">
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#FFE898] to-transparent pointer-events-none" />
              
              <div className="flex items-center gap-4 border-b border-[#3d1e56]/80 pb-5">
                  <div className="p-3 bg-[#2a133d] text-[#f5d76e] rounded-2xl border border-[#d4af37]/60 shadow-[0_0_15px_rgba(212,175,55,0.25)]">
                      <FileText className="w-6 h-6 text-[#f5d76e]" />
                  </div>
                  <div>
                      <span className="text-[10px] font-cinzel font-bold tracking-widest text-[#f5d76e] uppercase">FASE 01 • NÚCLEO PROCESAL</span>
                      <h3 className="text-lg sm:text-xl font-cinzel font-bold text-white tracking-tight">Fallo, Sentencia o Providencia a Deconstruir</h3>
                  </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-garamond italic text-base">
                  Cargue la decisión judicial central que será objeto de auditoría forense. Este documento es el fundamento obligatorio del análisis en el Tribunal Supremo.
              </p>

              {!primaryFile ? (
                   <FileInput 
                      title="Cargar providencia judicial o documento rector"
                      description="Formatos compatibles: .pdf, .docx, .txt (Sin límite de tamaño)"
                      onFilesAdded={(files) => processAndAddFiles(files, true)}
                      isProcessing={anyFileProcessing}
                      isPrimary={true}
                      accept=".pdf,.docx,.txt"
                   />
              ) : (
                  <FileList files={[primaryFile]} onRemove={handleRemoveFile} onTranslate={handleTranslateFile} translatingFile={translatingFile} onTagsChange={()=>{}} />
              )}
          </div>
          
          {/* Tarjeta Paso 2: Gestión de Evidencia */}
          <div className="relative bg-[#12071d]/90 backdrop-blur-2xl border border-[#C5A059]/40 rounded-3xl p-7 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_20px_rgba(212,175,55,0.1)] space-y-6 overflow-hidden">
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#DFBA73]/60 to-transparent pointer-events-none" />

              <div className="flex items-center gap-4 border-b border-[#3d1e56]/80 pb-5">
                  <div className="p-3 bg-[#2a133d] text-[#f5d76e] rounded-2xl border border-[#d4af37]/60 shadow-inner">
                      <Layers className="w-6 h-6 text-[#f5d76e]" />
                  </div>
                  <div>
                      <span className="text-[10px] font-cinzel font-bold tracking-widest text-[#f5d76e] uppercase">FASE 02 • SUSTENTO PROBATORIO</span>
                      <h3 className="text-lg sm:text-xl font-cinzel font-bold text-white tracking-tight flex items-center gap-2">
                          Gestión de Evidencia y Pruebas (Opcional)
                          <InfoTooltip text="Añadir documentos de prueba, transcripciones o informes mejora radicalmente la calidad del análisis. Asigne etiquetas a cada prueba para que la IA pueda vincularlas inteligentemente a los hallazgos en el informe final." />
                      </h3>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <FileInput 
                      title="Cargar Documentos de Prueba"
                      description="Archivos .pdf, .docx, .xlsx, .txt"
                      onFilesAdded={(files) => processAndAddFiles(files, false)}
                      isProcessing={anyFileProcessing}
                      accept=".pdf,.docx,.xlsx,.xls,.txt"
                   />
                  <FileInput
                      title="Cargar Evidencia Visual"
                      description="Imágenes .png, .jpg, .jpeg, .webp"
                      onFilesAdded={(files) => processAndAddFiles(files, false)}
                      isProcessing={anyFileProcessing}
                      accept="image/png,image/jpeg,image/webp"
                  />
              </div>
                   
              {/* Web Search input */}
              <div className="space-y-2 pt-2">
                   <label htmlFor="web-search" className="text-xs sm:text-sm font-cinzel font-bold text-amber-200 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#f5d76e]" />
                      Investigación Jurisprudencial en Línea
                      <InfoTooltip text="La IA realizará una búsqueda en tiempo real sobre la jurisprudencia o doctrina que especifique. Sintetizará los resultados en un informe con valor probatorio." />
                   </label>
                   <div className="flex gap-3">
                       <input
                           id="web-search"
                           name="web-search"
                           type="text"
                           value={webSearch.query}
                           onChange={(e) => webSearch.setQuery(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && !webSearch.isSearching && webSearch.handleSearch()}
                           placeholder="Ej. Jurisprudencia sobre vulneración al debido proceso en casación..."
                           className="w-full px-4 py-3 bg-[#0c0514] border border-[#3d1e56] rounded-2xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] shadow-inner font-garamond italic text-base"
                           disabled={webSearch.isSearching}
                       />
                       <button
                           onClick={webSearch.handleSearch}
                           disabled={webSearch.isSearching || !webSearch.query}
                           className="px-6 py-3 bg-gradient-to-r from-[#8a2232] to-[#59143a] hover:from-[#a3283c] hover:to-[#731a4b] text-white font-cinzel font-bold text-xs sm:text-sm rounded-2xl disabled:opacity-40 transition-all shadow-lg shadow-rose-950/40 whitespace-nowrap flex items-center gap-2 border border-[#ff8597]"
                       >
                          {webSearch.isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                          <span>{webSearch.isSearching ? 'Buscando...' : 'Indagar'}</span>
                       </button>
                   </div>
                   {webSearch.error && <p className="text-xs text-rose-400 mt-1 font-mono">{webSearch.error}</p>}
              </div>
               
              {evidenceFiles.length > 0 && <FileList files={evidenceFiles} onRemove={handleRemoveFile} onTranslate={handleTranslateFile} translatingFile={translatingFile} onTagsChange={handleTagsChange} />}
          </div>

          <div className="text-center pt-4 pb-2">
              <button
                  onClick={handleRunAnalysis}
                  disabled={isLoading || !primaryFile || primaryFile.status !== 'ready' || anyFileProcessing}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-12 py-4 bg-gradient-to-r from-[#59143a] via-[#8a2232] to-[#59143a] hover:from-[#731a4b] hover:to-[#731a4b] text-white font-cinzel font-black text-sm sm:text-base tracking-widest uppercase rounded-2xl shadow-[0_0_30px_rgba(138,34,50,0.7)] border-2 border-[#FFE898] focus:outline-none focus:ring-4 focus:ring-amber-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02]"
              >
                  {isLoading ? (
                      <>
                          <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-amber-200" />
                          <span>Deliberando en Cámara Forense...</span>
                      </>
                  ) : (
                      <>
                          <Gavel className="h-5 w-5 text-amber-200" />
                          <span>{analysisButtonText}</span>
                      </>
                  )}
              </button>
              {(!primaryFile || primaryFile.status !== 'ready') && <p className="text-xs text-amber-200/70 mt-3 font-cinzel tracking-wider">⚖ Es obligatorio cargar y procesar un documento principal para habilitar la sala.</p>}
              {anyFileProcessing && !isLoading && <p className="text-xs text-amber-300 mt-3 font-mono animate-pulse">⏳ Procesando ficheros y sellos de autenticidad en segundo plano...</p>}
          </div>
      </div>
  );
};

export default UploadStep;
