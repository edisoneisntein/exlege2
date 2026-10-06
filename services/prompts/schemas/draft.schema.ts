import { Type } from "@google/genai";

export const DRAFT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        draft_text: {
            type: Type.STRING,
            description: "El texto completo y formateado del borrador del recurso de apelación, redactado en lenguaje jurídico profesional."
        }
    },
    required: ['draft_text']
};

export const CLIENT_SUMMARY_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "El texto completo del resumen ejecutivo para el cliente, en lenguaje claro y no técnico."
        }
    },
    required: ['summary']
};
