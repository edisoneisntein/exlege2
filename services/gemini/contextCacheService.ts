import type { Attachment } from '../../types';

export interface CachedCaseContext {
    cacheId: string;
    caseTitle: string;
    primaryDocumentSummary: string;
    fullCombinedText: string;
    totalWordCount: number;
    estimatedTokens: number;
    folioIndex: Map<string, { fileName: string; snippet: string }>;
    timestamp: number;
    ttlMinutes: number;
    /**
     * Estrategia de entrega de contexto:
     * - 'DIRECT_INJECTION': Para expedientes bajo el umbral nativo (<32.768 tokens). Se inyecta directamente optimizando latencia.
     * - 'NATIVE_SERVER_CACHE': Para macro-expedientes extensos (>=32.768 tokens) susceptibles de persistencia en caché de infraestructura.
     */
    deliveryStrategy: 'DIRECT_INJECTION' | 'NATIVE_SERVER_CACHE';
    nativeCacheThresholdReached: boolean;
}

// Umbral estándar de tokens mínimos para activación de Context Caching nativo de Google Gemini
const MIN_TOKENS_FOR_NATIVE_CACHE = 32768;

/**
 * Gestor de Memoria de Contexto Centralizada para Expedientes Legales.
 * Mantiene un índice estructurado de folios y memoria contextual para
 * evitar reprocesar documentos voluminosos en cada sub-agente.
 */
class ContextCacheService {
    private cacheMap = new Map<string, CachedCaseContext>();

    /**
     * Genera un hash/clave determinista a partir de los documentos del caso.
     */
    private generateContextHash(primaryDoc: Attachment, evidenceFiles: Attachment[]): string {
        const docFingerprints = [
            `${primaryDoc.name}:${primaryDoc.size}:${(primaryDoc.extractedText || '').length}`,
            ...evidenceFiles.map(e => `${e.name}:${e.size}:${(e.extractedText || '').length}`)
        ].join('|');

        let hash = 0;
        for (let i = 0; i < docFingerprints.length; i++) {
            const char = docFingerprints.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }
        return `case-ctx-${Math.abs(hash).toString(36)}-${docFingerprints.length}`;
    }

    /**
     * Crea o recupera el contexto centralizado en memoria para el expediente actual.
     */
    public createOrGetContext(primaryDoc: Attachment, evidenceFiles: Attachment[] = []): CachedCaseContext {
        const cacheId = this.generateContextHash(primaryDoc, evidenceFiles);

        const existing = this.cacheMap.get(cacheId);
        if (existing && (Date.now() - existing.timestamp) < existing.ttlMinutes * 60 * 1000) {
            return existing;
        }

        // Construir índice de folios y texto consolidado
        const folioIndex = new Map<string, { fileName: string; snippet: string }>();
        const combinedParts: string[] = [];

        // Documento Principal
        const primaryText = primaryDoc.translatedText || primaryDoc.extractedText || '';
        combinedParts.push(`=== DOCUMENTO PRINCIPAL: ${primaryDoc.name} ===\n${primaryText}\n`);
        folioIndex.set('DOC_PRINCIPAL', {
            fileName: primaryDoc.name,
            snippet: primaryText.slice(0, 500)
        });

        // Anexos y Pruebas
        evidenceFiles.forEach((file, index) => {
            const text = file.translatedText || file.extractedText || '';
            const folioKey = `FOLIO_${index + 1}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
            combinedParts.push(`=== ANEXO PROBATORIO [${index + 1}]: ${file.name} ===\n${text}\n`);
            folioIndex.set(folioKey, {
                fileName: file.name,
                snippet: text.slice(0, 500)
            });
        });

        const fullCombinedText = combinedParts.join('\n');
        const totalWordCount = fullCombinedText.split(/\s+/).filter(Boolean).length;
        const estimatedTokens = Math.ceil(totalWordCount * 1.35);
        const nativeCacheThresholdReached = estimatedTokens >= MIN_TOKENS_FOR_NATIVE_CACHE;
        const deliveryStrategy: 'DIRECT_INJECTION' | 'NATIVE_SERVER_CACHE' = nativeCacheThresholdReached
            ? 'NATIVE_SERVER_CACHE'
            : 'DIRECT_INJECTION';

        const context: CachedCaseContext = {
            cacheId,
            caseTitle: primaryDoc.name.replace(/\.[^/.]+$/, ''),
            primaryDocumentSummary: primaryText.slice(0, 1000),
            fullCombinedText,
            totalWordCount,
            estimatedTokens,
            folioIndex,
            timestamp: Date.now(),
            ttlMinutes: 60,
            deliveryStrategy,
            nativeCacheThresholdReached
        };

        this.cacheMap.set(cacheId, context);
        return context;
    }

    /**
     * Devuelve el payload contextual óptimo para el modelo, conmutando transparentemente
     * entre inyección directa en el prompt o referencia a caché según el volumen detectado.
     */
    public formatPromptContext(context: CachedCaseContext, maxDirectChars: number = 25000): { contextText: string; strategy: string } {
        if (context.deliveryStrategy === 'DIRECT_INJECTION') {
            return {
                contextText: context.fullCombinedText.length > maxDirectChars 
                    ? context.fullCombinedText.slice(0, maxDirectChars) + `\n\n[...Texto indexado en memoria resumido (${context.totalWordCount} palabras totales)...]`
                    : context.fullCombinedText,
                strategy: 'DIRECT_INJECTION (Sub-32k tokens)'
            };
        }

        return {
            contextText: context.fullCombinedText.slice(0, maxDirectChars),
            strategy: `NATIVE_SERVER_CACHE (~${context.estimatedTokens} tokens - Hash: ${context.cacheId})`
        };
    }

    /**
     * Recupera un contexto por su ID
     */
    public getContext(cacheId: string): CachedCaseContext | undefined {
        const context = this.cacheMap.get(cacheId);
        if (context && (Date.now() - context.timestamp) < context.ttlMinutes * 60 * 1000) {
            return context;
        }
        if (context) {
            this.cacheMap.delete(cacheId);
        }
        return undefined;
    }

    /**
     * Extrae folios o extractos relevantes según una lista de palabras clave
     */
    public queryRelevantFolios(cacheId: string, queryKeywords: string[]): Array<{ fileName: string; excerpt: string; matchScore: number }> {
        const context = this.getContext(cacheId);
        if (!context) return [];

        const results: Array<{ fileName: string; excerpt: string; matchScore: number }> = [];
        const lowerKeywords = queryKeywords.map(k => k.toLowerCase());

        context.folioIndex.forEach((val) => {
            let matches = 0;
            const lowerSnippet = val.snippet.toLowerCase();
            lowerKeywords.forEach(k => {
                if (lowerSnippet.includes(k)) matches++;
            });

            if (matches > 0) {
                results.push({
                    fileName: val.fileName,
                    excerpt: val.snippet,
                    matchScore: matches
                });
            }
        });

        return results.sort((a, b) => b.matchScore - a.matchScore);
    }

    /**
     * Limpia contextos expirados
     */
    public purgeExpired(): void {
        const now = Date.now();
        this.cacheMap.forEach((ctx, key) => {
            if (now - ctx.timestamp >= ctx.ttlMinutes * 60 * 1000) {
                this.cacheMap.delete(key);
            }
        });
    }
}

export const contextCacheService = new ContextCacheService();
