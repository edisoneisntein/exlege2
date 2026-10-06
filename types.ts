import type React from 'react';

export type AppWorkflow = 'upload' | 'design' | 'comparative';
export type AIPersonality = 'BALANCED' | 'SOCRATIC' | 'RHETORICAL';
export type EvidenceType = 'DOCUMENT' | 'IMAGE' | 'WEB_SEARCH';
export type CaseDocumentType = 'RULING' | 'LAWSUIT' | 'ANSWER' | 'OTHER';
export type Jurisdiction = 'CO' | 'GENERIC';
export type ReportSubStep = 'review' | 'governance' | 'lab' | 'draft' | 'stress_test' | 'refine';

/**
 * Representa una anotación hecha por un miembro del equipo en un punto crítico.
 */
export interface Annotation {
  id: string;
  author: string; // e.g., 'Dr. Ana Reyes'
  text: string;
  timestamp: string; // ISO string
}

/**
 * Representa un archivo adjunto cargado por el usuario, con su texto extraído y estado.
 */
export interface Attachment {
  /** Nombre del archivo. */
  name: string;
  /** Tamaño del archivo en bytes. */
  size: number;
  /** Tipo MIME del archivo. */
  type: string;
  /** Indica si es el documento principal del caso. */
  isPrimary: boolean;
  /** El texto extraído del archivo por el procesador de documentos. */
  extractedText?: string;
  /** El estado actual del procesamiento del archivo. */
  status?: 'processing' | 'ready' | 'error';
  /** Mensaje de error si el procesamiento falló. */
  error?: string;
  /** El tipo de evidencia que representa el archivo. */
  evidenceType: EvidenceType;
  /** El texto traducido del archivo, si se realizó la traducción. */
  translatedText?: string;
  /** Etiquetas asignadas por el usuario para la gestión de evidencia. */
  tags?: string[];
}

/**
 * Representa una fuente de información encontrada durante una búsqueda web.
 */
export interface GroundingSource {
  /** El título de la página web. */
  title: string;
  /** La URI (URL) de la fuente. */
  uri: string;
}

/**
 * Análisis ofensivo de un punto crítico para encontrar su vulnerabilidad fundamental.
 */
export interface FracturePointAnalysis {
    /** La tesis central y contundente que puede demoler el argumento o fallo. */
    fracturePointThesis: string;
    /** El principio jurídico fundamental que se viola de forma grave. */
    underlyingPrinciple: string;
    /** La implicación estratégica que causa el colapso de la estructura lógica del oponente. */
    strategicImplication: string;
}

/**
 * Representa el análisis socrático de un punto crítico, enfocado en el contra-argumento.
 */
export interface SocraticAnalysis {
  /** El contra-argumento más fuerte posible contra el punto analizado. */
  counterArgument: string;
  /** La debilidad específica que el contra-argumento explota. */
  identifiedWeakness: string;
  /** Recomendación estratégica para fortalecer el punto original contra este ataque. */
  strategicRecommendation: string;
}

/**
 * Representa un contra-argumento anticipado y su defensa jurisprudencial.
 */
export interface JurisprudentialShieldingItem {
    /** El contra-argumento más probable que la oposición podría usar. */
    anticipatedAttack: string;
    /** El precedente jurisprudencial y la estrategia para neutralizar el ataque. */
    defensivePrecedent: string;
}

export type ConfidenceLevel = 'A' | 'B' | 'C' | 'D' | 'X';
export type SeverityLevel = 'CRÍTICA' | 'ALTA' | 'MEDIA' | 'BAJA';
export type VerificationStatus = 'VERIFICADA' | 'PARCIALMENTE_VERIFICADA' | 'NO_VERIFICADA';
export type DecisionLevel = 'Confirmado' | 'Probable' | 'Controvertido' | 'Insuficientemente_probado' | 'Contradictorio' | 'No_evaluable';
export type AnalogyGrade = 'Alto' | 'Medio' | 'Bajo';

