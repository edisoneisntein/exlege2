import React, { memo, useState, useMemo, useCallback, useEffect } from 'react';
import { LEGAL_GOVERNANCE_PROTOCOL_V5_SECTIONS, type GovernanceDirectiveSection } from '../../services/governance/legalGovernanceProtocolV5';
import { JURISDICTION_PACKS, resolveJurisdictionPack, type JurisdictionPack } from '../../services/governance/jurisdictionPacks';
import { PortalConfigManager } from './PortalConfigManager';

// =============================================================================
// DOMAIN TYPES & INTERFACES (STRICT READONLY)
// =============================================================================
export type GovernanceTab = 'DIRECTIVES' | 'ENGINES' | 'JURISDICTIONS' | 'PORTALS' | 'BENCHMARKS';
export type GovernanceCategory = 'ALL' | 'FUNDAMENTAL' | 'SECURITY' | 'REASONING' | 'ADVERSARIAL' | 'STRATEGY' | 'QA';

export interface GovernanceDirectivesModalProps {
    readonly isOpen: boolean;
    readonly onClose: () => void;
    readonly currentJurisdiction?: string;
    readonly initialTab?: GovernanceTab;
}

export interface EngineSpec {
    readonly id: string;
    readonly name: string;
    readonly desc: string;
    readonly icon: string;
}

interface IndexedDirectiveSection extends GovernanceDirectiveSection {
    readonly searchCorpus: string;
}

// =============================================================================
// STATIC IMMUTABLE DATA STRUCTURES (ZERO HEAP RE-ALLOCATION)
// =============================================================================
const GOVERNANCE_CATEGORIES: readonly GovernanceCategory[] = [
    'ALL',
    'FUNDAMENTAL',
    'SECURITY',
    'REASONING',
    'ADVERSARIAL',
    'STRATEGY',
    'QA'
] as const;

const ENGINES_DATA: readonly EngineSpec[] = [
    { id: '01', name: 'Case Classifier', desc: 'Identifica país, jurisdicción, materia, tipo de procedimiento, instancia y objetivo procesal.', icon: '🎯' },
    { id: '02', name: 'Evidence Engine', desc: 'Extrae, clasifica y audita hechos, documentos, pruebas, contradicciones y vacíos fácticos.', icon: '📁' },
    { id: '03', name: 'Legal Knowledge Engine', desc: 'Identifica normas, reglamentos, doctrina y fuentes jurídicas aplicables en la fecha del acto.', icon: '⚖️' },
    { id: '04', name: 'Precedent Engine', desc: 'Analiza jurisprudencia, sentencias de unificación, grado de analogía fáctica y ratio decidendi.', icon: '🏛️' },
    { id: '05', name: 'Temporal Validation Engine', desc: 'Verifica vigencia temporal, derogación, inexequibilidad, nulidad y regímenes de transición.', icon: '⏳' },
    { id: '06', name: 'Contradiction Engine', desc: 'Detecta incongruencias fácticas, temporales, normativas, jurisprudenciales e internas.', icon: '⚡' },
    { id: '07', name: 'Adversarial Engine', desc: 'Ejecuta pruebas de falsación popperiana y simulación de steelman bidireccional en 4 turnos.', icon: '⚔️' },
    { id: '08', name: 'Risk Engine', desc: 'Evalúa fortalezas, debilidades, incertidumbres explícitas y riesgos residuales.', icon: '🛡️' },
    { id: '09', name: 'Strategy Engine', desc: 'Construye la arquitectura de tesis principal, tesis subsidiarias 1-4 y excepciones procesales.', icon: '🧭' },
    { id: '10', name: 'Drafting Engine', desc: 'Convierte la estrategia validada en demanda, contestación, recurso o memorial con no sobreafirmación.', icon: '✍️' },
    { id: '11', name: 'Legal QA Engine', desc: 'Audita el producto final en 8 dimensiones y 20 prohibiciones absolutas antes de la entrega.', icon: '✅' }
] as const;

