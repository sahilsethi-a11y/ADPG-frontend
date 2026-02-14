"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import NegotiationItemsSection from "./NegotiationItemsSection";
import NegotiationQuotePanelLocal, { PORT_OPTIONS } from "./NegotiationQuotePanelLocal";
import Conversation, { NegotiationInfo, type Message } from "./Conversation";
import YourProposalSummary from "./YourProposalSummary";
import Button from "@/elements/Button";
import Modal from "@/elements/Modal";
import { formatPrice } from "@/lib/utils";
import Image from "@/elements/Image";
import { api } from "@/lib/api/client-request";
import { useRouter } from "next/navigation";
import message from "@/elements/message";

type Props = {
    negotiationStatus?: string;
    negotiationInfo?: NegotiationInfo;
    initialChats?: Message[];
    currency?: string;
    sellerName?: string;
    sellerId?: string;
    userId: string;
    role?: string;
    conversationId: string;
    vehicleId?: string;
    enableRoleToggle?: boolean;
};

// Type for submitted proposal
type ActiveProposal = {
    discountPercent: number;
    discountAmount: number;
    finalPrice: number;
    downpaymentPercent: number;
    downpaymentAmount: number;
    remainingBalance: number;
    selectedPort: string;
    submittedAt: string;
    bucketName: string;
    bucketTotal: number;
    bucketSummaries: Array<{
        key: string;
        name: string;
        total: number;
        discountPercent: number;
        totalUnits: number;
        unitPrice: number;
        currency: string;
        brand?: string;
        model?: string;
        variant?: string;
        color?: string;
        year?: number;
        condition?: string;
        bodyType?: string;
        mainImageUrl?: string;
    }>;
    status: "buyer_proposed" | "seller_countered" | "buyer_countered" | "seller_accepted";
};

/**
 * Client wrapper that manages shared pricing state for negotiation
 * Handles both "Make a Proposal" and post-submission "Your Proposal" states
 */
