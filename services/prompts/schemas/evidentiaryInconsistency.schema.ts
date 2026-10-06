import { Type } from "@google/genai";

export const EVIDENTIARY_INCONSISTENCY_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        inconsistencies: {
            type: Type.ARRAY,
            description: "Una lista de todas las inconsistencias probatorias encontradas entre el documento principal y las pruebas.",
            items: {
                type: Type.OBJECT,
                properties: {
                    claimInDocument: { type: Type.STRING, description: "La afirmación fáctica exacta hecha en el documento principal que es inconsistente." },
                    contradictoryEvidenceExcerpt: { type: Type.STRING, description: "La cita literal de la prueba que contradice o no soporta la afirmación." },
                    evidenceFileName: { type: Type.STRING, description: "El nombre del archivo de prueba (`NOMBRE_ARCHIVO`) de donde se extrajo el extracto contradictorio." },
                    analysis: { type: Type.STRING, description: "Una explicación clara y concisa de por qué existe una inconsistencia (ej. 'Contradicción directa', 'Afirmación sin soporte probatorio en el expediente')." }
                },
                required: ["claimInDocument", "contradictoryEvidenceExcerpt", "evidenceFileName", "analysis"]
            }
        }
    },
    required: ["inconsistencies"]
};
