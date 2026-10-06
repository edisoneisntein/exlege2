import { Type } from "@google/genai";

const FINDING_ITEM_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        claimInDocA: { type: Type.STRING, description: "La afirmación, hecho o argumento extraído del Documento A." },
        claimInDocB: { type: Type.STRING, description: "La afirmación, hecho o argumento correspondiente (o su ausencia) en el Documento B." },
        analysis: { type: Type.STRING, description: "El análisis conciso de la IA sobre la relación entre las afirmaciones (coincidencia, discrepancia, falta de respuesta)." }
    },
    required: ["claimInDocA", "analysis"]
};

export const COMPARATIVE_ANALYSIS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        agreedFacts: {
            type: Type.ARRAY,
            description: "Una lista de los hechos o afirmaciones fácticas en las que ambos documentos coinciden explícita o implícitamente.",
            items: FINDING_ITEM_SCHEMA
        },
        disputedFacts: {
            type: Type.ARRAY,
            description: "Una lista de los hechos o afirmaciones fácticas en las que ambos documentos se contradicen o presentan versiones diferentes.",
            items: FINDING_ITEM_SCHEMA
        },
        unansweredArguments: {
            type: Type.ARRAY,
            description: "Una lista de los argumentos o pretensiones principales del Documento A que no fueron abordados, contestados o mencionados en el Documento B.",
            items: FINDING_ITEM_SCHEMA
        }
    },
    required: ["agreedFacts", "disputedFacts", "unansweredArguments"]
};