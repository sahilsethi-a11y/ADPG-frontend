"use client";

import type { Content } from "@/app/vehicles/page";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SortedBy from "@/components/SortedBy";
import VehicleCard from "@/components/VehicleCard";
import type { SearchParams } from "next/dist/server/request/search-params";
import { formatPrice } from "@/lib/utils";
import Image from "@/elements/Image";
import { MapPinIcon } from "@/components/Icons";
import PriceBadge from "@/elements/PriceBadge";
import Button from "@/elements/Button";
import AddToCartButton from "@/components/buyer/AddToCardButton";

type PropsT = {
  initialData: Content[];
  last: boolean;
  currentPage: number;
  querySearchParams: SearchParams;
  totalItems: number;
  totalPages: number;
  pageSize: number;
  cartInventoryIds: string[];
};

type InventoryMaybeExtended = Content["inventory"] & {
  variant?: string;
  color?: string;

  // unit-level fields (may differ; adjust later)
  vin?: string;
  VIN?: string;
  mileage?: string | number;
  odometer?: string | number;
  odometerKm?: string | number;
  km?: string | number;
};

type Bucket = {
  key: string;

  // Common params (because bucketing groups by these)
  brand?: string;
  model?: string;
  variant?: string;
  color?: string;
  year?: number;
  condition?: string; // grade
  bodyType?: string;

  currency?: string;

  count: number;
  representative: Content;
  items: Content[];

  minPrice: number;
  maxPrice: number;
};

const safeStr = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const safeNum = (v: unknown) => (typeof v === "number" ? v : Number(v));

const buildSearchParams = (params: Record<string, unknown>) => {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v === undefined || v === null || v === "") continue;
        sp.append(key, String(v));
      }
    } else {
      if (value === undefined || value === null || value === "") continue;
      sp.set(key, String(value));
    }
  }
  return sp;
};

const clientSearch = async (params: Record<string, unknown>) => {
  const searchParams = buildSearchParams(params);
  const res = await fetch(`/api/inventory/search?${searchParams.toString()}`, {
    credentials: "include",
  });
  return res.json();
};

