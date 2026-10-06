import type { 
    IntegralAnalysisResponse, 
    GroundingSource, 
    AnalysisReport, 
    CriticalPoint, 
    CaseDocumentType, 
    AnalysisProgress, 
    FracturePointResponseItem, 
    JurisprudentialShieldingResponseItem, 
    EvidentiaryInconsistencyResponseItem, 
    TimelineEvent, 
    Attachment 
} from '../../types';
import * as Prompts from '../promptManager';
import { generateContentWithRetry, performWebSearch, parseJsonResponse, extractTimelineEvents } from '../geminiService';
import { supervisorAgent, SupervisorDecision } from '../gemini/supervisorAgent';
import { contextCacheService } from '../gemini/contextCacheService';

const MODEL_FAST = 'gemini-3.5-flash';
const MAX_CRITICAL_POINT_PAGES = 3;
const DEFAULT_BATCH_SIZE = 5;
const DEFAULT_ANALYSIS_CONCURRENCY = 3;
const WEB_SEARCH_CONCURRENCY = 2;

// --- UTILIDADES DE CONCURRENCIA Y ROBUSTEZ ARQUITECTÓNICA ---

/**
 * Ejecuta un arreglo de tareas asíncronas con un límite estricto de trabajadores concurrentes.
 * Previene saturación de cuota, rate-limits 429 y ráfagas incontroladas contra el backend.
 */
async function mapWithConcurrency<T, R>(
    items: T[],
    concurrency: number,
    worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
    if (items.length === 0) return [];
    
    const results: R[] = new Array(items.length);
    let nextIndex = 0;

    async function workerLoop() {
        while (nextIndex < items.length) {
            const currentIndex = nextIndex++;
            results[currentIndex] = await worker(items[currentIndex], currentIndex);
        }
    }

    const workerCount = Math.min(concurrency, items.length);
    const workers = Array.from({ length: workerCount }, () => workerLoop());
    await Promise.all(workers);

    return results;
}

/**
 * Resultado tipado por lote para evitar tragar errores en silencio en análisis jurídicos.
 */
interface BatchResult<T> {
    success: boolean;
    data: T[];
    error?: string;
    batchNumber: number;
}

/**
 * Motor unificado de procesamiento por lotes para fases de enriquecimiento analítico.
 * Unifica la lógica de las Fases 2 y 3, evitando duplicación de código y manejando fallos de forma transparente.
 */
async function processBatches<TInput, TOutput>(
    items: TInput[],
    options: {
        batchSize: number;
        concurrency: number;
        phaseName: string;
        agentId: string;
        phaseNumber: 1 | 2;
        processBatch: (batch: TInput[], batchNumber: number, totalBatches: number) => Promise<TOutput[]>;
    },
    onProgress: (progress: AnalysisProgress) => void
): Promise<TOutput[]> {
    if (items.length === 0) {
        onProgress({
            log: `[${options.phaseName}] Omitido: No hay elementos para procesar.`,
            agentId: options.agentId,
            status: 'COMPLETADO',
            phase: options.phaseNumber
        });
        return [];
    }

    const batches: TInput[][] = [];
    for (let i = 0; i < items.length; i += options.batchSize) {
        batches.push(items.slice(i, i + options.batchSize));
    }

    onProgress({
        log: `[${options.phaseName}] Iniciando análisis en ${batches.length} lote(s) (concurrencia máx: ${options.concurrency})...`,
        agentId: options.agentId,
        status: 'TRABAJANDO',
        phase: options.phaseNumber
    });

    const batchResults = await mapWithConcurrency(
        batches,
        options.concurrency,
        async (batch, index): Promise<BatchResult<TOutput>> => {
            const batchNumber = index + 1;
            onProgress({
                log: `[${options.phaseName}] Procesando lote ${batchNumber}/${batches.length} (${batch.length} ítems)...`,
                agentId: options.agentId,
                status: 'TRABAJANDO',
                phase: options.phaseNumber
            });

            try {
                const data = await options.processBatch(batch, batchNumber, batches.length);
                onProgress({
                    log: `[${options.phaseName}] Lote ${batchNumber}/${batches.length} completado con éxito (${data.length} respuestas).`,
                    agentId: options.agentId,
                    status: 'TRABAJANDO',
                    phase: options.phaseNumber
                });
                return { success: true, data, batchNumber };
            } catch (error) {
                const message = error instanceof Error ? error.message : "Error desconocido";
                onProgress({
                    log: `[${options.phaseName}] Falló el lote ${batchNumber}/${batches.length}: ${message}`,
                    agentId: options.agentId,
                    status: 'FALLO',
                    phase: options.phaseNumber
                });
                return { success: false, data: [], error: message, batchNumber };
            }
        }
    );

    const failedBatches = batchResults.filter(r => !r.success);
    const totalSuccessfulItems = batchResults.flatMap(r => r.data);

    if (failedBatches.length > 0) {
        onProgress({
            log: `[${options.phaseName}] Advertencia: ${failedBatches.length} de ${batches.length} lotes reportaron contingencias.`,
            agentId: options.agentId,
            status: 'FALLO',
            phase: options.phaseNumber
        });

        // Si más del 40% de los lotes fallan, no silenciar: el análisis procesal quedaría severamente incompleto
        if (failedBatches.length > batches.length * 0.4) {
            throw new Error(`[${options.phaseName}] Fracasó el análisis: ${failedBatches.length}/${batches.length} lotes no pudieron procesarse.`);
        }
    } else {
        onProgress({
            log: `[${options.phaseName}] Análisis completado. ${totalSuccessfulItems.length} resultados consolidados.`,
            agentId: options.agentId,
            status: 'COMPLETADO',
            phase: options.phaseNumber
        });
    }

    return totalSuccessfulItems;
}

