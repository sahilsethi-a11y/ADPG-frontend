"use client";
import Link from "next/link";
import { FileIcon } from "@/components/Icons";
import { useEffect, useState } from "react";

const quoteItemsStorageKey = "quoteBuilderItems";

export default function QuoteBuilderButton() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const read = () => {
            try {
                const raw = window.localStorage.getItem(quoteItemsStorageKey);
                const parsed = raw ? (JSON.parse(raw) as any[]) : [];
                setCount(parsed.length);
            } catch {
                setCount(0);
            }
        };
        read();
        const onStorage = (e: StorageEvent) => {
            if (e.key === quoteItemsStorageKey) read();
        };
        const onQuoteUpdate = () => read();
        window.addEventListener("storage", onStorage);
        window.addEventListener("quoteBuilderUpdated", onQuoteUpdate);
        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("quoteBuilderUpdated", onQuoteUpdate);
        };
    }, []);

    return (
        <div className="relative">
            <Link className="p-2 hover:bg-gray-100 block rounded-md" href="/quote-builder" title="Quote Builder">
                <FileIcon className="h-4 w-4" />
            </Link>
            <span className="min-w-4 h-4 px-1 rounded-full bg-destructive text-[10px] absolute -top-0.5 -right-0.5 text-white flex justify-center items-center">
                {count}
            </span>
        </div>
    );
}
