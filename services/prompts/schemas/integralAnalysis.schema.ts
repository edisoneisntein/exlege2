import { Type } from "@google/genai";

const CRITICAL_POINTS_SCHEMA_DEFINITION = {
    type: Type.ARRAY,
    description: "Lista de hallazgos forenses estructurados según el PROTOCOLO V5 DE GOBERNANZA JURÍDICA ADVERSARIAL (LAGP). Cada hallazgo debe cumplir con la totalidad de los campos requeridos.",
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "Título técnico y preciso del hallazgo o vulnerabilidad procesal/sustancial." },
            verificationStatus: { 
                type: Type.STRING, 
                enum: ["VERIFICADA", "PARCIALMENTE_VERIFICADA", "NO_VERIFICADA"], 
                description: "Semáforo de Seguridad (Safety Gate): VERIFICADA (🟢 evidencia suficiente), PARCIALMENTE_VERIFICADA (🟡 falta una pieza), NO_VERIFICADA (🔴 información insuficiente; queda bloqueada de afirmaciones categóricas)." 
            },
            decisionLevel: {
                type: Type.STRING,
                enum: ["Confirmado", "Probable", "Controvertido", "Insuficientemente_probado", "Contradictorio", "No_evaluable"],
                description: "Nivel de Decisión Probatoria y Jurídica del punto."
            },
            severity: { type: Type.STRING, enum: ["CRÍTICA", "ALTA", "MEDIA", "BAJA"], description: "Nivel de severidad técnica del hallazgo." },
            category: { type: Type.STRING, description: "Categoría del error (ej. 'Vicio de Competencia', 'Error In Procedendo', 'Falsa Motivación', 'Defecto Fáctico', 'Indebida Valoración Probatoria', 'Infracción Directa de la Ley')." },
            type: { type: Type.STRING, description: "Tipo de vicio o error judicial CLASIFICADO ESTRICTAMENTE según el catálogo (ej: 'Vicios Procesales: Violación del debido proceso', 'Defecto Fáctico: Omisión o indebida valoración probatoria', 'Defecto Sustantivo: Aplicación indebida de norma')." },
            excerpt: { type: Type.STRING, description: "Cita LITERAL y EXACTA del expediente/fallo que evidencia el vicio. Si la información es insuficiente, marcar: 'NO VERIFICADA: Información insuficiente para auditar esta sección'." },
            observedEvidenceAndTechnicalProblem: { type: Type.STRING, description: "Evidencia Observada & Problema Técnico (in judicando o in procedendo) con detalle analítico." },
            rootCauseAndTechnicalObjective: { type: Type.STRING, description: "Causa Raíz que originó el error y Objetivo Técnico de defensa procesal." },
            remediationStrategyAndSteps: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }, 
                description: "Estrategia de Remediación & Acciones Técnicas Paso a Paso para subsanar, impugnar o nulificar el acto." 
            },
            effectSeparation: {
                type: Type.OBJECT,
                properties: {
                    annulmentEffect: { type: Type.STRING, description: "Efecto Anulatorio: Demostración de ilegalidad e invalidez procesal/sustancial del acto." },
                    restitutionEffect: { type: Type.STRING, description: "Efecto Restitutorio: Dimensión patrimonial, indemnizatoria o restablecimiento del derecho." },
                    evidentiaryBurden: { type: Type.STRING, description: "Carga probatoria individualizada requerida para cada uno de los efectos." }
                },
                required: ["annulmentEffect", "restitutionEffect", "evidentiaryBurden"]
            },
            fourLevelDecomposition: {
                type: Type.OBJECT,
                properties: {
                    verifiedFact: { type: Type.STRING, description: "1. Hecho Verificado: Evidencia fáctica incontrovertible extraída de los documentos del expediente." },
                    applicableNorm: { type: Type.STRING, description: "2. Norma Aplicable: Disposición legal y precepto vigente al momento exacto de los hechos." },
                    inference: { type: Type.STRING, description: "3. Inferencia Lógica: Puente deductivo riguroso que conecta el hecho con la norma." },
                    legalConclusion: { type: Type.STRING, description: "4. Conclusión Jurídica: Consecuencia jurídica forzosa y precisa." }
                },
                required: ["verifiedFact", "applicableNorm", "inference", "legalConclusion"]
            },
            decompositionMatrix: {
                type: Type.OBJECT,
                properties: {
                    verifiedFact: { type: Type.STRING, description: "Hecho Verificado: Evidencia concreta e incontrovertible del expediente." },
                    inference: { type: Type.STRING, description: "Inferencia: Deducción lógica rigurosa y razonable a partir del hecho." },
                    legalConclusion: { type: Type.STRING, description: "Conclusión Jurídica: Consecuencia normativa forzosa." }
                },
                required: ["verifiedFact", "inference", "legalConclusion"]
            },
            precedentApplicabilityMatrix: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        sourceType: { 
                            type: Type.STRING, 
                            enum: [
                                "Constitucional imperativa",
                                "Ley",
                                "Reglamento",
                                "Precedente constitucional vinculante",
                                "Sentencia de unificación aplicable",
                                "Precedente judicial vinculante en el caso",
                                "Jurisprudencia reiterada persuasiva",
                                "Jurisprudencia aislada",
                                "Doctrina administrativa",
                                "Doctrina académica"
                            ], 
                            description: "Escala precisa de jerarquía y fuerza vinculante." 
                        },
                        citation: { type: Type.STRING, description: "Cita y radicado exacto y verificable de la fuente (PROHIBIDO INVENTAR RADICADOS)." },
                        legalStrength: { type: Type.STRING, description: "Fuerza Jurídica explícita (ej. 'Imperativa Erga Omnes', 'Precedente Inter Partes Obligatorio', 'Criterio Auxiliar Persuasivo')." },
                        temporalValidity: { type: Type.STRING, description: "Validación de vigencia temporal al momento del acto." },
                        analogyGrade: { type: Type.STRING, enum: ["Alto", "Medio", "Bajo"], description: "Grado de analogía fáctica y procesal entre el precedente y el caso concreto." },
                        comparableFacts: { type: Type.STRING, description: "Hechos comparables entre el precedente y el caso." },
                        applicableRatio: { type: Type.STRING, description: "Ratio decidendi directamente aplicable." },
                        keyDifferences: { type: Type.STRING, description: "Diferencias fácticas, procesales o distingos relevantes." }
                    },
                    required: ["sourceType", "citation", "legalStrength", "temporalValidity", "analogyGrade", "comparableFacts", "applicableRatio", "keyDifferences"]
                },
                description: "Matriz de Aplicabilidad de Precedentes: valida vigencia, fuerza, analogía y ratio decidendi."
            },
            traceabilityChain: {
                type: Type.OBJECT,
                properties: {
                    conclusion: { type: Type.STRING, description: "Conclusión Jurídica final auditada." },
                    argument: { type: Type.STRING, description: "Argumento técnico-jurídico articulado." },
                    normOrPrecedent: { type: Type.STRING, description: "Norma legal o precedente con vigencia validada." },
                    fact: { type: Type.STRING, description: "Hecho probado que sostiene el argumento." },
                    sourceDocumentAndFolio: { type: Type.STRING, description: "Documento exacto, folio, página o acápite de donde surge la prueba." }
                },
                required: ["conclusion", "argument", "normOrPrecedent", "fact", "sourceDocumentAndFolio"]
            },
            falsationTest: { type: Type.STRING, description: "Prueba de Falsación: Identificación rigurosa de qué prueba, norma o argumento destruiría esta tesis, distinguiendo explícitamente entre evidencia contradictoria vs. falta de respaldo probatorio." },
            bidirectionalSteelman: {
                type: Type.OBJECT,
                properties: {
                    counterpartBestArgument: { type: Type.STRING, description: "A. Mejor versión del argumento del oponente/juzgador." },
                    defenseResponse: { type: Type.STRING, description: "B. Mejor respuesta posible de la defensa." },
                    counterpartReplica: { type: Type.STRING, description: "C. Mejor réplica esperada de la contraparte." },
                    defenseFinalResponse: { type: Type.STRING, description: "D. Respuesta final incontestable de la defensa." },
                    prevailingPartyReasoning: { type: Type.STRING, description: "¿Quién gana este punto en litigio adversarial y por qué razones jurídicas precisas?" }
                },
                required: ["counterpartBestArgument", "defenseResponse", "counterpartReplica", "defenseFinalResponse", "prevailingPartyReasoning"]
            },
            subsidiaryDefenseStrategy: {
                type: Type.OBJECT,
                properties: {
                    mainThesis: { type: Type.STRING, description: "Tesis principal de defensa/impugnación." },
                    subsidiaryTheses: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING }, 
                        description: "Rutas subsidiarias de defensa ordenadas (ej. 'Subsidiaria 1: Caducidad/prescripción', 'Subsidiaria 2: Improcedencia de restitución', 'Subsidiaria 3: Individualización de sumas', 'Subsidiaria 4: Efectos ex nunc hacia el futuro')." 
                    },
                    residualRisk: { type: Type.STRING, description: "Evaluación del riesgo residual remanente si la tesis principal decae." }
                },
                required: ["mainThesis", "subsidiaryTheses", "residualRisk"]
            },
            steelmanCounterpart: { type: Type.STRING, description: "Steelman de la Contraparte: La versión más robusta y persuasiva posible del argumento de la contraparte/juez, seguida de su demolición técnica." },
            confidenceLevel: { type: Type.STRING, enum: ["A", "B", "C", "D", "X"], description: "Matriz de Confianza: A=Documental directa, B=Evidencia suficiente + inferencia razonable, C=Plausible pero controvertible, D=Hipótesis no verificada, X=No evaluable." },
            legalHierarchyAndStrength: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        sourceType: { type: Type.STRING, description: "Clasificación en la jerarquía normativa." },
                        citation: { type: Type.STRING, description: "Cita exacta de la norma o sentencia (Radicado/Número)." },
                        legalStrength: { type: Type.STRING, description: "Fuerza Jurídica explícita (ej. 'Constitucional imperativa', 'Precedente vinculante', 'Jurisprudencia persuasiva')." },
                        temporalValidity: { type: Type.STRING, description: "Validación de vigencia temporal con respecto a la fecha del acto." }
                    },
                    required: ["sourceType", "citation", "legalStrength", "temporalValidity"]
                },
                description: "Fuentes jurídicas ordenadas por jerarquía con fuerza jurídica explícita y validación temporal."
            },
            architecturalImpactAndAcceptanceCriteria: { type: Type.STRING, description: "Impacto Arquitectónico en la teoría global del caso y Criterios de Aceptación procesal para dar por subsanado o ganado el punto." },
            stressTest: {
                type: Type.OBJECT,
                properties: {
                    counterArgumentSimulation: { type: Type.STRING, description: "Simulación de contra-argumento más agresivo de la contraparte o tribunal." },
                    defenseResponse: { type: Type.STRING, description: "Respuesta de contra-ataque táctico y jurisprudencial de la defensa." }
                },
                required: ["counterArgumentSimulation", "defenseResponse"]
            },
            residualRiskAndRollbackPlan: {
                type: Type.OBJECT,
                properties: {
                    residualRisk: { type: Type.STRING, description: "Evaluación del riesgo residual remanente si la tesis es desestimada." },
                    rollbackPlan: { type: Type.STRING, description: "Ruta subsidiaria de contingencia inmediata." }
                },
                required: ["residualRisk", "rollbackPlan"]
            },
            estimatedEffort: { type: Type.STRING, description: "Esfuerzo técnico y probatorio estimado para sustentar este punto (ej. 'Bajo: Sustentación en derecho', 'Medio: Exige peritaje contable', 'Alto: Requiere pruebas testimoniales complejas')." },
            analysis: { type: Type.STRING, description: "Análisis técnico-jurídico profundo y exhaustivo de la vulnerabilidad." },
            suggestedArgument: { type: Type.STRING, description: "El cargo o argumento central estructurado para el recurso o memorial." },
            jurisprudenceReinforcement: { type: Type.STRING, description: "Citas de jurisprudencia relevante con su fuerza vinculante identificada." },
            rhetoricalPolish: { type: Type.STRING, description: "El argumento pulido con máxima contundencia, rigor expositivo y persuasión técnica." },
            interrogationLines: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Preguntas técnicas incisivas para confrontar a la contraparte, peritos o juzgador." },
            contextualResearch: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Líneas de investigación o pruebas adicionales sugeridas." }
        },
        required: [
            "title",
            "verificationStatus",
            "decisionLevel",
            "severity",
            "category",
            "type",
            "excerpt",
            "observedEvidenceAndTechnicalProblem",
            "rootCauseAndTechnicalObjective",
            "remediationStrategyAndSteps",
            "effectSeparation",
            "fourLevelDecomposition",
            "decompositionMatrix",
            "precedentApplicabilityMatrix",
            "traceabilityChain",
            "falsationTest",
            "bidirectionalSteelman",
            "subsidiaryDefenseStrategy",
            "confidenceLevel",
            "architecturalImpactAndAcceptanceCriteria",
            "analysis",
            "suggestedArgument",
            "jurisprudenceReinforcement",
            "rhetoricalPolish",
            "interrogationLines",
            "contextualResearch"
        ]
    }
};

