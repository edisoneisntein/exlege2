import { Type } from "@google/genai";

export const TIMELINE_EXTRACTION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        events: {
            type: Type.ARRAY,
            description: "Una lista de todos los eventos cronológicos extraídos de los documentos, ordenados por fecha desde el más antiguo al más reciente.",
            items: {
                type: Type.OBJECT,
                properties: {
                    date: {
                        type: Type.STRING,
                        description: "La fecha del evento. Intenta normalizarla al formato YYYY-MM-DD. Si no es posible, usa el formato original (ej. 'Marzo de 2023')."
                    },
                    description: {
                        type: Type.STRING,
                        description: "Una descripción clara y concisa del evento que ocurrió en esa fecha."
                    },
                    source: {
                        type: Type.STRING,
                        description: "El nombre del documento de origen (ej. 'DOCUMENTO_PRINCIPAL', o el NOMBRE_ARCHIVO de una PRUEBA) de donde se extrajo la información."
                    }
                },
                required: ["date", "description", "source"]
            }
        }
    },
    required: ["events"]
};