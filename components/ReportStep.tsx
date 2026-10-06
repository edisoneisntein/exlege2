import React, { useState, useMemo, lazy, Suspense } from 'react';
import type { FullAnalysisResult, Annotation, ReportSubStep, ArgumentAnalysis, AmendmentProposal, RefinementMotion } from '../types';
import DraftingAssistantTab from './AppealStrategyTab';
import { generateReportDocx, generateDraftDocx } from '../services/documentGenerator';
import LegalConsultantChat from './LegalConsultantChat';
import { useAnalysis } from '../context/AnalysisContext';
import InfoTooltip from './InfoTooltip';
import PageLoader from './PageLoader';
import DockedPanel from './DockedPanel';
import NavigationButtons from './report/NavigationButtons';
import Card from './Card';
import { SovereignLiveConsole } from './SovereignLiveConsole';
import { RefinementTransparencyCard } from './RefinementTransparencyCard';
import { 
  ShieldCheck, 
  FileText, 
  FlaskConical, 
  PenTool, 
  Zap, 
  Sparkles, 
  Download, 
  Users, 
  CheckCircle2, 
  Bot, 
  Copy, 
  Check, 
  AlertTriangle,
  RotateCcw,
  X,
  ArrowLeft,
  Crown
} from 'lucide-react';

const ArgumentLab = lazy(() => import('./ArgumentLab'));
const ReportReviewTab = lazy(() => import('./report/ReportReviewTab'));
const LegalGovernanceDashboard = lazy(() => import('./report/LegalGovernanceDashboard'));
const ArgumentAnalysisDisplay = lazy(() => import('./report/ArgumentAnalysisDisplay'));
const TimelineView = lazy(() => import('./report/TimelineView'));
const FinalValidationReportModal = lazy(() => import('./FinalValidationReportModal'));


