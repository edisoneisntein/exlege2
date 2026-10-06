import React, { useState, useMemo, useCallback, createContext, ReactNode } from 'react';

const zoomSteps = [0.8, 0.9, 1.0, 1.1, 1.25, 1.5];

export interface PrivacySettings {
    anonymizeParties: boolean;
    anonymizeIds: boolean;
    anonymizeAddresses: boolean;
    strictAntiHallucination: boolean;
    localRetentionOnly: boolean;
}

export type ConfigModalTab = 'PORTALS' | 'JURISDICTIONS' | 'PRIVACY' | 'DIRECTIVES';

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
    anonymizeParties: true,
    anonymizeIds: true,
    anonymizeAddresses: false,
    strictAntiHallucination: true,
    localRetentionOnly: true,
};

// --- Hook Logic ---
export const useUIState = () => {
    const [isManualOpen, setIsManualOpen] = useState(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [configModalTab, setConfigModalTab] = useState<ConfigModalTab>('PORTALS');
    
    const [activeJurisdiction, setActiveJurisdictionState] = useState<string>(() => {
        try {
            return localStorage.getItem('EX_LEGE_ACTIVE_JURISDICTION') || 'CO';
        } catch {
            return 'CO';
        }
    });

    const [privacySettings, setPrivacySettingsState] = useState<PrivacySettings>(() => {
        try {
            const stored = localStorage.getItem('EX_LEGE_PRIVACY_SETTINGS');
            if (stored) {
                return { ...DEFAULT_PRIVACY_SETTINGS, ...JSON.parse(stored) };
            }
        } catch {}
        return DEFAULT_PRIVACY_SETTINGS;
    });

    const [zoomLevel, setZoomLevel] = useState(() => {
        const savedZoom = localStorage.getItem('zoomLevel');
        if (savedZoom) {
            const parsedZoom = parseFloat(savedZoom);
            if (zoomSteps.includes(parsedZoom)) {
                return parsedZoom;
            }
        }
        return 1.0;
    });

    const toggleManual = useCallback((isOpen: boolean) => {
        setIsManualOpen(isOpen);
    }, []);

    const toggleConfigModal = useCallback((isOpen: boolean, initialTab?: ConfigModalTab) => {
        if (initialTab) {
            setConfigModalTab(initialTab);
        }
        setIsConfigModalOpen(isOpen);
    }, []);

    const setActiveJurisdiction = useCallback((code: string) => {
        setActiveJurisdictionState(code);
        try {
            localStorage.setItem('EX_LEGE_ACTIVE_JURISDICTION', code);
        } catch {}
    }, []);

    const updatePrivacySettings = useCallback((newSettings: Partial<PrivacySettings>) => {
        setPrivacySettingsState(prev => {
            const updated = { ...prev, ...newSettings };
            try {
                localStorage.setItem('EX_LEGE_PRIVACY_SETTINGS', JSON.stringify(updated));
            } catch {}
            return updated;
        });
    }, []);

    const canZoomIn = useMemo(() => {
        const currentIndex = zoomSteps.indexOf(zoomLevel);
        return currentIndex < zoomSteps.length - 1;
    }, [zoomLevel]);

    const canZoomOut = useMemo(() => {
        const currentIndex = zoomSteps.indexOf(zoomLevel);
        return currentIndex > 0;
    }, [zoomLevel]);
    
    const changeZoom = useCallback((direction: 'in' | 'out' | 'reset') => {
        setZoomLevel(currentZoom => {
            const currentIndex = zoomSteps.indexOf(currentZoom);
            let newZoom = currentZoom;

            if (direction === 'reset') {
                newZoom = 1.0;
            } else if (direction === 'in') {
                if (currentIndex < zoomSteps.length - 1) {
                    newZoom = zoomSteps[currentIndex + 1];
                }
            } else { // 'out'
                if (currentIndex > 0) {
                    newZoom = zoomSteps[currentIndex - 1];
                }
            }
            localStorage.setItem('zoomLevel', newZoom.toString());
            return newZoom;
        });
    }, []);
    
    return {
        isManualOpen,
        toggleManual,
        isConfigModalOpen,
        configModalTab,
        toggleConfigModal,
        activeJurisdiction,
        setActiveJurisdiction,
        privacySettings,
        updatePrivacySettings,
        zoomLevel,
        changeZoom,
        canZoomIn,
        canZoomOut,
    };
};

// --- Context and Provider ---
type UIStateContextType = ReturnType<typeof useUIState>;
export const UIStateContext = createContext<UIStateContextType | null>(null);

export const UIStateProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const uiState = useUIState();
    return (
        <UIStateContext.Provider value={uiState}>
            {children}
        </UIStateContext.Provider>
    );
};