export type LegalSourceRank = 
  | 'Constitucional imperativa'
  | 'Ley'
  | 'Reglamento'
  | 'Precedente constitucional vinculante'
  | 'Sentencia de unificación aplicable'
  | 'Precedente judicial vinculante en el caso'
  | 'Jurisprudencia reiterada persuasiva'
  | 'Jurisprudencia aislada'
  | 'Doctrina administrativa'
  | 'Doctrina académica'
  | 'Constitución'
  | 'Reglamentos'
  | 'Jurisprudencia Constitucional'
  | 'Sentencias de Unificación'
  | 'Precedente Vinculante'
  | 'Jurisprudencia Reiterada'
  | 'Doctrina';

export interface LegalHierarchyItem {
  sourceType: LegalSourceRank | string;
  citation: string;
  legalStrength: string; // Fuerza Jurídica explícita
  temporalValidity: string; // Validación de vigencia temporal al momento del acto
}

export interface PrecedentApplicabilityItem {
  sourceType: LegalSourceRank | string;
  citation: string;
  legalStrength: string; // Fuerza Jurídica explícita
  temporalValidity: string; // Vigencia al momento de los hechos
  analogyGrade: AnalogyGrade; // Grado de analogía (Alto / Medio / Bajo)
  comparableFacts: string; // Hechos comparables del precedente vs. caso concreto
  applicableRatio: string; // Ratio decidendi directamente aplicable
  keyDifferences: string; // Distingos y diferencias fácticas/procesales
}

export interface FourLevelDecomposition {
  verifiedFact: string; // 1. Hecho Verificado (Evidencia incontrovertible del expediente)
  applicableNorm: string; // 2. Norma Aplicable (Disposición legal y vigencia temporal)
  inference: string; // 3. Inferencia Lógica (Puente deductivo riguroso que conecta hecho y norma)
  legalConclusion: string; // 4. Conclusión Jurídica (Consecuencia normativa forzosa)
}

export interface DecompositionMatrix {
  verifiedFact: string; // Hecho Verificado (Evidencia del expediente)
  inference: string; // Inferencia (Deducción lógica razonable)
  legalConclusion: string; // Conclusión Jurídica (Consecuencia normativa)
}

export interface TraceabilityChain {
  conclusion: string; // Conclusión jurídica
  argument: string; // Argumento o cargo
  normOrPrecedent: string; // Norma o precedente vinculante
  fact: string; // Hecho verificado
  sourceDocumentAndFolio: string; // Documento, folio, página o acápite
}

export interface BidirectionalSteelman {
  counterpartBestArgument: string; // A. Mejor versión del argumento del oponente/juzgador
  defenseResponse: string; // B. Mejor respuesta posible de la defensa
  counterpartReplica: string; // C. Mejor réplica esperada de la contraparte
  defenseFinalResponse: string; // D. Respuesta final incontestable de la defensa
  prevailingPartyReasoning: string; // Evaluación objetiva de quién prevalece y por qué
}

export interface SubsidiaryDefenseStrategy {
  mainThesis: string; // Tesis principal de defensa / impugnación
  subsidiaryTheses: string[]; // Rutas subsidiarias ordenadas (Subsidiaria 1, 2, 3...)
  residualRisk: string; // Evaluación del riesgo residual
}

export interface LegalContradiction {
  id: string;
  category: 'Interna' | 'Normativa' | 'Jurisprudencial' | 'Probatoria';
  sources: string[]; // Documentos, testimonios, normas o fallos en colisión
  conflictDescription: string; // Descripción del choque fáctico o normativo
  resolvingCriterion: string; // Criterio legal/hermenéutico para resolver la contradicción
  strategicImpact: string; // Impacto en la estrategia del litigio
}

export interface EffectSeparation {
  annulmentEffect: string; // Efecto Anulatorio (ilegalidad del acto)
  restitutionEffect: string; // Efecto Restitutorio (patrimonial / restablecimiento)
  evidentiaryBurden: string; // Carga probatoria individualizada
}

export interface StressTestItem {
  counterArgumentSimulation: string;
  defenseResponse: string;
}

