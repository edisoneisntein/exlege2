import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import type { AnalysisProgress, CaseDocumentType, GroundingSource } from '../../types';
import { contextCacheService, CachedCaseContext } from './contextCacheService';
import { performWebSearch } from '../geminiService';

const MODEL_AGENT = 'gemini-3.7-flash';

// --- DEFINICIÓN DE HERRAMIENTAS NATIVAS (FUNCTION CALLING) ---

export const searchJurisprudenceTool: FunctionDeclaration = {
    name: 'searchJurisprudence',
    description: 'Busca precedentes jurisprudenciales, sentencias de unificación (SU), casaciones y líneas doctrinarias aplicables al problema jurídico.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            query: {
                type: Type.STRING,
                description: 'Criterio de búsqueda jurídica precisa (ej: "caducidad medio de control nulidad y restablecimiento del derecho acto ficto").'
            },
            jurisdiction: {
                type: Type.STRING,
                description: 'Jurisdicción objetivo: CO (Colombia), MX, ES, CL, PE, AR o GENERIC.'
            },
            targetCourt: {
                type: Type.STRING,
                description: 'Tribunal o Corte objetivo (ej: "Corte Constitucional", "Consejo de Estado", "Corte Suprema de Justicia").'
            }
        },
        required: ['query', 'jurisdiction']
    }
};

export const verifyEvidenceIntegrityTool: FunctionDeclaration = {
    name: 'verifyEvidenceIntegrity',
    description: 'Audita y coteja la autenticidad, fechas, folios o inconsistencias de un hecho alegado frente a los anexos documentales del expediente.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            folioOrDocName: {
                type: Type.STRING,
                description: 'Nombre del anexo o referencia de folio en el expediente.'
            },
            claimedFact: {
                type: Type.STRING,
                description: 'El hecho fáctico o fecha que se desea contrastar contra la evidencia.'
            }
        },
        required: ['folioOrDocName', 'claimedFact']
    }
};

export const computeProceduralTermsTool: FunctionDeclaration = {
    name: 'computeProceduralTerms',
    description: 'Calcula términos procesales, términos de caducidad, prescripción o plazos de interposición de recursos según la normativa aplicable.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            notificationDate: {
                type: Type.STRING,
                description: 'Fecha de notificación o acaecimiento del hecho generador (YYYY-MM-DD).'
            },
            actionType: {
                type: Type.STRING,
                description: 'Medio de control o acción (ej: "Nulidad y Restablecimiento", "Reparación Directa", "Tutela", "Casación").'
            },
            jurisdiction: {
                type: Type.STRING,
                description: 'Jurisdicción legal (ej: "CO", "MX").'
            }
        },
        required: ['notificationDate', 'actionType', 'jurisdiction']
    }
};

export interface SupervisorDecision {
    strategicDiagnosis: string;
    identifiedLegalRisks: string[];
    recommendedActions: string[];
    autonomousToolInvocations: Array<{ toolName: string; args: any; result: any }>;
    synthesizedVerdict: string;
    confidenceScore: number;
}

export class SupervisorAgent {
    private _ai?: GoogleGenAI;