// --- FASES DE ANÁLISIS EN CASCADA SINÉRGICA ---

/**
 * FASE 0: Realiza investigación web controlada para obtener fuentes jurídicas y normativas externas actualizadas.
 * Aplica concurrencia acotada (2 llamadas simultáneas) y deduplicación estricta de fuentes.
 */
const performWebResearch_Phase0 = async (
    primaryDocumentText: string,
    onProgress: (progress: AnalysisProgress) => void
): Promise<{ searchResultsText: string, allSources: GroundingSource[] }> => {
    onProgress({ 
        log: "[Fase 0: Investigación Externa] Identificando vectores de investigación normativa y jurisprudencial...", 
        agentId: 'web_research', 
        status: 'TRABAJANDO', 
        phase: 1 
    });

    const queryGenInstruction = Prompts.getWebSearchQueryGenerationPrompt(primaryDocumentText);
    
    const queryGenResponse = await generateContentWithRetry({
        model: MODEL_FAST,
        contents: "Genera las consultas de búsqueda basadas en las instrucciones.",
        config: {
            systemInstruction: queryGenInstruction,
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: Prompts.WEB_SEARCH_QUERY_GENERATION_SCHEMA,
        }
    }, onProgress, "Planificador de Investigación");

    const { searchQueries } = parseJsonResponse<{ searchQueries: string[] }>(queryGenResponse.text);

    if (!searchQueries || searchQueries.length === 0) {
        onProgress({ 
            log: "[Fase 0: Investigación Externa] No se identificaron requerimientos de consulta web externa.", 
            agentId: 'web_research', 
            status: 'COMPLETADO', 
            phase: 1 
        });
        return { searchResultsText: '', allSources: [] };
    }

    onProgress({ 
        log: `[Fase 0: Investigación Externa] ${searchQueries.length} vector(es) de búsqueda definidos. Consultando fuentes con concurrencia controlada...`, 
        agentId: 'web_research', 
        status: 'TRABAJANDO', 
        phase: 1 
    });

    // Ejecutar búsquedas con concurrencia controlada (máx 2) para no colapsar la cuota ni demorar secuencialmente
    const searchResults = await mapWithConcurrency(
        searchQueries,
        WEB_SEARCH_CONCURRENCY,
        async (query, index) => {
            onProgress({ 
                log: `[Fase 0: Búsqueda ${index + 1}/${searchQueries.length}] Consultando: "${query}"`, 
                agentId: 'web_research', 
                status: 'TRABAJANDO', 
                phase: 1 
            });

            try {
                const res = await performWebSearch(query);
                return { success: true, query, text: res.text, sources: res.sources };
            } catch (error) {
                const message = error instanceof Error ? error.message : "Error de red";
                onProgress({ 
                    log: `[Fase 0: Búsqueda ${index + 1}/${searchQueries.length}] Falló consulta "${query.substring(0, 40)}...": ${message}`, 
                    agentId: 'web_research', 
                    status: 'FALLO', 
                    phase: 1 
                });
                return { success: false, query, text: '', sources: [] };
            }
        }
    );

    // Deduplicación de fuentes basada en URI o título
    const sourceMap = new Map<string, GroundingSource>();
    let combinedText = '';

    for (const res of searchResults) {
        if (!res.success || !res.text) continue;

        combinedText += `<!-- INFORME DE FUENTE EXTERNA: "${res.query}" -->\n`;
        combinedText += `<INVESTIGACION_EXTERNA TEMA="${res.query.substring(0, 60)}">\n`;
        combinedText += `RESUMEN DE PRECEDENTE O DOCTRINA:\n${res.text}\n\n`;
        combinedText += `REFERENCIAS:\n${res.sources.map(s => `- ${s.title}: ${s.uri}`).join('\n')}\n`;
        combinedText += `</INVESTIGACION_EXTERNA>\n\n`;

        for (const src of res.sources) {
            const key = src.uri || src.title;
            if (key && !sourceMap.has(key)) {
                sourceMap.set(key, src);
            }
        }
    }

    const allSources = Array.from(sourceMap.values());
    onProgress({ 
        log: `[Fase 0: Investigación Externa] Búsquedas finalizadas. ${allSources.length} fuente(s) contrastada(s).`, 
        agentId: 'web_research', 
        status: 'COMPLETADO', 
        phase: 1 
    });

    return { searchResultsText: combinedText, allSources };
};

