import { GoogleGenAI, Type } from '@google/genai';
import type { AnalysisProgress } from '../../types';
import { parseJsonResponse } from '../geminiService';

const MODEL_GENERATOR = 'gemini-3.7-flash';
const MODEL_CRITIC = 'gemini-3.7-flash';

export interface AuditEvaluation {
    status: 'APPROVED' | 'REJECTED';
    score: number; // 0 - 100
    critique: string;
    identifiedWeaknesses: string[];
    requiredRemediations: string[];
    admissibilityRisk: 'BAJO' | 'MEDIO' | 'ALTO';
}

export interface RefinementIteration {
    iterationIndex: number;
    draft: string;
    evaluation: AuditEvaluation;
    timestamp: number;
}

export interface RefinementLoopResult {
    finalDraft: string;
    finalScore: number;
    approved: boolean;
    totalIterations: number;
    history: RefinementIteration[];
    summary: string;
}

const CRITIC_RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        status: {
            type: Type.STRING,
            description: 'APPROVED si el borrador alcanza el estándar de excelencia jurídica y solidez probatoria (score >= 95), o REJECTED si requiere correcciones.'
        },
        score: {
            type: Type.NUMBER,
            description: 'Calificación de rigor jurídico del 0 al 100.'
        },
        critique: {
            type: Type.STRING,
            description: 'Dictamen analítico detallado del Magistrado Auditor sobre la solidez procesal del borrador.'
        },
        identifiedWeaknesses: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Lista de debilidades fácticas, lagunas normativas o vulnerabilidades detectadas.'
        },
        requiredRemediations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Instrucciones obligatorias para que el Agente Redactor subsane el borrador.'
        },
        admissibilityRisk: {
            type: Type.STRING,
            description: 'Nivel de riesgo de inadmisión o rechazo: BAJO | MEDIO | ALTO.'
        }
    },
    required: ['status', 'score', 'critique', 'identifiedWeaknesses', 'requiredRemediations', 'admissibilityRisk']
};

export class RefinementLoopService {
    private ai: GoogleGenAI;

