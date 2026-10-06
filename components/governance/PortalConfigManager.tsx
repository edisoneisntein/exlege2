import React, { useState, useCallback, memo } from 'react';
import { portalRegistryService, type PortalConfig, type PortalVerificationResult } from '../../services/governance/portalConfig';

// --- SUBCOMPONENTES MEMOIZADOS ---

interface PortalTabsProps {
    readonly portals: Readonly<Record<string, PortalConfig>>;
    readonly selectedKey: string;
    readonly isCreatingNew: boolean;
    readonly onSelect: (key: string) => void;
}

const PortalTabs = memo(({ portals, selectedKey, isCreatingNew, onSelect }: PortalTabsProps) => (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin text-xs font-cinzel font-bold">
        {Object.entries(portals).map(([key, p]) => (
            <button
                key={key}
                type="button"
                onClick={() => onSelect(key)}
                aria-pressed={selectedKey === key && !isCreatingNew}
                className={`px-3.5 py-2 rounded-xl border transition-all flex items-center gap-2 whitespace-nowrap ${
                    selectedKey === key && !isCreatingNew 
                        ? 'bg-gradient-to-r from-[#2a133d] to-[#1a0c2a] border-[#C5A059] text-[#FFE898] shadow-[0_0_12px_rgba(197,160,89,0.3)]' 
                        : 'bg-[#12071d]/60 border-[#C5A059]/20 text-slate-400 hover:text-[#DFBA73] hover:border-[#C5A059]/40'
                }`}
            >
                <span className="w-2 h-2 rounded-full bg-[#DFBA73]"></span>
                <span>{p.display_name}</span>
                <span className="text-[10px] font-mono opacity-60">({p.name})</span>
            </button>
        ))}
    </div>
));
PortalTabs.displayName = 'PortalTabs';

interface PortalFormInspectorProps {
    readonly formData: PortalConfig;
    readonly isCreatingNew: boolean;
    readonly activeDisplayName: string;
    readonly onChange: (field: keyof PortalConfig, value: string) => void;
    readonly onSubmit: (e: React.FormEvent) => void;
}

