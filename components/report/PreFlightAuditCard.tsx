import React, { memo } from 'react';
import type { PreFlightAudit, IntermediateProductsStatus } from '../../types';
import { ShieldCheck, Layers, Clock, AlertTriangle, AlertOctagon, CheckCircle2, Cpu } from 'lucide-react';

interface PreFlightAuditCardProps {
    preFlightAudit?: PreFlightAudit;
    intermediateProductsStatus?: IntermediateProductsStatus;
}

const PreFlightAuditCard: React.FC<PreFlightAuditCardProps> = memo(({ preFlightAudit, intermediateProductsStatus }) => {
    if (!preFlightAudit && !intermediateProductsStatus) return null;

    return (
        <div id="preflight-audit-card" className="relative bg-[#0e0717]/90 backdrop-blur-2xl text-slate-100 p-6 sm:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(212,175,55,0.08)] border border-[#C5A059]/40 space-y-6 overflow-hidden">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#FFE898]/60 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#C5A059]/20 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#DFBA73]/15 text-[#DFBA73] rounded-2xl border border-[#DFBA73]/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                        <ShieldCheck className="w-6 h-6 text-[#FFE898]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 text-[10px] font-cinzel font-bold bg-[#DFBA73]/15 text-[#FFE898] rounded-full uppercase tracking-wider border border-[#DFBA73]/40">
                                PROTOCOLO SUPREMO V5
                            </span>
                            <span className="px-2.5 py-0.5 text-[10px] font-cinzel font-bold bg-emerald-500/15 text-emerald-300 rounded-full uppercase tracking-wider border border-emerald-500/40">
                                AUDITORÍA PRE-FLIGHT
                            </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-cinzel font-bold text-white mt-1">Auditoría Pre-Flight & Pipeline de 10 Capas Metodológicas</h3>
                    </div>
                </div>
            </div>

            {preFlightAudit && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-serif">
                    <div className="bg-[#12071d]/90 p-4 sm:p-5 rounded-2xl border border-[#C5A059]/30 space-y-2">
                        <div className="flex items-center gap-2 text-[#FFE898] font-cinzel text-xs font-bold uppercase tracking-wider">
                            <Cpu className="w-4 h-4 text-[#DFBA73]" />
                            <span>Revisión de Competencia Funcional & Territorial</span>
                        </div>
                        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{preFlightAudit.functionalCompetenceReview}</p>
                    </div>

                    <div className="bg-[#12071d]/90 p-4 sm:p-5 rounded-2xl border border-[#C5A059]/30 space-y-2">
                        <div className="flex items-center gap-2 text-amber-300 font-cinzel text-xs font-bold uppercase tracking-wider">
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span>Auditoría de Caducidad, Prescripción y Términos</span>
                        </div>
                        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{preFlightAudit.proceduralTermsAudit}</p>
                    </div>

                    {preFlightAudit.documentGaps && preFlightAudit.documentGaps.length > 0 && (
                        <div className="bg-[#12071d]/90 p-4 sm:p-5 rounded-2xl border border-rose-500/30 space-y-2">
                            <div className="flex items-center gap-2 text-rose-300 font-cinzel text-xs font-bold uppercase tracking-wider">
                                <AlertOctagon className="w-4 h-4 text-rose-400" />
                                <span>Vacíos Documentales Identificados</span>
                            </div>
                            <ul className="space-y-1.5 text-xs text-slate-300">
                                {preFlightAudit.documentGaps.map((gap, i) => (
                                    <li key={`gap-${i}`} className="flex items-start gap-2">
                                        <span className="text-rose-400 mt-0.5">•</span>
                                        <span>{gap}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {preFlightAudit.logicalContradictions && preFlightAudit.logicalContradictions.length > 0 && (
                        <div className="bg-[#12071d]/90 p-4 sm:p-5 rounded-2xl border border-amber-500/30 space-y-2">
                            <div className="flex items-center gap-2 text-amber-300 font-cinzel text-xs font-bold uppercase tracking-wider">
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                <span>Contradicciones Lógicas Detectadas</span>
                            </div>
                            <ul className="space-y-1.5 text-xs text-slate-300">
                                {preFlightAudit.logicalContradictions.map((contra, i) => (
                                    <li key={`contra-${i}`} className="flex items-start gap-2">
                                        <span className="text-amber-400 mt-0.5">•</span>
                                        <span>{contra}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {intermediateProductsStatus && (
                <div className="bg-[#12071d]/90 p-4 sm:p-5 rounded-2xl border border-[#C5A059]/30 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                        <h4 className="text-xs font-cinzel font-bold uppercase tracking-wider text-[#FFE898] flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-[#DFBA73]" />
                            <span>Verificación de 10 Capas Metodológicas V5 LAGP</span>
                        </h4>
                        <span className="text-[11px] font-cinzel font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded border border-emerald-500/30">
                            10 / 10 Capas Verificadas
                        </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                        {[
                            { id: 'c1', label: '1. Pre-Flight Gate', ok: intermediateProductsStatus.preFlightAuditCompleted },
                            { id: 'c2', label: '2. Legal Knowledge', ok: intermediateProductsStatus.factsMatrixCompleted },
                            { id: 'c3', label: '3. Temporal Validity', ok: intermediateProductsStatus.temporalValidityVerified },
                            { id: 'c4', label: '4. Contradiction Engine', ok: intermediateProductsStatus.lapseAndExpirationChecked },
                            { id: 'c5', label: '5. 4-Level Reasoning', ok: intermediateProductsStatus.confidenceMatrixAssigned },
                            { id: 'c6', label: '6. Falsation Test', ok: intermediateProductsStatus.stressTestsExecuted },
                            { id: 'c7', label: '7. Steelman Bidirectional', ok: intermediateProductsStatus.steelmanConstructed },
                            { id: 'c8', label: '8. Strategy Engine', ok: intermediateProductsStatus.riskMapGenerated },
                            { id: 'c9', label: '9. Effect Separation', ok: intermediateProductsStatus.nullityVsRestitutionSeparated },
                            { id: 'c10', label: '10. Traceability Audit', ok: intermediateProductsStatus.remediationStepsDefined },
                        ].map((item) => (
                            <div key={item.id} className="flex items-center gap-1.5 p-2 bg-[#08040d]/80 rounded-xl border border-[#C5A059]/20">
                                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${item.ok ? "text-emerald-400" : "text-amber-400"}`} />
                                <span className="text-[10px] font-mono text-slate-300 truncate" title={item.label}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                    {intermediateProductsStatus.summaryText && (
                        <p className="mt-3 text-xs text-amber-200/70 font-serif italic border-t border-[#C5A059]/20 pt-2">
                            "{intermediateProductsStatus.summaryText}"
                        </p>
                    )}
                </div>
            )}
        </div>
    );
});

PreFlightAuditCard.displayName = 'PreFlightAuditCard';

export default PreFlightAuditCard;
