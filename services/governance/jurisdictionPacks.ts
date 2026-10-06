/**
 * JURISDICTION PACKS — DYNAMIC ADAPTERS (LAGP V5 - SECCIÓN 25)
 * 
 * Permite que el sistema adapte dinámicamente la jerarquía normativa,
 * las Altas Cortes, las fuentes vinculantes y las reglas procesales según
 * el país detectado en el expediente, manteniendo intacta la gobernanza global.
 */

export interface JurisdictionPack {
    code: string;
    name: string;
    country: string;
    flag: string;
    courtHierarchy: {
        supremeCourt: string;
        constitutionalCourt: string;
        administrativeCourt?: string;
        appellateCourts: string;
        firstInstanceCourts: string;
    };
    sourceHierarchyRanks: string[];
    proceduralCodes: {
        administrative?: string;
        civil?: string;
        penal?: string;
        labor?: string;
        constitutional?: string;
    };
    precedentDoctrine: string;
    keyTerminology: {
        lawsuit: string;
        ruling: string;
        appeal: string;
        protectiveAction: string;
    };
}

export const JURISDICTION_PACKS: Record<string, JurisdictionPack> = {
    CO: {
        code: 'CO',
        name: 'Colombia',
        country: 'Colombia',
        flag: '🇨🇴',
        courtHierarchy: {
            supremeCourt: 'Corte Suprema de Justicia (Salas de Casación Civil, Laboral, Penal)',
            constitutionalCourt: 'Corte Constitucional (Sentencias C, SU, T)',
            administrativeCourt: 'Consejo de Estado (Salas de lo Contencioso Administrativo y Sala Plena)',
            appellateCourts: 'Tribunales Superiores de Distrito Judicial y Tribunales Administrativos',
            firstInstanceCourts: 'Juzgados de Circuito y Municipales / Administrativos'
        },
        sourceHierarchyRanks: [
            '1. Constitución Política & Bloque de Constitucionalidad',
            '2. Leyes Estatutarias y Orgánicas',
            '3. Leyes Ordinarias y Decretos con Fuerza de Ley',
            '4. Decretos Reglamentarios Nacionales',
            '5. Actos Administrativos de Autoridades Seccionales/Locales',
            '6. Jurisprudencia Constitucional de Control Abstracto (Sentencias C)',
            '7. Sentencias de Unificación Jurisprudencial (Corte Constitucional SU, Consejo de Estado)',
            '8. Doctrina Constitucional Vinculante y Precedente Relevante',
            '9. Jurisprudencia Reiterada y Líneas Consolidadas',
            '10. Pronunciamientos Judiciales Aislados',
            '11. Conceptos y Doctrina Administrativa Oficial',
            '12. Doctrina Académica y Criterio Auxiliar',
            '13. Principios Generales del Derecho y Costumbre'
        ],
        proceduralCodes: {
            administrative: 'CPACA (Ley 1437 de 2011, modificada por Ley 2080 de 2021)',
            civil: 'Código General del Proceso (Ley 1564 de 2012)',
            penal: 'Código de Procedimiento Penal (Ley 906 de 2004)',
            labor: 'Código Procesal del Trabajo y de la Seguridad Social',
            constitutional: 'Decreto 2591 de 1991 (Acción de Tutela) y CP art. 86'
        },
        precedentDoctrine: 'Doctrina de precedente vinculante de la Corte Constitucional (Sentencias C y SU) y Sentencias de Unificación del Consejo de Estado como fuente obligatoria para autoridades y jueces.',
        keyTerminology: {
            lawsuit: 'Demanda / Medio de Control',
            ruling: 'Sentencia / Auto Interlocutorio',
            appeal: 'Recurso de Apelación / Reposición',
            protectiveAction: 'Acción de Tutela'
        }
    },
    MX: {
        code: 'MX',
        name: 'México',
        country: 'México',
        flag: '🇲🇽',
        courtHierarchy: {
            supremeCourt: 'Suprema Corte de Justicia de la Nación (SCJN - Pleno y Salas)',
            constitutionalCourt: 'SCJN (Control Concentrado de Constitucionalidad y Convencionalidad)',
            administrativeCourt: 'Tribunal Federal de Justicia Administrativa (TFJA)',
            appellateCourts: 'Plenos Regionales y Tribunales Colegiados de Circuito',
            firstInstanceCourts: 'Juzgados de Distrito y Tribunales Colegiados de Apelación'
        },
        sourceHierarchyRanks: [
            '1. Constitución Política de los Estados Unidos Mexicanos & Tratados de DDHH',
            '2. Tratados Internacionales Ordinarios',
            '3. Leyes Generales, Federales y Reglamentarias',
            '4. Reglamentos Federales y Decretos Presidenciales',
            '5. Leyes y Reglamentos Estatales',
            '6. Jurisprudencia por Precedentes Obligatorios (SCJN Pleno y Salas)',
            '7. Jurisprudencia por Reiteración de Criterios (Tribunales Colegiados)',
            '8. Jurisprudencia por Contradicción de Criterios (Plenos Regionales / SCJN)',
            '9. Tesis Aisladas Publicadas en el Semanario Judicial',
            '10. Doctrina y Criterios Administrativos del SAT / Prodecon',
            '11. Doctrina Jurídica Académica',
            '12. Principios Generales de Derecho'
        ],
        proceduralCodes: {
            administrative: 'Ley Federal de Procedimiento Contencioso Administrativo (LFPCA)',
            civil: 'Código Nacional de Procedimientos Civiles y Familiares (CNPCF)',
            penal: 'Código Nacional de Procedimientos Penales (CNPP)',
            constitutional: 'Ley de Amparo (Reglamentaria de los Arts. 103 y 107 Constitucionales)'
        },
        precedentDoctrine: 'Sistema de Precedentes Obligatorios por votación calificada de la SCJN (Reforma Constitucional 2021) y Jurisprudencia vinculante del Semanario Judicial de la Federación.',
        keyTerminology: {
            lawsuit: 'Demanda de Juicio de Nulidad / Amparo',
            ruling: 'Sentencia Definitiva / Laudo',
            appeal: 'Recurso de Revisión / Queja / Reclamación',
            protectiveAction: 'Juicio de Amparo (Indirecto / Directo)'
        }
    },
    ES: {
        code: 'ES',
        name: 'España',
        country: 'España',
        flag: '🇪🇸',
        courtHierarchy: {
            supremeCourt: 'Tribunal Supremo (Salas de lo Civil, Penal, Contencioso-Administrativo, Social, Militar)',
            constitutionalCourt: 'Tribunal Constitucional (Intérprete supremo de la CE)',
            appellateCourts: 'Audiencia Nacional y Tribunales Superiores de Justicia de las CCAA',
            firstInstanceCourts: 'Audiencias Provinciales y Juzgados de Primera Instancia / Instrucción / Contencioso'
        },
        sourceHierarchyRanks: [
            '1. Constitución Española de 1978 & Derecho de la Unión Europea (Primacía TJUE)',
            '2. Tratados Internacionales Ratificados',
            '3. Leyes Orgánicas',
            '4. Leyes Ordinarias y Reales Decretos-Leyes / Legislativos',
            '5. Reglamentos Estatales (Reales Decretos, Órdenes Ministeriales)',
            '6. Leyes y Reglamentos de Comunidades Autónomas',
            '7. Jurisprudencia del Tribunal Constitucional (STC)',
            '8. Jurisprudencia del Tribunal Supremo (Doctrina reiterada - 2 o más sentencias)',
            '9. Doctrina de Tribunales Superiores de Justicia',
            '10. Costumbre y Principios Generales del Derecho',
            '11. Doctrina de la Dirección General de Seguridad Jurídica y Fe Pública',
            '12. Doctrina Científica'
        ],
        proceduralCodes: {
            administrative: 'Ley 39/2015 del Procedimiento Administrativo Común & Ley 29/1998 (LJCA)',
            civil: 'Ley 1/2000, de Enjuiciamiento Civil (LEC)',
            penal: 'Ley de Enjuiciamiento Criminal (LECrim)',
            labor: 'Ley 36/2011, Reguladora de la Jurisdicción Social (LRJS)',
            constitutional: 'Ley Orgánica 2/1979 del Tribunal Constitucional (LOTC)'
        },
        precedentDoctrine: 'Doctrina legal consolidada del Tribunal Supremo con valor complementario al ordenamiento jurídico (art. 1.6 Código Civil) y vinculación erga omnes de las resoluciones del TC.',
        keyTerminology: {
            lawsuit: 'Demanda Contencioso-Administrativa / Demanda Ordinaria',
            ruling: 'Sentencia / Auto',
            appeal: 'Recurso de Casación / Recurso de Apelación',
            protectiveAction: 'Recurso de Amparo Constitucional'
        }
    },
    AR: {
        code: 'AR',
        name: 'Argentina',
        country: 'Argentina',
        flag: '🇦🇷',
        courtHierarchy: {
            supremeCourt: 'Corte Suprema de Justicia de la Nación (CSJN)',
            constitutionalCourt: 'CSJN (Control difuso de constitucionalidad)',
            appellateCourts: 'Cámaras Nacionales y Federales de Apelaciones',
            firstInstanceCourts: 'Juzgados Nacionales y Federales de Primera Instancia'
        },
        sourceHierarchyRanks: [
            '1. Constitución Nacional & Tratados Internacionales con Jerarquía Constitucional (art. 75 inc. 22)',
            '2. Tratados Internacionales Integracionistas y de Rango Superior a las Leyes',
            '3. Leyes del Congreso de la Nación (Leyes Federales y Comunes)',
            '4. Decretos de Necesidad y Urgencia (DNU) y Decretos Reglamentarios del PEN',
            '5. Resoluciones Ministeriales y Actos Administrativos',
            '6. Constituciones y Leyes Provinciales / CABA',
            '7. Precedentes de la CSJN (Fuerza moral y deber institucional de acatamiento)',
            '8. Fallos Plenarios de Cámaras de Apelaciones',
            '9. Jurisprudencia de Tribunales Inferiores',
            '10. Doctrina de la Procuración del Tesoro de la Nación',
            '11. Doctrina de Autores y Principios Generales del Derecho'
        ],
        proceduralCodes: {
            administrative: 'Ley 19.549 de Procedimientos Administrativos (LNPA)',
            civil: 'Código Procesal Civil y Comercial de la Nación (CPCCN)',
            penal: 'Código Procesal Penal Federal (CPPF)',
            constitutional: 'Ley 16.986 de Acción de Amparo'
        },
        precedentDoctrine: 'Fuerza vinculante institucional de la jurisprudencia de la CSJN como custodio supremo de la Constitución y fuerza obligatoria de fallos plenarios de Cámara.',
        keyTerminology: {
            lawsuit: 'Demanda Ordinaria / Impugnación de Acto Administrativo',
            ruling: 'Sentencia Definitiva / Sentencia Interlocutoria',
            appeal: 'Recurso Extraordinario Federal (REF) / Recurso de Apelación',
            protectiveAction: 'Acción de Amparo / Medida Cautelar Autónoma'
        }
    },
    US: {
        code: 'US',
        name: 'Estados Unidos (Federal & State)',
        country: 'USA',
        flag: '🇺🇸',
        courtHierarchy: {
            supremeCourt: 'Supreme Court of the United States (SCOTUS)',
            constitutionalCourt: 'SCOTUS / Federal District Courts (Judicial Review - Marbury v. Madison)',
            appellateCourts: 'United States Courts of Appeals (13 Circuit Courts)',
            firstInstanceCourts: 'United States District Courts (94 Federal Districts)'
        },
        sourceHierarchyRanks: [
            '1. United States Constitution & Supremacy Clause (Art. VI)',
            '2. Federal Statutes (United States Code - U.S.C.) & Treaties',
            '3. Federal Regulations (Code of Federal Regulations - C.F.R.) & Executive Orders',
            '4. State Constitutions & State Statutes',
            '5. SCOTUS Precedent (Binding Stare Decisis)',
            '6. Circuit Court Precedent (Binding within circuit / Persuasive elsewhere)',
            '7. District Court Decisions (Persuasive authority)',
            '8. State Supreme Court Decisions on State Law Questions',
            '9. Administrative Agency Adjudications & Opinion Letters',
            '10. Restatements of the Law & Legal Treatises'
        ],
        proceduralCodes: {
            civil: 'Federal Rules of Civil Procedure (FRCP)',
            penal: 'Federal Rules of Criminal Procedure (FRCrP)',
            administrative: 'Administrative Procedure Act (APA - 5 U.S.C.)'
        },
        precedentDoctrine: 'Doctrine of Stare Decisis (Vertical binding precedent from higher courts and horizontal precedent adherence). Strict adherence to ratio decidendi and distinction of dicta.',
        keyTerminology: {
            lawsuit: 'Complaint / Motion to Dismiss',
            ruling: 'Judgment / Order / Opinion',
            appeal: 'Notice of Appeal / Petition for Writ of Certiorari',
            protectiveAction: 'Injunction / Temporary Restraining Order (TRO) / Habeas Corpus'
        }
    },
    PE: {
        code: 'PE',
        name: 'Perú',
        country: 'Perú',
        flag: '🇵🇪',
        courtHierarchy: {
            supremeCourt: 'Corte Suprema de Justicia de la República (Salas Civiles, Penales, de Derecho Constitucional y Social)',
            constitutionalCourt: 'Tribunal Constitucional del Perú (Órgano supremo de interpretación y control de constitucionalidad)',
            appellateCourts: 'Cortes Superiores de Justicia (Salas Superiores)',
            firstInstanceCourts: 'Juzgados Especializados y Mixtos / Juzgados de Paz Letrados'
        },
        sourceHierarchyRanks: [
            '1. Constitución Política del Perú de 1993 & Tratados de DDHH',
            '2. Tratados Internacionales Ratificados',
            '3. Leyes Orgánicas y Leyes Ordinarias',
            '4. Decretos Legislativos y Decretos de Urgencia',
            '5. Decretos Supremos y Reglamentos del Poder Ejecutivo',
            '6. Ordenanzas Regionales y Municipales',
            '7. Precedentes Vinculantes del Tribunal Constitucional (STC)',
            '8. Precedentes Judiciales de Plenos Casatorios de la Corte Suprema',
            '9. Jurisprudencia Reiterada y Resoluciones Administrativas',
            '10. Doctrina Jurídica y Costumbre'
        ],
        proceduralCodes: {
            administrative: 'TUO de la Ley 27444 (Ley del Procedimiento Administrativo General)',
            civil: 'Código Procesal Civil (Decreto Legislativo 768)',
            penal: 'Código Procesal Penal (Decreto Legislativo 957)',
            constitutional: 'Nuevo Código Procesal Constitucional (Ley 31307)'
        },
        precedentDoctrine: 'Precedentes vinculantes expedidos por el Tribunal Constitucional y sentencias dictadas en Plenos Casatorios de la Corte Suprema conforme al artículo 400 del CPC.',
        keyTerminology: {
            lawsuit: 'Demanda Contencioso-Administrativa / Demanda Civil',
            ruling: 'Sentencia / Auto / Casación',
            appeal: 'Recurso de Apelación / Recurso de Casación',
            protectiveAction: 'Proceso de Amparo / Hábeas Corpus'
        }
    },
    CL: {
        code: 'CL',
        name: 'Chile',
        country: 'Chile',
        flag: '🇨🇱',
        courtHierarchy: {
            supremeCourt: 'Corte Suprema de Justicia de Chile',
            constitutionalCourt: 'Tribunal Constitucional de Chile (Control preventivo y de inaplicabilidad)',
            appellateCourts: 'Cortes de Apelaciones',
            firstInstanceCourts: 'Juzgados de Letras, Juzgados de Garantía, Tribunales de Juicio Oral en lo Penal'
        },
        sourceHierarchyRanks: [
            '1. Constitución Política de la República de Chile & Tratados de DDHH (art. 5° inc. 2°)',
            '2. Tratados Internacionales Promulgados',
            '3. Leyes Orgánicas Constitucionales y de Quórum Calificado',
            '4. Leyes Ordinarias y Decretos con Fuerza de Ley (DFL)',
            '5. Decretos Supremos y Reglamentos Presidenciales',
            '6. Autos Acordados de la Corte Suprema y Cortes de Apelaciones',
            '7. Sentencias del Tribunal Constitucional (Inaplicabilidad e Inconstitucionalidad)',
            '8. Jurisprudencia Uniforme de la Corte Suprema',
            '9. Dictámenes de la Contraloría General de la República (CGR)',
            '10. Doctrina de los Autores'
        ],
        proceduralCodes: {
            administrative: 'Ley 19.880 (Bases de los Procedimientos Administrativos)',
            civil: 'Código de Procedimiento Civil (CPC)',
            penal: 'Código Procesal Penal (CPP)',
            labor: 'Código del Trabajo (Procedimiento de Tutela Laboral)'
        },
        precedentDoctrine: 'Efecto relativo de las sentencias judiciales (art. 3° Código Civil), con fuerza persuasiva y unificadora mediante el Recurso de Casación en el Fondo de la Corte Suprema.',
        keyTerminology: {
            lawsuit: 'Demanda Ordinaria / Reclamo de Ilegalidad',
            ruling: 'Sentencia Definitiva / Sentencia Interlocutoria',
            appeal: 'Recurso de Apelación / Casación en la Forma y en el Fondo',
            protectiveAction: 'Recurso de Protección / Recurso de Amparo'
        }
    },
    EC: {
        code: 'EC',
        name: 'Ecuador',
        country: 'Ecuador',
        flag: '🇪🇨',
        courtHierarchy: {
            supremeCourt: 'Corte Nacional de Justicia',
            constitutionalCourt: 'Corte Constitucional del Ecuador',
            appellateCourts: 'Cortes Provinciales de Justicia',
            firstInstanceCourts: 'Tribunales y Unidades Judiciales'
        },
        sourceHierarchyRanks: [
            '1. Constitución de la República del Ecuador & Instrumentos Internacionales de DDHH',
            '2. Tratados y Convenios Internacionales',
            '3. Leyes Orgánicas',
            '4. Leyes Ordinarias',
            '5. Normas Regionales y Ordenanzas Distritales / Municipales',
            '6. Decretos y Reglamentos del Ejecutivo',
            '7. Sentencias y Precedentes Vinculantes de la Corte Constitucional',
            '8. Resoluciones con Fuerza de Ley de la Corte Nacional de Justicia (Triple Reiteración)',
            '9. Doctrina Jurídica'
        ],
        proceduralCodes: {
            administrative: 'Código Orgánico Administrativo (COA)',
            civil: 'Código Orgánico General de Procesos (COGEP)',
            penal: 'Código Orgánico Integral Penal (COIP)',
            constitutional: 'Ley Orgánica de Garantías Jurisdiccionales y Control Constitucional (LOGJCC)'
        },
        precedentDoctrine: 'Jurisprudencia vinculante de la Corte Constitucional y resoluciones de jurisprudencia obligatoria de la Corte Nacional de Justicia.',
        keyTerminology: {
            lawsuit: 'Demanda Contencioso-Administrativa / Demanda Ordinaria',
            ruling: 'Sentencia / Auto Resolutorio',
            appeal: 'Recurso de Apelación / Recurso de Casación',
            protectiveAction: 'Acción de Protección / Acción Extraordinaria de Protección'
        }
    },
    GENERIC: {
        code: 'GENERIC',
        name: 'Jurisdicción Universal / Internacional',
        country: 'Internacional / General',
        flag: '🌐',
        courtHierarchy: {
            supremeCourt: 'Corte Suprema o Tribunal de Casación de la Jurisdicción',
            constitutionalCourt: 'Tribunal Constitucional / Corte de Garantías',
            administrativeCourt: 'Tribunal Contencioso-Administrativo o Sala Especializada',
            appellateCourts: 'Cortes o Cámaras de Apelaciones',
            firstInstanceCourts: 'Juzgados de Primera Instancia'
        },
        sourceHierarchyRanks: [
            '1. Norma Constitucional & Tratados Internacionales de Derechos Humanos',
            '2. Tratados Internacionales Ratificados',
            '3. Leyes del Parlamento / Congreso',
            '4. Reglamentos del Poder Ejecutivo',
            '5. Actos Administrativos Generales y Especiales',
            '6. Jurisprudencia del Tribunal Constitucional o Máxima Corte',
            '7. Precedentes Judiciales Vinculantes de Tribunales Superiores',
            '8. Jurisprudencia Reiterada y Consistente',
            '9. Jurisprudencia Aislada',
            '10. Doctrina de Autoridades Administrativas Reguladoras',
            '11. Doctrina de Tratadistas Reconocidos',
            '12. Principios Generales del Derecho y Equidad'
        ],
        proceduralCodes: {
            administrative: 'Código de Procedimiento Administrativo de la Jurisdicción',
            civil: 'Código de Procedimiento Civil',
            penal: 'Código de Procedimiento Penal',
            constitutional: 'Garantías Constitucionales y Mecanismos de Protección'
        },
        precedentDoctrine: 'El precedente de las Altas Cortes orienta la interpretación obligatoria o persuasiva del ordenamiento jurídico según la tradición de derecho civil o común.',
        keyTerminology: {
            lawsuit: 'Demanda / Acción Judicial',
            ruling: 'Sentencia / Resolución Judicial',
            appeal: 'Recurso de Apelación / Alzada / Impugnación',
            protectiveAction: 'Acción Constitucional de Protección / Amparo'
        }
    }
};

