"use client";

import Image from "@/elements/Image";
import { DeleteIcon, LocationIcon } from "@/components/Icons";
import PriceBadge from "@/elements/PriceBadge";
import Button from "@/elements/Button";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import NegotiatePriceButton from "@/components/buyer/NegotiatePriceButton";

export type QuoteItem = {
    id: string;
    name: string;
    year: number;
    location: string;
    quantity: number;
    price: number;
    currency: string;
    mainImageUrl: string;
    sellerCompany: string;
    sellerId?: string;
    bucketKey: string;
    isSelected?: boolean;
};

type Bucket = {
    key: string;
    name: string;
    year: number;
    location: string;
    price: number;
    currency: string;
    items: QuoteItem[];
    totalUnits: number;
};

type SellerGroup = {
    sellerCompany: string;
    sellerId?: string;
    representativeVehicleId?: string;
    buckets: Bucket[];
    totalItems: number;
    totalUnits: number;
};

const quoteItemsStorageKey = "quoteBuilderItems";
const quoteStorageKey = "quoteBuilderIds";
const quoteSellerStorageKey = "quoteBuilderSellerByVehicle";
const quoteSellerCompanyStorageKey = "quoteBuilderSellerByCompany";
const quoteVehicleCompanyStorageKey = "quoteBuilderVehicleByCompany";

const buildBucketKey = (item: QuoteItem) => {
    return item.bucketKey || [item.name, item.year, item.location, item.price, item.currency].join("|");
};

const getSellerIdByCompany = (sellerCompany?: string) => {
    if (!sellerCompany || typeof window === "undefined") return undefined;
    try {
        const rawMap = window.localStorage.getItem(quoteSellerCompanyStorageKey);
        const parsedMap = rawMap ? (JSON.parse(rawMap) as Record<string, string>) : {};
        return parsedMap[sellerCompany];
    } catch {
        return undefined;
    }
};

const getVehicleIdByCompany = (sellerCompany?: string) => {
    if (!sellerCompany || typeof window === "undefined") return undefined;
    try {
        const rawMap = window.localStorage.getItem(quoteVehicleCompanyStorageKey);
        const parsedMap = rawMap ? (JSON.parse(rawMap) as Record<string, string>) : {};
        return parsedMap[sellerCompany];
    } catch {
        return undefined;
    }
};

const groupBySellerAndBucket = (list: QuoteItem[]): SellerGroup[] => {
    const sellers = new Map<string, Map<string, Bucket>>();
    const sellerIds = new Map<string, string | undefined>();
    const sellerVehicleIds = new Map<string, string | undefined>();

    for (const item of list) {
        const seller = item.sellerCompany || "Unknown Seller";
        const sellerId = item.sellerId;
        const vehicleId = item.id;
        const bucketKey = buildBucketKey(item);

        if (!sellers.has(seller)) {
            sellers.set(seller, new Map<string, Bucket>());
        }
        if (!sellerIds.has(seller) && sellerId) {
            sellerIds.set(seller, sellerId);
        }
        if (!sellerVehicleIds.has(seller) && vehicleId) {
            sellerVehicleIds.set(seller, vehicleId);
        }

        const bucketMap = sellers.get(seller)!;
        const existing = bucketMap.get(bucketKey);
        if (!existing) {
            bucketMap.set(bucketKey, {
                key: bucketKey,
                name: item.name,
                year: item.year,
                location: item.location,
                price: item.price,
                currency: item.currency,
                items: [item],
                totalUnits: item.quantity,
            });
        } else {
            existing.items.push(item);
            existing.totalUnits += item.quantity;
        }
    }

    return Array.from(sellers.entries()).map(([sellerCompany, bucketMap]) => {
        const buckets = Array.from(bucketMap.values());
        const totalItems = buckets.reduce((acc, b) => acc + b.items.length, 0);
        const totalUnits = buckets.reduce((acc, b) => acc + b.totalUnits, 0);
        return {
            sellerCompany,
            sellerId: sellerIds.get(sellerCompany) || getSellerIdByCompany(sellerCompany),
            representativeVehicleId: sellerVehicleIds.get(sellerCompany) || getVehicleIdByCompany(sellerCompany),
            buckets,
            totalItems,
            totalUnits,
        };
    });
};