export const INTEGRAL_ANALYSIS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        governanceProtocolVersion: {
            type: Type.STRING,
            description: "Versión del protocolo: 'V5 - Legal Adversarial Governance Protocol (LAGP)'."
        },
        caseOverview: {
            type: Type.STRING,
            description: "Introducción estratégica y concisa de alta precisión jurídica, resumiendo el diagnóstico central del expediente y la tesis soberana de defensa."
        },
        preFlightAudit: {
            type: Type.OBJECT,
            properties: {
                verificationGate: { 
                    type: Type.STRING, 
                    enum: ["VERIFICADA", "PARCIALMENTE_VERIFICADA", "NO_VERIFICADA"], 
                    description: "Semáforo global de verificación de seguridad: VERIFICADA (🟢), PARCIALMENTE_VERIFICADA (🟡), NO_VERIFICADA (🔴)." 
                },
                functionalCompetenceReview: { type: Type.STRING, description: "Revisión obligatoria y exhaustiva de la competencia funcional y territorial del juzgador o autoridad emisora." },
                documentGaps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de vacíos documentales o piezas probatorias esenciales faltantes en el expediente." },
                logicalContradictions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Contradicciones lógicas detectadas en la motivación o en las pretensiones." },
                unverifiedSections: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Secciones o aspectos marcados como 'NO VERIFICADA: Información insuficiente para auditar esta sección'." },
                proceduralTermsAudit: { type: Type.STRING, description: "Auditoría estricta de caducidad, prescripción, tempestividad y términos procesales preclusivos." }
            },
            required: ["verificationGate", "functionalCompetenceReview", "documentGaps", "logicalContradictions", "unverifiedSections", "proceduralTermsAudit"]
        },
        intermediateProductsStatus: {
            type: Type.OBJECT,
            properties: {
                preFlightAuditCompleted: { type: Type.BOOLEAN, description: "true si la auditoría pre-flight fue ejecutada íntegramente." },
                factsMatrixCompleted: { type: Type.BOOLEAN, description: "true si la matriz de hechos e inferencias en 4 niveles fue descompuesta." },
                lapseAndExpirationChecked: { type: Type.BOOLEAN, description: "true si se verificó la caducidad y prescripción." },
                nullityVsRestitutionSeparated: { type: Type.BOOLEAN, description: "true si se diferenciaron los efectos anulatorios de los restitutorios." },
                stressTestsExecuted: { type: Type.BOOLEAN, description: "true si se aplicaron los stress tests y steelman bidireccional." },
                riskMapGenerated: { type: Type.BOOLEAN, description: "true si las rutas subsidiarias de defensa fueron calculadas." },
                confidenceMatrixAssigned: { type: Type.BOOLEAN, description: "true si cada conclusión tiene su grado de confianza A-X y semáforo de verificación." },
                temporalValidityVerified: { type: Type.BOOLEAN, description: "true si toda norma y precedente fue validada en vigencia temporal y analogía." },
                steelmanConstructed: { type: Type.BOOLEAN, description: "true si se construyó la simulación adversarial bidireccional." },
                remediationStepsDefined: { type: Type.BOOLEAN, description: "true si se detalló la ruta de remediación técnica paso a paso." },
                summaryText: { type: Type.STRING, description: "Resumen técnico de validación de los productos intermedios de gobernanza V5." }
            },
            required: [
                "preFlightAuditCompleted",
                "factsMatrixCompleted",
                "lapseAndExpirationChecked",
                "nullityVsRestitutionSeparated",
                "stressTestsExecuted",
                "riskMapGenerated",
                "confidenceMatrixAssigned",
                "temporalValidityVerified",
                "steelmanConstructed",
                "remediationStepsDefined",
                "summaryText"
            ]
        },
        legalContradictions: {
            type: Type.ARRAY,
            description: "Matriz de Contradicciones Forenses (V5 Contradiction Engine): Detecta contradicciones internas, normativas, jurisprudenciales y probatorias.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "ID único de la contradicción (ej. 'CONT-01')." },
                    category: { type: Type.STRING, enum: ["Interna", "Normativa", "Jurisprudencial", "Probatoria"], description: "Categoría de la contradicción." },
                    sources: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Documentos, testimonios, normas o fallos en colisión." },
                    conflictDescription: { type: Type.STRING, description: "Descripción analítica y precisa del choque fáctico o normativo." },
                    resolvingCriterion: { type: Type.STRING, description: "Criterio legal/hermenéutico para resolver la contradicción a favor de la tesis." },
                    strategicImpact: { type: Type.STRING, description: "Impacto procesal y estratégico en el litigio." }
                },
                required: ["id", "category", "sources", "conflictDescription", "resolvingCriterion", "strategicImpact"]
            }
        },
        narrativeAnalysis: {
            type: Type.OBJECT,
            properties: {
                inferredStory: { type: Type.STRING, description: "Análisis profundo de la narrativa del caso: la historia que cuenta, los valores que invoca y el marco que establece." },
                decisionMakerProfile: { type: Type.STRING, description: "Perfil psicológico y jurídico inferido de la autoridad/juez, sesgos cognitivos e inclinaciones interpretativas." },
                stakeholderAnalysis: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            actor: { type: Type.STRING, description: "Nombre del actor o entidad." },
                            role: { type: Type.STRING, description: "Rol en la narrativa del caso." },
                            visibleInterests: { type: Type.STRING, description: "Intereses explícitos o aparentes." },
                            hiddenInterests: { type: Type.STRING, description: "Posibles intereses ocultos o motivaciones secundarias." }
                        },
                        required: ["actor", "role", "visibleInterests", "hiddenInterests"]
                    }
                }
            },
            required: ["inferredStory", "decisionMakerProfile", "stakeholderAnalysis"]
        },
        alternativeTheories: {
            type: Type.ARRAY,
            description: "2 o 3 teorías del caso alternativas y de alta sofisticación técnica.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "Título técnico y evocador de la teoría alternativa." },
                    description: { type: Type.STRING, description: "Descripción detallada de la reinterpretación de hechos, pruebas y consecuencias normativas." },
                    strength: { type: Type.STRING, enum: ["High", "Medium", "Low"], description: "Fuerza o viabilidad técnica estimada." }
                },
                required: ["title", "description", "strength"]
            }
        },
        criticalPoints: {
            ...CRITICAL_POINTS_SCHEMA_DEFINITION,
            description: "Lista forense de vulnerabilidades identificadas bajo el Protocolo V5 de Gobernanza Jurídica Adversarial (LAGP)."
        },
        hasMoreCriticalPoints: {
            type: Type.BOOLEAN,
            description: "Indica si existen más vulnerabilidades por analizar más allá de las devueltas. 'true' si hay más, 'false' si se agotó el análisis."
        }
    },
    required: ["governanceProtocolVersion", "caseOverview", "preFlightAudit", "intermediateProductsStatus", "legalContradictions", "narrativeAnalysis", "alternativeTheories", "criticalPoints", "hasMoreCriticalPoints"]
};

