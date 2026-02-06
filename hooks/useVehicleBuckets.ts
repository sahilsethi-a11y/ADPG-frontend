"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getMemoryVehicles, readVehicles, subscribeVehicles, writeVehicles, isStale } from "@/lib/vehicleCache";
import { getMemoryBuckets, readBuckets, subscribeBuckets, writeBuckets, type BucketMeta } from "@/lib/bucketCache";
import { toBucketMeta } from "@/lib/bucketing";
import { api } from "@/lib/api/client-request";

const VEHICLE_TTL_MS = 5 * 60 * 1000;
const USE_WORKER_THRESHOLD = 300;
const DEV_LOG = process.env.NODE_ENV === "development";

const fetchAllVehicles = async (params: Record<string, unknown>) => {
    const res = await api.get<{ data: any }>("/inventory/api/v1/inventory/search", { params });
    const data = res.data;
    let all = data.content ?? [];

    const totalPages = Number(data.totalPages ?? 0);
    if (totalPages > 1) {
        const seen = new Set<string>();
        for (const item of all) {
            const id = item?.inventory?.id ?? item?.id;
            if (id) seen.add(id);
        }
        const pages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
        const batchSize = 6;
        for (let i = 0; i < pages.length; i += batchSize) {
            const batch = pages.slice(i, i + batchSize);
            const results = await Promise.all(
                batch.map((page) => api.get<{ data: any }>("/inventory/api/v1/inventory/search", { params: { ...params, page } }))
            );
            for (const r of results) {
                const list = r.data?.content ?? [];
                for (const item of list) {
                    const id = item?.inventory?.id ?? item?.id;
                    if (!id || seen.has(id)) continue;
                    seen.add(id);
                    all.push(item);
                }
            }
        }
    }
    return { vehicles: all, updatedAt: Date.now(), totalItems: data.totalItems };
};

const computeBucketsIdle = (vehicles: any[], onDone: (b: BucketMeta[]) => void) => {
    let idx = 0;
    const chunk = 200;
    let current: BucketMeta[] = [];
    const step = () => {
        const slice = vehicles.slice(idx, idx + chunk);
        if (slice.length) {
            current = toBucketMeta([...vehicles.slice(0, idx + slice.length)], 30);
            idx += slice.length;
            if (typeof (window as any).requestIdleCallback === "function") {
                (window as any).requestIdleCallback(step);
            } else {
                setTimeout(step, 0);
            }
        } else {
            onDone(current);
        }
    };
    step();
};

const computeBucketsWorker = (vehicles: any[], onDone: (b: BucketMeta[]) => void, onFail: () => void) => {
    try {
        const worker = new Worker(new URL("../workers/bucketWorker.ts", import.meta.url));
        worker.onmessage = (e) => {
            if (e.data?.type === "BUCKET_RESULT") {
                onDone(e.data.buckets as BucketMeta[]);
                worker.terminate();
            }
        };
        worker.onerror = () => {
            worker.terminate();
            onFail();
        };
        const minimal = vehicles.map((v) => ({ id: v?.id, inventory: v?.inventory, user: v?.user }));
        worker.postMessage({ type: "BUCKET", vehicles: minimal });
    } catch {
        onFail();
    }
};

export function useVehicleBuckets(params: Record<string, unknown>, opts?: { refreshOnMount?: boolean }) {
    const [vehicles, setVehicles] = useState<any[]>(getMemoryVehicles()?.data ?? []);
    const [buckets, setBuckets] = useState<BucketMeta[]>(getMemoryBuckets()?.buckets ?? []);
    const [loading, setLoading] = useState(false);

    const paramsRef = useRef(params);
    paramsRef.current = params;

    useEffect(() => {
        let mounted = true;
        const t0 = performance.now();
        readVehicles().then((payload) => {
            if (!mounted || !payload) return;
            setVehicles(payload.data);
            if (DEV_LOG) console.log("[vehicles] cache load ms", Math.round(performance.now() - t0));
        });
        const unsub = subscribeVehicles((payload) => {
            setVehicles(payload.data);
        });
        return () => {
            mounted = false;
            unsub();
        };
    }, []);

    useEffect(() => {
        let mounted = true;
        const t0 = performance.now();
        readBuckets().then((payload) => {
            if (!mounted || !payload) return;
            setBuckets(payload.buckets);
            if (DEV_LOG) console.log("[buckets] cache load ms", Math.round(performance.now() - t0));
        });
        const unsub = subscribeBuckets((payload) => {
            setBuckets(payload.buckets);
        });
        return () => {
            mounted = false;
            unsub();
        };
    }, []);

    useEffect(() => {
        let mounted = true;
        const run = async () => {
            const cached = await readVehicles();
            const shouldRefresh = opts?.refreshOnMount !== false;
            if (shouldRefresh && (!cached || isStale(cached.updatedAt, VEHICLE_TTL_MS))) {
                setLoading(true);
                try {
                    const { vehicles } = await fetchAllVehicles(paramsRef.current);
                    await writeVehicles(vehicles);
                } finally {
                    if (mounted) setLoading(false);
                }
            }
        };
        run();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        let mounted = true;
        const maybeCompute = async () => {
            const v = getMemoryVehicles();
            if (!v?.data?.length) return;
            const b = await readBuckets();
            if (b?.sourceVehiclesUpdatedAt && v.updatedAt && b.sourceVehiclesUpdatedAt === v.updatedAt) return;

            const t0 = performance.now();
            const onDone = async (next: BucketMeta[]) => {
                if (!mounted) return;
                setBuckets(next);
                await writeBuckets(next, v.updatedAt);
                if (DEV_LOG) console.log("[buckets] compute ms", Math.round(performance.now() - t0));
            };
            const onFail = () => {
                computeBucketsIdle(v.data, onDone);
            };

            if (v.data.length > USE_WORKER_THRESHOLD && typeof Worker !== "undefined") {
                computeBucketsWorker(v.data, onDone, onFail);
            } else {
                computeBucketsIdle(v.data, onDone);
            }
        };
        maybeCompute();
        return () => {
            mounted = false;
        };
    }, [vehicles.length]);

    return { vehicles, buckets, loading };
}
