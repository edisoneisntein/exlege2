import { Type } from "@google/genai";

export const LINK_INSIGHT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        linkedCriticalPointId: {
            type: Type.STRING,
            description: "El ID del punto crítico de la lista que está más relacionado semánticamente con el insight del usuario. Debe ser uno de los IDs proporcionados."
        }
    },
    required: ["linkedCriticalPointId"]
};