/**
 * Servicio para gestionar la persistencia y carga de packs de jurisdicción personalizados.
 */
class JurisdictionRegistryService {
    private customPacks: Record<string, JurisdictionPack> = {};

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const stored = localStorage.getItem('LAGP_CUSTOM_JURISDICTIONS');
                if (stored) {
                    this.customPacks = JSON.parse(stored);
                }
            }
        } catch {
            // Silencioso
        }
    }

    public getAllPacks(): Record<string, JurisdictionPack> {
        return { ...JURISDICTION_PACKS, ...this.customPacks };
    }

    public getPack(code: string): JurisdictionPack | undefined {
        return this.customPacks[code] || JURISDICTION_PACKS[code];
    }

    public saveCustomPack(pack: JurisdictionPack): void {
        this.customPacks[pack.code] = pack;
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem('LAGP_CUSTOM_JURISDICTIONS', JSON.stringify(this.customPacks));
            }
        } catch {
            // Silencioso
        }
    }

    public deleteCustomPack(code: string): boolean {
        if (this.customPacks[code]) {
            delete this.customPacks[code];
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    localStorage.setItem('LAGP_CUSTOM_JURISDICTIONS', JSON.stringify(this.customPacks));
                }
            } catch {}
            return true;
        }
        return false;
    }
}

