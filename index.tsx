import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AnalysisProvider } from './context/AnalysisContext';
import { UIStateProvider } from './hooks/useUIState';
import { AuthProvider } from './context/AuthContext';

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error(
        'EX LEGE Error crítico: No se encontró el elemento raíz con ID "root" en el DOM. Verifique index.html.'
    );
}

const root = ReactDOM.createRoot(rootElement);

root.render(
    <React.StrictMode>
        <UIStateProvider>
            <AnalysisProvider>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </AnalysisProvider>
        </UIStateProvider>
    </React.StrictMode>
);
