import { useState, useRef, useCallback } from 'react';
import type { AIPersonality, CaseDocumentType, Attachment, AnalysisProgress, FullAnalysisResult, AnalysisReport, IntegralAnalysisResponse, AnalysisMetrics, ReportSubStep, ArgumentAnalysis, RefinementMotion, AmendmentProposal, ComparativeAnalysisReport, TimelineEvent } from '../types';
import { generateCacheKey, getResult, saveResult } from '../services/cacheService';
import { analyzeCaseDocument } from '../services/orchestrators/analysisOrchestrator';
import { generateStrategicDraft, stressTestDraft, refineDraft, linkInsightToCriticalPoint, proposeAmendment, integrateAmendment, generateClientSummary as generateClientSummaryService, performComparativeAnalysis, extractTimelineEvents } from '../services/geminiService';
import { refinementLoopService, type RefinementLoopResult } from '../services/gemini/refinementLoop';


const simpleId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
};

interface AnalysisCoreProps {
    aiPersonality: AIPersonality;
    documentType: CaseDocumentType;
    primaryFile: Attachment | null;
    evidenceFiles: Attachment[];
    documentB: Attachment | null;
    navigateTo: (screen: string) => void;
    goToReportSubStep: (step: ReportSubStep) => void;
}

/**
 * Hook central que encapsula toda la lógica de negocio principal para el análisis.
 * Gestiona el estado de la ejecución del análisis, la interacción con la caché,
 * la orquestación de llamadas a la IA, y los flujos de trabajo de redacción y refinamiento.
 * Es el corazón de la aplicación.
 */