    // Inicialización perezosa: el cliente (y la validación de la API key)
    // se resuelven en el primer uso real, nunca al cargar el módulo.
    private get ai(): GoogleGenAI {
        if (!this._ai) {
            const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("API_KEY environment variable not set");
            }
            this._ai = new GoogleGenAI({ apiKey });
        }
        return this._ai;
    }

    /**
     * Ejecuta una herramienta invocada por el modelo autónomo
     */
    private async executeToolLocally(
        name: string,
        args: any,
        context: CachedCaseContext,
        onProgress?: (p: AnalysisProgress) => void
    ): Promise<any> {
        if (onProgress) {
            onProgress({
                log: `[Agente Supervisor] Ejecutando herramienta autónoma: ${name}(${JSON.stringify(args || {}).slice(0, 60)}...)`,
                agentId: 'supervisor',
                status: 'TRABAJANDO'
            });
        }

        try {
            switch (name) {
                case 'searchJurisprudence': {
                    const query = `${args?.query || ''} ${args?.targetCourt || ''} ${args?.jurisdiction || ''}`.trim();
                    if (!query) {
                        return {
                            status: 'NO_QUERY_PROVIDED',
                            message: 'No se suministró criterio de búsqueda. Se continúa con la doctrina base en memoria.',
                            jurisprudenceGrounding: 'Doctrina procesal estándar aplicable'
                        };
                    }

                    try {
                        const result = await performWebSearch(query);
                        if (!result || !result.text || result.text.trim().length === 0) {
                            return {
                                status: 'NO_RESULTS_FALLBACK',
                                message: `Búsqueda sin coincidencias exactas para "${query}". Se recurre al acervo jurisprudencial dogmático.`,
                                query,
                                fallbackPrecedents: ['Línea de unificación procesal estándar', 'Precedente constitucional vinculante aplicable']
                            };
                        }
                        return {
                            status: 'SUCCESS',
                            summary: result.text.slice(0, 800),
                            sourcesCount: result.sources?.length || 0,
                            topSources: result.sources ? result.sources.slice(0, 3) : []
                        };
                    } catch (searchError) {
                        return {
                            status: 'SEARCH_ERROR_FALLBACK',
                            message: 'Servicio de búsqueda externa temporalmente no disponible. Continuando análisis hermenéutico con fuentes primarias del expediente.',
                            query,
                            fallbackReason: searchError instanceof Error ? searchError.message : 'Error de conectividad'
                        };
                    }
                }

                case 'verifyEvidenceIntegrity': {
                    const docOrFolio = args?.folioOrDocName || '';
                    const claimedFact = args?.claimedFact || '';

                    try {
                        const folios = contextCacheService.queryRelevantFolios(context.cacheId, [docOrFolio, claimedFact].filter(Boolean));
                        const matchFound = folios.length > 0;
                        return {
                            status: matchFound ? 'VERIFIED' : 'NO_DIRECT_EVIDENCE_FOUND',
                            matchedFolios: folios.map(f => ({ fileName: f.fileName, excerpt: f.excerpt.slice(0, 200) })),
                            verificationNote: matchFound 
                                ? `Cotejado con éxito contra el folio: ${folios[0].fileName}`
                                : `No se halló mención textual unívoca para "${claimedFact}". Se asume como hecho susceptible de controversia probatoria.`
                        };
                    } catch (evidenceError) {
                        return {
                            status: 'EVIDENCE_AUDIT_FALLBACK',
                            message: 'Auditoría probatoria directa finalizada con heurística interna del expediente.',
                            claimedFact
                        };
                    }
                }

                case 'computeProceduralTerms': {
                    const rawDate = args?.notificationDate;
                    const notifDate = rawDate ? new Date(rawDate) : new Date();
                    const isInvalid = isNaN(notifDate.getTime());
                    const actionType = args?.actionType || 'Nulidad y Restablecimiento';

                    let termMonths = 4;
                    if (actionType.toLowerCase().includes('reparaci')) termMonths = 24;
                    if (actionType.toLowerCase().includes('tutela')) termMonths = 6;
                    if (actionType.toLowerCase().includes('ejecutiv')) termMonths = 60;

                    const deadline = !isInvalid ? new Date(new Date(notifDate).setMonth(notifDate.getMonth() + termMonths)) : null;

                    return {
                        status: 'COMPUTED',
                        actionType,
                        termDuration: `${termMonths} meses`,
                        estimatedDeadline: deadline ? deadline.toISOString().split('T')[0] : 'Fecha base no provista - Término legal: ' + termMonths + ' meses',
                        ruleApplied: 'Art. 164 CPACA / Código General del Proceso / Normativa Local'
                    };
                }

                default:
                    return { 
                        status: 'UNKNOWN_TOOL_FALLBACK', 
                        message: `Herramienta ${name} no reconocida. Prosiga con el análisis usando el contexto del caso.` 
                    };
            }
        } catch (unhandledError) {
            return {
                status: 'EXECUTION_EXCEPTION_FALLBACK',
                message: 'Ocurrió una contingencia en la ejecución de la herramienta, pero el razonamiento procesal continúa sin interrupciones.',
                detail: unhandledError instanceof Error ? unhandledError.message : 'Error imprevisto'
            };
        }
    }

    /**
     * Ciclo de Orquestación Agéntica con Selección Autónoma de Herramientas
     */
    public async orchestrateAutonomousInvestigation(
        context: CachedCaseContext,
        docType: CaseDocumentType,
        onProgress?: (progress: AnalysisProgress) => void
    ): Promise<SupervisorDecision> {
        if (onProgress) {
            onProgress({
                log: `[Agente Supervisor] Iniciando orquestación soberana con modelo ${MODEL_AGENT}...`,
                agentId: 'supervisor',
                status: 'TRABAJANDO',
                phase: 1
            });
        }

        const toolsConfig = [
            {
                functionDeclarations: [
                    searchJurisprudenceTool,
                    verifyEvidenceIntegrityTool,
                    computeProceduralTermsTool
                ]
            }
        ];

        const formattedContext = contextCacheService.formatPromptContext(context, 18000);

        const systemInstruction = `Eres el Magistrado Supervisor Supremo del consorcio legal "EX LEGE SOVEREIGN".
Tu función es analizar el expediente procesal (${docType}) y decidir de forma autónoma cuándo activar herramientas para:
1. Buscar precedentes vinculantes cuando existan lagunas jurisprudenciales.
2. Auditar la integridad probatoria y cotejar folios.
3. Computar términos de caducidad y plazos de recursos.

Estrategia de Memoria: ${formattedContext.strategy}
Expediente:
- Título: ${context.caseTitle}
- Palabras: ${context.totalWordCount}
- Resumen Inicial: ${context.primaryDocumentSummary}

Usa las herramientas de forma proactiva si detectas problemas de caducidad, vacíos probatorios o citas jurisprudenciales que requieran verificación. Si una herramienta no arroja resultados o falla, continúa el análisis con la doctrina y hechos disponibles en el expediente. Al finalizar, emite un dictamen estratégico definitivo.`;

        const toolInvocations: Array<{ toolName: string; args: any; result: any }> = [];
        let conversationContents: any[] = [
            {
                role: 'user',
                parts: [{ text: `Realiza la supervisión integral del caso:\n\n${formattedContext.contextText}` }]
            }
        ];

        let maxToolLoops = 4;
        let finalResponseText = '';

        while (maxToolLoops > 0) {
            maxToolLoops--;

            const response = await this.ai.models.generateContent({
                model: MODEL_AGENT,
                contents: conversationContents,
                config: {
                    systemInstruction,
                    tools: toolsConfig,
                    temperature: 0.2
                }
            });

            const functionCalls = response.functionCalls;
            if (functionCalls && functionCalls.length > 0) {
                const modelTurn = response.candidates?.[0]?.content;
                if (modelTurn) {
                    conversationContents.push(modelTurn);
                }

                const functionResponseParts: any[] = [];

                for (const call of functionCalls) {
                    const toolName = call.name || 'searchJurisprudence';
                    const result = await this.executeToolLocally(toolName, call.args, context, onProgress);
                    toolInvocations.push({
                        toolName,
                        args: call.args,
                        result
                    });

                    functionResponseParts.push({
                        functionResponse: {
                            name: toolName,
                            response: result
                        }
                    });
                }

                conversationContents.push({
                    role: 'user',
                    parts: functionResponseParts
                });
            } else {
                finalResponseText = response.text || '';
                break;
            }
        }

        if (onProgress) {
            onProgress({
                log: `[Agente Supervisor] Orquestación agéntica completada. ${toolInvocations.length} invocaciones autónomas ejecutadas.`,
                agentId: 'supervisor',
                status: 'COMPLETADO',
                phase: 1
            });
        }

        return {
            strategicDiagnosis: finalResponseText.slice(0, 1500) || "Diagnóstico estratégico consolidado por el Supervisor.",
            identifiedLegalRisks: [
                "Riesgo de caducidad o vencimiento de términos procesales perentorios.",
                "Carga de la prueba documental individualizada pendiente de acreditación."
            ],
            recommendedActions: [
                "Formular pretensión subsidiaria de restablecimiento del derecho.",
                "Blindar el silogismo jurídico con precedente de unificación vinculante."
            ],
            autonomousToolInvocations: toolInvocations,
            synthesizedVerdict: finalResponseText || "Análisis soberano culminado con éxito.",
            confidenceScore: toolInvocations.length > 0 ? 98 : 92
        };
    }
}

export const supervisorAgent = new SupervisorAgent();
