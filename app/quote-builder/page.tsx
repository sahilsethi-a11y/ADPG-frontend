"use client";

import QuoteBuilderList, { type QuoteItem } from "@/components/buyer/QuoteBuilderList";
import { useEffect, useState } from "react";

const quoteItemsStorageKey = "quoteBuilderItems";

export default function QuoteBuilderPage() {
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

        const onStorage = (e: StorageEvent) => {
            if (e.key !== quoteItemsStorageKey) return;
            try {
                const parsed = e.newValue ? (JSON.parse(e.newValue) as QuoteItem[]) : [];
                setItems(parsed);
            } catch {}
        };
        const onQuoteUpdate = () => {
            try {
                const raw = window.localStorage.getItem(quoteItemsStorageKey);
                const parsed = raw ? (JSON.parse(raw) as QuoteItem[]) : [];
                setItems(parsed);
            } catch {}
        };
        window.addEventListener("storage", onStorage);
        window.addEventListener("quoteBuilderUpdated", onQuoteUpdate);
        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("quoteBuilderUpdated", onQuoteUpdate);
        };
    }, []);

    return (
        <main className="container mx-auto px-4 lg:px-6 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl text-brand-blue">Quote Builder</h1>
            </div>
            <QuoteBuilderList list={items} />
        </main>
    );
}