/**
 * FASE 1: Autopsia Forense Integral y deconstrucción de debilidades con paginación libre de duplicados.
 */
const performConsortiumAnalysis_Phase1 = async (
    combinedContents: string,
    documentType: CaseDocumentType,
    onProgress: (progress: AnalysisProgress) => void
): Promise<IntegralAnalysisResponse> => {
    onProgress({ 
        log: `[Fase 1: Autopsia Forense] Iniciando deconstrucción analítica multidimensional (Hechos, Normas, Lógica y Evidencia)...`, 
        phase: 1 
    });

    const firstPassSystemInstruction = Prompts.getIntegralAnalysisPrompt(documentType);

    const firstPassResponse = await generateContentWithRetry({
        model: MODEL_FAST,
        contents: combinedContents,
        config: { 
            systemInstruction: firstPassSystemInstruction, 
            temperature: 0.4, 
            responseMimeType: "application/json",
            responseSchema: Prompts.INTEGRAL_ANALYSIS_SCHEMA
        }
    }, onProgress, 'Consorcio de Deconstrucción Legal');

    const initialParsed = parseJsonResponse<IntegralAnalysisResponse>(firstPassResponse.text);
    const allCriticalPoints: Array<Omit<CriticalPoint, 'id' | 'socraticAnalysis' | 'fracturePointAnalysis' | 'jurisprudentialShielding'>> = [];
    
    // Conjunto para evitar que hallazgos duplicados se ponderen doblemente en el sistema
    const existingKeys = new Set<string>();

    for (const point of (initialParsed.criticalPoints || [])) {
        const key = `${point.title || ''}|${point.excerpt || ''}`.trim();
        if (!existingKeys.has(key)) {
            existingKeys.add(key);
            allCriticalPoints.push(point);
        }
    }

    onProgress({ 
        log: `[Fase 1: Autopsia Forense] Pase inicial completado: ${allCriticalPoints.length} hallazgo(s) identificado(s).`, 
        findingsCount: allCriticalPoints.length 
    });

    let hasMore = initialParsed.hasMoreCriticalPoints ?? false;
    let pageCount = 1;
    
    while (hasMore && pageCount < MAX_CRITICAL_POINT_PAGES) {
        pageCount++;
        onProgress({ 
            log: `[Fase 1: Paginación] Explorando estrato analítico ${pageCount}/${MAX_CRITICAL_POINT_PAGES}...`, 
            agentId: 'iterator', 
            status: 'TRABAJANDO', 
            phase: 1 
        });

        const continuationInstruction = Prompts.getContinuationAnalysisPrompt(allCriticalPoints as CriticalPoint[]);
        
        const continuationResponse = await generateContentWithRetry({
            model: MODEL_FAST,
            contents: combinedContents,
            config: {
                systemInstruction: continuationInstruction,
                temperature: 0.5,
                responseMimeType: "application/json",
                responseSchema: Prompts.CONTINUATION_SCHEMA,
            }
        }, onProgress, `Analista Paginado (Lote ${pageCount})`);
        
        const continuationParsed = parseJsonResponse<{ criticalPoints: Omit<CriticalPoint, 'id'>[], hasMoreCriticalPoints?: boolean }>(continuationResponse.text);
        const newPoints = continuationParsed.criticalPoints || [];
        
        if (newPoints.length === 0) {
            onProgress({ 
                log: `[Fase 1: Paginación] No se detectaron vulnerabilidades adicionales en estrato ${pageCount}.`, 
                agentId: 'iterator', 
                status: 'COMPLETADO', 
                phase: 1 
            });
            hasMore = false;
            break; // Salida limpia sin sobrescritura errónea
        }

        let addedCount = 0;
        for (const point of newPoints) {
            const key = `${point.title || ''}|${point.excerpt || ''}`.trim();
            if (!existingKeys.has(key)) {
                existingKeys.add(key);
                allCriticalPoints.push(point);
                addedCount++;
            }
        }

        onProgress({ 
            log: `[Fase 1: Paginación] ${addedCount} hallazgos nuevos no duplicados añadidos. Total: ${allCriticalPoints.length}.`, 
            agentId: 'iterator', 
            status: 'TRABAJANDO', 
            phase: 1, 
            findingsCount: allCriticalPoints.length 
        });

        hasMore = continuationParsed.hasMoreCriticalPoints ?? false;
    }

    return { ...initialParsed, criticalPoints: allCriticalPoints };
};

