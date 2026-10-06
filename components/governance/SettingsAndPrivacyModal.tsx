import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useAnalysis } from '../../context/AnalysisContext';
import { portalRegistryService, type PortalConfig, type PortalVerificationResult } from '../../services/governance/portalConfig';
import { jurisdictionRegistryService, resolveJurisdictionPack, type JurisdictionPack } from '../../services/governance/jurisdictionPacks';
import { LEGAL_GOVERNANCE_PROTOCOL_V5_SECTIONS, type GovernanceDirectiveSection } from '../../services/governance/legalGovernanceProtocolV5';
import type { ConfigModalTab } from '../../hooks/useUIState';

interface SettingsAndPrivacyModalProps {
    readonly isOpen: boolean;
    readonly onClose: () => void;
    readonly initialTab?: ConfigModalTab;
}

// --- SUBCOMPONENTES MEMOIZADOS ---

interface PortalsTabProps {
    readonly portals: Readonly<Record<string, PortalConfig>>;
    readonly selectedPortalKey: string;
    readonly isCreatingPortal: boolean;
    readonly formData: PortalConfig;
    readonly onSelectPortal: (key: string) => void;
    readonly onStartCreatePortal: () => void;
    readonly onSavePortal: (e: React.FormEvent) => void;
    readonly onTogglePortalActive: (name: string, e: React.MouseEvent) => void;
    readonly onExportPortals: () => void;
    readonly onFieldChange: (field: keyof PortalConfig, value: string) => void;
    readonly testQuery: string;
    readonly onTestQueryChange: (query: string) => void;
    readonly testResult: PortalVerificationResult | null;
    readonly isTesting: boolean;
    readonly onRunVerificationTest: () => void;
}