export interface ResidualRiskAndRollback {
  residualRisk: string;
  rollbackPlan: string;
}

export interface PreFlightAudit {
  verificationGate?: VerificationStatus; // Semáforo de seguridad: 🟢 VERIFICADA | 🟡 PARCIALMENTE_VERIFICADA | 🔴 NO_VERIFICADA
  functionalCompetenceReview: string; // Revisión obligatoria de competencia funcional del juzgador
  documentGaps: string[]; // Vacíos documentales
  logicalContradictions: string[]; // Contradicciones lógicas
  unverifiedSections: string[]; // Secciones marcadas como 'NO VERIFICADA: Información insuficiente'
  proceduralTermsAudit: string; // Validación de caducidad y términos
}

export interface IntermediateProductsStatus {
  preFlightAuditCompleted: boolean;
  factsMatrixCompleted: boolean;
  lapseAndExpirationChecked: boolean;
  nullityVsRestitutionSeparated: boolean;
  stressTestsExecuted: boolean;
  riskMapGenerated: boolean;
  confidenceMatrixAssigned: boolean;
  temporalValidityVerified: boolean;
  steelmanConstructed: boolean;
  remediationStepsDefined: boolean;
  summaryText: string;
}

/**
 * Representa una vulnerabilidad, error o inconsistencia identificada en un documento.
 */
export interface CriticalPoint {
  /** Un ID único para ser usado en las keys de React. */
  id: string;
  /** Título técnico del hallazgo */
  title?: string;
  /** Semáforo de verificación de 3 estados (V5 Safety Gate) */
  verificationStatus?: VerificationStatus;
  /** Nivel de Decisión Probatoria / Jurídica (V5) */
  decisionLevel?: DecisionLevel;
  /** Nivel de severidad técnica */
  severity?: SeverityLevel;
  /** Categoría del vicio o problema */
  category?: string;
  /** El tipo de vicio o error, clasificado según un catálogo predefinido. */
  type: string;
  /** La cita literal del documento que evidencia el error. */
  excerpt: string;
  /** Evidencia Observada & Problema Técnico (in judicando / in procedendo). */
  observedEvidenceAndTechnicalProblem?: string;
  /** Causa Raíz & Objetivo Técnico. */
  rootCauseAndTechnicalObjective?: string;
  /** Estrategia de Remediación & Acciones Técnicas Paso a Paso. */
  remediationStrategyAndSteps?: string[];
  /** Separación de Efectos: Anulatorio vs Restitutorio con carga probatoria individualizada. */
  effectSeparation?: EffectSeparation;
  /** Descomposición en 4 Niveles: Hecho → Norma → Inferencia → Conclusión (V5). */
  fourLevelDecomposition?: FourLevelDecomposition;
  /** Matriz de Descomposición en 3 niveles (retrocompatibilidad). */
  decompositionMatrix?: DecompositionMatrix;
  /** Matriz de Aplicabilidad de Precedentes con Grado de Analogía (V5). */
  precedentApplicabilityMatrix?: PrecedentApplicabilityItem[];
  /** Trazabilidad Forense Completa: Conclusión → Argumento → Norma → Hecho → Folio (V5). */
  traceabilityChain?: TraceabilityChain;
  /** Steelman Bidireccional con simulación adversarial completa (V5). */
  bidirectionalSteelman?: BidirectionalSteelman;
  /** Estrategia de Defensa Subsidiaria / Rutas Alternativas (V5). */
  subsidiaryDefenseStrategy?: SubsidiaryDefenseStrategy;
  /** Prueba de Falsación (distinguiendo contradicción activa vs falta de respaldo). */
  falsationTest?: string;
  /** Steelman de la Contraparte (retrocompatibilidad). */
  steelmanCounterpart?: string;
  /** Matriz de Confianza (A: Documental directa, B: Evidencia+inferencia, C: Plausible, D: No verificada, X: No evaluable). */
  confidenceLevel?: ConfidenceLevel;
  /** Jerarquía y Fuerza Jurídica con Validación de Vigencia Temporal. */
  legalHierarchyAndStrength?: LegalHierarchyItem[];
  /** Impacto Arquitectónico & Criterios de Aceptación. */
  architecturalImpactAndAcceptanceCriteria?: string;
  /** Stress Test: Simulación de contra-argumentos y respuesta de la defensa. */
  stressTest?: StressTestItem;
  /** Riesgo Residual & Plan de Rollback (retrocompatibilidad). */
  residualRiskAndRollbackPlan?: ResidualRiskAndRollback;
  /** Esfuerzo Estimado. */
  estimatedEffort?: string;
  /** El análisis técnico-jurídico profundo de la vulnerabilidad. */
  analysis: string;
  /** El contra-argumento legal sugerido para atacar este punto débil. */
  suggestedArgument: string;
  /** Citas de jurisprudencia colombiana que refuerzan el argumento. */
  jurisprudenceReinforcement: string;
  /** El argumento reescrito con un enfoque retórico para máxima persuasión. */
  rhetoricalPolish: string;
  /** Preguntas incisivas sugeridas para un interrogatorio o escrito. */
  interrogationLines: string[];
  /** Líneas de investigación o pruebas adicionales sugeridas para fortalecer el punto. */
  contextualResearch: string[];
  /** El análisis ofensivo 'Punto de Fractura' para este hallazgo. */
  fracturePointAnalysis?: FracturePointAnalysis;
  /** El análisis defensivo 'Blindaje Jurisprudencial' para este hallazgo. */
  jurisprudentialShielding?: JurisprudentialShieldingItem[];
  /** Anotaciones colaborativas del equipo legal. */
  annotations?: Annotation[];
}

