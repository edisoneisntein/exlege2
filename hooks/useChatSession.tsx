import { useState, useCallback } from 'react';
import type { FullAnalysisResult, JudgePersonality, ChatMessage } from '../types';
import { generateRAGResponseStream } from '../services/geminiService';

type AiMode = 'STRATEGIC_COLLABORATOR' | 'STRATEGIC_ADVERSARY' | 'JUDGE' | 'WITNESS';
export type { ChatMessage as Message };

/**
 * Hook para gestionar una sesión de chat completa con la IA de Gemini, utilizando una arquitectura RAG sin estado.
 * @param activeMode - La personalidad activa de la IA.
 * @param fullResult - El contexto completo del análisis del caso.
 * @param selectedPersonality - La personalidad específica del juez, si aplica.
 * @param modeConfig - El objeto de configuración que contiene los prompts para cada modo.
 */
export const useChatSession = (
    activeMode: AiMode,
    fullResult: FullAnalysisResult,
    selectedPersonality: JudgePersonality,
    modeConfig: any 
) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Resetea el historial de chat.
     * @param introText - El mensaje de bienvenida para la nueva sesión.
     */
    const reset = useCallback((introText: string) => {
        setIsProcessing(false);
        setError(null);
        if (introText) {
            setMessages([{ id: `id-intro-${Date.now()}`, speaker: 'system', text: introText }]);
        } else {
            setMessages([]);
        }
    }, []);

    /**
     * Envía un mensaje a la IA usando el flujo RAG y maneja la respuesta en streaming.
     * @param messageText - El texto del mensaje del usuario.
     * @returns Una promesa que se resuelve con el texto completo de la respuesta de la IA, o null en caso de error.
     */
    const sendMessage = useCallback(async (messageText: string): Promise<string | null> => {
        setIsProcessing(true);
        setError(null);
        
        const newUserMessage: ChatMessage = { id: `id-user-${Date.now()}`, speaker: 'user', text: messageText };
        const chatHistoryForRAG = [...messages, newUserMessage].filter(m => m.speaker !== 'system');
        setMessages(prev => [...prev, newUserMessage]);
        
        const iaMessageId = `id-ia-${Date.now()}`;
        const placeholderMessage: ChatMessage = { id: iaMessageId, speaker: 'ia', text: '', isStreaming: true };
        setMessages(prev => [...prev, placeholderMessage]);

        try {
            if (!fullResult) throw new Error("El contexto del análisis no está disponible.");

            const stream = generateRAGResponseStream(
                messageText,
                chatHistoryForRAG,
                fullResult,
                activeMode,
                selectedPersonality
            );
            
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setMessages(prev => prev.map(m => 
                    m.id === iaMessageId ? { ...m, text: fullResponse } : m
                ));
            }
            
            setMessages(prev => prev.map(m => 
                m.id === iaMessageId ? { ...m, isStreaming: false } : m
            ));
            
            return fullResponse;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error desconocido.";
            setError(`Error en la comunicación con la IA: ${message}`);
            setMessages(prev => prev.filter(m => m.id !== newUserMessage.id && m.id !== iaMessageId));
            return null;
        } finally {
            setIsProcessing(false);
        }
    }, [messages, fullResult, activeMode, selectedPersonality]);

    return { messages, isProcessing, error, sendMessage, reset, setMessages };
};