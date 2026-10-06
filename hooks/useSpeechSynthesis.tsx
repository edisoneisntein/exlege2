import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook para gestionar la síntesis de voz del navegador (Text-to-Speech).
 * Encapsula la carga de voces, la gestión de una cola y el estado de habla.
 */
export const useSpeechSynthesis = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const utteranceQueue = useRef<SpeechSynthesisUtterance[]>([]);
    const bestSpanishVoice = useRef<SpeechSynthesisVoice | null>(null);

    // Carga las voces del navegador y selecciona la mejor opción en español.
    const loadVoices = useCallback(() => {
        const setVoice = () => {
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                bestSpanishVoice.current = 
                    voices.find(v => v.lang === 'es-ES' && v.localService && v.name.includes('Google')) ||
                    voices.find(v => v.lang === 'es-US' && v.localService && v.name.includes('Google')) ||
                    voices.find(v => v.lang.startsWith('es') && v.localService) ||
                    voices.find(v => v.lang === 'es-ES') ||
                    voices.find(v => v.lang === 'es-US') ||
                    voices.find(v => v.lang.startsWith('es')) || null;
                speechSynthesis.onvoiceschanged = null;
            }
        };
        // El evento 'voiceschanged' es necesario porque las voces a menudo se cargan de forma asíncrona.
        speechSynthesis.onvoiceschanged = setVoice;
        setVoice(); // Intento inmediato por si ya están cargadas.
    }, []);

    // Carga las voces una vez al montar el componente.
    useEffect(() => {
        loadVoices();
    }, [loadVoices]);
    
    // Procesa el siguiente elemento de la cola de voz.
    const processQueue = useCallback(() => {
        if (isSpeaking || utteranceQueue.current.length === 0) {
            return;
        }
        const utterance = utteranceQueue.current.shift();
        if (utterance) {
            setIsSpeaking(true);
            const originalOnEnd = utterance.onend;
            utterance.onend = (event) => {
                if (typeof originalOnEnd === 'function') {
                    originalOnEnd.call(utterance, event);
                }
                setIsSpeaking(false); // Señala que ha terminado, permitiendo que el siguiente procese.
            };
            speechSynthesis.speak(utterance);
        }
    }, [isSpeaking]);
    
    // Efecto para procesar la cola cuando un enunciado termina.
    useEffect(() => {
        if (!isSpeaking && utteranceQueue.current.length > 0) {
            processQueue();
        }
    }, [isSpeaking, processQueue]);

    /**
     * Inicia la reproducción de un texto. Cancela cualquier reproducción anterior y limpia la cola.
     * @param text - El texto a reproducir.
     * @param options - Opciones como un callback `onEnd`.
     */
    const speak = useCallback((text: string, options: { onEnd?: () => void } = {}) => {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        utteranceQueue.current = [];
        setIsSpeaking(false); // Fuerza el reseteo del estado.

        const utterance = new SpeechSynthesisUtterance(text);
        if (bestSpanishVoice.current) {
            utterance.voice = bestSpanishVoice.current;
        }
        utterance.lang = bestSpanishVoice.current?.lang || 'es-ES';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        if (options.onEnd) {
            utterance.onend = options.onEnd;
        }

        utteranceQueue.current.push(utterance);
        processQueue();

    }, [processQueue]);
    
    /**
     * Detiene cualquier reproducción de voz en curso y vacía la cola.
     */
    const stop = useCallback(() => {
        utteranceQueue.current = [];
        setIsSpeaking(false);
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
    }, []);

    return { speak, stop, isSpeaking };
};