export default function NegotiationClientWrapper({
    negotiationStatus,
    negotiationInfo,
    initialChats,
    currency,
    sellerName,
    sellerId,
    userId,
    role,
    conversationId,
    vehicleId,
    enableRoleToggle,
}: Props) {
    const router = useRouter();
    // ==========================================
    // Shared State Management (PAGE LEVEL)
    // ==========================================
    const [bucketDiscounts, setBucketDiscounts] = useState<Record<string, number>>({});
    const [downpaymentPercent, setDownpaymentPercent] = useState(10);
    const [selectedPort, setSelectedPort] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    // Post-submission state
    const [uiStatus, setUiStatus] = useState<"IDLE" | "BUYER_PROPOSED">("IDLE");
    const [activeProposal, setActiveProposal] = useState<ActiveProposal | null>(null);
    const [isCountering, setIsCountering] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);
    const [cartLoading, setCartLoading] = useState(false);
    const [cartError, setCartError] = useState<string | null>(null);
    const [logisticsPartner, setLogisticsPartner] = useState<"UGR" | "None">("UGR");
    const [destinationPort, setDestinationPort] = useState<"Jabel Ali" | "Khalifa Port">("Jabel Ali");
    const [vehicleMeta, setVehicleMeta] = useState<{ name: string; image?: string; year?: number } | null>(null);

    // ==========================================
    // Submit Proposal Handler
    // ==========================================
    const [demoRole, setDemoRole] = useState<string | undefined>(role);
    const [isRoleToggleEnabled, setIsRoleToggleEnabled] = useState(false);
    const effectiveRole = enableRoleToggle && isRoleToggleEnabled ? demoRole : role;
    const normalizedRole = effectiveRole?.toLowerCase();
    const isBuyer = normalizedRole === "buyer";
    const isSeller = normalizedRole === "seller" || normalizedRole === "dealer";
    const canEditDiscounts = isBuyer || isCountering;

    const setStateFromProposal = useCallback((proposal: ActiveProposal) => {
        const nextDiscounts: Record<string, number> = {};
        for (const bucket of proposal.bucketSummaries ?? []) {
            nextDiscounts[bucket.key] = bucket.discountPercent ?? 0;
        }
        if (Object.keys(nextDiscounts).length > 0) setBucketDiscounts(nextDiscounts);
        if (proposal.downpaymentPercent) setDownpaymentPercent(proposal.downpaymentPercent);
        if (proposal.selectedPort) setSelectedPort(proposal.selectedPort);
    }, []);

    const saveProposal = useCallback(
        async (proposal: ActiveProposal) => {
            try {
                const res = await fetch("/api/negotiation-proposals", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        conversationId,
                        proposal,
                    }),
                });
                if (res.ok) return { ok: true as const };
                const text = await res.text();
                return { ok: false as const, error: text || res.statusText };
            } catch (err) {
                return { ok: false as const, error: (err as Error).message || "Network error" };
            }
        },
        [conversationId]
    );

    const handleSubmitProposal = useCallback(
        async (proposalData: {
            discountPercent: number;
            discountAmount: number;
            finalPrice: number;
            downpaymentPercent: number;
            downpaymentAmount: number;
            remainingBalance: number;
            bucketTotal: number;
            bucketName: string;
            bucketSummaries: Array<{
                key: string;
                name: string;
                total: number;
                discountPercent: number;
                totalUnits: number;
                unitPrice: number;
                currency: string;
                brand?: string;
                model?: string;
                variant?: string;
                color?: string;
                year?: number;
                condition?: string;
                bodyType?: string;
                mainImageUrl?: string;
            }>;
        }) => {
            setIsSubmitting(true);

            try {
                const status: ActiveProposal["status"] =
                    isBuyer && activeProposal?.status === "seller_countered"
                        ? "buyer_countered"
                        : isBuyer
                          ? "buyer_proposed"
                          : "seller_countered";
                const proposal: ActiveProposal = {
                    discountPercent: proposalData.discountPercent,
                    discountAmount: proposalData.discountAmount,
                    finalPrice: proposalData.finalPrice,
                    downpaymentPercent: proposalData.downpaymentPercent,
                    downpaymentAmount: proposalData.downpaymentAmount,
                    remainingBalance: proposalData.remainingBalance,
                    selectedPort,
                    submittedAt: new Date().toISOString(),
                    bucketName: proposalData.bucketName,
                    bucketTotal: proposalData.bucketTotal,
                    bucketSummaries: proposalData.bucketSummaries,
                    status,
                };

                fetch("/api/negotiation-index", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        item: {
                            conversationId,
                            buyerId: isBuyer ? userId : sellerId,
                            sellerId: isBuyer ? sellerId : userId,
                            itemId: vehicleId,
                            roleType: isBuyer ? "buyer" : "seller",
                            status: "ongoing",
                        },
                    }),
                }).catch(() => {});

                const result = await saveProposal(proposal);
                if (!result.ok) {
                    console.error("Failed to submit negotiation proposal", {
                        conversationId,
                        status,
                        error: result.error,
                    });
                    message.error("Proposal submission failed. Please try again.");
                    setSubmissionError(`Failed to submit proposal. ${result.error || "Please try again."}`);
                    setUiStatus("IDLE");
                    setActiveProposal(null);
                    setIsSubmitting(false);
                    return;
                }

                setUiStatus("BUYER_PROPOSED");
                setActiveProposal(proposal);
                setIsCountering(false);

                window.dispatchEvent(
                    new CustomEvent("proposalSubmitted", {
                        detail: {
                            discountPercent: proposalData.discountPercent,
                            finalPrice: proposalData.finalPrice,
                            downpaymentPercent: proposalData.downpaymentPercent,
                        },
                    })
                );

                setSubmissionError(null);
                setIsSubmitting(false);
            } catch (err) {
                console.error("Proposal submission error", { conversationId, error: err });
                message.error("Proposal submission failed. Please try again.");
                setSubmissionError("Network error. Please try again.");
                setUiStatus("IDLE");
                setActiveProposal(null);
                setIsSubmitting(false);
            }
        },
        [activeProposal, isBuyer, saveProposal, selectedPort, effectiveRole, sellerId, userId, vehicleId]
    );

    useEffect(() => {
        let isActive = true;
        const loadProposal = async () => {
            try {
                const res = await fetch(
                    `/api/negotiation-proposals?conversationId=${encodeURIComponent(conversationId)}`,
                    { cache: "no-store" }
                );
                if (!res.ok) return;
                const data = await res.json();
                if (!isActive) return;
                if (data?.proposal) {
                    setActiveProposal(data.proposal as ActiveProposal);
                    setUiStatus("BUYER_PROPOSED");
                    // Avoid overwriting local edits while countering
                    if (!isCountering) {
                        setStateFromProposal(data.proposal as ActiveProposal);
                    }
                }
            } catch {}
        };
        loadProposal();
        const interval = window.setInterval(loadProposal, 5000);
        return () => {
            isActive = false;
            window.clearInterval(interval);
        };
    }, [conversationId, isCountering, setStateFromProposal]);

    useEffect(() => {
        if (!selectedPort) {
            setSelectedPort(PORT_OPTIONS[0]);
        }
    }, [selectedPort]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!isSeller || !activeProposal || !conversationId) return;
        if (!activeProposal.bucketSummaries || activeProposal.bucketSummaries.length === 0) return;
        try {
            const items = activeProposal.bucketSummaries.map((b) => {
                const totalUnits = Number(b.totalUnits) || 0;
                const bucketTotal = Number(b.total) || 0;
                const unitPrice = totalUnits > 0 ? bucketTotal / totalUnits : Number(b.unitPrice) || 0;
                return ({
                id: `${conversationId}_${b.key}`,
                name: b.name,
                year: b.year ?? 0,
                location: "",
                quantity: totalUnits,
                price: unitPrice,
                currency: b.currency,
                mainImageUrl: b.mainImageUrl || "",
                sellerCompany: sellerName || "Seller",
                sellerId: sellerId,
                bucketKey: b.key,
                isSelected: true,
                brand: b.brand,
                model: b.model,
                variant: b.variant,
                color: b.color,
                condition: b.condition,
                bodyType: b.bodyType,
            });
            });
            const scopedKey = `negotiationItems_${conversationId}`;
            window.localStorage.setItem(scopedKey, JSON.stringify(items));
            window.dispatchEvent(new Event("quoteBuilderUpdated"));
        } catch {}
    }, [activeProposal, conversationId, isSeller, sellerId, sellerName]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!isBuyer || !sellerId) return;
        try {
            const raw = window.localStorage.getItem("quoteBuilderItems");
            const parsed = raw ? (JSON.parse(raw) as Array<{ sellerId?: string; sellerCompany?: string }>) : [];
            const scopedKey = `negotiationItems_${conversationId}`;
            const scoped = parsed.filter((i) => i?.sellerId === sellerId || i?.sellerCompany === sellerName);
            if (scoped.length > 0) {
                window.localStorage.setItem(scopedKey, JSON.stringify(scoped));
            }
            const next = parsed.filter((i) => i?.sellerId !== sellerId && i?.sellerCompany !== sellerName);
            if (next.length !== parsed.length) {
                window.localStorage.setItem("quoteBuilderItems", JSON.stringify(next));
                window.localStorage.setItem("quoteBuilderIds", JSON.stringify(next.map((i: any) => i?.id).filter(Boolean)));
                const sellerByVehicle: Record<string, string> = {};
                const sellerByCompany: Record<string, string> = {};
                const vehicleByCompany: Record<string, string> = {};
                for (const item of next as any[]) {
                    if (item?.id && item?.sellerId) sellerByVehicle[item.id] = item.sellerId;
                    if (item?.sellerCompany && item?.sellerId) sellerByCompany[item.sellerCompany] = item.sellerId;
                    if (item?.sellerCompany && item?.id) vehicleByCompany[item.sellerCompany] = item.id;
                }
                window.localStorage.setItem("quoteBuilderSellerByVehicle", JSON.stringify(sellerByVehicle));
                window.localStorage.setItem("quoteBuilderSellerByCompany", JSON.stringify(sellerByCompany));
                window.localStorage.setItem("quoteBuilderVehicleByCompany", JSON.stringify(vehicleByCompany));
                window.dispatchEvent(new Event("quoteBuilderUpdated"));
            }
        } catch {}
    }, [isBuyer, sellerId, sellerName]);

    useEffect(() => {
        if (!showCartModal || !vehicleId) return;
        let isActive = true;
        const loadVehicle = async () => {
            try {
                const res = await api.get<{ data: any }>("/inventory/api/v1/inventory/getInventoryDetails", {
                    params: { id: vehicleId },
                });
                const d = res.data;
                if (!isActive) return;
                setVehicleMeta({
                    name: d?.name || `${d?.brand ?? ""} ${d?.model ?? ""}`.trim(),
                    image: d?.imageUrls?.[0] || d?.mainImageUrl,
                    year: d?.year ? Number(d.year) : undefined,
                });
            } catch {
                if (!isActive) return;
                setVehicleMeta(null);
            }
        };
        loadVehicle();
        return () => {
            isActive = false;
        };
    }, [showCartModal, vehicleId]);

    // ==========================================
    // Derived Values
    // ==========================================
    const handleBucketDiscountChange = useCallback((bucketKey: string, value: number) => {
        setBucketDiscounts((prev) => ({ ...prev, [bucketKey]: value }));
    }, []);

    // Determine if UI should show locked/disabled state
    const isProposalSubmitted = Boolean(activeProposal) && !isCountering;

    const canAccept = useMemo(() => {
        if (!activeProposal) return false;
        if (isSeller && (activeProposal.status === "buyer_proposed" || activeProposal.status === "buyer_countered")) return true;
        if (isBuyer && activeProposal.status === "seller_countered") return true;
        return false;
    }, [activeProposal, isBuyer, isSeller]);

    const acceptProposal = useCallback(async () => {
        if (!activeProposal) return;
        const next: ActiveProposal = {
            ...activeProposal,
            status: "seller_accepted",
            submittedAt: new Date().toISOString(),
        };
        const ok = await saveProposal(next);
        if (ok) {
            setActiveProposal(next);
            setUiStatus("BUYER_PROPOSED");
            setIsCountering(false);
        }
    }, [activeProposal, saveProposal]);

    const addNegotiationToCart = useCallback(async () => {
        if (!activeProposal || !vehicleId) return;
        setCartLoading(true);
        setCartError(null);
        try {
            const items = activeProposal.bucketSummaries.map((b) => {
                const discountedTotal = b.total * (1 - b.discountPercent / 100);
                return {
                    bucketKey: b.key,
                    name: b.name,
                    totalUnits: b.totalUnits,
                    unitPrice: b.unitPrice,
                    currency: b.currency,
                    discountPercent: b.discountPercent,
                    total: discountedTotal,
                    mainImageUrl: b.mainImageUrl,
                    brand: b.brand,
                    model: b.model,
                    variant: b.variant,
                    color: b.color,
                    year: b.year,
                    condition: b.condition,
                    bodyType: b.bodyType,
                };
            });

            const res = await fetch("/api/negotiation-cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversationId,
                    buyerId: userId,
                    sellerId,
                    sellerCompany: sellerName,
                    vehicleId,
                    logisticsPartner,
                    items,
                    totals: {
                        total: activeProposal.finalPrice,
                        downpayment: activeProposal.downpaymentAmount,
                        pending: activeProposal.remainingBalance,
                    },
                    selectedPort: activeProposal.selectedPort,
                    destinationPort: logisticsPartner === "UGR" ? destinationPort : undefined,
                }),
            });

            if (!res.ok) {
                setCartError("Failed to add to cart. Please try again.");
                setCartLoading(false);
                return;
            }
            setShowCartModal(false);
            setCartLoading(false);
            router.push("/my-cart");
        } catch {
            setCartError("Failed to add to cart. Please try again.");
            setCartLoading(false);
        }
    }, [activeProposal, conversationId, logisticsPartner, router, sellerId, userId, vehicleId]);

    return (
        <>
            {/* Left Column: Negotiation Items and Conversation */}
            <div className="lg:col-span-2 space-y-6 flex flex-col">
                {/* Negotiation Items Section - shows locked state if proposal submitted */}
                <NegotiationItemsSection
                    sellerName={sellerName}
                    sellerId={sellerId}
                    isBuyer={isBuyer}
                    canEditDiscounts={canEditDiscounts}
                    bucketDiscounts={bucketDiscounts}
                    onBucketDiscountChange={handleBucketDiscountChange}
                    isLocked={isProposalSubmitted}
                    conversationId={conversationId}
                />

                {/* Conversation */}
                <div className="flex-1">
                    <Conversation
                        negotiationInfo={negotiationInfo || {
                            started: "",
                            lastActivity: "",
                            status: negotiationStatus || "",
                            agreedPrice: "",
                            agreedPriceLocked: false,
                            userPrice: "",
                            userPriceLocked: false,
                            roleType: effectiveRole || "",
                        }}
                        initialChats={initialChats ?? []}
                        userId={userId}
                        role={effectiveRole || ""}
                        conversationId={conversationId}
                        currency={currency || "USD"}
                        sellerName={sellerName}
                        sellerId={sellerId}
                    />
                </div>
            </div>

            {/* Right Column: Status Card and Make a Proposal / Your Proposal Summary */}
            <div className="space-y-6 h-fit lg:sticky lg:top-8">
                {/* Status Card - Shows current negotiation status */}
                {enableRoleToggle && isRoleToggleEnabled ? (
                    <div className="flex items-center justify-end mb-3">
                        <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                            <span>View as</span>
                            <div className="inline-flex rounded-md border border-stroke-light bg-white p-0.5">
                                <button
                                    type="button"
                                    onClick={() => setDemoRole("buyer")}
                                    className={`px-2.5 py-1 text-xs font-medium rounded ${
                                        demoRole?.toLowerCase() === "buyer" ? "bg-brand-blue text-white" : "text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    Buyer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDemoRole("seller")}
                                    className={`px-2.5 py-1 text-xs font-medium rounded ${
                                        demoRole?.toLowerCase() === "seller" ? "bg-brand-blue text-white" : "text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    Seller
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}
                <div className="border border-stroke-light rounded-lg p-5 bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900">Status</h3>
                        <StatusBadge status={negotiationStatus || ""} proposalStatus={activeProposal?.status} />
                    </div>
                    <p className="text-sm text-gray-600">
                        {getStatusMessage(negotiationStatus, activeProposal?.status, isBuyer, isSeller)}
                    </p>
                    {activeProposal ? (
                        <div className="mt-4 flex gap-2">
                            {canAccept ? (
                                <Button size="sm" onClick={acceptProposal}>
                                    Accept
                                </Button>
                            ) : null}
                            {activeProposal.status !== "seller_accepted" ? (
                                <Button size="sm" variant="outline" onClick={() => setIsCountering(true)}>
                                    Counter offer
                                </Button>
                            ) : null}
                        </div>
                    ) : null}
                </div>

                {/* Show appropriate panel based on submission status */}
                {!activeProposal || isCountering ? (
                    <NegotiationQuotePanelLocal
                        sellerName={sellerName}
                        sellerId={sellerId}
                        negotiationStatus={negotiationStatus}
                        bucketDiscounts={bucketDiscounts}
                        downpaymentPercent={downpaymentPercent}
                        onDownpaymentChange={setDownpaymentPercent}
                        selectedPort={selectedPort}
                        onPortChange={setSelectedPort}
                        onSubmit={handleSubmitProposal}
                        isSubmitting={isSubmitting}
                        submissionError={submissionError}
                        conversationId={conversationId}
                        onFinalPriceDoubleTap={() => setIsRoleToggleEnabled((prev) => !prev)}
                    />
                ) : activeProposal ? (
                    <>
                        <YourProposalSummary
                            proposal={activeProposal}
                            currency={currency || "USD"}
                            role={isBuyer ? "buyer" : isSeller ? "seller" : undefined}
                            onFinalPriceDoubleTap={() => setIsRoleToggleEnabled((prev) => !prev)}
                        />
                        {activeProposal.status === "seller_accepted" && isBuyer && vehicleId ? (
                            <div className="mt-4">
                                <Button onClick={() => setShowCartModal(true)} className="w-full">
                                    Add to cart
                                </Button>
                            </div>
                        ) : null}
                    </>
                ) : null}
            </div>

            <Modal isOpen={showCartModal} onClose={() => setShowCartModal(false)} showCloseButton>
                <div className="w-full min-w-[320px] max-w-2xl">
                    <div className="border-b border-stroke-light pb-4 mb-4">
                        <h3 className="text-2xl text-brand-blue">Confirm Negotiated Cart</h3>
                        <p className="text-sm text-gray-600">Review buckets, logistics, and payment summary.</p>
                    </div>
                    {activeProposal ? (
                        <div className="space-y-5">
                            <div className="flex items-center gap-3 border border-stroke-light rounded-lg p-3 bg-white">
                                <div className="relative h-14 w-20 bg-gray-100 rounded overflow-hidden shrink-0">
                                    {vehicleMeta?.image ? (
                                        <Image
                                            src={vehicleMeta.image}
                                            alt={vehicleMeta.name || "Vehicle"}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : null}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-gray-900 truncate">
                                        {vehicleMeta?.year ? `${vehicleMeta.year} ` : ""}
                                        {vehicleMeta?.name || "Vehicle"}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Seller: <span className="font-medium">{sellerName || "Seller"}</span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Buyer: <span className="font-medium">You</span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Port of Loading: <span className="font-medium">{activeProposal.selectedPort}</span>
                                    </div>
                                    {logisticsPartner === "UGR" ? (
                                        <div className="text-xs text-gray-500">
                                            Destination: <span className="font-medium">{destinationPort}</span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm font-semibold text-gray-900">Buckets</div>
                                {activeProposal.bucketSummaries.map((b) => {
                                    const discountedTotal = b.total * (1 - b.discountPercent / 100);
                                    return (
                                        <div key={b.key} className="flex items-center justify-between text-sm border border-stroke-light rounded-lg p-3 bg-white">
                                            <div className="min-w-0">
                                                <div className="font-medium text-gray-900 truncate">{b.name}</div>
                                                <div className="text-xs text-gray-500">Qty: {b.totalUnits}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold">{formatPrice(discountedTotal, b.currency)}</div>
                                                {b.discountPercent > 0 ? (
                                                    <div className="text-[11px] text-gray-400 line-through">
                                                        {formatPrice(b.total, b.currency)}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="border border-stroke-light rounded-lg p-3 space-y-2 text-sm bg-gray-50/60">
                                    <div className="flex justify-between">
                                        <span>Total</span>
                                        <span className="font-semibold">
                                            {formatPrice(activeProposal.finalPrice, currency || "USD")}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Down payment</span>
                                        <span className="font-semibold">
                                            {formatPrice(activeProposal.downpaymentAmount, currency || "USD")}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Pending price</span>
                                        <span className="font-semibold">
                                            {formatPrice(activeProposal.remainingBalance, currency || "USD")}
                                        </span>
                                    </div>
                                </div>

                                <div className="border border-stroke-light rounded-lg p-3 space-y-3 bg-white">
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 block mb-2">Logistics Partner</label>
                                        <select
                                            value={logisticsPartner}
                                            onChange={(e) => setLogisticsPartner(e.target.value as "UGR" | "None")}
                                            className="w-full px-3 py-2 border border-stroke-light rounded-lg text-sm text-gray-900 bg-white"
                                        >
                                            <option value="UGR">UGR</option>
                                            <option value="None">None</option>
                                        </select>
                                    </div>
                                    {logisticsPartner === "UGR" ? (
                                        <div>
                                            <label className="text-xs font-medium text-gray-700 block mb-2">Port of Destination</label>
                                            <select
                                                value={destinationPort}
                                                onChange={(e) => setDestinationPort(e.target.value as "Jabel Ali" | "Khalifa Port")}
                                                className="w-full px-3 py-2 border border-stroke-light rounded-lg text-sm text-gray-900 bg-white"
                                            >
                                                <option value="Jabel Ali">Jabel Ali</option>
                                                <option value="Khalifa Port">Khalifa Port</option>
                                            </select>
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            {cartError ? <div className="text-sm text-red-600">{cartError}</div> : null}

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowCartModal(false)}>
                                    Cancel
                                </Button>
                                <Button loading={cartLoading} onClick={addNegotiationToCart}>
                                    Confirm & Add to Cart
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </Modal>
        </>
    );
}

const getStatusMessage = (
    status?: string,
    proposalStatus?: ActiveProposal["status"],
    isBuyer?: boolean,
    isSeller?: boolean
) => {
    if (proposalStatus === "seller_accepted") return "Proposal accepted. You can proceed with the next steps.";
    if (proposalStatus === "seller_countered") {
        return isBuyer ? "Seller countered. Review and respond." : "Waiting for buyer response.";
    }
    if (proposalStatus === "buyer_countered") {
        return isSeller ? "Buyer countered. Review and respond." : "Waiting for seller response.";
    }
    if (proposalStatus === "buyer_proposed") {
        return isSeller ? "Buyer proposed. Review and respond." : "Waiting for seller response.";
    }
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "ongoing") {
        if (isBuyer) return "Submit your proposal to start the negotiation.";
        if (isSeller) return "Waiting for a proposal from the buyer.";
        return "Waiting for a proposal to be submitted.";
    }
    if (statusLower === "otppending") return "OTP verification pending. Check your email.";
    if (statusLower === "agreed") return "Negotiation completed successfully!";
    return "Negotiation in progress...";
};

const StatusBadge = ({
    status,
    proposalStatus,
}: Readonly<{ status: string; proposalStatus?: ActiveProposal["status"] }>) => {
    if (proposalStatus === "seller_accepted") {
        return (
            <div className="flex gap-2 items-center">
                <span className="text-xs py-1 px-2.5 rounded-full bg-green-100 text-green-700 font-medium">Accepted</span>
            </div>
        );
    }
    if (proposalStatus === "seller_countered") {
        return (
            <div className="flex gap-2 items-center">
                <span className="text-xs py-1 px-2.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">Seller Countered</span>
            </div>
        );
    }
    if (proposalStatus === "buyer_countered") {
        return (
            <div className="flex gap-2 items-center">
                <span className="text-xs py-1 px-2.5 rounded-full bg-blue-100 text-blue-700 font-medium">Buyer Countered</span>
            </div>
        );
    }
    if (proposalStatus === "buyer_proposed") {
        return (
            <div className="flex gap-2 items-center">
                <span className="text-xs py-1 px-2.5 rounded-full bg-blue-100 text-blue-700 font-medium">Buyer Proposed</span>
            </div>
        );
    }

    if (status?.toLowerCase() === "ongoing")
        return (
            <div className="flex gap-2 items-center">
                <span className="text-xs py-1 px-2.5 rounded-full bg-blue-100 text-blue-700 font-medium">Idle</span>
            </div>
        );

    if (status?.toLowerCase() === "otppending")
        return (
            <div className="flex gap-2 items-center">
                <span className="text-xs py-1 px-2.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">Pending</span>
            </div>
        );
    if (status?.toLowerCase() === "agreed")
        return (
            <div className="flex gap-2 items-center">
                <span className="text-xs py-1 px-2.5 rounded-full bg-green-100 text-green-700 font-medium">Accepted</span>
            </div>
        );

    return <></>;
};
