import React, { useState, useCallback } from 'react';
import { analyzeImageEvidence, translateText } from '../services/geminiService';
import { extractTextFromFile } from '../services/fileExtractor';
import type { Attachment, EvidenceType } from '../types';

/**
 * Hook para gestionar toda la lógica de procesamiento y traducción de archivos.
 * Aísla la complejidad de la interacción con los servicios del componente de UI.
 * @param setPrimaryFile - Función para actualizar el archivo principal en el estado global.
 * @param setEvidenceFiles - Función para actualizar los archivos de evidencia en el estado global.
 */
export const useFileProcessor = (
    setPrimaryFile: React.Dispatch<React.SetStateAction<Attachment | null>>,
    setEvidenceFiles: React.Dispatch<React.SetStateAction<Attachment[]>>
) => {
    const [processingError, setProcessingError] = useState('');
    const [translatingFile, setTranslatingFile] = useState<string | null>(null);

    /**
     * Determina si algún archivo está actualmente en estado de procesamiento o traducción.
     * @param primary - El archivo principal actual.
     * @param evidence - La lista de archivos de evidencia.
     * @returns `true` si hay algún archivo procesándose, `false` en caso contrario.
     */
    const isProcessingAnyFile = useCallback((primary: Attachment | null, evidence: Attachment[]) => {
        return (primary?.status === 'processing' || evidence.some(f => f.status === 'processing')) || translatingFile !== null;
    }, [translatingFile]);

    /**
     * Procesa una lista de archivos, extrayendo su contenido y actualizando el estado global.
     * @param files - La lista de `File` a procesar.
     * @param isPrimary - Booleano que indica si el archivo es el documento principal.
     */
    const processAndAddFiles = useCallback(async (files: File[], isPrimary: boolean) => {
        setProcessingError('');

        const determineEvidenceType = (file: File): EvidenceType => {
            if (file.type?.startsWith('image/')) return 'IMAGE';
            return 'DOCUMENT';
        };

        const processSingleFile = async (file: File): Promise<{text: string, type: EvidenceType}> => {
            const arrayBuffer = await file.arrayBuffer();
            const type = determineEvidenceType(file);
            let text = '';

            if (type === 'IMAGE') {
                text = await analyzeImageEvidence(arrayBuffer, file.type);
            } else { // DOCUMENT
                text = await extractTextFromFile(file);
            }
            return { text, type };
        };
        
        const targetFiles = isPrimary ? files.slice(0, 1) : files;
        if (targetFiles.length === 0) return;

        if (isPrimary) {
            const file = targetFiles[0];
            const type = determineEvidenceType(file);
            const placeholder: Attachment = { name: file.name, size: file.size, type: file.type, isPrimary: true, status: 'processing', evidenceType: type };
            setPrimaryFile(placeholder);

            try {
                const { text: extractedText } = await processSingleFile(file);
                setPrimaryFile({ ...placeholder, status: 'ready', extractedText });
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Error desconocido durante el procesamiento.';
                setPrimaryFile({ ...placeholder, status: 'error', error: message });
            }
        } else { // Evidence files
            const newPlaceholders: Attachment[] = targetFiles.map(file => ({
                name: file.name,
                size: file.size,
                type: file.type,
                isPrimary: false,
                status: 'processing',
                evidenceType: determineEvidenceType(file)
            }));
            setEvidenceFiles(prev => [...prev, ...newPlaceholders]);

            for (const file of targetFiles) {
                try {
                    const { text: extractedText, type } = await processSingleFile(file);
                    setEvidenceFiles(prev => prev.map(f =>
                        f.name === file.name && f.status === 'processing'
                            ? { ...f, status: 'ready', extractedText, evidenceType: type }
                            : f
                    ));
                } catch (err) {
                    const message = err instanceof Error ? err.message : 'Error desconocido durante el procesamiento.';
                    setEvidenceFiles(prev => prev.map(f =>
                        f.name === file.name && f.status === 'processing'
                            ? { ...f, status: 'error', error: message }
                            : f
                    ));
                }
            }
        }
    }, [setPrimaryFile, setEvidenceFiles]);

    /**
     * Traduce el texto de un archivo y actualiza el estado global.
     * @param fileToTranslate - El objeto `Attachment` del archivo a traducir.
     */
    const handleTranslateFile = useCallback(async (fileToTranslate: Attachment) => {
        if (!fileToTranslate || !fileToTranslate.extractedText || fileToTranslate.translatedText) return;

        setTranslatingFile(fileToTranslate.name);
        setProcessingError('');
        try {
            const translated = await translateText(fileToTranslate.extractedText);
            if (fileToTranslate.isPrimary) {
                setPrimaryFile(f => f ? { ...f, translatedText: translated } : null);
            } else {
                setEvidenceFiles(prev => prev.map(f => f.name === fileToTranslate.name ? { ...f, translatedText: translated } : f));
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error de traducción desconocido.';
            setProcessingError(`Error traduciendo "${fileToTranslate.name}": ${message}`);
        } finally {
            setTranslatingFile(null);
        }
    }, [setPrimaryFile, setEvidenceFiles]);

    return {
        processAndAddFiles,
        handleTranslateFile,
        translatingFile,
        processingError,
        isProcessingAnyFile,
    };
};
