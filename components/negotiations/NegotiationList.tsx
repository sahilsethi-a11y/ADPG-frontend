"use client";

import { useEffect, useState } from "react";
import { AlertCircleIcon, CheckCircleIcon, ClockIcon, MessageSquareIcon, SearchIcon, UserIcon } from "@/components/Icons";
import Input from "@/elements/Input";
import Button from "@/elements/Button";
import Image from "@/elements/Image";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";
import { api } from "@/lib/api/client-request";
import PriceBadge from "@/elements/PriceBadge";
import { formatPrice } from "@/lib/utils";

export type Content = {
    conversationId: string;
    userId: string;
    peerId: string;
    itemId: number;
    updatedAt: string;
    roleType: string;
    name: string;
    buyerName?: string;
    sellerName?: string;
    lastActivity: string;
    status: string;
    startedAt: string;
    message: string;
    agreedPrice?: string;
    vehicle: {
        id: string;
        brand: string;
        model: string;
        variant: string;
        year: number;
        price: number;
        currency: string;
        allowPriceNegotiations: true;
        mainImageUrl: string;
        createTime: string;
        imageUrls: string[];
    };
};

export type Negotiation = {
    content: Content[];
    currentPage: number;
    first: boolean;
    last: boolean;
    size: number;
    totalItems: number;
    totalPages: number;
};

type PropsT = {
    data: Negotiation;
    userId: string;
    roleType?: string;
};

const filters = [
    {
        label: "All",
        value: "",
    },
    {
        label: "Ongoing",
        value: "ongoing",
    },
    {
        label: "Agreed",
        value: "agreed",
    },
    {
        label: "OTP Pending",
        value: "otpPending",
    },
];