const parsePrice = (price: unknown) => {
  if (typeof price === "number") return Number.isFinite(price) ? price : 0;
  if (typeof price === "string") {
    const cleaned = price.replace(/[^0-9.]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const getMileage = (inv: InventoryMaybeExtended) => {
  const v = inv.mileage ?? inv.odometer ?? inv.odometerKm ?? inv.km;
  if (v === undefined || v === null) return "";
  const s = `${v}`.trim();
  return s ? s : "";
};

const getVin = (inv: InventoryMaybeExtended) => {
  const v = inv.vin ?? inv.VIN;
  const s = safeStr(v);
  return s ? s : "—";
};

const buildBucketKey = (inv: InventoryMaybeExtended) => {
  const brand = safeStr(inv.brand).toLowerCase();
  const model = safeStr(inv.model).toLowerCase();
  const variant = safeStr(inv.variant).toLowerCase();
  const color = safeStr(inv.color).toLowerCase();
  const year = safeNum(inv.year);
  const condition = safeStr(inv.condition).toLowerCase();
  const bodyType = safeStr(inv.bodyType).toLowerCase();
  return [brand, model, variant, color, year, condition, bodyType].join("|");
};

const bucketListings = (items: Content[]): Bucket[] => {
  const map = new Map<string, Bucket>();

  for (const item of items) {
    const inv = item.inventory as InventoryMaybeExtended;
    const key = buildBucketKey(inv);

    const price = parsePrice(inv.price);
    const currency = safeStr(inv.currency) || undefined;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        key,
        brand: safeStr(inv.brand) || undefined,
        model: safeStr(inv.model) || undefined,
        variant: safeStr(inv.variant) || undefined,
        color: safeStr(inv.color) || undefined,
        year: safeNum(inv.year) || undefined,
        condition: safeStr(inv.condition) || undefined,
        bodyType: safeStr(inv.bodyType) || undefined,
        currency,

        count: 1,
        representative: item,
        items: [item],

        minPrice: price,
        maxPrice: price,
      });
    } else {
      existing.count += 1;
      existing.items.push(item);
      existing.currency = existing.currency || currency;
      existing.minPrice = Math.min(existing.minPrice, price);
      existing.maxPrice = Math.max(existing.maxPrice, price);
    }
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
};

// ---------- SlideOver (right side) ----------
function SlideOver({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  // lock background scroll
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      {/* right drawer */}
      <div className="absolute inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl border-l border-stroke-light flex flex-col">
        {/* Minimal header with only X button */}
        <div className="flex justify-end p-4 shrink-0">
          <button
            className="h-7 w-7 p-1 rounded-md hover:bg-gray-100 flex items-center justify-center"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* scrollable content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}


/**
 * Unit card row matching Figma design:
 * Horizontal layout with larger image, clear VIN/mileage, price on right, CTA button
 */
function UnitCardRow({
  item,
  isInQuoteBuilder,
  onAdded,
}: {
  item: Content;
  isInQuoteBuilder?: boolean;
  onAdded?: (inventoryId: string) => void;
}) {
  const router = useRouter();
  const inv = item.inventory as InventoryMaybeExtended;
  const sellerId = item?.inventory?.userId || (item as any)?.user?.userId;
  const sellerCompany =
    item?.user?.roleMetaData?.companyName || item?.user?.roleMetaData?.dealershipName;
  const storageItem = {
    id: inv.id,
    name: `${inv.brand ?? ""} ${inv.model ?? ""}`.trim(),
    year: Number(inv.year) || 0,
    location: `${inv.city ?? ""}${inv.country ? `, ${inv.country}` : ""}`.trim(),
    quantity: 1,
    price: Number(inv.price) || 0,
    currency: inv.currency || "USD",
    mainImageUrl: inv.mainImageUrl,
    sellerCompany: sellerCompany || "Unknown Seller",
    sellerId: sellerId,
    bucketKey: buildBucketKey(inv),
    isSelected: true,

    // Individual vehicle fields for grouping and display
    brand: safeStr(inv.brand) || undefined,
    model: safeStr(inv.model) || undefined,
    variant: safeStr(inv.variant) || undefined,
    color: safeStr(inv.color) || undefined,
    condition: safeStr(inv.condition) || undefined,
    bodyType: safeStr(inv.bodyType) || undefined,
  };

  const mileage = getMileage(inv);
  const vin = getVin(inv);
  const price = formatPrice(inv.price, inv.currency);

  const handleOpenListing = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    router.push(`/vehicles/${inv.id}`);
  };

  return (
    <div className="text-foreground flex w-full bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200">
      {/* Thumbnail block - reduced */}
      <div className="relative h-40 w-52 bg-gray-100 overflow-hidden shrink-0">
        <Image
          src={inv.mainImageUrl}
          alt={`${inv.brand} ${inv.model}`}
          fill={true}
          height={160}
          width={208}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content area with flex layout - compact */}
      <div className="flex-1 px-5 py-4 flex flex-col justify-between items-center">
        {/* Top: VIN and Mileage */}
        <div className="flex flex-col gap-1.5 w-full">
          <div className="text-sm text-gray-600">
            VIN: <span className="font-medium text-gray-800">{vin}</span>
          </div>
          {mileage ? (
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <span className="text-gray-400 text-base">↔</span>
              <span className="font-medium text-gray-800">{mileage} km</span>
            </div>
          ) : null}
        </div>

        {/* Bottom: Price and Buttons */}
        <div className="flex items-center justify-between gap-2 w-full mt-2">
          {/* Price */}
          <div className="flex-1">
            <div className="text-xl font-bold text-gray-900">
              {price}
            </div>
          </div>

          {/* Action Buttons Container */}
          <div className="flex items-center gap-2">
            {/* Open Listing Button */}
            <Button
              onClick={handleOpenListing}
              variant="secondary"
              size="sm"
              className="text-xs font-medium px-3 py-1.5"
            >
              Open Listing
            </Button>

            {/* Add to Quote Button */}
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <AddToCartButton
                vehicleId={inv.id}
                label="Add to Quote"
                quantityOverride={1}
                fullWidth={false}
                size="sm"
                isInQuoteBuilder={isInQuoteBuilder}
                onAdded={() => onAdded?.(inv.id)}
                sellerId={sellerId}
                sellerCompany={sellerCompany}
                storageItem={storageItem}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VehicleCardListing({
  initialData,
  last: initialLast,
  currentPage,
  querySearchParams,
  totalItems,
  totalPages,
  pageSize,
  cartInventoryIds,
}: Readonly<PropsT>) {
  const lastRef = useRef(initialLast);
  const pageRef = useRef(typeof currentPage === "number" ? currentPage + 1 : 2);
  const loadingRef = useRef(false);
  const pageParamRef = useRef<"page" | "pageNo" | "pageNumber" | "pageIndex">("page");
  const pageBaseRef = useRef<0 | 1>(1);

  const [items, setItems] = useState(initialData);
  const [quoteIds, setQuoteIds] = useState<string[]>(cartInventoryIds ?? []);
  const [sortBy, setSortBy] = useState("sortBy=price&sortOrder=asc");
  const sortByRef = useRef("sortBy=price&sortOrder=asc");

  const [openBucketKey, setOpenBucketKey] = useState<string | null>(null);
  const prefetchedAllRef = useRef(false);
  const quoteIdSet = useMemo(() => new Set(quoteIds), [quoteIds]);
  const quoteStorageKey = "quoteBuilderIds";
  const quoteItemsStorageKey = "quoteBuilderItems";

  const addQuoteId = (id: string) => {
    if (!id || quoteIdSet.has(id)) return;
    setQuoteIds((prev) => {
      const merged = Array.from(new Set([...prev, id]));
      if (typeof window !== "undefined") {
        window.localStorage.setItem(quoteStorageKey, JSON.stringify(merged));
      }
      return merged;
    });
  };

  const addAllUnitsToQuote = () => {
    if (!activeBucket || activeBucket.items.length === 0) return;

    const itemsToAdd: Array<any> = [];

    // Collect all storage items for bulk addition
    for (const item of activeBucket.items) {
      const inv = item.inventory as InventoryMaybeExtended;
      const id = inv.id;

      // Skip if already in quote
      if (quoteIdSet.has(id)) continue;

      const sellerId = item?.inventory?.userId || (item as any)?.user?.userId;
      const sellerCompany =
        item?.user?.roleMetaData?.companyName || item?.user?.roleMetaData?.dealershipName;

      const storageItem = {
        id: inv.id,
        name: `${inv.brand ?? ""} ${inv.model ?? ""}`.trim(),
        year: Number(inv.year) || 0,
        location: `${inv.city ?? ""}${inv.country ? `, ${inv.country}` : ""}`.trim(),
        quantity: 1,
        price: Number(inv.price) || 0,
        currency: inv.currency || "USD",
        mainImageUrl: inv.mainImageUrl,
        sellerCompany: sellerCompany || "Unknown Seller",
        sellerId: sellerId,
        bucketKey: buildBucketKey(inv),
        isSelected: true,

        // Individual vehicle fields for grouping and display
        brand: safeStr(inv.brand) || undefined,
        model: safeStr(inv.model) || undefined,
        variant: safeStr(inv.variant) || undefined,
        color: safeStr(inv.color) || undefined,
        condition: safeStr(inv.condition) || undefined,
        bodyType: safeStr(inv.bodyType) || undefined,
      };

      itemsToAdd.push(storageItem);
      // Also update the quote IDs state
      addQuoteId(inv.id);
    }

    // Update localStorage with full item details
    if (itemsToAdd.length > 0 && typeof window !== "undefined") {
      try {
        const existing = window.localStorage.getItem(quoteItemsStorageKey);
        const existingItems = existing ? (JSON.parse(existing) as Array<{ id: string }>) : [];

        // Merge new items with existing, avoiding duplicates
        const merged = [...existingItems];
        for (const newItem of itemsToAdd) {
          if (!merged.some((m) => m.id === newItem.id)) {
            merged.push(newItem);
          }
        }

        window.localStorage.setItem(quoteItemsStorageKey, JSON.stringify(merged));
      } catch (err) {
        console.error("Error updating quote builder items:", err);
      }
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const rawItems = window.localStorage.getItem(quoteItemsStorageKey);
      const parsedItems = rawItems ? (JSON.parse(rawItems) as Array<{ id: string }>) : [];
      const localIds = parsedItems.map((i) => i.id).filter(Boolean);
      const merged = Array.from(new Set([...(cartInventoryIds ?? []), ...localIds]));
      setQuoteIds(merged);
      window.localStorage.setItem(quoteStorageKey, JSON.stringify(merged));
    } catch {}
  }, [cartInventoryIds]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== quoteStorageKey) return;
      try {
        const parsed = e.newValue ? (JSON.parse(e.newValue) as string[]) : [];
        setQuoteIds(parsed);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const getPaginatedData = async (page: number, sort: string = sortByRef.current, isScroll = true) => {
    try {
      loadingRef.current = true;

      const pageValue = page - (pageBaseRef.current === 0 ? 1 : 0);

      const res = await clientSearch({
        ...querySearchParams,
        [pageParamRef.current]: String(pageValue),
        sortBy: sort.split("&")[0]?.split("=")[1],
        sortOrder: sort.split("&")[1]?.split("=")[1],
      });

      const data = res.data.content;
      lastRef.current = res.data.last;

      if (isScroll) setItems((prev) => [...prev, ...data]);
      else setItems(data);
    } catch (err) {
      console.log(err, "error");
    } finally {
      setTimeout(() => (loadingRef.current = false), 1000);
    }
  };

  const getAllPages = async (sort: string = sortByRef.current) => {
    try {
      loadingRef.current = true;
      const candidates: Array<{ key: "page" | "pageNo" | "pageNumber" | "pageIndex"; base: 0 | 1 }> = [
        { key: "page", base: 1 },
        { key: "pageNo", base: 1 },
        { key: "pageNumber", base: 1 },
        { key: "pageIndex", base: 0 },
      ];

      let candidateIndex = 0;
      let all: Content[] = [];
      let page = 1;
      let last = false;
      let safety = 0;
      let seen = new Set<string>();
      let totalTarget: number | undefined;

      const baseParams = {
        ...querySearchParams,
        sortBy: sort.split("&")[0]?.split("=")[1],
        sortOrder: sort.split("&")[1]?.split("=")[1],
      };

      const resetState = () => {
        all = [];
        page = 1;
        last = false;
        safety = 0;
        seen = new Set<string>();
        totalTarget = undefined;
      };

      while (!last && safety < 200 && candidateIndex < candidates.length) {
        const { key, base } = candidates[candidateIndex];
        const pageValue = String(page - (base === 0 ? 1 : 0));

        const res = await clientSearch({
          ...baseParams,
          [key]: pageValue,
        });

        const data = res.data.content;
        last = res.data.last;
        if (totalTarget === undefined) {
          totalTarget = res.data.totalItems || res.data.totalElements || undefined;
        }

        let added = 0;
        for (const item of data) {
          const id = item?.inventory?.id ?? item?.id;
          if (!id || seen.has(id)) continue;
          seen.add(id);
          all.push(item);
          added += 1;
        }

        if (data.length === 0 || added === 0) {
          if (page > 1 && candidateIndex < candidates.length - 1) {
            candidateIndex += 1;
            resetState();
            continue;
          }
          break;
        }
        if (totalTarget && all.length >= totalTarget) break;

        page += 1;
        safety += 1;
      }

      const finalCandidate = candidates[Math.min(candidateIndex, candidates.length - 1)];
      pageParamRef.current = finalCandidate.key;
      pageBaseRef.current = finalCandidate.base;

      const resolvedTotalPages = Number.isFinite(totalPages) && totalPages > 1 ? totalPages : undefined;
      if (resolvedTotalPages) {
        const seenAll = new Set<string>();
        const merged: Content[] = [];
        for (const item of items) {
          const id = item?.inventory?.id ?? item?.id;
          if (!id || seenAll.has(id)) continue;
          seenAll.add(id);
          merged.push(item);
        }

        const pages = Array.from({ length: resolvedTotalPages - 1 }, (_, i) => i + 2);
        const batchSize = 6;
        for (let i = 0; i < pages.length; i += batchSize) {
          const batch = pages.slice(i, i + batchSize);
          const results = await Promise.all(
            batch.map((p) =>
              clientSearch({
                ...baseParams,
                [pageParamRef.current]: String(p - (pageBaseRef.current === 0 ? 1 : 0)),
              }),
            ),
          );

          for (const r of results) {
            const list: Content[] = r?.data?.content ?? [];
            for (const it of list) {
              const id = it?.inventory?.id ?? it?.id;
              if (!id || seenAll.has(id)) continue;
              seenAll.add(id);
              merged.push(it);
            }
          }

          setItems([...merged]);
        }

        lastRef.current = true;
        return;
      }

      lastRef.current = true;
      setItems(all);
    } catch (err) {
      console.log(err, "error");
    } finally {
      setTimeout(() => (loadingRef.current = false), 1000);
    }
  };

  const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
      if (!lastRef.current && !loadingRef.current) {
        getPaginatedData(pageRef.current);
        pageRef.current = pageRef.current + 1;
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (prefetchedAllRef.current) return;
    if (totalItems <= items.length) {
      prefetchedAllRef.current = true;
      return;
    }
    prefetchedAllRef.current = true;
    getAllPages(sortByRef.current);
    pageRef.current = 2;
  }, [items.length, totalItems]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
    sortByRef.current = value;
    getAllPages(value);
    pageRef.current = 2;
  };

  const buckets = useMemo(() => bucketListings(items), [items]);
  const groupsCount = buckets.length;

  const activeBucket = openBucketKey ? buckets.find((b) => b.key === openBucketKey) : undefined;

  const priceRangeText = (b?: Bucket) => {
    if (!b) return "";
    const currency = b.currency ?? b.representative.inventory.currency;
    if (b.minPrice === b.maxPrice) return formatPrice(String(Math.round(b.minPrice)), currency);
    return `${formatPrice(String(Math.round(b.minPrice)), currency)} - ${formatPrice(String(Math.round(b.maxPrice)), currency)}`;
  };

  return (
    <>
      {/* Top text */}
      <div className="flex items-center justify-between gap-4 mb-6 mt-8">
        <span className="text-sm text-[#4d4f53]">
          <span className="font-semibold text-black">Showing {totalItems} vehicles</span>{" "}
          <span className="text-[#4d4f53]">(in {groupsCount} groups)</span>
        </span>

        {/* Remove "Showing X vehicles" from inside SortedBy.tsx if it exists */}
        <div className="w-52">
          <SortedBy count={totalItems} handleSortChange={handleSortChange} sortBy={sortBy} />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {buckets.map((bucket) => (
          <VehicleCard
            key={bucket.key}
            item={bucket.representative}
            bucketCount={bucket.count}
            bucketVariant={bucket.variant}
            bucketPriceRange={{
              min: bucket.minPrice,
              max: bucket.maxPrice,
              currency: bucket.currency ?? bucket.representative.inventory.currency,
            }}
            viewAllLabel={bucket.count > 1 ? `View all ${bucket.count} units` : "View details"}
            onViewAllClick={() => setOpenBucketKey(bucket.key)}
            isInQuoteBuilder={bucket.items.some((it) => quoteIdSet.has(it.inventory.id))}
          />
        ))}
      </div>

      {/* Right-side modal (matching Figma design) */}
      <SlideOver
        isOpen={!!openBucketKey}
        onClose={() => setOpenBucketKey(null)}
      >
        {activeBucket ? (
          <div className="flex flex-col h-full bg-white">
            {/* Scrollable content area */}
            <div className="flex-1 overflow-auto">
              {/* TOP SECTION: Badges, Title, Subtitle, Info Pills */}
              <div className="px-6 pt-4 pb-5 border-b border-gray-100">
                {/* Badges row */}
                <div className="flex items-center gap-2.5 flex-wrap mb-2">
                  <span className="inline-flex items-center justify-center rounded-full px-3.5 py-1.5 text-xs font-semibold bg-brand-blue text-white">
                    Inventory Group
                  </span>
                  {activeBucket.condition ? (
                    <span className="inline-flex items-center justify-center rounded-full px-3.5 py-1.5 text-xs font-medium bg-gray-200 text-gray-700">
                      {activeBucket.condition}
                    </span>
                  ) : null}
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 mb-1 leading-snug">
                  {activeBucket.year} {activeBucket.brand} {activeBucket.model}
                </h2>

                {/* Subtitle */}
                <p className="text-xs text-gray-600 mb-2.5">
                  {activeBucket.variant || "—"} {activeBucket.bodyType ? `• ${activeBucket.bodyType}` : ""}
                </p>

                {/* Info Pills: Color, Dealer, Location */}
                <div className="flex items-center gap-4 flex-wrap text-xs">
                  {activeBucket.color ? (
                    <div className="flex items-center text-gray-700 gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 rounded-full border border-gray-300" style={{ backgroundColor: activeBucket.color.toLowerCase() === "white" ? "#f3f4f6" : activeBucket.color.toLowerCase() }}></span>
                      <span className="font-medium">{activeBucket.color}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center text-gray-700 font-medium gap-1">
                    <span className="text-sm">🏢</span>
                    <span>
                      {activeBucket.representative.user?.roleMetaData?.companyName ||
                        activeBucket.representative.user?.roleMetaData?.dealershipName ||
                        "Dealer"}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-700 font-medium gap-1">
                    <MapPinIcon className="h-3.5 w-3.5 text-gray-600" />
                    <span>
                      {activeBucket.representative.inventory?.city}, {activeBucket.representative.inventory?.country}
                    </span>
                  </div>
                </div>
              </div>

              {/* SUMMARY SECTION: Single card with proper spacing */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 px-5 py-4">
                  <div className="flex items-center justify-between gap-6">
                    {/* Left: Total Units & Price Range Container */}
                    <div className="flex items-center flex-1 gap-7">
                      {/* Total Units */}
                      <div className="flex flex-col">
                        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1.5">Total Units</div>
                        <div className="text-4xl font-bold text-gray-900 leading-none">{activeBucket.count}</div>
                        <div className="text-xs text-gray-500 mt-1.5 font-medium">Available</div>
                      </div>

                      {/* Divider */}
                      <div className="h-16 w-px bg-gray-300"></div>

                      {/* Price Range */}
                      <div className="flex flex-col">
                        <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1.5">Price Range</div>
                        <div className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                          {priceRangeText(activeBucket)}
                          <PriceBadge />
                        </div>
                      </div>
                    </div>

                    {/* Right: ADD ALL BUTTON */}
                    <Button
                      size="lg"
                      className="bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold px-5 py-2.5 rounded-lg shrink-0 whitespace-nowrap text-xs disabled:opacity-60"
                      onClick={addAllUnitsToQuote}
                      disabled={activeBucket.items.every((item) => quoteIdSet.has(item.inventory.id))}
                    >
                      + Add All {activeBucket.count}
                    </Button>
                  </div>
                </div>
              </div>

              {/* INDIVIDUAL UNITS SECTION */}
              <div className="px-6 py-4">
                {/* Section Heading */}
                <div className="mb-4">
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                    Individual Units
                  </div>
                </div>

                {/* UNIT CARDS LIST */}
                <div className="space-y-3">
                  {activeBucket.items.map((it) => (
                    <UnitCardRow
                      key={it.inventory.id}
                      item={it}
                      isInQuoteBuilder={quoteIdSet.has(it.inventory.id)}
                      onAdded={(id) => addQuoteId(id)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* BOTTOM: Showing X units (Sticky Footer) */}
            <div className="border-t border-gray-200 bg-white px-6 py-3 text-xs text-gray-600 font-medium sticky bottom-0">
              Showing {activeBucket.count} units
            </div>
          </div>
        ) : null}
      </SlideOver>
    </>
  );
}
