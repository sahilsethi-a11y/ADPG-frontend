"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/utils";
import type { QuoteItem } from "@/components/buyer/QuoteBuilderList";
import Button from "@/elements/Button";

type Bucket = {
    key: string;
    brand?: string;
    model?: string;
    variant?: string;
    color?: string;
    year?: number;
    condition?: string;
    bodyType?: string;
    name: string;
    location: string;
    unitPrice: number;
    currency: string;
    totalUnits: number;
    bucketTotal: number;
};

const quoteItemsStorageKey = "quoteBuilderItems";
const quoteOfferStorageKey = "quoteBuilderOfferAmount";

// Bucket grouping function - groups items by their pre-computed bucketKey
const groupBuckets = (list: QuoteItem[]): Bucket[] => {
    const map = new Map<string, Bucket>();
    for (const item of list) {
        const key = item.bucketKey; // Use pre-computed key
        const existing = map.get(key);
        if (!existing) {
            map.set(key, {
                key,
                brand: item.brand,
                model: item.model,
                variant: item.variant,
                color: item.color,
                year: item.year,
                condition: item.condition,
                bodyType: item.bodyType,
                name: item.name,
                location: item.location,
                unitPrice: item.price,
                currency: item.currency,
                totalUnits: item.quantity,
                bucketTotal: item.quantity * item.price,
            });
        } else {
            existing.totalUnits += item.quantity;
            existing.bucketTotal += item.quantity * item.price;
        }
    }
    return Array.from(map.values());
};

type Props = {
    sellerName?: string;
    sellerId?: string;
    negotiationStatus?: string;
    // Shared pricing state (from parent)
    discountPercent: number;
    onDiscountChange: (value: number) => void;
    downpaymentPercent: number;
    onDownpaymentChange: (value: number) => void;
    selectedPort: string;
    onPortChange: (value: string) => void;
    // Submit handler
    onSubmit?: (proposalData: {
        discountPercent: number;
        discountAmount: number;
        finalPrice: number;
        downpaymentPercent: number;
        downpaymentAmount: number;
        remainingBalance: number;
        bucketTotal: number;
        bucketName: string;
    }) => Promise<void>;
    isSubmitting?: boolean;
    submissionError?: string | null;
};

export default function NegotiationQuotePanelLocal({
    sellerName,
    sellerId,
    negotiationStatus,
    discountPercent,
    onDiscountChange,
    downpaymentPercent,
    onDownpaymentChange,
    selectedPort,
    onPortChange,
    onSubmit,
    isSubmitting,
    submissionError,
}: Readonly<Props>) {
    const [items, setItems] = useState<QuoteItem[]>([]);

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

    // Memoized price calculations - updates whenever discount changes
    const { originalTotal, discountedTotal, discountAmount } = useMemo(() => {
        const original = buckets.reduce((acc, b) => acc + b.bucketTotal, 0);
        const discountedPrice = buckets.reduce((acc, b) => {
            const bucketDiscounted = b.bucketTotal * (1 - discountPercent / 100);
            return acc + bucketDiscounted;
        }, 0);
        const discountAmt = original - discountedPrice;
        return {
            originalTotal: original,
            discountedTotal: discountedPrice,
            discountAmount: discountAmt,
        };
    }, [buckets, discountPercent]);

    // Memoized downpayment calculations - updates whenever downpaymentPercent changes
    const { downpaymentAmount, remainingBalance } = useMemo(() => {
        const downpayment = Math.max(0, discountedTotal * (downpaymentPercent / 100));
        const remaining = Math.max(0, discountedTotal - downpayment);
        return {
            downpaymentAmount: downpayment,
            remainingBalance: remaining,
        };
    }, [discountedTotal, downpaymentPercent]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.setItem(quoteOfferStorageKey, String(Math.round(discountedTotal)));
            window.dispatchEvent(new Event("quoteOfferUpdated"));
        } catch {}
    }, [discountedTotal]);

    const isDisabled =
        negotiationStatus?.toLowerCase() === "agreed" ||
        negotiationStatus?.toLowerCase() === "rejected";

    const handleSubmit = async () => {
        // Frontend validation
        if (!onSubmit || buckets.length < 1) return;

        if (discountPercent < 0 || discountPercent > 100) {
            return; // Should not happen with range input, but validate anyway
        }

        if (downpaymentPercent < 10 || downpaymentPercent > 100) {
            return; // Should not happen with range input
        }

        if (!selectedPort) {
            return; // Port must be selected
        }

        if (originalTotal <= 0 || discountedTotal <= 0) {
            return; // Must have valid prices
        }

        await onSubmit({
            discountPercent,
            discountAmount,
            finalPrice: discountedTotal,
            downpaymentPercent,
            downpaymentAmount,
            remainingBalance,
            bucketTotal: originalTotal,
            bucketName: buckets[0]?.name || "Negotiation Items",
        });
    };

    if (buckets.length < 1) return null;

    return (
        <div className="border border-stroke-light rounded-lg p-5 bg-white">
            {/* Header */}
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Make a Proposal</h3>

            {/* Discount Section */}
            <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-700">Discount per Bucket</label>
                    <span className="text-sm font-semibold text-brand-blue">{discountPercent}%</span>
                </div>
                <input
                    type="range"
                    min={0}
                    max={30}
                    value={discountPercent}
                    onChange={(e) => onDiscountChange(Number(e.target.value))}
                    disabled={isDisabled}
                    className="w-full accent-brand-blue disabled:opacity-50"
                />
            </div>

            {/* Price Summary Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Original Price:</span>
                    <span className="font-medium text-gray-900">{formatPrice(originalTotal, currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Discount Amount:</span>
                    <span className="font-medium text-red-600">-${Math.round(discountAmount).toLocaleString()}</span>
                </div>
                <div className="border-t border-blue-200 pt-2 flex justify-between text-sm font-semibold">
                    <span className="text-gray-900">Final Price:</span>
                    <span className="text-brand-blue text-lg">{formatPrice(discountedTotal, currency)}</span>
                </div>
            </div>

            {/* Downpayment Section */}
            <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-700">Downpayment %</label>
                    <span className="text-sm font-semibold text-brand-blue">{downpaymentPercent}%</span>
                </div>
                <input
                    type="range"
                    min={10}
                    max={100}
                    value={downpaymentPercent}
                    onChange={(e) => onDownpaymentChange(Number(e.target.value))}
                    disabled={isDisabled}
                    className="w-full accent-brand-blue disabled:opacity-50"
                />
                <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                    <span>Downpayment Amount:</span>
                    <span className="font-semibold text-gray-900">${Math.round(downpaymentAmount).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Remaining Balance:</span>
                    <span className="font-semibold text-gray-900">${Math.round(remainingBalance).toLocaleString()}</span>
                </div>
            </div>

            {/* Port of Loading Dropdown */}
            <div className="mb-6">
                <label className="text-xs font-medium text-gray-700 block mb-2">Port of Loading</label>
                <select
                    value={selectedPort}
                    onChange={(e) => onPortChange(e.target.value)}
                    disabled={isDisabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white disabled:opacity-50"
                >
                    <option>Dubai</option>
                    <option>Abu Dhabi</option>
                    <option>Sharjah</option>
                    <option>Other</option>
                </select>
            </div>

            {/* Error Message */}
            {submissionError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{submissionError}</p>
                </div>
            )}

            {/* Submit Button */}
            <Button
                onClick={handleSubmit}
                disabled={isDisabled || isSubmitting}
                className="w-full bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-60"
            >
                {isSubmitting ? "Submitting..." : "Submit Proposal"}
            </Button>
        </div>
    );
}
