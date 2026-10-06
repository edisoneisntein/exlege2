import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { FullAnalysisResult, JudgePersonality } from '../types';
import * as Prompts from '../services/promptManager';
import { useChatSession, Message } from '../hooks/useChatSession';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useAnalysis } from '../context/AnalysisContext';
import { generateOpeningStatement } from '../services/geminiService';
import { 
  Bot, 
  User, 
  Mic, 
  MicOff, 
  Send, 
  Scale, 
  ShieldAlert, 
  Sparkles, 
  Flame, 
  Plus, 
  PenTool, 
  CheckCircle2, 
  AlertCircle,
  Gavel,
  Users
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
type AiMode = 'STRATEGIC_COLLABORATOR' | 'STRATEGIC_ADVERSARY' | 'JUDGE' | 'WITNESS';

// --- MODE CONFIGURATION ---
const modeConfig: Record<AiMode, { label: string; icon: React.ReactNode; author: string; openingLine: string | null; }> = {
    STRATEGIC_COLLABORATOR: {
        label: 'Socio Estratégico',
        icon: <Bot className="h-4 w-4 text-[#DFBA73]" />,
        author: 'Socio Estratégico IA',
        openingLine: null,
    },
    STRATEGIC_ADVERSARY: {
        label: 'Adversario (Sparring)',
        icon: <Flame className="h-4 w-4 text-rose-400" />,
        author: 'Adversario Dialéctico',
        openingLine: "Estoy listo. Presente su primer argumento y le demostraré por qué no resistirá un contrainterrogatorio riguroso.",
    },
    JUDGE: {
        label: 'Simulación: Juez',
        icon: <Gavel className="h-4 w-4 text-[#FFE898]" />,
        author: 'Magistrado Ponente Simulado',
        openingLine: "Se declara abierta la sesión. Doctor/a, tiene la palabra para que presente sus alegatos fundamentales.",
    },
    WITNESS: {
        label: 'Simulación: Testigo',
        icon: <Users className="h-4 w-4 text-amber-300" />,
        author: 'IA "Sócrates" (Interrogatorio)',
        openingLine: null,
    },
};

const personalityProfiles: Record<JudgePersonality, { name: string; description: string }> = {
    EQUILIBRADO: { name: "Equilibrado", description: "Riguroso y justo, balance estricto entre ley y equidad." },
    GARANTISTA: { name: "Garantista", description: "Enfocado en derechos fundamentales y debido proceso." },
    FORMALISTA: { name: "Formalista", description: "Adherencia estricta a la literalidad y reglas procesales." },
    PUNITIVISTA: { name: "Punitivista", description: "Inclinado a la sanción procesal y escéptico ante defensas." },
};

interface LegalConsultantChatProps {
    onPromoteToAnnotation: (text: string, author?: string) => void;
    onPromoteToRefinement: (text: string, author?: string) => void;
}

const LegalConsultantChat: React.FC<LegalConsultantChatProps> = ({ onPromoteToAnnotation, onPromoteToRefinement }) => {
    const [activeMode, setActiveMode] = useState<AiMode>('STRATEGIC_COLLABORATOR');
    const [textInput, setTextInput] = useState('');
    const [selectedPersonality, setSelectedPersonality] = useState<JudgePersonality>('EQUILIBRADO');
    const [initialMessageForNextMode, setInitialMessageForNextMode] = useState<string | null>(null);
    const { analysisResult } = useAnalysis();

    const { messages, isProcessing, error: chatError, sendMessage, setMessages, reset: resetChatSession } = useChatSession(activeMode, analysisResult!, selectedPersonality, modeConfig);
    const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis();
    const { 
        startListening, 
        stopListening, 
        isListening, 
        error: recognitionError, 
        isSupported: isRecognitionSupported,
        permissionStatus
    } = useSpeechRecognition(
        setTextInput,
        (finalTranscript) => handleSendText(null, finalTranscript)
    );

    const messagesEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const status = useMemo(() => {
        if (isListening) return 'LISTENING';
        if (isProcessing) return 'PROCESSING';
        if (isSpeaking) return 'SPEAKING';
        if (chatError || (recognitionError && permissionStatus !== 'denied')) return 'ERROR';
        return 'IDLE';
    }, [isListening, isProcessing, isSpeaking, chatError, recognitionError, permissionStatus]);
    
    const displayStatus = useMemo(() => {
        if (permissionStatus === 'checking') {
            return { text: 'Verificando micrófono...', color: 'bg-slate-500' };
        }
        if (permissionStatus === 'denied') {
            return { text: 'Acceso a micrófono denegado', color: 'bg-rose-500' };
        }
        if (permissionStatus === 'prompt' && status === 'IDLE') {
            return { text: 'Permiso de micrófono pendiente', color: 'bg-amber-500' };
        }
        
        switch (status) {
            case 'LISTENING': return { text: 'Escuchando... (Haga clic para detener)', color: 'bg-rose-500 animate-pulse' };
            case 'PROCESSING': return { text: 'Procesando razonamiento jurídico...', color: 'bg-[#DFBA73] animate-pulse' };
            case 'SPEAKING': return { text: 'Transmitiendo alocución...', color: 'bg-[#C5A059] animate-pulse' };
            case 'ERROR': return { text: 'Incidencia en sesión de consulta', color: 'bg-rose-500' };
            case 'IDLE':
            default: return { text: 'Tribunal consultivo listo', color: 'bg-[#C5A059]' };
        }
    }, [status, permissionStatus]);

    useEffect(() => {
        const initializeOrTransition = async () => {
            if (!analysisResult) return;
    
            stopSpeaking();
            stopListening();
            resetChatSession('');
    
            if (initialMessageForNextMode) {
                const messageToSend = initialMessageForNextMode;
                setInitialMessageForNextMode(null);
                const aiResponse = await sendMessage(messageToSend);
                if (aiResponse) {
                    speak(aiResponse, { onEnd: () => {} });
                }
            } else {
                const config = modeConfig[activeMode];
                let openingText = config.openingLine;
                const iaMessageId = `id-ia-${Date.now()}`;
    
                if (openingText === null) {
                    const placeholderMessage: Message = { id: iaMessageId, speaker: 'system', text: `El asesor (${config.label}) está sintetizando el contexto procesal...`, isStreaming: false };
                    setMessages([placeholderMessage]);
                    try {
                        if (activeMode === 'STRATEGIC_COLLABORATOR' || activeMode === 'WITNESS') {
                           openingText = await generateOpeningStatement(activeMode, analysisResult);
                        } else {
                           throw new Error("Modo de apertura no configurado.");
                        }
                    } catch(e) {
                        const errorMsg = e instanceof Error ? e.message : "Error desconocido";
                        openingText = `Iniciando terminal de consulta procesal. ¿Qué aspecto jurídico desea analizar? (${errorMsg})`;
                    }
                }
                
                const firstMessage: Message = { id: iaMessageId, speaker: 'ia', text: openingText! };
                setMessages([firstMessage]);
                speak(openingText!, { onEnd: () => {} });
            }
        };
    
        initializeOrTransition();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeMode, selectedPersonality, analysisResult]);

    const handleSendText = useCallback(async (e: React.FormEvent | null, text?: string) => {
        e?.preventDefault();
        const textToSend = (text || textInput).trim();
        if (!textToSend || status === 'PROCESSING' || status === 'SPEAKING') return;

        setTextInput('');
        const aiResponse = await sendMessage(textToSend);
        if (aiResponse) {
            speak(aiResponse, { onEnd: () => {} });
        }
    }, [textInput, status, sendMessage, speak]);

    const handleToggleVoice = () => {
        if (!isRecognitionSupported) return;

        if (isListening) {
            stopListening();
        } else if (isSpeaking || isProcessing) {
            stopSpeaking();
        } else {
            startListening();
        }
    };
    
    const handleDebate = (argument: string) => {
        setInitialMessageForNextMode(argument);
        setActiveMode('STRATEGIC_ADVERSARY');
    };

    const handleRefute = (critique: string) => {
        const prompt = `El modo adversario presentó la siguiente crítica: "${critique}". Ayúdame a construir la refutación más sólida y bien fundamentada contra este punto específico.`;
        setInitialMessageForNextMode(prompt);
        setActiveMode('STRATEGIC_COLLABORATOR');
    };

    return (
        <div className="flex flex-col h-full bg-[#08040d] text-slate-100 font-sans select-text">
            {/* Header Mode Selector */}
            <header className="flex-shrink-0 p-4 border-b border-[#C5A059]/25 bg-[#0d0718]/90 backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-xs font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] to-[#C5A059] whitespace-nowrap uppercase tracking-wider">
                        Modo Consultivo:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                        {(Object.keys(modeConfig) as AiMode[]).map(key => {
                            const isSelected = activeMode === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setActiveMode(key)}
                                    disabled={status !== 'IDLE'}
                                    className={`px-3 py-2 rounded-xl text-xs font-cinzel font-bold transition-all flex items-center justify-center gap-2 border ${
                                        isSelected
                                            ? 'bg-gradient-to-r from-[#2a133d] to-[#1e0a2e] text-[#FFE898] border-[#C5A059] shadow-[0_0_15px_rgba(197,160,89,0.3)] ring-1 ring-[#C5A059]/50'
                                            : 'bg-[#12071d]/60 text-slate-400 hover:text-[#DFBA73] hover:bg-[#1a0c2a] border-[#C5A059]/20'
                                    }`}
                                >
                                    {modeConfig[key].icon}
                                    <span className="truncate">{modeConfig[key].label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* Chat Messages */}
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto min-h-0 bg-[#08040d] space-y-4 scrollbar-thin">
                {activeMode === 'JUDGE' && messages.length <= 1 && (
                     <div className="mb-4 bg-[#12071d] p-4 rounded-2xl border border-[#C5A059]/30 court-gold-frame">
                        <h4 className="font-cinzel font-bold text-[#FFE898] text-center text-xs mb-3 uppercase tracking-wider">
                            Perfil Jurisdiccional del Magistrado Simulado
                        </h4>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                            {(Object.keys(personalityProfiles) as JudgePersonality[]).map(key => (
                                <button 
                                    key={key} 
                                    onClick={() => setSelectedPersonality(key)} 
                                    className={`p-2.5 rounded-xl border text-center transition-all ${
                                        selectedPersonality === key 
                                            ? 'bg-[#2a133d] border-[#C5A059] text-[#FFE898] shadow-[0_0_12px_rgba(197,160,89,0.3)]' 
                                            : 'bg-[#0d0718] border-[#C5A059]/20 text-slate-400 hover:text-slate-200 hover:border-[#C5A059]/40'
                                    }`}
                                >
                                    <span className="font-cinzel font-bold text-xs block">{personalityProfiles[key].name}</span>
                                    <span className="text-[10px] text-slate-400 font-garamond italic block mt-0.5 line-clamp-2">{personalityProfiles[key].description}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-4 text-xs sm:text-sm font-garamond">
                    {messages.map((msg, index) => (
                        <div key={index} className="group">
                            {msg.speaker === 'system' ? (
                                <div className="text-center text-[11px] font-mono text-[#C5A059]/80 p-2.5 my-2 border-y border-[#C5A059]/20 bg-[#12071d]/60 rounded-xl">
                                    {msg.text}
                                </div>
                            ) : (
                                <div className={`flex gap-3 ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-4 rounded-2xl max-w-[85%] sm:max-w-[75%] shadow-xl leading-relaxed ${
                                        msg.speaker === 'user' 
                                            ? 'bg-gradient-to-br from-[#2a133d] to-[#1a0c2a] text-[#FFE898] border border-[#C5A059]/50 rounded-br-none shadow-[0_4px_20px_rgba(0,0,0,0.6)]' 
                                            : 'bg-[#12071d]/95 text-slate-200 border border-[#C5A059]/30 rounded-bl-none court-gold-frame'
                                    }`}>
                                        <div className="flex items-center gap-1.5 mb-1.5 border-b border-[#C5A059]/15 pb-1">
                                            {msg.speaker === 'user' ? <User className="w-3.5 h-3.5 text-[#FFE898]" /> : <Scale className="w-3.5 h-3.5 text-[#DFBA73]" />}
                                            <span className="font-cinzel font-bold text-[10px] uppercase tracking-wider text-[#DFBA73]">
                                                {msg.speaker === 'user' ? 'Abogado Litigante' : modeConfig[activeMode].author}
                                            </span>
                                        </div>
                                        <div className="whitespace-pre-wrap text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                                            {msg.text}
                                            {msg.isStreaming && <span className="inline-block w-1.5 h-3.5 bg-[#DFBA73] animate-pulse ml-1 align-middle"></span>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {msg.speaker === 'ia' && !msg.isStreaming && (
                                <div className="mt-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 flex-wrap">
                                    <button 
                                        onClick={() => onPromoteToAnnotation(msg.text, modeConfig[activeMode].author)} 
                                        className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-cinzel font-bold rounded-lg bg-[#12071d] hover:bg-[#1e0a2e] text-[#DFBA73] border border-[#C5A059]/30 transition-colors shadow"
                                    >
                                        <Plus className="h-3 w-3 text-[#DFBA73]" />
                                        <span>Añadir a Hallazgo</span>
                                    </button>
                                    <button 
                                        onClick={() => onPromoteToRefinement(msg.text, modeConfig[activeMode].author)} 
                                        className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-cinzel font-bold rounded-lg bg-[#2a133d]/60 hover:bg-[#2a133d] text-[#FFE898] border border-[#C5A059]/40 transition-colors shadow"
                                    >
                                        <PenTool className="h-3 w-3 text-[#FFE898]" />
                                        <span>Promover a Refinamiento</span>
                                    </button>
                                    {activeMode === 'STRATEGIC_COLLABORATOR' && (
                                        <button 
                                            onClick={() => handleDebate(msg.text)} 
                                            className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-cinzel font-bold rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 transition-colors shadow"
                                        >
                                            <Flame className="h-3 w-3 text-rose-400" />
                                            <span>Debatir</span>
                                        </button>
                                    )}
                                    {activeMode === 'STRATEGIC_ADVERSARY' && (
                                        <button 
                                            onClick={() => handleRefute(msg.text)} 
                                            className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-cinzel font-bold rounded-lg bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 transition-colors shadow"
                                        >
                                            <ShieldAlert className="h-3 w-3 text-amber-400" />
                                            <span>Refutar</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {(chatError || (recognitionError && permissionStatus !== 'denied')) && (
                        <div className="p-3 text-xs font-mono text-rose-300 bg-rose-950/40 rounded-xl border border-rose-500/40">
                            <strong>Incidencia de Terminal:</strong> {chatError || recognitionError}
                        </div>
                    )}
                    <div ref={messagesEndRef}></div>
                </div>
            </main>

            {/* Footer Input Area */}
            <footer className="p-4 border-t border-[#C5A059]/25 bg-[#0d0718]/95 backdrop-blur-xl flex-shrink-0 space-y-3">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${displayStatus.color}`}></div>
                    <span className="text-[11px] font-garamond italic text-[#DFBA73]/80">{displayStatus.text}</span>
                </div>

                {permissionStatus === 'denied' && (
                    <div className="text-[11px] font-mono text-rose-300 bg-rose-950/30 p-2.5 rounded-xl border border-rose-500/30">
                        <strong>Permiso Requerido:</strong> Micrófono inhabilitado en el navegador.
                    </div>
                )}

                <form onSubmit={handleSendText} className="flex items-end gap-2.5">
                    <textarea
                        id="chat-input"
                        name="chat-input"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder={isListening ? 'Dictando...' : "Escriba su consulta o argumento procesal..."}
                        className="w-full px-4 py-3 bg-[#12071d] border border-[#C5A059]/30 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/40 rounded-2xl focus:outline-none text-slate-100 text-xs sm:text-sm resize-none font-garamond placeholder-slate-500 shadow-inner"
                        disabled={status === 'PROCESSING' || status === 'SPEAKING'}
                        rows={2}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSendText(e); }}
                    />
                    <div className="flex gap-2 pb-1">
                        <button
                            type="button"
                            onClick={handleToggleVoice}
                            disabled={!isRecognitionSupported || permissionStatus === 'denied' || permissionStatus === 'checking'}
                            className={`p-3 rounded-xl transition-all font-mono font-bold text-xs flex items-center justify-center ${
                                isListening 
                                    ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.5)]' 
                                    : 'bg-[#12071d] border border-[#C5A059]/30 text-[#DFBA73] hover:text-[#FFE898] hover:border-[#C5A059]'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                            aria-label={isListening ? 'Detener dictado' : 'Iniciar dictado'}
                        >
                            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </button>
                        <button
                            type="submit"
                            disabled={!textInput.trim() || status === 'PROCESSING' || status === 'SPEAKING'}
                            className="p-3 bg-gradient-to-r from-[#DFBA73] to-[#C5A059] hover:from-[#FFE898] hover:to-[#DFBA73] text-[#08040d] font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(197,160,89,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Enviar mensaje"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </form>
            </footer>
        </div>
    );
};

export default LegalConsultantChat;
