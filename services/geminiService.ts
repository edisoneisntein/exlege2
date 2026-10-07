import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { IntegralAnalysisResponse, GroundingSource, AnalysisReport, FullAnalysisResult, AlternativeTheory, AIPersonality, AnalysisProgress, CaseDocumentType, LegalActionProposal, CriticalPoint, FracturePointResponseItem, ArgumentAnalysis, JurisprudentialShieldingResponseItem, EvidentiaryInconsistency, EvidentiaryInconsistencyResponseItem, RefinementMotion, AmendmentProposal, ComparativeAnalysisReport, TimelineExtractionResponse, JudgePersonality } from '../types';
import type { Message } from '../hooks/useChatSession';
import * as Prompts from './promptManager';

// --- CONFIGURATION AND INITIALIZATION ---
const RETRY_ATTEMPTS = 5;
const INITIAL_RETRY_DELAY = 1000;
const ai = new GoogleGenAI({ apiKey: "" });
const MODEL_FAST = 'gemini-3.5-flash';


// --- UTILITIES ---

/**
 * Espera un tiempo que aumenta exponencialmente para evitar sobrecargar la API.
 * @param attempt El número de intento actual (base 0).
 * @returns Una promesa que se resuelve después del retraso calculado.
 */
const exponentialBackoff = (attempt: number): Promise<void> => {
    const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt), 30000);
    return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Parsea y valida una respuesta JSON de la IA, con capacidades de sanitización.
 * Intenta corregir errores comunes como comas finales o faltantes.
 * @template T El tipo esperado del objeto JSON.
 * @param responseText El texto crudo de la respuesta de la IA.
 * @returns El objeto JSON parseado.
 * @throws Si el parseo falla o la respuesta está vacía.
 */
