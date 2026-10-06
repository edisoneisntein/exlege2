import { useState } from 'react';
import type { Attachment } from '../types';

/**
 * Hook especializado para gestionar el estado de los archivos del caso.
 * Encapsula la lógica para el archivo principal y la lista de archivos de evidencia,
 * proporcionando una API clara para su manipulación y reseteo.
 * Mejora la separación de responsabilidades en la aplicación.
 */
export const useFileManager = () => {
    const [primaryFile, setPrimaryFile] = useState<Attachment | null>(null);
    const [evidenceFiles, setEvidenceFiles] = useState<Attachment[]>([]);
    const [documentB, setDocumentB] = useState<Attachment | null>(null);
    
    const resetFiles = () => {
        setPrimaryFile(null);
        setEvidenceFiles([]);
        setDocumentB(null);
    };

    return {
        primaryFile,
        setPrimaryFile,
        evidenceFiles,
        setEvidenceFiles,
        documentB,
        setDocumentB,
        resetFiles,
    };
};