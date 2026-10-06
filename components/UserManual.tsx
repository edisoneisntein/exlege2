import React, { useState } from 'react';
import { 
  BookOpen, 
  Scale, 
  ShieldCheck, 
  Zap, 
  Search, 
  FileText, 
  MessageSquare, 
  CheckCircle2, 
  Compass, 
  Cpu, 
  Layers, 
  Globe, 
  ChevronRight, 
  X, 
  Sparkles, 
  Lock, 
  HelpCircle,
  ExternalLink,
  Flame,
  Award
} from 'lucide-react';

interface UserManualProps {
  onClose: () => void;
}

type ManualSection = 
  | 'overview'
  | 'getting_started'
  | 'consortium'
  | 'workflow_analysis'
  | 'workflow_strategy'
  | 'substeps_breakdown'
  | 'chat_rag'
  | 'governance_packs'
  | 'security_antihallucination'
  | 'faq';

interface SectionNav {
  id: ManualSection;
  title: string;
  icon: React.ReactNode;
  badge?: string;
}

const SECTIONS: SectionNav[] = [
  { id: 'overview', title: 'Visión General & Filosofía', icon: <Scale className="w-4 h-4 text-[#DFBA73]" /> },
  { id: 'getting_started', title: 'Primeros Pasos & Modos', icon: <Compass className="w-4 h-4 text-[#FFE898]" /> },
  { id: 'consortium', title: 'Consorcio de Agentes IA (11 Motores)', icon: <Cpu className="w-4 h-4 text-[#DFBA73]" />, badge: 'V5 Core' },
  { id: 'workflow_analysis', title: 'Flujo 1: Autopsia Forense de Providencias', icon: <FileText className="w-4 h-4 text-[#DFBA73]" /> },
  { id: 'workflow_strategy', title: 'Flujo 2: Diseño de Estrategia desde Cero', icon: <Sparkles className="w-4 h-4 text-[#FFE898]" /> },
  { id: 'substeps_breakdown', title: 'Módulos del Informe & Borrador', icon: <Layers className="w-4 h-4 text-[#DFBA73]" /> },
  { id: 'chat_rag', title: 'Consultor Legal RAG & Sparring', icon: <MessageSquare className="w-4 h-4 text-[#FFE898]" /> },
  { id: 'governance_packs', title: 'Jurisdicciones & Portales Judiciales', icon: <Globe className="w-4 h-4 text-[#DFBA73]" /> },
  { id: 'security_antihallucination', title: 'Protocolo Anti-Alucinación & Privacidad', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, badge: 'LAGP V5' },
  { id: 'faq', title: 'Preguntas Frecuentes (FAQ)', icon: <HelpCircle className="w-4 h-4 text-[#DFBA73]" /> },
];