const PortalsTab = memo(({
    portals,
    selectedPortalKey,
    isCreatingPortal,
    formData,
    onSelectPortal,
    onStartCreatePortal,
    onSavePortal,
    onTogglePortalActive,
    onExportPortals,
    onFieldChange,
    testQuery,
    onTestQueryChange,
    testResult,
    isTesting,
    onRunVerificationTest
}: PortalsTabProps) => (
    <div className="space-y-6">
        <div className="bg-[#12071d] border border-[#C5A059]/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 court-gold-frame">
            <div>
                <h3 className="text-sm font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] to-[#FFE898] flex items-center gap-2">
                    <span>🛡️</span>
                    <span>Escudo Anti-Alucinación Epistémico (PortalConfig Engine)</span>
                </h3>
                <p className="text-xs text-slate-300 font-garamond mt-1 max-w-3xl leading-relaxed">
                    Configure los portales de jurisprudencia y radicados de cualquier país mediante selectores DOM, URLs base o endpoints API. Toda cita legal y número de radicado se coteja contra estos portales antes de la validación final.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onExportPortals}
                    className="px-3.5 py-2 bg-[#0d0718] hover:bg-[#2a133d] text-[#DFBA73] hover:text-[#FFE898] border border-[#C5A059]/30 rounded-xl text-xs font-cinzel font-bold transition-all flex items-center gap-1.5"
                >
                    <span>📋</span>
                    <span>Importar / Exportar JSON</span>
                </button>
                <button
                    type="button"
                    onClick={onStartCreatePortal}
                    className="px-4 py-2 bg-gradient-to-r from-[#DFBA73] to-[#C5A059] hover:from-[#FFE898] hover:to-[#DFBA73] text-[#08040d] rounded-xl text-xs font-cinzel font-bold transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(197,160,89,0.3)]"
                >
                    <span>+</span>
                    <span>Nuevo Portal</span>
                </button>
            </div>
        </div>

        {/* Portals list selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(portals).map(([key, p]) => {
                const isSelected = selectedPortalKey === key && !isCreatingPortal;
                return (
                    <div
                        key={key}
                        onClick={() => onSelectPortal(key)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between court-gold-frame ${
                            isSelected 
                                ? 'bg-gradient-to-r from-[#2a133d] to-[#1a0c2a] border-[#C5A059] shadow-[0_0_15px_rgba(197,160,89,0.3)]' 
                                : 'bg-[#12071d]/70 border-[#C5A059]/20 hover:border-[#C5A059]/40 hover:bg-[#12071d]'
                        }`}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <span className="text-[10px] font-cinzel uppercase px-2 py-0.5 rounded bg-[#0d0718] text-[#DFBA73] border border-[#C5A059]/25 font-bold">
                                    {p.country || p.jurisdiction || 'GLOBAL'}
                                </span>
                                <h4 className="text-xs font-cinzel font-bold text-slate-100 truncate mt-1.5">
                                    {p.display_name}
                                </h4>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => onTogglePortalActive(key, e)}
                                title={p.is_active ? 'Portal activo' : 'Portal pausado'}
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${p.is_active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-[#0d0718] text-slate-500 border border-slate-700'}`}
                            >
                                {p.is_active ? '✓' : '—'}
                            </button>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate mt-2">
                            {p.base_url}
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Portal Editor & Live Test Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Configuration Form */}
            <div className="lg:col-span-7 bg-[#12071d] border border-[#C5A059]/30 rounded-2xl p-6 space-y-4 court-gold-frame">
                <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-3">
                    <span className="text-xs font-cinzel font-bold text-[#FFE898] uppercase tracking-wider">
                        {isCreatingPortal ? '➕ Crear Nuevo Portal Judicial' : `⚙️ Configuración: ${formData.display_name}`}
                    </span>
                    <span className="text-[10px] font-mono bg-[#0d0718] px-2.5 py-1 rounded-lg text-[#DFBA73] border border-[#C5A059]/25">
                        Modo: {formData.verification_mode || 'SCRAPING_SELECTOR'}
                    </span>
                </div>

                <form onSubmit={onSavePortal} className="space-y-3.5 text-xs font-garamond">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[#DFBA73] font-cinzel font-bold mb-1 text-[11px]">Nombre Clave (name)</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => onFieldChange('name', e.target.value)}
                                className="w-full bg-[#0d0718] border border-[#C5A059]/30 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-[#C5A059] focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[#DFBA73] font-cinzel font-bold mb-1 text-[11px]">Nombre Visible (display_name)</label>
                            <input
                                type="text"
                                value={formData.display_name}
                                onChange={(e) => onFieldChange('display_name', e.target.value)}
                                className="w-full bg-[#0d0718] border border-[#C5A059]/30 rounded-xl px-3 py-2 text-slate-100 focus:border-[#C5A059] focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[#DFBA73] font-cinzel font-bold mb-1 text-[11px]">País / Jurisdicción</label>
                            <input
                                type="text"
                                value={formData.country || ''}
                                onChange={(e) => onFieldChange('country', e.target.value)}
                                placeholder="Ej. Colombia, México, España, Perú..."
                                className="w-full bg-[#0d0718] border border-[#C5A059]/30 rounded-xl px-3 py-2 text-slate-100 focus:border-[#C5A059] focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[#DFBA73] font-cinzel font-bold mb-1 text-[11px]">Modo de Verificación</label>
                            <select
                                value={formData.verification_mode || 'SCRAPING_SELECTOR'}
                                onChange={(e) => onFieldChange('verification_mode', e.target.value)}
                                className="w-full bg-[#0d0718] border border-[#C5A059]/30 rounded-xl px-3 py-2 text-slate-100 focus:border-[#C5A059] focus:outline-none"
                            >
                                <option value="SCRAPING_SELECTOR">Selectores DOM (Scraping Web Oficial)</option>
                                <option value="OFFICIAL_SEARCH">Búsqueda Directa en Relatoría Oficial</option>
                                <option value="DIRECT_API">API REST / Endpoint JSON</option>
                                <option value="SYNTHETIC_VERIFIER">Verificador Sintético / Local</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[#DFBA73] font-cinzel font-bold mb-1 text-[11px]">URL Base (base_url)</label>
                        <input
                            type="text"
                            value={formData.base_url}
                            onChange={(e) => onFieldChange('base_url', e.target.value)}
                            className="w-full bg-[#0d0718] border border-[#C5A059]/30 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-[#C5A059] focus:outline-none"
                            required
                        />
                    </div>

                    {/* DOM Selectors Box */}
                    <div className="p-4 bg-[#0d0718] border border-[#C5A059]/25 rounded-xl space-y-3">
                        <span className="text-[11px] font-cinzel font-bold text-[#FFE898] uppercase tracking-wider block">
                            Selectores DOM & Parámetros de Extracción:
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                                <label className="text-[10px] text-slate-400 font-mono">query_input_selector</label>
                                <input
                                    type="text"
                                    value={formData.query_input_selector || ''}
                                    onChange={(e) => onFieldChange('query_input_selector', e.target.value)}
                                    placeholder="#txtBusqueda"
                                    className="w-full bg-[#12071d] border border-[#C5A059]/25 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-[11px] focus:border-[#C5A059] focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-400 font-mono">radicado_selector</label>
                                <input
                                    type="text"
                                    value={formData.radicado_selector || ''}
                                    onChange={(e) => onFieldChange('radicado_selector', e.target.value)}
                                    placeholder="#txtRadicado"
                                    className="w-full bg-[#12071d] border border-[#C5A059]/25 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-[11px] focus:border-[#C5A059] focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-400 font-mono">btn_buscar_selector</label>
                                <input
                                    type="text"
                                    value={formData.btn_buscar_selector || ''}
                                    onChange={(e) => onFieldChange('btn_buscar_selector', e.target.value)}
                                    placeholder="#btnBuscar"
                                    className="w-full bg-[#12071d] border border-[#C5A059]/25 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-[11px] focus:border-[#C5A059] focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                                <label className="text-[10px] text-slate-400 font-mono">tabla_resultados_selector</label>
                                <input
                                    type="text"
                                    value={formData.tabla_resultados_selector || ''}
                                    onChange={(e) => onFieldChange('tabla_resultados_selector', e.target.value)}
                                    placeholder="#tabla"
                                    className="w-full bg-[#12071d] border border-[#C5A059]/25 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-[11px] focus:border-[#C5A059] focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-400 font-mono">fila_resultado_selector</label>
                                <input
                                    type="text"
                                    value={formData.fila_resultado_selector || ''}
                                    onChange={(e) => onFieldChange('fila_resultado_selector', e.target.value)}
                                    placeholder="tbody tr"
                                    className="w-full bg-[#12071d] border border-[#C5A059]/25 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-[11px] focus:border-[#C5A059] focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-400 font-mono">btn_descargar_selector</label>
                                <input
                                    type="text"
                                    value={formData.btn_descargar_selector || ''}
                                    onChange={(e) => onFieldChange('btn_descargar_selector', e.target.value)}
                                    placeholder="a.pdf-link"
                                    className="w-full bg-[#12071d] border border-[#C5A059]/25 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-[11px] focus:border-[#C5A059] focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-slate-400 italic">
                            Persistencia garantizada en almacenamiento local seguro.
                        </span>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-gradient-to-r from-[#DFBA73] to-[#C5A059] hover:from-[#FFE898] hover:to-[#DFBA73] text-[#08040d] font-cinzel font-bold rounded-xl shadow-[0_0_12px_rgba(197,160,89,0.3)] transition-all"
                        >
                            Guardar Configuración de Portal
                        </button>
                    </div>
                </form>
            </div>

            {/* Live Verification Test Console */}
            <div className="lg:col-span-5 bg-[#12071d] border border-[#C5A059]/30 rounded-2xl p-6 space-y-4 flex flex-col justify-between court-gold-frame">
                <div className="space-y-3.5">
                    <div className="border-b border-[#C5A059]/20 pb-3">
                        <span className="text-xs font-cinzel font-bold text-[#FFE898] uppercase tracking-wider block">
                            Consola de Prueba Epistémica
                        </span>
                        <p className="text-[11px] text-slate-400 font-garamond italic mt-0.5">
                            Verifique en tiempo real cómo responde el portal a una cita o radicado de prueba.
                        </p>
                    </div>

                    <div>
                        <label className="block text-[11px] text-[#DFBA73] font-cinzel font-bold mb-1">
                            Cita o Radicado de Prueba:
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={testQuery}
                                onChange={(e) => onTestQueryChange(e.target.value)}
                                placeholder="Ej. Sentencia SU-049/24 radicado..."
                                className="flex-1 bg-[#0d0718] border border-[#C5A059]/30 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#C5A059] font-mono"
                            />
                            <button
                                type="button"
                                onClick={onRunVerificationTest}
                                disabled={isTesting || !testQuery.trim()}
                                className="px-4 py-2 bg-[#2a133d] hover:bg-[#3d1c5a] border border-[#C5A059] disabled:opacity-40 text-[#FFE898] rounded-xl text-xs font-cinzel font-bold shadow transition-all flex items-center gap-1.5"
                            >
                                {isTesting ? 'Validando...' : 'Probar ⚡'}
                            </button>
                        </div>
                    </div>

                    {testResult && (
                        <div className="p-4 bg-[#0d0718] border border-[#C5A059]/30 rounded-xl space-y-2 text-xs font-garamond animate-fade-in">
                            <div className="flex items-center justify-between">
                                <span className="font-cinzel font-bold text-[#FFE898]">
                                    {testResult.portalDisplayName}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${testResult.isVerified ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-[#C5A059]/20 text-[#DFBA73] border border-[#C5A059]/30'}`}>
                                    {testResult.verificationStatus}
                                </span>
                            </div>

                            <div className="text-[11px] text-slate-300 space-y-1">
                                <div><span className="text-[#DFBA73] font-medium">Título detectado: </span>{testResult.extractedTitle}</div>
                                <div><span className="text-[#DFBA73] font-medium">Puntaje de Coincidencia: </span><span className="font-mono text-emerald-400 font-bold">{testResult.matchScore}%</span></div>
                                <div className="text-slate-400 mt-1 italic">{testResult.extractedRulingSummary}</div>
                            </div>

                            <div className="pt-2 border-t border-[#C5A059]/20 text-[10px] font-mono text-slate-400">
                                Auditoría: {new Date(testResult.auditTimestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-3.5 bg-[#1f1508]/60 border border-[#C5A059]/30 rounded-xl text-[11px] text-amber-200 font-garamond">
                    🛡️ <strong className="font-cinzel text-[#FFE898]">Gobernanza Universal:</strong> Al agregar portales de su país, el sistema garantiza que la redacción y los recursos sigan la doctrina procesal y las fuentes jurisprudenciales auténticas de su jurisdicción.
                </div>
            </div>
        </div>
    </div>
));
PortalsTab.displayName = 'PortalsTab';

interface JurisdictionsTabProps {
    readonly allJurisdictions: Readonly<Record<string, JurisdictionPack>>;
    readonly activeJurisdiction: string;
    readonly onSelectJurisdiction: (code: string) => void;
    readonly isCreatingJurisdiction: boolean;
    readonly onToggleCreatingJurisdiction: () => void;
    readonly customJurisdictionData: JurisdictionPack;
    readonly onCustomDataChange: (updater: (prev: JurisdictionPack) => JurisdictionPack) => void;
    readonly onSaveCustomJurisdiction: (e: React.FormEvent) => void;
    readonly currentPack: JurisdictionPack;
}

const JurisdictionsTab = memo(({
    allJurisdictions,
    activeJurisdiction,
    onSelectJurisdiction,
    isCreatingJurisdiction,
    onToggleCreatingJurisdiction,
    customJurisdictionData,
    onCustomDataChange,
    onSaveCustomJurisdiction,
    currentPack
}: JurisdictionsTabProps) => (
    <div className="space-y-6">
        <div className="bg-[#12071d] border border-[#C5A059]/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 court-gold-frame">
            <div>
                <h3 className="text-sm font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] to-[#FFE898] flex items-center gap-2">
                    <span>⚖️</span>
                    <span>Adaptador Jurisdiccional & Pirámide Normativa Dinámica</span>
                </h3>
                <p className="text-xs text-slate-300 font-garamond mt-1 max-w-3xl leading-relaxed">
                    Seleccione la jurisdicción activa para calibrar automáticamente las Altas Cortes, los Códigos Procesales y el rango de fuentes normativas en todos los análisis y memoriales.
                </p>
            </div>
            <button
                type="button"
                onClick={onToggleCreatingJurisdiction}
                className="px-4 py-2 bg-gradient-to-r from-[#DFBA73] to-[#C5A059] hover:from-[#FFE898] hover:to-[#DFBA73] text-[#08040d] rounded-xl text-xs font-cinzel font-bold transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(197,160,89,0.3)]"
            >
                <span>{isCreatingJurisdiction ? 'Ver Jurisdicción Activa' : '+ Crear Nueva Jurisdicción'}</span>
            </button>
        </div>

        {/* Jurisdiction Selector Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {Object.values(allJurisdictions).map((pack) => {
                const isSelected = activeJurisdiction === pack.code;
                return (
                    <button
                        key={pack.code}
                        type="button"
                        onClick={() => onSelectJurisdiction(pack.code)}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between court-gold-frame ${
                            isSelected 
                                ? 'bg-gradient-to-r from-[#2a133d] to-[#1a0c2a] border-[#C5A059] shadow-[0_0_15px_rgba(197,160,89,0.3)]' 
                                : 'bg-[#12071d]/70 border-[#C5A059]/20 hover:border-[#C5A059]/40 hover:bg-[#12071d]'
                        }`}
                    >
                        <div className="text-2xl mb-1">{pack.flag}</div>
                        <div>
                            <div className="text-xs font-cinzel font-bold text-slate-100">{pack.name}</div>
                            <div className="text-[10px] font-mono text-[#DFBA73] uppercase">{pack.code}</div>
                        </div>
                        {isSelected && (
                            <span className="mt-2 text-[10px] font-cinzel font-bold text-[#FFE898] flex items-center gap-1">
                                <span>●</span> Activa
                            </span>
                        )}
                    </button>
                );
            })}
        </div>

        {/* Create New Jurisdiction Form */}
        {isCreatingJurisdiction ? (
            <div className="bg-[#12071d] border border-[#C5A059]/30 rounded-2xl p-6 space-y-4 court-gold-frame">
                <div className="border-b border-[#C5A059]/20 pb-3">
                    <h4 className="text-xs font-cinzel font-bold text-[#FFE898] uppercase tracking-wider">
                        ➕ Configurar Nueva Legislación / Jurisdicción Nacional
                    </h4>
                    <p className="text-xs text-slate-400 font-garamond italic mt-0.5">
                        Defina las cortes, códigos y terminología de cualquier país del mundo.
                    </p>
                </div>

                <form onSubmit={onSaveCustomJurisdiction} className="space-y-4 text-xs font-garamond">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-[#DFBA73] font-cinzel font-bold mb-1">Código ISO / Clave</label>
                            <input
                                type="text"
                                value={customJurisdictionData.code}
                                onChange={(e) => onCustomDataChange(prev => ({ ...prev, code: e.target.value }))}
                                placeholder="Ej. UY, CR, BO..."
                                className="w-full bg-[#0d0718] border border-[#C5A059]/30 rounded-xl px-3 py-2 text-slate-100 font-mono uppercase focus:border-[#C5A059] focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[#DFBA73] font-cinzel font-bold mb-1">Nombre de la Jurisdicción</label>
                            <input
                                type="text"
                                value={customJurisdictionData.name}
                                onChange={(e) => onCustomDataChange(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Ej. Uruguay, Costa Rica..."
                                className="w-full bg-[#0d0718] border border-[#C5A059]/30 rounded-xl px-3 py-2 text-slate-100 focus:border-[#C5A059] focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[#DFBA73] font-cinzel font-bold mb-1">Bandera / Emoji</label>
                            <input
                                type="text"
                                value={customJurisdictionData.flag}
                                onChange={(e) => onCustomDataChange(prev => ({ ...prev, flag: e.target.value }))}
                                placeholder="🇺🇾"
                                className="w-full bg-[#0d0718] border border-[#C5A059]/30 rounded-xl px-3 py-2 text-slate-100 focus:border-[#C5A059] focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[#DFBA73] font-cinzel font-bold mb-1">Máxima Corte Suprema</label>
                            <input
                                type="text"
                                value={customJurisdictionData.courtHierarchy.supremeCourt}
                                onChange={(e) => onCustomDataChange(prev => ({
                                    ...prev,
                                    courtHierarchy: { ...prev.courtHierarchy, supremeCourt: e.target.value }
                                }))}
                                className="w-full bg-[#0d0718] border border-[#C5A059]/30 rounded-xl px-3 py-2 text-slate-100 focus:border-[#C5A059] focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[#DFBA73] font-cinzel font-bold mb-1">Corte / Tribunal Constitucional</label>
                            <input
                                type="text"
                                value={customJurisdictionData.courtHierarchy.constitutionalCourt}
                                onChange={(e) => onCustomDataChange(prev => ({
                                    ...prev,
                                    courtHierarchy: { ...prev.courtHierarchy, constitutionalCourt: e.target.value }
                                }))}
                                className="w-full bg-[#0d0718] border border-[#C5A059]/30 rounded-xl px-3 py-2 text-slate-100 focus:border-[#C5A059] focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-[#DFBA73] font-cinzel font-bold mb-1">Código Administrativo</label>
                            <input
                                type="text"
                                value={customJurisdictionData.proceduralCodes.administrative || ''}
                                onChange={(e) => onCustomDataChange(prev => ({
                                    ...prev,
                                    proceduralCodes: { ...prev.proceduralCodes, administrative: e.target.value }
                                }))}
                                className="w-full bg-[#0d0718] border border-[#C5A059]/30 rounded-xl px-3 py-2 text-slate-100 focus:border-[#C5A059] focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[#DFBA73] font-cinzel font-bold mb-1">Código Procesal Civil</label>
                            <input
                                type="text"
                                value={customJurisdictionData.proceduralCodes.civil || ''}
                                onChange={(e) => onCustomDataChange(prev => ({
                                    ...prev,
                                    proceduralCodes: { ...prev.proceduralCodes, civil: e.target.value }
                                }))}
                                className="w-full bg-[#0d0718] border border-[#C5A059]/30 rounded-xl px-3 py-2 text-slate-100 focus:border-[#C5A059] focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[#DFBA73] font-cinzel font-bold mb-1">Acción de Protección Constitucional</label>
                            <input
                                type="text"
                                value={customJurisdictionData.keyTerminology.protectiveAction}
                                onChange={(e) => onCustomDataChange(prev => ({
                                    ...prev,
                                    keyTerminology: { ...prev.keyTerminology, protectiveAction: e.target.value }
                                }))}
                                className="w-full bg-[#0d0718] border border-[#C5A059]/30 rounded-xl px-3 py-2 text-slate-100 focus:border-[#C5A059] focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-2">
                        <button
                            type="button"
                            onClick={onToggleCreatingJurisdiction}
                            className="px-4 py-2 bg-[#0d0718] text-slate-300 rounded-xl hover:bg-[#2a133d] border border-[#C5A059]/20 font-cinzel text-xs font-bold"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-gradient-to-r from-[#DFBA73] to-[#C5A059] hover:from-[#FFE898] hover:to-[#DFBA73] text-[#08040d] font-cinzel font-bold rounded-xl shadow-[0_0_12px_rgba(197,160,89,0.3)]"
                        >
                            Guardar y Activar Jurisdicción
                        </button>
                    </div>
                </form>
            </div>
        ) : (
            /* Active Jurisdiction Details View */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Courts Hierarchy & Codes */}
                <div className="lg:col-span-6 bg-[#12071d] border border-[#C5A059]/30 rounded-2xl p-6 space-y-4 court-gold-frame">
                    <div className="border-b border-[#C5A059]/20 pb-3 flex items-center justify-between">
                        <span className="text-xs font-cinzel font-bold text-[#FFE898] uppercase tracking-wider flex items-center gap-2">
                            <span>🏛️</span>
                            <span>Estructura de Altas Cortes ({currentPack.name})</span>
                        </span>
                        <span className="text-[10px] font-mono bg-[#2a133d] text-[#FFE898] px-2.5 py-1 rounded-lg border border-[#C5A059]/30">
                            {currentPack.code}
                        </span>
                    </div>

                    <div className="space-y-2.5 text-xs font-garamond">
                        <div className="p-3 bg-[#0d0718] rounded-xl border border-[#C5A059]/20">
                            <span className="text-[10px] font-cinzel text-[#DFBA73] block uppercase font-bold">Corte Suprema / Casación:</span>
                            <p className="text-slate-200 mt-0.5 font-medium">{currentPack.courtHierarchy.supremeCourt}</p>
                        </div>
                        <div className="p-3 bg-[#0d0718] rounded-xl border border-[#C5A059]/20">
                            <span className="text-[10px] font-cinzel text-[#DFBA73] block uppercase font-bold">Tribunal Constitucional:</span>
                            <p className="text-slate-200 mt-0.5 font-medium">{currentPack.courtHierarchy.constitutionalCourt}</p>
                        </div>
                        {currentPack.courtHierarchy.administrativeCourt && (
                            <div className="p-3 bg-[#0d0718] rounded-xl border border-[#C5A059]/20">
                                <span className="text-[10px] font-cinzel text-[#DFBA73] block uppercase font-bold">Contencioso-Administrativo:</span>
                                <p className="text-slate-200 mt-0.5 font-medium">{currentPack.courtHierarchy.administrativeCourt}</p>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-[#C5A059]/20 pt-3 space-y-2 text-xs font-garamond">
                        <span className="text-[10px] font-cinzel text-[#DFBA73] block uppercase font-bold">Códigos Procesales Principales:</span>
                        <ul className="space-y-1 text-slate-300">
                            {currentPack.proceduralCodes.administrative && <li>• <span className="text-slate-400">Admin:</span> {currentPack.proceduralCodes.administrative}</li>}
                            {currentPack.proceduralCodes.civil && <li>• <span className="text-slate-400">Civil:</span> {currentPack.proceduralCodes.civil}</li>}
                            {currentPack.proceduralCodes.penal && <li>• <span className="text-slate-400">Penal:</span> {currentPack.proceduralCodes.penal}</li>}
                            {currentPack.proceduralCodes.constitutional && <li>• <span className="text-slate-400">Const:</span> {currentPack.proceduralCodes.constitutional}</li>}
                        </ul>
                    </div>
                </div>

                {/* Right: Normative Hierarchy Pyramid */}
                <div className="lg:col-span-6 bg-[#12071d] border border-[#C5A059]/30 rounded-2xl p-6 space-y-4 court-gold-frame">
                    <div className="border-b border-[#C5A059]/20 pb-3 flex items-center justify-between">
                        <span className="text-xs font-cinzel font-bold text-[#FFE898] uppercase tracking-wider flex items-center gap-2">
                            <span>📜</span>
                            <span>Jerarquía de Fuentes Vinculantes (Rango 1 - 13)</span>
                        </span>
                    </div>

                    <div className="space-y-1.5 text-xs max-h-72 overflow-y-auto scrollbar-thin pr-1 font-garamond">
                        {currentPack.sourceHierarchyRanks.map((rank, idx) => (
                            <div 
                                key={idx}
                                className="p-2.5 bg-[#0d0718]/90 rounded-xl border border-[#C5A059]/20 flex items-center gap-2 text-slate-300"
                            >
                                <span className="text-[10px] font-mono text-[#DFBA73] bg-[#C5A059]/15 px-2 py-0.5 rounded border border-[#C5A059]/20 min-w-8 text-center">#{idx + 1}</span>
                                <span>{rank}</span>
                            </div>
                        ))}
                    </div>

                    <div className="p-3.5 bg-[#1f1508]/60 border border-[#C5A059]/30 rounded-xl text-[11px] text-amber-200 font-garamond">
                        💡 <strong className="font-cinzel text-[#FFE898]">Doctrina del Precedente:</strong> {currentPack.precedentDoctrine}
                    </div>
                </div>
            </div>
        )}
    </div>
));
JurisdictionsTab.displayName = 'JurisdictionsTab';

interface PrivacyTabProps {
    readonly privacySettings: {
        anonymizeParties: boolean;
        anonymizeIds: boolean;
        anonymizeAddresses: boolean;
        strictAntiHallucination: boolean;
    };
    readonly onUpdatePrivacySettings: (partial: Partial<{
        anonymizeParties: boolean;
        anonymizeIds: boolean;
        anonymizeAddresses: boolean;
        strictAntiHallucination: boolean;
    }>) => void;
    readonly onFullReset: () => Promise<void>;
    readonly onClose: () => void;
}

const PrivacyTab = memo(({
    privacySettings,
    onUpdatePrivacySettings,
    onFullReset,
    onClose
}: PrivacyTabProps) => (
    <div className="space-y-6">
        <div className="bg-[#12071d] border border-[#C5A059]/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 court-gold-frame">
            <div>
                <h3 className="text-sm font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] to-[#FFE898] flex items-center gap-2">
                    <span>🔒</span>
                    <span>Garantías de Privacidad, Confidencialidad y Retención Cero</span>
                </h3>
                <p className="text-xs text-slate-300 font-garamond mt-1 max-w-3xl leading-relaxed">
                    Controles de anonimización en origen para que los datos sensibles de sus clientes nunca sean transmitidos sin máscara y permanezcan exclusivamente bajo control del despacho.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Anonymization Toggles */}
            <div className="bg-[#12071d] border border-[#C5A059]/30 rounded-2xl p-6 space-y-4 court-gold-frame">
                <span className="text-xs font-cinzel font-bold text-[#FFE898] uppercase tracking-wider block border-b border-[#C5A059]/20 pb-3">
                    Máscara Automática de Datos Sensibles
                </span>

                <div className="space-y-3 text-xs font-garamond">
                    <label className="flex items-start gap-3 p-3.5 bg-[#0d0718] rounded-xl border border-[#C5A059]/20 cursor-pointer hover:border-[#C5A059]/40 transition-colors">
                        <input
                            type="checkbox"
                            checked={privacySettings.anonymizeParties}
                            onChange={(e) => onUpdatePrivacySettings({ anonymizeParties: e.target.checked })}
                            className="mt-0.5 h-4 w-4 rounded bg-[#12071d] border-[#C5A059]/40 text-[#DFBA73] focus:ring-[#C5A059]"
                        />
                        <div>
                            <span className="font-cinzel font-bold text-slate-200 block">Anonimizar Nombres de Partes e Intervinientes</span>
                            <span className="text-[11px] text-slate-400">Reemplaza nombres reales por tokens estratégicos (`[DEMANDANTE_01]`, `[REPRESENTANTE_LEGAL]`).</span>
                        </div>
                    </label>

                    <label className="flex items-start gap-3 p-3.5 bg-[#0d0718] rounded-xl border border-[#C5A059]/20 cursor-pointer hover:border-[#C5A059]/40 transition-colors">
                        <input
                            type="checkbox"
                            checked={privacySettings.anonymizeIds}
                            onChange={(e) => onUpdatePrivacySettings({ anonymizeIds: e.target.checked })}
                            className="mt-0.5 h-4 w-4 rounded bg-[#12071d] border-[#C5A059]/40 text-[#DFBA73] focus:ring-[#C5A059]"
                        />
                        <div>
                            <span className="font-cinzel font-bold text-slate-200 block">Anonimizar Cédulas / Identificaciones Tributarias</span>
                            <span className="text-[11px] text-slate-400">Oculta números de identificación personal, pasaportes y NITs (`[DOC_ID_XXXX]`).</span>
                        </div>
                    </label>

                    <label className="flex items-start gap-3 p-3.5 bg-[#0d0718] rounded-xl border border-[#C5A059]/20 cursor-pointer hover:border-[#C5A059]/40 transition-colors">
                        <input
                            type="checkbox"
                            checked={privacySettings.anonymizeAddresses}
                            onChange={(e) => onUpdatePrivacySettings({ anonymizeAddresses: e.target.checked })}
                            className="mt-0.5 h-4 w-4 rounded bg-[#12071d] border-[#C5A059]/40 text-[#DFBA73] focus:ring-[#C5A059]"
                        />
                        <div>
                            <span className="font-cinzel font-bold text-slate-200 block">Anonimizar Direcciones Físicas y Teléfonos</span>
                            <span className="text-[11px] text-slate-400">Protege domicilios procesales y datos de contacto directo de testigos.</span>
                        </div>
                    </label>
                </div>
            </div>

            {/* Memory Purge & Shield Level */}
            <div className="bg-[#12071d] border border-[#C5A059]/30 rounded-2xl p-6 space-y-4 flex flex-col justify-between court-gold-frame">
                <div className="space-y-4">
                    <span className="text-xs font-cinzel font-bold text-[#FFE898] uppercase tracking-wider block border-b border-[#C5A059]/20 pb-3">
                        Régimen de Memoria & Blindaje
                    </span>

                    <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs space-y-1 font-garamond">
                        <div className="font-cinzel font-bold text-emerald-300 flex items-center gap-1.5">
                            <span>✓</span>
                            <span>Retención Cero en Nube (Client-Side Ephemeral)</span>
                        </div>
                        <p className="text-[11px] text-emerald-200/80">
                            Los documentos y borradores de litigio no se almacenan en bases de datos externas; residen únicamente en la sesión de trabajo local del navegador.
                        </p>
                    </div>

                    <label className="flex items-start gap-3 p-3.5 bg-[#0d0718] rounded-xl border border-[#C5A059]/20 cursor-pointer hover:border-[#C5A059]/40 transition-colors">
                        <input
                            type="checkbox"
                            checked={privacySettings.strictAntiHallucination}
                            onChange={(e) => onUpdatePrivacySettings({ strictAntiHallucination: e.target.checked })}
                            className="mt-0.5 h-4 w-4 rounded bg-[#12071d] border-[#C5A059]/40 text-[#DFBA73] focus:ring-[#C5A059]"
                        />
                        <div>
                            <span className="font-cinzel font-bold text-slate-200 block">Modo Anti-Alucinación Estricto (Obligatorio)</span>
                            <span className="text-[11px] text-slate-400 font-garamond">Bloquea la generación de citas si no cuentan con radicado contrastable en los portales activos.</span>
                        </div>
                    </label>
                </div>

                <div className="pt-3 border-t border-[#C5A059]/20 flex items-center justify-between font-garamond">
                    <span className="text-[11px] text-slate-400 italic">Limpieza total de sesión:</span>
                    <button
                        type="button"
                        onClick={async () => {
                            if (window.confirm('¿Desea purgar la memoria estratégica y borrar los archivos locales de la sesión?')) {
                                await onFullReset();
                                onClose();
                            }
                        }}
                        className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-200 hover:text-white rounded-xl text-xs font-cinzel font-bold transition-all"
                    >
                        Purgar Memoria Estratégica
                    </button>
                </div>
            </div>
        </div>
    </div>
));
PrivacyTab.displayName = 'PrivacyTab';

interface DirectivesTabProps {
    readonly filteredDirectives: readonly GovernanceDirectiveSection[];
    readonly protocolSearch: string;
    readonly onSearchChange: (search: string) => void;
    readonly selectedDirectiveId: number;
    readonly onSelectDirective: (id: number) => void;
    readonly activeDirective: GovernanceDirectiveSection;
}

const DirectivesTab = memo(({
    filteredDirectives,
    protocolSearch,
    onSearchChange,
    selectedDirectiveId,
    onSelectDirective,
    activeDirective
}: DirectivesTabProps) => (
    <div className="space-y-4">
        <div className="bg-[#12071d] border border-[#C5A059]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 court-gold-frame">
            <div className="flex items-center gap-2">
                <span className="text-xs font-cinzel font-bold text-[#FFE898] uppercase tracking-wider">
                    Protocolo LAGP V5 ({filteredDirectives.length} Secciones)
                </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                    type="text"
                    value={protocolSearch}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Buscar directiva o motor..."
                    className="bg-[#0d0718] border border-[#C5A059]/30 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-[#C5A059] w-full sm:w-64 font-garamond"
                />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* List of sections */}
            <div className="lg:col-span-4 space-y-1.5 max-h-96 overflow-y-auto scrollbar-thin pr-1">
                {filteredDirectives.map((sec) => (
                    <button
                        key={sec.id}
                        type="button"
                        onClick={() => onSelectDirective(sec.id)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all court-gold-frame ${
                            selectedDirectiveId === sec.id 
                                ? 'bg-gradient-to-r from-[#2a133d] to-[#1a0c2a] border-[#C5A059] text-[#FFE898] font-bold shadow-[0_0_10px_rgba(197,160,89,0.3)]' 
                                : 'bg-[#12071d] border-[#C5A059]/20 text-slate-300 hover:bg-[#2a133d]/50 hover:text-slate-100'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-cinzel text-[#DFBA73]">SECCIÓN {sec.id}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#0d0718] text-[#DFBA73] border border-[#C5A059]/20 font-mono">{sec.category}</span>
                        </div>
                        <div className="truncate mt-1 font-cinzel font-medium">{sec.title}</div>
                    </button>
                ))}
            </div>

            {/* Active directive detail */}
            <div className="lg:col-span-8 bg-[#12071d] border border-[#C5A059]/30 rounded-2xl p-6 space-y-3.5 court-gold-frame">
                <div className="border-b border-[#C5A059]/20 pb-3">
                    <span className="text-[10px] font-mono text-[#DFBA73] uppercase font-bold">
                        SECCIÓN {activeDirective.id} • {activeDirective.category}
                    </span>
                    <h3 className="text-sm font-cinzel font-bold text-slate-100 mt-0.5">{activeDirective.title}</h3>
                    <p className="text-xs text-slate-400 font-garamond italic mt-1">{activeDirective.summary}</p>
                </div>

                <div className="p-4 bg-[#0d0718] rounded-xl border border-[#C5A059]/20 text-xs text-slate-300 font-garamond whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto scrollbar-thin">
                    {activeDirective.fullText}
                </div>
            </div>
        </div>
    </div>
));
DirectivesTab.displayName = 'DirectivesTab';

// --- COMPONENTE PRINCIPAL ---

export const SettingsAndPrivacyModal: React.FC<SettingsAndPrivacyModalProps> = memo(({
    isOpen,
    onClose,
    initialTab = 'PORTALS'
}) => {
    const { 
        activeJurisdiction, 
        setActiveJurisdiction, 
        privacySettings, 
        updatePrivacySettings,
        fullReset
    } = useAnalysis();

    const [activeTab, setActiveTab] = useState<ConfigModalTab>(initialTab);
    const [portals, setPortals] = useState<Record<string, PortalConfig>>(() => portalRegistryService.getAllPortals());
    const [selectedPortalKey, setSelectedPortalKey] = useState<string>('rama_judicial_colombia');
    const [isCreatingPortal, setIsCreatingPortal] = useState<boolean>(false);
    
    // Testing state
    const [testQuery, setTestQuery] = useState<string>('Sentencia SU-049/24 radicado 2021-00342');
    const [testResult, setTestResult] = useState<PortalVerificationResult | null>(null);
    const [isTesting, setIsTesting] = useState<boolean>(false);

    // Import/Export state
    const [showExportModal, setShowExportModal] = useState<boolean>(false);
    const [importExportText, setImportExportText] = useState<string>('');
    const [importSuccessMessage, setImportSuccessMessage] = useState<string>('');

    // Form state for portal
    const [formData, setFormData] = useState<PortalConfig>({
        name: 'nuevo_portal',
        display_name: 'Mi Portal Jurídico',
        base_url: 'https://...',
        fecha_desde_selector: '#fechaIni',
        fecha_hasta_selector: '#fechaFin',
        fecha_format: '%d/%m/%Y',
        btn_buscar_selector: '#btnBuscar',
        tabla_resultados_selector: '#tabla',
        fila_resultado_selector: 'tbody tr',
        btn_descargar_selector: 'a.pdf-link',
        query_input_selector: '#txtBusqueda',
        radicado_selector: '#txtRadicado',
        jurisdiction: activeJurisdiction,
        country: 'Colombia',
        description: 'Portal configurado para verificar autenticidad de citas y documentos.',
        is_active: true,
        verification_mode: 'SCRAPING_SELECTOR'
    });

    // Custom Jurisdiction Form State
    const [isCreatingJurisdiction, setIsCreatingJurisdiction] = useState<boolean>(false);
    const [customJurisdictionData, setCustomJurisdictionData] = useState<JurisdictionPack>({
        code: 'PAIS',
        name: 'Nueva Jurisdicción Nacional',
        country: 'País',
        flag: '🌍',
        courtHierarchy: {
            supremeCourt: 'Corte Suprema de Justicia',
            constitutionalCourt: 'Tribunal Constitucional / Corte Constitucional',
            administrativeCourt: 'Tribunal Contencioso Administrativo',
            appellateCourts: 'Cortes Superiores de Apelaciones',
            firstInstanceCourts: 'Juzgados de Primera Instancia'
        },
        sourceHierarchyRanks: [
            '1. Constitución Política & Tratados de Derechos Humanos',
            '2. Tratados Internacionales Ratificados',
            '3. Leyes Orgánicas y Ordinarias',
            '4. Decretos y Reglamentos del Poder Ejecutivo',
            '5. Jurisprudencia Constitucional Vinculante',
            '6. Precedentes Judiciales de Altas Cortes',
            '7. Doctrina Legal y Principios Generales'
        ],
        proceduralCodes: {
            administrative: 'Código de Procedimiento Administrativo',
            civil: 'Código Procesal Civil',
            penal: 'Código Procesal Penal',
            constitutional: 'Ley de Garantías Constitucionales / Amparo'
        },
        precedentDoctrine: 'Doctrina de observancia de precedentes de las Altas Cortes y control constitucional.',
        keyTerminology: {
            lawsuit: 'Demanda',
            ruling: 'Sentencia',
            appeal: 'Recurso de Apelación',
            protectiveAction: 'Acción de Amparo / Tutela'
        }
    });

    const [allJurisdictions, setAllJurisdictions] = useState<Record<string, JurisdictionPack>>(() =>
        jurisdictionRegistryService.getAllPacks()
    );

    // Protocol sections
    const [protocolCategory] = useState<string>('ALL');
    const [protocolSearch, setProtocolSearch] = useState<string>('');
    const [selectedDirectiveId, setSelectedDirectiveId] = useState<number>(1);

    // Sync active tab when modal opens
    useEffect(() => {
        if (isOpen && initialTab) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    const currentPack = useMemo(() => 
        allJurisdictions[activeJurisdiction] || resolveJurisdictionPack(activeJurisdiction),
    [allJurisdictions, activeJurisdiction]);

    const handleSelectPortal = useCallback((key: string) => {
        setSelectedPortalKey(key);
        setIsCreatingPortal(false);
        const p = portals[key];
        if (p) {
            setFormData({ ...p });
        }
    }, [portals]);

    const handleStartCreatePortal = useCallback(() => {
        setIsCreatingPortal(true);
        const newCode = `portal_${Date.now().toString().slice(-4)}`;
        setFormData({
            name: newCode,
            display_name: 'Nuevo Portal Judicial',
            base_url: 'https://...',
            fecha_desde_selector: '#fechaIni',
            fecha_hasta_selector: '#fechaFin',
            fecha_format: '%d/%m/%Y',
            btn_buscar_selector: '#btnBuscar',
            tabla_resultados_selector: '#tabla',
            fila_resultado_selector: 'tbody tr',
            btn_descargar_selector: 'a.pdf-link',
            query_input_selector: '#busqueda',
            radicado_selector: '#radicado',
            jurisdiction: activeJurisdiction,
            country: currentPack.country,
            description: 'Portal oficial de jurisprudencia o consulta procesal.',
            is_active: true,
            verification_mode: 'SCRAPING_SELECTOR'
        });
    }, [activeJurisdiction, currentPack.country]);

    const handleFieldChange = useCallback((field: keyof PortalConfig, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSavePortal = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        portalRegistryService.registerPortal(formData);
        setPortals(portalRegistryService.getAllPortals());
        setSelectedPortalKey(formData.name);
        setIsCreatingPortal(false);
    }, [formData]);

    const handleTogglePortalActive = useCallback((name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        portalRegistryService.togglePortalActive(name);
        setPortals(portalRegistryService.getAllPortals());
    }, []);

    const handleRunVerificationTest = useCallback(async () => {
        if (!testQuery.trim()) return;
        setIsTesting(true);
        try {
            const res = await portalRegistryService.verifyCitationAgainstPortal(testQuery, selectedPortalKey);
            setTestResult(res);
        } finally {
            setIsTesting(false);
        }
    }, [testQuery, selectedPortalKey]);

    const handleExportPortals = useCallback(() => {
        setImportExportText(portalRegistryService.exportPortalsJSON());
        setShowExportModal(true);
        setImportSuccessMessage('');
    }, []);

    const handleImportPortals = useCallback(() => {
        if (!importExportText.trim()) return;
        const success = portalRegistryService.importPortalsJSON(importExportText);
        if (success) {
            setPortals(portalRegistryService.getAllPortals());
            setImportSuccessMessage('¡Portales importados exitosamente!');
            setTimeout(() => {
                setShowExportModal(false);
                setImportSuccessMessage('');
            }, 1200);
        } else {
            alert('Formato JSON inválido. Verifique la estructura de portales.');
        }
    }, [importExportText]);

    const handleSaveCustomJurisdiction = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!customJurisdictionData.code.trim()) return;
        const upperCode = customJurisdictionData.code.toUpperCase().trim();
        const packToSave = { ...customJurisdictionData, code: upperCode };
        jurisdictionRegistryService.saveCustomPack(packToSave);
        setAllJurisdictions(jurisdictionRegistryService.getAllPacks());
        setActiveJurisdiction(upperCode);
        setIsCreatingJurisdiction(false);
    }, [customJurisdictionData, setActiveJurisdiction]);

    const handleToggleCreatingJurisdiction = useCallback(() => {
        setIsCreatingJurisdiction(prev => !prev);
    }, []);

    const handleSelectJurisdiction = useCallback((code: string) => {
        setActiveJurisdiction(code);
        setIsCreatingJurisdiction(false);
    }, [setActiveJurisdiction]);

    const filteredDirectives = useMemo(() => {
        return LEGAL_GOVERNANCE_PROTOCOL_V5_SECTIONS.filter(sec => {
            const matchesCategory = protocolCategory === 'ALL' || sec.category === protocolCategory;
            const matchesSearch = protocolSearch === '' ||
                sec.title.toLowerCase().includes(protocolSearch.toLowerCase()) ||
                sec.summary.toLowerCase().includes(protocolSearch.toLowerCase()) ||
                sec.fullText.toLowerCase().includes(protocolSearch.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [protocolCategory, protocolSearch]);

    const activeDirective = useMemo(() => {
        return LEGAL_GOVERNANCE_PROTOCOL_V5_SECTIONS.find(s => s.id === selectedDirectiveId) || LEGAL_GOVERNANCE_PROTOCOL_V5_SECTIONS[0];
    }, [selectedDirectiveId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#08040d]/85 backdrop-blur-md animate-fade-in text-slate-100">
            <div className="bg-[#12071d] border border-[#C5A059]/40 w-full max-w-6xl max-h-[92vh] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden court-gold-frame">
                
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-[#0d0718] via-[#1a0c2a] to-[#0d0718] border-b border-[#C5A059]/30 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#2a133d] border border-[#C5A059]/40 flex items-center justify-center text-xl shadow-[0_0_10px_rgba(197,160,89,0.2)]">
                            ⚙️
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono font-bold text-[#FFE898] bg-[#C5A059]/15 px-2.5 py-0.5 rounded border border-[#C5A059]/30">
                                    CENTRO DE CONFIGURACIÓN & PRIVACIDAD
                                </span>
                                <span className="text-xs font-cinzel font-bold text-[#DFBA73] flex items-center gap-1.5">
                                    <span>{currentPack.flag}</span>
                                    <span>{currentPack.name}</span>
                                </span>
                            </div>
                            <h2 className="text-lg font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] to-[#FFE898] tracking-tight mt-0.5">
                                Portales Judiciales, Adaptación de Legislación & Privacidad
                            </h2>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-[#FFE898] bg-[#0d0718] hover:bg-[#2a133d] border border-[#C5A059]/20 hover:border-[#C5A059]/50 rounded-xl transition-all"
                        aria-label="Cerrar modal de configuración"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="px-6 py-2 bg-[#0d0718] border-b border-[#C5A059]/25 flex items-center gap-2 overflow-x-auto text-xs font-cinzel font-bold scrollbar-thin">
                    <button
                        type="button"
                        onClick={() => setActiveTab('PORTALS')}
                        className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap court-gold-frame ${activeTab === 'PORTALS' ? 'bg-gradient-to-r from-[#2a133d] to-[#1a0c2a] border-[#C5A059] text-[#FFE898] shadow-[0_0_12px_rgba(197,160,89,0.3)]' : 'bg-[#12071d] border-[#C5A059]/20 text-slate-300 hover:bg-[#2a133d]/50 hover:text-slate-100'}`}
                    >
                        <span>🌐</span>
                        <span>Portales de Consulta & Scrapers ({Object.keys(portals).length})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('JURISDICTIONS')}
                        className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap court-gold-frame ${activeTab === 'JURISDICTIONS' ? 'bg-gradient-to-r from-[#2a133d] to-[#1a0c2a] border-[#C5A059] text-[#FFE898] shadow-[0_0_12px_rgba(197,160,89,0.3)]' : 'bg-[#12071d] border-[#C5A059]/20 text-slate-300 hover:bg-[#2a133d]/50 hover:text-slate-100'}`}
                    >
                        <span>⚖️</span>
                        <span>Jurisdicción & Jerarquía Normativa</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('PRIVACY')}
                        className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap court-gold-frame ${activeTab === 'PRIVACY' ? 'bg-gradient-to-r from-[#2a133d] to-[#1a0c2a] border-[#C5A059] text-[#FFE898] shadow-[0_0_12px_rgba(197,160,89,0.3)]' : 'bg-[#12071d] border-[#C5A059]/20 text-slate-300 hover:bg-[#2a133d]/50 hover:text-slate-100'}`}
                    >
                        <span>🔒</span>
                        <span>Privacidad, Datos & Anti-Alucinación</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('DIRECTIVES')}
                        className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap court-gold-frame ${activeTab === 'DIRECTIVES' ? 'bg-gradient-to-r from-[#2a133d] to-[#1a0c2a] border-[#C5A059] text-[#FFE898] shadow-[0_0_12px_rgba(197,160,89,0.3)]' : 'bg-[#12071d] border-[#C5A059]/20 text-slate-300 hover:bg-[#2a133d]/50 hover:text-slate-100'}`}
                    >
                        <span>🏛️</span>
                        <span>Protocolo LAGP V5 & 11 Motores</span>
                    </button>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-6 bg-[#0d0718]">
                    {activeTab === 'PORTALS' && (
                        <PortalsTab
                            portals={portals}
                            selectedPortalKey={selectedPortalKey}
                            isCreatingPortal={isCreatingPortal}
                            formData={formData}
                            onSelectPortal={handleSelectPortal}
                            onStartCreatePortal={handleStartCreatePortal}
                            onSavePortal={handleSavePortal}
                            onTogglePortalActive={handleTogglePortalActive}
                            onExportPortals={handleExportPortals}
                            onFieldChange={handleFieldChange}
                            testQuery={testQuery}
                            onTestQueryChange={setTestQuery}
                            testResult={testResult}
                            isTesting={isTesting}
                            onRunVerificationTest={handleRunVerificationTest}
                        />
                    )}

                    {activeTab === 'JURISDICTIONS' && (
                        <JurisdictionsTab
                            allJurisdictions={allJurisdictions}
                            activeJurisdiction={activeJurisdiction}
                            onSelectJurisdiction={handleSelectJurisdiction}
                            isCreatingJurisdiction={isCreatingJurisdiction}
                            onToggleCreatingJurisdiction={handleToggleCreatingJurisdiction}
                            customJurisdictionData={customJurisdictionData}
                            onCustomDataChange={setCustomJurisdictionData}
                            onSaveCustomJurisdiction={handleSaveCustomJurisdiction}
                            currentPack={currentPack}
                        />
                    )}

                    {activeTab === 'PRIVACY' && (
                        <PrivacyTab
                            privacySettings={privacySettings}
                            onUpdatePrivacySettings={updatePrivacySettings}
                            onFullReset={fullReset}
                            onClose={onClose}
                        />
                    )}

                    {activeTab === 'DIRECTIVES' && (
                        <DirectivesTab
                            filteredDirectives={filteredDirectives}
                            protocolSearch={protocolSearch}
                            onSearchChange={setProtocolSearch}
                            selectedDirectiveId={selectedDirectiveId}
                            onSelectDirective={setSelectedDirectiveId}
                            activeDirective={activeDirective}
                        />
                    )}
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-3 bg-[#0d0718] border-t border-[#C5A059]/25 flex items-center justify-between text-xs font-garamond">
                    <span className="text-slate-400">
                        Jurisdicción Activa: <strong className="text-[#FFE898] font-cinzel">{currentPack.name} ({currentPack.code})</strong> • Anti-Alucinación: <strong className="text-emerald-400">Activo</strong>
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 bg-gradient-to-r from-[#DFBA73] to-[#C5A059] hover:from-[#FFE898] hover:to-[#DFBA73] text-[#08040d] font-cinzel font-bold rounded-xl shadow-[0_0_12px_rgba(197,160,89,0.3)] transition-all"
                    >
                        Listo / Guardar Preferencias
                    </button>
                </div>
            </div>

            {/* Sub-modal: Import / Export JSON */}
            {showExportModal && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#12071d] border border-[#C5A059]/40 w-full max-w-xl rounded-2xl p-6 space-y-4 shadow-2xl text-slate-100 court-gold-frame">
                        <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-3">
                            <h4 className="text-xs font-cinzel font-bold text-[#FFE898] uppercase tracking-wider">
                                📋 Importar / Exportar JSON de Portales
                            </h4>
                            <button 
                                type="button" 
                                onClick={() => setShowExportModal(false)} 
                                className="text-slate-400 hover:text-[#FFE898]"
                            >
                                ✕
                            </button>
                        </div>
                        <p className="text-xs text-slate-300 font-garamond">
                            Copie esta configuración para respaldar sus portales o pegue una configuración JSON compartida por su equipo legal para cualquier país.
                        </p>
                        <textarea
                            value={importExportText}
                            onChange={(e) => setImportExportText(e.target.value)}
                            rows={10}
                            className="w-full bg-[#0d0718] border border-[#C5A059]/30 rounded-xl p-3 text-xs font-mono text-[#FFE898] focus:outline-none focus:border-[#C5A059] scrollbar-thin"
                        />
                        {importSuccessMessage && (
                            <div className="text-xs font-cinzel font-bold text-emerald-400">{importSuccessMessage}</div>
                        )}
                        <div className="flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(importExportText);
                                    setImportSuccessMessage('¡Copiado al portapapeles!');
                                    setTimeout(() => setImportSuccessMessage(''), 1500);
                                }}
                                className="px-4 py-2 bg-[#0d0718] hover:bg-[#2a133d] text-[#DFBA73] hover:text-[#FFE898] border border-[#C5A059]/30 rounded-xl text-xs font-cinzel font-bold transition-all"
                            >
                                Copiar JSON
                            </button>
                            <button
                                type="button"
                                onClick={handleImportPortals}
                                className="px-4 py-2 bg-gradient-to-r from-[#DFBA73] to-[#C5A059] hover:from-[#FFE898] hover:to-[#DFBA73] text-[#08040d] font-cinzel font-bold rounded-xl shadow-[0_0_12px_rgba(197,160,89,0.3)] transition-all"
                            >
                                Importar y Aplicar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

SettingsAndPrivacyModal.displayName = 'SettingsAndPrivacyModal';
export default SettingsAndPrivacyModal;