const ReportStep: React.FC = () => {
    const { 
        analysisResult: fullResult, 
        fullReset, 
        refineAnalysis, 
        annotations, 
        addAnnotation, 
        reportSubStep, 
        goToReportSubStep,
        generateInitialDraft,
        isGeneratingDraft,
        initialDraft,
        runStressTestOnDraft,
        isStressTestingDraft,
        draftStressTestResult,
        runRefinement,
        isRefiningDraft,
        runAutonomousRefinementLoop,
        isRefinementLoopRunning,
        refinementLoopResult,
        finalDraft,
        draftError,
        promoteToRefinementMotion,
        motionToCreate,
        isLinkingInsight,
        suggestedCpId,
        submitRefinementMotion,
        amendmentProposal,
        isProposingAmendment,
        acceptAmendment,
        rejectAmendment,
        clearMotion,
        isGeneratingSummary,
        summaryError,
        clientSummary,
        generateClientSummary,
        clearClientSummary,
        isPerformingFinalValidation,
        finalValidationResult,
        finalValidationError,
        performFinalValidation,
        clearFinalValidation,
        analysisLog,
    } = useAnalysis();
    
    const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);
    const [annotationModal, setAnnotationModal] = useState<{open: boolean; text: string | null; author?: string}>({ open: false, text: null, author: undefined });
    const [selectedCpIdForAnnotation, setSelectedCpIdForAnnotation] = useState<string | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [refinementInstruction, setRefinementInstruction] = useState('');
    const [selectedCpIdForMotion, setSelectedCpIdForMotion] = useState<string | null>(null);
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
    const [isSummaryCopied, setIsSummaryCopied] = useState(false);
    const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
    
    const timelineEvents = useMemo(() => fullResult?.report.timeline, [fullResult]);

    React.useEffect(() => {
        if (clientSummary || summaryError) {
            setIsSummaryModalOpen(true);
        }
    }, [clientSummary, summaryError]);

    const handleCloseSummaryModal = () => {
        setIsSummaryModalOpen(false);
        clearClientSummary();
    };
    
    const handleCopySummary = () => {
        if (!clientSummary) return;
        navigator.clipboard.writeText(clientSummary);
        setIsSummaryCopied(true);
        setTimeout(() => setIsSummaryCopied(false), 2500);
    };


    const handlePromoteToAnnotation = (text: string, author?: string) => {
        setAnnotationModal({ open: true, text, author });
        if (fullResult && fullResult.report.criticalPoints.length > 0) {
            setSelectedCpIdForAnnotation(fullResult.report.criticalPoints[0].id);
        }
    };

    const handleConfirmAnnotation = () => {
        if (selectedCpIdForAnnotation && annotationModal.text) {
            addAnnotation(selectedCpIdForAnnotation, annotationModal.text, annotationModal.author);
        }
        setAnnotationModal({ open: false, text: null, author: undefined });
        setSelectedCpIdForAnnotation(null);
    };

    const handleCopyFinalDraft = () => {
        if (!finalDraft) return;
        navigator.clipboard.writeText(finalDraft);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
    };

    const handleExportFinalDraft = async () => {
        if (!finalDraft) return;
        setIsExporting(true);
        setExportError(null);
        try {
            await generateDraftDocx(finalDraft, 'Borrador_Estrategico_Refinado.docx');
        } catch (error) {
            console.error("Failed to export final draft:", error);
            setExportError(error instanceof Error ? error.message : "Error al exportar el borrador refinado.");
        } finally {
            setIsExporting(false);
        }
    };
    
    const handleCancelMotion = () => {
        clearMotion();
        setRefinementInstruction('');
        setSelectedCpIdForMotion(null);
    };

    const handleSubmitMotion = () => {
        if (!refinementInstruction || !motionToCreate || !selectedCpIdForMotion) return;
        const motion: RefinementMotion = {
            insightText: motionToCreate.insightText,
            linkedCriticalPointId: selectedCpIdForMotion,
            refinementInstruction,
        };
        
        // Close the modal and clean up state first.
        handleCancelMotion();

        // Then, initiate the background process.
        submitRefinementMotion(motion);
    };

    React.useEffect(() => {
        if (suggestedCpId) {
            setSelectedCpIdForMotion(suggestedCpId);
        }
    }, [suggestedCpId]);


    if (!fullResult) {
        return <PageLoader />;
    }
    
    const report = fullResult.report;

    const isEffectivelyEmpty = !report.caseOverview || report.criticalPoints?.length === 0;

    const handleGenerateDocument = async () => {
        setIsGeneratingDoc(true);
        setExportError(null);
        try {
            await generateReportDocx(report, fullResult.documentType);
        } catch (error) {
            console.error("Failed to generate document:", error);
            setExportError(error instanceof Error ? error.message : "Error al generar el informe en formato .docx");
        } finally {
            setIsGeneratingDoc(false);
        }
    };
    
    if (isEffectivelyEmpty) {
        return (
             <div className="space-y-12 animate-fade-in-slow">
                <div className="text-center py-10 px-6 bg-red-100 border-2 border-red-500 rounded-lg shadow-2xl shadow-red-500/20">
                     <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <h2 className="mt-4 text-2xl font-extrabold text-red-900">Fallo Catastrófico del Análisis</h2>
                    <p className="mt-2 text-md text-red-800">La IA devolvió un informe sin contenido sustancial. Esto es inaceptable.</p>
                    <p className="mt-2 text-sm text-slate-700">Esto puede deberse a un problema con los documentos de entrada o a un fallo interno del modelo. Por favor, intente el análisis de nuevo.</p>
                     <div className="mt-8">
                        <button
                          onClick={fullReset}
                          className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 transition-colors"
                        >
                          Reiniciar Análisis
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isValidationModalOpen = !!finalValidationResult || isPerformingFinalValidation || !!finalValidationError;

    const renderSubStepContent = () => {
        switch (reportSubStep) {
            case 'governance':
                return (
                    <>
                        <Suspense fallback={<PageLoader />}>
                            <LegalGovernanceDashboard
                                report={report}
                                documentType={fullResult.documentType}
                                onJumpToReview={(cpId) => {
                                    goToReportSubStep('review');
                                }}
                                onNavigateSubStep={(sub) => goToReportSubStep(sub)}
                            />
                        </Suspense>
                    </>
                );
            case 'review':
                return (
                    <>
                        <Suspense fallback={<PageLoader />}>
                            <ReportReviewTab 
                                fullResult={fullResult} 
                                annotations={annotations} 
                                addAnnotation={addAnnotation}
                                onOpenTimeline={() => setIsTimelineModalOpen(true)}
                                onOpenGovernance={() => goToReportSubStep('governance')}
                            />
                        </Suspense>
                        <NavigationButtons
                            onContinue={() => goToReportSubStep('draft')}
                            continueText="Continuar a Borrador Inicial"
                        />
                    </>
                );
            case 'lab':
                return (
                    <>
                        <Suspense fallback={<PageLoader />}>
                            <ArgumentLab fullResult={fullResult} />
                        </Suspense>
                        <NavigationButtons
                            onBack={() => goToReportSubStep('review')}
                            backText="Volver a la Revisión"
                        />
                    </>
                );
            case 'draft':
                return (
                    <>
                        <DraftingAssistantTab
                            report={report} 
                            aiPersonality={fullResult.aiPersonality}
                            documentType={fullResult.documentType}
                            onGenerateDraft={generateInitialDraft}
                            isLoading={isGeneratingDraft}
                            draftText={initialDraft}
                            error={draftError}
                        />
                        <NavigationButtons
                            onBack={() => goToReportSubStep('review')}
                            backText="Volver a Revisión"
                            onContinue={() => goToReportSubStep('stress_test')}
                            continueText="Someter a Stress Test"
                            showContinue={!!initialDraft}
                        />
                    </>
                );
            case 'stress_test':
                 return (
                    <Card
                        title="Stress Test del Borrador"
                        icon={<Zap className="h-5 w-5 text-[#DFBA73]" />}
                    >
                         <p className="text-xs sm:text-sm text-amber-100/70 font-serif italic mb-4 leading-relaxed">
                            Un 'Magistrado de IA' analizará el borrador completo para encontrar sus debilidades, anticipar contra-argumentos y evaluar su solidez general.
                        </p>
                        <textarea 
                            id="stress-test-initial-draft" 
                            name="stress-test-initial-draft" 
                            readOnly 
                            value={initialDraft || ''} 
                            rows={10} 
                            className="w-full p-4 bg-[#08040d]/90 border border-[#DFBA73]/30 rounded-2xl font-mono text-xs text-amber-100/90 mb-6 shadow-inner focus:outline-none focus:border-[#FFE898]/50 custom-scrollbar leading-relaxed" 
                        />
                        
                        {!draftStressTestResult && !draftError && (
                             <div className="text-center mb-6">
                                <button 
                                    onClick={runStressTestOnDraft} 
                                    disabled={isStressTestingDraft} 
                                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#DFBA73] via-[#FFE898] to-[#C5A059] text-slate-950 font-bold hover:brightness-110 shadow-[0_0_20px_rgba(223,186,115,0.25)] border border-[#DFBA73] rounded-2xl font-cinzel text-xs sm:text-sm disabled:opacity-50 transition-all cursor-pointer"
                                >
                                    <Zap className="w-4 h-4 text-slate-950" />
                                    <span>{isStressTestingDraft ? 'Analizando Solidez Procesal...' : 'Iniciar Stress Test'}</span>
                                </button>
                            </div>
                        )}
                        {draftError && (
                            <div className="my-4 p-4 text-xs sm:text-sm text-rose-300 bg-rose-950/70 rounded-2xl border border-rose-500/40 text-center space-y-2">
                                <div><span className="font-bold font-cinzel text-rose-200">Fallo en Stress Test: </span>{draftError}</div>
                                <button onClick={runStressTestOnDraft} className="inline-block font-cinzel font-bold text-[#f5d76e] underline hover:text-white">
                                    Reintentar Stress Test
                                </button>
                            </div>
                        )}
                        
                        <Suspense fallback={<PageLoader />}>
                            {draftStressTestResult && <ArgumentAnalysisDisplay analysis={draftStressTestResult} />}
                        </Suspense>

                        <NavigationButtons
                            onBack={() => goToReportSubStep('draft')}
                            backText="Volver al Borrador"
                            onContinue={() => goToReportSubStep('refine')}
                            continueText="Continuar a Refinamiento Final"
                            showContinue={!!draftStressTestResult}
                        />

                    </Card>
                );
            case 'refine':
                return (
                    <Card
                        title="Refinamiento & Síntesis Final"
                        icon={<Sparkles className="h-5 w-5 text-[#f5d76e]" />}
                    >
                        <p className="text-xs sm:text-sm text-amber-100/70 font-garamond italic mb-5 leading-relaxed">
                            El Editor Legal Supremo sintetizará el borrador inicial junto a las objeciones y blindajes del Stress Test para consolidar la providencia en su máxima jerarquía argumentativa.
                        </p>

                        {!finalDraft && !draftError && (
                             <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                                <button 
                                    onClick={runRefinement} 
                                    disabled={isRefiningDraft || isRefinementLoopRunning} 
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#170a24] text-[#DFBA73] border border-[#DFBA73]/50 hover:bg-[#25103a] font-cinzel font-bold text-xs sm:text-sm rounded-2xl shadow-md disabled:opacity-50 transition-all cursor-pointer"
                                >
                                    <Sparkles className="w-4 h-4 text-[#DFBA73]" />
                                    <span>{isRefiningDraft ? 'Sintetizando...' : 'Síntesis Estándar'}</span>
                                </button>
                                <button 
                                    onClick={() => runAutonomousRefinementLoop(3)} 
                                    disabled={isRefiningDraft || isRefinementLoopRunning} 
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#DFBA73] via-[#FFE898] to-[#C5A059] text-[#08040d] font-cinzel font-black text-xs sm:text-sm rounded-2xl shadow-[0_0_25px_rgba(212,175,55,0.35)] hover:shadow-[0_0_35px_rgba(212,175,55,0.5)] disabled:opacity-50 transition-all cursor-pointer"
                                >
                                    <Crown className="w-4 h-4 text-[#08040d]" />
                                    <span>{isRefinementLoopRunning ? 'Ejecutando Bucle de Reflexión...' : 'Bucle de Reflexión Autónomo (≥95% Rigor)'}</span>
                                </button>
                            </div>
                        )}
                        {refinementLoopResult && (
                            <RefinementTransparencyCard result={refinementLoopResult} />
                        )}

                        {/* Sovereign Telemetry Console in Synthesis Mode */}
                        <div className="mb-6">
                            <SovereignLiveConsole 
                                logs={analysisLog}
                                title="Monitor de Invocación del Consorcio & Síntesis"
                                subtitle="Registro en vivo de pasadas de refinamiento, cotejo de folios y dictámenes del Magistrado Auditor."
                                isWorking={isRefiningDraft || isRefinementLoopRunning}
                                defaultExpanded={Boolean(isRefiningDraft || isRefinementLoopRunning || refinementLoopResult)}
                                maxHeightClass="max-h-48"
                            />
                        </div>
                         {draftError && (
                            <div className="my-4 p-4 text-xs sm:text-sm text-rose-300 bg-rose-950/70 rounded-2xl border border-rose-500/40 text-center space-y-2">
                                <div><span className="font-bold font-cinzel text-rose-200">Fallo en Síntesis: </span>{draftError}</div>
                                <button onClick={runRefinement} className="inline-block font-cinzel font-bold text-[#f5d76e] underline hover:text-white">
                                    Reintentar Refinamiento
                                </button>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <h4 className="font-cinzel font-bold text-xs text-amber-200/80 uppercase tracking-wider">Borrador Inicial</h4>
                                <textarea id="refine-initial-draft" name="refine-initial-draft" readOnly value={initialDraft || ''} rows={15} className="w-full p-3 bg-[#0d0617] border border-[#3d1e56] rounded-2xl font-mono text-xs text-slate-300 focus:outline-none scrollbar-thin" />
                            </div>
                             <div className="space-y-1.5">
                                <h4 className="font-cinzel font-bold text-xs text-[#f5d76e] uppercase tracking-wider flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-[#f5d76e]" />
                                    <span>Documento Final Refinado & Blindado</span>
                                </h4>
                                <textarea id="refine-final-draft" name="refine-final-draft" readOnly value={finalDraft || (isRefiningDraft ? 'Generando síntesis final y puliendo retórica...' : '')} rows={15} className="w-full p-3 bg-[#12071d] border border-[#C5A059]/60 rounded-2xl font-mono text-xs text-amber-100 focus:outline-none ring-1 ring-[#FFE898]/40 shadow-inner scrollbar-thin" />
                            </div>
                        </div>

                        {finalDraft && (
                            <div className="mt-5 flex justify-end gap-3 flex-wrap">
                                <button
                                    onClick={handleCopyFinalDraft}
                                    className="px-5 py-2.5 text-xs font-cinzel font-bold rounded-xl bg-[#1a0c26] text-amber-200 border border-[#C5A059]/40 hover:border-[#FFE898] hover:text-white transition-all inline-flex items-center gap-2"
                                >
                                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#DFBA73]" />}
                                    <span>{isCopied ? '¡Texto Copiado!' : 'Copiar Texto'}</span>
                                </button>
                                <button
                                    onClick={handleExportFinalDraft}
                                    disabled={isExporting}
                                    className="px-5 py-2.5 text-xs font-cinzel font-bold rounded-xl bg-gradient-to-r from-[#DFBA73] via-[#FFE898] to-[#C5A059] text-[#08040d] hover:brightness-110 disabled:opacity-50 transition-all inline-flex items-center gap-2 shadow-md cursor-pointer"
                                >
                                    {isExporting ? (
                                        <>
                                            <RotateCcw className="animate-spin h-3.5 w-3.5 text-[#08040d]" />
                                            <span>Exportando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Download className="h-3.5 w-3.5 text-[#08040d]" />
                                            <span>Exportar (.docx)</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        <NavigationButtons
                            onBack={() => goToReportSubStep('stress_test')}
                            backText="Volver a Stress Test"
                        />
                    </Card>
                );

            default:
                return null;
        }
    };

  return (
    <div className="relative text-slate-100">
        <div className={`transition-[padding-right] duration-500 ease-in-out ${isPanelOpen ? 'pr-0 lg:pr-[calc(40%+2rem)]' : 'pr-0'}`}>
            <div className="space-y-6 animate-fade-in-slow">
                
                {amendmentProposal && (
                     <div className="p-6 bg-[#0e0717]/90 border border-[#C5A059]/50 rounded-3xl shadow-[0_0_30px_rgba(212,175,55,0.15)] backdrop-blur-2xl animate-fade-in-up">
                        <div className="flex items-center gap-2 mb-2 text-[#FFE898] font-cinzel font-bold text-sm">
                            <Sparkles className="w-4 h-4 text-[#DFBA73]" />
                            <span>Propuesta de Enmienda de IA</span>
                        </div>
                        <p className="text-xs sm:text-sm text-amber-100/80 mb-4 font-serif">{amendmentProposal.justification}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                            <div className="p-4 bg-rose-950/30 rounded-2xl border border-rose-500/30">
                                <h4 className="font-cinzel font-bold text-xs text-rose-400 mb-1.5 uppercase">Texto Original</h4>
                                <p className="text-xs text-slate-300 font-serif">{amendmentProposal.originalText}</p>
                            </div>
                             <div className="p-4 bg-emerald-950/30 rounded-2xl border border-emerald-500/30">
                                <h4 className="font-cinzel font-bold text-xs text-emerald-400 mb-1.5 uppercase">Texto Propuesto</h4>
                                <p className="text-xs text-slate-200 font-serif">{amendmentProposal.proposedText}</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={rejectAmendment} className="px-4 py-2 text-xs font-cinzel font-bold rounded-xl bg-[#180926] text-amber-200/70 hover:text-white border border-[#C5A059]/30 transition-colors">Rechazar</button>
                            <button onClick={acceptAmendment} className="px-5 py-2 text-xs font-cinzel font-bold rounded-xl bg-gradient-to-r from-[#DFBA73] to-[#C5A059] text-[#08040d] hover:from-[#FFE898] hover:to-[#DFBA73] shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all">Aceptar Enmienda</button>
                        </div>
                    </div>
                )}
                {isProposingAmendment && <PageLoader />}
                
                {/* Global Sub-Step Navigation Header */}
                <div className="relative bg-[#12071d]/90 backdrop-blur-2xl border border-[#C5A059]/40 rounded-3xl p-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.1)] flex items-center justify-between gap-2 overflow-x-auto scrollbar-thin">
                    <div className="flex items-center gap-2 flex-nowrap w-full">
                        {/* Botón Retornar al Cockpit */}
                        <button
                            onClick={fullReset}
                            title="Retornar al Cockpit / Iniciar nuevo caso"
                            className="px-3.5 py-2.5 rounded-2xl text-xs font-cinzel font-bold transition-all whitespace-nowrap flex items-center gap-2 border bg-[#1a082c] border-[#C5A059]/50 text-[#f5d76e] hover:text-white hover:border-[#FFE898] hover:bg-[#2c0f48] shadow-md mr-1"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 text-[#f5d76e]" />
                            <span className="hidden sm:inline">Cockpit</span>
                        </button>

                        <button
                            onClick={() => goToReportSubStep('governance')}
                            className={`px-4 py-2.5 rounded-2xl text-xs font-cinzel font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                                reportSubStep === 'governance'
                                    ? 'bg-gradient-to-r from-[#8a2232] to-[#59143a] text-white border-[#FFE898] shadow-[0_0_20px_rgba(212,175,55,0.3)] font-black'
                                    : 'bg-[#180926]/70 border-[#3d1e56] text-amber-100/70 hover:text-white hover:border-[#d4af37]/50'
                            }`}
                        >
                            <ShieldCheck className="w-4 h-4 text-[#f5d76e]" />
                            <span>Gobernanza V5</span>
                        </button>

                        <button
                            onClick={() => goToReportSubStep('review')}
                            className={`px-4 py-2.5 rounded-2xl text-xs font-cinzel font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                                reportSubStep === 'review'
                                    ? 'bg-gradient-to-r from-[#8a2232] to-[#59143a] text-white border-[#FFE898] shadow-[0_0_20px_rgba(212,175,55,0.3)] font-black'
                                    : 'bg-[#180926]/70 border-[#3d1e56] text-amber-100/70 hover:text-white hover:border-[#d4af37]/50'
                            }`}
                        >
                            <FileText className="w-4 h-4 text-[#f5d76e]" />
                            <span>Revisión & Hallazgos</span>
                        </button>

                        <button
                            onClick={() => goToReportSubStep('lab')}
                            className={`px-4 py-2.5 rounded-2xl text-xs font-cinzel font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                                reportSubStep === 'lab'
                                    ? 'bg-gradient-to-r from-[#8a2232] to-[#59143a] text-white border-[#FFE898] shadow-[0_0_20px_rgba(212,175,55,0.3)] font-black'
                                    : 'bg-[#180926]/70 border-[#3d1e56] text-amber-100/70 hover:text-white hover:border-[#d4af37]/50'
                            }`}
                        >
                            <FlaskConical className="w-4 h-4 text-[#f5d76e]" />
                            <span>Laboratorio</span>
                        </button>

                        <button
                            onClick={() => goToReportSubStep('draft')}
                            className={`px-4 py-2.5 rounded-2xl text-xs font-cinzel font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                                reportSubStep === 'draft'
                                    ? 'bg-gradient-to-r from-[#8a2232] to-[#59143a] text-white border-[#FFE898] shadow-[0_0_20px_rgba(212,175,55,0.3)] font-black'
                                    : 'bg-[#180926]/70 border-[#3d1e56] text-amber-100/70 hover:text-white hover:border-[#d4af37]/50'
                            }`}
                        >
                            <PenTool className="w-4 h-4 text-[#f5d76e]" />
                            <span>Redacción</span>
                        </button>

                        <button
                            onClick={() => goToReportSubStep('stress_test')}
                            className={`px-4 py-2.5 rounded-2xl text-xs font-cinzel font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                                reportSubStep === 'stress_test'
                                    ? 'bg-[#DFBA73]/15 text-[#DFBA73] border-[#DFBA73]/50 shadow-[0_0_20px_rgba(223,186,115,0.2)] font-black'
                                    : 'bg-[#180926]/70 border-[#3d1e56] text-amber-100/70 hover:text-white hover:border-[#d4af37]/50'
                            }`}
                        >
                            <Zap className={`w-4 h-4 ${reportSubStep === 'stress_test' ? 'text-[#DFBA73]' : 'text-[#f5d76e]'}`} />
                            <span>Stress Test</span>
                        </button>

                        <button
                            onClick={() => goToReportSubStep('refine')}
                            className={`px-4 py-2.5 rounded-2xl text-xs font-cinzel font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                                reportSubStep === 'refine'
                                    ? 'bg-gradient-to-r from-[#8a2232] to-[#59143a] text-white border-[#FFE898] shadow-[0_0_20px_rgba(212,175,55,0.3)] font-black'
                                    : 'bg-[#180926]/70 border-[#3d1e56] text-amber-100/70 hover:text-white hover:border-[#d4af37]/50'
                            }`}
                        >
                            <Sparkles className="w-4 h-4 text-[#f5d76e]" />
                            <span>Síntesis Final</span>
                        </button>
                    </div>
                </div>

                {renderSubStepContent()}

                {exportError && (
                    <div className="mt-6 p-5 bg-amber-950/30 border border-amber-500/40 rounded-3xl shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-fade-in-up text-center">
                        <div className="flex items-center justify-center gap-2 mb-2 text-amber-400 font-mono font-bold">
                            <AlertTriangle className="h-5 w-5 text-amber-400" />
                            <span>Inconveniente al Guardar el Archivo</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-sans">
                            Por restricciones del navegador o de seguridad, el guardado automático de archivos de Office (.docx) puede verse interrumpido. 
                            <strong> ¡El análisis está completo arriba!</strong> Puedes seleccionar y copiar el texto directamente en pantalla.
                        </p>
                        <p className="text-[11px] font-mono text-slate-500 mt-1">Detalles: {exportError}</p>
                        <button 
                            className="mt-3 px-4 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-mono font-bold rounded-xl text-xs transition-colors"
                            onClick={() => setExportError(null)}
                        >
                            Entendido
                        </button>
                    </div>
                )}
                
                {/* Bottom Action Command Bar */}
                <div className="mt-12 pt-8 border-t border-[#3d1e56] flex justify-center flex-wrap gap-4">
                     <button
                      onClick={handleGenerateDocument}
                      disabled={isGeneratingDoc}
                      className="flex items-center gap-2.5 px-6 py-3.5 bg-[#180926]/90 border border-[#C5A059]/40 hover:border-[#FFE898] text-[#f5d76e] hover:text-white font-cinzel font-bold text-xs sm:text-sm rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(212,175,55,0.1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
                    >
                      {isGeneratingDoc ? (
                          <>
                              <RotateCcw className="animate-spin h-4 w-4 text-[#f5d76e]" />
                              <span>Generando Expediente...</span>
                          </>
                      ) : (
                          <>
                              <Download className="h-4 w-4 text-[#f5d76e]" />
                              <span>Exportar Informe (.docx)</span>
                          </>
                      )}
                        <InfoTooltip text="Descarga un informe completo en formato .docx, listo para editar y archivar. Incluye todo el análisis: resumen, narrativa, teorías y todos los puntos críticos detallados." />
                    </button>

                    <button
                        onClick={generateClientSummary}
                        disabled={isGeneratingSummary}
                        className="flex items-center gap-2.5 px-6 py-3.5 bg-[#180926]/90 border border-[#C5A059]/40 hover:border-[#FFE898] text-[#FFE898] hover:text-white font-cinzel font-bold text-xs sm:text-sm rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(212,175,55,0.1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
                    >
                      {isGeneratingSummary ? (
                          <>
                              <RotateCcw className="animate-spin h-4 w-4 text-[#f5d76e]" />
                              <span>Sintetizando...</span>
                          </>
                      ) : (
                          <>
                            <Users className="h-4 w-4 text-[#f5d76e]" />
                            <span>Generar Resumen para Cliente</span>
                          </>
                      )}
                    </button>

                    <button
                        onClick={performFinalValidation}
                        disabled={isPerformingFinalValidation || !finalDraft}
                        className="flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-[#8a2232] to-[#59143a] hover:from-[#a32a3c] hover:to-[#6d1a47] text-white border border-[#FFE898]/70 font-cinzel font-black text-xs sm:text-sm rounded-2xl shadow-[0_0_25px_rgba(212,175,55,0.25)] disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
                    >
                      {isPerformingFinalValidation ? (
                          <>
                              <RotateCcw className="animate-spin h-4 w-4 text-amber-200" />
                              <span>Validando Integridad...</span>
                          </>
                      ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-[#FFE898]" />
                            <span>Control de Calidad Final</span>
                          </>
                      )}
                      <InfoTooltip text="Compara el borrador final contra el documento original para verificar que todos los argumentos y hechos clave han sido cubiertos. Es el último paso de validación antes de finalizar." />
                    </button>
                </div>
            </div>
        </div>

        {/* AI Consultant Panel */}
        <div className={`fixed top-28 right-8 z-50 w-full lg:w-2/5 max-w-lg transition-transform duration-500 ease-in-out ${isPanelOpen ? 'translate-x-0' : 'translate-x-[calc(100%+2rem)]'}`}>
          <DockedPanel
              isOpen={isPanelOpen}
              onClose={() => setIsPanelOpen(false)}
              title="Consultor Forense Legal IA"
          >
              <Suspense fallback={<PageLoader />}>
                <LegalConsultantChat
                    onPromoteToAnnotation={handlePromoteToAnnotation}
                    onPromoteToRefinement={(insightText, author) => {
                        promoteToRefinementMotion(insightText, author);
                    }}
                />
              </Suspense>
          </DockedPanel>
        </div>

         {!isPanelOpen && (
          <button
              onClick={() => setIsPanelOpen(true)}
              className="fixed bottom-8 right-8 z-50 flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-[#8a2232] to-[#59143a] hover:from-[#a32a3c] hover:to-[#6d1a47] text-white border border-[#FFE898]/60 font-cinzel font-black text-xs sm:text-sm rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_25px_rgba(212,175,55,0.3)] transition-all transform hover:scale-105"
          >
              <Bot className="h-5 w-5 text-[#FFE898]" />
              <span className="tracking-wide">Consultor IA</span>
          </button>
      )}

      {isSummaryModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
              <div className="relative bg-[#12071d] border border-[#C5A059]/60 p-6 sm:p-8 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.15)] w-full max-w-2xl text-slate-100 overflow-hidden">
                  <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#FFE898] to-transparent" />
                  
                  <div className="flex items-center justify-between pb-4 border-b border-[#3d1e56]">
                      <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-[#8a2232]/30 rounded-xl border border-[#C5A059]/40 text-[#f5d76e]">
                              <Users className="w-5 h-5" />
                          </div>
                          <div>
                              <span className="text-[10px] font-cinzel tracking-widest text-[#f5d76e] uppercase font-bold">Executive Briefing</span>
                              <h3 className="text-lg font-black font-cinzel text-white">Resumen Ejecutivo para Cliente</h3>
                          </div>
                      </div>
                      <button onClick={handleCloseSummaryModal} className="p-1.5 text-amber-200/60 hover:text-white rounded-xl hover:bg-[#250e38] transition-colors">
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  {summaryError ? (
                      <div className="p-4 bg-rose-950/30 border border-rose-500/40 rounded-2xl text-rose-300 text-xs font-mono mt-4">
                          {summaryError}
                      </div>
                  ) : (
                      <>
                          <textarea readOnly value={clientSummary || ''} rows={12} className="w-full mt-4 p-4 bg-[#180926] border border-[#3d1e56] rounded-2xl font-serif text-xs sm:text-sm text-amber-100/90 leading-relaxed focus:outline-none focus:border-[#C5A059]"></textarea>
                          <div className="mt-3 flex justify-end">
                              <button onClick={handleCopySummary} className="inline-flex items-center gap-2 px-4 py-2 bg-[#180926] border border-[#C5A059]/40 hover:border-[#FFE898] text-xs font-cinzel font-bold text-[#f5d76e] hover:text-white rounded-xl transition-colors">
                                  {isSummaryCopied ? (
                                      <>
                                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                                          <span>¡Copiado!</span>
                                      </>
                                  ) : (
                                      <>
                                          <Copy className="w-3.5 h-3.5" />
                                          <span>Copiar Resumen</span>
                                      </>
                                  )}
                              </button>
                          </div>
                      </>
                  )}
                  <div className="mt-6 flex justify-end">
                      <button onClick={handleCloseSummaryModal} className="px-5 py-2.5 bg-[#180926] hover:bg-[#250e38] border border-[#3d1e56] text-amber-200/80 hover:text-white text-xs font-cinzel font-bold rounded-xl transition-colors">Cerrar</button>
                  </div>
              </div>
          </div>
      )}

      {annotationModal.open && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="relative bg-[#12071d] border border-[#C5A059]/60 p-6 sm:p-7 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.15)] w-full max-w-lg text-slate-100 overflow-hidden">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#FFE898] to-transparent" />
            <h3 className="text-base font-black font-cinzel text-white mb-2">Añadir Anotación Colaborativa</h3>
            <p className="text-xs text-amber-100/80 italic bg-[#180926] p-3 rounded-xl border border-[#3d1e56]">"{annotationModal.text}"</p>
            <div className="mt-4">
              <label htmlFor="cp-select" className="text-xs font-cinzel font-bold text-[#f5d76e] block mb-1.5 uppercase">Vincular al Hallazgo:</label>
              <select
                id="cp-select"
                value={selectedCpIdForAnnotation || ''}
                onChange={(e) => setSelectedCpIdForAnnotation(e.target.value)}
                className="w-full p-3 border border-[#3d1e56] rounded-xl bg-[#180926] text-xs font-serif text-amber-100 focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059]"
              >
                {fullResult?.report.criticalPoints.map(cp => (
                  <option key={cp.id} value={cp.id}>{cp.type}</option>
                ))}
              </select>
            </div>
            <div className="mt-6 flex justify-end gap-2.5">
              <button onClick={() => setAnnotationModal({ open: false, text: null })} className="px-4 py-2 bg-[#180926] border border-[#3d1e56] text-amber-200/70 hover:text-white text-xs font-cinzel font-bold rounded-xl transition-colors">Cancelar</button>
              <button onClick={handleConfirmAnnotation} className="px-4 py-2 bg-gradient-to-r from-[#8a2232] to-[#59143a] text-white border border-[#FFE898]/60 hover:from-[#a32a3c] text-xs font-cinzel font-black rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all">Confirmar</button>
            </div>
          </div>
        </div>
      )}
      
      {motionToCreate && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="relative bg-[#12071d] border border-[#C5A059]/60 p-6 sm:p-8 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.15)] w-full max-w-2xl text-slate-100 overflow-hidden">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#FFE898] to-transparent" />
                <button onClick={handleCancelMotion} className="absolute top-5 right-5 text-amber-200/60 hover:text-white p-1 rounded-lg hover:bg-[#250e38]" aria-label="Cerrar moción de refinamiento">
                    <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#3d1e56]">
                    <div className="p-2.5 bg-[#8a2232]/30 rounded-xl border border-[#C5A059]/40 text-[#f5d76e]">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-cinzel tracking-widest text-[#f5d76e] uppercase font-bold">Tactical Adjustment</span>
                        <h3 className="text-lg font-black font-cinzel text-white">Moción de Refinamiento</h3>
                    </div>
                </div>

                <div className="mt-2">
                    <p className="text-[10px] font-cinzel uppercase tracking-wider text-amber-200/70">Insight Promovido:</p>
                    <blockquote className="mt-1 text-xs text-amber-100 border-l-2 border-[#C5A059] pl-3 py-2 bg-[#180926] rounded-r-xl font-serif">
                        "{motionToCreate.insightText}"
                    </blockquote>
                </div>

                {isLinkingInsight ? (
                    <div className="mt-6 flex items-center justify-center space-x-2 text-amber-200 font-cinzel text-xs py-8">
                        <RotateCcw className="animate-spin h-5 w-5 text-[#f5d76e]" />
                        <span>Vinculando insight a un hallazgo...</span>
                    </div>
                ) : (
                    <>
                        <div className="mt-4">
                            <label htmlFor="cp-motion-select" className="text-xs font-cinzel font-bold text-[#f5d76e] block mb-1.5 uppercase">
                                Vincular al Hallazgo (Sugerencia de IA):
                            </label>
                            <select
                                id="cp-motion-select"
                                value={selectedCpIdForMotion || ''}
                                onChange={(e) => setSelectedCpIdForMotion(e.target.value)}
                                className="w-full p-3 border border-[#3d1e56] rounded-xl bg-[#180926] text-xs font-serif text-amber-100 focus:ring-1 focus:ring-[#C5A059]"
                            >
                                {fullResult?.report.criticalPoints.map(cp => (
                                    <option key={cp.id} value={cp.id}>{cp.type}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mt-4">
                            <label htmlFor="refinement-instruction" className="text-xs font-cinzel font-bold text-[#f5d76e] block mb-1.5 uppercase">
                                Instrucción de Refinamiento:
                            </label>
                            <textarea
                                id="refinement-instruction"
                                value={refinementInstruction}
                                onChange={(e) => setRefinementInstruction(e.target.value)}
                                rows={4}
                                placeholder="Ej: 'Integra este insight en la sección de hechos para fortalecer la narrativa de la negligencia.'"
                                className="w-full p-3 border border-[#3d1e56] rounded-xl bg-[#180926] text-xs font-serif text-amber-100 placeholder:text-amber-100/30 focus:ring-1 focus:ring-[#C5A059] focus:border-[#C5A059]"
                            />
                        </div>
                    </>
                )}

                <div className="mt-6 flex justify-end gap-2.5">
                    <button onClick={handleCancelMotion} className="px-4 py-2 bg-[#180926] border border-[#3d1e56] text-amber-200/70 hover:text-white text-xs font-cinzel font-bold rounded-xl transition-colors">
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSubmitMotion}
                        disabled={isLinkingInsight || !refinementInstruction.trim() || !selectedCpIdForMotion}
                        className="px-5 py-2 bg-gradient-to-r from-[#8a2232] to-[#59143a] hover:from-[#a32a3c] text-white border border-[#FFE898]/60 text-xs font-cinzel font-black rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-40 transition-all"
                    >
                        Confirmar y Generar Enmienda
                    </button>
                </div>
            </div>
        </div>
      )}


        {isTimelineModalOpen && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4" aria-modal="true">
                <div className="relative bg-[#12071d] border border-[#C5A059]/60 p-6 sm:p-8 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.15)] w-full max-w-4xl max-h-[90vh] flex flex-col text-slate-100 overflow-hidden">
                    <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#FFE898] to-transparent" />
                    
                    <div className="flex justify-between items-center mb-4 flex-shrink-0 border-b border-[#3d1e56] pb-4">
                        <div>
                            <span className="text-[10px] font-cinzel tracking-widest text-[#f5d76e] uppercase font-bold">Chronological Reconstruction</span>
                            <h3 className="text-xl font-black font-cinzel text-white">Línea de Tiempo del Caso</h3>
                        </div>
                        <button onClick={() => setIsTimelineModalOpen(false)} className="p-2 rounded-xl text-amber-200/60 hover:text-white hover:bg-[#250e38] transition-colors">
                             <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin">
                        {!timelineEvents || timelineEvents.length === 0 ? (
                            <div className="text-center p-8 text-amber-200/50 font-cinzel text-xs">
                                <p>La línea de tiempo no fue generada en el análisis inicial.</p>
                                <p className="text-[10px] mt-1">Esto puede ocurrir si los documentos no contenían fechas claras.</p>
                            </div>
                        ) : (
                            <Suspense fallback={<PageLoader />}>
                                <TimelineView events={timelineEvents} />
                            </Suspense>
                        )}
                    </div>
                </div>
            </div>
        )}
        
        {isValidationModalOpen && (
            <Suspense fallback={<div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100]"><PageLoader/></div>}>
                <FinalValidationReportModal
                    report={finalValidationResult}
                    isLoading={isPerformingFinalValidation}
                    error={finalValidationError}
                    onClose={clearFinalValidation}
                />
            </Suspense>
        )}

    </div>
  );
};
export default ReportStep;