export const useAnalysisCore = ({
    aiPersonality,
    documentType,
    primaryFile,
    evidenceFiles,
    documentB,
    navigateTo,
    goToReportSubStep,
}: AnalysisCoreProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisLog, setAnalysisLog] = useState<AnalysisProgress[]>([]);
    const [analysisResult, setAnalysisResult] = useState<FullAnalysisResult | null>(null);
    const [analysisMetrics, setAnalysisMetrics] = useState<AnalysisMetrics | null>(null);

    // --- State for the adversarial drafting workflow ---
    const [initialDraft, setInitialDraft] = useState<string | null>(null);
    const [finalDraft, setFinalDraft] = useState<string | null>(null);
    const [draftStressTestResult, setDraftStressTestResult] = useState<ArgumentAnalysis | null>(null);
    const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
    const [isStressTestingDraft, setIsStressTestingDraft] = useState(false);
    const [isRefiningDraft, setIsRefiningDraft] = useState(false);
    const [draftError, setDraftError] = useState<string | null>(null);
    const [refinementLoopResult, setRefinementLoopResult] = useState<RefinementLoopResult | null>(null);
    const [isRefinementLoopRunning, setIsRefinementLoopRunning] = useState(false);

    // --- State for the iterative refinement workflow (from chat) ---
    const [motionToCreate, setMotionToCreate] = useState<{ insightText: string; author?: string } | null>(null);
    const [isLinkingInsight, setIsLinkingInsight] = useState(false);
    const [suggestedCpId, setSuggestedCpId] = useState<string | null>(null);
    const [amendmentProposal, setAmendmentProposal] = useState<AmendmentProposal | null>(null);
    const [isProposingAmendment, setIsProposingAmendment] = useState(false);
    
    // --- State for client summary ---
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);
    const [clientSummary, setClientSummary] = useState<string | null>(null);
    
    // --- State for comparative analysis ---
    const [isPerformingComparative, setIsPerformingComparative] = useState(false);
    const [comparativeAnalysisResult, setComparativeAnalysisResult] = useState<ComparativeAnalysisReport | null>(null);

    // --- State for final validation ---
    const [isPerformingFinalValidation, setIsPerformingFinalValidation] = useState(false);
    const [finalValidationResult, setFinalValidationResult] = useState<ComparativeAnalysisReport | null>(null);
    const [finalValidationError, setFinalValidationError] = useState<string | null>(null);

    const timerIntervalRef = useRef<number | null>(null);
    const connectionsIntervalRef = useRef<number | null>(null);
    
    const clearTimers = useCallback(() => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (connectionsIntervalRef.current) clearInterval(connectionsIntervalRef.current);
        timerIntervalRef.current = null;
        connectionsIntervalRef.current = null;
    }, []);

    const processAnalysisResult = useCallback((
        baseAnalysis: IntegralAnalysisResponse,
        enrichedReport: AnalysisReport,
        allAttachments: Attachment[],
        cacheKey: string
    ) => {
        clearTimers();

        const primaryDoc = allAttachments.find(f => f.isPrimary);
        
        const finalResult: FullAnalysisResult = {
            report: enrichedReport,
            documentType,
            primaryDocumentText: primaryDoc?.translatedText || primaryDoc?.extractedText || '',
            evidenceTexts: allAttachments
                .filter(f => !f.isPrimary)
                .map(f => ({ name: f.name, text: f.translatedText || f.extractedText || '' })),
            aiPersonality,
            integralAnalysisResponse: baseAnalysis,
            allAttachments: allAttachments
        };
        
        setAnalysisResult(finalResult);
        setIsLoading(false);
        navigateTo('report');
        saveResult(cacheKey, finalResult).catch(console.error);
    }, [aiPersonality, documentType, navigateTo, clearTimers]);
    
    const startAnalysis = useCallback(async () => {
        if (!primaryFile || !primaryFile.extractedText) {
            setError("Debe subir y procesar el documento principal para poder iniciar el análisis.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisLog([{ log: 'Iniciando análisis y comprobando memoria estratégica...' }]);
        setAnalysisMetrics(null);
        clearTimers();
        
        const settings = { aiPersonality, documentType };
        const allAttachments = [primaryFile, ...evidenceFiles];
        const cacheKey = await generateCacheKey(primaryFile, evidenceFiles, settings);
        
        const cachedResult = await getResult(cacheKey);
        if (cachedResult) {
            setAnalysisLog(prev => [...prev, { log: '¡Éxito! Resultado encontrado en la memoria estratégica. Cargando...' }]);
            const { processedPages, humanTimeEstimate } = (() => {
                const WORDS_PER_PAGE = 275;
                const MINUTES_PER_PAGE = 3.5;
                let totalWords = (cachedResult.primaryDocumentText.split(/\s+/).length || 0) +
                    cachedResult.evidenceTexts.reduce((acc, curr) => acc + (curr.text.split(/\s+/).length || 0), 0);
                const pages = Math.max(1, Math.ceil(totalWords / WORDS_PER_PAGE));
                const humanMinutes = pages * MINUTES_PER_PAGE;
                const humanHours = (humanMinutes / 60).toFixed(1);
                return { processedPages: pages, humanTimeEstimate: `~${humanHours} hrs` };
            })();
            setAnalysisMetrics({
                elapsedTime: '00:00',
                processedPages,
                humanTimeEstimate,
                logicalConnections: 'N/A',
                findingsCount: cachedResult.report.criticalPoints.length,
            });
            setAnalysisResult(cachedResult);
            setIsLoading(false);
            navigateTo('report');
            return;
        }

        setAnalysisLog(prev => [...prev, { log: 'No se encontró en memoria. Iniciando análisis profundo con IA...' }]);
        
        const startTime = Date.now();
        const { processedPages, humanTimeEstimate } = (() => {
            const WORDS_PER_PAGE = 275;
            const MINUTES_PER_PAGE = 3.5;
            let totalWords = (primaryFile.extractedText?.split(/\s+/).length || 0) + 
                evidenceFiles.reduce((acc, file) => acc + (file.extractedText?.split(/\s+/).length || 0), 0);
            const pages = Math.max(1, Math.ceil(totalWords / WORDS_PER_PAGE));
            const humanMinutes = pages * MINUTES_PER_PAGE;
            const humanHours = (humanMinutes / 60).toFixed(1);
            return { processedPages: pages, humanTimeEstimate: `~${humanHours} hrs` };
        })();

        setAnalysisMetrics({
            elapsedTime: '00:00',
            processedPages,
            humanTimeEstimate,
            logicalConnections: '0',
            findingsCount: 0,
        });

        timerIntervalRef.current = window.setInterval(() => {
            setAnalysisMetrics(prev => prev ? { ...prev, elapsedTime: formatTime(Date.now() - startTime) } : null);
        }, 1000);

        connectionsIntervalRef.current = window.setInterval(() => {
            setAnalysisMetrics(prev => prev ? { ...prev, logicalConnections: (parseInt(prev.logicalConnections.replace(/,/g, ''), 10) + Math.floor(Math.random() * 500) + 250).toLocaleString('es-CO') } : null);
        }, 800);

        navigateTo('analyzing');

        const primaryDocumentText = primaryFile.translatedText || primaryFile.extractedText || '';
        const evidenceTexts = evidenceFiles
            .filter(f => f.status === 'ready' && (f.extractedText || f.translatedText))
            .map(f => ({ name: f.name, text: f.translatedText || f.extractedText || '' }));

        try {
            const handleProgress = (progress: AnalysisProgress) => {
                setAnalysisLog(prev => [...prev, progress]);
                if (progress.findingsCount !== undefined) {
                    setAnalysisMetrics(prev => prev ? { ...prev, findingsCount: progress.findingsCount! } : null);
                }
            };

            const { baseAnalysis, enrichedAnalysis } = await analyzeCaseDocument(
                primaryDocumentText,
                evidenceTexts,
                documentType,
                handleProgress,
                simpleId
            );
            processAnalysisResult(baseAnalysis, enrichedAnalysis, allAttachments, cacheKey);
        } catch (err) {
            clearTimers();
            const message = err instanceof Error ? err.message : "Ocurrió un error desconocido durante el análisis.";
            setAnalysisLog(prev => [...prev, { log: `Análisis fallido: ${message}`, error: message }]);
            setError(message);
            setIsLoading(false);
            navigateTo('upload');
        }
    }, [aiPersonality, documentType, primaryFile, evidenceFiles, processAnalysisResult, navigateTo, clearTimers]);
    
    const startComparativeAnalysis = useCallback(async () => {
        if (!primaryFile || !primaryFile.extractedText || !documentB || !documentB.extractedText) {
            setError("Debe subir y procesar ambos documentos para iniciar el análisis comparativo.");
            return;
        }

        setIsPerformingComparative(true);
        setError(null);
        setAnalysisLog([{ log: 'Iniciando análisis comparativo...' }]);
        navigateTo('analyzing'); // Reuse analyzing screen

        try {
            const result = await performComparativeAnalysis(
                primaryFile.extractedText,
                documentB.extractedText
            );
            setComparativeAnalysisResult(result);
            navigateTo('comparative_report');
        } catch (err) {
            const message = err instanceof Error ? err.message : "Ocurrió un error desconocido durante el análisis comparativo.";
            setError(message);
            navigateTo('comparative_upload'); // Go back to upload on error
        } finally {
            setIsPerformingComparative(false);
        }
    }, [primaryFile, documentB, navigateTo]);


    // --- Adversarial Drafting Workflow Functions ---
    
    const generateInitialDraft = useCallback(async (report: AnalysisReport, considerations: string) => {
        setIsGeneratingDraft(true);
        setDraftError(null);
        try {
            const draft = await generateStrategicDraft(report, aiPersonality, documentType, considerations);
            setInitialDraft(draft);
            setFinalDraft(null); // Reset final draft if generating a new initial one
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error al generar el borrador.";
            setDraftError(message);
        } finally {
            setIsGeneratingDraft(false);
        }
    }, [aiPersonality, documentType]);
    
    const runStressTestOnDraft = useCallback(async () => {
        if (!initialDraft || !analysisResult) {
            setDraftError("No hay un borrador para analizar.");
            return;
        }
        setIsStressTestingDraft(true);
        setDraftError(null);
        try {
            const result = await stressTestDraft(initialDraft, analysisResult);
            setDraftStressTestResult(result);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error durante el stress test.";
            setDraftError(message);
        } finally {
            setIsStressTestingDraft(false);
        }
    }, [initialDraft, analysisResult]);
    
    const runRefinement = useCallback(async () => {
        if (!initialDraft || !draftStressTestResult || !analysisResult) {
            setDraftError("Faltan componentes para el refinamiento (borrador, stress test o análisis original).");
            return;
        }
        setIsRefiningDraft(true);
        setDraftError(null);
        try {
            const final = await refineDraft(analysisResult.report, initialDraft, draftStressTestResult, aiPersonality, documentType);
            setFinalDraft(final);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error durante el refinamiento final.";
            setDraftError(message);
        } finally {
            setIsRefiningDraft(false);
        }
    }, [initialDraft, draftStressTestResult, analysisResult, aiPersonality, documentType]);

    const runAutonomousRefinementLoop = useCallback(async (maxCycles: number = 3) => {
        const draftToRefine = finalDraft || initialDraft;
        if (!draftToRefine || !analysisResult) {
            setDraftError("Se requiere un borrador inicial y análisis procesal para ejecutar el bucle de reflexión.");
            return;
        }

        setIsRefinementLoopRunning(true);
        setDraftError(null);

        try {
            const caseSummary = typeof analysisResult.report.caseOverview === 'string'
                ? analysisResult.report.caseOverview
                : JSON.stringify(analysisResult.report.caseOverview || '');
            const result = await refinementLoopService.runReflectiveLoop(
                draftToRefine,
                caseSummary,
                maxCycles,
                (progress) => {
                    setAnalysisLog(prev => [...prev, progress]);
                }
            );

            setRefinementLoopResult(result);
            setFinalDraft(result.finalDraft);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error durante el bucle de reflexión autónomo.";
            setDraftError(message);
        } finally {
            setIsRefinementLoopRunning(false);
        }
    }, [finalDraft, initialDraft, analysisResult]);

    // --- Iterative Refinement Workflow Functions ---
    const promoteToRefinementMotion = useCallback(async (insightText: string, author?: string) => {
        if (!analysisResult) return;
        setMotionToCreate({ insightText, author });
        setIsLinkingInsight(true);
        setError(null);
        try {
            const cpId = await linkInsightToCriticalPoint(insightText, analysisResult.report.criticalPoints);
            setSuggestedCpId(cpId);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error al vincular el insight.";
            setError(message); // Use main error state for this modal
        } finally {
            setIsLinkingInsight(false);
        }
    }, [analysisResult]);

    const submitRefinementMotion = useCallback(async (motion: RefinementMotion) => {
        const currentDraft = finalDraft || initialDraft;
        if (!currentDraft || !analysisResult) {
            setError("No hay un borrador activo para refinar.");
            return;
        }
        setIsProposingAmendment(true);
        setError(null);
        try {
            const proposal = await proposeAmendment(currentDraft, motion, analysisResult.report);
            setAmendmentProposal(proposal);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error al proponer la enmienda.";
            setError(message);
        } finally {
            setIsProposingAmendment(false);
        }
    }, [initialDraft, finalDraft, analysisResult]);

    const acceptAmendment = useCallback(async () => {
        if (!amendmentProposal || !analysisResult) return;
        
        const draftToUpdate = finalDraft || initialDraft;
        if (!draftToUpdate) return;
        
        setIsRefiningDraft(true); // Reuse refining spinner for this
        setError(null);

        try {
            const newDraft = await integrateAmendment(draftToUpdate, amendmentProposal, analysisResult.report);

            if (finalDraft) {
                setFinalDraft(newDraft);
            } else {
                setInitialDraft(newDraft);
            }
        } catch(err) {
            const message = err instanceof Error ? err.message : "Error al integrar la enmienda.";
            setError(message);
        } finally {
            setIsRefiningDraft(false);
            setAmendmentProposal(null);
        }
    }, [amendmentProposal, initialDraft, finalDraft, analysisResult]);

    const rejectAmendment = useCallback(() => {
        setAmendmentProposal(null);
    }, []);

    const clearMotion = useCallback(() => {
        setMotionToCreate(null);
        setSuggestedCpId(null);
        setError(null);
    }, []);

    // --- Client Summary Function ---
    const generateClientSummary = useCallback(async () => {
        if (!analysisResult) {
            setSummaryError("No hay un informe de análisis para resumir.");
            return;
        }
        setIsGeneratingSummary(true);
        setSummaryError(null);
        setClientSummary(null);
        try {
            const summary = await generateClientSummaryService(analysisResult.report);
            setClientSummary(summary);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error al generar el resumen.";
            setSummaryError(message);
        } finally {
            setIsGeneratingSummary(false);
        }
    }, [analysisResult]);

    const clearClientSummary = useCallback(() => {
        setClientSummary(null);
        setSummaryError(null);
    }, []);

    // --- Final Validation Functions ---
    const performFinalValidation = useCallback(async () => {
        if (!finalDraft || !primaryFile?.extractedText) {
            setFinalValidationError("Se requiere un borrador final y el documento original para realizar la validación.");
            return;
        }
        setIsPerformingFinalValidation(true);
        setFinalValidationError(null);
        setFinalValidationResult(null);
        try {
            const result = await performComparativeAnalysis(
                primaryFile.extractedText,
                finalDraft
            );
            setFinalValidationResult(result);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error desconocido durante la validación final.";
            setFinalValidationError(message);
        } finally {
            setIsPerformingFinalValidation(false);
        }
    }, [primaryFile, finalDraft]);

    const clearFinalValidation = useCallback(() => {
        setFinalValidationResult(null);
        setFinalValidationError(null);
    }, []);

    const resetAnalysis = () => {
        setIsLoading(false);
        setError(null);
        setAnalysisLog([]);
        setAnalysisResult(null);
        setAnalysisMetrics(null);
        clearTimers();
        // Reset drafting state
        setInitialDraft(null);
        setFinalDraft(null);
        setDraftStressTestResult(null);
        setIsGeneratingDraft(false);
        setIsStressTestingDraft(false);
        setIsRefiningDraft(false);
        setDraftError(null);
        // Reset iterative refinement state
        setMotionToCreate(null);
        setIsLinkingInsight(false);
        setSuggestedCpId(null);
        setAmendmentProposal(null);
        setIsProposingAmendment(false);
        // Reset client summary state
        setIsGeneratingSummary(false);
        setSummaryError(null);
        setClientSummary(null);
        // Reset comparative state
        setIsPerformingComparative(false);
        setComparativeAnalysisResult(null);
        // Reset final validation state
        setIsPerformingFinalValidation(false);
        setFinalValidationResult(null);
        setFinalValidationError(null);
    };

    return {
        isLoading: isLoading || isPerformingComparative,
        error,
        setError,
        analysisLog,
        analysisResult,
        analysisMetrics,
        startAnalysis,
        resetAnalysis,
        // Adversarial drafting workflow state and functions
        initialDraft,
        finalDraft,
        draftStressTestResult,
        isGeneratingDraft,
        isStressTestingDraft,
        isRefiningDraft,
        isRefinementLoopRunning,
        refinementLoopResult,
        draftError,
        generateInitialDraft,
        runStressTestOnDraft,
        runRefinement,
        runAutonomousRefinementLoop,
        // Iterative refinement workflow
        motionToCreate,
        isLinkingInsight,
        suggestedCpId,
        amendmentProposal,
        isProposingAmendment,
        promoteToRefinementMotion,
        submitRefinementMotion,
        acceptAmendment,
        rejectAmendment,
        clearMotion,
        // Client summary
        isGeneratingSummary,
        summaryError,
        clientSummary,
        generateClientSummary,
        clearClientSummary,
        // Comparative Analysis
        isPerformingComparative,
        comparativeAnalysisResult,
        startComparativeAnalysis,
        // Final Validation
        isPerformingFinalValidation,
        finalValidationResult,
        finalValidationError,
        performFinalValidation,
        clearFinalValidation,
    };
};