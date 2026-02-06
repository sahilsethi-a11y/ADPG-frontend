"use client";

import type { BucketMeta } from "@/lib/bucketCache";
import type { VehicleRecord } from "@/lib/vehicleCache";

const safeStr = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const safeNum = (v: unknown) => (typeof v === "number" ? v : Number(v));

export const buildBucketKey = (inv: any) => {
    const brand = safeStr(inv?.brand).toLowerCase();
    const model = safeStr(inv?.model).toLowerCase();
    const variant = safeStr(inv?.variant).toLowerCase();
    const color = safeStr(inv?.color).toLowerCase();
    const year = safeNum(inv?.year);
    const condition = safeStr(inv?.condition).toLowerCase();
    const bodyType = safeStr(inv?.bodyType).toLowerCase();
    return [brand, model, variant, color, year, condition, bodyType].join("|");
};

export const toBucketMeta = (vehicles: VehicleRecord[], limitIds = 30): BucketMeta[] => {
    const map = new Map<string, BucketMeta>();

    for (const item of vehicles) {
        const inv = item?.inventory ?? {};
        const key = buildBucketKey(inv);
        if (!key) continue;
        const price = Number(inv?.price) || 0;
        const currency = safeStr(inv?.currency) || undefined;
        const id = inv?.id ?? item?.id;
        const sellerId = inv?.userId ?? item?.user?.userId;
        const sellerName =
            item?.user?.roleMetaData?.companyName || item?.user?.roleMetaData?.dealershipName || undefined;

        const existing = map.get(key);
        if (!existing) {
            map.set(key, {
                bucketKey: key,
                representativeId: id ? String(id) : undefined,
                sellerId,
                sellerName,
                brand: safeStr(inv?.brand) || undefined,
                model: safeStr(inv?.model) || undefined,
                variant: safeStr(inv?.variant) || undefined,
                color: safeStr(inv?.color) || undefined,
                year: safeNum(inv?.year) || undefined,
                condition: safeStr(inv?.condition) || undefined,
                bodyType: safeStr(inv?.bodyType) || undefined,
                count: 1,
                minPrice: price,
                maxPrice: price,
                currency,
                heroImageUrl: inv?.mainImageUrl || undefined,
                vehicleIds: id ? [String(id)] : [],
            });
        } else {
            existing.count += 1;
            existing.minPrice = Math.min(existing.minPrice, price);
            existing.maxPrice = Math.max(existing.maxPrice, price);
            existing.currency = existing.currency || currency;
            if (!existing.heroImageUrl && inv?.mainImageUrl) existing.heroImageUrl = inv.mainImageUrl;
            if (id && (!existing.vehicleIds || existing.vehicleIds.length < limitIds)) {
                existing.vehicleIds = existing.vehicleIds ? [...existing.vehicleIds, String(id)] : [String(id)];
            }
        }
    }

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
};
