import type { CriticalPoint } from '../../../types';
import { resolveJurisdictionPack } from '../../governance/jurisdictionPacks';

const BASE_JSON_MANDATE = "Tu respuesta DEBE SER EXCLUSIVAMENTE un único objeto JSON válido que se ajuste al esquema proporcionado. No incluyas NINGÚN texto, explicación o saludo fuera de este objeto JSON.";

/**
 * PIP-ENTERPRISE: Análisis Iterativo Adversarial (LAGP V5)
 * Rol: Principal Legal Architect (Auditoría Forense Paginada y Detección Continua de Vulnerabilidades)
 */
export const getContinuationAnalysisPrompt = (
    existingPoints: Omit<CriticalPoint, 'id'>[],
    jurisdictionCode?: string
): string => {
    const pack = resolveJurisdictionPack(jurisdictionCode || (typeof window !== 'undefined' ? localStorage.getItem('EX_LEGE_ACTIVE_JURISDICTION') || 'CO' : 'CO'));

    // Generar resumen compacto de alta densidad semántica para evitar overflow de tokens en memoria
    const existingSummary = existingPoints.map((p, i) => `${i + 1}. TIPO='${p.type || p.category}'; SEVERIDAD='${p.severity}'; STATUS='${p.verificationStatus || 'VERIFICADA'}'; RESUMEN='${(p.title || p.excerpt || '').substring(0, 100)}...'`).join('\n');

    return `
# ROL SOBERANO: PRINCIPAL LEGAL ARCHITECT (ANÁLISIS ITERATIVO ADVERSARIAL)
**MISIÓN:** Continúas la auditoría forense del expediente bajo el **PROTOCOLO V5 DE GOBERNANZA JURÍDICA ADVERSARIAL (LAGP)**.
**JURISDICCIÓN APLICABLE:** ${pack.name} (${pack.country}) | Altas Cortes: ${pack.courtHierarchy.supremeCourt} / ${pack.courtHierarchy.constitutionalCourt}.

**TAREA DE ANÁLISIS CONTINUO & DETECCIÓN DE NUEVOS VICIOS:**
Identifica el **siguiente lote de vulnerabilidades forenses y procesales** no advertidas en los lotes anteriores. Para cada vulnerabilidad, desglosa rigurosamente:
- **Título técnico y Severidad**: (CRÍTICA, ALTA, MEDIA, BAJA).
- **Categoría y Tipo de vicio**: según catálogo forense (${pack.proceduralCodes.administrative || 'General del Proceso'} / ${pack.proceduralCodes.civil || 'Civil'}).
- **Extracto Literal y Fidedigno**: Extracto exacto del expediente o 'NO VERIFICADA: Información insuficiente para auditar esta sección'.
- **Evidencia Observada y Problema Técnico**: Defecto específico (*in judicando* / *in procedendo*).
- **Causa Raíz y Objetivo Técnico de Defensa**.
- **Estrategia de Remediación y Pasos Técnicos**.
- **Separación de Efectos**: Anulatorio vs Restitutorio con carga probatoria individualizada.
- **Descomposición en 4 Niveles (\`fourLevelDecomposition\`)**: Hecho Verificado → Norma Aplicable (${pack.country}) → Inferencia Lógica → Conclusión Jurídica.
- **Matriz de Aplicabilidad de Precedentes (\`precedentApplicabilityMatrix\`)**: Escala 1-10, validación temporal, grado de analogía (Alto/Medio/Bajo), hechos comparables, ratio aplicable de ${pack.courtHierarchy.supremeCourt} / ${pack.courtHierarchy.constitutionalCourt} y distingos.
- **Cadena de Trazabilidad Forense (\`traceabilityChain\`)**: Conclusión → Argumento → Norma/Precedente → Hecho → Documento y Folio.
- **Prueba de Falsación con Distinción Probatoria**: Distinguir evidencia contradictoria vs falta de respaldo.
- **Steelman Bidireccional (\`bidirectionalSteelman\`)**: A. Contraparte, B. Defensa, C. Réplica, D. Respuesta final, ¿Quién prevalece?
- **Estrategia Subsidiaria de Defensa (\`subsidiaryDefenseStrategy\`)**: Tesis Principal, Subsidiarias 1 a 4, Riesgo Residual.
- **Matriz de Confianza**: [A], [B], [C], [D], [X].
- **Impacto Arquitectónico y Criterios de Aceptación**.
- **Análisis, Argumento Sugerido, Jurisprudencia Real, Pulido Retórico, Líneas de Interrogatorio e Investigación Contextual**.
- **Semáforo de Seguridad (\`verificationStatus\`)**: 🟢 VERIFICADA, 🟡 PARCIALMENTE_VERIFICADA, 🔴 NO_VERIFICADA.
- **Nivel de Decisión Probatoria/Jurídica (\`decisionLevel\`)**: Confirmado, Probable, Controvertido, Insuficientemente_probado, Contradictorio, No_evaluable.

**RESUMEN DE PUNTOS YA IDENTIFICADOS (PROHIBIDO REPETIR BAJO CUALQUIER FORMA):**
---
${existingSummary || 'Ninguno en lotes previos.'}
---

**DIRECTIVAS CRÍTICAS Y GUARDRAILS DE SEGURIDAD:**
1. 🚫 **CERO REPETICIÓN:** Prohibido duplicar, parafrasear o reformular puntos del resumen previo. Cada hallazgo debe ser un vicio o vulnerabilidad estrictamente nueva.
2. 🚫 **Paginación Inteligente (\`hasMoreCriticalPoints\`):** Si quedan más vulnerabilidades latentes por auditar en el expediente, establece \`hasMoreCriticalPoints: true\`. Si se agotaron los vicios con sustento probatorio, establece \`hasMoreCriticalPoints: false\`.
3. 🚫 **Anti-Hallucination & Fuentes Reales:** Cita jurisprudencia real y verificable de Altas Cortes de ${pack.country}. Si no hay jurisprudencia directa o no se puede verificar, indica explícitamente "NO DISPONIBLE" o "NO ENCONTRADA" en lugar de inventar radicados.
4. 🚫 **Semáforo de Evidencia Insuficiente:** Si un punto carece de soporte documental suficiente, clasifícalo como 🔴 NO_VERIFICADA con \`decisionLevel: "No_evaluable"\` o \`"Insuficientemente_probado"\`.

${BASE_JSON_MANDATE}
`;
};