const TAB_CONFIG: readonly { id: GovernanceTab; label: string; icon: string }[] = [
    { id: 'DIRECTIVES', label: '30 Directivas Maestras V5', icon: '📜' },
    { id: 'ENGINES', label: 'Arquitectura de 11 Motores', icon: '⚙️' },
    { id: 'JURISDICTIONS', label: 'Adaptadores Jurisdiccionales Dinámicos', icon: '🌐' },
    { id: 'PORTALS', label: 'Portales Oficiales & Anti-Alucinación', icon: '🌐' },
    { id: 'BENCHMARKS', label: 'Aislamiento de Benchmarks & Casos', icon: '🧪' }
] as const;

// -----------------------------------------------------------------------------
// Pre-computed Normalized Search Index & Fast O(1) Hash Map
// -----------------------------------------------------------------------------
const INDEXED_SECTIONS: readonly IndexedDirectiveSection[] = Array.isArray(LEGAL_GOVERNANCE_PROTOCOL_V5_SECTIONS)
    ? LEGAL_GOVERNANCE_PROTOCOL_V5_SECTIONS.map(sec => ({
        ...sec,
        searchCorpus: `${sec.title} ${sec.summary} ${sec.fullText}`.toLowerCase()
    }))
    : [];

const SECTIONS_BY_ID = new Map<number, IndexedDirectiveSection>(
    INDEXED_SECTIONS.map(sec => [sec.id, sec])
);

const FALLBACK_SECTION: IndexedDirectiveSection = INDEXED_SECTIONS[0] ?? {
    id: 1,
    title: 'Directiva General',
    category: 'FUNDAMENTAL',
    summary: 'Sin resumen disponible.',
    fullText: 'Texto no disponible.',
    enforcementRule: 'Aplicación general.',
    searchCorpus: ''
};

// =============================================================================
// SUB-COMPONENT: Navigation Tabs
// =============================================================================
interface NavigationTabsProps {
    readonly activeTab: GovernanceTab;
    readonly onSelectTab: (tab: GovernanceTab) => void;
}