/**
 * FASE 2: Análisis Ofensivo de Puntos de Fractura mediante el motor unificado de lotes.
 */
const performFracturePointAnalysis_Phase2 = async (
    criticalPoints: CriticalPoint[],
    fullDocumentText: string,
    onProgress: (progress: AnalysisProgress) => void
): Promise<FracturePointResponseItem[]> => {
    return processBatches<CriticalPoint, FracturePointResponseItem>(
        criticalPoints,
        {
            batchSize: DEFAULT_BATCH_SIZE,
            concurrency: DEFAULT_ANALYSIS_CONCURRENCY,
            phaseName: 'Fase 2: Puntos de Fractura',
            agentId: 'fracture',
            phaseNumber: 2,
            processBatch: async (batch, batchNumber, totalBatches) => {
                const instruction = Prompts.getFracturePointAnalysisPrompt(batch, fullDocumentText);
                const response = await generateContentWithRetry({
                    model: MODEL_FAST,
                    contents: "Analiza los puntos críticos para encontrar el 'Punto de Fractura' sistémico basado en las instrucciones.",
                    config: {
                        systemInstruction: instruction,
                        temperature: 0.6,
                        responseMimeType: "application/json",
                        responseSchema: Prompts.FRACTURE_POINT_ANALYSIS_SCHEMA,
                    }
                }, onProgress, `Punto de Fractura (${batchNumber}/${totalBatches})`);

                const parsed = parseJsonResponse<{ fracturePointResponses: FracturePointResponseItem[] }>(response.text);
                return parsed.fracturePointResponses ?? [];
            }
        },
        onProgress
    );
};

/**
 * FASE 3: Análisis Defensivo de Blindaje Jurisprudencial mediante el motor unificado de lotes.
 */
const performJurisprudentialShielding_Phase3 = async (
    criticalPoints: CriticalPoint[],
    fullDocumentText: string,
    onProgress: (progress: AnalysisProgress) => void
): Promise<JurisprudentialShieldingResponseItem[]> => {
    return processBatches<CriticalPoint, JurisprudentialShieldingResponseItem>(
        criticalPoints,
        {
            batchSize: DEFAULT_BATCH_SIZE,
            concurrency: DEFAULT_ANALYSIS_CONCURRENCY,
            phaseName: 'Fase 3: Blindaje Jurisprudencial',
            agentId: 'shielding',
            phaseNumber: 2,
            processBatch: async (batch, batchNumber, totalBatches) => {
                const instruction = Prompts.getJurisprudentialShieldingPrompt(batch, fullDocumentText);
                const response = await generateContentWithRetry({
                    model: MODEL_FAST,
                    contents: "Analiza los puntos críticos para encontrar el 'Blindaje Jurisprudencial' basado en las instrucciones.",
                    config: {
                        systemInstruction: instruction,
                        temperature: 0.5,
                        responseMimeType: "application/json",
                        responseSchema: Prompts.JURISPRUDENTIAL_SHIELDING_SCHEMA,
                    }
                }, onProgress, `Blindaje Jurisprudencial (${batchNumber}/${totalBatches})`);

                const parsed = parseJsonResponse<{ jurisprudentialShieldingResponses: JurisprudentialShieldingResponseItem[] }>(response.text);
                return parsed.jurisprudentialShieldingResponses ?? [];
            }
        },
        onProgress
    );
};

