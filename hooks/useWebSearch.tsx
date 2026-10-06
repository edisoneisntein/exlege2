import { useState, useCallback } from 'react';
import { performWebSearch } from '../services/geminiService';
import type { Attachment } from '../types';

/**
 * Hook para encapsular toda la lógica y estado de la funcionalidad de investigación web.
 * @param addEvidenceFile - Callback para añadir el resultado de la búsqueda a la lista de evidencias.
 */
export const useWebSearch = (addEvidenceFile: (file: Attachment) => void) => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');

    /**
     * Ejecuta la búsqueda web, procesa el resultado y lo añade como un archivo de evidencia.
     */
    const handleSearch = useCallback(async () => {
        if (!query.trim()) return;
        setIsSearching(true);
        setError('');
        try {
            const { text, sources } = await performWebSearch(query);
            const reportText = `Informe de Investigación para: "${query}"\n\n${text}\n\n--- Fuentes Encontradas ---\n${sources.map(s => `- ${s.title}: ${s.uri}`).join('\n')}`;
            
            const newAttachment: Attachment = {
                name: `Investigación Web: "${query.substring(0, 30)}${query.length > 30 ? '...' : ''}"`,
                size: reportText.length,
                type: 'text/investigation',
                isPrimary: false,
                extractedText: reportText,
                status: 'ready',
                evidenceType: 'WEB_SEARCH',
                tags: ['investigacion web', 'fuente externa'],
            };
            addEvidenceFile(newAttachment);
            setQuery(''); // Limpia el input en caso de éxito
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error desconocido durante la investigación.";
            setError(message);
        } finally {
            setIsSearching(false);
        }
    }, [query, addEvidenceFile]);
    
    return {
        query,
        setQuery,
        isSearching,
        error,
        handleSearch,
    };
};
