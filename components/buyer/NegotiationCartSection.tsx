"use client";

import { useEffect, useState } from "react";
import Button from "@/elements/Button";
import { formatPrice } from "@/lib/utils";

type NegotiationCart = {
    conversationId: string;
    buyerId: string;
    sellerId: string;
    logisticsPartner: "UGR" | "None";
    selectedPort?: string;
    destinationPort?: string;
    items: Array<{
        bucketKey: string;
        name: string;
        totalUnits: number;
        unitPrice: number;
        currency: string;
        discountPercent: number;
        total: number;
        mainImageUrl?: string;
        brand?: string;
        model?: string;
        variant?: string;
        color?: string;
        year?: number;
        condition?: string;
        bodyType?: string;
    }>;
    totals: {
        total: number;
        downpayment: number;
        pending: number;
    };
    updatedAt: string;
};

export default function NegotiationCartSection() {
    const [carts, setCarts] = useState<NegotiationCart[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/negotiation-cart", { cache: "no-store" });
            if (!res.ok) {
                setError("Failed to load negotiated cart.");
                setLoading(false);
                return;
            }
            const data = await res.json();
            setCarts(data?.carts ?? []);
        } catch {
            setError("Failed to load negotiated cart.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const checkout = async (conversationId: string) => {
        setLoading(true);
        try {
            const res = await fetch("/api/negotiation-orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ conversationId }),
            });
            if (!res.ok) {
                setError("Checkout failed. Please try again.");
                setLoading(false);
                return;
            }
            await load();
        } catch {
            setError("Checkout failed. Please try again.");
            setLoading(false);
        }
    };

    if (!carts.length && !loading) return null;

    return (
        <div className="mt-10 border border-stroke-light rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg text-[#202C4A]">Orders</h3>
                <span
                    data-slot="badge"
                    className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 border-transparent bg-blue-100 text-blue-800"
                >
                    {carts.length} Total Orders
                </span>
            </div>
            {error ? <div className="text-sm text-red-600 mb-3">{error}</div> : null}
            <div className="space-y-4">
                {carts.map((cart) => (
                    <div key={cart.conversationId} className="p-4 border border-stroke-light rounded-xl">
                        <div className="flex flex-col gap-4 md:flex-row">
                            <div className="flex gap-4">
                                <div className="relative h-20 w-20 rounded bg-gray-100 overflow-hidden">
                                    {cart.items?.[0]?.mainImageUrl ? (
                                        <img src={cart.items[0].mainImageUrl} alt={cart.items[0].name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">Order</div>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start gap-4 justify-between flex-wrap">
                                    <div>
                                        <h3 className="text-lg text-brand-blue">Negotiated Order</h3>
                                        <p className="text-sm text-gray-600">
                                            {cart.items.length} buckets • {cart.items.reduce((acc, i) => acc + i.totalUnits, 0)} units
                                        </p>
                                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                                            <div>From: {cart.selectedPort || "—"}</div>
                                            <div>To: {cart.destinationPort || "—"}</div>
                                            <div>Logistics: {cart.logisticsPartner}</div>
                                        </div>
                                        <div className="mt-2">
                                            <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium">
                                                Token Payment
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl text-brand-blue">
                                            {formatPrice(cart.totals.total, cart.items[0]?.currency)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Down payment: {formatPrice(cart.totals.downpayment, cart.items[0]?.currency)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Pending: {formatPrice(cart.totals.pending, cart.items[0]?.currency)}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    {cart.items.map((item) => (
                                        <div key={item.bucketKey} className="flex items-center justify-between text-sm border border-stroke-light rounded-md p-2">
                                            <div className="min-w-0 flex items-center gap-3">
                                                <div className="h-12 w-12 rounded bg-gray-100 overflow-hidden shrink-0">
                                                    {item.mainImageUrl ? (
                                                        <img src={item.mainImageUrl} alt={item.name} className="h-full w-full object-cover" />
                                                    ) : null}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-gray-900 truncate">{item.name}</div>
                                                    <div className="text-xs text-gray-500">Qty: {item.totalUnits}</div>
                                                    <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-gray-500">
                                                        {[item.year, item.color, item.variant, item.condition, item.bodyType].filter(Boolean).map((v, idx) => (
                                                            <span key={`${item.bucketKey}-${idx}`} className="px-1.5 py-0.5 border border-stroke-light rounded-full">
                                                                {v}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold">{formatPrice(item.total, item.currency)}</div>
                                                {item.discountPercent > 0 ? (
                                                    <div className="text-[11px] text-gray-400 line-through">
                                                        {formatPrice(item.unitPrice * item.totalUnits, item.currency)}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <Button loading={loading} onClick={() => checkout(cart.conversationId)}>
                                        Checkout
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
