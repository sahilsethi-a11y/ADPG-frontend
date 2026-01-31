"use client";

import { useEffect, useState } from "react";
import CartList, { type Cart } from "@/components/buyer/CartList";

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
    }>;
    totals: {
        total: number;
        downpayment: number;
        pending: number;
    };
    updatedAt: string;
};

export default function CartPageClient({ list }: Readonly<{ list: Cart[] }>) {
    const [negotiationOrders, setNegotiationOrders] = useState<NegotiationCart[]>([]);
    const [selectedNegotiations, setSelectedNegotiations] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/negotiation-cart", { cache: "no-store" });
                if (!res.ok) return;
                const data = await res.json();
                const carts = data?.carts ?? [];
                setNegotiationOrders(carts);
                setSelectedNegotiations((prev) => {
                    const next: Record<string, boolean> = { ...prev };
                    for (const c of carts) {
                        if (typeof next[c.conversationId] !== "boolean") next[c.conversationId] = true;
                    }
                    return next;
                });
            } catch {}
        };
        load();
    }, []);

    const toggleNegotiation = (id: string) => {
        setSelectedNegotiations((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const removeNegotiation = async (id: string) => {
        const res = await fetch(`/api/negotiation-cart?conversationId=${encodeURIComponent(id)}`, {
            method: "DELETE",
        });
        if (res.ok) {
            setNegotiationOrders((prev) => prev.filter((c) => c.conversationId !== id));
            setSelectedNegotiations((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        }
    };

    const selectAllNegotiations = (value: boolean) => {
        setSelectedNegotiations((prev) => {
            const next = { ...prev };
            for (const o of negotiationOrders) {
                next[o.conversationId] = value;
            }
            return next;
        });
    };

    return (
        <CartList
            list={list}
            negotiationOrders={negotiationOrders}
            selectedNegotiations={selectedNegotiations}
            onToggleNegotiation={toggleNegotiation}
            onRemoveNegotiation={removeNegotiation}
            onSelectAllNegotiations={selectAllNegotiations}
        />
    );
}
