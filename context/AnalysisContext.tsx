import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { clearCache } from '../services/cacheService';
import { AIPersonality, CaseDocumentType } from '../types';

import { UIStateContext } from '../hooks/useUIState';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { useFileManager } from '../hooks/useFileManager';
import { useDesignWorkflow } from '../hooks/useDesignWorkflow';
import { useCollaboration } from '../hooks/useCollaboration';
import { useAnalysisCore } from '../hooks/useAnalysisCore';

// --- TYPE DEFINITIONS ---
type NavigationState = ReturnType<typeof useAppNavigation>;
type FileManagerState = ReturnType<typeof useFileManager>;
type DesignWorkflowState = ReturnType<typeof useDesignWorkflow>;
type CollaborationState = ReturnType<typeof useCollaboration>;
type AnalysisCoreState = ReturnType<typeof useAnalysisCore>;

interface SettingsState {
    aiPersonality: AIPersonality;
    setAiPersonality: (p: AIPersonality) => void;
    documentType: CaseDocumentType;
    setDocumentType: (d: CaseDocumentType) => void;
}

interface MainActionsState {
    fullReset: () => Promise<void>;
    refineAnalysis: () => void;
}

// --- CONTEXT CREATION ---
const NavigationContext = createContext<NavigationState | null>(null);
const FileManagerContext = createContext<FileManagerState | null>(null);
const DesignWorkflowContext = createContext<DesignWorkflowState | null>(null);
const CollaborationContext = createContext<CollaborationState | null>(null);
const AnalysisCoreContext = createContext<AnalysisCoreState | null>(null);
const SettingsContext = createContext<SettingsState | null>(null);
const MainActionsContext = createContext<MainActionsState | null>(null);

// --- HELPER COMPONENT FOR COMPOSED PROVIDERS ---
interface ProviderProps {
    children: ReactNode;
}

export const AnalysisProvider: React.FC<ProviderProps> = ({ children }) => {
    const [aiPersonality, setAiPersonality] = useState<AIPersonality>('BALANCED');
    const [documentType, setDocumentType] = useState<CaseDocumentType>('RULING');
    
    const navigation = useAppNavigation();
    const fileManager = useFileManager();
    const collaboration = useCollaboration();
    
    const designWorkflow = useDesignWorkflow({
        navigateTo: navigation.navigateTo,
        setPrimaryFile: fileManager.setPrimaryFile,
        setDocumentType,
    });
    
    const analysisCore = useAnalysisCore({
        aiPersonality,
        documentType,
        primaryFile: fileManager.primaryFile,
        evidenceFiles: fileManager.evidenceFiles,
        documentB: fileManager.documentB,
        navigateTo: navigation.navigateTo,
        goToReportSubStep: navigation.goToReportSubStep,
    });

    const fullReset = useCallback(async () => {
        analysisCore.resetAnalysis();
        fileManager.resetFiles();
        designWorkflow.resetWorkflow();
        collaboration.resetAnnotations();
        navigation.resetNavigation();
        setAiPersonality('BALANCED');
        setDocumentType('RULING');
        
        try {
            await clearCache();
        } catch {
            analysisCore.setError("No se pudo borrar la memoria estratégica.");
        }
    }, [analysisCore, fileManager, designWorkflow, collaboration, navigation]);
    
    const refineAnalysis = useCallback(() => {
        analysisCore.resetAnalysis();
        collaboration.resetAnnotations();
        navigation.goToReportSubStep('review');
        navigation.navigateTo('upload');
    }, [analysisCore, collaboration, navigation]);

    const settingsValue = useMemo(() => ({
        aiPersonality,
        setAiPersonality,
        documentType,
        setDocumentType,
    }), [aiPersonality, documentType]);

    const mainActionsValue = useMemo(() => ({
        fullReset,
        refineAnalysis,
    }), [fullReset, refineAnalysis]);

    return (
        <NavigationContext.Provider value={navigation}>
            <FileManagerContext.Provider value={fileManager}>
                <DesignWorkflowContext.Provider value={designWorkflow}>
                    <CollaborationContext.Provider value={collaboration}>
                        <AnalysisCoreContext.Provider value={analysisCore}>
                            <SettingsContext.Provider value={settingsValue}>
                                <MainActionsContext.Provider value={mainActionsValue}>
                                    {children}
                                </MainActionsContext.Provider>
                            </SettingsContext.Provider>
                        </AnalysisCoreContext.Provider>
                    </CollaborationContext.Provider>
                </DesignWorkflowContext.Provider>
            </FileManagerContext.Provider>
        </NavigationContext.Provider>
    );
};

// --- SAFE CONSUMER HOOK FACTORY ---
function useSafeContext<T>(context: React.Context<T | null>, name: string): T {
    const val = useContext(context);
    if (!val) {
        throw new Error(`${name} debe usarse dentro de un AnalysisProvider`);
    }
    return val;
}

// --- INDIVIDUAL CONSUMER HOOKS ---
export const useNavigationContext = () => useSafeContext(NavigationContext, 'useNavigationContext');
export const useFileManagerContext = () => useSafeContext(FileManagerContext, 'useFileManagerContext');
export const useDesignWorkflowContext = () => useSafeContext(DesignWorkflowContext, 'useDesignWorkflowContext');
export const useCollaborationContext = () => useSafeContext(CollaborationContext, 'useCollaborationContext');
export const useAnalysisCoreContext = () => useSafeContext(AnalysisCoreContext, 'useAnalysisCoreContext');
export const useSettingsContext = () => useSafeContext(SettingsContext, 'useSettingsContext');
export const useMainActionsContext = () => useSafeContext(MainActionsContext, 'useMainActionsContext');

// --- FACADE HOOK (Retrocompatibilidad) ---
export const useAnalysis = () => {
    const uiState = useContext(UIStateContext);
    const navigation = useNavigationContext();
    const fileManager = useFileManagerContext();
    const designWorkflow = useDesignWorkflowContext();
    const collaboration = useCollaborationContext();
    const analysisCore = useAnalysisCoreContext();
    const settings = useSettingsContext();
    const mainActions = useMainActionsContext();

    if (!uiState) {
        throw new Error('useAnalysis debe ser utilizado dentro de un UIStateProvider');
    }

    return {
        ...uiState,
        ...navigation,
        ...fileManager,
        ...designWorkflow,
        ...collaboration,
        ...analysisCore,
        ...settings,
        ...mainActions,
    };
};

