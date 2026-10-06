import { Type } from "@google/genai";

export const FRACTURE_POINT_ANALYSIS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        fracturePointResponses: {
            type: Type.ARRAY,
            description: "Una lista de análisis de punto de fractura, uno por cada punto crítico proporcionado.",
            items: {
                type: Type.OBJECT,
                properties: {
                    criticalPointId: { type: Type.STRING, description: "El ID único del punto crítico original que se está analizando." },
                    fracturePointAnalysis: {
                        type: Type.OBJECT,
                        properties: {
                            fracturePointThesis: { type: Type.STRING, description: "La tesis central del 'Punto de Fractura'. El argumento único y contundente, el 'camello que pasa por el ojo de la aguja', que puede demoler el fallo." },
                            underlyingPrinciple: { type: Type.STRING, description: "El principio jurídico fundamental (ej. debido proceso, cosa juzgada, non bis in idem) que es violado de forma tan grave que constituye el 'Punto de Fractura'." },
                            strategicImplication: { type: Type.STRING, description: "La implicación estratégica: por qué este punto, si se argumenta con éxito, causa el colapso de la estructura lógica de todo el fallo y conduce a su revocatoria." }
                        },
                        required: ["fracturePointThesis", "underlyingPrinciple", "strategicImplication"]
                    }
                },
                required: ["criticalPointId", "fracturePointAnalysis"]
            }
        }
    },
    required: ["fracturePointResponses"]
};
