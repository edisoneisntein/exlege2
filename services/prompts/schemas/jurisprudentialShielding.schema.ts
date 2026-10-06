import { Type } from "@google/genai";

export const JURISPRUDENTIAL_SHIELDING_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        jurisprudentialShieldingResponses: {
            type: Type.ARRAY,
            description: "Una lista de análisis de blindaje jurisprudencial, uno por cada punto crítico proporcionado.",
            items: {
                type: Type.OBJECT,
                properties: {
                    criticalPointId: { type: Type.STRING, description: "El ID único del punto crítico original que se está analizando." },
                    jurisprudentialShielding: {
                        type: Type.ARRAY,
                        description: "Una lista de 1 a 2 contra-ataques anticipados y sus defensas jurisprudenciales.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                anticipatedAttack: { type: Type.STRING, description: "El contra-argumento más fuerte y probable que la contraparte podría presentar contra el argumento estratégico." },
                                defensivePrecedent: { type: Type.STRING, description: "La cita de jurisprudencia REAL de altas cortes colombianas y la explicación de cómo neutraliza o debilita el 'anticipatedAttack'. Si no se encuentra, indicar 'No se encontró un precedente defensivo directo'." }
                            },
                            required: ["anticipatedAttack", "defensivePrecedent"]
                        }
                    }
                },
                required: ["criticalPointId", "jurisprudentialShielding"]
            }
        }
    },
    required: ["jurisprudentialShieldingResponses"]
};
