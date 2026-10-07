import type { Attachment, FullAnalysisResult, CachedAnalysisResult, AIPersonality, CaseDocumentType } from '../types';

const DB_NAME = 'StrategicAnalysisDB';
const STORE_NAME = 'analysisCache';
const DB_VERSION = 1;
const MAX_CACHE_ITEMS = 20; // Set a limit for the number of cached items

let db: IDBDatabase | null = null;
let isIndexedDBAvailable = true;
const memoryCache = new Map<string, CachedAnalysisResult>();

/**
 * Initializes the IndexedDB database.
 * @returns A promise that resolves with the database instance.
 */
function initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (!isIndexedDBAvailable) {
            return reject('IndexedDB is marked as unavailable. Using memory cache.');
        }
        if (db) {
            return resolve(db);
        }

        try {
            if (typeof indexedDB === 'undefined') {
                isIndexedDBAvailable = false;
                return reject('IndexedDB is not supported in this environment.');
            }
            
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const dbInstance = (event.target as IDBOpenDBRequest).result;
                if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
                    dbInstance.createObjectStore(STORE_NAME, { keyPath: 'cacheKey' });
                }
            };

            request.onsuccess = (event) => {
                db = (event.target as IDBOpenDBRequest).result;
                resolve(db);
            };

            request.onerror = (event) => {
                console.warn('Error opening IndexedDB, falling back to memory cache:', (event.target as IDBOpenDBRequest).error);
                isIndexedDBAvailable = false;
                reject('Error opening IndexedDB.');
            };
        } catch (err) {
            console.warn('IndexedDB failed to initialize due to context constraints, falling back to memory cache:', err);
            isIndexedDBAvailable = false;
            reject(err);
        }
    });
}

/**
 * A utility to promisify an IDBRequest.
 * @param request The IndexedDB request.
 * @returns A promise that resolves or rejects with the request result.
 */
function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * A utility to promisify an IDBTransaction.
 * @param tx The IndexedDB transaction.
 * @returns A promise that resolves on completion or rejects on error.
 */
function promisifyTransaction(tx: IDBTransaction): Promise<void> {
     return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
}

/**
 * Generates a SHA-256 hash for a given string.
 * Falls back to a simple hash if the Web Crypto API is not available.
 * @param str The string to hash.
 * @returns A promise that resolves to the hex-encoded hash string.
 */
async function sha256(str: string): Promise<string> {
    // Check if the Web Crypto API is available
    if (typeof crypto !== 'undefined' && crypto.subtle) {
        try {
            const buffer = new TextEncoder().encode(str);
            const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (err) {
            console.warn('Web Crypto API failed, falling back to simple hash:', err);
            // Fall through to fallback
        }
    } else {
        console.warn('Web Crypto API not available, falling back to simple hash for cache key generation.');
    }
    
    // Fallback: simple djb2 hash -> 32-bit integer -> hex string (8 chars)
    // Note: This is not cryptographically secure but sufficient for cache key differentiation.
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c
    }
    // Convert to unsigned 32-bit
    hash = hash >>> 0;
    // Return as hex string, padded to 8 characters (32 bits)
    return hash.toString(16).padStart(8, '0');
}


/**
 * Generates a unique cache key (fingerprint) for a given analysis setup.
 * @param primaryFile The main document for analysis.
 * @param evidenceFiles Array of supporting evidence files.
 * @param settings An object with analysis mode, AI personality, and document type.
 * @returns A promise that resolves to a unique SHA-256 hash key.
 */
export async function generateCacheKey(
    primaryFile: Attachment,
    evidenceFiles: Attachment[],
    settings: { aiPersonality: AIPersonality, documentType: CaseDocumentType }
): Promise<string> {
    const primaryFileInfo = `${primaryFile.name}|${primaryFile.size}|${primaryFile.type}`;
    const evidenceInfo = evidenceFiles
        .map(f => `${f.name}|${f.size}|${f.type}`)
        .sort()
        .join(';');
    
    const settingsInfo = `${settings.aiPersonality}|${settings.documentType}`;

    const keyString = `${primaryFileInfo};${evidenceInfo};${settingsInfo}`;

    return sha256(keyString);
}


/**
 * Saves an analysis result to the IndexedDB cache with an LRU eviction policy.
 * @param cacheKey The unique key for the analysis.
 * @param result The full analysis result object to save.
 */
export async function saveResult(cacheKey: string, result: FullAnalysisResult): Promise<void> {
    const dataToStore: CachedAnalysisResult = {
        cacheKey,
        timestamp: Date.now(),
        result,
    };

    if (!isIndexedDBAvailable) {
        memoryCache.set(cacheKey, dataToStore);
        if (memoryCache.size > MAX_CACHE_ITEMS) {
            const sorted = Array.from(memoryCache.values()).sort((a, b) => a.timestamp - b.timestamp);
            const oldest = sorted[0];
            if (oldest) {
                memoryCache.delete(oldest.cacheKey);
            }
        }
        return;
    }

    try {
        const dbInstance = await initDB();
        const transaction = dbInstance.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        // LRU Cache eviction logic
        const allItemsReq = store.getAll();
        const allItems = await promisifyRequest<CachedAnalysisResult[]>(allItemsReq);

        if (allItems.length >= MAX_CACHE_ITEMS) {
            allItems.sort((a, b) => a.timestamp - b.timestamp); // Sort by oldest first
            const oldestItem = allItems[0];
            if (oldestItem) {
                console.log(`Cache limit reached. Evicting oldest item: ${oldestItem.cacheKey}`);
                store.delete(oldestItem.cacheKey);
            }
        }

        store.put(dataToStore);
        return promisifyTransaction(transaction);
    } catch (err) {
        console.warn('Fallo guardando en IndexedDB, utilizando caché de memoria para esta sesión:', err);
        isIndexedDBAvailable = false;
        memoryCache.set(cacheKey, dataToStore);
    }
}

/**
 * Retrieves an analysis result from the IndexedDB cache and updates its timestamp (making it recently used).
 * @param cacheKey The unique key for the analysis.
 * @returns A promise that resolves with the cached result or null if not found.
 */
export async function getResult(cacheKey: string): Promise<FullAnalysisResult | null> {
    if (!isIndexedDBAvailable) {
        const cached = memoryCache.get(cacheKey);
        if (cached) {
            cached.timestamp = Date.now();
            return cached.result;
        }
        return null;
    }

    try {
        const dbInstance = await initDB();
        const transaction = dbInstance.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const request = store.get(cacheKey);
        const result = await promisifyRequest<CachedAnalysisResult | undefined>(request);

        if (result) {
            // Update timestamp to mark it as recently used
            result.timestamp = Date.now();
            store.put(result);
            await promisifyTransaction(transaction);
            return result.result;
        }
        
        await promisifyTransaction(transaction);
        return null;
    } catch (err) {
        console.warn('Fallo leyendo IndexedDB, buscando en caché de memoria:', err);
        isIndexedDBAvailable = false;
        const cached = memoryCache.get(cacheKey);
        if (cached) {
            cached.timestamp = Date.now();
            return cached.result;
        }
        return null;
    }
}

/**
 * Clears all entries from the analysis cache store (Strategic Memory).
 */
export async function clearCache(): Promise<void> {
    memoryCache.clear();
    if (!isIndexedDBAvailable) {
        return;
    }
    try {
        const dbInstance = await initDB();
        const transaction = dbInstance.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        await promisifyRequest(request); // Wait for the clear operation to succeed/fail
        return promisifyTransaction(transaction); // Wait for the transaction to complete
    } catch (err) {
        console.warn('Fallo al limpiar IndexedDB:', err);
    }
}
