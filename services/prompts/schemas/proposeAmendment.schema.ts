import { Type } from "@google/genai";

export const PROPOSE_AMENDMENT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        originalText: {
            type: Type.STRING,
            description: "El extracto literal del borrador que la enmienda pretende reemplazar. Debe ser un fragmento de 1 o 2 párrafos que contenga el punto a modificar."
        },
        proposedText: {
            type: Type.STRING,
            description: "El nuevo texto, reescrito y mejorado, que debería reemplazar al 'originalText'. Debe implementar la instrucción de refinamiento del usuario."
        },
        justification: {
            type: Type.STRING,
            description: "Una breve explicación de cómo la enmienda propuesta aborda la instrucción del usuario y fortalece el argumento."
        }
    },
    required: ["originalText", "proposedText", "justification"]
};
