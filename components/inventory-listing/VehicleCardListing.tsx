"use client";

import type { Content, Data } from "@/app/vehicles/page";
import { useEffect, useMemo, useRef, useState } from "react";
import SortedBy from "@/components/SortedBy";
import VehicleCard from "@/components/VehicleCard";
import type { SearchParams } from "next/dist/server/request/search-params";
import { formatPrice } from "@/lib/utils";
import Image from "@/elements/Image";
import { EyeIcon, MapPinIcon } from "@/components/Icons";
import ShortList from "@/components/vehicle-details/ShortList";
import QRShare from "@/components/vehicle-details/QRShare";
import Link from "next/link";
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
  title,
  onClose,
  children,
}: {
  isOpen: boolean;
  title: string;
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
      <div className="absolute inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl border-l border-stroke-light flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stroke-light shrink-0">
          <div className="font-semibold text-black truncate">{title}</div>
          <button
            className="h-9 px-3 rounded-md border border-stroke-light hover:bg-gray-50"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        {/* scrollable content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}

function CommonPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap bg-gray-50 text-gray-600 border-gray-300">
      {label}
    </span>
  );
}

/**
 * Unit row design matches card style:
 * rounded-xl, shadow-sm, border-stroke-light, spacing similar.
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
  };
  const inQuoteBuilder = isInQuoteBuilder === true;

  const mileage = getMileage(inv);
  const vin = getVin(inv);
  const price = formatPrice(inv.price, inv.currency);

  return (
    <div className="text-foreground flex w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-stroke-light">
      {/* Thumbnail block like card image */}
      <div className="relative h-24 w-32 bg-gray-100 overflow-hidden shrink-0">
        <Image
          src={inv.mainImageUrl}
          alt={`${inv.brand} ${inv.model}`}
          fill={true}
          height={96}
          width={128}
          className="w-full object-cover"
        />
      </div>

      <div className="flex-1 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate flex items-center gap-2">
              <span className="truncate">
                {inv.year} {inv.brand} {inv.model}
              </span>
              {inQuoteBuilder ? (
                <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-[10px] font-medium w-fit whitespace-nowrap bg-green-50 text-green-700 border-green-200">
                  In Quote Builder
                </span>
              ) : null}
            </div>
            <div className="mt-1 text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
              <span>VIN: {vin}</span>
              {mileage ? <span>Mileage: {mileage}</span> : null}
            </div>
          </div>

          {/* Price area aligned like card */}
          <div className="shrink-0 text-right">
            <div className="text-base font-semibold flex gap-1 items-center text-gray-900 whitespace-nowrap leading-none">
              {price} <PriceBadge />
            </div>
          </div>
        </div>

        {/* Actions: Add to quote builder */}
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e: any) => {
              e.stopPropagation();
              window.location.href = `/vehicles/${inv.id}`;
            }}
          >
            Open listing
          </Button>
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <AddToCartButton
              vehicleId={inv.id}
              label="Add to Quote Builder"
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

        const baseParams = {
          ...querySearchParams,
          sortBy: sort.split("&")[0]?.split("=")[1],
          sortOrder: sort.split("&")[1]?.split("=")[1],
        };

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

      {/* Right-side modal (matching card styling inside) */}
      <SlideOver
        isOpen={!!openBucketKey}
        title={
          activeBucket
            ? `${activeBucket.year ?? ""} ${activeBucket.brand ?? ""} ${activeBucket.model ?? ""}`.trim()
            : "Vehicle Group"
        }
        onClose={() => setOpenBucketKey(null)}
      >
        {activeBucket ? (
          <div className="p-5 space-y-5">
            {/* Header styled like an expanded card */}
            <div className="text-foreground flex flex-col w-full bg-white rounded-xl shadow-sm overflow-hidden border border-stroke-light">
              {/* Image block like card top */}
              <div className="relative h-48 bg-gray-100 rounded-t-xl overflow-hidden">
                <Image
                  src={(activeBucket.representative.inventory as InventoryMaybeExtended)?.mainImageUrl}
                  alt={`${activeBucket.brand ?? ""} ${activeBucket.model ?? ""}`}
                  fill={true}
                  height={168}
                  width={260}
                  className="w-full object-cover"
                />

                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center justify-center font-medium text-white text-[10px] px-2 py-1 rounded-md bg-brand-blue">
                    Verified Dealer
                  </span>
                </div>

                {activeBucket.condition ? (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center justify-center font-medium bg-white text-gray-700 text-[10px] px-2 py-1 rounded-md">
                      {activeBucket.condition}
                    </span>
                  </div>
                ) : null}

                <div className="absolute bottom-3 left-3 flex items-center bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                  <EyeIcon className="h-3 w-3 mr-1" />
                  <span className="text-[10px]">{0} viewing</span>
                </div>

                <div className="absolute bottom-3 right-3 flex space-x-2">
                  <ShortList
                    onlyHeart={true}
                    isLike={false}
                    inventoryId={activeBucket.representative.id}
                    iconCls="h-4 w-4 text-gray-600"
                    cls="bg-white h-8 w-8 p-0 rounded-md shadow-sm hover:bg-gray-50 justify-center"
                  />
                </div>
              </div>

              {/* Expanded common details */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-base font-medium text-gray-900 truncate">
                      {activeBucket.year} {activeBucket.brand} {activeBucket.model}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 line-clamp-2">
                      {activeBucket.bodyType || "—"} &bull; {activeBucket.variant || "—"}
                      {activeBucket.color ? ` &bull; ${activeBucket.color}` : ""}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-lg font-semibold flex gap-1 items-center text-gray-900 whitespace-nowrap leading-none">
                      {priceRangeText(activeBucket)} <PriceBadge />
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">Price range</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {activeBucket.color ? <CommonPill label={`Color: ${activeBucket.color}`} /> : null}
                  {activeBucket.condition ? <CommonPill label={`Grade: ${activeBucket.condition}`} /> : null}
                  {activeBucket.year ? <CommonPill label={`Year: ${activeBucket.year}`} /> : null}
                  {activeBucket.bodyType ? <CommonPill label={`Body: ${activeBucket.bodyType}`} /> : null}
                </div>

                {/* Location + share (same as card bottom) */}
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPinIcon className="h-3.5 w-3.5 mr-1" />
                    <span>
                      {activeBucket.representative.inventory?.city}, {activeBucket.representative.inventory?.country}
                    </span>
                  </div>
                  <QRShare
                    vehicleUrl={`/vehicles/${activeBucket.representative.inventory?.id}`}
                    btnCls="h-auto"
                    iconCls="w-4 h-4 text-brand-blue"
                  />
                </div>

                {/* Seller line (same as card) */}
                <div className="text-sm text-gray-500 mt-1">
                  By{" "}
                  <Link
                    href={`/seller-details/${activeBucket.representative.inventory?.userId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-brand-blue hover:underline font-medium"
                  >
                    {activeBucket.representative.user?.roleMetaData?.companyName ||
                      activeBucket.representative.user?.roleMetaData?.dealershipName}
                  </Link>
                </div>

                {/* Open listing button removed per request */}
              </div>
            </div>

            {/* Units list */}
            <div className="space-y-3">
              <div className="text-sm font-semibold text-gray-900">
                Units in this bucket ({activeBucket.count})
              </div>

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
        ) : null}
      </SlideOver>
    </>
  );
}
