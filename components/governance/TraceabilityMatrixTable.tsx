import React, { memo, useState, useMemo, useCallback } from 'react';
import type { CriticalPoint } from '../../types';
import { getVerificationStatusConfig, getDecisionLevelConfig, getConfidenceGradeConfig } from './ConfidenceIndicatorBar';
import { Copy, Check, Download, Search, Eye, Scale, Shield } from 'lucide-react';

interface TraceabilityMatrixTableProps {
    readonly criticalPoints: CriticalPoint[];
    readonly onJumpToReview?: (cpId: string) => void;
}

export const TraceabilityMatrixTable: React.FC<TraceabilityMatrixTableProps> = memo(({
    criticalPoints,
    onJumpToReview
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFICADA' | 'PARCIALMENTE_VERIFICADA' | 'NO_VERIFICADA'>('ALL');
    const [confidenceFilter, setConfidenceFilter] = useState<'ALL' | 'A' | 'B' | 'C' | 'D'>('ALL');
    const [copySuccess, setCopySuccess] = useState(false);

    // Filtrado memorizado para evitar recálculos innecesarios
    const filteredPoints = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        return criticalPoints.filter(cp => {
            const matchesSearch = query === '' || 
                (cp.category?.toLowerCase().includes(query)) ||
                (cp.type?.toLowerCase().includes(query)) ||
                (cp.traceabilityChain?.conclusion?.toLowerCase().includes(query)) ||
                (cp.fourLevelDecomposition?.applicableNorm?.toLowerCase().includes(query)) ||
                (cp.observedEvidenceAndTechnicalProblem?.toLowerCase().includes(query));

            const matchesStatus = statusFilter === 'ALL' || (cp.verificationStatus || 'VERIFICADA') === statusFilter;
            const matchesConfidence = confidenceFilter === 'ALL' || (cp.confidenceLevel || 'A') === confidenceFilter;

            return matchesSearch && matchesStatus && matchesConfidence;
        });
    }, [criticalPoints, searchQuery, statusFilter, confidenceFilter]);

    // Manejador de exportación CSV optimizado y seguro
    const handleExportCSV = useCallback(() => {
        const headers = ['Cargo #', 'Categoría', 'Conclusión Jurídica', 'Estado Verificación', 'Nivel Decisión', 'Grado Confianza', 'Norma Aplicable', 'Hecho Verificado', 'Fuente / Folio'];
        const rows = filteredPoints.map((cp, idx) => [
            `#${idx + 1}`,
            `"${(cp.category || cp.type || '').replace(/"/g, '""')}"`,
            `"${(cp.traceabilityChain?.conclusion || cp.fourLevelDecomposition?.legalConclusion || cp.type || '').replace(/"/g, '""')}"`,
            `"${cp.verificationStatus || 'VERIFICADA'}"`,
            `"${cp.decisionLevel || 'Confirmado'}"`,
            `"${cp.confidenceLevel || 'A'}"`,
            `"${(cp.traceabilityChain?.normOrPrecedent || cp.fourLevelDecomposition?.applicableNorm || '').replace(/"/g, '""')}"`,
            `"${(cp.traceabilityChain?.fact || cp.fourLevelDecomposition?.verifiedFact || cp.observedEvidenceAndTechnicalProblem || '').replace(/"/g, '""')}"`,
            `"${(cp.traceabilityChain?.sourceDocumentAndFolio || 'Expediente Principal').replace(/"/g, '""')}"`,
        ]);

        const csvContent = '\uFEFFdata:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `matriz_trazabilidad_sovereign_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [filteredPoints]);

    // Manejador de copiado general optimizado
    const handleCopyAll = useCallback(() => {
        const text = filteredPoints.map((cp, idx) => {
            return `[#${idx + 1}] ${cp.category || cp.type}
Conclusión: ${cp.traceabilityChain?.conclusion || cp.fourLevelDecomposition?.legalConclusion || cp.type}
Norma: ${cp.traceabilityChain?.normOrPrecedent || cp.fourLevelDecomposition?.applicableNorm || 'N/A'}
Hecho: ${cp.traceabilityChain?.fact || cp.fourLevelDecomposition?.verifiedFact || cp.observedEvidenceAndTechnicalProblem || 'N/A'}
Fuente: ${cp.traceabilityChain?.sourceDocumentAndFolio || 'Expediente'}
Estado: ${cp.verificationStatus || 'VERIFICADA'} | Confianza: ${cp.confidenceLevel || 'A'}
----------------------------------------------------------------`;
        }).join('\n\n');

        navigator.clipboard.writeText(text);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    }, [filteredPoints]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    }, []);

    const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value as 'ALL' | 'VERIFICADA' | 'PARCIALMENTE_VERIFICADA' | 'NO_VERIFICADA');
    }, []);

    const handleConfidenceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setConfidenceFilter(e.target.value as 'ALL' | 'A' | 'B' | 'C' | 'D');
    }, []);

    return (
        <div id="traceability-matrix-table" className="court-gold-frame p-6 sm:p-8 text-slate-100 space-y-5">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#C5A059]/30 pb-4">
                <div>
                    <span className="text-[10px] font-cinzel tracking-widest text-[#f5d76e] uppercase font-bold block">
                        FORENSIC LINEAGE MATRIX • REGISTRO DE FE PÚBLICA
                    </span>
                    <h3 className="text-xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFFDF0] via-[#E8CA7A] to-[#C5A059] tracking-wide mt-0.5">
                        Matriz General de Trazabilidad Jurídica y Probatoria
                    </h3>
                    <p className="text-xs text-amber-200/70 font-garamond italic text-sm">
                        Inspección tabular con linaje directo para cada conclusión del dictamen
                    </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                        onClick={handleCopyAll}
                        className="px-3.5 py-1.5 text-xs font-cinzel font-bold rounded-xl bg-[#1a0c26] hover:bg-[#28133b] text-amber-200 border border-[#8a6827] flex items-center gap-1.5 transition-colors shadow-inner"
                    >
                        {copySuccess ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Copiado</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5 text-[#DFBA73]" />
                                <span>Copiar Todo</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleExportCSV}
                        className="px-3.5 py-1.5 text-xs font-cinzel font-black rounded-xl bg-gradient-to-r from-[#2a133d] to-[#12071d] hover:from-[#3d1c58] hover:to-[#220d36] text-[#f5d76e] border border-[#C5A059]/70 shadow-md flex items-center gap-1.5 transition-all"
                    >
                        <Download className="w-3.5 h-3.5 text-[#f5d76e]" />
                        <span>Exportar CSV</span>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                    <label className="text-[10px] font-cinzel font-bold text-[#f5d76e] block mb-1 uppercase tracking-wider">
                        Buscar por hecho, norma o texto:
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Filtrar matriz jurídica..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full pl-8 pr-3 py-2 text-xs bg-[#0d0515] border border-[#8a6827]/50 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#DFBA73] font-garamond text-sm shadow-inner"
                        />
                        <Search className="w-3.5 h-3.5 text-[#DFBA73] absolute left-2.5 top-2.5" />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-cinzel font-bold text-[#f5d76e] block mb-1 uppercase tracking-wider">
                        Filtrar por Estado de Verificación:
                    </label>
                    <select
                        value={statusFilter}
                        onChange={handleStatusChange}
                        className="w-full px-3 py-2 text-xs bg-[#0d0515] border border-[#8a6827]/50 rounded-xl text-slate-200 focus:outline-none focus:border-[#DFBA73] font-cinzel font-semibold shadow-inner"
                    >
                        <option value="ALL">Todos los Estados (🟢 🟡 🔴)</option>
                        <option value="VERIFICADA">🟢 Verificadas</option>
                        <option value="PARCIALMENTE_VERIFICADA">🟡 Parcialmente Verificadas</option>
                        <option value="NO_VERIFICADA">🔴 No Verificadas</option>
                    </select>
                </div>

                <div>
                    <label className="text-[10px] font-cinzel font-bold text-[#f5d76e] block mb-1 uppercase tracking-wider">
                        Filtrar por Grado de Confianza:
                    </label>
                    <select
                        value={confidenceFilter}
                        onChange={handleConfidenceChange}
                        className="w-full px-3 py-2 text-xs bg-[#0d0515] border border-[#8a6827]/50 rounded-xl text-slate-200 focus:outline-none focus:border-[#DFBA73] font-cinzel font-semibold shadow-inner"
                    >
                        <option value="ALL">Todos los Grados (A / B / C / D)</option>
                        <option value="A">Nivel A: Certeza Directa</option>
                        <option value="B">Nivel B: Evidencia + Inferencia</option>
                        <option value="C">Nivel C: Plausible</option>
                        <option value="D">Nivel D: No Verificada</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#8a6827]/50 shadow-inner">
                <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#08030d] text-[#f5d76e] font-cinzel text-[11px] uppercase border-b border-[#C5A059]/40 tracking-wider font-bold">
                        <tr>
                            <th className="p-3.5 w-12">#</th>
                            <th className="p-3.5 w-1/4">Conclusión Jurídica</th>
                            <th className="p-3.5 w-32">Estado / Confianza</th>
                            <th className="p-3.5 w-1/4">Norma & Precedente</th>
                            <th className="p-3.5 w-1/4">Hecho & Fuente</th>
                            <th className="p-3.5 w-16 text-center">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#8a6827]/30 bg-[#12071d]/80">
                        {filteredPoints.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-amber-200/60 font-cinzel text-xs">
                                    No se encontraron conclusiones con los filtros seleccionados.
                                </td>
                            </tr>
                        ) : (
                            filteredPoints.map((cp, idx) => {
                                const verification = getVerificationStatusConfig(cp.verificationStatus);
                                const confidence = getConfidenceGradeConfig(cp.confidenceLevel);
                                const conclusion = cp.traceabilityChain?.conclusion || cp.fourLevelDecomposition?.legalConclusion || cp.type;
                                const norm = cp.traceabilityChain?.normOrPrecedent || cp.fourLevelDecomposition?.applicableNorm || 'Norma imperativa';
                                const fact = cp.traceabilityChain?.fact || cp.fourLevelDecomposition?.verifiedFact || cp.observedEvidenceAndTechnicalProblem || 'Hecho verificado';
                                const source = cp.traceabilityChain?.sourceDocumentAndFolio || 'Expediente Principal';

                                return (
                                    <tr key={cp.id} className="hover:bg-[#200e30]/80 transition-colors">
                                        <td className="p-3.5 font-cinzel font-black text-[#f5d76e]">
                                            #{idx + 1}
                                        </td>
                                        <td className="p-3.5 space-y-1">
                                            <span className="text-[10px] font-cinzel text-[#f5d76e] uppercase block font-bold">
                                                {cp.category || cp.type}
                                            </span>
                                            <span className="font-cinzel font-bold text-slate-100 block leading-snug">
                                                {conclusion}
                                            </span>
                                        </td>
                                        <td className="p-3.5 space-y-1.5">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-cinzel font-bold ${verification.badgeBg}`}>
                                                <span>{verification.icon}</span>
                                                <span>{verification.label}</span>
                                            </span>
                                            <span className={`block w-fit px-2 py-0.5 rounded text-[10px] font-cinzel font-bold ${confidence.color}`}>
                                                {confidence.grade}
                                            </span>
                                        </td>
                                        <td className="p-3.5">
                                            <p className="text-slate-300 text-xs font-garamond italic text-sm leading-snug line-clamp-3" title={norm}>
                                                {norm}
                                            </p>
                                        </td>
                                        <td className="p-3.5 space-y-1">
                                            <p className="text-slate-300 text-xs font-garamond italic text-sm leading-snug line-clamp-2" title={fact}>
                                                {fact}
                                            </p>
                                            <span className="text-[10px] text-amber-200/80 font-mono block truncate" title={source}>
                                                Folio: {source}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-center">
                                            {onJumpToReview && (
                                                <button
                                                    onClick={() => onJumpToReview(cp.id)}
                                                    className="p-2 rounded-xl bg-[#2a133d] hover:bg-[#3d1c58] text-[#f5d76e] hover:text-white border border-[#C5A059]/50 transition-colors shadow"
                                                    title="Examinar en detalle"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

TraceabilityMatrixTable.displayName = 'TraceabilityMatrixTable';

export default TraceabilityMatrixTable;
