import { Type } from "@google/genai";
import { INTEGRAL_ANALYSIS_SCHEMA } from './integralAnalysis.schema';

// Reutilizamos la definición de criticalPoints del esquema principal para mantener consistencia
const CRITICAL_POINTS_SCHEMA_DEFINITION = INTEGRAL_ANALYSIS_SCHEMA.properties.criticalPoints;

export const CONTINUATION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        criticalPoints: CRITICAL_POINTS_SCHEMA_DEFINITION,
        hasMoreCriticalPoints: {
            type: Type.BOOLEAN,
            description: "Indica si existen más puntos críticos por analizar más allá de los devueltos en esta respuesta. Responde 'true' si crees que hay más por encontrar, 'false' en caso contrario."
        }
    },
    required: ["criticalPoints", "hasMoreCriticalPoints"]
};
