"use client";

import { useCallback, useMemo, useState } from "react";
import { api } from "@/lib/api/client-request";
import NegotiationItemsSection from "./NegotiationItemsSection";
import NegotiationQuotePanelLocal from "./NegotiationQuotePanelLocal";
import YourProposalSummary from "./YourProposalSummary";
import Conversation, { NegotiationInfo, type Message } from "./Conversation";

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
    const [discountPercent, setDiscountPercent] = useState(0);
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
        }) => {
            setIsSubmitting(true);

            // ✅ FRONTEND-ONLY: No API calls, just state updates
            // This simulates successful proposal submission
            // Backend integration can be added later by uncommenting API call below

            // Simulate a brief delay for UX (like a real API call)
            await new Promise(resolve => setTimeout(resolve, 500));

            // ✅ Update UI state immediately (optimistic update)
            setUiStatus("BUYER_PROPOSED");

            // Store the submitted proposal values
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
            });

            // Dispatch event to add system message to conversation
            window.dispatchEvent(
                new CustomEvent("proposalSubmitted", {
                    detail: {
                        discountPercent: proposalData.discountPercent,
                        finalPrice: proposalData.finalPrice,
                        downpaymentPercent: proposalData.downpaymentPercent,
                    },
                })
            );

            // Clear any errors
            setSubmissionError(null);
            setIsSubmitting(false);

            // 🔧 BACKEND INTEGRATION: Uncomment below when backend is ready
            /*
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
                }
            } catch (error) {
                setSubmissionError("Network error. Please try again.");
                setUiStatus("IDLE");
                setActiveProposal(null);
                setIsSubmitting(false);
            }
            */
        },
        [selectedPort]
    );

    // ==========================================
    // Derived Values
    // ==========================================
    const discountState = useMemo(
        () => ({
            discountPercent,
            downpaymentPercent,
            selectedPort,
        }),
        [discountPercent, downpaymentPercent, selectedPort]
    );

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
                    discountPercent={discountPercent}
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
                {isProposalSubmitted ? (
                    <div className="border border-stroke-light rounded-lg p-5 bg-white">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Status</h3>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 border border-blue-200">
                            <span className="text-xs font-semibold text-blue-700">Buyer Proposed</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-3">Buyer has submitted a proposal. Waiting for seller response.</p>
                    </div>
                ) : null}

                {/* Show appropriate panel based on submission status */}
                {sellerName || sellerId ? (
                    isProposalSubmitted && activeProposal ? (
                        // AFTER SUBMISSION: Show Your Proposal Summary
                        <YourProposalSummary
                            proposal={activeProposal}
                            currency={currency || "USD"}
                        />
                    ) : (
                        // BEFORE SUBMISSION: Show Make a Proposal Form
                        <NegotiationQuotePanelLocal
                            sellerName={sellerName}
                            sellerId={sellerId}
                            negotiationStatus={negotiationStatus}
                            discountPercent={discountPercent}
                            onDiscountChange={setDiscountPercent}
                            downpaymentPercent={downpaymentPercent}
                            onDownpaymentChange={setDownpaymentPercent}
                            selectedPort={selectedPort}
                            onPortChange={setSelectedPort}
                            onSubmit={handleSubmitProposal}
                            isSubmitting={isSubmitting}
                            submissionError={submissionError}
                        />
                    )
                ) : null}
            </div>
        </>
    );
}