    constructor() {
        const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("API_KEY environment variable not set");
        }
        this.ai = new GoogleGenAI({ apiKey });
    }

    /**
     * Evalúa el borrador procesal actuando como Magistrado Crítico Auditor
     */
    private async evaluateDraft(
        draftText: string,
        caseSummary: string,
        onProgress?: (p: AnalysisProgress) => void,
        iterationNumber: number = 1
    ): Promise<AuditEvaluation> {
        if (onProgress) {
            onProgress({
                log: `[Magistrado Crítico - Iteración ${iterationNumber}] Auditando admisibilidad, silogismo y solidez procesal...`,
                agentId: 'critic',
                status: 'TRABAJANDO'
            });
        }

        const prompt = `Actúa como un Magistrado Superior con criterio implacable. Evalúa el siguiente borrador procesal frente a los hechos y contexto del caso.
Exige:
1. Precisión absoluta en la cita de hechos probados (sin afirmaciones dogmáticas).
2. Separación nítida entre pretensión principal y pretensiones subsidiarias.
3. Silogismo en 4 niveles (Hecho -> Norma -> Inferencia -> Conclusión).
4. Blindaje contra caducidad y excepciones previas.

Contexto del Caso:
${caseSummary.slice(0, 4000)}

Borrador Procesal a Auditar:
${draftText}

Asigna status "APPROVED" únicamente si la calificación es de 95 puntos o superior y no existen inconsistencias graves.`;

        const response = await this.ai.models.generateContent({
            model: MODEL_CRITIC,
            contents: prompt,
            config: {
                systemInstruction: "Eres el Magistrado Auditor Supremo de EX LEGE. Aplica el test más riguroso de admisibilidad y congruencia.",
                temperature: 0.1,
                responseMimeType: "application/json",
                responseSchema: CRITIC_RESPONSE_SCHEMA
            }
        });

        const parsed = parseJsonResponse<AuditEvaluation>(response.text);
        // Garantizar coherencia
        if (parsed.score >= 95 && parsed.status !== 'APPROVED') {
            parsed.status = 'APPROVED';
        } else if (parsed.score < 95 && parsed.status === 'APPROVED') {
            parsed.status = 'REJECTED';
        }

        return parsed;
    }

    /**
     * Perfecciona el borrador incorporando las críticas y directrices del Magistrado Auditor
     */
    private async generateImprovedDraft(
        currentDraft: string,
        evaluation: AuditEvaluation,
        caseSummary: string,
        onProgress?: (p: AnalysisProgress) => void,
        iterationNumber: number = 1
    ): Promise<string> {
        if (onProgress) {
            onProgress({
                log: `[Agente Litigante - Iteración ${iterationNumber}] Reescribiendo con foco en las 3 debilidades críticas prioritarias (Rigor: ${evaluation.score}/100)...`,
                agentId: 'writer',
                status: 'TRABAJANDO'
            });
        }

        // Límite estricto: enfocar la subsanación en las 3 principales vulnerabilidades para evitar inflación y redundancia
        const prioritizedWeaknesses = evaluation.identifiedWeaknesses.slice(0, 3);
        const prioritizedRemediations = evaluation.requiredRemediations.slice(0, 3);

        const prompt = `Eres el Abogado Litigante de Élite. Debes reescribir y perfeccionar el memorial procesal concentrándote quirúrgicamente en erradicar las 3 debilidades críticas priorizadas por el Magistrado Auditor, manteniendo la concisión, elegancia procesal y evitando el inflado de texto superfluo.

Dictamen Sintético del Magistrado:
${evaluation.critique}

TOP 3 Debilidades Críticas Priorizadas a Subsanar:
${prioritizedWeaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n')}

TOP 3 Remediaciones Obligatorias:
${prioritizedRemediations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Contexto Fáctico del Expediente:
${caseSummary.slice(0, 3000)}

Borrador Procesal Previo:
${currentDraft}

Instrucciones de Redacción:
1. Resuelve de forma directa y concreta las 3 debilidades identificadas sin agregar digresiones doctrinarias innecesarias.
2. Mantén la estructura procesal solemne (Encabezado, Hechos probados, Pretensiones principal y subsidiarias, Fundamentos de derecho en 4 niveles, Pruebas y Anexos).
3. Asegura un blindaje probatorio y hermenéutico del 100%.`;

        const response = await this.ai.models.generateContent({
            model: MODEL_GENERATOR,
            contents: prompt,
            config: {
                systemInstruction: "Eres el Abogado Litigante de EX LEGE SOVEREIGN. Tu objetivo es alcanzar un borrador inatacable con 100% de rigor jurídico y máxima concisión procesal.",
                temperature: 0.25
            }
        });

        return response.text || currentDraft;
    }

    /**
     * Bucle Autónomo de Reflexión (Evaluator-Optimizer Loop)
     */
    public async runReflectiveLoop(
        initialDraft: string,
        caseSummary: string,
        maxIterations: number = 3,
        onProgress?: (p: AnalysisProgress) => void
    ): Promise<RefinementLoopResult> {
        let currentDraft = initialDraft;
        const history: RefinementIteration[] = [];
        let iteration = 1;
        let isApproved = false;
        let lastEvaluation: AuditEvaluation = {
            status: 'REJECTED',
            score: 0,
            critique: '',
            identifiedWeaknesses: [],
            requiredRemediations: [],
            admissibilityRisk: 'ALTO'
        };

        if (onProgress) {
            onProgress({
                log: `[Bucle de Reflexión] Iniciando ciclo de optimización agéntica autónoma (Objetivo: >=95% rigor)...`,
                agentId: 'refiner',
                status: 'TRABAJANDO'
            });
        }

        while (iteration <= maxIterations) {
            // 1. Evaluar borrador actual
            lastEvaluation = await this.evaluateDraft(currentDraft, caseSummary, onProgress, iteration);
            
            history.push({
                iterationIndex: iteration,
                draft: currentDraft,
                evaluation: lastEvaluation,
                timestamp: Date.now()
            });

            if (onProgress) {
                onProgress({
                    log: `[Evaluación Iteración ${iteration}] Dictamen: ${lastEvaluation.status} | Rigor: ${lastEvaluation.score}/100`,
                    agentId: 'critic',
                    status: lastEvaluation.status === 'APPROVED' ? 'COMPLETADO' : 'TRABAJANDO'
                });
            }

            // Si fue aprobado o alcanza el 95%, finalizar bucle
            if (lastEvaluation.status === 'APPROVED' || lastEvaluation.score >= 95) {
                isApproved = true;
                break;
            }

            // Si quedan iteraciones, reescribir con las críticas
            if (iteration < maxIterations) {
                currentDraft = await this.generateImprovedDraft(currentDraft, lastEvaluation, caseSummary, onProgress, iteration + 1);
            }

            iteration++;
        }

        const summary = isApproved
            ? `Borrador procesal perfeccionado con éxito tras ${history.length} ciclos de reflexión autónoma. Rigor final: ${lastEvaluation.score}% (Magistrado Auditor: APROBADO).`
            : `Ciclo de reflexión culminado con ${history.length} iteraciones. Rigor alcanzado: ${lastEvaluation.score}%. Se subsanaron las debilidades críticas principales.`;

        if (onProgress) {
            onProgress({
                log: `[Bucle de Reflexión] ${summary}`,
                agentId: 'refiner',
                status: 'COMPLETADO'
            });
        }

        return {
            finalDraft: currentDraft,
            finalScore: lastEvaluation.score,
            approved: isApproved,
            totalIterations: history.length,
            history,
            summary
        };
    }
}

export const refinementLoopService = new RefinementLoopService();
