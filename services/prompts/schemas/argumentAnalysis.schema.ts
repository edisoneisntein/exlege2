import { Type } from "@google/genai";

export const ARGUMENT_ANALYSIS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        solidityScore: {
            type: Type.NUMBER,
            description: "Una puntuación de 1 (muy débil) a 10 (irrefutable) que califica la solidez jurídica y lógica del argumento del usuario."
        },
        solidityReasoning: {
            type: Type.STRING,
            description: "Una explicación detallada que justifica la puntuación de solidez, destacando las fortalezas y debilidades del argumento."
        },
        identifiedCounterArguments: {
            type: Type.ARRAY,
            description: "Una lista de los contraargumentos más probables y efectivos que la contraparte podría usar.",
            items: {
                type: Type.OBJECT,
                properties: {
                    counterArgument: { type: Type.STRING, description: "El contraargumento específico." },
                    rebuttalStrategy: { type: Type.STRING, description: "Una estrategia o línea de razonamiento para refutar este contraargumento." }
                },
                required: ["counterArgument", "rebuttalStrategy"]
            }
        },
        supportiveJurisprudence: {
            type: Type.STRING,
            description: "Jurisprudencia relevante de altas cortes colombianas que apoye o debilite el argumento del usuario. Citar sentencias si es posible. Si no se encuentra, indicar 'No se encontró jurisprudencia directa aplicable'."
        },
        rhetoricalSuggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Sugerencias concretas para mejorar la redacción y la fuerza persuasiva del argumento (ej. 'Reemplazar X con Y para mayor impacto', 'Usar una analogía Z')."
        }
    },
    required: ["solidityScore", "solidityReasoning", "identifiedCounterArguments", "supportiveJurisprudence", "rhetoricalSuggestions"]
};
