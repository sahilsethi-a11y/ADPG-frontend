"use client";

import { useState, useEffect } from "react";
import Image from "@/elements/Image";
import Button from "@/elements/Button";
import { formatPrice } from "@/lib/utils";
import type { QuoteItem } from "@/components/buyer/QuoteBuilderList";

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

type ProposalData = {
  discountPercent: number;
  originalTotal: number;
  finalPrice: number;
  downpaymentPercent: number;
  downpaymentAmount: number;
  remainingBalance: number;
  buyerName: string;
  timestamp: string;
};

type Props = {
  buckets: NegotiationBucket[];
  proposalData: ProposalData;
  currency: string;
};

export default function SellerProposalReview({ buckets, proposalData, currency }: Props) {
  const [proposalStatus, setProposalStatus] = useState<"pending" | "accepted" | "rejected">("pending");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = () => {
    setIsProcessing(true);
    // Simulate processing delay
    setTimeout(() => {
      setProposalStatus("accepted");
      setIsProcessing(false);
    }, 500);
  };

  const handleReject = () => {
    setIsProcessing(true);
    // Simulate processing delay
    setTimeout(() => {
      setProposalStatus("rejected");
      setIsProcessing(false);
    }, 500);
  };

  const discountAmount = proposalData.originalTotal * (proposalData.discountPercent / 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
      {/* LEFT COLUMN - Negotiation Items + Message History */}
      <div className="lg:col-span-2 space-y-6">
        {/* Negotiation Items Section */}
        <section className="border border-stroke-light rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Negotiation Items</h3>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              {buckets.length} {buckets.length === 1 ? "group" : "groups"}
            </span>
          </div>

          <div className="space-y-2">
            {buckets.map((bucket) => (
              <div key={bucket.key} className="border border-gray-200 rounded-lg bg-white p-3 flex items-center gap-3">
                {/* Thumbnail */}
                <div className="relative h-12 w-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={bucket.mainImageUrl}
                    alt={`${bucket.brand} ${bucket.model}`}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Vehicle Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {bucket.year} {bucket.brand} {bucket.model}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-600">
                      {bucket.sellerCompany}
                    </span>
                    <span className="bg-brand-blue text-white text-[8px] font-semibold px-1.5 py-0.5 rounded-full">
                      {bucket.unitCount}x
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatPrice(bucket.bucketTotal, bucket.currency)}
                  </p>
                  <p className="text-[10px] text-gray-500">Group</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Message History Section */}
        <section className="border border-stroke-light rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Message History</h3>
          </div>

          <div className="space-y-4 max-h-64 overflow-y-auto">
            {/* System Message 1 */}
            <div className="flex justify-center">
              <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full">
                Negotiation started for {buckets.length} vehicle{buckets.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* System Message 2 */}
            <div className="flex justify-center">
              <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full max-w-md text-center">
                Buyer submitted proposal: {proposalData.discountPercent}% discount, {proposalData.downpaymentPercent}% downpayment
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN - Status + Proposal + Actions */}
      <div className="lg:col-span-1 space-y-4">
        {/* Status Card */}
        <div className="border border-stroke-light rounded-lg p-4 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Status</h3>
            <StatusBadge status={proposalStatus} />
          </div>
          <p className="text-sm text-gray-600">
            {proposalStatus === "pending"
              ? "Buyer has submitted a proposal. Waiting for seller response."
              : proposalStatus === "accepted"
                ? "Deal accepted successfully"
                : "Proposal rejected by seller"}
          </p>
        </div>

        {/* Seller Proposal Card */}
        <div className={`border border-stroke-light rounded-lg p-4 bg-white shadow-sm transition-all ${
          proposalStatus !== "pending" ? "opacity-75 bg-gray-50" : ""
        }`}>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900">{proposalData.buyerName}'S PROPOSAL</h3>
            <p className="text-xs text-gray-500 mt-1">{proposalData.timestamp}</p>
          </div>

          {/* Discounts Section */}
          <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
            {buckets.map((bucket) => {
              const bucketDiscount = bucket.bucketTotal * (proposalData.discountPercent / 100);
              const bucketFinal = bucket.bucketTotal - bucketDiscount;
              return (
                <div key={bucket.key} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">
                      {bucket.year} {bucket.brand} {bucket.model}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {formatPrice(bucket.bucketTotal, bucket.currency)} → {formatPrice(bucketFinal, bucket.currency)}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-gray-900 ml-2">
                    -{proposalData.discountPercent}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Summary Box */}
          <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Original Total:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatPrice(proposalData.originalTotal, currency)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Total Discount:</span>
              <span className="text-sm font-medium text-gray-900">
                -{formatPrice(discountAmount, currency)}
              </span>
            </div>
            <div className="flex items-center justify-between bg-blue-50 -mx-4 px-4 py-2 mt-3">
              <span className="text-sm font-semibold text-gray-900">Final Price:</span>
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(proposalData.finalPrice, currency)}
              </span>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Downpayment:</span>
              <span className="text-sm font-semibold text-green-700">{proposalData.downpaymentPercent}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Due Now:</span>
              <span className="text-sm font-bold text-green-700">
                {formatPrice(proposalData.downpaymentAmount, currency)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Remaining Balance:</span>
              <span className="text-sm font-medium text-green-700">
                {formatPrice(proposalData.remainingBalance, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleAccept}
            disabled={proposalStatus !== "pending" || isProcessing}
            className="flex-1"
            variant={proposalStatus === "accepted" ? "secondary" : "primary"}
          >
            {isProcessing && proposalStatus === "pending" ? "Accepting..." : "Accept"}
          </Button>
          <Button
            onClick={handleReject}
            disabled={proposalStatus !== "pending" || isProcessing}
            className="flex-1"
            variant={proposalStatus === "rejected" ? "secondary" : "danger"}
          >
            {isProcessing && proposalStatus === "pending" ? "Rejecting..." : "Reject"}
          </Button>
        </div>
      </div>
    </div>
  );
}

const StatusBadge = ({ status }: { status: "pending" | "accepted" | "rejected" }) => {
  const statusConfig = {
    pending: { label: "Buyer Proposed", bgColor: "bg-blue-100", textColor: "text-blue-700" },
    accepted: { label: "Accepted", bgColor: "bg-green-100", textColor: "text-green-700" },
    rejected: { label: "Rejected", bgColor: "bg-red-100", textColor: "text-red-700" },
  };

  const config = statusConfig[status];

  return (
    <span className={`text-xs py-1 px-2.5 rounded-full ${config.bgColor} ${config.textColor} font-medium`}>
      {config.label}
    </span>
  );
};