const PortalFormInspector = memo(({ formData, isCreatingNew, activeDisplayName, onChange, onSubmit }: PortalFormInspectorProps) => {
    return (
        <div className="lg:col-span-7 bg-[#12071d] border border-[#C5A059]/30 rounded-2xl p-6 space-y-4 court-gold-frame">
            <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-cinzel font-bold text-[#DFBA73] uppercase tracking-wider">
                        {isCreatingNew ? 'Nuevo PortalConfig' : `Configuración: ${activeDisplayName}`}
                    </span>
                </div>
                <span className="text-[10px] font-mono bg-[#0d0718] px-2.5 py-1 rounded-lg text-[#FFE898] border border-[#C5A059]/25">
                    Modo: {formData.verification_mode}
                </span>
            </div>

            <form onSubmit={onSubmit} className="space-y-3.5 text-xs font-garamond">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[#DFBA73] font-cinzel font-bold mb-1 text-[11px]">Identificador de Sistema</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => onChange('name', e.target.value)}
                            className="w-full bg-[#0d0718] border border-[#C5A059]/30 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-[#C5A059] focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[#DFBA73] font-cinzel font-bold mb-1 text-[11px]">Nombre Visible</label>
                        <input
                            type="text"
                            value={formData.display_name}
                            onChange={(e) => onChange('display_name', e.target.value)}
                            className="w-full bg-[#0d0718] border border-[#C5A059]/30 rounded-xl px-3 py-2 text-slate-100 focus:border-[#C5A059] focus:outline-none"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[#DFBA73] font-cinzel font-bold mb-1 text-[11px]">URL Base del Portal Judicial</label>
                    <input
                        type="text"
                        value={formData.base_url}
                        onChange={(e) => onChange('base_url', e.target.value)}
                        className="w-full bg-[#0d0718] border border-[#C5A059]/30 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-[#C5A059] focus:outline-none"
                        required
                    />
                </div>

                {/* Selectores DOM */}
                <div className="p-4 bg-[#0d0718] border border-[#C5A059]/25 rounded-xl space-y-3">
                    <span className="text-[11px] font-cinzel font-bold text-[#FFE898] uppercase tracking-wider block">
                        Selectores DOM de Búsqueda & Extracción Judicial:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {[
                            { key: 'fecha_desde_selector', label: 'fecha_desde', placeholder: '#fechaIni' },
                            { key: 'fecha_hasta_selector', label: 'fecha_hasta', placeholder: '#fechaFin' },
                            { key: 'fecha_format', label: 'fecha_format', placeholder: '%d/%m/%Y' },
                        ].map((field) => (
                            <div key={field.key}>
                                <label className="text-[10px] text-slate-400 font-mono">{field.key}</label>
                                <input
                                    type="text"
                                    value={(formData[field.key as keyof PortalConfig] as string) || ''}
                                    onChange={(e) => onChange(field.key as keyof PortalConfig, e.target.value)}
                                    placeholder={field.placeholder}
                                    className="w-full bg-[#12071d] border border-[#C5A059]/25 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-[11px] focus:border-[#C5A059] focus:outline-none"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {[
                            { key: 'btn_buscar_selector', placeholder: '#btnBuscar' },
                            { key: 'tabla_resultados_selector', placeholder: '#tabla' },
                            { key: 'fila_resultado_selector', placeholder: 'tbody tr' },
                        ].map((field) => (
                            <div key={field.key}>
                                <label className="text-[10px] text-slate-400 font-mono">{field.key}</label>
                                <input
                                    type="text"
                                    value={(formData[field.key as keyof PortalConfig] as string) || ''}
                                    onChange={(e) => onChange(field.key as keyof PortalConfig, e.target.value)}
                                    placeholder={field.placeholder}
                                    className="w-full bg-[#12071d] border border-[#C5A059]/25 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-[11px] focus:border-[#C5A059] focus:outline-none"
                                />
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="text-[10px] text-slate-400 font-mono">btn_descargar_selector</label>
                        <input
                            type="text"
                            value={formData.btn_descargar_selector || ''}
                            onChange={(e) => onChange('btn_descargar_selector', e.target.value)}
                            placeholder="a.pdf-link"
                            className="w-full bg-[#12071d] border border-[#C5A059]/25 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-[11px] focus:border-[#C5A059] focus:outline-none"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400 italic font-garamond">
                        Configuración persistida con garantías epistemológicas anti-alucinación.
                    </span>
                    <button
                        type="submit"
                        className="px-5 py-2 bg-gradient-to-r from-[#DFBA73] to-[#C5A059] hover:from-[#FFE898] hover:to-[#DFBA73] text-[#08040d] font-cinzel font-bold rounded-xl shadow-[0_0_12px_rgba(197,160,89,0.3)] transition-all"
                    >
                        Guardar Portal
                    </button>
                </div>
            </form>
        </div>
    );
});
PortalFormInspector.displayName = 'PortalFormInspector';

interface VerificationConsoleProps {
    readonly testQuery: string;
    readonly isTesting: boolean;
    readonly testResult: PortalVerificationResult | null;
    readonly errorMsg: string | null;
    readonly onQueryChange: (val: string) => void;
    readonly onTestRun: () => void;
}

const VerificationConsole = memo(({ testQuery, isTesting, testResult, errorMsg, onQueryChange, onTestRun }: VerificationConsoleProps) => (
    <div className="lg:col-span-5 bg-[#12071d] border border-[#C5A059]/30 rounded-2xl p-6 space-y-4 flex flex-col justify-between court-gold-frame">
        <div className="space-y-3.5">
            <div className="border-b border-[#C5A059]/20 pb-3">
                <span className="text-xs font-cinzel font-bold text-[#FFE898] uppercase tracking-wider block">
                    Consola de Verificación Epistémica
                </span>
                <p className="text-[11px] text-slate-400 font-garamond italic mt-0.5">
                    Coteje radicados, números de providencia o normas contra el portal indexado.
                </p>
            </div>

            <div>
                <label className="block text-[11px] text-[#DFBA73] font-cinzel font-bold mb-1">
                    Cita / Radicado / Criterio a Verificar:
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={testQuery}
                        onChange={(e) => onQueryChange(e.target.value)}
                        placeholder="Ej. Sentencia SU-049/24 radicado..."
                        className="flex-1 bg-[#0d0718] border border-[#C5A059]/30 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-[#C5A059] font-mono"
                    />
                    <button
                        type="button"
                        onClick={onTestRun}
                        disabled={isTesting || !testQuery.trim()}
                        className="px-4 py-2 bg-[#2a133d] hover:bg-[#3d1c5a] border border-[#C5A059] disabled:opacity-40 text-[#FFE898] rounded-xl text-xs font-cinzel font-bold shadow transition-all flex items-center gap-1.5"
                    >
                        {isTesting ? 'Verificando...' : 'Verificar ⚡'}
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
                <div className="p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-mono">
                    ⚠️ Incidencia de verificación: {errorMsg}
                </div>
            )}

            {/* Test Result Display */}
            {testResult && !errorMsg && (
                <div className="p-4 bg-[#0d0718] border border-[#C5A059]/30 rounded-xl space-y-2 text-xs font-garamond">
                    <div className="flex items-center justify-between">
                        <span className="font-cinzel font-bold text-[#FFE898]">
                            {testResult.portalDisplayName}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${testResult.isVerified ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-[#C5A059]/20 text-[#DFBA73] border border-[#C5A059]/30'}`}>
                            {testResult.verificationStatus}
                        </span>
                    </div>

                    <div className="text-[11px] text-slate-300 space-y-1">
                        <div><span className="text-[#DFBA73] font-medium">Título: </span>{testResult.extractedTitle}</div>
                        <div><span className="text-[#DFBA73] font-medium">Puntaje Match: </span><span className="font-mono text-emerald-400 font-bold">{testResult.matchScore}%</span></div>
                        <div className="text-slate-400 mt-1 italic">{testResult.extractedRulingSummary}</div>
                    </div>

                    <div className="pt-2 border-t border-[#C5A059]/20 text-[10px] font-mono text-slate-400">
                        Auditoría: {new Date(testResult.auditTimestamp).toLocaleTimeString()} • Selectores Validados
                    </div>
                </div>
            )}
        </div>

        <div className="p-3.5 bg-[#1f1508]/60 border border-[#C5A059]/30 rounded-xl text-[11px] text-amber-200 font-garamond">
            🛡️ <strong className="font-cinzel text-[#FFE898]">Garantía Anti-Alucinación:</strong> Toda providencia citada por el asistente debe coincidir con un radicado o providencia indexable en estos portales.
        </div>
    </div>
));
VerificationConsole.displayName = 'VerificationConsole';

// --- COMPONENTE PRINCIPAL ---

export const PortalConfigManager: React.FC = memo(() => {
    const [portals, setPortals] = useState<Record<string, PortalConfig>>(() => portalRegistryService.getAllPortals());
    const [selectedPortalKey, setSelectedPortalKey] = useState<string>('nuevo_portal');
    const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
    
    // Testing state
    const [testQuery, setTestQuery] = useState<string>('Sentencia SU-049/24 radicado 2021-00342');
    const [testResult, setTestResult] = useState<PortalVerificationResult | null>(null);
    const [isTesting, setIsTesting] = useState<boolean>(false);
    const [testError, setTestError] = useState<string | null>(null);

    // Form state
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
        jurisdiction: 'CO',
        country: 'Colombia',
        description: 'Portal configurado para verificar autenticidad de citas y documentos.',
        is_active: true,
        verification_mode: 'SCRAPING_SELECTOR'
    });

    const activePortal = portals[selectedPortalKey] || formData;

    const handleSelectPortal = useCallback((key: string) => {
        setSelectedPortalKey(key);
        setIsCreatingNew(false);
        const p = portals[key];
        if (p) {
            setFormData({ ...p });
        }
    }, [portals]);

    const handleStartCreateNew = useCallback(() => {
        setIsCreatingNew(true);
        setFormData({
            name: `portal_${Date.now().toString().slice(-4)}`,
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
            jurisdiction: 'CO',
            country: 'Colombia',
            description: 'Portal judicial y de jurisprudencia.',
            is_active: true,
            verification_mode: 'SCRAPING_SELECTOR'
        });
    }, []);

    const handleFieldChange = useCallback((field: keyof PortalConfig, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleSavePortal = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        portalRegistryService.registerPortal(formData);
        const updated = portalRegistryService.getAllPortals();
        setPortals(updated);
        setSelectedPortalKey(formData.name);
        setIsCreatingNew(false);
    }, [formData]);

    const handleRunVerificationTest = useCallback(async () => {
        if (!testQuery.trim()) return;
        setIsTesting(true);
        setTestError(null);
        try {
            const res = await portalRegistryService.verifyCitationAgainstPortal(testQuery, selectedPortalKey);
            setTestResult(res);
        } catch (error) {
            console.error("Error durante la verificación del portal:", error);
            setTestError("No se pudo completar la verificación. Revise los selectores y la conectividad.");
        } finally {
            setIsTesting(false);
        }
    }, [testQuery, selectedPortalKey]);

    return (
        <div className="bg-[#0d0718] border border-[#C5A059]/30 rounded-2xl p-6 shadow-2xl space-y-6 text-slate-100 court-gold-frame">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#C5A059]/20 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2a133d] border border-[#C5A059]/40 flex items-center justify-center text-xl shadow-md">
                        🌐
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-cinzel font-bold text-[#DFBA73] bg-[#C5A059]/15 px-2.5 py-0.5 rounded border border-[#C5A059]/25">
                                ESCUDO ANTI-ALUCINACIÓN
                            </span>
                            <span className="text-[10px] font-garamond italic text-slate-400">
                                PortalConfig & Judicial Scrapers
                            </span>
                        </div>
                        <h3 className="text-lg font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#DFBA73] via-[#FFE898] to-[#C5A059] tracking-wide mt-0.5">
                            Gestor de Portales Jurídicos & Verificación Oficial
                        </h3>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleStartCreateNew}
                    className="px-4 py-2 bg-gradient-to-r from-[#DFBA73] to-[#C5A059] hover:from-[#FFE898] hover:to-[#DFBA73] text-[#08040d] rounded-xl text-xs font-cinzel font-bold transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(197,160,89,0.3)]"
                >
                    <span>+</span>
                    <span>Agregar Portal</span>
                </button>
            </div>

            {/* Selector de Portales */}
            <PortalTabs 
                portals={portals} 
                selectedKey={selectedPortalKey} 
                isCreatingNew={isCreatingNew} 
                onSelect={handleSelectPortal} 
            />

            {/* Contenido Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <PortalFormInspector 
                    formData={formData}
                    isCreatingNew={isCreatingNew}
                    activeDisplayName={activePortal.display_name}
                    onChange={handleFieldChange}
                    onSubmit={handleSavePortal}
                />
                
                <VerificationConsole 
                    testQuery={testQuery}
                    isTesting={isTesting}
                    testResult={testResult}
                    errorMsg={testError}
                    onQueryChange={setTestQuery}
                    onTestRun={handleRunVerificationTest}
                />
            </div>
        </div>
    );
});
PortalConfigManager.displayName = 'PortalConfigManager';
export default PortalConfigManager;