export default function QuoteBuilderList({ list = [] }: Readonly<{ list: QuoteItem[] }>) {
    const router = useRouter();
    const [items, setItems] = useState<QuoteItem[]>(list);

    useEffect(() => {
        setItems(list);
    }, [list]);

    const persistItems = (next: QuoteItem[]) => {
        setItems(next);
        if (typeof window !== "undefined") {
            try {
                window.localStorage.setItem(quoteItemsStorageKey, JSON.stringify(next));
                const ids = next.map((i) => i.id);
                window.localStorage.setItem(quoteStorageKey, JSON.stringify(ids));
            } catch {}
        }
    };

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const sellerByVehicle: Record<string, string> = {};
            const sellerByCompany: Record<string, string> = {};
            const vehicleByCompany: Record<string, string> = {};
            for (const item of items) {
                if (item.id && item.sellerId) sellerByVehicle[item.id] = item.sellerId;
                if (item.sellerCompany && item.sellerId) sellerByCompany[item.sellerCompany] = item.sellerId;
                if (item.sellerCompany && item.id) vehicleByCompany[item.sellerCompany] = item.id;
            }
            window.localStorage.setItem(quoteSellerStorageKey, JSON.stringify(sellerByVehicle));
            window.localStorage.setItem(quoteSellerCompanyStorageKey, JSON.stringify(sellerByCompany));
            window.localStorage.setItem(quoteVehicleCompanyStorageKey, JSON.stringify(vehicleByCompany));
        } catch {}
    }, [items]);

    const grouped = useMemo(() => groupBySellerAndBucket(items), [items]);
    const selectedItems = items.filter((i) => i.isSelected !== false) ?? [];
    const isAllSelected = selectedItems?.length === items.length;
    const selectedUnits = selectedItems.reduce((acc, i) => acc + i.quantity, 0);
    const fobTotal = selectedItems.reduce((acc, i) => acc + i.quantity * i.price, 0);
    const totalPayable = fobTotal;
    const currency = items?.[0]?.currency;

    const handleSelectAll = () => {
        const next = items.map((i) => ({ ...i, isSelected: !isAllSelected }));
        persistItems(next);
    };

    const handleRemoveItem = (itemId: string) => {
        const next = items.filter((i) => i.id !== itemId);
        persistItems(next);
    };

    const handleSelect = (itemId: string) => {
        const next = items.map((i) => (i.id === itemId ? { ...i, isSelected: !(i.isSelected !== false) } : i));
        persistItems(next);
    };

    if (items?.length < 1) {
        return (
            <div className="flex justify-center">
                <div className="p-4 border rounded-2xl border-stroke-light">Quote Builder is Empty</div>
            </div>
        );
    }

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between p-4 border border-stroke-light rounded-xl">
                    <label className="flex gap-2">
                        <input className="accent-brand-blue" checked={isAllSelected} onChange={() => handleSelectAll()} type="checkbox" />
                        <span>Select All ({items.length} Items)</span>
                    </label>
                    <div className="text-sm text-gray-600">
                        {selectedItems?.length} of {items.length} selected
                    </div>
                </div>

                {grouped.map((seller) => (
                    <div key={seller.sellerCompany} className="space-y-4 border border-stroke-light/70 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-brand-blue text-lg font-medium">{seller.sellerCompany}</div>
                                <div className="text-xs text-gray-500">
                                    {seller.totalItems} items • {seller.totalUnits} units
                                </div>
                            </div>
                            {seller.sellerId && seller.representativeVehicleId ? (
                                <div className="w-36">
                                    <NegotiatePriceButton vehicleId={seller.representativeVehicleId} peerId={seller.sellerId} />
                                </div>
                            ) : (
                                <div className="w-36">
                                    <Button size="sm" variant="outline" disabled className="w-full">
                                        Negotiate order
                                    </Button>
                                </div>
                            )}
                        </div>

                        {seller.buckets.map((bucket) => (
                            <div key={bucket.key} className="space-y-3">
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <span className="font-medium text-gray-800">
                                        {bucket.name} ({bucket.year})
                                    </span>
                                    <span>{bucket.totalUnits} units</span>
                                </div>
                                {bucket.items.map((item) => (
                                    <QuoteCard key={item.id} item={item} onRemove={handleRemoveItem} onSelect={handleSelect} />
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div>
                <div className="flex flex-col gap-6 rounded-xl border border-stroke-light p-6 sticky top-20">
                    <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5">
                        <h4 className="leading-none text-brand-blue">Quote Summary</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span>Selected Items:</span>
                            <span>{selectedItems?.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Selected Units:</span>
                            <span>{selectedUnits}</span>
                        </div>
                        <div className="bg-border shrink-0"></div>
                        <div className="flex justify-between">
                            <span>FOB Total:</span>
                            <span>{formatPrice(fobTotal, currency)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Logistics Fees:</span>
                            <span>—</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Platform fees:</span>
                            <span>Calculated at checkout</span>
                        </div>
                        <div className="bg-border shrink-0 "></div>
                        <div className="flex justify-between text-xl">
                            <span>Total Amount:</span>
                            <span>{formatPrice(totalPayable, currency)}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">* Token payments: Remaining balance will be collected on delivery</div>
                        <Button onClick={() => router.push("/my-cart")} fullWidth={true} size="sm">
                            Continue to Cart
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const QuoteCard = ({
    item,
    onRemove,
    onSelect,
}: {
    item: QuoteItem;
    onRemove: (id: string) => void;
    onSelect: (id: string) => void;
}) => {
    const [loading, setLoading] = useState(false);

    const handleRemoveItem = () => {
        setLoading(true);
        onRemove(item.id);
        setLoading(false);
    };

    return (
        <div className="text-foreground flex w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-stroke-light">
            <div className="flex gap-4 p-4 w-full">
                <div className="flex items-start gap-3 shrink-0">
                    <input className="accent-brand-blue mt-1" checked={item.isSelected !== false} onChange={() => onSelect(item.id)} type="checkbox" />
                    <div className="relative h-20 w-28 bg-gray-100 overflow-hidden rounded-lg">
                        <Image src={item.mainImageUrl} alt={item.name} height={80} width={112} className="h-20 w-28 object-cover" />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
                            <div className="mt-1 text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                                <span>
                                    {item.year} • {item.location}
                                </span>
                                <span>Units: {item.quantity}</span>
                            </div>
                        </div>

                        <div className="shrink-0 text-right">
                            <div className="text-base font-semibold flex gap-1 items-center text-gray-900 whitespace-nowrap leading-none">
                                {formatPrice(item.price * item.quantity, item.currency)} <PriceBadge />
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">Unit price: {formatPrice(item.price, item.currency)}</div>
                        </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1">
                                <LocationIcon className="w-2.5 h-2.5" />
                                {item.location}
                            </span>
                        </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                        <Button loading={loading} onClick={handleRemoveItem} size="sm" leftIcon={<DeleteIcon className="h-3 w-3" />} type="button" variant="danger">
                            Remove
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