const NavigationTabs: React.FC<NavigationTabsProps> = memo(({ activeTab, onSelectTab }) => {
    return (
        <div className="px-6 py-3 bg-[#0a0512] border-b border-[#C5A059]/20 flex items-center gap-2 overflow-x-auto text-xs font-cinzel font-bold scrollbar-thin">
            {TAB_CONFIG.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onSelectTab(tab.id)}
                        className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap focus:outline-none ${
                            isActive
                                ? 'bg-gradient-to-r from-[#2a133d] to-[#1a0c2a] text-[#FFE898] border border-[#C5A059] shadow-[0_0_15px_rgba(197,160,89,0.3)] ring-1 ring-[#C5A059]/40'
                                : 'bg-[#12071d]/60 text-slate-400 hover:text-[#DFBA73] hover:bg-[#1a0c2a] border border-[#C5A059]/15'
                        }`}
                        aria-pressed={isActive}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
});
NavigationTabs.displayName = 'NavigationTabs';

// =============================================================================
// SUB-COMPONENT: Directives Tab Content
// =============================================================================
interface DirectivesTabContentProps {
    readonly filteredSections: readonly IndexedDirectiveSection[];
    readonly activeSection: IndexedDirectiveSection;
    readonly activeSectionId: number;
    readonly selectedCategory: GovernanceCategory;
    readonly searchQuery: string;
    readonly totalSectionsCount: number;
    readonly onSelectSection: (id: number) => void;
    readonly onSelectCategory: (category: GovernanceCategory) => void;
    readonly onSearchChange: (query: string) => void;
    readonly onNavigatePrev: () => void;
    readonly onNavigateNext: () => void;
}

const DirectivesTabContent: React.FC<DirectivesTabContentProps> = memo(({
    filteredSections,
    activeSection,
    activeSectionId,
    selectedCategory,
    searchQuery,
    totalSectionsCount,
    onSelectSection,
    onSelectCategory,
    onSearchChange,
    onNavigatePrev,
    onNavigateNext
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            {/* Left List of Sections */}
            <div className="lg:col-span-5 flex flex-col gap-3">
                {/* Search & Category Filter */}
                <div className="space-y-2">
                    <input
                        type="text"
                        placeholder="Buscar directiva (ej. caducidad, steelman, fuentes)..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-[#12071d] border border-[#C5A059]/30 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#C5A059] font-garamond"
                        aria-label="Buscar directiva jurídica"
                    />
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-[11px] font-cinzel font-bold">
                        {GOVERNANCE_CATEGORIES.map(cat => {
                            const isSelected = selectedCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => onSelectCategory(cat)}
                                    className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-colors border ${
                                        isSelected 
                                            ? 'bg-[#C5A059]/25 text-[#FFE898] border-[#C5A059] shadow-sm' 
                                            : 'bg-[#12071d] text-slate-400 hover:text-[#DFBA73] border-[#C5A059]/15 hover:border-[#C5A059]/30'
                                    }`}
                                >
                                    {cat === 'ALL' ? `Todos (${totalSectionsCount})` : cat}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 max-h-[500px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                    {filteredSections.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400 bg-[#12071d]/60 rounded-xl border border-[#C5A059]/20 font-garamond italic">
                            No se encontraron directivas con los criterios especificados.
                        </div>
                    ) : (
                        filteredSections.map(sec => {
                            const isSelected = activeSectionId === sec.id;
                            return (
                                <button
                                    key={sec.id}
                                    type="button"
                                    onClick={() => onSelectSection(sec.id)}
                                    className={`w-full text-left p-3.5 rounded-xl transition-all border ${
                                        isSelected
                                            ? 'bg-gradient-to-br from-[#2a133d] to-[#1a0c2a] border-[#C5A059] shadow-lg ring-1 ring-[#C5A059]/40'
                                            : 'bg-[#12071d]/60 border-[#C5A059]/20 hover:border-[#C5A059]/50 hover:bg-[#1a0c2a]/60'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <span className="text-[10px] font-cinzel font-bold text-[#DFBA73] bg-[#C5A059]/15 px-2 py-0.5 rounded border border-[#C5A059]/30">
                                            DIRECTIVA {sec.id.toString().padStart(2, '0')}
                                        </span>
                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#1a0c2a] text-slate-300 border border-[#C5A059]/15">
                                            {sec.category}
                                        </span>
                                    </div>
                                    <h4 className="text-xs font-cinzel font-bold text-slate-100 truncate">
                                        {sec.title}
                                    </h4>
                                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 font-garamond">
                                        {sec.summary}
                                    </p>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Right Detail Pane */}
            <div className="lg:col-span-7 bg-[#12071d] border border-[#C5A059]/30 rounded-2xl p-6 flex flex-col justify-between court-gold-frame shadow-xl">
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3 border-b border-[#C5A059]/20 pb-4">
                        <div>
                            <span className="text-xs font-cinzel font-bold text-[#DFBA73] uppercase tracking-widest block">
                                SECCIÓN {activeSection.id} DE {totalSectionsCount}
                            </span>
                            <h3 className="text-lg font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] via-[#FFE898] to-[#C5A059] mt-1">
                                {activeSection.title}
                            </h3>
                        </div>
                        <span className="px-3 py-1 text-xs font-cinzel font-bold bg-[#C5A059]/20 text-[#FFE898] rounded-xl border border-[#C5A059]/40 shadow-sm">
                            {activeSection.category}
                        </span>
                    </div>

                    <div>
                        <h4 className="text-xs font-cinzel font-bold text-[#DFBA73] uppercase tracking-wider mb-1.5">
                            Resumen Ejecutivo
                        </h4>
                        <p className="text-sm font-garamond font-medium text-slate-200 leading-relaxed bg-[#0d0718] p-4 rounded-xl border border-[#C5A059]/20">
                            {activeSection.summary}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-xs font-cinzel font-bold text-[#DFBA73] uppercase tracking-wider mb-1.5">
                            Texto Normativo Oficial de la Directiva
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed bg-[#0d0718]/70 p-4 rounded-xl border border-[#C5A059]/20 whitespace-pre-line font-garamond">
                            {activeSection.fullText}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-xs font-cinzel font-bold text-[#FFE898] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <span>⚡</span>
                            <span>Regla de Aplicación & Cumplimiento</span>
                        </h4>
                        <div className="p-3.5 bg-[#1f1508]/60 border border-[#C5A059]/40 rounded-xl text-xs font-garamond font-medium text-amber-200">
                            {activeSection.enforcementRule}
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#C5A059]/20 flex items-center justify-between text-xs text-slate-400 font-garamond">
                    <span className="italic">Directiva Maestra LAGP V5 • Ámbito Transversal</span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={activeSectionId <= 1}
                            onClick={onNavigatePrev}
                            className="px-3.5 py-1.5 bg-[#1a0c2a] hover:bg-[#2a133d] disabled:opacity-40 rounded-xl text-[#DFBA73] font-cinzel font-bold transition-opacity border border-[#C5A059]/25"
                        >
                            Anterior
                        </button>
                        <button
                            type="button"
                            disabled={activeSectionId >= totalSectionsCount}
                            onClick={onNavigateNext}
                            className="px-3.5 py-1.5 bg-[#1a0c2a] hover:bg-[#2a133d] disabled:opacity-40 rounded-xl text-[#DFBA73] font-cinzel font-bold transition-opacity border border-[#C5A059]/25"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});
DirectivesTabContent.displayName = 'DirectivesTabContent';

// =============================================================================
// SUB-COMPONENT: Engines Tab Content
// =============================================================================
const EnginesTabContent: React.FC = memo(() => {
    return (
        <div className="space-y-6">
            <div className="bg-[#12071d] border border-[#C5A059]/30 p-5 rounded-2xl court-gold-frame">
                <h3 className="text-sm font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] to-[#FFE898] mb-1">
                    Arquitectura Modular de 11 Motores Jurídicos (Sección 20)
                </h3>
                <p className="text-xs text-slate-300 font-garamond leading-relaxed">
                    El sistema no comienza redactando; ejecuta un pipeline de 11 motores especializados donde cada fase alimenta a la siguiente con garantías epistemológicas y antifalsación.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ENGINES_DATA.map(eng => (
                    <div key={eng.id} className="bg-[#12071d]/80 border border-[#C5A059]/20 p-5 rounded-2xl space-y-2 hover:border-[#C5A059]/50 transition-all court-gold-frame group">
                        <div className="flex items-center justify-between">
                            <span className="text-2xl">{eng.icon}</span>
                            <span className="text-[10px] font-cinzel font-bold text-[#DFBA73] bg-[#C5A059]/15 px-2 py-0.5 rounded border border-[#C5A059]/30">
                                MOTOR {eng.id}
                            </span>
                        </div>
                        <h4 className="text-sm font-cinzel font-bold text-slate-100 group-hover:text-[#FFE898] transition-colors">{eng.name}</h4>
                        <p className="text-xs text-slate-400 font-garamond leading-relaxed">{eng.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
});
EnginesTabContent.displayName = 'EnginesTabContent';

// =============================================================================
// SUB-COMPONENT: Jurisdictions Tab Content
// =============================================================================
interface JurisdictionsTabContentProps {
    readonly selectedPack: JurisdictionPack;
    readonly previewJurisdiction: string;
    readonly onSelectJurisdiction: (code: string) => void;
}

const JurisdictionsTabContent: React.FC<JurisdictionsTabContentProps> = memo(({
    selectedPack,
    previewJurisdiction,
    onSelectJurisdiction
}) => {
    const packsList = useMemo(() => Object.values(JURISDICTION_PACKS), []);

    return (
        <div className="space-y-6">
            <div className="bg-[#12071d] border border-[#C5A059]/30 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 court-gold-frame">
                <div>
                    <h3 className="text-sm font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] to-[#FFE898] mb-1">
                        Adaptadores Dinámicos de Jurisdicción (Sección 25)
                    </h3>
                    <p className="text-xs text-slate-300 font-garamond">
                        La metodología y rigor son universales; las leyes, Altas Cortes y trámites se adaptan automáticamente al país identificado en el caso.
                    </p>
                </div>

                <div className="flex gap-1.5 bg-[#0d0718] p-1.5 rounded-xl border border-[#C5A059]/25">
                    {packsList.map(p => {
                        const isSelected = previewJurisdiction === p.code;
                        return (
                            <button
                                key={p.code}
                                type="button"
                                onClick={() => onSelectJurisdiction(p.code)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold transition-all flex items-center gap-1.5 border ${
                                    isSelected 
                                        ? 'bg-gradient-to-r from-[#2a133d] to-[#1a0c2a] text-[#FFE898] border-[#C5A059] shadow-[0_0_10px_rgba(197,160,89,0.3)]' 
                                        : 'bg-transparent text-slate-400 hover:text-[#DFBA73] border-transparent'
                                }`}
                            >
                                <span>{p.flag}</span>
                                <span>{p.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#12071d] border border-[#C5A059]/30 p-6 rounded-2xl space-y-4 court-gold-frame">
                    <div className="flex items-center gap-3 border-b border-[#C5A059]/20 pb-4">
                        <span className="text-3xl">{selectedPack.flag}</span>
                        <div>
                            <h4 className="text-sm font-cinzel font-bold text-[#FFE898]">{selectedPack.name} ({selectedPack.code})</h4>
                            <p className="text-xs text-slate-400 font-garamond italic">{selectedPack.precedentDoctrine}</p>
                        </div>
                    </div>

                    <div>
                        <h5 className="text-xs font-cinzel font-bold text-[#DFBA73] uppercase tracking-wider mb-2">
                            Estructura de Altas Cortes y Tribunales
                        </h5>
                        <div className="space-y-2 text-xs text-slate-300 font-garamond">
                            <div className="bg-[#0d0718] p-3 rounded-xl border border-[#C5A059]/20">
                                <span className="font-bold text-[#FFE898]">Corte Suprema / Casación: </span>
                                {selectedPack.courtHierarchy.supremeCourt}
                            </div>
                            <div className="bg-[#0d0718] p-3 rounded-xl border border-[#C5A059]/20">
                                <span className="font-bold text-[#FFE898]">Justicia Constitucional: </span>
                                {selectedPack.courtHierarchy.constitutionalCourt}
                            </div>
                            {selectedPack.courtHierarchy.administrativeCourt && (
                                <div className="bg-[#0d0718] p-3 rounded-xl border border-[#C5A059]/20">
                                    <span className="font-bold text-[#FFE898]">Jurisdicción Administrativa: </span>
                                    {selectedPack.courtHierarchy.administrativeCourt}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h5 className="text-xs font-cinzel font-bold text-[#DFBA73] uppercase tracking-wider mb-2">
                            Códigos y Leyes Procesales Clave
                        </h5>
                        <div className="space-y-2 text-xs text-slate-300 font-garamond">
                            {selectedPack.proceduralCodes.administrative && (
                                <div className="bg-[#0d0718] p-2.5 rounded-xl border border-[#C5A059]/20">
                                    <span className="font-bold text-slate-400">Administrativo: </span>
                                    {selectedPack.proceduralCodes.administrative}
                                </div>
                            )}
                            {selectedPack.proceduralCodes.civil && (
                                <div className="bg-[#0d0718] p-2.5 rounded-xl border border-[#C5A059]/20">
                                    <span className="font-bold text-slate-400">Civil/Comercial: </span>
                                    {selectedPack.proceduralCodes.civil}
                                </div>
                            )}
                            {selectedPack.proceduralCodes.constitutional && (
                                <div className="bg-[#0d0718] p-2.5 rounded-xl border border-[#C5A059]/20">
                                    <span className="font-bold text-slate-400">Garantías Constitucionales: </span>
                                    {selectedPack.proceduralCodes.constitutional}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-[#12071d] border border-[#C5A059]/30 p-6 rounded-2xl space-y-4 court-gold-frame">
                    <h5 className="text-xs font-cinzel font-bold text-[#DFBA73] uppercase tracking-wider">
                        Escala Jerárquica de Fuentes ({selectedPack.sourceHierarchyRanks.length} Rangos Oficiales)
                    </h5>
                    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                        {selectedPack.sourceHierarchyRanks.map((rank, idx) => (
                            <div key={`rank-${idx}`} className="p-3 bg-[#0d0718]/90 border border-[#C5A059]/20 rounded-xl text-xs flex items-center justify-between text-slate-300 font-garamond">
                                <span>{rank}</span>
                                <span className="text-[10px] font-mono text-[#DFBA73] bg-[#C5A059]/15 px-2 py-0.5 rounded border border-[#C5A059]/25">Nivel #{idx + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
});
JurisdictionsTabContent.displayName = 'JurisdictionsTabContent';

// =============================================================================
// SUB-COMPONENT: Benchmarks Tab Content
// =============================================================================
const BenchmarksTabContent: React.FC = memo(() => {
    return (
        <div className="space-y-6">
            <div className="bg-[#12071d] border border-[#C5A059]/30 p-6 rounded-2xl space-y-4 court-gold-frame">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-xl">
                        🛡️
                    </div>
                    <div>
                        <h3 className="text-sm font-cinzel font-bold text-[#FFE898]">
                            Principio de Aislamiento de Casos & Benchmarks (Secciones 3 y 26)
                        </h3>
                        <p className="text-xs text-slate-400 font-garamond">
                            Separación absoluta entre datos de prueba y reglas metodológicas del sistema.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-[#0d0718] border border-[#C5A059]/20 rounded-xl space-y-2">
                        <span className="text-xs font-cinzel font-bold text-emerald-400 block">
                            ✅ Lo que es el Benchmark de Dosquebradas:
                        </span>
                        <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside font-garamond">
                            <li>Un caso de prueba de máxima exigencia analítica y adversarial.</li>
                            <li>Un benchmark para calibrar la detección de vicios y caducidades.</li>
                            <li>Un conjunto de datos de entrada aislado que se evalúa bajo la Directiva V5.</li>
                        </ul>
                    </div>

                    <div className="p-4 bg-[#0d0718] border border-rose-500/30 rounded-xl space-y-2">
                        <span className="text-xs font-cinzel font-bold text-rose-400 block">
                            ❌ Lo que NUNCA es el Benchmark de Dosquebradas:
                        </span>
                        <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside font-garamond">
                            <li>Jamás es una regla general o sesgo previo del sistema.</li>
                            <li>Jamás contamina otros casos de Colombia, México, España u otros países.</li>
                            <li>Jamás genera precedentes internos ficticios ni conclusiones predeterminadas.</li>
                        </ul>
                    </div>
                </div>

                <div className="p-4 bg-[#1f1508]/70 border border-[#C5A059]/40 rounded-xl">
                    <p className="text-xs text-amber-200 leading-relaxed font-garamond font-medium">
                        <strong className="font-cinzel text-[#FFE898]">MANDATO SUPREMO:</strong> La Directiva V5 no obliga al modelo a aplicar siempre los mismos argumentos; obliga al modelo a aplicar siempre el <strong className="text-white">mismo estándar implacable de rigor, verificación y trazabilidad</strong> en cualquier caso del mundo.
                    </p>
                </div>
            </div>
        </div>
    );
});
BenchmarksTabContent.displayName = 'BenchmarksTabContent';

// =============================================================================
// ROOT COMPONENT: GovernanceDirectivesModal
// =============================================================================
export const GovernanceDirectivesModal: React.FC<GovernanceDirectivesModalProps> = memo(({
    isOpen,
    onClose,
    currentJurisdiction = 'CO',
    initialTab = 'DIRECTIVES'
}) => {
    const [selectedCategory, setSelectedCategory] = useState<GovernanceCategory>('ALL');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [activeSectionId, setActiveSectionId] = useState<number>(1);
    const [activeTab, setActiveTab] = useState<GovernanceTab>(initialTab);
    const [previewJurisdiction, setPreviewJurisdiction] = useState<string>(currentJurisdiction);

    useEffect(() => {
        if (isOpen && initialTab) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    // O(1) Pre-indexed Directives Filter using pre-computed search corpus
    const filteredSections = useMemo(() => {
        const queryClean = searchQuery.trim().toLowerCase();
        const isAllCategory = selectedCategory === 'ALL';

        if (!queryClean && isAllCategory) {
            return INDEXED_SECTIONS;
        }

        return INDEXED_SECTIONS.filter(sec => {
            const matchesCategory = isAllCategory || sec.category === selectedCategory;
            if (!matchesCategory) return false;
            if (!queryClean) return true;
            return sec.searchCorpus.includes(queryClean);
        });
    }, [selectedCategory, searchQuery]);

    // O(1) direct Hash Map lookup for active section
    const activeSection = useMemo(() => {
        return SECTIONS_BY_ID.get(activeSectionId) ?? FALLBACK_SECTION;
    }, [activeSectionId]);

    // O(1) dynamic jurisdiction pack resolution with defensive fallback
    const selectedPack = useMemo<JurisdictionPack>(() => {
        return JURISDICTION_PACKS[previewJurisdiction] ?? resolveJurisdictionPack(previewJurisdiction) ?? JURISDICTION_PACKS.CO;
    }, [previewJurisdiction]);

    // Handlers memoized with useCallback
    const handleSelectSection = useCallback((id: number) => {
        setActiveSectionId(id);
    }, []);

    const handleSelectCategory = useCallback((cat: GovernanceCategory) => {
        setSelectedCategory(cat);
    }, []);

    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const handleNavigatePrev = useCallback(() => {
        setActiveSectionId(prev => Math.max(1, prev - 1));
    }, []);

    const handleNavigateNext = useCallback(() => {
        setActiveSectionId(prev => Math.min(INDEXED_SECTIONS.length, prev + 1));
    }, []);

    const handleSelectTab = useCallback((tab: GovernanceTab) => {
        setActiveTab(tab);
    }, []);

    const handleSelectJurisdiction = useCallback((code: string) => {
        setPreviewJurisdiction(code);
    }, []);

    if (!isOpen) return null;

    return (
        <div 
            id="governance-directives-modal-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040207]/85 backdrop-blur-md animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="governance-modal-title"
        >
            <div className="bg-[#0d0718] border border-[#C5A059]/40 w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-slate-100 court-gold-frame">
                {/* Modal Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-[#12071d] via-[#1f0e30] to-[#12071d] border-b border-[#C5A059]/25 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#2a133d] border border-[#C5A059]/40 flex items-center justify-center text-xl shadow-md">
                            🏛️
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-cinzel font-bold text-[#DFBA73] bg-[#C5A059]/15 px-2.5 py-0.5 rounded border border-[#C5A059]/30">
                                    LAGP V5
                                </span>
                                <h2 id="governance-modal-title" className="text-lg font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] via-[#FFE898] to-[#C5A059] tracking-wide">
                                    Directiva Maestra Global de Gobernanza Jurídica
                                </h2>
                            </div>
                            <p className="text-xs text-slate-400 font-garamond italic">
                                Política permanente de razonamiento, verificación, estrategia y control de calidad procesal transversal.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-[#DFBA73] hover:text-[#FFE898] bg-[#12071d] hover:bg-[#2a133d] rounded-xl border border-[#C5A059]/30 transition-all focus:outline-none"
                        aria-label="Cerrar modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation Tabs */}
                <NavigationTabs activeTab={activeTab} onSelectTab={handleSelectTab} />

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin bg-[#08040d]/60">
                    {activeTab === 'DIRECTIVES' && (
                        <DirectivesTabContent
                            filteredSections={filteredSections}
                            activeSection={activeSection}
                            activeSectionId={activeSectionId}
                            selectedCategory={selectedCategory}
                            searchQuery={searchQuery}
                            totalSectionsCount={INDEXED_SECTIONS.length}
                            onSelectSection={handleSelectSection}
                            onSelectCategory={handleSelectCategory}
                            onSearchChange={handleSearchChange}
                            onNavigatePrev={handleNavigatePrev}
                            onNavigateNext={handleNavigateNext}
                        />
                    )}

                    {activeTab === 'ENGINES' && <EnginesTabContent />}

                    {activeTab === 'JURISDICTIONS' && (
                        <JurisdictionsTabContent
                            selectedPack={selectedPack}
                            previewJurisdiction={previewJurisdiction}
                            onSelectJurisdiction={handleSelectJurisdiction}
                        />
                    )}

                    {activeTab === 'BENCHMARKS' && <BenchmarksTabContent />}

                    {activeTab === 'PORTALS' && (
                        <div className="space-y-4">
                            <PortalConfigManager />
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-[#0a0512] border-t border-[#C5A059]/20 flex items-center justify-between font-garamond">
                    <span className="text-xs text-slate-400 italic">
                        Legal AI Governance Protocol V5 • Directiva Maestra Global
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 bg-gradient-to-r from-[#DFBA73] to-[#C5A059] hover:from-[#FFE898] hover:to-[#DFBA73] text-[#08040d] font-cinzel font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(197,160,89,0.3)] transition-all focus:outline-none"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
});

GovernanceDirectivesModal.displayName = 'GovernanceDirectivesModal';