/**
 * Representa una inconsistencia encontrada entre el documento principal y las pruebas.
 */
export interface EvidentiaryInconsistency {
    /** Un ID único para ser usado en las keys de React. */
    id: string;
    /** La afirmación fáctica realizada en el documento principal. */
    claimInDocument: string;
    /** El extracto de la prueba que contradice o desvirtúa la afirmación. */
    contradictoryEvidenceExcerpt: string;
    /** El nombre del archivo de prueba que contiene el extracto. */
    evidenceFileName: string;
    /** El análisis de la IA explicando la naturaleza de la inconsistencia (contradicción, falta de soporte, etc.). */
    analysis: string;
}

/**
 * Representa un actor clave (stakeholder) en la narrativa del caso.
 */
export interface Stakeholder {
    /** Nombre del actor o entidad. */
    actor: string;
    /** El rol que juega en la narrativa del caso. */
    role: string;
    /** Los intereses explícitos o aparentes del actor. */
    visibleInterests: string;
    /** Hipótesis sobre los intereses ocultos o motivaciones del actor. */
    hiddenInterests: string;
}

/**
 * Contiene el análisis de la narrativa subyacente del caso y sus actores.
 */
export interface NarrativeAnalysis {
  /** La historia que el documento cuenta, sus valores y el marco que establece. */
  inferredStory: string;
  /** El perfil psicológico y jurídico inferido del autor del documento (ej. un juez). */
  decisionMakerProfile: string;
  /** Un análisis de los actores clave involucrados en el caso. */
  stakeholderAnalysis: Stakeholder[];
}

/**
 * Representa una teoría del caso alternativa que reinterpreta los hechos.
 */
export interface AlternativeTheory {
    /** Un título evocador para la teoría. */
    title: string;
    /** Descripción detallada de la nueva narrativa y cómo reinterpreta los hechos. */
    description: string;
    /** La fuerza o viabilidad estimada de la teoría. */
    strength: 'High' | 'Medium' | 'Low';
}

/**
 * Representa el análisis predictivo simulado sobre el caso.
 */
export interface PredictiveAnalysis {
  estimatedSuccessProbability: number; // 0 to 100
  keyFrictionPoints: {
    criticalPointId: string;
    criticalPointType: string;
    reason: string;
  }[];
  strategicRecommendation: string;
}

