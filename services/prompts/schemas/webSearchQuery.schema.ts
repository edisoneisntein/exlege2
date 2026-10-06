import { Type } from "@google/genai";

export const WEB_SEARCH_QUERY_GENERATION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        searchQueries: {
            type: Type.ARRAY,
            description: "Una lista de 2 a 4 consultas de búsqueda para Google, precisas y concisas, diseñadas para encontrar la jurisprudencia más reciente y relevante en Colombia sobre los temas clave del documento.",
            items: {
                type: Type.STRING,
                description: "Una consulta de búsqueda."
            }
        }
    },
    required: ["searchQueries"]
};
