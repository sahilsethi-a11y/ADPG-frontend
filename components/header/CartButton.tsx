"use client";
import Link from "next/link";
import { StoreIcon } from "@/components/Icons";
import { useEffect } from "react";
import { useCart } from "@/hooks/useCart";

export default function CartButton({ initialCount }: Readonly<{ initialCount: number }>) {
    const { count, setCart } = useCart();

    useEffect(() => {
        setCart(initialCount);
    }, []);

    return (
        <div className="relative">
            <Link className="p-2 hover:bg-gray-100 block rounded-md" href="/my-cart" title="My Cart">
                <StoreIcon className="h-4 w-4" />
            </Link>
            <span className="h-4 w-4 rounded-full bg-destructive text-xs absolute -top-0.5 -right-0.5 text-white flex justify-center items-center">{count}</span>
        </div>
    );
}
