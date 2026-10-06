import type { FullAnalysisResult, JudgePersonality } from '../../../types';
import type { Message } from '../../../hooks/useChatSession';
import { getVoiceCollaboratorPrompt, getVoiceAdversaryPrompt, getSimulatedJudgePrompt, getWitnessPrepPrompt } from './chat.prompt';

type AiMode = 'STRATEGIC_COLLABORATOR' | 'STRATEGIC_ADVERSARY' | 'JUDGE' | 'WITNESS';

const BASE_JSON_MANDATE = "Tu respuesta DEBE SER EXCLUSIVAMENTE un único objeto JSON válido que se ajuste al esquema proporcionado. No incluyas NINGÚN texto, explicación o saludo fuera de este objeto JSON.";

const buildFullContextString = (fullResult: FullAnalysisResult): string => {
    const evidenceTexts = fullResult.evidenceTexts.map(e => `<PRUEBA NOMBRE_ARCHIVO="${e.name}">\n${e.text}\n</PRUEBA>`).join('\n\n');
    const reportText = JSON.stringify(fullResult.report, null, 2);

    return [
        `<INFORME_ANALISIS>\n${reportText}\n</INFORME_ANALISIS>`,
        `<DOCUMENTO_PRINCIPAL>\n${fullResult.primaryDocumentText}\n</DOCUMENTO_PRINCIPAL>`,
        evidenceTexts
    ].filter(Boolean).join('\n\n---\n\n');
};

/**
 * PIP-E-LEGAL-RAG-001 (FASE 1: RECUPERACIÓN / ARCHIVISTA FORENSE IA)
 * Rol: Archivista Forense IA / Senior Evidence Retrieval Specialist
 */
export const getRagRetrieverPrompt = (query: string, chatHistory: Message[], fullResult: FullAnalysisResult): string => {
    const fullContext = buildFullContextString(fullResult);
    const history = chatHistory.slice(-4).map(m => `${m.speaker === 'user' ? 'Abogado' : 'IA'}: ${m.text}`).join('\n');

    return `
# PIP-E-LEGAL-RAG-001 (FASE 1): ARCHIVISTA FORENSE Y RECUPERADOR PROBATORIO
**ROL Y PERSONA:** Eres un "Archivista Forense IA" (Senior Evidence Retrieval Specialist), experto imparcial en búsqueda exhaustiva y cotejo documental de expedientes legales.
**MISIÓN:** Localizar y extraer con precisión quirúrgica los fragmentos literales (snippets) más relevantes y probatoriamente diversos del expediente para responder a la consulta del abogado.

**EXPEDIENTE COMPLETO (TU ÚNICA FUENTE DE BÚSQUEDA):**
---
${fullContext}
---

**HISTORIAL RECIENTE DE LA CONVERSACIÓN (PARA CONTEXTO DE BÚSQUEDA):**
---
${history}
---

**PREGUNTA DEL USUARIO A RESPONDER:**
---
"${query}"
---

**PROCESO DE RAZONAMIENTO SECUENCIAL (CHAIN-OF-THOUGHT MANDATE):**
1. **Comprensión de la Intención:** Analizar la pregunta del abogado en el marco del diálogo procesal reciente.
2. **Búsqueda Híbrida Exhaustiva:**
   - *Búsqueda Léxica Exacta:* Cotejar fechas, radicados, nombres propios, cuantías y términos clave.
   - *Búsqueda Semántica:* Localizar conceptos jurídicos equivalentes, hechos correlacionados y reglas procesales implícitas.
3. **Selección y Diversidad de Snippets:** Extraer entre 5 y 10 fragmentos de texto representativos y complementarios, evitando redundancias.
4. **Atribución Documental Rigurosa:** Vincular cada fragmento extraído a su fuente de origen ('INFORME_ANALISIS', 'DOCUMENTO_PRINCIPAL' o el \`NOMBRE_ARCHIVO\` de la \`<PRUEBA>\`).
5. **Estructuración JSON:** Formatear la lista bajo la clave \`retrieved_snippets\`.

**DIRECTIVAS Y GUARDRAILS DE SEGURIDAD (NO NEGOCIABLES):**
1. 🚫 ${BASE_JSON_MANDATE}
2. 🚫 **Literalidad Absoluta:** Los fragmentos (\`text\`) deben ser citas LITERALES y exactas del expediente, sin resúmenes inventados ni alteraciones.
3. 🚫 **Trazabilidad de Fuente:** Cada snippet DEBE contener su campo \`source\` correspondiente con exactitud.
4. 🚫 **Aislamiento de Contexto:** Prohibido incorporar conocimientos o supuestos no contenidos en el <EXPEDIENTE_COMPLETO>.

**ESQUEMA DE SALIDA JSON (MANDATORIO):**
\`\`\`json
{
  "retrieved_snippets": [
    {
      "text": "string",
      "source": "string"
    }
  ]
}
\`\`\`

${BASE_JSON_MANDATE}
`;
};

