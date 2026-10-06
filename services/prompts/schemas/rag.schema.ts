import { Type } from "@google/genai";

export const RAG_RETRIEVAL_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        retrievedSnippets: {
            type: Type.ARRAY,
            description: "Una lista de los fragmentos de texto más relevantes encontrados en los documentos proporcionados que ayudan a responder la consulta del usuario.",
            items: {
                type: Type.OBJECT,
                properties: {
                    source: { type: Type.STRING, description: "El nombre del documento de origen (ej. 'DOCUMENTO_PRINCIPAL', o el nombre de archivo de una PRUEBA)." },
                    content: { type: Type.STRING, description: "El fragmento de texto literal extraído del documento de origen." }
                },
                required: ["source", "content"]
            }
        }
    },
    required: ["retrievedSnippets"]
};