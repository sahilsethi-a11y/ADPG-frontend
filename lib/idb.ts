type StoreName = "vehicles" | "buckets";

const DB_NAME = "adpg-cache";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

const openDb = () => {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains("vehicles")) {
                db.createObjectStore("vehicles");
            }
            if (!db.objectStoreNames.contains("buckets")) {
                db.createObjectStore("buckets");
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
    return dbPromise;
};

export async function idbGet<T>(store: StoreName, key: string): Promise<T | null> {
    if (typeof window === "undefined" || !("indexedDB" in window)) return null;
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, "readonly");
        const req = tx.objectStore(store).get(key);
        req.onsuccess = () => resolve((req.result as T) ?? null);
        req.onerror = () => reject(req.error);
    });
}

export async function idbSet<T>(store: StoreName, key: string, value: T): Promise<void> {
    if (typeof window === "undefined" || !("indexedDB" in window)) return;
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");
        tx.objectStore(store).put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function idbDel(store: StoreName, key: string): Promise<void> {
    if (typeof window === "undefined" || !("indexedDB" in window)) return;
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");
        tx.objectStore(store).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}
