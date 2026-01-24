"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/utils";
import PriceBadge from "@/elements/PriceBadge";
import type { Cart } from "@/components/buyer/CartList";

type Bucket = {
    key: string;
    name: string;
    year: number;
    location: string;
    unitPrice: number;
    currency: string;
    items: Cart[];
    totalUnits: number;
};

const buildBucketKey = (item: Cart) => {
    return [item.name, item.year, item.location, item.price, item.currency].join("|");
};

const groupBuckets = (list: Cart[]): Bucket[] => {
    const map = new Map<string, Bucket>();
    for (const item of list) {
        const key = buildBucketKey(item);
        const existing = map.get(key);
        if (!existing) {
            map.set(key, {
                key,
                name: item.name,
                year: item.year,
                location: item.location,
                unitPrice: item.price,
                currency: item.currency,
                items: [item],
                totalUnits: item.quantity,
            });
        } else {
            existing.items.push(item);
            existing.totalUnits += item.quantity;
        }
    }
    return Array.from(map.values());
};

export default function NegotiationQuotePanel({
    list,
    sellerName,
}: Readonly<{
    list: Cart[];
    sellerName: string;
}>) {
    const [discount, setDiscount] = useState(1);
    const buckets = useMemo(() => groupBuckets(list), [list]);
    const currency = list?.[0]?.currency;

    const originalTotal = buckets.reduce((acc, b) => acc + b.totalUnits * b.unitPrice, 0);
    const discountedTotal = originalTotal * (1 - discount / 100);

    return (
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-brand-blue text-lg font-semibold">{sellerName}</div>
                    <div className="text-xs text-gray-500">{buckets.length} buckets</div>
                </div>
                <div className="border border-stroke-light rounded-xl p-4 max-h-[420px] overflow-auto space-y-3">
                    {buckets.map((bucket) => {
                        const discountedUnit = bucket.unitPrice * (1 - discount / 100);
                        return (
                            <div key={bucket.key} className="bg-white border border-stroke-light rounded-xl p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-gray-900 truncate">
                                            {bucket.name} ({bucket.year})
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5">{bucket.location}</div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-sm font-semibold text-gray-900 flex items-center gap-1 justify-end">
                                            {formatPrice(bucket.unitPrice, bucket.currency)} <PriceBadge />
                                        </div>
                                        <div className="text-[11px] text-gray-500">Unit price</div>
                                        <div className="text-xs text-green-700 mt-1">
                                            {formatPrice(discountedUnit, bucket.currency)} after {discount}% off
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-2 text-xs text-gray-600 flex items-center justify-between">
                                    <span>Quantity: {bucket.totalUnits} units</span>
                                    <span>
                                        Bucket total: {formatPrice(bucket.totalUnits * bucket.unitPrice, bucket.currency)}
                                    </span>
                                </div>

                                <div className="mt-2 text-[11px] text-gray-500 flex flex-wrap gap-2">
                                    {bucket.items.map((item) => (
                                        <span key={item.cartId} className="inline-flex items-center rounded-md border px-2 py-0.5 bg-gray-50 text-gray-600">
                                            {item.quantity} × {formatPrice(item.price, item.currency)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="border border-stroke-light rounded-xl p-4 h-fit sticky top-20">
                <div className="text-brand-blue font-semibold mb-2">Discount slider</div>
                <div className="text-xs text-gray-500 mb-3">Adjust the discount to see updated bucket prices</div>
                <div className="flex items-center justify-between text-sm mb-2">
                    <span>Discount</span>
                    <span className="text-brand-blue font-medium">{discount}%</span>
                </div>
                <input
                    type="range"
                    min={1}
                    max={20}
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full accent-brand-blue"
                />
                <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Total original:</span>
                        <span>{formatPrice(originalTotal, currency)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-brand-blue">
                        <span>After discount:</span>
                        <span>{formatPrice(discountedTotal, currency)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
