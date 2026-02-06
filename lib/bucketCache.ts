"use client";

import { idbGet, idbSet } from "@/lib/idb";

export type BucketMeta = {
    bucketKey: string;
    representativeId?: string;
    sellerId?: string;
    sellerName?: string;
    brand?: string;
    model?: string;
    variant?: string;
    color?: string;
    year?: number;
    condition?: string;
    bodyType?: string;
    count: number;
    minPrice: number;
    maxPrice: number;
    currency?: string;
    heroImageUrl?: string;
    vehicleIds?: string[];
};

type BucketPayload = {
    updatedAt: number;
    sourceVehiclesUpdatedAt?: number;
    buckets: BucketMeta[];
};

const BUCKETS_KEY = "buckets_v1";

let memoryBuckets: BucketPayload | null = null;
let listeners: Array<(payload: BucketPayload) => void> = [];

export const readBuckets = async () => {
    if (memoryBuckets) return memoryBuckets;
    try {
        const idb = await idbGet<BucketPayload>("buckets", BUCKETS_KEY);
        if (idb) {
            memoryBuckets = idb;
            return idb;
        }
    } catch {}
    try {
        const raw = window.localStorage.getItem(BUCKETS_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as BucketPayload;
        memoryBuckets = parsed;
        return parsed;
    } catch {
        return null;
    }
};

export const writeBuckets = async (buckets: BucketMeta[], sourceVehiclesUpdatedAt?: number) => {
    const payload: BucketPayload = {
        updatedAt: Date.now(),
        sourceVehiclesUpdatedAt,
        buckets,
    };
    memoryBuckets = payload;
    try {
        await idbSet("buckets", BUCKETS_KEY, payload);
    } catch {}
    try {
        window.localStorage.setItem(BUCKETS_KEY, JSON.stringify(payload));
    } catch {}
    listeners.forEach((l) => l(payload));
};

export const subscribeBuckets = (cb: (payload: BucketPayload) => void) => {
    listeners.push(cb);
    return () => {
        listeners = listeners.filter((l) => l !== cb);
    };
};

export const getMemoryBuckets = () => memoryBuckets;

// README (bucket cache):
// - Stored in IndexedDB (db: "adpg-cache", store: "buckets") with localStorage fallback.
// - Invalidate when vehicles updated (sourceVehiclesUpdatedAt mismatch).
// - Clear cache: localStorage.removeItem("buckets_v1") and delete IndexedDB "adpg-cache".