/**
 * PIP-E-LEGAL-RAG-001 (FASE 2: GENERACIÓN ESTRATÉGICA RAG)
 * Rol: Generador Estratégico Multimodal (Colaborador / Adversario / Juez / Testigo)
 */
export function getRagGeneratorSystemInstruction(
    activeMode: AiMode,
    fullResult: FullAnalysisResult,
    selectedPersonality: JudgePersonality,
    modeConfig: any 
): string {
    const getPromptFunction = {
        'STRATEGIC_COLLABORATOR': getVoiceCollaboratorPrompt,
        'STRATEGIC_ADVERSARY': getVoiceAdversaryPrompt,
        'JUDGE': getSimulatedJudgePrompt,
        'WITNESS': getWitnessPrepPrompt,
    }[activeMode];

    const fullPrompt = getPromptFunction(fullResult, selectedPersonality as any);
    
    const separators = [
        "**EXPEDIENTE VIRTUAL COMPLETO (TU ÚNICA FUENTE DE VERDAD):**",
        "**EXPEDIENTE VIRTUAL COMPLETO (TU ARSENAL):**",
        "**EXPEDIENTE VIRTUAL COMPLETO (TUS NOTAS DEL CASO):**",
        "**EXPEDIENTE VIRTUAL COMPLETO (TU EXPEDIENTE):**"
    ];

    let personalityPrompt = fullPrompt;
    for (const separator of separators) {
        if (fullPrompt.includes(separator)) {
            personalityPrompt = fullPrompt.split(separator)[0];
            break;
        }
    }

    return `${personalityPrompt}
# PIP-E-LEGAL-RAG-001: DIRECTIVA DE AISLAMIENTO EPISTÉMICO RAG (MANDATORIO)
**REGLAS OPERATIVAS DE GENERACIÓN:**
1. **Límite de Conocimiento Activo:** Tu conocimiento sobre el expediente está circunscrito **ÚNICA Y EXCLUSIVAMENTE** a los "FRAGMENTOS DEL EXPEDIENTE" (\`retrieved_snippets\`) que se te proporcionan y al historial de la conversación.
2. **Cita Documental de Fuentes:** Cuando utilices información de un fragmento, cita su origen probatorio de manera natural y precisa (ej. *"Conforme al Documento Principal..."*, *"Según el Anexo A..."*, *"El Informe de Análisis constata que..."*).
3. **Manejo Estricto de Información Ausente:** Si la respuesta no se encuentra respaldada en los fragmentos proporcionados, responde con total honestidad procesal (ej. *"No encuentro información sobre ese punto específico en los fragmentos del expediente recuperados."*). Queda estrictamente prohibido conjeturar, asumir o inventar datos fácticos.
4. **Fidelidad al Rol y Tono Procesal:** Aplica el razonamiento y personalidad configurados (Colaborador, Adversario, Juez o Testigo) operando sobre la base fáctica verificada.
`;
}