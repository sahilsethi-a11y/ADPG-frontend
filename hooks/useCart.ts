"use client";

import { useSyncExternalStore } from "react";
import { cartStore } from "@/lib/cartStore";

const EMPTY_CART = 0;

export function useCart() {
    const count = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, () => EMPTY_CART);
    return {
        count,
        setCart: cartStore.setCart,
        addToCart: cartStore.addToCart,
        removeFromCart: cartStore.removeFromCart,
    };
}
