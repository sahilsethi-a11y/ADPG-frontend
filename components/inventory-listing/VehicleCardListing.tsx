"use client";

import type { Content, Data } from "@/app/vehicles/page";
import { useEffect, useMemo, useRef, useState } from "react";
import SortedBy from "@/components/SortedBy";
import VehicleCard from "@/components/VehicleCard";
import type { SearchParams } from "next/dist/server/request/search-params";
import Image from "@/elements/Image";
import { EyeIcon, MapPinIcon } from "@/components/Icons";
import ShortList from "@/components/vehicle-details/ShortList";
import QRShare from "@/components/vehicle-details/QRShare";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/elements/Button";
import PriceBadge from "@/elements/PriceBadge";
import Select from "@/elements/Select";
import { api } from "@/lib/api/client-request";

type PropsT = {
  initialData: Content[];
  last: boolean;
  currentPage: number;
  querySearchParams: SearchParams;
  totalItems: number;
  totalPages: number;
  pageSize: number;
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
  inventoryData?: {
    vin?: string;
    mileage?: string | number;
  };
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
  minMileage?: number;
  maxMileage?: number;
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

const getMileage = (inv: InventoryMaybeExtended, inventoryData?: { mileage?: string | number }) => {
  const v =
    inventoryData?.mileage ??
    inv.inventoryData?.mileage ??
    inv.mileage ??
    inv.odometer ??
    inv.odometerKm ??
    inv.km;
  if (v === undefined || v === null) return "";
  const s = `${v}`.trim();
  return s ? s : "";
};

const parseMileage = (value: string) => {
  if (!value) return undefined;
  const cleaned = value.replace(/[^0-9.]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
};

const getVin = (inv: InventoryMaybeExtended, inventoryData?: { vin?: string }) => {
  const v = inventoryData?.vin ?? inv.inventoryData?.vin ?? inv.vin ?? inv.VIN;
  const s = safeStr(v);
  return s ? s : "—";
};

const normalizeId = (id: string | number | undefined | null) => String(id ?? "");

const formatPriceNoDecimals = (value: number | string, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

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
    const inventoryData = (item as any)?.inventoryData ?? (inv as any)?.inventoryData;
    const mileageRaw = getMileage(inv, inventoryData);
    const mileageNum = parseMileage(mileageRaw);

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
        minMileage: mileageNum,
        maxMileage: mileageNum,
      });
    } else {
      existing.count += 1;
      existing.items.push(item);
      existing.currency = existing.currency || currency;
      existing.minPrice = Math.min(existing.minPrice, price);
      existing.maxPrice = Math.max(existing.maxPrice, price);
      if (mileageNum !== undefined) {
        existing.minMileage =
          existing.minMileage === undefined ? mileageNum : Math.min(existing.minMileage, mileageNum);
        existing.maxMileage =
          existing.maxMileage === undefined ? mileageNum : Math.max(existing.maxMileage, mileageNum);
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
};

// ---------- SlideOver (right side) ----------
function SlideOver({
  isOpen,
  title,
  onClose,
  isExpanded,
  onToggleExpand,
  children,
}: {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
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
      <div
        className={`absolute inset-y-0 right-0 w-full bg-white shadow-2xl border-l border-stroke-light flex flex-col ${
          isExpanded ? "max-w-5xl" : "max-w-xl"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stroke-light shrink-0">
          <div className="font-semibold text-black truncate">{title}</div>
          <div className="flex items-center gap-2">
            <button
              className="h-9 px-3 rounded-md border border-stroke-light hover:bg-gray-50 text-xs font-medium"
              onClick={onToggleExpand}
              type="button"
            >
              {isExpanded ? "Make smaller" : "Expand"}
            </button>
            <button
              className="h-9 px-3 rounded-md border border-stroke-light hover:bg-gray-50"
              onClick={onClose}
              type="button"
            >
              Close
            </button>
          </div>
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
  canUseQuoteBuilder,
  onAddToQuote,
  onRemoveFromQuote,
}: {
  item: Content;
  isInQuoteBuilder: boolean;
  canUseQuoteBuilder: boolean;
  onAddToQuote: (payload: {
    id: string;
    storageItem: {
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
  }) => void;
  onRemoveFromQuote: (id: string) => void;
}) {
  const router = useRouter();
  const inv = item.inventory as InventoryMaybeExtended;

  const inventoryData = (item as any)?.inventoryData;
  const mileage = getMileage(inv, inventoryData);
  const vin = getVin(inv, inventoryData);
  const reportUrl =
    vin && vin !== "—"
      ? `https://report.adpgauto.com/${encodeURIComponent(vin)}`
      : (inv as any)?.inspectionReportUrl ??
        (inv as any)?.inventoryData?.inspectionReportUrl ??
        (item as any)?.inventoryData?.inspectionReportUrl;
  const price = formatPriceNoDecimals(inv.price, inv.currency);
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

  return (
    <div
      className="text-foreground flex w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-stroke-light cursor-pointer"
      onClick={() => router.push(`/vehicles/${inv.id}`)}
    >
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
        <div className="absolute top-2.5 right-2.5">
          <ShortList
            onlyHeart={true}
            isLike={false}
            inventoryId={item.id}
            iconCls="h-3 w-3 text-gray-600"
            cls="bg-white h-6 w-6 p-0 rounded-md shadow-sm hover:bg-gray-50 justify-center"
          />
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate flex items-center gap-2">
              <span className="truncate">
                {inv.year} {inv.brand} {inv.model}
              </span>
              {canUseQuoteBuilder && isInQuoteBuilder ? (
                <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-[10px] font-medium w-fit whitespace-nowrap bg-green-50 text-green-700 border-green-200">
                  In Quote Builder
                </span>
              ) : null}
            </div>
            <div className="mt-1 text-xs text-gray-500 space-y-1">
              <div>VIN: {vin || "—"}</div>
              <div>Mileage: {mileage || "—"}</div>
            </div>
          </div>

          {/* Price area aligned like card */}
          <div className="shrink-0 text-right">
            <div className="text-base font-semibold flex gap-1 items-center text-gray-900 whitespace-nowrap leading-none">
              {price} <PriceBadge />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const url = reportUrl;
              if (url) window.open(url, "_blank", "noopener,noreferrer");
            }}
            disabled={!reportUrl}
            className="h-8 px-3 rounded-md border border-stroke-light text-gray-700 hover:bg-gray-50 transition-all text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            View report
          </button>

          {canUseQuoteBuilder && isInQuoteBuilder ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromQuote(inv.id);
              }}
              className="h-8 px-3 rounded-md border border-destructive text-destructive hover:bg-destructive hover:text-white transition-all text-xs font-medium"
            >
              Remove
            </button>
          ) : canUseQuoteBuilder ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToQuote({ id: inv.id, storageItem });
              }}
              className="h-8 px-3 rounded-md bg-brand-blue text-white hover:opacity-90 transition-all text-xs font-medium"
            >
              Add to Quote Builder
            </button>
          ) : null}
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
}: Readonly<PropsT>) {
  const lastRef = useRef(initialLast);
  const pageRef = useRef(typeof currentPage === "number" ? currentPage + 1 : 2);
  const loadingRef = useRef(false);
  const pageParamRef = useRef<"page" | "pageNo" | "pageNumber" | "pageIndex">("page");
  const pageBaseRef = useRef<0 | 1>(1);

  const [items, setItems] = useState(initialData);
  const [sortBy, setSortBy] = useState("sortBy=price&sortOrder=asc");
  const sortByRef = useRef("sortBy=price&sortOrder=asc");

  const [openBucketKey, setOpenBucketKey] = useState<string | null>(null);
  const [isModalExpanded, setIsModalExpanded] = useState(false);
  const [showBucketInfo, setShowBucketInfo] = useState(false);
  const prefetchedAllRef = useRef(false);
  const quoteItemsStorageKey = "quoteBuilderItems";
  const quoteStorageKey = "quoteBuilderIds";
  const quoteSellerStorageKey = "quoteBuilderSellerByVehicle";
  const quoteSellerCompanyStorageKey = "quoteBuilderSellerByCompany";
  const quoteVehicleCompanyStorageKey = "quoteBuilderVehicleByCompany";
  const [quoteIds, setQuoteIds] = useState<string[]>([]);
  const quoteIdSet = useMemo(() => new Set(quoteIds), [quoteIds]);
  const [isBuyer, setIsBuyer] = useState<boolean | null>(null);
  const canUseQuoteBuilder = isBuyer === true;
  const [modalSort, setModalSort] = useState<"price-asc" | "price-desc" | "mileage-asc" | "mileage-desc">(
    "price-asc"
  );
  const modalSortOptions = [
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "mileage-asc", label: "Mileage: Low to High" },
    { value: "mileage-desc", label: "Mileage: High to Low" },
  ];

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
    if (typeof window === "undefined") return;
    if (!canUseQuoteBuilder) {
      setQuoteIds([]);
      return;
    }
    try {
      const rawItems = window.localStorage.getItem(quoteItemsStorageKey);
      const parsedItems = rawItems ? (JSON.parse(rawItems) as Array<{ id: string | number }>) : [];
      const localIds = parsedItems.map((i) => normalizeId(i.id)).filter(Boolean);
      setQuoteIds(localIds);
    } catch {}
  }, [canUseQuoteBuilder]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!canUseQuoteBuilder) return;
    const onQuoteUpdate = () => {
      try {
        const rawItems = window.localStorage.getItem(quoteItemsStorageKey);
        const parsedItems = rawItems ? (JSON.parse(rawItems) as Array<{ id: string | number }>) : [];
        const localIds = parsedItems.map((i) => normalizeId(i.id)).filter(Boolean);
        setQuoteIds(localIds);
      } catch {}
    };
    window.addEventListener("quoteBuilderUpdated", onQuoteUpdate);
    return () => window.removeEventListener("quoteBuilderUpdated", onQuoteUpdate);
  }, [canUseQuoteBuilder]);

  const addQuoteLocal = (payload: {
    id: string;
    storageItem: {
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
  }) => {
    if (typeof window === "undefined") return;
    if (!canUseQuoteBuilder) return;
    try {
      const rawItems = window.localStorage.getItem(quoteItemsStorageKey);
      const parsedItems = rawItems ? (JSON.parse(rawItems) as any[]) : [];
      const filtered = parsedItems.filter((i) => i?.id !== payload.storageItem.id);
      filtered.push({ ...payload.storageItem, isSelected: payload.storageItem.isSelected ?? true });
      window.localStorage.setItem(quoteItemsStorageKey, JSON.stringify(filtered));

      const raw = window.localStorage.getItem(quoteStorageKey);
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      const merged = Array.from(new Set([...parsed, payload.id]));
      window.localStorage.setItem(quoteStorageKey, JSON.stringify(merged));

      if (payload.storageItem.sellerId) {
        const rawMap = window.localStorage.getItem(quoteSellerStorageKey);
        const parsedMap = rawMap ? (JSON.parse(rawMap) as Record<string, string>) : {};
        parsedMap[payload.id] = payload.storageItem.sellerId;
        window.localStorage.setItem(quoteSellerStorageKey, JSON.stringify(parsedMap));
      }
      if (payload.storageItem.sellerCompany && payload.storageItem.sellerId) {
        const rawCompanyMap = window.localStorage.getItem(quoteSellerCompanyStorageKey);
        const parsedCompanyMap = rawCompanyMap ? (JSON.parse(rawCompanyMap) as Record<string, string>) : {};
        parsedCompanyMap[payload.storageItem.sellerCompany] = payload.storageItem.sellerId;
        window.localStorage.setItem(quoteSellerCompanyStorageKey, JSON.stringify(parsedCompanyMap));
      }
      if (payload.storageItem.sellerCompany) {
        const rawVehicleCompanyMap = window.localStorage.getItem(quoteVehicleCompanyStorageKey);
        const parsedVehicleCompanyMap = rawVehicleCompanyMap ? (JSON.parse(rawVehicleCompanyMap) as Record<string, string>) : {};
        parsedVehicleCompanyMap[payload.storageItem.sellerCompany] = payload.id;
        window.localStorage.setItem(quoteVehicleCompanyStorageKey, JSON.stringify(parsedVehicleCompanyMap));
      }
      window.dispatchEvent(new Event("quoteBuilderUpdated"));
      setQuoteIds((prev) => Array.from(new Set([...prev, normalizeId(payload.id)])));
    } catch {}
  };

  const removeQuoteLocal = (id: string) => {
    if (typeof window === "undefined") return;
    if (!canUseQuoteBuilder) return;
    try {
      const rawItems = window.localStorage.getItem(quoteItemsStorageKey);
      const parsedItems = rawItems ? (JSON.parse(rawItems) as any[]) : [];
      window.localStorage.setItem(
        quoteItemsStorageKey,
        JSON.stringify(parsedItems.filter((i) => i?.id !== id))
      );
      const raw = window.localStorage.getItem(quoteStorageKey);
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      window.localStorage.setItem(quoteStorageKey, JSON.stringify(parsed.filter((x) => x !== id)));
      const rawMap = window.localStorage.getItem(quoteSellerStorageKey);
      const parsedMap = rawMap ? (JSON.parse(rawMap) as Record<string, string>) : {};
      delete parsedMap[id];
      window.localStorage.setItem(quoteSellerStorageKey, JSON.stringify(parsedMap));
      window.dispatchEvent(new Event("quoteBuilderUpdated"));
      setQuoteIds((prev) => prev.filter((x) => x !== normalizeId(id)));
    } catch {}
  };

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
  const sortedBucketItems = useMemo(() => {
    if (!activeBucket) return [];
    const items = [...activeBucket.items];
    const mileageValue = (it: Content) => {
      const inv = it.inventory as InventoryMaybeExtended;
      const inventoryData = (it as any)?.inventoryData ?? (inv as any)?.inventoryData;
      const m = getMileage(inv, inventoryData);
      return parseMileage(m ?? 0) ?? 0;
    };
    switch (modalSort) {
      case "price-desc":
        return items.sort((a, b) => (Number(b.inventory.price) || 0) - (Number(a.inventory.price) || 0));
      case "mileage-asc":
        return items.sort((a, b) => mileageValue(a) - mileageValue(b));
      case "mileage-desc":
        return items.sort((a, b) => mileageValue(b) - mileageValue(a));
      case "price-asc":
      default:
        return items.sort((a, b) => (Number(a.inventory.price) || 0) - (Number(b.inventory.price) || 0));
    }
  }, [activeBucket, modalSort]);

  const priceRangeText = (b?: Bucket) => {
    if (!b) return "";
    const currency = b.currency ?? b.representative.inventory.currency;
    if (b.minPrice === b.maxPrice) return formatPriceNoDecimals(Math.round(b.minPrice), currency);
    return `${formatPriceNoDecimals(Math.round(b.minPrice), currency)} - ${formatPriceNoDecimals(Math.round(b.maxPrice), currency)}`;
  };
  const mileageRangeText = (b?: Bucket) => {
    if (!b || b.minMileage === undefined || b.maxMileage === undefined) return "";
    if (b.minMileage === b.maxMileage) return `${Math.round(b.minMileage)} km`;
    return `${Math.round(b.minMileage)} - ${Math.round(b.maxMileage)} km`;
  };

  return (
    <>
      {/* Top text */}
      <div className="flex items-center justify-between gap-4 mb-6 mt-8">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#4d4f53]">
            <span className="font-semibold text-black">Showing {totalItems} vehicles</span>{" "}
            <span className="text-[#4d4f53]">(in {groupsCount} groups)</span>
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowBucketInfo((prev) => !prev)}
              className="h-6 w-6 rounded-full border border-stroke-light text-xs font-semibold text-gray-600 hover:bg-gray-50"
              aria-label="Bucket info"
            >
              i
            </button>
            {showBucketInfo ? (
              <div className="absolute left-0 mt-2 w-64 rounded-xl border border-stroke-light bg-white shadow-sm p-3 text-xs text-[#4d4f53] z-10">
                <div className="font-semibold text-black mb-2">Buckets are based on:</div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Brand</li>
                  <li>Model</li>
                  <li>Variant</li>
                  <li>Color</li>
                  <li>Year</li>
                  <li>Condition</li>
                  <li>Body Type</li>
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        {/* Remove "Showing X vehicles" from inside SortedBy.tsx if it exists */}
        <div className="w-52">
          <SortedBy count={totalItems} handleSortChange={handleSortChange} sortBy={sortBy} />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {buckets.map((bucket) => {
          const bucketAddedCount = canUseQuoteBuilder
            ? bucket.items.reduce(
                (acc, it) => (quoteIdSet.has(normalizeId(it.inventory.id)) ? acc + 1 : acc),
                0
              )
            : 0;
          return (
            <VehicleCard
              key={bucket.key}
              item={bucket.representative}
              bucketCount={bucket.count}
              bucketAddedCount={bucketAddedCount}
              bucketVariant={bucket.variant}
              bucketPriceRange={{
                min: bucket.minPrice,
                max: bucket.maxPrice,
                currency: bucket.currency ?? bucket.representative.inventory.currency,
              }}
              viewAllLabel={bucket.count > 1 ? `View all ${bucket.count} units` : "View details"}
              onViewAllClick={() => setOpenBucketKey(bucket.key)}
            />
          );
        })}
      </div>

      {/* Right-side modal (matching card styling inside) */}
      <SlideOver
        isOpen={!!openBucketKey}
        title={
          activeBucket
            ? `${activeBucket.year ?? ""} ${activeBucket.brand ?? ""} ${activeBucket.model ?? ""}`.trim()
            : "Vehicle Group"
        }
        onClose={() => {
          setOpenBucketKey(null);
          setIsModalExpanded(false);
        }}
        isExpanded={isModalExpanded}
        onToggleExpand={() => setIsModalExpanded((prev) => !prev)}
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

                {/* Favorite button moved to unit cards */}
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
                    <div className="text-xs text-gray-600 mt-2">
                      Mileage range: {mileageRangeText(activeBucket) || "—"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {activeBucket.color ? <CommonPill label={`Color: ${activeBucket.color}`} /> : null}
                  {activeBucket.condition ? <CommonPill label={`Grade: ${activeBucket.condition}`} /> : null}
                  {activeBucket.year ? <CommonPill label={`Year: ${activeBucket.year}`} /> : null}
                  {activeBucket.bodyType ? <CommonPill label={`Body: ${activeBucket.bodyType}`} /> : null}
                  {mileageRangeText(activeBucket) ? <CommonPill label={`Mileage: ${mileageRangeText(activeBucket)}`} /> : null}
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

                {/* Inspection report button removed from header */}
              </div>
            </div>

            {/* Units list */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-semibold text-gray-900">
                  Units in this bucket ({activeBucket.count})
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-44">
                    <Select
                      options={modalSortOptions}
                      value={modalSort}
                      onChange={(value) =>
                        setModalSort(value as "price-asc" | "price-desc" | "mileage-asc" | "mileage-desc")
                      }
                      placeholder="Sort by"
                      border="bg-input-background"
                      cls="w-full"
                    />
                  </div>
                  {canUseQuoteBuilder ? (
                    <button
                      type="button"
                      onClick={() => {
                        activeBucket.items.forEach((it) => {
                        if (!quoteIdSet.has(normalizeId(it.inventory.id))) {
                            const inv = it.inventory as InventoryMaybeExtended;
                            const sellerId = it?.inventory?.userId || (it as any)?.user?.userId;
                            const sellerCompany =
                              it?.user?.roleMetaData?.companyName || it?.user?.roleMetaData?.dealershipName;
                            addQuoteLocal({
                              id: inv.id,
                              storageItem: {
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
                              },
                            });
                          }
                        });
                      }}
                    disabled={activeBucket.items.every((it) => quoteIdSet.has(normalizeId(it.inventory.id)))}
                      className="h-8 px-3 rounded-md bg-brand-blue text-white hover:opacity-90 transition-all text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add all to Quote Builder
                    </button>
                  ) : null}
                </div>
              </div>

              {sortedBucketItems.map((it) => (
                <UnitCardRow
                  key={it.inventory.id}
                  item={it}
                  isInQuoteBuilder={canUseQuoteBuilder && quoteIdSet.has(normalizeId(it.inventory.id))}
                  canUseQuoteBuilder={canUseQuoteBuilder}
                  onAddToQuote={addQuoteLocal}
                  onRemoveFromQuote={removeQuoteLocal}
                />
              ))}
            </div>
          </div>
        ) : null}
      </SlideOver>
    </>
  );
}
