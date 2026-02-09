"use client";
import Link from "next/link";
import { StoreIcon } from "@/components/Icons";
import { useEffect } from "react";
import { api } from "@/lib/api/client-request";
import { useCart } from "@/hooks/useCart";

export default function CartButton({ initialCount }: Readonly<{ initialCount: number }>) {
    const { count, setCart } = useCart();

    useEffect(() => {
        let isActive = true;
        setCart(initialCount);
        const loadCounts = async () => {
            try {
                const [cartRes, negotiationRes] = await Promise.allSettled([
                    api.get<{ data?: { cartCount?: number } }>("/inventory/api/v1/inventory/getCartCountForUser", {
                        isAuthRequired: false,
                    }),
                    fetch("/api/negotiation-cart", { cache: "no-store" }),
                ]);

                let cartCount =
                    cartRes.status === "fulfilled" ? Number(cartRes.value?.data?.cartCount || 0) : initialCount || 0;
                if (!Number.isFinite(cartCount)) cartCount = initialCount || 0;

                let negotiationCount = 0;
                if (negotiationRes.status === "fulfilled" && negotiationRes.value.ok) {
                    const data = await negotiationRes.value.json();
                    negotiationCount = Array.isArray(data?.carts) ? data.carts.length : 0;
                }

                if (isActive) setCart(cartCount + negotiationCount);
            } catch {
                if (isActive) setCart(initialCount);
            }
        };
        loadCounts();
        return () => {
            isActive = false;
        };
    }, [initialCount, setCart]);

    return (
        <div className="relative">
            <Link className="p-2 hover:bg-gray-100 block rounded-md" href="/my-cart" title="My Cart">
                <StoreIcon className="h-4 w-4" />
            </Link>
            {count > 0 ? (
                <span className="h-4 w-4 rounded-full bg-destructive text-xs absolute -top-0.5 -right-0.5 text-white flex justify-center items-center">
                    {count}
                </span>
            ) : null}
        </div>
    );
}
