"use client";

import type { Content } from "@/app/vehicles/page";
import { useEffect, useMemo, useRef, useState } from "react";
import SortedBy from "@/components/SortedBy";
import VehicleCard from "@/components/VehicleCard";
import Pagination from "@/components/Pagination";
import QuoteBuilderButton from "@/components/header/QuoteBuilderButton";
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
import message from "@/elements/message";
import { useVehicleBuckets } from "@/hooks/useVehicleBuckets";
import type { BucketMeta } from "@/lib/bucketCache";
import { toBucketMeta } from "@/lib/bucketing";

type PropsT = {
  initialData: Content[];
  last: boolean;
  currentPage: number;
  querySearchParams: SearchParams;
  totalItems: number;
  totalPages: number;
  pageSize: number;
  cartInventoryIds?: string[];
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
const normalize = (v: unknown) => safeStr(v).toLowerCase();


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

const parseTimestamp = (value: unknown) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    const asNum = Number(trimmed);
    if (Number.isFinite(asNum)) return asNum;
    const parsed = Date.parse(trimmed);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const getVehicleTimestamp = (inv: InventoryMaybeExtended, item?: Content) => {
  const raw =
    (inv as any)?.createdAt ??
    (inv as any)?.created_at ??
    (inv as any)?.updatedAt ??
    (inv as any)?.updated_at ??
    (inv as any)?.listedAt ??
    (inv as any)?.listingDate ??
    (inv as any)?.createdOn ??
    (inv as any)?.created_on ??
    (item as any)?.createdAt ??
    (item as any)?.created_at ??
    (item as any)?.updatedAt ??
    (item as any)?.updated_at;
  const ts = parseTimestamp(raw);
  if (ts) return ts;
  const fallbackId = parseTimestamp((inv as any)?.id ?? (item as any)?.id);
  return fallbackId;
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

const getParamValues = (params: SearchParams, key: string) => {
  const value = params?.[key];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
};

const parseRange = (value?: string) => {
  if (!value) return undefined;
  const nums = value.match(/\d+/g)?.map(Number).filter((n) => Number.isFinite(n));
  if (!nums || nums.length === 0) return undefined;
  if (value.includes("+")) return { min: nums[0], max: undefined };
  if (nums.length >= 2) return { min: nums[0], max: nums[1] };
  return { min: nums[0], max: undefined };
};

const hasActiveFilter = (params: SearchParams, keys: string[]) =>
  keys.some((key) => {
    const v = params?.[key];
    if (Array.isArray(v)) return v.length > 0;
    return !!v;
  });


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
  title: React.ReactNode;
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
          <div className="min-w-0">
            {typeof title === "string" ? <div className="font-semibold text-black truncate">{title}</div> : title}
          </div>
          <div className="flex items-center gap-2">
            <QuoteBuilderButton />
            <button
              className="h-9 px-3 rounded-md border border-stroke-light hover:bg-gray-50 text-xs font-medium"
              onClick={onToggleExpand}
              type="button"
            >
              {isExpanded ? "Make smaller" : "Expand"}
            </button>
            <button
              className="h-9 px-3 rounded-md border border-stroke-light hover:bg-gray-50 text-xs font-medium"
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
      mileage?: string | number;
      brand?: string;
      model?: string;
      variant?: string;
      color?: string;
      condition?: string;
      bodyType?: string;
    };
  }) => void;
  onRemoveFromQuote: (id: string) => void;
}) {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
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
    mileage,
    brand: inv.brand,
    model: inv.model,
    variant: inv.variant,
    color: inv.color,
    condition: inv.condition,
    bodyType: inv.bodyType,
  };

  return (
    <div
      className="text-foreground flex w-full bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-stroke-light cursor-pointer"
      onClick={() => router.push(`/vehicles/${inv.id}`)}
    >
      {/* Thumbnail block like card image */}
      <div className="relative h-24 w-32 bg-gray-100 overflow-hidden shrink-0">
        {!imageLoaded ? <div className="absolute inset-0 bg-gray-200" aria-hidden="true" /> : null}
        <Image
          src={inv.mainImageUrl}
          alt={`${inv.brand} ${inv.model}`}
          fill={true}
          height={96}
          width={128}
          onLoadingComplete={() => setImageLoaded(true)}
          className={`w-full object-cover transition-opacity ${imageLoaded ? "opacity-100" : "opacity-0"}`}
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
          ) : (
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
          )}
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
  const { vehicles, buckets: bucketMeta } = useVehicleBuckets(querySearchParams, { refreshOnMount: false });
  const filterKeys = [
    "bodyType",
    "brand",
    "model",
    "priceRange",
    "searchText",
    "condition",
    "color",
    "fuelType",
    "drivetrain",
    "regionalSpecs",
    "transmission",
    "minMileage",
    "maxMileage",
    "yearFrom",
    "yearTo",
    "country",
  ];
  const hasFilters = useMemo(() => hasActiveFilter(querySearchParams, filterKeys), [querySearchParams]);

  const filteredVehicles = useMemo(() => {
    const list = vehicles as Content[];
    if (!hasFilters) return list;

    const bodyType = normalize(getParamValues(querySearchParams, "bodyType")[0]);
    const brand = normalize(getParamValues(querySearchParams, "brand")[0]);
    const model = normalize(getParamValues(querySearchParams, "model")[0]);
    const condition = normalize(getParamValues(querySearchParams, "condition")[0]);
    const color = normalize(getParamValues(querySearchParams, "color")[0]);
    const transmission = normalize(getParamValues(querySearchParams, "transmission")[0]);
    const regionalSpecs = normalize(getParamValues(querySearchParams, "regionalSpecs")[0]);
    const searchText = normalize(getParamValues(querySearchParams, "searchText")[0]);
    const fuelType = getParamValues(querySearchParams, "fuelType").map(normalize);
    const drivetrain = getParamValues(querySearchParams, "drivetrain").map(normalize);

    const yearFrom = Number(getParamValues(querySearchParams, "yearFrom")[0] ?? "");
    const yearTo = Number(getParamValues(querySearchParams, "yearTo")[0] ?? "");
    const minMileage = Number(getParamValues(querySearchParams, "minMileage")[0] ?? "");
    const maxMileage = Number(getParamValues(querySearchParams, "maxMileage")[0] ?? "");
    const priceRange = parseRange(getParamValues(querySearchParams, "priceRange")[0]);

    return list.filter((item) => {
      const inv = item.inventory as InventoryMaybeExtended;
      const inventoryData = (item as any)?.inventoryData ?? inv.inventoryData;

      if (bodyType && normalize(inv.bodyType) !== bodyType) return false;
      if (brand && normalize(inv.brand) !== brand) return false;
      if (model && normalize(inv.model) !== model) return false;
      if (condition && normalize(inv.condition) !== condition) return false;
      if (color && normalize(inv.color) !== color) return false;
      if (transmission && normalize(inv.transmission) !== transmission) return false;
      if (regionalSpecs && normalize((inv as any)?.regionalSpecs) !== regionalSpecs) return false;
      if (fuelType.length && !fuelType.includes(normalize(inv.fuelType))) return false;
      if (drivetrain.length && !drivetrain.includes(normalize((inv as any)?.drivetrain))) return false;

      if (Number.isFinite(yearFrom) && yearFrom > 0 && Number(inv.year) < yearFrom) return false;
      if (Number.isFinite(yearTo) && yearTo > 0 && Number(inv.year) > yearTo) return false;

      const mileageValue = parseMileage(getMileage(inv, inventoryData)) ?? 0;
      if (Number.isFinite(minMileage) && minMileage > 0 && mileageValue < minMileage) return false;
      if (Number.isFinite(maxMileage) && maxMileage > 0 && mileageValue > maxMileage) return false;

      if (priceRange) {
        const price = Number(inv.price) || 0;
        if (priceRange.min !== undefined && price < priceRange.min) return false;
        if (priceRange.max !== undefined && price > priceRange.max) return false;
      }

      if (searchText) {
        const haystack = [
          inv.brand,
          inv.model,
          inv.variant,
          inv.bodyType,
          inv.condition,
          inv.color,
        ]
          .map(normalize)
          .filter(Boolean)
          .join(" ");
        if (!haystack.includes(searchText)) return false;
      }

      return true;
    });
  }, [vehicles, querySearchParams, hasFilters]);

  const displayBucketMeta = useMemo(() => {
    if (!hasFilters) return bucketMeta as BucketMeta[];
    return toBucketMeta(filteredVehicles as unknown as any[], 30);
  }, [bucketMeta, filteredVehicles, hasFilters]);

  const vehiclePool = hasFilters ? filteredVehicles : (vehicles as Content[]);
  const [sortBy, setSortBy] = useState("sortBy=price&sortOrder=asc");
  const sortByRef = useRef("sortBy=price&sortOrder=asc");
  const [bucketPage, setBucketPage] = useState(1);
  const bucketPageSize = 12;

  const [openBucketKey, setOpenBucketKey] = useState<string | null>(null);
  const [isModalExpanded, setIsModalExpanded] = useState(false);
  const [showBucketInfo, setShowBucketInfo] = useState(false);
  const vehicleMap = useMemo(() => {
    const map = new Map<string, Content>();
    for (const v of vehicles ?? []) {
      const id = v?.inventory?.id ?? v?.id;
      if (id) map.set(String(id), v as Content);
    }
    return map;
  }, [vehicles]);
  const quoteItemsStorageKey = "quoteBuilderItems";
  const quoteStorageKey = "quoteBuilderIds";
  const quoteSellerStorageKey = "quoteBuilderSellerByVehicle";
  const quoteSellerCompanyStorageKey = "quoteBuilderSellerByCompany";
  const quoteVehicleCompanyStorageKey = "quoteBuilderVehicleByCompany";
  const [quoteIds, setQuoteIds] = useState<string[]>([]);
  const quoteIdSet = useMemo(() => new Set(quoteIds), [quoteIds]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const canUseQuoteBuilder = userRole === "buyer";
  const [modalSort, setModalSort] = useState<"price-asc" | "price-desc" | "mileage-asc" | "mileage-desc">(
    "price-asc"
  );
  const modalSortOptions = [
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "mileage-asc", label: "Mileage: Low to High" },
    { value: "mileage-desc", label: "Mileage: High to Low" },
  ];
  const bucketRecentMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of vehiclePool ?? []) {
      const key = buildBucketKey(v.inventory as InventoryMaybeExtended);
      const ts = getVehicleTimestamp(v.inventory as InventoryMaybeExtended, v as Content);
      if (!key) continue;
      map.set(key, Math.max(map.get(key) ?? 0, ts));
    }
    return map;
  }, [vehiclePool]);

  const bucketAddedCountMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!canUseQuoteBuilder) return map;
    for (const v of vehiclePool ?? []) {
      const id = v?.inventory?.id ?? v?.id;
      if (!id || !quoteIdSet.has(normalizeId(id))) continue;
      const key = buildBucketKey(v.inventory as InventoryMaybeExtended);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [vehiclePool, quoteIdSet, canUseQuoteBuilder]);

  useEffect(() => {
    let isActive = true;
    const fetchRole = async () => {
      try {
        const userData = await api.get<{ data?: { roleType?: string } }>("/api/v1/auth/getUserInfoByToken", {
          isAuthRequired: false,
        });
        const role = userData.data?.roleType?.toLowerCase();
        if (!isActive) return;
        if (role) {
          setUserRole(role);
          setIsLoggedIn(true);
        } else {
          setUserRole(null);
          setIsLoggedIn(false);
        }
      } catch {
        if (!isActive) return;
        setUserRole(null);
        setIsLoggedIn(false);
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
      mileage?: string | number;
      brand?: string;
      model?: string;
      variant?: string;
      color?: string;
      condition?: string;
      bodyType?: string;
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

  const handleSortChange = (value: string) => {
    setSortBy(value);
    sortByRef.current = value;
  };

  const allowQuoteBuilderAction = () => {
    if (userRole === "buyer") return true;
    if (isLoggedIn === false || isLoggedIn === null) {
      message.info("Please log in to add to quote.");
      return false;
    }
    message.info("Only buyers can add to quote.");
    return false;
  };

  const buckets = useMemo(() => {
    const list: Bucket[] = [];
    for (const meta of displayBucketMeta as BucketMeta[]) {
      const rep =
        (meta.representativeId && vehicleMap.get(meta.representativeId)) ||
        (vehiclePool.find((v) => buildBucketKey(v.inventory as InventoryMaybeExtended) === meta.bucketKey) as Content | undefined);
      if (!rep) continue;
      list.push({
        key: meta.bucketKey,
        brand: meta.brand,
        model: meta.model,
        variant: meta.variant,
        color: meta.color,
        year: meta.year,
        condition: meta.condition,
        bodyType: meta.bodyType,
        currency: meta.currency,
        count: meta.count,
        representative: rep,
        items: [],
        minPrice: meta.minPrice,
        maxPrice: meta.maxPrice,
      });
    }
    return list;
  }, [displayBucketMeta, vehicleMap, vehiclePool]);

  const groupsCount = buckets.length;
  const totalCount = vehiclePool.length || totalItems;
  const sortedBuckets = useMemo(() => {
    const list = [...buckets];
    const parts = sortBy.split("&");
    const field = parts[0]?.split("=")[1];
    const order = parts[1]?.split("=")[1];
    const dir = order === "desc" ? -1 : 1;
    if (field === "recent") {
      return list.sort((a, b) => ((bucketRecentMap.get(a.key) ?? 0) - (bucketRecentMap.get(b.key) ?? 0)) * dir);
    }
    if (field === "price") {
      return list.sort((a, b) => ((a.minPrice ?? 0) - (b.minPrice ?? 0)) * dir);
    }
    if (field === "year") {
      return list.sort((a, b) => ((a.year ?? 0) - (b.year ?? 0)) * dir);
    }
    return list;
  }, [buckets, sortBy, bucketRecentMap]);
  const totalBucketPages = Math.max(1, Math.ceil(groupsCount / bucketPageSize));
  const pagedBuckets = useMemo(() => {
    const start = (bucketPage - 1) * bucketPageSize;
    return sortedBuckets.slice(start, start + bucketPageSize);
  }, [sortedBuckets, bucketPage, bucketPageSize]);

  useEffect(() => {
    setBucketPage(1);
  }, [groupsCount]);

  const activeBucketItems = useMemo(() => {
    if (!openBucketKey) return [];
    return (vehiclePool as Content[]).filter(
      (v) => buildBucketKey(v.inventory as InventoryMaybeExtended) === openBucketKey
    );
  }, [openBucketKey, vehiclePool]);

  const activeBucket = useMemo(() => {
    if (!openBucketKey) return undefined;
    const meta = displayBucketMeta.find((b) => b.bucketKey === openBucketKey);
    const rep =
      (meta?.representativeId && vehicleMap.get(meta.representativeId)) ||
      (activeBucketItems[0] as Content | undefined);
    if (!meta || !rep) return undefined;
    let minMileage: number | undefined;
    let maxMileage: number | undefined;
    for (const item of activeBucketItems) {
      const inv = item.inventory as InventoryMaybeExtended;
      const inventoryData = (item as any)?.inventoryData ?? (inv as any)?.inventoryData;
      const m = parseMileage(getMileage(inv, inventoryData) || "") ?? undefined;
      if (m === undefined) continue;
      minMileage = minMileage === undefined ? m : Math.min(minMileage, m);
      maxMileage = maxMileage === undefined ? m : Math.max(maxMileage, m);
    }
    return {
      key: meta.bucketKey,
      brand: meta.brand,
      model: meta.model,
      variant: meta.variant,
      color: meta.color,
      year: meta.year,
      condition: meta.condition,
      bodyType: meta.bodyType,
      currency: meta.currency,
      count: meta.count,
      representative: rep,
      items: activeBucketItems,
      minPrice: meta.minPrice,
      maxPrice: meta.maxPrice,
      minMileage,
      maxMileage,
    } as Bucket;
  }, [openBucketKey, displayBucketMeta, vehicleMap, activeBucketItems]);

  useEffect(() => {
    if (!openBucketKey) return;
    if (!displayBucketMeta.find((b) => b.bucketKey === openBucketKey)) {
      setOpenBucketKey(null);
    }
  }, [openBucketKey, displayBucketMeta]);
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

  const virtualBuckets = pagedBuckets;

  return (
    <>
      {/* Top text */}
      <div className="flex items-center justify-between gap-4 mb-6 mt-8">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#4d4f53]">
            <span className="font-semibold text-black">Showing {totalCount} vehicles</span>{" "}
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
          <SortedBy count={totalCount} handleSortChange={handleSortChange} sortBy={sortBy} />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {virtualBuckets.map((bucket) => {
          const bucketAddedCount = bucketAddedCountMap.get(bucket.key) ?? 0;
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
      <Pagination
        className="mt-6"
        currentPage={bucketPage}
        totalPages={totalBucketPages}
        onPageChange={setBucketPage}
        pageSize={bucketPageSize}
        totalItems={groupsCount}
        currentCount={pagedBuckets.length}
      />

      {/* Right-side modal (matching card styling inside) */}
      <SlideOver
        isOpen={!!openBucketKey}
        title={
          activeBucket ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="font-semibold text-black truncate">Vehicle Group Details</div>
              <span className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-[10px] font-medium text-gray-700 px-2 py-0.5 whitespace-nowrap">
                {activeBucket.count} unit{activeBucket.count === 1 ? "" : "s"}
              </span>
            </div>
          ) : (
            "Vehicle Group Details"
          )
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
                    <div className="mt-1 text-xs text-gray-500 line-clamp-2" />
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-lg font-semibold flex gap-1 items-center text-gray-900 whitespace-nowrap leading-none">
                      {priceRangeText(activeBucket)} <PriceBadge />
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">Price range</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {activeBucket.bodyType ? <CommonPill label={`Body: ${activeBucket.bodyType}`} /> : null}
                  {activeBucket.variant ? <CommonPill label={`Variant: ${activeBucket.variant}`} /> : null}
                  {activeBucket.color ? <CommonPill label={`Color: ${activeBucket.color}`} /> : null}
                  {activeBucket.condition ? <CommonPill label={`Grade: ${activeBucket.condition}`} /> : null}
                  {activeBucket.year ? <CommonPill label={`Year: ${activeBucket.year}`} /> : null}
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
              <div className="flex flex-nowrap items-center gap-3">
                <div className="ml-auto flex items-center gap-2 justify-end">
                  <div className="w-56">
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
                  <button
                    type="button"
                    onClick={() => {
                      if (!allowQuoteBuilderAction()) return;
                      const allInQuote = activeBucket.items.every((it) =>
                        quoteIdSet.has(normalizeId(it.inventory.id))
                      );
                      if (allInQuote) {
                        activeBucket.items.forEach((it) => removeQuoteLocal(it.inventory.id));
                        return;
                      }
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
                              mileage: getMileage(inv, (it as any)?.inventoryData),
                              brand: inv.brand,
                              model: inv.model,
                              variant: inv.variant,
                              color: inv.color,
                              condition: inv.condition,
                              bodyType: inv.bodyType,
                            },
                          });
                        }
                      });
                    }}
                    className={`h-8 px-3 rounded-md transition-all text-xs font-medium ${
                      activeBucket.items.every((it) => quoteIdSet.has(normalizeId(it.inventory.id)))
                        ? "border border-destructive text-destructive hover:bg-destructive hover:text-white"
                        : "bg-brand-blue text-white hover:opacity-90"
                    }`}
                  >
                    {activeBucket.items.every((it) => quoteIdSet.has(normalizeId(it.inventory.id)))
                      ? "Remove all"
                      : "Add all to Quote Builder"}
                  </button>
                </div>
              </div>

              {sortedBucketItems.map((it) => (
                <UnitCardRow
                  key={it.inventory.id}
                  item={it}
                  isInQuoteBuilder={canUseQuoteBuilder && quoteIdSet.has(normalizeId(it.inventory.id))}
                  canUseQuoteBuilder={canUseQuoteBuilder}
                  onAddToQuote={(payload) => {
                    if (!allowQuoteBuilderAction()) return;
                    addQuoteLocal(payload);
                  }}
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
