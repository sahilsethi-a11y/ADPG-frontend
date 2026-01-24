"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/utils";
import type { QuoteItem } from "@/components/buyer/QuoteBuilderList";

type Bucket = {
    key: string;
    name: string;
    year: number;
    location: string;
    unitPrice: number;
    currency: string;
    totalUnits: number;
};

const quoteItemsStorageKey = "quoteBuilderItems";
const quoteOfferStorageKey = "quoteBuilderOfferAmount";

const groupBuckets = (list: QuoteItem[]): Bucket[] => {
    const map = new Map<string, Bucket>();
    for (const item of list) {
        const key = item.bucketKey || [item.name, item.year, item.location, item.price, item.currency].join("|");
        const existing = map.get(key);
        if (!existing) {
            map.set(key, {
                key,
                name: item.name,
                year: item.year,
                location: item.location,
                unitPrice: item.price,
                currency: item.currency,
                totalUnits: item.quantity,
            });
        } else {
            existing.totalUnits += item.quantity;
        }
    }
    return Array.from(map.values());
};

export default function NegotiationQuotePanelLocal({
    sellerName,
    sellerId,
}: Readonly<{ sellerName?: string; sellerId?: string }>) {
    const [items, setItems] = useState<QuoteItem[]>([]);
    const [discount, setDiscount] = useState(1);
    const [tokenPercent, setTokenPercent] = useState(10);

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const raw = window.localStorage.getItem(quoteItemsStorageKey);
            const parsed = raw ? (JSON.parse(raw) as QuoteItem[]) : [];
            setItems(parsed);
        } catch {
            setItems([]);
        }
    }, []);

    const sellerItems = useMemo(() => {
        if (sellerId) return items.filter((i) => i.sellerId === sellerId);
        if (sellerName) return items.filter((i) => i.sellerCompany === sellerName);
        return items;
    }, [items, sellerId, sellerName]);
    const buckets = useMemo(() => groupBuckets(sellerItems), [sellerItems]);

    const currency = buckets?.[0]?.currency;
    const originalTotal = buckets.reduce((acc, b) => acc + b.totalUnits * b.unitPrice, 0);
    const discountedTotal = originalTotal * (1 - discount / 100);
    const tokenAmount = discountedTotal * (tokenPercent / 100);

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.setItem(quoteOfferStorageKey, String(Math.round(discountedTotal)));
            window.dispatchEvent(new Event("quoteOfferUpdated"));
        } catch {}
    }, [discountedTotal]);

    if (buckets.length < 1) return null;

    return (
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-brand-blue text-lg font-semibold">{sellerName || "Seller"}</div>
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
                                        <div className="text-sm font-semibold text-gray-900">
                                            {formatPrice(discountedUnit, bucket.currency)}
                                        </div>
                                        <div className="text-[11px] text-gray-500">Unit price after {discount}%</div>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-600 flex items-center justify-between">
                                    <span>Quantity: {bucket.totalUnits} units</span>
                                    <span>
                                        Bucket total: {formatPrice(bucket.totalUnits * discountedUnit, bucket.currency)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="border border-stroke-light rounded-xl p-4 h-fit sticky top-20">
                <div className="text-brand-blue font-semibold mb-2">Offer</div>
                <div className="text-xs text-gray-500 mb-3">Choose a discount to apply across all buckets</div>
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
                <div className="mt-4 text-xs text-gray-500">Token amount (buyer offer)</div>
                <div className="flex items-center justify-between text-sm mb-2">
                    <span>Token %</span>
                    <span className="text-brand-blue font-medium">{tokenPercent}%</span>
                </div>
                <input
                    type="range"
                    min={1}
                    max={20}
                    value={tokenPercent}
                    onChange={(e) => setTokenPercent(Number(e.target.value))}
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
                    <div className="flex justify-between">
                        <span>Token amount:</span>
                        <span>{formatPrice(tokenAmount, currency)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