/**
 * El informe consolidado final que contiene todos los hallazgos del análisis.
 */
export interface AnalysisReport {
  /** Versión del protocolo de gobernanza (ej. 'V5 - Legal Adversarial Governance Protocol') */
  governanceProtocolVersion?: string;
  /** Jurisdicción o fuero nacional detectado (ej. 'CO', 'MX', 'ES', 'AR', 'US', 'GENERIC') */
  jurisdiction?: string;
  /** Resumen estratégico del caso, ideal para una introducción de un escrito. */
  caseOverview: string;
  /** Auditoría de Consistencia Pre-Flight y revisión de competencia funcional */
  preFlightAudit?: PreFlightAudit;
  /** Estado de los 10 productos intermedios obligatorios */
  intermediateProductsStatus?: IntermediateProductsStatus;
  /** Matriz de Contradicciones Forenses (V5 Contradiction Engine) */
  legalContradictions?: LegalContradiction[];
  /** El análisis de la narrativa y los actores del caso. */
  narrativeAnalysis: NarrativeAnalysis;
  /** Un conjunto de teorías alternativas del caso propuestas por la IA. */
  alternativeTheories: AlternativeTheory[];
  /** La lista completa de puntos críticos (vulnerabilidades) encontrados. */
  criticalPoints: CriticalPoint[];
  /** La lista de contradicciones o faltas de soporte entre el documento y las pruebas. */
  evidentiaryInconsistencies?: EvidentiaryInconsistency[];
  /** Las fuentes web utilizadas si se realizó una búsqueda. */
  groundingSources?: GroundingSource[];
  /** La línea de tiempo de los eventos clave del caso. */
  timeline?: TimelineEvent[];
}

/**
 * La respuesta cruda del modelo de IA para el análisis integral.
 */
export interface IntegralAnalysisResponse {
  governanceProtocolVersion?: string;
  caseOverview: string;
  preFlightAudit?: PreFlightAudit;
  intermediateProductsStatus?: IntermediateProductsStatus;
  legalContradictions?: LegalContradiction[];
  narrativeAnalysis: NarrativeAnalysis;
  alternativeTheories: AlternativeTheory[];
  criticalPoints: Omit<CriticalPoint, 'id' | 'socraticAnalysis' | 'fracturePointAnalysis' | 'jurisprudentialShielding'>[];
  /** Indica si la IA cree que hay más puntos críticos por encontrar en análisis subsecuentes. */
  hasMoreCriticalPoints?: boolean;
}

/**
 * La respuesta de la IA para un análisis de 'Punto de Fractura'.
 */
export interface FracturePointResponseItem {
    /** El ID del punto crítico original al que corresponde este análisis. */
    criticalPointId: string;
    /** El análisis de 'Punto de Fractura' resultante. */
    fracturePointAnalysis: FracturePointAnalysis;
}

/**
 * La respuesta de la IA para un análisis de 'Blindaje Jurisprudencial'.
 */
export interface JurisprudentialShieldingResponseItem {
    /** El ID del punto crítico original al que corresponde este análisis. */
    criticalPointId: string;
    /** El análisis de 'Blindaje Jurisprudencial' resultante. */
    jurisprudentialShielding: JurisprudentialShieldingItem[];
}

/**
 * La respuesta de la IA para un análisis de 'Inconsistencia Probatoria'.
 */
export interface EvidentiaryInconsistencyResponseItem {
    /** El análisis de 'Inconsistencia Probatoria' resultante. */
    inconsistencies: Omit<EvidentiaryInconsistency, 'id'>[];
}


/**
 * Representa un único mensaje dentro de una sesión de chat con la IA.
 */
export interface ChatMessage {
  /** Un ID único para el mensaje. */
  id: string;
  /** El rol que envía el mensaje. */
  speaker: 'user' | 'ia' | 'system';
  /** El contenido de texto del mensaje. */
  text: string;
  /** Indica si el mensaje del modelo todavía se está generando (streaming). */
  isStreaming?: boolean;
}

