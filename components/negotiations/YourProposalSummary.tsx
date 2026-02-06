"use client";

import { useRef } from "react";
import { formatPrice } from "@/lib/utils";

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
  bucketSummaries?: Array<{
    key: string;
    name: string;
    total: number;
    discountPercent: number;
  }>;
};

type Props = {
  proposal: ActiveProposal;
  currency: string;
  onFinalPriceDoubleTap?: () => void;
};

export default function YourProposalSummary({ proposal, currency, onFinalPriceDoubleTap }: Props) {
  const lastTapRef = useRef(0);
  return (
    <div className="border border-stroke-light rounded-lg p-5 bg-white">
      {/* Header */}
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Your Proposal</h3>

      {/* Discount Applied Section */}
      <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">✓</span>
          <p className="text-xs font-medium text-green-700">Discounts Applied</p>
        </div>
        <div className="space-y-2 ml-6">
          {(proposal.bucketSummaries ?? []).map((bucket) => {
            const hasDiscount = bucket.discountPercent > 0;
            const finalBucketTotal = bucket.total * (1 - bucket.discountPercent / 100);
            return (
              <div key={bucket.key} className="text-xs text-gray-600">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-gray-900 truncate">{bucket.name}</span>
                  {hasDiscount ? (
                    <span className="text-green-700 font-semibold">-{bucket.discountPercent}%</span>
                  ) : (
                    <span className="text-gray-400">No discount</span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className={hasDiscount ? "line-through text-gray-400" : "text-gray-700"}>
                    {formatPrice(bucket.total, currency)}
                  </span>
                  {hasDiscount ? (
                    <span className="text-green-700 font-semibold">{formatPrice(finalBucketTotal, currency)}</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Summary Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">Original Price:</span>
          <span className="font-medium text-gray-900">{formatPrice(proposal.bucketTotal, currency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">Discount Amount:</span>
          <span className="font-medium text-red-600">-${Math.round(proposal.discountAmount).toLocaleString()}</span>
        </div>
        <div className="border-t border-blue-200 pt-2 flex justify-between text-sm font-semibold">
          <span className="text-gray-900">Final Price:</span>
          <span
            className="text-brand-blue text-lg"
            onDoubleClick={onFinalPriceDoubleTap}
            onTouchEnd={() => {
              if (!onFinalPriceDoubleTap) return;
              const now = Date.now();
              if (now - lastTapRef.current < 300) {
                onFinalPriceDoubleTap();
              }
              lastTapRef.current = now;
            }}
          >
            {formatPrice(proposal.finalPrice, currency)}
          </span>
        </div>
      </div>

      {/* Payment Summary Section */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-700">Payment Terms</label>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Downpayment ({proposal.downpaymentPercent}%):</span>
            <span className="font-semibold text-gray-900">{formatPrice(proposal.downpaymentAmount, currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Remaining Balance:</span>
            <span className="font-semibold text-gray-900">{formatPrice(proposal.remainingBalance, currency)}</span>
          </div>
        </div>
      </div>

      {/* Port of Loading */}
      <div className="mb-5 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs font-medium text-gray-700 mb-1">Port of Loading</p>
        <p className="text-sm font-semibold text-gray-900">{proposal.selectedPort}</p>
      </div>

      {/* Status Message */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-center text-blue-700 font-medium">
          ⏳ Waiting for seller response...
        </p>
        <p className="text-xs text-center text-blue-600 mt-1">
          Submitted at {new Date(proposal.submittedAt).toLocaleString()}
        </p>
      </div>

      {/* Info Text */}
      <p className="text-xs text-gray-500 text-center mt-4">
        Your proposal has been submitted. You can view seller responses in the conversation.
      </p>
    </div>
  );
}