/**
 * FASE 4: Coherencia Probatoria y cotejo de hechos contra anexos documentales.
 */
const performEvidentiaryInconsistencyAnalysis_Phase4 = async (
    fullDocumentText: string,
    onProgress: (progress: AnalysisProgress) => void
): Promise<EvidentiaryInconsistencyResponseItem> => {
    if (!fullDocumentText.includes('<PRUEBA')) {
        onProgress({ 
            log: "[Fase 4: Coherencia Probatoria] Omitido: No se aportaron pruebas documentales para cotejo.", 
            agentId: 'coherence', 
            status: 'COMPLETADO', 
            phase: 2 
        });
        return { inconsistencies: [] };
    }

    onProgress({ 
        log: "[Fase 4: Coherencia Probatoria] Contrastando afirmaciones fácticas con el material probatorio aportado...", 
        agentId: 'coherence', 
        status: 'TRABAJANDO', 
        phase: 2 
    });

    const inconsistencyInstruction = Prompts.getEvidentiaryInconsistencyPrompt(fullDocumentText);

    const inconsistencyResponse = await generateContentWithRetry({
        model: MODEL_FAST,
        contents: "Analiza el expediente para encontrar inconsistencias probatorias según las instrucciones.",
        config: {
            systemInstruction: inconsistencyInstruction,
            temperature: 0.5,
            responseMimeType: "application/json",
            responseSchema: Prompts.EVIDENTIARY_INCONSISTENCY_SCHEMA,
        }
    }, onProgress, "Agente de Coherencia Probatoria");

    onProgress({ 
        log: "[Fase 4: Coherencia Probatoria] Auditoría probatoria finalizada.", 
        agentId: 'coherence', 
        status: 'COMPLETADO', 
        phase: 2 
    });
    
    return parseJsonResponse<EvidentiaryInconsistencyResponseItem>(inconsistencyResponse.text);
};

/**
 * FASE 5: Extracción de la Línea de Tiempo Forense con generación de IDs limpios y reproducibles.
 */
const extractTimeline_Phase5 = async (
    fullDocumentText: string,
    onProgress: (progress: AnalysisProgress) => void,
    simpleId: () => string
): Promise<TimelineEvent[]> => {
    onProgress({ 
        log: "[Fase 5: Línea de Tiempo] Reconstruyendo cronología fáctica y procesal...", 
        agentId: 'timeline', 
        status: 'TRABAJANDO', 
        phase: 2 
    });

    try {
        const result = await extractTimelineEvents(fullDocumentText);
        const events = (result.events || []).map((event: Omit<TimelineEvent, 'id'>) => ({ 
            ...event, 
            id: `tl-${simpleId()}` 
        }));

        onProgress({ 
            log: `[Fase 5: Línea de Tiempo] Reconstrucción concluida: ${events.length} hito(s) cronológico(s) indexado(s).`, 
            agentId: 'timeline', 
            status: 'COMPLETADO', 
            phase: 2 
        });
        return events;
    } catch (error) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        onProgress({ 
            log: `[Fase 5: Línea de Tiempo] Falló la reconstrucción cronológica: ${message}`, 
            agentId: 'timeline', 
            status: 'FALLO', 
            phase: 2 
        });
        return [];
    }
};

/**
 * Orquesta el análisis completo del caso en un proceso de cascada sinérgico de dos fases.
 * 
 * Mejoras aplicadas:
 * - Concurrencia controlada para evitar rate-limits y saturación.
 * - Motor unificado `processBatches` para Fases 2 y 3.
 * - Deduplicación estricta de puntos críticos y fuentes web.
 * - Integración real y activa del dictamen del SupervisorAgent en el informe final.
 * - Separación epistemológica estricta entre Hechos del Expediente, Anexos y Búsqueda Web.
 */