export default function NegotiationList({ data: initialData, userId, roleType }: Readonly<PropsT>) {
    const [data, setData] = useState<Negotiation>(initialData);
    const [extraNegotiations, setExtraNegotiations] = useState<Content[]>([]);
    const [proposalStatusMap, setProposalStatusMap] = useState<Record<string, string>>({});
    const [proposalMap, setProposalMap] = useState<Record<string, any>>({});
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [hasLoadedPrimary, setHasLoadedPrimary] = useState(false);
    const [hasLoadedFallback, setHasLoadedFallback] = useState(false);

    const [query, setQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState(filters[0].value);
    const router = useRouter();

    useEffect(() => {
        const items =
            data?.content?.map((i) => {
                const role = i.roleType?.toLowerCase();
                const buyerId = role === "buyer" ? i.peerId : i.userId;
                const sellerId = role === "buyer" ? i.userId : i.peerId;
                return {
                    conversationId: i.conversationId,
                    buyerId,
                    sellerId,
                    userId: i.userId,
                    peerId: i.peerId,
                    roleType: i.roleType,
                    itemId: i.itemId,
                };
            }) ?? [];

        if (!items.length) return;

        fetch("/api/negotiation-index", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items }),
        }).catch(() => {});
    }, [data]);

    const applyFilter = async (page = initialData.currentPage, size = initialData.size) => {
        try {
            const params = {
                userId,
                status: activeFilter,
                query,
                page,
                size,
            };

            const res = await api.get<{ data: Negotiation }>("/chat/api/negotiations", { params });
            const payload = res?.data;
            setData(payload);
        } catch (err) {
            console.log("Failed to fetch more negotiations", err);
        }
    };

    useEffect(() => {
        const interval = window.setInterval(() => {
            applyFilter();
        }, 5000);
        return () => window.clearInterval(interval);
    }, [activeFilter, query, initialData.currentPage, initialData.size]);

    useEffect(() => {
        let isActive = true;
        const loadPrimary = async () => {
            try {
                await applyFilter(initialData.currentPage, initialData.size);
            } finally {
                if (isActive) setHasLoadedPrimary(true);
            }
        };
        loadPrimary();
        return () => {
            isActive = false;
        };
    }, []);

    useEffect(() => {
        const role = roleType?.toLowerCase() === "buyer" ? "buyer" : "seller";
        const loadFallback = async () => {
            try {
                const res = await fetch(`/api/negotiation-index?userId=${encodeURIComponent(userId)}&role=${role}`, {
                    cache: "no-store",
                });
                if (!res.ok) return;
                const payload = await res.json();
                const list = (payload?.items as any[]) ?? [];
                const existingIds = new Set((data?.content ?? []).map((i) => i.conversationId));

                const fallback = await Promise.all(
                    list
                        .filter((i) => i?.conversationId && !existingIds.has(i.conversationId))
                        .map(async (i) => {
                            let vehicle: Content["vehicle"] | undefined;
                            try {
                                const v = await api.get<{ data: any }>("/inventory/api/v1/inventory/getInventoryDetails", {
                                    params: { id: i.itemId },
                                });
                                const d = v.data;
                                vehicle = {
                                    id: d.id,
                                    brand: d.brand,
                                    model: d.model,
                                    variant: d.variant,
                                    year: Number(d.year) || 0,
                                    price: Number(d.price) || 0,
                                    currency: d.currency,
                                    allowPriceNegotiations: true,
                                    mainImageUrl: d.imageUrls?.[0] || d.mainImageUrl || "",
                                    createTime: "",
                                    imageUrls: d.imageUrls || [],
                                };
                            } catch {}

                            return {
                                conversationId: i.conversationId,
                                userId: i.userId || userId,
                                peerId: i.peerId || "",
                                itemId: i.itemId,
                                updatedAt: i.updatedAt || "",
                                roleType: role === "seller" ? "buyer" : "seller",
                                name: role === "seller" ? "Buyer" : "Seller",
                                lastActivity: "Just now",
                                status: i.status || "ongoing",
                                startedAt: i.startedAt || "",
                                message: i.message || "New negotiation started",
                                agreedPrice: i.agreedPrice,
                                buyerName: i.buyerName,
                                sellerName: i.sellerName,
                                vehicle: vehicle as any,
                            } as Content;
                        })
                );

                setExtraNegotiations(fallback.filter((i) => i?.vehicle));
            } catch {}
            setHasLoadedFallback(true);
        };
        loadFallback();
    }, [data, roleType, userId]);

    useEffect(() => {
        if (hasLoadedPrimary && hasLoadedFallback) setIsInitialLoading(false);
    }, [hasLoadedPrimary, hasLoadedFallback]);

    useEffect(() => {
        const ids = [...new Set([...extraNegotiations, ...(data?.content ?? [])].map((i) => i.conversationId).filter(Boolean))];
        if (!ids.length) {
            setProposalStatusMap({});
            setProposalMap({});
            return;
        }
        const fetchStatuses = async () => {
            try {
                const res = await fetch(`/api/negotiation-proposals?ids=${ids.join(",")}`, { cache: "no-store" });
                if (!res.ok) return;
                const payload = await res.json();
                const proposals = payload?.proposals ?? {};
                const next: Record<string, string> = {};
                for (const [key, value] of Object.entries(proposals)) {
                    const status = (value as any)?.status;
                    if (status) next[key] = String(status);
                }
                setProposalStatusMap(next);
                setProposalMap(proposals);
            } catch {}
        };
        fetchStatuses();
    }, [data, extraNegotiations]);

    const navigateToDetail = (i: Content) => {
        const url = "/vehicles/" + i.itemId;
        router.push(url);
    };

    const navigateToConversation = (i: Content) => {
        router.push("/my-negotiations/" + i.conversationId);
    };

    return (
        <div>
            <div className="flex gap-4 p-4 rounded-xl border flex-wrap border-stroke-light mb-6">
                <div className="relative grow">
                    <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input type="text" className="pl-10 py-1.5" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by vehicle or buyer name..." />
                </div>
                <div className="flex gap-2">
                    {filters.map((i) => (
                        <Button onClick={() => setActiveFilter(i.value)} size="sm" variant={activeFilter === i.value ? "primary" : "outline"} key={i.label}>
                            {i.label}
                        </Button>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-6">
                {[
                    ...new Map(
                        [...extraNegotiations, ...(data?.content ?? [])].map((i) => [i.conversationId, i])
                    ).values(),
                ]
                    .sort((a, b) => {
                        const at = new Date((a.startedAt || a.updatedAt) ?? 0).getTime();
                        const bt = new Date((b.startedAt || b.updatedAt) ?? 0).getTime();
                        return bt - at;
                    })
                    .map((i) => {
                        const altText = [i.vehicle.year, i.vehicle.brand, i.vehicle.model, i.vehicle.variant]
                            .filter(Boolean)
                            .join(" ")
                            .trim() || "Vehicle image";
                        const currentRole = i.roleType?.toLowerCase();
                        const normalizedName = (i.name || "").trim();
                        const isGenericName = normalizedName.toLowerCase() === "buyer" || normalizedName.toLowerCase() === "seller";
                        const peerName = !isGenericName && normalizedName ? normalizedName : undefined;
                        const buyerLabel = i.buyerName || (currentRole === "seller" ? peerName : undefined) || "Buyer";
                        const sellerLabel = i.sellerName || (currentRole === "buyer" ? peerName : undefined) || "Seller";
                        return (
                    <div
                        key={i.conversationId}
                        className="grid grid-cols-[80px_1fr] md:grid-cols-[80px_1fr_250px] gap-2 md:gap-4 rounded-xl p-4 border-stroke-light border hover:shadow-md transition-shadow">
                        <div className="w-20 h-16 relative">
                            <Image
                                src={i.vehicle.mainImageUrl || i.vehicle.imageUrls?.[0]}
                                alt={altText}
                                fill
                                height={70}
                                width={56}
                                className="rounded-lg"
                            />
                        </div>
                        <div>
                            <h3 className="text-lg text-brand-blue truncate">
                                {i.vehicle.brand} {i.vehicle.model} {i.vehicle.variant}
                            </h3>
                            <div className="flex flex-col items-center gap-2 text-sm text-gray-600 mb-1 md:flex-row">
                                <span className="flex items-center gap-1">
                                    <UserIcon className="h-3 w-3" />
                                    Buyer: {buyerLabel}
                                </span>
                                <span className="flex items-center gap-1">
                                    <UserIcon className="h-3 w-3" />
                                    Seller: {sellerLabel}
                                </span>
                                <span className="flex items-center gap-1">
                                    <ClockIcon className="h-3 w-3" />
                                    {formatTimeAgo(i.startedAt || i.updatedAt)}
                                </span>
                            </div>
                            {i.message && <p className="text-gray-700 text-sm mb-3">{i.message}</p>}
                            {proposalMap[i.conversationId]?.bucketSummaries?.length ? (
                                <div className="mb-3 text-sm text-gray-700">
                                    <div className="font-medium">
                                        {proposalMap[i.conversationId].bucketSummaries.length} buckets •{" "}
                                        {proposalMap[i.conversationId].bucketSummaries.reduce(
                                            (acc: number, b: any) => acc + (b.totalUnits || 0),
                                            0
                                        )}{" "}
                                        cars
                                    </div>
                                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-600">
                                        {proposalMap[i.conversationId].bucketSummaries.map((b: any, idx: number) => (
                                            <span key={`${i.conversationId}-${idx}`} className="px-2 py-0.5 rounded-full border border-stroke-light">
                                                {[b.year, b.color, b.variant, b.condition, b.bodyType].filter(Boolean).join(" • ")}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                            <div className="flex flex-col md:flex-row gap-2 mb-2">
                                <div className="text-gray-600">
                                    Listed: {formatPrice(i.vehicle.price, i.vehicle.currency)} <PriceBadge />
                                </div>
                                {i.agreedPrice && (
                                    <div className="text-green-600">
                                        Agreed: {formatPrice(i.agreedPrice, i.vehicle.currency)} <PriceBadge />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2 justify-between md:flex-col md:items-end">
                            <StatusBadge status={i.status} proposalStatus={proposalStatusMap[i.conversationId]} />
                            <div className="flex gap-2">
                                <Button onClick={() => navigateToConversation(i)} size="sm">
                                    Continue Chat
                                </Button>
                            </div>
                        </div>
                    </div>
                );
                })}
            </div>
            {isInitialLoading ? (
                <div className="fixed inset-0 z-30 flex items-center justify-center bg-white/70">
                    <div className="flex items-center gap-3 rounded-lg border border-stroke-light bg-white px-4 py-3 shadow-sm text-sm text-gray-700">
                        <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />
                        Loading negotiations...
                    </div>
                </div>
            ) : null}
            <Pagination
                className="mt-8"
                currentPage={data.currentPage}
                totalPages={data.totalPages}
                onPageChange={(p) => {
                    applyFilter(p, data.size);
                }}
                pageSize={data.size}
                pageSizeOptions={[10, 25, 50, 100]}
                onPageSizeChange={(s) => {
                    applyFilter(initialData.currentPage, s);
                }}
                showQuickJump
                totalItems={data.totalItems}
                currentCount={data.content?.length ?? 0}
            />
            <div className="border-stroke-light flex flex-col gap-6 p-6 rounded-xl border mt-8">
                <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5">
                    <h4 className="leading-none text-brand-blue">Summary</h4>
                </div>
                <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-2xl text-brand-blue">0</div>
                            <div className="text-sm text-gray-600">Ongoing</div>
                        </div>
                        <div>
                            <div className="text-2xl text-green-600">0</div>
                            <div className="text-sm text-gray-600">Agreed</div>
                        </div>
                        <div>
                            <div className="text-2xl text-yellow-600">0</div>
                            <div className="text-sm text-gray-600">OTP Pending</div>
                        </div>
                        <div>
                            <div className="text-2xl text-red-600">0</div>
                            <div className="text-sm text-gray-600">Expired</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const StatusBadge = ({ status, proposalStatus }: Readonly<{ status: string; proposalStatus?: string }>) => {
    if (proposalStatus === "seller_accepted")
        return (
            <div className="flex gap-2 items-center">
                <span className="text-xs py-1 px-2.5 rounded-full bg-green-100 text-green-700 font-medium">Accepted</span>
            </div>
        );
    if (proposalStatus === "seller_countered")
        return (
            <div className="flex gap-2 items-center">
                <span className="text-xs py-1 px-2.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">Seller Countered</span>
            </div>
        );
    if (proposalStatus === "buyer_countered")
        return (
            <div className="flex gap-2 items-center">
                <span className="text-xs py-1 px-2.5 rounded-full bg-blue-100 text-blue-700 font-medium">Buyer Countered</span>
            </div>
        );
    if (proposalStatus === "buyer_proposed")
        return (
            <div className="flex gap-2 items-center">
                <span className="text-xs py-1 px-2.5 rounded-full bg-blue-100 text-blue-700 font-medium">Buyer Proposed</span>
            </div>
        );
    if (status?.toLocaleLowerCase() === "ongoing")
        return (
            <div className="flex gap-2 items-center text-blue-800">
                <MessageSquareIcon />
                <div className="text-xs py-0.5 px-2 rounded-md bg-blue-100">Ongoing</div>
            </div>
        );

    if (status?.toLocaleLowerCase() === "otpPending")
        return (
            <div className="flex gap-2 items-center text-yellow-600">
                <AlertCircleIcon className="h-4 w-4" />
                <div className="text-xs py-0.5 px-2 rounded-md bg-yellow-100">OTP Pending</div>
            </div>
        );
    if (status?.toLocaleLowerCase() === "agreed")
        return (
            <div className="flex gap-2 items-center text-green-800">
                <CheckCircleIcon className="h-4 w-4" />
                <div className="text-xs py-0.5 px-2 rounded-md bg-green-100">Agreed</div>
            </div>
        );

    return <></>;
};

const formatTimeAgo = (value?: string) => {
    if (!value) return "Just now";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Just now";
    const diff = Date.now() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};