export function parseJsonResponse<T>(responseText: string | undefined): T {
    try {
        if (!responseText || responseText.trim() === '') {
            throw new Error("La respuesta de la IA estaba vacía o nula.");
        }

        let jsonString = responseText.trim();

        const match = jsonString.match(/^```(?:json|javascript|ts|js)?\s*([\s\S]*?)\s*```$/i);
        if (match && match[1]) {
            jsonString = match[1].trim();
        } else {
            jsonString = jsonString.replace(/^\s*(?:json|```json|```)/i, '').replace(/```\s*$/i, '').trim();
        }

        // --- JSON SANITIZATION ---

        // NEW (Step 0): Sanitize unescaped newlines within strings, a common LLM error.
        let sanitizedString = '';
        let inString = false;
        for (let i = 0; i < jsonString.length; i++) {
            const char = jsonString[i];

            if (char === '"' && (i === 0 || jsonString[i - 1] !== '\\')) {
                inString = !inString;
            }

            if (inString && (char === '\n' || char === '\r')) {
                sanitizedString += (char === '\n' ? '\\n' : '\\r');
            } else {
                sanitizedString += char;
            }
        }
        jsonString = sanitizedString;

        // 1. Remueve comas finales de objetos y arreglos.
        jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');

        // 2. Corrige comas faltantes o mal ubicadas entre propiedades.
        jsonString = jsonString.replace(/([}\]])\s*,?\s*(")/g, '$1,$2');

        const parsed = JSON.parse(jsonString) as T;
        if (typeof parsed !== 'object' || parsed === null) {
            throw new Error("El JSON parseado no es un objeto válido.");
        }

        return parsed;

    } catch (e) {
        console.error("Fallo al parsear la respuesta JSON de la IA:", responseText, e);
        throw new Error("La IA generó una respuesta con un formato JSON inválido que no pudo ser reparado automáticamente. Por favor, intente el análisis de nuevo.");
    }
}

/**
 * Convierte un ArrayBuffer a una cadena de texto en Base64.
 * @param buffer El ArrayBuffer a convertir.
 * @returns La cadena de texto codificada en Base64.
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Función centralizada para realizar llamadas a la API con reintentos y backoff exponencial,
 * junto con soporte para modelos de respaldo automáticos si ocurre un error de permisos o compatibilidad.
 * @param request El objeto de configuración para la llamada `generateContent`.
 * @param onProgress Callback opcional para reportar el progreso de los reintentos.
 * @param agentName Nombre opcional del agente para los logs de progreso.
 * @returns Una promesa que se resuelve con la respuesta de la API.
 * @throws Lanza el último error descriptivo si todos los reintentos fallan.
 */
export async function generateContentWithRetry(
    request: Parameters<typeof ai.models.generateContent>[0],
    onProgress?: (progress: AnalysisProgress) => void,
    agentName?: string
): Promise<GenerateContentResponse> {
    let lastError: Error | null = null;
    const logPrefix = agentName ? `[${agentName}]` : '[Sistema de IA]';

    const originalModel = request.model;
    const candidates = [
        'gemini-3.5-flash',
        'gemini-flash-latest',
        'gemini-3.1-flash-lite'
    ];

    // Generamos la lista de modelos para reintentar secundariamente
    const modelsToTry: string[] = [originalModel as string];
    for (const m of candidates) {
        if (m !== originalModel) {
            modelsToTry.push(m);
        }
    }

    for (let mIndex = 0; mIndex < modelsToTry.length; mIndex++) {
        const currentModel = modelsToTry[mIndex];
        request.model = currentModel;

        for (let i = 0; i < RETRY_ATTEMPTS; i++) {
            try {
                try {
                    const response = await fetch('/api/gemini', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: request.model,
                            contents: request.contents,
                            ...request.config
                        })
                    });
                    const data = await response.json();
                    return { text: data.text } as GenerateContentResponse;
                } catch (error) {
                    throw new Error(`Error en proxy: ${error instanceof Error ? error.message : String(error)}`);
                }
            } catch (error) {
                lastError = error as Error;
                const errStr = (error instanceof Error ? error.message : String(error)).toLowerCase();

                // Si es un error de permisos, modelo no encontrado, o argumento inválido del modelo,
                // probamos con el siguiente modelo disponible en la lista de candidatos inmediatamente.
                const isModelOrPermissionError = errStr.includes('permission_denied') ||
                    errStr.includes('permission denied') ||
                    errStr.includes('403') ||
                    errStr.includes('not found') ||
                    errStr.includes('not_found') ||
                    errStr.includes('bad request') ||
                    errStr.includes('invalid argument');

                if (isModelOrPermissionError && mIndex < modelsToTry.length - 1) {
                    const nextModel = modelsToTry[mIndex + 1];
                    if (onProgress) {
                        onProgress({
                            log: `${logPrefix} Advertencia de modelo (${currentModel} falló por permisos o compatibilidad). Cambiando de forma autónoma al modelo de respaldo: ${nextModel}...`
                        });
                    }
                    break; // Sale del bucle de reintentos actual de este modelo para pasar al siguiente candidato
                }

                const shouldRetry = errStr.includes('500') ||
                    errStr.includes('504') ||
                    errStr.includes('rpc failed') ||
                    errStr.includes('network') ||
                    errStr.includes('429') ||
                    errStr.includes('exhausted') ||
                    errStr.includes('quota') ||
                    errStr.includes('limit') ||
                    errStr.includes('timeout');

                if (shouldRetry) {
                    const delay = INITIAL_RETRY_DELAY * Math.pow(2, i);
                    if (onProgress) onProgress({
                        log: `${logPrefix} Advertencia de API / Red (intento ${i + 1}/${RETRY_ATTEMPTS}): ${error instanceof Error ? error.message : String(error)}. Reintentando de forma autónoma en ${delay / 1000}s...`
                    });
                    await exponentialBackoff(i);
                } else {
                    // Si no es elegible para reintento estándar ni para alternativo de modelo, salimos para probar el siguiente modelo si existe
                    if (mIndex < modelsToTry.length - 1) {
                        break;
                    }
                    throw error;
                }
            }
        }
    }

    if (onProgress) onProgress({ log: `${logPrefix} Todos los reintentos y modelos de respaldo fallaron.` });

    const finalErrStr = (lastError instanceof Error ? lastError.message : String(lastError)).toLowerCase();

    // Tratamiento especial con instrucciones en español para el panel de AI Studio
    if (finalErrStr.includes('permission') || finalErrStr.includes('denied') || finalErrStr.includes('403')) {
        throw new Error(
            "Fallo de llamada API a Gemini (Permiso Denegado / 403 / Permission Denied). " +
            "Esto suele ocurrir si tu clave de la API (API Key) no es válida, ha expirado, tiene restricciones de seguridad o no tiene habilitado el acceso a estos modelos. " +
            "Por favor, revisa y actualiza tu clave API en el panel de **Settings > Secrets** (Configuración > Secretos) en la parte superior derecha de la interfaz de AI Studio para continuar."
        );
    }

    throw lastError || new Error("Fallo de llamada a Gemini tras probar múltiples reintentos y modelos de respaldo.");
}

export async function* generateRAGResponseStream(
    query: string,
    chatHistory: Message[],
    fullResult: FullAnalysisResult,
    activeMode: 'STRATEGIC_COLLABORATOR' | 'STRATEGIC_ADVERSARY' | 'JUDGE' | 'WITNESS',
    selectedPersonality: JudgePersonality,
): AsyncGenerator<string> {
    // 1. RETRIEVAL STEP (no-streaming)
    const retrieverPrompt = Prompts.getRagRetrieverPrompt(query, chatHistory, fullResult);

    const retrieverResponse = await generateContentWithRetry({
        model: MODEL_FAST,
        contents: [{ role: 'user', parts: [{ text: retrieverPrompt }] }],
        config: {
            temperature: 0.0,
            responseMimeType: "application/json",
            responseSchema: Prompts.RAG_RETRIEVAL_SCHEMA,
        }
    }, undefined, 'RAG Retriever');

    const { retrievedSnippets } = parseJsonResponse<{ retrievedSnippets: { source: string, content: string }[] }>(retrieverResponse.text);

    if (!retrievedSnippets || retrievedSnippets.length === 0) {
        yield "No pude encontrar información relevante en el expediente para responder a su pregunta. ¿Podría reformularla?";
        return;
    }

    const contextForGenerator = retrievedSnippets
        .map(s => `<SNIPPET FUENTE="${s.source}">\n${s.content}\n</SNIPPET>`)
        .join('\n\n');

    // 2. GENERATION STEP (streaming)
    const generatorSystemInstruction = Prompts.getRagGeneratorSystemInstruction(activeMode, fullResult, selectedPersonality, null);

    const generatorHistory = chatHistory.slice(-6).map(m => ({
        role: m.speaker === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
    }));

    const generatorContents = [
        ...generatorHistory,
        {
            role: 'user',
            parts: [{
                text: `
Basado en los siguientes fragmentos del expediente, responde a mi pregunta.

**MI PREGUNTA:**
${query}

**FRAGMENTOS DEL EXPEDIENTE:**
---
${contextForGenerator}
---
                `}]
        }
    ];

    try {
        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: MODEL_FAST,
            contents: generatorContents,
            config: {
              systemInstruction: { role: 'system', parts: [{ text: generatorSystemInstruction }] },
              temperature: 0.6,
            },
            stream: true
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        if (!response.body) throw new Error("Response body is null");
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data:')) continue;
              const payload = trimmed.slice(5).trim();
              if (payload === '[DONE]') return;
              try {
                const json = JSON.parse(payload);
                if (json.text) yield json.text;
              } catch {
                // Ignore parsing errors
              }
            }
          }
        } finally {
          reader.releaseLock?.();
        }
    } catch (err) {
      const errStr = (err instanceof Error ? err.message : String(err)).toLowerCase();
      if (errStr.includes('permission') || errStr.includes('denied') || errStr.includes('403')) {
        yield "\n\n**[Error del Sistema de IA]**: No se pudo establecer conexión con Gemini (Permiso Denegado / 403). Esto suele ocurrir si tu clave de la API (API Key) no es válida, ha expirado o tiene restricciones en Settings > Secrets.";
      } else {
        throw err;
      }
    }
}

export async function generateOpeningStatement(
    activeMode: 'STRATEGIC_COLLABORATOR' | 'STRATEGIC_ADVERSARY' | 'JUDGE' | 'WITNESS',
    fullResult: FullAnalysisResult
): Promise<string> {
    const getPromptFunction = activeMode === 'STRATEGIC_COLLABORATOR' ? Prompts.getVoiceCollaboratorPrompt : Prompts.getWitnessPrepPrompt;
    const fullPrompt = getPromptFunction(fullResult);

    const separators = [
        "**EXPEDIENTE VIRTUAL COMPLETO (TU ÚNICA FUENTE DE VERDAD):**",
        "**EXPEDIENTE VIRTUAL COMPLETO (TU EXPEDIENTE):**"
    ];

    let systemInstruction = fullPrompt;
    for (const separator of separators) {
        if (fullPrompt.includes(separator)) {
            systemInstruction = fullPrompt.split(separator)[0];
            break;
        }
    }

    const openingInstruction = activeMode === 'STRATEGIC_COLLABORATOR'
        ? "Comienza la sesión saludando y preguntando al abogado sobre qué punto del informe desea discutir. Tu primera respuesta debe ser solo este saludo inicial y la pregunta."
        : "Comienza la simulación tomando el control, saludando brevemente al testigo (el usuario) y haciendo la primera pregunta para que exponga su versión de los hechos.";

    const response = await generateContentWithRetry({
        model: MODEL_FAST,
        contents: [{ role: 'user', parts: [{ text: openingInstruction }] }],
        config: {
            systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
            temperature: 0.5,
        }
    }, undefined, `Turno Cero (${activeMode})`);

    return (response.text || "").trim();
}


// --- ATOMIC SERVICE FUNCTIONS ---

/**
 * Analiza una imagen para extraer una descripción textual de su contenido.
 * @param fileBuffer El buffer de la imagen como ArrayBuffer.
 * @param mimeType El tipo MIME de la imagen (ej. 'image/jpeg').
 * @returns Una promesa que se resuelve con el informe textual de la evidencia visual.
 */
export const analyzeImageEvidence = async (fileBuffer: ArrayBuffer, mimeType: string): Promise<string> => {
    const prompt = Prompts.getImageAnalysisPrompt();
    const base64Data = arrayBufferToBase64(fileBuffer);

    const response = await generateContentWithRetry({
        model: 'gemini-flash-latest',
        contents: {
            parts: [
                { text: prompt },
                { inlineData: { mimeType, data: base64Data } }
            ]
        },
        config: { temperature: 0.1 },
    }, undefined, 'Analista de Imagen');

    return `Informe de Evidencia Visual:\n${response.text || ""}`;
};

/**
 * Realiza una búsqueda web usando la herramienta de Google Search de Gemini.
 * @param query La consulta de búsqueda a realizar.
 * @returns Una promesa que se resuelve con un objeto que contiene el texto sintetizado y las fuentes.
 */
export const performWebSearch = async (query: string): Promise<{ text: string, sources: GroundingSource[] }> => {
    try {
        const systemInstruction = Prompts.getWebSearchPrompt();

        const response = await generateContentWithRetry({
            model: MODEL_FAST,
            contents: [{ role: 'user', parts: [{ text: query }] }],
            config: {
                systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
                temperature: 0.1,
                tools: [{ googleSearch: {} }],
            },
        }, undefined, 'Investigador Web');

        const text = response.text || "";
        let sources: GroundingSource[] = [];
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

        if (groundingMetadata?.groundingChunks) {
            sources = (groundingMetadata.groundingChunks as any[])
                .map(chunk => chunk.web)
                .filter(web => web && web.uri)
                .map(web => ({ title: web.title || web.uri, uri: web.uri }));
        }

        return { text, sources };

    } catch (error) {
        console.error("Error performing web search with Gemini:", error);
        throw new Error("La IA no pudo realizar la investigación web. Inténtelo de nuevo más tarde.");
    }
};

/**
 * Traduce un texto al español.
 * @param textToTranslate El texto a traducir.
 * @returns Una promesa que se resuelve con el texto traducido.
 */
export const translateText = async (textToTranslate: string): Promise<string> => {
    if (!textToTranslate) return "";
    try {
        const response = await generateContentWithRetry({
            model: MODEL_FAST,
            contents: `Por favor, traduce el siguiente texto al español:\n\n---\n\n${textToTranslate}`,
            config: { temperature: 0.1 }
        }, undefined, 'Traductor');
        return response.text || "";
    } catch (error) {
        console.error("Error translating text with Gemini:", error);
        throw new Error("La IA no pudo traducir el texto. Inténtelo de nuevo más tarde.");
    }
};

/**
 * Somete un argumento del usuario a un 'stress test' por parte de la IA.
 * @param userArgument El argumento a analizar.
 * @param fullResult El contexto completo del caso para el análisis.
 * @returns Una promesa que se resuelve con el análisis detallado del argumento.
 */
export const stressTestArgument = async (
    userArgument: string,
    fullResult: FullAnalysisResult
): Promise<ArgumentAnalysis> => {
    const systemInstruction = Prompts.getArgumentAnalysisPrompt(userArgument, fullResult);

    const response = await generateContentWithRetry({
        model: MODEL_FAST,
        contents: "Analiza el argumento del usuario basado en las instrucciones y el contexto del caso.",
        config: {
            systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
            temperature: 0.4,
            responseMimeType: "application/json",
            responseSchema: Prompts.ARGUMENT_ANALYSIS_SCHEMA
        }
    }, undefined, 'Analista de Argumentos');

    return parseJsonResponse<ArgumentAnalysis>(response.text);
};

/**
 * Somete un borrador de documento completo a un 'stress test' por parte de la IA.
 * @param draftText El borrador del documento a analizar.
 * @param fullResult El contexto completo del caso para el análisis.
 * @returns Una promesa que se resuelve con el análisis detallado del borrador.
 */
export const stressTestDraft = async (
    draftText: string,
    fullResult: FullAnalysisResult
): Promise<ArgumentAnalysis> => {
    const systemInstruction = Prompts.getStressTestDraftPrompt(draftText, fullResult);

    const response = await generateContentWithRetry({
        model: MODEL_FAST,
        contents: "Realiza el 'stress test' del borrador de documento completo basado en las instrucciones y el contexto del caso.",
        config: {
            systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
            temperature: 0.4,
            responseMimeType: "application/json",
            responseSchema: Prompts.ARGUMENT_ANALYSIS_SCHEMA
        }
    }, undefined, 'Magistrado de IA (Stress Test)');

    return parseJsonResponse<ArgumentAnalysis>(response.text);
};


/**
 * Genera un borrador de un documento legal (ej. apelación, contestación) basado en el informe.
 * @param report El informe de análisis que servirá de base.
 * @param personality La personalidad de IA que definirá el tono y estilo de la redacción.
 * @param documentType El tipo de documento a redactar.
 * @param additionalConsiderations Consideraciones adicionales del usuario para guiar la redacción.
 * @returns Una promesa que se resuelve con el texto del borrador generado.
 */
export const generateStrategicDraft = async (
    report: AnalysisReport,
    personality: AIPersonality,
    documentType: CaseDocumentType,
    additionalConsiderations?: string
): Promise<string> => {
    const systemInstruction = Prompts.getDraftingPrompt(report, personality, documentType, additionalConsiderations);

    const response = await generateContentWithRetry({
        model: MODEL_FAST,
        contents: "Redacta el borrador del documento estratégico basado en el informe integral y la personalidad legal.",
        config: {
            systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
            temperature: 0.5,
            responseMimeType: "application/json",
            responseSchema: Prompts.DRAFT_SCHEMA
        }
    }, undefined, 'Redactor Legal');

    const parsedJson = parseJsonResponse<{ draft_text: string }>(response.text);
    if (!parsedJson.draft_text || parsedJson.draft_text.trim().length < 50) {
        throw new Error("La IA generó un borrador vacío o incompleto. Por favor, intente de nuevo o ajuste las consideraciones adicionales.");
    }
    return parsedJson.draft_text;
};


/**
 * Refina un borrador de documento utilizando el análisis del 'stress test' como retroalimentación.
 * @param report El informe de análisis original.
 * @param initialDraft El borrador inicial que fue sometido a 'stress test'.
 * @param stressTestResult El análisis del 'stress test' que contiene la crítica al borrador.
 * @param personality La personalidad de la IA para la redacción final.
 * @param documentType El tipo de documento que se está redactando.
 * @returns Una promesa que se resuelve con el texto del documento final y refinado.
 */
export const refineDraft = async (
    report: AnalysisReport,
    initialDraft: string,
    stressTestResult: ArgumentAnalysis,
    personality: AIPersonality,
    documentType: CaseDocumentType
): Promise<string> => {
    const systemInstruction = Prompts.getRefinementPrompt(report, initialDraft, stressTestResult, personality, documentType);

    const response = await generateContentWithRetry({
        model: MODEL_FAST,
        contents: "Sintetiza toda la información y genera el documento final y mejorado basado en las instrucciones.",
        config: {
            systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
            temperature: 0.5,
            responseMimeType: "application/json",
            responseSchema: Prompts.DRAFT_SCHEMA // Reutilizamos el schema porque la salida es similar
        }
    }, undefined, 'Editor Legal Senior');

    const parsedJson = parseJsonResponse<{ draft_text: string }>(response.text);
    if (!parsedJson.draft_text || parsedJson.draft_text.trim().length < 50) {
        throw new Error("La IA generó un borrador refinado vacío o incompleto. Por favor, intente de nuevo.");
    }
    return parsedJson.draft_text;
};

/**
 * Genera un resumen ejecutivo de un informe de análisis en lenguaje claro para un cliente.
 * @param report El informe de análisis que servirá de base.
 * @returns Una promesa que se resuelve con el texto del resumen para el cliente.
 */
export const generateClientSummary = async (
    report: AnalysisReport
): Promise<string> => {
    const systemInstruction = Prompts.getClientSummaryPrompt(report);

    const response = await generateContentWithRetry({
        model: MODEL_FAST,
        contents: "Genera el resumen ejecutivo para el cliente basado en el informe de análisis.",
        config: {
            systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
            temperature: 0.5,
            responseMimeType: "application/json",
            responseSchema: Prompts.CLIENT_SUMMARY_SCHEMA
        }
    }, undefined, 'Abogado Comunicador');

    const parsedJson = parseJsonResponse<{ summary: string }>(response.text);
    return parsedJson.summary || "La IA no pudo generar un resumen. Por favor, intente de nuevo.";
};


/**
 * Propone acciones legales viables basadas en una narración de hechos.
 * @param narrative La narración de los hechos del caso proporcionada por el usuario.
 * @returns Una promesa que se resuelve con una lista de propuestas de acciones legales.
 */
export const proposeLegalActions = async (narrative: string): Promise<LegalActionProposal[]> => {
    const systemInstruction = Prompts.getLegalActionProposalPrompt(narrative);

    const response = await generateContentWithRetry({
        model: MODEL_FAST,
        contents: "Basado en la narración de los hechos en las instrucciones, genera las propuestas de acciones legales.",
        config: {
            systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
            temperature: 0.5,
            responseMimeType: "application/json",
            responseSchema: Prompts.LEGAL_ACTION_PROPOSAL_SCHEMA
        }
    }, undefined, 'Estratega Legal');

    const parsedJson = parseJsonResponse<{ propuestas: LegalActionProposal[] }>(response.text);
    return parsedJson.propuestas || [];
};

/**
 * Realiza un análisis comparativo entre dos documentos.
 * @param documentAText El texto del primer documento.
 * @param documentBText El texto del segundo documento.
 * @returns Una promesa que se resuelve con el informe de análisis comparativo.
 */
export const performComparativeAnalysis = async (
    documentAText: string,
    documentBText: string
): Promise<ComparativeAnalysisReport> => {
    const systemInstruction = Prompts.getComparativeAnalysisPrompt(documentAText, documentBText);

    const response = await generateContentWithRetry({
        model: MODEL_FAST,
        contents: "Realiza el análisis comparativo basado en los dos documentos proporcionados en las instrucciones del sistema.",
        config: {
            systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
            temperature: 0.3,
            responseMimeType: "application/json",
            responseSchema: Prompts.COMPARATIVE_ANALYSIS_SCHEMA
        }
    }, undefined, 'Auditor Comparativo');

    return parseJsonResponse<ComparativeAnalysisReport>(response.text);
};

/**
 * Utiliza IA para encontrar el punto crítico más relevante para un 'insight' de chat.
 * @param insightText El texto del mensaje del chat.
 * @param criticalPoints La lista de puntos críticos del informe.
 * @returns El ID del punto crítico más relevante.
 */
export const linkInsightToCriticalPoint = async (
    insightText: string,
    criticalPoints: CriticalPoint[]
): Promise<string> => {
    const systemInstruction = Prompts.getLinkInsightPrompt(insightText, criticalPoints);

    const response = await generateContentWithRetry({
        model: MODEL_FAST,
        contents: "Determina el ID del punto crítico más relevante para el insight proporcionado.",
        config: {
            systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
            temperature: 0, // Determinístico
            responseMimeType: "application/json",
            responseSchema: Prompts.LINK_INSIGHT_SCHEMA
        }
    }, undefined, 'Clasificador de Insights');

    const parsed = parseJsonResponse<{ linkedCriticalPointId: string }>(response.text);
    return parsed.linkedCriticalPointId;
};


/**
 * Genera una propuesta de enmienda para una sección de un borrador basada en una moción de refinamiento.
 * @param currentDraft El texto completo del borrador actual.
 * @param motion La moción de refinamiento que contiene el insight y la instrucción del usuario.
 * @param report El informe de análisis completo para dar contexto.
 * @returns Una promesa que se resuelve con la propuesta de enmienda.
 */
export const proposeAmendment = async (
    currentDraft: string,
    motion: RefinementMotion,
    report: AnalysisReport,
): Promise<AmendmentProposal> => {
    const systemInstruction = Prompts.getProposeAmendmentPrompt(currentDraft, motion, report);

    const response = await generateContentWithRetry({
        model: MODEL_FAST,
        contents: "Genera la propuesta de enmienda basada en la moción de refinamiento y el contexto del caso.",
        config: {
            systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
            temperature: 0.4,
            responseMimeType: "application/json",
            responseSchema: Prompts.PROPOSE_AMENDMENT_SCHEMA
        }
    }, undefined, 'Redactor Quirúrgico');

    return parseJsonResponse<AmendmentProposal>(response.text);
};

/**
 * Integra una enmienda aceptada en el borrador actual de forma inteligente.
 * @param currentDraft El texto completo del borrador actual.
 * @param amendment La propuesta de enmienda aceptada.
 * @param report El informe de análisis completo para dar contexto.
 * @returns Una promesa que se resuelve con el nuevo texto completo del borrador.
 */
export const integrateAmendment = async (
    currentDraft: string,
    amendment: AmendmentProposal,
    report: AnalysisReport
): Promise<string> => {
    const systemInstruction = Prompts.getIntegrateAmendmentPrompt(currentDraft, amendment, report);

    const response = await generateContentWithRetry({
        model: MODEL_FAST,
        contents: "Integra la enmienda en el borrador actual de forma coherente y fluida.",
        config: {
            systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
            temperature: 0.3,
            responseMimeType: "application/json",
            responseSchema: Prompts.DRAFT_SCHEMA // Reutilizamos el draft schema
        }
    }, undefined, 'Integrador de Enmiendas');

    const parsed = parseJsonResponse<{ draft_text: string }>(response.text);
    return parsed.draft_text;
};

/**
 * Extrae eventos cronológicos de un texto para construir una línea de tiempo.
 * @param fullText El texto completo de todos los documentos del caso.
 * @returns Una promesa que se resuelve con la respuesta de extracción de la línea de tiempo.
 */
export const extractTimelineEvents = async (
    fullText: string
): Promise<TimelineExtractionResponse> => {
    const systemInstruction = Prompts.getTimelineExtractionPrompt(fullText);

    const response = await generateContentWithRetry({
        model: MODEL_FAST,
        contents: "Extrae la línea de tiempo de los documentos proporcionados en las instrucciones del sistema.",
        config: {
            systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
            temperature: 0.1,
            responseMimeType: "application/json",
            responseSchema: Prompts.TIMELINE_EXTRACTION_SCHEMA
        }
    }, undefined, 'Cronista Forense');

    return parseJsonResponse<TimelineExtractionResponse>(response.text);
};