/**
 * El objeto completo que encapsula todo el resultado de un análisis,
 * incluyendo el informe, los textos originales y la configuración.
 */
export interface FullAnalysisResult {
  /** El informe de análisis final y consolidado. */
  report: AnalysisReport;
  /** El tipo de documento principal analizado. */
  documentType: CaseDocumentType;
  /** El texto completo del documento principal. */
  primaryDocumentText: string;
  /** Una lista de los textos de las evidencias adjuntas. */
  evidenceTexts: { name: string; text: string }[];
  /** La personalidad de IA utilizada para el análisis. */
  aiPersonality: AIPersonality;
  /** La respuesta cruda original del primer análisis de la IA. */
  integralAnalysisResponse: IntegralAnalysisResponse;
  /** Todos los adjuntos originales con sus metadatos, incluyendo etiquetas. */
  allAttachments: Attachment[];
}

// Types for real-time analysis progress
export type AgentStatus = 'PENDIENTE' | 'TRABAJANDO' | 'COMPLETADO' | 'FALLO';

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

/**
 * Métricas de rendimiento del proceso de análisis.
 */
export interface AnalysisMetrics {
  /** Tiempo transcurrido desde el inicio del análisis (formato mm:ss). */
  elapsedTime: string;
  /** Número estimado de páginas de texto procesadas. */
  processedPages: number;
  /** Estimación del tiempo que le tomaría a un humano realizar un análisis similar. */
  humanTimeEstimate: string;
  /** Número de conexiones lógicas que la IA está estableciendo (simulado). */
  logicalConnections: string;
  /** El número total de hallazgos o puntos críticos encontrados. */
  findingsCount: number;
}


export interface AnalysisProgress {
  agentId?: string;
  status?: AgentStatus;
  log: string;
  isFinal?: boolean; // Marks the final update containing the result
  result?: IntegralAnalysisResponse; // Payload on final update
  error?: string; // Payload on error
  phase?: 1 | 2;
  findingsCount?: number;
}

/**
 * Representa un resultado de análisis guardado en la caché (IndexedDB).
 */
export interface CachedAnalysisResult {
    /** La clave de hash única para esta configuración de análisis. */
    cacheKey: string;
    /** La marca de tiempo de cuándo se guardó el resultado. */
    timestamp: number;
    /** El resultado completo del análisis. */
    result: FullAnalysisResult;
}

/**
 * Representa una propuesta de acción legal generada por la IA.
 */
export interface LegalActionProposal {
    /** El título de la acción legal (ej. 'Acción de Tutela'). */
    titulo: string;
    /** Breve descripción de la acción y su aplicabilidad. */
    descripcion: string;
    /** Lista de ventajas estratégicas de esta acción. */
    ventajas: string[];
    /** Lista de posibles riesgos o desafíos. */
    riesgos: string[];
    /** El tipo de documento principal que se necesitaría para esta acción. */
    tipo_documento_sugerido: CaseDocumentType;
}

/**
 * Representa el análisis de un argumento específico proporcionado por el usuario.
 */
export interface ArgumentAnalysis {
    /** Una puntuación de 1 a 10 sobre la solidez del argumento. */
    solidityScore: number;
    /** La justificación de la puntuación de solidez. */
    solidityReasoning: string;
    /** Una lista de posibles contra-argumentos de la oposición. */
    identifiedCounterArguments: {
        counterArgument: string;
        rebuttalStrategy: string;
    }[];
    /** Jurisprudencia que apoya o debilita el argumento. */
    supportiveJurisprudence: string;
    /** Sugerencias para mejorar la persuasión retórica del argumento. */
    rhetoricalSuggestions: string[];
}

/** El estado de la interacción con el juez simulado. */
export type JudgeStatus = 'IDLE' | 'CONNECTING' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR';

/** Una entrada única en la transcripción de la interacción con el juez simulado. */
export interface JudgeTranscriptEntry {
    id: string;
    speaker: 'user' | 'judge';
    text: string;
    isFinal: boolean;
}

