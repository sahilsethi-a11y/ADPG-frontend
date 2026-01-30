"use client";

import QuoteBuilderList, { type QuoteItem } from "@/components/buyer/QuoteBuilderList";
import { api } from "@/lib/api/client-request";
import { useEffect, useState } from "react";

const quoteItemsStorageKey = "quoteBuilderItems";

export default function QuoteBuilderPage() {
    const [items, setItems] = useState<QuoteItem[]>([]);
    const [isBuyer, setIsBuyer] = useState<boolean | null>(null);

    useEffect(() => {
        let isActive = true;
        const fetchRole = async () => {
            try {
                const userData = await api.get<{ data?: { roleType?: string } }>("/api/v1/auth/getUserInfoByToken", {
                    isAuthRequired: false,
                });
                const role = userData.data?.roleType?.toLowerCase();
                if (!isActive) return;
                setIsBuyer(role === "buyer");
            } catch {
                if (!isActive) return;
                setIsBuyer(false);
            }
        };
        fetchRole();
        return () => {
            isActive = false;
        };
    }, []);

    useEffect(() => {
        if (!isBuyer || typeof window === "undefined") {
            setItems([]);
            return;
        }

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
    }, [isBuyer]);

    if (isBuyer === false) {
        return (
            <main className="container mx-auto px-4 lg:px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl text-brand-blue">Quote Builder</h1>
                </div>
                <div className="flex justify-center">
                    <div className="p-4 border rounded-2xl border-stroke-light">
                        Quote Builder is available for logged-in buyers only.
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="container mx-auto px-4 lg:px-6 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl text-brand-blue">Quote Builder</h1>
            </div>
            <QuoteBuilderList list={items} />
        </main>
    );
}
