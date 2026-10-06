import { useState, useCallback } from 'react';
import type { Annotation } from '../types';

// Simple unique ID for React keys
const simpleId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Hook especializado para gestionar las características de colaboración del equipo.
 * Actualmente maneja la creación y almacenamiento de anotaciones vinculadas a puntos críticos.
 * Esta abstracción facilita la expansión futura de funcionalidades colaborativas.
 */
export const useCollaboration = () => {
    const [annotations, setAnnotations] = useState<Record<string, Annotation[]>>({});

    const addAnnotation = useCallback((criticalPointId: string, text: string, author?: string) => {
        const newAnnotation: Annotation = {
            id: simpleId(),
            author: author || 'Dr. A. Vargas (Usted)',
            text,
            timestamp: new Date().toISOString(),
        };
        setAnnotations(prev => ({
            ...prev,
            [criticalPointId]: [...(prev[criticalPointId] || []), newAnnotation],
        }));
    }, []);

    const resetAnnotations = () => {
        setAnnotations({});
    };

    return {
        annotations,
        addAnnotation,
        resetAnnotations,
    };
};