export type JudgePersonality = 'EQUILIBRADO' | 'GARANTISTA' | 'FORMALISTA' | 'PUNITIVISTA';

/**
 * Representa la orden del usuario para refinar una sección del borrador.
 */
export interface RefinementMotion {
  insightText: string;
  linkedCriticalPointId: string;
  refinementInstruction: string;
}

/**
 * Representa la propuesta de la IA para enmendar el borrador.
 */
export interface AmendmentProposal {
  originalText: string;
  proposedText: string;
  justification: string;
}


// --- SPEECH RECOGNITION POLYFILL & TYPES ---
export interface SpeechRecognitionAlternative { transcript: string; confidence: number; }
export interface SpeechRecognitionResult { readonly length: number; item(index: number): SpeechRecognitionAlternative;[index: number]: SpeechRecognitionAlternative; isFinal: boolean; }
export interface SpeechRecognitionResultList { readonly length: number; item(index: number): SpeechRecognitionResult;[index: number]: SpeechRecognitionResult; }
export interface SpeechRecognitionEvent extends Event { readonly resultIndex: number; readonly results: SpeechRecognitionResultList; }
export interface SpeechRecognitionErrorEvent extends Event { readonly error: string; readonly message: string; }
export interface SpeechRecognition extends EventTarget { continuous: boolean; interimResults: boolean; lang: string; start(): void; stop(): void; abort(): void; onresult: (event: SpeechRecognitionEvent) => void; onerror: (event: SpeechRecognitionErrorEvent) => void; onend: (() => void) | null; }
export interface SpeechRecognitionStatic { new(): SpeechRecognition; }

/**
 * Representa un único hallazgo en el análisis comparativo.
 */
export interface ComparativeFinding {
    id: string;
    /** La afirmación o hecho extraído del Documento A. */
    claimInDocA: string;
    /** La afirmación o hecho extraído del Documento B (si aplica). */
    claimInDocB?: string;
    /** El análisis de la IA sobre la coincidencia, discrepancia o falta de respuesta. */
    analysis: string;
}

/**
 * El informe consolidado del análisis comparativo.
 */
export interface ComparativeAnalysisReport {
    /** Hechos en los que ambos documentos coinciden. */
    agreedFacts: Omit<ComparativeFinding, 'id'>[];
    /** Hechos o afirmaciones en las que los documentos discrepan. */
    disputedFacts: Omit<ComparativeFinding, 'id'>[];
    /** Argumentos del Documento A que no fueron abordados en el Documento B. */
    unansweredArguments: Omit<ComparativeFinding, 'id'>[];
}

/**
 * Representa un evento en la línea de tiempo del caso.
 */
export interface TimelineEvent {
    id: string;
    /** Fecha del evento, idealmente en formato YYYY-MM-DD. */
    date: string;
    /** Descripción concisa del evento. */
    description: string;
    /** Nombre del archivo de donde se extrajo el evento. */
    source: string;
}

export interface TimelineExtractionResponse {
    events: Omit<TimelineEvent, 'id'>[];
}

/**
 * Configuración de selectores DOM y parámetros para orquestación y scraping de portales judiciales.
 * Garantiza exactitud y previene alucinaciones fácticas y normativas.
 */
export interface PortalConfig {
    name: string;
    display_name: string;
    base_url: string;
    fecha_desde_selector?: string;
    fecha_hasta_selector?: string;
    fecha_format?: string;
    btn_buscar_selector?: string;
    tabla_resultados_selector?: string;
    fila_resultado_selector?: string;
    btn_descargar_selector?: string;
    query_input_selector?: string;
    radicado_selector?: string;
    jurisdiction?: string;
    country?: string;
    description?: string;
    is_active?: boolean;
    verification_mode?: 'SCRAPING_SELECTOR' | 'DIRECT_API' | 'OFFICIAL_SEARCH' | 'SYNTHETIC_VERIFIER';
    api_endpoint?: string;
    custom_headers?: Record<string, string>;
}