export const UserManual: React.FC<UserManualProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<ManualSection>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = searchQuery.trim() === '' 
    ? SECTIONS 
    : SECTIONS.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      <div className="fixed inset-0 bg-[#08040d]/85 backdrop-blur-md z-[100]" onClick={onClose} aria-hidden="true" />
      <div 
        className="fixed inset-y-0 right-0 w-full max-w-5xl bg-[#12071d] border-l border-[#C5A059]/40 shadow-[0_0_60px_rgba(0,0,0,0.9)] z-[101] flex flex-col animate-slide-in text-slate-200 court-gold-frame overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-title"
      >
        <style>{`
            @keyframes slide-in {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
            .animate-slide-in { animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}</style>

        {/* Top Header */}
        <header className="flex justify-between items-center px-6 py-4 border-b border-[#C5A059]/30 flex-shrink-0 bg-gradient-to-r from-[#0d0718] via-[#1a0c2a] to-[#0d0718] z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] via-[#9e7d3b] to-[#594017] p-0.5 shadow-[0_0_15px_rgba(212,175,55,0.3)] border border-[#FFE898] flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-[#12071d]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-[#FFE898] bg-[#C5A059]/20 px-2 py-0.5 rounded border border-[#C5A059]/30 uppercase tracking-widest">
                  ESTATUTO & GUÍA OPERATIVA V5
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                  ANTI-ALUCINACIÓN ACTIVO
                </span>
              </div>
              <h2 id="manual-title" className="text-lg sm:text-xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] via-[#FFE898] to-[#DFBA73] mt-0.5">
                Manual Maestro de Litigación Estratégica: EX LEGE SOVEREIGN
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose} 
              className="p-2.5 rounded-xl text-slate-400 hover:text-[#FFE898] bg-[#0d0718] hover:bg-[#2a133d] border border-[#C5A059]/25 hover:border-[#C5A059]/60 transition-all shadow-inner"
              aria-label="Cerrar manual de usuario"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Body Container: Interactive Sidebar + Content Panel */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#0d0718]">
          
          {/* Interactive Navigation Sidebar */}
          <aside className="w-full md:w-72 bg-[#0e0717] border-b md:border-b-0 md:border-r border-[#C5A059]/25 flex flex-col flex-shrink-0">
            {/* Quick Search */}
            <div className="p-3.5 border-b border-[#C5A059]/15">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#DFBA73] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar en el estatuto..."
                  className="w-full pl-8 pr-3 py-1.5 bg-[#170926] border border-[#C5A059]/30 rounded-lg text-xs font-garamond text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#DFBA73]"
                />
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-2.5 space-y-1 scrollbar-thin">
              {filteredSections.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-cinzel transition-all flex items-center justify-between group ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#2a133d] to-[#1e0d2d] border border-[#C5A059] text-[#FFE898] shadow-[0_0_15px_rgba(197,160,89,0.25)] font-bold' 
                        : 'bg-[#12071d]/40 border border-transparent text-slate-300 hover:bg-[#200e30] hover:text-[#DFBA73]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {sec.icon}
                      <span className="truncate">{sec.title}</span>
                    </div>
                    {sec.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#C5A059]/20 text-[#FFE898] border border-[#C5A059]/30 group-hover:border-[#C5A059]/60">
                        {sec.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Jurisdictional Footnote */}
            <div className="p-3 bg-[#08040d] border-t border-[#C5A059]/15 text-[11px] font-garamond text-slate-400 text-center">
              🏛️ Adaptado para <span className="text-[#FFE898] font-cinzel">Colombia & LatAm</span>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-6 sm:p-8 scrollbar-thin bg-gradient-to-b from-[#0d0718] to-[#12071d] font-garamond text-slate-300 leading-relaxed text-base space-y-6">
            
            {/* SECTION 1: OVERVIEW */}
            {activeSection === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-[#C5A059]/30 pb-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#DFBA73] uppercase tracking-wider mb-1">
                    <Scale className="w-4 h-4" /> Fundamentos de la Plataforma
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] via-[#FFE898] to-[#DFBA73]">
                    Visión General: Laboratorio de Litigación Estratégica
                  </h1>
                </div>

                <p className="text-lg text-slate-200">
                  <strong className="text-[#FFE898] font-cinzel">EX LEGE SOVEREIGN</strong> es una estación de trabajo de alta ingeniería jurídica diseñada para magistrados, litigantes senior y asesores corporativos. Su propósito es ejecutar <span className="text-[#DFBA73] font-semibold">autopsias forenses a fallos judiciales</span>, reconstruir el material fáctico y generar piezas procesales blindadas contra nulidades y recursos extraordinarios.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#170926] border border-[#C5A059]/30 shadow-lg">
                    <h3 className="font-cinzel font-bold text-sm text-[#FFE898] flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Deconstrucción In Injudicando & In Procedendo
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Identifica de forma exhaustiva defectos fácticos, sustantivos, orgánicos y procedimentales para sustentar apelaciones, tutelas y casaciones.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#170926] border border-[#C5A059]/30 shadow-lg">
                    <h3 className="font-cinzel font-bold text-sm text-[#FFE898] flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-[#DFBA73]" />
                      Investigación Jurisprudencial en Vivo
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      El motor ejecuta búsquedas RAG en portales judiciales oficiales y fuentes doctrinales vigentes antes de redactar cualquier conclusión.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#170926] border border-[#C5A059]/30 shadow-lg">
                    <h3 className="font-cinzel font-bold text-sm text-[#FFE898] flex items-center gap-2 mb-2">
                      <Cpu className="w-4 h-4 text-[#FFE898]" />
                      Stress-Testing Adversarial
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Un agente de IA especializado adopta la postura de un Magistrado de Alta Corte implacable para demoler preliminarmente sus argumentos antes del radicado.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#170926] border border-[#C5A059]/30 shadow-lg">
                    <h3 className="font-cinzel font-bold text-sm text-[#FFE898] flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      Soberanía Local & Confidencialidad
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Procesamiento local en cliente (Client-Side Memory), sin almacenamiento permanente de expedientes en servidores externos no autorizados.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: GETTING STARTED */}
            {activeSection === 'getting_started' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-[#C5A059]/30 pb-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#DFBA73] uppercase tracking-wider mb-1">
                    <Compass className="w-4 h-4" /> Modos Operativos
                  </div>
                  <h1 className="text-2xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] to-[#FFE898]">
                    Primeros Pasos & Arquitectura de Entrada
                  </h1>
                </div>

                <p>
                  Al acceder a EX LEGE SOVEREIGN, el usuario dispone de dos rutas metodológicas diseñadas según el estado procesal del asunto:
                </p>

                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-[#170926] border border-[#C5A059]/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-cinzel font-bold text-base text-[#FFE898] flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#C5A059]/20 border border-[#C5A059] flex items-center justify-center text-xs font-mono">1</span>
                        Autopsia Forense de Documento Existente (Recomendado)
                      </h3>
                      <span className="text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">Ruta Principal</span>
                    </div>
                    <p className="text-sm text-slate-300">
                      Cargue una providencia judicial, sentencia de primera instancia, auto interlocutorio, demanda o contestación (.pdf, .docx, .txt). El sistema activará el Consorcio de Agentes para deconstruir la ratio decidendi, errores in iudicando e inconsistencias fácticas.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#170926] border border-[#C5A059]/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-cinzel font-bold text-base text-[#FFE898] flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#C5A059]/20 border border-[#C5A059] flex items-center justify-center text-xs font-mono">2</span>
                        Diseño de Estrategia desde Cero (Narración de Hechos)
                      </h3>
                      <span className="text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded">Fase Pre-Procesal</span>
                    </div>
                    <p className="text-sm text-slate-300">
                      Ingrese los hechos del caso en lenguaje natural. La IA estructurará 3 rutas de acción procesal alternativas con análisis de viabilidad, pros, contras, fundamentación jurídica y plazos de caducidad/prescripción.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: CONSORTIUM */}
            {activeSection === 'consortium' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-[#C5A059]/30 pb-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#DFBA73] uppercase tracking-wider mb-1">
                    <Cpu className="w-4 h-4" /> Consorcio de Inteligencia Judicial
                  </div>
                  <h1 className="text-2xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] to-[#FFE898]">
                    El Consorcio de 11 Motores de Deconstrucción (LAGP V5)
                  </h1>
                </div>

                <p>
                  A diferencia de modelos de lenguaje genéricos, EX LEGE opera mediante un <strong className="text-[#FFE898]">consorcio concurrente de agentes especializados</strong> con instrucciones hiper-focalizadas:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {[
                    { title: 'Investigador Web & Jurisprudencia', desc: 'Recupera sentencias unificadoras y doctrina aplicable antes del análisis.', tag: 'Grounding' },
                    { title: 'Analista Forense Técnico', desc: 'Rastrea nulidades absolutas, falta de competencia, caducidad e incongruencia.', tag: 'Procedimental' },
                    { title: 'Contradictor de Alta Corte', desc: 'Stress-testing implacable de la lógica argumentativa y silogismos judiciales.', tag: 'Adversarial' },
                    { title: 'Arquitecto de Apelación', desc: 'Estructura el memorial de agravios con narrativa de afectación sustancial.', tag: 'Redacción' },
                    { title: 'Auditor Probatorio Cruzado', desc: 'Contrasta afirmaciones del fallo contra los anexos probatorios aportados.', tag: 'Evidencia' },
                    { title: 'Auditor de Plazos & Caducidad', desc: 'Computa términos perentorios y oportunidad procesal en el fuero.', tag: 'Términos' },
                    { title: 'Verificador Epistémico Anti-Alucinación', desc: 'Valida que cada cita jurisprudencial cuente con número de radicado verificable.', tag: 'Seguridad' },
                    { title: 'Simulador de Testigos & Peritajes', desc: 'Prepara interrogatorios cruzados y descubre contradicciones testimoniales.', tag: 'Oralidad' },
                    { title: 'Calculador de Probabilidad Judicial', desc: 'Genera métricas porcentuales de éxito para cada teoría jurídica.', tag: 'Predictivo' },
                    { title: 'Laboratorio de Argumentos', desc: 'Crea variantes retóricas (formalista, garantista, pragmática).', tag: 'Retórica' },
                    { title: 'QA Gatekeeper de Cierre', desc: 'Auditoría integral previa al sellado y exportación en formato DOCX.', tag: 'Calidad' }
                  ].map((m, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-[#170926] border border-[#C5A059]/30 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-cinzel font-bold text-xs text-[#FFE898]">{m.title}</h4>
                          <span className="text-[9px] font-mono text-[#DFBA73] bg-[#C5A059]/15 px-1.5 py-0.5 rounded border border-[#C5A059]/30">{m.tag}</span>
                        </div>
                        <p className="text-xs text-slate-300">{m.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 4: WORKFLOW ANALYSIS */}
            {activeSection === 'workflow_analysis' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-[#C5A059]/30 pb-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#DFBA73] uppercase tracking-wider mb-1">
                    <FileText className="w-4 h-4" /> Protocolo de Autopsia
                  </div>
                  <h1 className="text-2xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] to-[#FFE898]">
                    Flujo 1: Deconstrucción Forense de Providencias
                  </h1>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#170926] border border-[#C5A059]/30">
                    <h3 className="font-cinzel font-bold text-sm text-[#FFE898] mb-1">Paso 1: Carga y Triaje de Expedientes</h3>
                    <p className="text-xs text-slate-300">
                      - <strong>Documento Principal (Obligatorio):</strong> Sentencia, auto o demanda que será objeto del escrutinio.<br />
                      - <strong>Material Probatorio & Contexto (Recomendado):</strong> Pruebas documentales, contratos, peritajes o audios transcritos. El sistema cruzará línea por línea las afirmaciones del fallo contra este acervo.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#170926] border border-[#C5A059]/30">
                    <h3 className="font-cinzel font-bold text-sm text-[#FFE898] mb-1">Paso 2: Concurrencia de Agentes (Bitácora Forense)</h3>
                    <p className="text-xs text-slate-300">
                      Durante 60 a 90 segundos, los agentes procesan el expediente. La consola de telemetría detalla las búsquedas de jurisprudencia en curso y las anomalías normativas detectadas.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#170926] border border-[#C5A059]/30">
                    <h3 className="font-cinzel font-bold text-sm text-[#FFE898] mb-1">Paso 3: Centro de Mando Estratégico</h3>
                    <p className="text-xs text-slate-300">
                      Despliegue interactivo del dictamen con inventario de puntos críticos, fundamentación de recursos y el Asistente de Redacción Procesal.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: WORKFLOW STRATEGY */}
            {activeSection === 'workflow_strategy' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-[#C5A059]/30 pb-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#DFBA73] uppercase tracking-wider mb-1">
                    <Sparkles className="w-4 h-4" /> Concepción de Acciones
                  </div>
                  <h1 className="text-2xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] to-[#FFE898]">
                    Flujo 2: Diseño Estratégico desde Cero
                  </h1>
                </div>

                <p>
                  Cuando un cliente expone una situación jurídica sin proceso iniciado, este flujo estructura la vía procesal idónea:
                </p>

                <ol className="space-y-3 list-decimal pl-5 text-sm">
                  <li>
                    <strong className="text-[#FFE898]">Narración de Hechos:</strong> Ingrese el relato cronológico, fechas clave, sujetos involucrados y pretensiones deseadas.
                  </li>
                  <li>
                    <strong className="text-[#FFE898]">Evaluación de Vías Procesales:</strong> La IA contrasta si corresponde un proceso declarativo, ejecutivo, acción de tutela, medio de control contencioso-administrativo o arbitraje.
                  </li>
                  <li>
                    <strong className="text-[#FFE898]">Selección y Traspaso Automático:</strong> Al seleccionar la estrategia óptima, los hechos se convierten en el documento base para formular el borrador de demanda o petición.
                  </li>
                </ol>
              </div>
            )}

            {/* SECTION 6: SUBSTEPS BREAKDOWN */}
            {activeSection === 'substeps_breakdown' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-[#C5A059]/30 pb-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#DFBA73] uppercase tracking-wider mb-1">
                    <Layers className="w-4 h-4" /> Módulos del Centro de Mando
                  </div>
                  <h1 className="text-2xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] to-[#FFE898]">
                    Sub-Pasos del Informe & Refinamiento
                  </h1>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#170926] border border-[#C5A059]/30">
                    <h3 className="font-cinzel font-bold text-sm text-[#FFE898]">1. Cuadro de Mando de Gobernanza & Revisión</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Dashboard analítico con fuentes jurisprudenciales verificadas, resumen ejecutivo, cronología de hitos procesales y puntos críticos desglosados con severidad.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#170926] border border-[#C5A059]/30">
                    <h3 className="font-cinzel font-bold text-sm text-[#FFE898]">2. Laboratorio de Argumentos (Argument Lab)</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Espacio de experimentación retórica para ajustar el tono del recurso: <em className="text-[#DFBA73]">Formalista-Doctrinal</em>, <em className="text-[#DFBA73]">Constitucional-Garantista</em> o <em className="text-[#DFBA73]">Pragmático-Económico</em>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#170926] border border-[#C5A059]/30">
                    <h3 className="font-cinzel font-bold text-sm text-[#FFE898]">3. Asistente de Borrador Procesal</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Generación del texto completo del memorial estructurado con encabezado formal, hechos, causales de anulación, pretensiones y peticiones probatorias.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#170926] border border-[#C5A059]/30">
                    <h3 className="font-cinzel font-bold text-sm text-[#FFE898]">4. Stress Test del Borrador</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Auditoría adversarial que evalúa la fortaleza lógica de cada acápite del memorial antes de radicar.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#170926] border border-[#C5A059]/30">
                    <h3 className="font-cinzel font-bold text-sm text-[#FFE898]">5. Refinamiento & Exportación DOCX</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Incorporación automática de las mejoras y descarga de un archivo Word profesionalmente diagramado con firmas y citas en formato estándar.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 7: CHAT RAG */}
            {activeSection === 'chat_rag' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-[#C5A059]/30 pb-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#DFBA73] uppercase tracking-wider mb-1">
                    <MessageSquare className="w-4 h-4" /> Memoria Procesal Completa
                  </div>
                  <h1 className="text-2xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] to-[#FFE898]">
                    Consultor Legal RAG & Sparring Adversarial
                  </h1>
                </div>

                <p>
                  El botón flotante o panel acoplable de <strong className="text-[#FFE898]">Consultor IA</strong> tiene acceso directo al expediente virtual completo:
                </p>

                <ul className="space-y-2 list-disc pl-5 text-sm">
                  <li><strong className="text-[#DFBA73]">Texto íntegro de la providencia</strong> subida como documento principal.</li>
                  <li><strong className="text-[#DFBA73]">Texto completo de cada uno de los anexos probatorios</strong> aportados.</li>
                  <li><strong className="text-[#DFBA73]">Hallazgos del consorcio forense</strong> y normas citadas.</li>
                </ul>

                <div className="p-4 rounded-2xl bg-[#170926] border border-[#C5A059]/40 space-y-2">
                  <h3 className="font-cinzel font-bold text-sm text-[#FFE898] flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-400" />
                    Modo Adversario (Simulador de Contraparte)
                  </h3>
                  <p className="text-xs text-slate-300">
                    Active la casilla "Modo Adversario" dentro del chat para que la IA actúe como el apoderado de su contraparte. Le formulará objeciones agresivas para que pueda calibrar sus respuestas orales antes de la audiencia.
                  </p>
                </div>
              </div>
            )}

            {/* SECTION 8: GOVERNANCE & PACKS */}
            {activeSection === 'governance_packs' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-[#C5A059]/30 pb-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#DFBA73] uppercase tracking-wider mb-1">
                    <Globe className="w-4 h-4" /> Adaptabilidad Territorial
                  </div>
                  <h1 className="text-2xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] to-[#FFE898]">
                    Jurisdicciones & Configuración de Portales
                  </h1>
                </div>

                <p>
                  En la cabecera, el botón de <strong className="text-[#FFE898]">Fuero / Configuración</strong> permite cambiar la jurisdicción procesal activa o añadir portales de consulta específicos:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#170926] border border-[#C5A059]/30">
                    <h4 className="font-cinzel font-bold text-[#FFE898] mb-1">🇨🇴 Colombia (CO)</h4>
                    <p className="text-slate-300">CGP (Ley 1564), CPACA (Ley 1437), Código Penal (Ley 599), Código Sustantivo del Trabajo y Jurisprudencia Corte Constitucional / CSJ / Consejo de Estado.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#170926] border border-[#C5A059]/30">
                    <h4 className="font-cinzel font-bold text-[#FFE898] mb-1">🇲🇽 México (MX)</h4>
                    <p className="text-slate-300">Código Nacional de Procedimientos Civiles y Familiares, SCJN Semanario Judicial de la Federación y Ley de Amparo.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#170926] border border-[#C5A059]/30">
                    <h4 className="font-cinzel font-bold text-[#FFE898] mb-1">🇪🇸 España (ES)</h4>
                    <p className="text-slate-300">Ley de Enjuiciamiento Civil (LEC), Tribunal Supremo CENDOJ y Tribunal Constitucional.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#170926] border border-[#C5A059]/30">
                    <h4 className="font-cinzel font-bold text-[#FFE898] mb-1">🇦🇷 Argentina (AR) & 🇨🇱 Chile (CL)</h4>
                    <p className="text-slate-300">CPCCN / Fallos CSJN de Argentina y CPC / Poder Judicial y Tribunal Constitucional de Chile.</p>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 9: SECURITY & ANTI-HALLUCINATION */}
            {activeSection === 'security_antihallucination' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-[#C5A059]/30 pb-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
                    <ShieldCheck className="w-4 h-4" /> Protocolo LAGP V5
                  </div>
                  <h1 className="text-2xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] to-[#FFE898]">
                    Protocolo Anti-Alucinación & Privacidad
                  </h1>
                </div>

                <div className="p-4 rounded-2xl bg-[#0e1d16] border border-emerald-500/40 space-y-2">
                  <h3 className="font-cinzel font-bold text-sm text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Regla de Oro: Prohibición Absoluta de Citas Ficticias
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Todo radicado jurisprudencial (ej. <em>Sentencia T-025/04</em>, <em>Radicado CSJ SC-1234</em>) es validado en vivo contra bases de conocimiento reales. Si una cita no cuenta con fundamento comprobable, el sistema bloquea su inserción en el memorial final.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#170926] border border-[#C5A059]/30 space-y-2">
                  <h3 className="font-cinzel font-bold text-sm text-[#FFE898] flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#DFBA73]" />
                    Secreto Profesional & Soberanía del Dato
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Los expedientes procesados no se utilizan para reentrenar modelos fundacionales. Las sesiones son temporales en el navegador del usuario y pueden reiniciarse en cualquier instante con el botón <strong className="text-[#FFE898]">Nuevo Recurso</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* SECTION 10: FAQ */}
            {activeSection === 'faq' && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-[#C5A059]/30 pb-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#DFBA73] uppercase tracking-wider mb-1">
                    <HelpCircle className="w-4 h-4" /> Respuestas a Dudas Frecuentes
                  </div>
                  <h1 className="text-2xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] to-[#FFE898]">
                    Preguntas Frecuentes (FAQ)
                  </h1>
                </div>

                <div className="space-y-3.5 text-xs">
                  {[
                    {
                      q: '¿Por qué el botón "Iniciar Autopsia Judicial" permanece inactivo?',
                      a: 'Requiere que cargue un Documento Principal y que su estado figure como "Listo". Si hay un archivo extrayendo texto o con error de formato, espere unos segundos o intente con un archivo .pdf, .docx o .txt compatible.'
                    },
                    {
                      q: '¿Qué diferencia hay entre adjuntar pruebas en el Paso 1 vs. usar solo el fallo?',
                      a: 'Subir pruebas permite al "Auditor Probatorio" contrastar lo que el juez afirmó haber valorado contra lo que los documentos demuestran fácticamente, descubriendo defectos fácticos por suposición u omisión probatoria.'
                    },
                    {
                      q: '¿Cómo exporto el borrador final a Microsoft Word?',
                      a: 'En la pestaña "Refinamiento & Síntesis", haga clic en "Exportar a Word (.docx)". Se generará un documento formal con tipografía judicial, saltos de página y estructura procesal lista para firma.'
                    },
                    {
                      q: '¿Puedo personalizar los portales de jurisprudencia consultados?',
                      a: 'Sí. Ingrese a la rueda de configuración en la barra superior (Centro de Configuración y Privacidad), pestaña "Portales", donde podrá activar, desactivar o agregar nuevos enlaces y scrapers institucionales.'
                    }
                  ].map((faq, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#170926] border border-[#C5A059]/30 space-y-1.5">
                      <h4 className="font-cinzel font-bold text-[#FFE898] text-sm flex items-center gap-2">
                        <span>⚖️</span>
                        <span>{faq.q}</span>
                      </h4>
                      <p className="text-slate-300 leading-relaxed pl-6">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </main>
        </div>

        {/* Footer Bar */}
        <footer className="px-6 py-3 bg-[#0d0718] border-t border-[#C5A059]/25 flex items-center justify-between text-xs font-garamond flex-shrink-0">
          <span className="text-slate-400">
            Documentación Técnica Oficial • <strong className="text-[#FFE898] font-cinzel">EX LEGE SOVEREIGN V5</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 bg-gradient-to-r from-[#DFBA73] to-[#C5A059] hover:from-[#FFE898] hover:to-[#DFBA73] text-[#08040d] font-cinzel font-bold rounded-xl shadow-[0_0_15px_rgba(197,160,89,0.3)] transition-all"
          >
            Entendido / Continuar
          </button>
        </footer>

      </div>
    </>
  );
};

export default UserManual;
