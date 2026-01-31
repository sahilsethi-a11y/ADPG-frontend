"use client";

import { useEffect, useMemo, useState } from "react";
import type { QuoteItem } from "@/components/buyer/QuoteBuilderList";
import NegotiationBucketCard from "./NegotiationBucketCard";

type NegotiationBucket = {
  key: string;
  brand?: string;
  model?: string;
  variant?: string;
  color?: string;
  year?: number;
  condition?: string;
  bodyType?: string;
  sellerCompany: string;
  sellerId?: string;
  unitCount: number;
  unitPrice: number;
  currency: string;
  bucketTotal: number;
  mainImageUrl: string;
  location: string;
  items: QuoteItem[];
};

type Props = {
  sellerName?: string;
  sellerId?: string;
  isBuyer?: boolean;
  canEditDiscounts?: boolean;
  bucketDiscounts: Record<string, number>;
  onBucketDiscountChange: (bucketKey: string, value: number) => void;
  isLocked?: boolean;
  conversationId?: string;
};

// Bucket grouping function - groups items by their pre-computed bucketKey
const buildBucketGroups = (items: QuoteItem[]): NegotiationBucket[] => {
  const map = new Map<string, NegotiationBucket>();

  for (const item of items) {
    const key = item.bucketKey; // Use pre-computed key
    const existing = map.get(key);

    if (!existing) {
      map.set(key, {
        key,
        brand: item.brand,
        model: item.model,
        variant: item.variant,
        color: item.color,
        year: item.year,
        condition: item.condition,
        bodyType: item.bodyType,
        sellerCompany: item.sellerCompany,
        sellerId: item.sellerId,
        unitCount: item.quantity,
        unitPrice: item.price,
        currency: item.currency,
        bucketTotal: item.quantity * item.price,
        mainImageUrl: item.mainImageUrl,
        location: item.location,
        items: [item],
      });
    } else {
      // Aggregate quantities and totals
      existing.unitCount += item.quantity;
      existing.bucketTotal += item.quantity * item.price;
      existing.items.push(item);
    }
  }

  return Array.from(map.values());
};

export default function NegotiationItemsSection({
  sellerName,
  sellerId,
  isBuyer,
  canEditDiscounts,
  bucketDiscounts,
  onBucketDiscountChange,
  isLocked,
  conversationId,
}: Props) {
  const [items, setItems] = useState<QuoteItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadItems = () => {
      try {
        const scopedKey = conversationId ? `negotiationItems_${conversationId}` : "";
        const raw =
          (scopedKey && window.localStorage.getItem(scopedKey)) ||
          window.localStorage.getItem("quoteBuilderItems");
        const parsed = raw ? (JSON.parse(raw) as QuoteItem[]) : [];
        setItems(parsed);
      } catch {
        setItems([]);
      }
    };

    loadItems();

    // Listen to storage changes from other tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === "quoteBuilderItems" || e.key === (conversationId ? `negotiationItems_${conversationId}` : "")) {
        loadItems();
      }
    };

    // Listen to custom events from same tab
    const onQuoteUpdate = () => loadItems();

    window.addEventListener("storage", onStorage);
    window.addEventListener("quoteBuilderUpdated", onQuoteUpdate);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("quoteBuilderUpdated", onQuoteUpdate);
    };
  }, []);

  // Filter by seller
  const sellerItems = useMemo(() => {
    if (sellerId) return items.filter((i) => i.sellerId === sellerId);
    if (sellerName) return items.filter((i) => i.sellerCompany === sellerName);
    return items;
  }, [items, sellerId, sellerName]);

  // Group into buckets
  const buckets = useMemo(() => buildBucketGroups(sellerItems), [sellerItems]);

  // Don't render if no items
  if (buckets.length === 0) return null;

  return (
    <section className="border border-stroke-light rounded-lg bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Negotiation Items</h3>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
          {buckets.length} {buckets.length === 1 ? "group" : "groups"}
        </span>
      </div>

      <div className="space-y-2">
        {buckets.map((bucket) => (
          <NegotiationBucketCard
            key={bucket.key}
            bucket={bucket}
            discountPercent={bucketDiscounts[bucket.key] ?? 0}
            showDiscountControls={canEditDiscounts ?? isBuyer === true}
            onDiscountChange={(value) => onBucketDiscountChange(bucket.key, value)}
            isLocked={isLocked}
          />
        ))}
      </div>
    </section>
  );
}