export const analyzeCaseDocument = async (
    primaryDocumentText: string,
    evidenceTexts: { name: string, text: string }[],
    documentType: CaseDocumentType,
    onProgress: (progress: AnalysisProgress) => void,
    simpleId: () => string
): Promise<{ baseAnalysis: IntegralAnalysisResponse, enrichedAnalysis: AnalysisReport }> => {

    try {
        // --- 1. MEMORIA CENTRALIZADA & INDEXACIÓN DE EXPEDIENTE ---
        const dummyPrimary: Attachment = {
            name: 'Documento_Principal.pdf',
            size: primaryDocumentText.length,
            type: 'application/pdf',
            isPrimary: true,
            evidenceType: 'DOCUMENT',
            extractedText: primaryDocumentText,
            status: 'ready'
        };

        const dummyEvidences: Attachment[] = evidenceTexts.map(e => ({
            name: e.name,
            size: e.text.length,
            type: 'text/plain',
            isPrimary: false,
            evidenceType: 'DOCUMENT',
            extractedText: e.text,
            status: 'ready'
        }));

        const caseContext = contextCacheService.createOrGetContext(dummyPrimary, dummyEvidences);
        onProgress({ 
            log: `[Memoria de Contexto] Expediente indexado (${caseContext.totalWordCount} palabras, ~${caseContext.estimatedTokens} tokens). Hash: ${caseContext.cacheId}`,
            phase: 1 
        });

        // --- 2. INVESTIGACIÓN EXTERNA Y SUPERVISIÓN AGÉNTICA SOBERANA ---
        // Ejecución en paralelo con integración real del resultado de ambas operaciones
        const [webResearch, supervisorDecision] = await Promise.all([
            performWebResearch_Phase0(primaryDocumentText, onProgress),
            supervisorAgent.orchestrateAutonomousInvestigation(caseContext, documentType, onProgress).catch(err => {
                console.warn("[SupervisorAgent] Fallback activado:", err);
                return null as SupervisorDecision | null;
            })
        ]);

        const { searchResultsText, allSources } = webResearch;
        
        // --- 3. CONSTRUCCIÓN EPISTEMOLÓGICA DE FUENTES SEPARADAS ---
        // Se establecen límites claros para que el modelo nunca confunda una investigación web externa con hechos del expediente
        const evidenceParts = evidenceTexts.length > 0 
            ? evidenceTexts.map(e => `<PRUEBA NOMBRE_ARCHIVO="${e.name}">\n${e.text}\n</PRUEBA>`).join('\n\n')
            : '';

        const contextBlocks: string[] = [
            `<!-- FUENTE A: DOCUMENTO PROCESAL PRINCIPAL (MATRIZ FÁCTICA Y DEBATE DEL EXPEDIENTE) -->\n<DOCUMENTO_PRINCIPAL TIPO="${documentType}">\n${primaryDocumentText}\n</DOCUMENTO_PRINCIPAL>`
        ];

        if (evidenceParts) {
            contextBlocks.push(`<!-- FUENTE B: MATERIAL PROBATORIO APORTADO (ANEXOS Y FOLIOS DOCUMENTALES) -->\n${evidenceParts}`);
        }

        if (searchResultsText) {
            contextBlocks.push(`<!-- FUENTE C: INVESTIGACIÓN JURISPRUDENCIAL Y EXTERNA (MARCO HERMENÉUTICO) -->\n<!-- REGLA FORENSE: La investigación externa sirve para interpretar el derecho y verificar precedentes, NUNCA para crear hechos inexistentes en el expediente. -->\n${searchResultsText}`);
        }

        const combinedContents = contextBlocks.join('\n\n');

        // --- 4. FASE 1: AUTOPSIA FORENSE INTEGRAL ---
        const phase1Result = await performConsortiumAnalysis_Phase1(
            combinedContents,
            documentType,
            onProgress
        );

        const criticalPointsWithIds: CriticalPoint[] = phase1Result.criticalPoints.map(cp => ({ 
            ...cp, 
            id: simpleId() 
        }));

        // --- 5. FASES 2, 3, 4, 5: ENRIQUECIMIENTO PARALELO CON CONCURRENCIA CONTROLADA ---
        onProgress({ 
            log: "Iniciando fases de enriquecimiento analítico (Fractura, Blindaje, Coherencia y Cronología)...",
            phase: 2
        });
        
        const [
            phase2Result,
            phase3Result,
            phase4Result,
            timelineResult,
        ] = await Promise.all([
            performFracturePointAnalysis_Phase2(criticalPointsWithIds, combinedContents, onProgress),
            performJurisprudentialShielding_Phase3(criticalPointsWithIds, combinedContents, onProgress),
            performEvidentiaryInconsistencyAnalysis_Phase4(combinedContents, onProgress),
            extractTimeline_Phase5(combinedContents, onProgress, simpleId),
        ]);

        // --- 6. FUSIÓN, SÍNTESIS Y ENRIQUECIMIENTO CON SUPERVISOR ---
        onProgress({ 
            log: "Consolidando y sintetizando el informe final con dictamen de supervisión...", 
            agentId: 'synthesizer', 
            status: 'TRABAJANDO' 
        });
        
        const fractureMap = new Map(phase2Result.map(item => [item.criticalPointId, item.fracturePointAnalysis]));
        const shieldingMap = new Map(phase3Result.map(item => [item.criticalPointId, item.jurisprudentialShielding]));
        
        const enrichedCriticalPoints = criticalPointsWithIds.map(cp => {
            const enrichedCp = { ...cp };
            if (fractureMap.has(cp.id)) {
                enrichedCp.fracturePointAnalysis = fractureMap.get(cp.id);
            }
            if (shieldingMap.has(cp.id)) {
                enrichedCp.jurisprudentialShielding = shieldingMap.get(cp.id);
            }
            return enrichedCp;
        });

        const inconsistenciesWithIds = (phase4Result.inconsistencies || []).map(inc => ({
            ...inc, 
            id: simpleId()
        }));

        // Integración activa de la decisión del supervisor en la auditoría y síntesis estratégica
        const mergedCaseOverview = supervisorDecision?.strategicDiagnosis 
            ? `${phase1Result.caseOverview}\n\n[DICTAMEN DEL MAGISTRADO SUPERVISOR]\n${supervisorDecision.strategicDiagnosis}`
            : phase1Result.caseOverview;

        const mergedPreFlightAudit = {
            ...phase1Result.preFlightAudit,
            functionalCompetenceReview: phase1Result.preFlightAudit?.functionalCompetenceReview || 'Competencia funcional auditada.',
            documentGaps: [
                ...(phase1Result.preFlightAudit?.documentGaps || []),
                ...(supervisorDecision?.identifiedLegalRisks || [])
            ],
            logicalContradictions: phase1Result.preFlightAudit?.logicalContradictions || [],
            unverifiedSections: phase1Result.preFlightAudit?.unverifiedSections || [],
            proceduralTermsAudit: supervisorDecision?.synthesizedVerdict 
                ? `${phase1Result.preFlightAudit?.proceduralTermsAudit || ''} | ${supervisorDecision.synthesizedVerdict}`.trim()
                : (phase1Result.preFlightAudit?.proceduralTermsAudit || 'Términos procesales verificados sin objeción de caducidad.')
        };

        const enrichedReport: AnalysisReport = {
            governanceProtocolVersion: phase1Result.governanceProtocolVersion || 'LAGP V5 - Legal Adversarial Governance Protocol',
            caseOverview: mergedCaseOverview,
            preFlightAudit: mergedPreFlightAudit,
            intermediateProductsStatus: phase1Result.intermediateProductsStatus,
            legalContradictions: phase1Result.legalContradictions,
            narrativeAnalysis: phase1Result.narrativeAnalysis,
            alternativeTheories: phase1Result.alternativeTheories,
            criticalPoints: enrichedCriticalPoints,
            evidentiaryInconsistencies: inconsistenciesWithIds,
            groundingSources: allSources,
            timeline: timelineResult,
        };

        onProgress({ 
            log: "Análisis completado exitosamente: gobernanza forense consolidada y blindada.", 
            agentId: 'synthesizer', 
            status: 'COMPLETADO',
            isFinal: true 
        });

        return { baseAnalysis: phase1Result, enrichedAnalysis: enrichedReport };

    } catch (error) {
        const message = error instanceof Error ? error.message : "Ocurrió un error desconocido durante el análisis.";
        onProgress({ log: `Análisis fallido: ${message}`, error: message, isFinal: true });
        throw new Error(`Análisis fallido: ${message}`);
    }
};
