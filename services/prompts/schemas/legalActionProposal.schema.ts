import { Type } from "@google/genai";

export const LEGAL_ACTION_PROPOSAL_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        propuestas: {
            type: Type.ARRAY,
            description: "Una lista de 2-3 propuestas de acciones legales viables basadas en la narración del usuario, específicas para la ley colombiana.",
            items: {
                type: Type.OBJECT,
                properties: {
                    titulo: { type: Type.STRING, description: "Un título claro y conciso para la acción legal (ej. 'Acción de Tutela por Violación al Debido Proceso')." },
                    descripcion: { type: Type.STRING, description: "Una breve explicación de la acción legal y por qué es apropiada para los hechos dados." },
                    ventajas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Una lista de las principales ventajas o fortalezas de seguir esta acción." },
                    riesgos: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Una lista de posibles riesgos, desventajas o desafíos." },
                    tipo_documento_sugerido: { type: Type.STRING, enum: ["LAWSUIT", "RULING", "ANSWER", "OTHER"], description: "El tipo de documento principal que sería central en esta acción." }
                },
                required: ["titulo", "descripcion", "ventajas", "riesgos", "tipo_documento_sugerido"]
            }
        }
    },
    required: ["propuestas"]
};
