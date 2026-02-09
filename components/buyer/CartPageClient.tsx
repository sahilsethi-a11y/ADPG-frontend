"use client";

import { useEffect, useState } from "react";
import CartList, { type Cart, type NegotiationOrder } from "@/components/buyer/CartList";
import { api } from "@/lib/api/client-request";
import message from "@/elements/message";
import { useRouter } from "next/navigation";

type NegotiationCart = NegotiationOrder;

export default function CartPageClient({ list }: Readonly<{ list: Cart[] }>) {
    const router = useRouter();
    const [negotiationOrders, setNegotiationOrders] = useState<NegotiationCart[]>([]);
    const [selectedNegotiations, setSelectedNegotiations] = useState<Record<string, boolean>>({});
    const [checkoutLoading, setCheckoutLoading] = useState(false);

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

    const handleCheckout = async (payload: {
        items: Cart[];
        negotiationOrders: NegotiationCart[];
        totals: {
            fobTotal: number;
            logisticsFees: number;
            negotiatedTotal: number;
            total: number;
        };
        currency?: string;
    }) => {
        try {
            setCheckoutLoading(true);
            const userRes = await api.get<{ data?: { email?: string } }>("/api/v1/auth/getUserInfoByToken");
            const buyerEmail = userRes.data?.email;
            if (!buyerEmail) {
                message.error("Unable to determine buyer email. Please update your profile and try again.");
                setCheckoutLoading(false);
                return;
            }

            const sellerEmails = new Set<string>();
            for (const item of payload.items) {
                const email = (item as { sellerEmail?: string }).sellerEmail;
                if (email) sellerEmails.add(email);
            }
            for (const order of payload.negotiationOrders) {
                if (order.sellerEmail) sellerEmails.add(order.sellerEmail);
            }
            const res = await fetch("/api/checkout-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    buyerEmail,
                    sellerEmails: Array.from(sellerEmails),
                    summary: payload,
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                message.error(text || "Checkout email failed.");
                setCheckoutLoading(false);
                return;
            }
            message.success("Checkout email sent.");

            for (const order of payload.negotiationOrders) {
                await fetch("/api/negotiation-orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ conversationId: order.conversationId }),
                });
            }

            await Promise.allSettled(
                payload.items.map((item) =>
                    api.delete<{ status: string }>("/inventory/api/v1/inventory/removeCart", {
                        params: { cartId: item.cartId },
                    })
                )
            );

            router.push("/buyer/orders");
        } catch {
            message.error("Checkout email failed.");
        } finally {
            setCheckoutLoading(false);
        }
    };

    return (
        <CartList
            list={list}
            negotiationOrders={negotiationOrders}
            selectedNegotiations={selectedNegotiations}
            onToggleNegotiation={toggleNegotiation}
            onRemoveNegotiation={removeNegotiation}
            onSelectAllNegotiations={selectAllNegotiations}
            onCheckout={handleCheckout}
            isCheckingOut={checkoutLoading}
        />
    );
}
