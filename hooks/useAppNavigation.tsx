import { useState, useCallback } from 'react';
import type { ReportSubStep } from '../types';

/**
 * Hook especializado para gestionar el estado de la navegación de la aplicación.
 * Encapsula la lógica de la pantalla actual, el historial para la función "atrás",
 * y el estado de los sub-pasos dentro de la pantalla del informe.
 * Esto mejora la modularidad y la separación de responsabilidades.
 */
export const useAppNavigation = () => {
    const [currentScreen, setCurrentScreen] = useState('entry');
    const [reportSubStep, setReportSubStep] = useState<ReportSubStep>('review');
    const [history, setHistory] = useState<string[]>(['entry']);

    const navigateTo = useCallback((screen: string) => {
        if (screen === 'report') {
            setReportSubStep('review'); // Always start report at the first step
        }
        setHistory(prev => {
            if (prev[prev.length -1] === screen) return prev;
            return [...prev, screen]
        });
        setCurrentScreen(screen);
    }, []);

    const goBack = useCallback(() => {
        setHistory(prev => {
            if (prev.length <= 1) return prev;
            const newHistory = prev.slice(0, -1);
            setCurrentScreen(newHistory[newHistory.length - 1]);
            return newHistory;
        });
    }, []);
    
    const resetNavigation = () => {
        setCurrentScreen('entry');
        setReportSubStep('review');
        setHistory(['entry']);
    };

    return {
        currentScreen,
        navigateTo,
        goBack,
        reportSubStep,
        goToReportSubStep: setReportSubStep,
        resetNavigation,
    };
};
