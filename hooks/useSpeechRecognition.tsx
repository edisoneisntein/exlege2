import { useState, useRef, useCallback, useEffect } from 'react';
import type { SpeechRecognition, SpeechRecognitionStatic, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '../types';

const WebSpeechRecognition: SpeechRecognitionStatic | undefined = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
type PermissionState = 'prompt' | 'granted' | 'denied';

/**
 * Hook para gestionar el reconocimiento de voz del navegador (Speech-to-Text).
 * Encapsula la complejidad de la Web Speech API, incluyendo la gestión de permisos.
 * @param onTranscriptUpdate - Callback que se ejecuta con la transcripción actualizada.
 * @param onFinalTranscript - Callback que se ejecuta cuando se finaliza un fragmento de voz.
 */
export const useSpeechRecognition = (
    onTranscriptUpdate: (transcript: string) => void,
    onFinalTranscript: (transcript: string) => void
) => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<PermissionState | 'checking'>('checking');
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const finalTranscriptRef = useRef<string>('');

    useEffect(() => {
        if (!WebSpeechRecognition) {
            setPermissionStatus('denied');
            setError("API de Voz no compatible. Por favor, use Chrome o Edge.");
            return;
        }

        navigator.permissions.query({ name: 'microphone' as PermissionName }).then((permission) => {
            setPermissionStatus(permission.state);
            permission.onchange = () => {
                setPermissionStatus(permission.state);
                if (permission.state === 'denied') {
                    setError("El acceso al micrófono fue denegado. Habilítelo en la configuración de su navegador.");
                    if(isListening) stopListening();
                }
                 if (permission.state === 'granted') {
                    setError(null);
                }
            };
        }).catch(() => {
            setPermissionStatus('denied');
            setError("No se pudo verificar el permiso del micrófono.");
        });

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
                recognitionRef.current = null;
            }
        };
    }, []);

    const startListening = useCallback(() => {
        if (permissionStatus === 'denied') {
            setError("El acceso al micrófono está denegado. Revise la configuración de su navegador.");
            return;
        }
        if (isListening || recognitionRef.current) {
            return;
        }
        
        finalTranscriptRef.current = '';
        setError(null);
        if (!WebSpeechRecognition) {
            setError("API de Voz no compatible.");
            return;
        }
        const recognition = new WebSpeechRecognition();
        recognitionRef.current = recognition;

        Object.assign(recognition, {
            continuous: true,
            interimResults: true,
            lang: 'es-CO',
            onresult: (event: SpeechRecognitionEvent) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscriptRef.current += event.results[i][0].transcript;
                        onFinalTranscript(finalTranscriptRef.current.trim());
                        finalTranscriptRef.current = ''; // Reset for next final phrase
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                onTranscriptUpdate(finalTranscriptRef.current + interimTranscript);
            },
            onerror: (e: SpeechRecognitionErrorEvent) => {
                if (e.error === 'not-allowed') {
                    setError("Acceso al micrófono denegado. Habilítelo en la configuración de su navegador.");
                    setPermissionStatus('denied');
                } else if (e.error !== 'aborted' && e.error !== 'no-speech' && e.error !== 'network') {
                    setError(`Error de Micrófono: ${e.error}`);
                }
                setIsListening(false);
                recognitionRef.current = null;
            },
            onend: () => {
                setIsListening(false);
                recognitionRef.current = null;
            }
        });
        
        recognition.start();
        setIsListening(true);
    }, [isListening, onTranscriptUpdate, onFinalTranscript, permissionStatus]);
    
    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    return { 
        startListening, 
        stopListening, 
        isListening, 
        error, 
        permissionStatus,
        isSupported: !!WebSpeechRecognition 
    };
};