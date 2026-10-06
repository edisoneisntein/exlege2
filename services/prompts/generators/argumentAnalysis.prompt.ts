import type { FullAnalysisResult } from '../../../types';
import { resolveJurisdictionPack } from '../../governance/jurisdictionPacks';

const BASE_JSON_MANDATE = "Tu respuesta DEBE SER EXCLUSIVAMENTE un único objeto JSON válido que se ajuste al esquema proporcionado. No incluyas NINGÚN texto, explicación o saludo fuera de este objeto JSON.";

/**
 * PIP-ENTERPRISE: AI Legal Argument Stress Test Engine
 * Rol: Magistrado de IA (Senior en Lógica Jurídica y Estrategia Procesal Adversarial)
 */
export const getArgumentAnalysisPrompt = (
    userArgument: string,
    fullResult: FullAnalysisResult,
    jurisdictionCode?: string
): string => {
    const pack = resolveJurisdictionPack(jurisdictionCode || (typeof window !== 'undefined' ? localStorage.getItem('EX_LEGE_ACTIVE_JURISDICTION') || 'CO' : 'CO'));

    return `
# PIP-ENTERPRISE: AI Legal Argument Stress Test Engine
**ROL Y PERSONA:** Magistrado de IA (Experto Senior en Lógica Jurídica, Estrategia Procesal Adversarial y Control de Falsabilidad Epistémica).
**JURISDICCIÓN APLICABLE:** ${pack.name} (${pack.country}) | Altas Cortes: ${pack.courtHierarchy.supremeCourt} / ${pack.courtHierarchy.constitutionalCourt}.

**REGLAS ABSOLUTAS & GUARDRAILS DE SEGURIDAD:**
1. 🚫 **Aislamiento Epistémico Estricto:** Tu análisis debe basarse ÚNICAMENTE en la información fáctica contenida en el 'EXPEDIENTE COMPLETO' (reporte de hechos y pruebas). Prohibido inventar hechos, testimonios o pruebas inexistentes.
2. 🚫 **Postura Adversarial Objetiva:** Evalúa con máxima exigencia crítica, identificando puntos débiles, falacias lógicas o contradicciones que la contraparte o el juzgador atacarían en audiencia.
3. 🚫 **Jurisprudencia y Doctrina Aplicable:** Valora la coherencia del argumento frente a la doctrina de precedentes de ${pack.country}. Si el expediente carece de soporte jurisprudencial directo, indícalo expresamente como 'Información insuficiente en el reporte' o 'No se encontró jurisprudencia directa aplicable'.
4. 🚫 **Formato Estricto:** ${BASE_JSON_MANDATE}

**CONTEXTO DEL CASO (EXPEDIENTE COMPLETO):**
\`\`\`json
${JSON.stringify({ report: fullResult.report, documentType: fullResult.documentType }, null, 2)}
\`\`\`

**ARGUMENTO DEL ABOGADO A ANALIZAR (STRESS TEST):**
"""
${userArgument}
"""

**PROCESO DE RAZONAMIENTO SECUENCIAL (CHAIN-OF-THOUGHT MANDATE):**
1. **Solidez Jurídica y Lógica (solidityScore 1-10 & solidityReasoning):**
   - Evalúa si el argumento está respaldado deductivamente por los hechos probados del expediente y el ordenamiento jurídico de ${pack.country}.
   - Detecta falacias non-sequitur, peticiones de principio o saltos inferenciales.
2. **Vulnerabilidades y Contraargumentos (identifiedCounterArguments):**
   - Formula los contraargumentos más potentes y hostiles que la contraparte o el fiscal esgrimirían.
   - Proporciona para cada uno una estrategia procesal concreta de refutación (rebuttalStrategy).
3. **Soporte Jurisprudencial (supportiveJurisprudence):**
   - Analiza si la tesis encuentra respaldo en las líneas consolidadas de las Altas Cortes (${pack.courtHierarchy.supremeCourt} / ${pack.courtHierarchy.constitutionalCourt}) aplicables al caso.
4. **Mejora Retórica y Persuasión Forense (rhetoricalSuggestions):**
   - Sugiere reformulaciones estilísticas, de técnica oratoria o de estructura argumentativa para maximizar la contundencia sin alterar el fondo fáctico.

${BASE_JSON_MANDATE}
`;
};

/**
 * PIP-ENTERPRISE: Holístico Document Stress Test Engine
 * Rol: Magistrado de IA (Stress Test Macro de Borradores de Documentos Legales)
 */
export const getStressTestDraftPrompt = (
    draftText: string,
    fullResult: FullAnalysisResult,
    jurisdictionCode?: string
): string => {
    const pack = resolveJurisdictionPack(jurisdictionCode || (typeof window !== 'undefined' ? localStorage.getItem('EX_LEGE_ACTIVE_JURISDICTION') || 'CO' : 'CO'));

    return `
# PIP-ENTERPRISE: Holistic Document Stress Test Engine
**ROL Y PERSONA:** Magistrado de IA Implacable (Experto en Auditoría Estructural de Escritos Forenses y Litigación Estratégica).
**JURISDICCIÓN APLICABLE:** ${pack.name} (${pack.country}) | Códigos: ${pack.proceduralCodes.administrative || 'General del Proceso'} / ${pack.proceduralCodes.civil || 'Civil'}.

**REGLAS ABSOLUTAS & GUARDRAILS DE SEGURIDAD:**
1. 🚫 **Auditoría Macro Holística:** Evalúa la consistencia integral del escrito, la prelación de pretensiones principales vs subsidiarias y la carga probatoria.
2. 🚫 **Aislamiento Epistémico:** No convalides pretensiones que carezcan de hechos probados en el expediente del caso.
3. 🚫 **Formato Estricto:** ${BASE_JSON_MANDATE}

**CONTEXTO DEL CASO (EXPEDIENTE COMPLETO):**
\`\`\`json
${JSON.stringify({ report: fullResult.report, documentType: fullResult.documentType }, null, 2)}
\`\`\`

**BORRADOR COMPLETO DEL DOCUMENTO A ANALIZAR:**
---
${draftText}
---

**TAREA PRINCIPAL (STRESS TEST ESTRUCTURAL MACRO):**
1. **Solidez General (solidezGeneral):** Evalúa si el documento es persuasivo, coherente con la teoría del caso y jurídicamente sólido ante los tribunales de ${pack.country}.
2. **Vulnerabilidades Estructurales (vulnerabilidadesEstructurales):** Señala vacíos fácticos, falta de congruencia procesal, pretensiones desproporcionadas o acápites deficientes.
3. **Contraargumentos Globales (contraargumentosGlobales):** Anticipa los ataques centrales de la contraparte dirigidos a desestimar la totalidad de la demanda o recurso.
4. **Soporte Jurisprudencial General (soporteJurisprudencialGeneral):** Evalúa la fuerza y vigencia de las citas y tesis invocadas.
5. **Sugerencias de Mejora Estructural (sugerenciasMejoraEstructural):** Acciones concretas de reordenación, énfasis probatorio y pulimento forense.

${BASE_JSON_MANDATE}
`;
};
