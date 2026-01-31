"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

type NegotiationOrder = {
    conversationId: string;
    buyerId: string;
    sellerId: string;
    logisticsPartner: "UGR" | "None";
    items: Array<{
        bucketKey: string;
        name: string;
        totalUnits: number;
        unitPrice: number;
        currency: string;
        discountPercent: number;
        total: number;
    }>;
    totals: {
        total: number;
        downpayment: number;
        pending: number;
    };
    status: string;
    createdAt: string;
};

export default function NegotiationOrdersSection({ role }: Readonly<{ role: "buyer" | "seller" }>) {
    const [orders, setOrders] = useState<NegotiationOrder[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/negotiation-orders?role=${role}`, { cache: "no-store" });
                if (!res.ok) {
                    setOrders([]);
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                setOrders(data?.orders ?? []);
            } catch {
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [role]);

    if (!orders.length && !loading) {
        return (
            <div className="mt-6 text-sm text-gray-500">No negotiated orders yet.</div>
        );
    }

    return (
        <div className="mt-6 border border-stroke-light rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg text-[#202C4A]">Orders</h3>
                <span
                    data-slot="badge"
                    className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 border-transparent bg-blue-100 text-blue-800"
                >
                    {orders.length} Total Orders
                </span>
            </div>
            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order.conversationId} className="border border-stroke-light rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-2">
                            Status: <span className="font-medium text-gray-900">{order.status}</span>
                        </div>
                        <div className="space-y-2">
                            {order.items.map((item) => (
                                <div key={item.bucketKey} className="flex items-center justify-between text-sm border border-stroke-light rounded-md p-2">
                                    <div className="min-w-0">
                                        <div className="font-medium text-gray-900 truncate">{item.name}</div>
                                        <div className="text-xs text-gray-500">Qty: {item.totalUnits}</div>
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
                        <div className="mt-3 text-sm border border-stroke-light rounded-md p-3 space-y-1">
                            <div className="flex justify-between">
                                <span>Total</span>
                                <span className="font-semibold">{formatPrice(order.totals.total, order.items[0]?.currency)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Down payment</span>
                                <span className="font-semibold">
                                    {formatPrice(order.totals.downpayment, order.items[0]?.currency)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Pending price</span>
                                <span className="font-semibold">{formatPrice(order.totals.pending, order.items[0]?.currency)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
