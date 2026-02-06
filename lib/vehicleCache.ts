"use client";

import { idbGet, idbSet } from "@/lib/idb";

export type VehicleRecord = {
    id: string;
    inventory: any;
    user?: any;
    isFavourite?: boolean;
};

type CachePayload<T> = {
    updatedAt: number;
    data: T;
};

const VEHICLES_KEY = "vehicles_v1";
const VEHICLES_TTL_MS = 5 * 60 * 1000;

let memoryVehicles: CachePayload<VehicleRecord[]> | null = null;
let listeners: Array<(payload: CachePayload<VehicleRecord[]>) => void> = [];

export const isStale = (updatedAt?: number, ttlMs: number = VEHICLES_TTL_MS) => {
    if (!updatedAt) return true;
    return Date.now() - updatedAt > ttlMs;
};

export const readVehicles = async () => {
    if (memoryVehicles) return memoryVehicles;
    try {
        const idb = await idbGet<CachePayload<VehicleRecord[]>>("vehicles", VEHICLES_KEY);
        if (idb) {
            memoryVehicles = idb;
            return idb;
        }
    } catch {}
    try {
        const raw = window.localStorage.getItem(VEHICLES_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as CachePayload<VehicleRecord[]>;
        memoryVehicles = parsed;
        return parsed;
    } catch {
        return null;
    }
};

export const writeVehicles = async (data: VehicleRecord[]) => {
    const payload: CachePayload<VehicleRecord[]> = { updatedAt: Date.now(), data };
    memoryVehicles = payload;
    try {
        await idbSet("vehicles", VEHICLES_KEY, payload);
    } catch {}
    try {
        window.localStorage.setItem(VEHICLES_KEY, JSON.stringify(payload));
    } catch {}
    listeners.forEach((l) => l(payload));
};

export const subscribeVehicles = (cb: (payload: CachePayload<VehicleRecord[]>) => void) => {
    listeners.push(cb);
    return () => {
        listeners = listeners.filter((l) => l !== cb);
    };
};

export const getMemoryVehicles = () => memoryVehicles;

// README (cache):
// - Stored in IndexedDB (db: "adpg-cache", store: "vehicles") with localStorage fallback.
// - TTL: VEHICLES_TTL_MS (default 5 minutes).
// - Clear cache: localStorage.removeItem("vehicles_v1") and delete IndexedDB "adpg-cache".
// - Debug worker: disable by setting USE_WORKER_THRESHOLD high in hooks/useVehicleBuckets.ts.
