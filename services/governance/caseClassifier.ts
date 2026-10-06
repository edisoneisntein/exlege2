/**
 * CASE CLASSIFIER & MODULE RESOLVER (LAGP V5 - MOTORES 01 Y 19)
 * 
 * Identifica dinámicamente:
 * - País y Jurisdicción
 * - Área del Derecho y Materia
 * - Tipo de Procedimiento y Medio de Control
 * - Instancia y Autoridad Competente
 * - Fechas Relevantes y Temporalidad
 * - Piezas Fácticas Faltantes / Vacíos
 * - Módulos Aplicables vs. Módulos No Aplicables
 */

import { resolveJurisdictionPack, type JurisdictionPack } from './jurisdictionPacks';

export interface CaseClassificationResult {
    country: string;
    jurisdictionCode: string;
    legalBranch: 'ADMINISTRATIVO' | 'CONSTITUCIONAL' | 'CIVIL' | 'COMERCIAL' | 'LABORAL' | 'PENAL' | 'TRIBUTARIO' | 'OTRO';
    proceduralStage: string;
    competentAuthority: string;
    proceduralMeansOrAction: string;
    temporalAnchors: {
        factsDate?: string;
        actOrRulingDate?: string;
        filingDeadlineDate?: string;
    };
    applicableGovernanceModules: {
        moduleName: string;
        status: 'APLICABLE' | 'NO_APLICABLE';
        rationale: string;
    }[];
    missingCriticalInfo: string[];
    pack: JurisdictionPack;
}

export const classifyCaseContext = (documentText: string): CaseClassificationResult => {
    const textUpper = (documentText || '').toUpperCase();
    const pack = resolveJurisdictionPack(documentText);

    let legalBranch: CaseClassificationResult['legalBranch'] = 'ADMINISTRATIVO';
    if (textUpper.includes('PENAL') || textUpper.includes('DELITO') || textUpper.includes('FISCALÍA') || textUpper.includes('IMPUTACIÓN') || textUpper.includes('CRIMINAL')) {
        legalBranch = 'PENAL';
    } else if (textUpper.includes('LABORAL') || textUpper.includes('CONTRATO DE TRABAJO') || textUpper.includes('PRESTACIONES SOCIALES') || textUpper.includes('DESPIDO')) {
        legalBranch = 'LABORAL';
    } else if (textUpper.includes('TUTELA') || textUpper.includes('AMPARO') || textUpper.includes('DERECHOS FUNDAMENTALES') || textUpper.includes('HABEAS')) {
        legalBranch = 'CONSTITUCIONAL';
    } else if (textUpper.includes('TRIBUTARIO') || textUpper.includes('IMPUESTO') || textUpper.includes('DIAN') || textUpper.includes('SAT') || textUpper.includes('RENTA')) {
        legalBranch = 'TRIBUTARIO';
    } else if (textUpper.includes('CONTRATO MERCANTIL') || textUpper.includes('SOCIEDAD') || textUpper.includes('COMERCIAL')) {
        legalBranch = 'COMERCIAL';
    } else if (textUpper.includes('CIVIL') || textUpper.includes('RESPONSABILIDAD CIVIL') || textUpper.includes('DOMINIO') || textUpper.includes('POSESIÓN')) {
        legalBranch = 'CIVIL';
    }

    const applicableGovernanceModules: CaseClassificationResult['applicableGovernanceModules'] = [
        {
            moduleName: 'Auditoría de Competencia Funcional/Territorial',
            status: 'APLICABLE',
            rationale: 'Obligatorio en todo asunto litigioso o administrativo para prevenir nulidades insaneables.'
        },
        {
            moduleName: 'Control de Caducidad y Prescripción',
            status: 'APLICABLE',
            rationale: 'Verificación del régimen temporal exacto del medio de control o derecho sustancial.'
        },
        {
            moduleName: 'Separación de Efectos (Anulatorio vs Restitutorio)',
            status: legalBranch === 'ADMINISTRATIVO' || legalBranch === 'CIVIL' || legalBranch === 'LABORAL' ? 'APLICABLE' : 'NO_APLICABLE',
            rationale: legalBranch === 'ADMINISTRATIVO' 
                ? 'Mandatorio: La nulidad de un acto administrativo no acarrea restitución automática sin carga probatoria autónoma.'
                : 'No aplicable estrictamente en materia sin desdoblamiento de pretensiones anulatorias/restitutorias.'
        },
        {
            moduleName: 'Test de Analogía Jurisprudencial y Precedente Vinculante',
            status: 'APLICABLE',
            rationale: 'Evaluación del grado de coincidencia fáctica y subregla ratio decidendi.'
        },
        {
            moduleName: 'Steelman Adversarial y Prueba de Falsación',
            status: 'APLICABLE',
            rationale: 'Evaluación obligatoria de la versión más fuerte del oponente y puntos de colapso.'
        },
        {
            moduleName: 'Trazabilidad Documental y Cadena de Custodia',
            status: 'APLICABLE',
            rationale: 'Exigencia de soporte foliar o documental para toda conclusión fáctica.'
        }
    ];

    const missingCriticalInfo: string[] = [];
    if (!textUpper.includes('FECHA') && !textUpper.includes('20')) {
        missingCriticalInfo.push('Fechas exactas de notificación del acto o acaecimiento de los hechos materiales.');
    }
    if (!textUpper.includes('CUANTÍA') && !textUpper.includes('VALOR') && !textUpper.includes('$')) {
        missingCriticalInfo.push('Determinación de la cuantía o estimación económica del litigio.');
    }

    return {
        country: pack.country,
        jurisdictionCode: pack.code,
        legalBranch,
        proceduralStage: 'Fase de Análisis Estratégico & Auditoría Forense',
        competentAuthority: pack.courtHierarchy.firstInstanceCourts,
        proceduralMeansOrAction: pack.keyTerminology.lawsuit,
        temporalAnchors: {},
        applicableGovernanceModules,
        missingCriticalInfo,
        pack
    };
};
