"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api/client-request";
import NegotiationItemsSection from "./NegotiationItemsSection";
import NegotiationQuotePanelLocal from "./NegotiationQuotePanelLocal";
import Conversation, { NegotiationInfo, type Message } from "./Conversation";
import YourProposalSummary from "./YourProposalSummary";

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
    }>;
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
}: Props) {
    // ==========================================
    // Shared State Management (PAGE LEVEL)
    // ==========================================
    const [bucketDiscounts, setBucketDiscounts] = useState<Record<string, number>>({});
    const [downpaymentPercent, setDownpaymentPercent] = useState(10);
    const [selectedPort, setSelectedPort] = useState("Dubai");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    // Post-submission state
    const [uiStatus, setUiStatus] = useState<"IDLE" | "BUYER_PROPOSED">("IDLE");
    const [activeProposal, setActiveProposal] = useState<ActiveProposal | null>(null);

    // ==========================================
    // Submit Proposal Handler
    // ==========================================
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
            }>;
        }) => {
            setIsSubmitting(true);

            try {
                const response = await api.post<{ status: string }>(
                    `/chat/api/conversations/${conversationId}/submit-proposal`,
                    {
                        body: {
                            discountPercent: proposalData.discountPercent,
                            discountAmount: proposalData.discountAmount,
                            finalPrice: proposalData.finalPrice,
                            downpaymentPercent: proposalData.downpaymentPercent,
                            downpaymentAmount: proposalData.downpaymentAmount,
                            remainingBalance: proposalData.remainingBalance,
                            portOfLoading: selectedPort,
                        },
                    }
                );

                if (response?.status !== "OK") {
                    setSubmissionError("Failed to submit proposal. Please try again.");
                    setUiStatus("IDLE");
                    setActiveProposal(null);
                    setIsSubmitting(false);
                    return;
                }

                setUiStatus("BUYER_PROPOSED");
                setActiveProposal({
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
                });

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
            } catch {
                setSubmissionError("Network error. Please try again.");
                setUiStatus("IDLE");
                setActiveProposal(null);
                setIsSubmitting(false);
            }
        },
        [selectedPort]
    );

    // ==========================================
    // Derived Values
    // ==========================================
    const isBuyer = role?.toLowerCase() === "buyer";
    const handleBucketDiscountChange = useCallback((bucketKey: string, value: number) => {
        setBucketDiscounts((prev) => ({ ...prev, [bucketKey]: value }));
    }, []);

    // Determine if UI should show locked/disabled state
    const isProposalSubmitted = uiStatus === "BUYER_PROPOSED";

    return (
        <>
            {/* Left Column: Negotiation Items and Conversation */}
            <div className="lg:col-span-2 space-y-6 flex flex-col">
                {/* Negotiation Items Section - shows locked state if proposal submitted */}
                <NegotiationItemsSection
                    sellerName={sellerName}
                    sellerId={sellerId}
                    isBuyer={isBuyer}
                    bucketDiscounts={bucketDiscounts}
                    onBucketDiscountChange={handleBucketDiscountChange}
                    isLocked={isProposalSubmitted}
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
                            roleType: role || "",
                        }}
                        initialChats={initialChats ?? []}
                        userId={userId}
                        role={role || ""}
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
                <div className="border border-stroke-light rounded-lg p-5 bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900">Status</h3>
                        <StatusBadge status={negotiationStatus || ""} isBuyerProposed={isProposalSubmitted} />
                    </div>
                    <p className="text-sm text-gray-600">{getStatusMessage(negotiationStatus, isProposalSubmitted)}</p>
                </div>

                {/* Show appropriate panel based on submission status */}
                {sellerName || sellerId ? (
                    !isProposalSubmitted ? (
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
                        />
                    ) : activeProposal ? (
                        <YourProposalSummary proposal={activeProposal} currency={currency || "USD"} />
                    ) : null
                ) : null}
            </div>
        </>
    );
}

const getStatusMessage = (status?: string, isBuyerProposed?: boolean) => {
    if (isBuyerProposed) return "Buyer has submitted a proposal. Waiting for seller response.";
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "ongoing") return "Waiting for a proposal to be submitted.";
    if (statusLower === "otppending") return "OTP verification pending. Check your email.";
    if (statusLower === "agreed") return "Negotiation completed successfully!";
    return "Negotiation in progress...";
};

const StatusBadge = ({ status, isBuyerProposed }: Readonly<{ status: string; isBuyerProposed?: boolean }>) => {
    if (isBuyerProposed) {
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