export const jurisdictionRegistryService = new JurisdictionRegistryService();

/**
 * Resuelve el JurisdictionPack a partir del texto del caso o código.
 */
export const resolveJurisdictionPack = (textOrCode: string): JurisdictionPack => {
    if (!textOrCode) return JURISDICTION_PACKS.GENERIC;
    
    const upper = textOrCode.toUpperCase();
    const allPacks = jurisdictionRegistryService.getAllPacks();

    // Check direct code match first
    if (allPacks[upper]) {
        return allPacks[upper];
    }

    if (upper.includes('COLOMBIA') || upper.includes('CPACA') || upper.includes('CONSEJO DE ESTADO') || upper.includes('TUTELA')) {
        return allPacks.CO || JURISDICTION_PACKS.CO;
    }
    if (upper.includes('MÉXICO') || upper.includes('MEXICO') || upper.includes('SCJN') || upper.includes('AMPARO') || upper.includes('TFJA')) {
        return allPacks.MX || JURISDICTION_PACKS.MX;
    }
    if (upper.includes('ESPAÑA') || upper.includes('ESPANA') || upper.includes('TRIBUNAL SUPREMO') || upper.includes('LJCA') || upper.includes('AUDIENCIA NACIONAL')) {
        return allPacks.ES || JURISDICTION_PACKS.ES;
    }
    if (upper.includes('ARGENTINA') || upper.includes('CSJN') || upper.includes('CPCCN') || upper.includes('PROCURACIÓN DEL TESORO')) {
        return allPacks.AR || JURISDICTION_PACKS.AR;
    }
    if (upper.includes('PERÚ') || upper.includes('PERU') || upper.includes('PLENO CASATORIO') || upper.includes('TRIBUNAL CONSTITUCIONAL DEL PERÚ')) {
        return allPacks.PE || JURISDICTION_PACKS.PE;
    }
    if (upper.includes('CHILE') || upper.includes('CORTE SUPREMA DE CHILE') || upper.includes('RECURSO DE PROTECCIÓN') || upper.includes('CGR')) {
        return allPacks.CL || JURISDICTION_PACKS.CL;
    }
    if (upper.includes('ECUADOR') || upper.includes('COGEP') || upper.includes('COA') || upper.includes('CORTE NACIONAL DE JUSTICIA')) {
        return allPacks.EC || JURISDICTION_PACKS.EC;
    }
    if (upper.includes('ESTADOS UNIDOS') || upper.includes('UNITED STATES') || upper.includes('SCOTUS') || upper.includes('FRCP') || upper.includes('CIRCUIT COURT')) {
        return allPacks.US || JURISDICTION_PACKS.US;
    }

    return allPacks.GENERIC || JURISDICTION_PACKS.GENERIC;
};
