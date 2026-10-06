import React, { useState, useCallback } from 'react';
import type { AppWorkflow, CaseDocumentType, LegalActionProposal, Attachment } from '../types';

interface DesignWorkflowProps {
    navigateTo: (screen: string) => void;
    setPrimaryFile: React.Dispatch<React.SetStateAction<Attachment | null>>;
    setDocumentType: React.Dispatch<React.SetStateAction<CaseDocumentType>>;
}

/**
 * Hook especializado para orquestar el flujo de trabajo de "Diseñar Estrategia desde Cero".
 * Gestiona la selección del flujo, la presentación de la narración, la recepción de propuestas
 * y la transición al flujo de análisis de documentos.
 */
export const useDesignWorkflow = ({ navigateTo, setPrimaryFile, setDocumentType }: DesignWorkflowProps) => {
    const [workflow, setWorkflow] = useState<AppWorkflow | null>(null);
    const [narrativeText, setNarrativeText] = useState<string>('');
    const [proposedStrategies, setProposedStrategies] = useState<LegalActionProposal[]>([]);

    const selectWorkflow = useCallback((selectedWorkflow: AppWorkflow) => {
        setWorkflow(selectedWorkflow);
        if (selectedWorkflow === 'design') {
            navigateTo('narrative');
        } else if (selectedWorkflow === 'comparative') {
            navigateTo('comparative_upload');
        } else {
            navigateTo('upload');
        }
    }, [navigateTo]);
    
    const submitNarrative = useCallback((text: string, proposals: LegalActionProposal[]) => {
        setNarrativeText(text);
        setProposedStrategies(proposals);
        navigateTo('strategyProposal');
    }, [navigateTo]);

    const selectStrategy = useCallback((docType: CaseDocumentType) => {
        setDocumentType(docType);
        const narrativeAttachment: Attachment = {
            name: "Narración de Hechos (Estrategia Inicial).txt",
            size: narrativeText.length,
            type: 'text/plain',
            isPrimary: true,
            extractedText: narrativeText,
            status: 'ready',
            evidenceType: 'DOCUMENT'
        };
        setPrimaryFile(narrativeAttachment);
        navigateTo('upload');
    }, [narrativeText, navigateTo, setPrimaryFile, setDocumentType]);

    const resetWorkflow = () => {
        setWorkflow(null);
        setNarrativeText('');
        setProposedStrategies([]);
    };

    return {
        workflow,
        narrativeText,
        setNarrativeText,
        proposedStrategies,
        selectWorkflow,
        submitNarrative,
        selectStrategy,
        resetWorkflow,
    };
};