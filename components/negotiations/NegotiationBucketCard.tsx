"use client";

import { useState } from "react";
import Image from "@/elements/Image";
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

type Props = {
  bucket: NegotiationBucket;
  discountPercent: number;
  showDiscountControls?: boolean;
  onDiscountChange?: (value: number) => void;
  isLocked?: boolean;
};

export default function NegotiationBucketCard({
  bucket,
  discountPercent,
  showDiscountControls,
  onDiscountChange,
  isLocked,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Calculate discounted price
  const originalPrice = bucket.bucketTotal;
  const discountAmount = originalPrice * (discountPercent / 100);
  const finalPrice = originalPrice - discountAmount;
  const displayPrice = discountPercent > 0 ? finalPrice : originalPrice;
  const showDiscount = discountPercent > 0;

  return (
    <div className={`border border-gray-200 rounded-lg bg-white transition-all ${isLocked ? "opacity-75 pointer-events-none" : ""}`}>
      {/* Group Header Row - Accordion Toggle */}
      <div
        onClick={() => !isLocked && setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${isLocked ? "cursor-not-allowed" : ""}`}
      >
        {/* Left Section: Thumbnail + Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Thumbnail */}
          <div className="relative h-10 w-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
            {!imageLoaded ? <div className="absolute inset-0 bg-gray-200" aria-hidden="true" /> : null}
            <Image
              src={bucket.mainImageUrl}
              alt={`${bucket.brand} ${bucket.model}`}
              fill
              onLoadingComplete={() => setImageLoaded(true)}
              className={`object-cover transition-opacity ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            />
          </div>

          {/* Vehicle Info */}
          <div className="min-w-0 flex-1">
            {/* Title + Unit Badge */}
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {bucket.items?.[0]?.name || [bucket.brand, bucket.model].filter(Boolean).join(" ")}
              </h4>
              <span className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-[10px] font-medium text-gray-700 px-2 py-0.5 whitespace-nowrap">
                {bucket.unitCount} unit{bucket.unitCount === 1 ? "" : "s"}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {bucket.variant ? (
                <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-[10px] font-medium w-fit whitespace-nowrap bg-gray-50 text-gray-600 border-gray-300">
                  Variant: {bucket.variant}
                </span>
              ) : null}
              {bucket.color ? (
                <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-[10px] font-medium w-fit whitespace-nowrap bg-gray-50 text-gray-600 border-gray-300">
                  Color: {bucket.color}
                </span>
              ) : null}
              {bucket.condition ? (
                <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-[10px] font-medium w-fit whitespace-nowrap bg-gray-50 text-gray-600 border-gray-300">
                  Grade: {bucket.condition}
                </span>
              ) : null}
              {bucket.year ? (
                <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-[10px] font-medium w-fit whitespace-nowrap bg-gray-50 text-gray-600 border-gray-300">
                  Year: {bucket.year}
                </span>
              ) : null}
              {bucket.bodyType ? (
                <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-[10px] font-medium w-fit whitespace-nowrap bg-gray-50 text-gray-600 border-gray-300">
                  Body: {bucket.bodyType}
                </span>
              ) : null}
            </div>

            {/* Seller Name */}
            <p className="text-xs text-gray-600 truncate">{bucket.sellerCompany}</p>
          </div>
        </div>

        {/* Right Section: Price + Chevron */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Price */}
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              {formatPrice(displayPrice, bucket.currency)}
            </p>
            {showDiscount && (
              <p className="text-[10px] text-gray-400 line-through">
                {formatPrice(originalPrice, bucket.currency)}
              </p>
            )}
          </div>

          {/* Chevron Icon */}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? "transform rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Discount Controls */}
      {showDiscountControls ? (
        <div className="border-t border-gray-200 bg-white px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">Discount</span>
            <span className="text-xs font-semibold text-brand-blue">{discountPercent}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={30}
            value={discountPercent}
            onChange={(e) => onDiscountChange?.(Number(e.target.value))}
            disabled={isLocked}
            className="w-full accent-brand-blue disabled:opacity-50"
          />
        </div>
      ) : null}

      {/* Expanded Content - Individual Units */}
      {isOpen && (
        <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 space-y-2">
          {bucket.items.map((item) => {
            const itemDiscountAmount = item.price * (discountPercent / 100);
            const itemFinalPrice = item.price - itemDiscountAmount;
            const itemDisplayPrice = discountPercent > 0 ? itemFinalPrice : item.price;

            return (
              <div key={item.id} className="flex items-center justify-between gap-2 p-2 bg-white rounded border border-gray-100">
                {/* Unit Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {item.name} {item.year && `(${item.year})`}
                  </p>
                  {(() => {
                    const mileageText =
                      item.mileage !== undefined && item.mileage !== null && `${item.mileage}`.trim() !== ""
                        ? `${item.mileage}`
                        : "—";
                    return (
                  <p className="text-[11px] text-gray-500">
                    Qty: {item.quantity}
                    {` • Mileage: ${mileageText}`}
                  </p>
                    );
                  })()}
                </div>

                {/* Unit Price */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatPrice(itemDisplayPrice * item.quantity, item.currency)}
                  </p>
                  {showDiscount && (
                    <p className="text-[10px] text-gray-400 line-through">
                      {formatPrice(item.price * item.quantity, item.currency)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
