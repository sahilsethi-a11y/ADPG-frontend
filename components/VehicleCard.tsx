"use client";

import { EyeIcon, MapPinIcon } from "@/components/Icons";
import Button from "@/elements/Button";
import QRShare from "@/components/vehicle-details/QRShare";
import Link from "next/link";
import ShortList from "@/components/vehicle-details/ShortList";
import Image from "@/elements/Image";
import { formatPrice } from "@/lib/utils";
import PriceBadge from "@/elements/PriceBadge";
import type { Content } from "@/app/vehicles/page";
import { useRouter } from "next/navigation";

type Props = Readonly<{
    item: Content;

    // Bucket props
    bucketCount?: number; // now shown for 1 too
    bucketVariant?: string;
    bucketPriceRange?: { min: number; max: number; currency?: string };

    // Bucket modal trigger button
    viewAllLabel?: string;
    onViewAllClick?: () => void;
    isInQuoteBuilder?: boolean;
}>;

export default function ({
    item,
    bucketCount,
    bucketVariant,
    bucketPriceRange,
    viewAllLabel,
    onViewAllClick,
    isInQuoteBuilder = false,
}: Props) {
    const router = useRouter();

    /**
     * ✅ Always show units badge if bucketCount was passed, including 1
     */
    const unitsLabel =
        typeof bucketCount === "number" ? (
            <span className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-[10px] font-medium text-gray-700 px-2 py-0.5 whitespace-nowrap">
                {bucketCount} unit{bucketCount === 1 ? "" : "s"}
            </span>
        ) : null;
    const quoteBadge = isInQuoteBuilder ? (
        <span className="inline-flex items-center justify-center rounded-full border border-green-200 bg-green-50 text-[10px] font-medium text-green-700 px-2 py-0.5 whitespace-nowrap">
            In Quote Builder
        </span>
    ) : null;

    /**
     * ✅ Replace bulk pill with variant label (if provided)
     */
    const variantLabel = bucketVariant?.trim();

    /**
     * ✅ Price range display (kept one-line, with responsive font size)
     */
    const priceText = (() => {
        if (!bucketPriceRange) return formatPrice(item.inventory?.price, item.inventory?.currency);

        const currency = bucketPriceRange.currency ?? item.inventory?.currency;

        if (bucketPriceRange.min === bucketPriceRange.max) {
            return formatPrice(String(Math.round(bucketPriceRange.min)), currency);
        }

        return `${formatPrice(String(Math.round(bucketPriceRange.min)), currency)} - ${formatPrice(
            String(Math.round(bucketPriceRange.max)),
            currency
        )}`;
    })();

    return (
        <div
            onClick={() => router.push(`/vehicles/${item.inventory.id}`)}
            className="text-foreground flex flex-col gap-6 w-full max-w-sm mx-auto bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
        >
            <div className="relative">
                <div className="relative h-48 bg-gray-100 rounded-t-xl overflow-hidden">
                    <Image
                        src={item.inventory?.mainImageUrl}
                        alt={`${item.inventory?.brand} ${item.inventory?.model}`}
                        fill={true}
                        height={168}
                        width={260}
                        className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center justify-center font-medium text-white text-[10px] px-2 py-1 rounded-md bg-brand-blue">
                            Verified Dealer
                        </span>
                    </div>

                    {item.inventory?.condition && (
                        <div className="absolute top-3 right-3">
                            <span className="inline-flex items-center justify-center font-medium bg-white text-gray-700 text-[10px] px-2 py-1 rounded-md">
                                {item.inventory?.condition}
                            </span>
                        </div>
                    )}

                    {item.inventory?.model && (
                        <div className="absolute bottom-3 left-3 flex items-center bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                            <EyeIcon className="h-3 w-3 mr-1" />
                            <span className="text-[10px]">{0} viewing</span>
                        </div>
                    )}

                    <div className="absolute bottom-3 right-3 flex space-x-2">
                        <ShortList
                            onlyHeart={true}
                            isLike={false}
                            inventoryId={item.id}
                            iconCls="h-4 w-4 text-gray-600"
                            cls="bg-white h-8 w-8 p-0 rounded-md shadow-sm hover:bg-gray-50 justify-center"
                        />
                    </div>
                </div>

                <div className="p-4 last:pb-6">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-base font-medium text-gray-900 truncate w-full">
                            <Link href={`/vehicles/${item.inventory?.brand}-${item.inventory?.model}`} onClick={(e) => e.stopPropagation()}>
                                {item.inventory?.year} {item.inventory?.brand} {item.inventory?.model}
                            </Link>
                        </h3>
                        <div className="flex items-center gap-2">
                            {unitsLabel}
                            {quoteBadge}
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 mb-3 w-full line-clamp-2">
                        {item.inventory?.bodyType} &bull; {item.inventory?.fuelType} &bull; {item.inventory?.transmission}
                    </p>

                    <div className="mb-4">
                        {/* ✅ One line + slightly smaller font so long ranges fit */}
                        <div className="text-lg md:text-xl font-semibold flex gap-1 items-center text-gray-900 mb-1 whitespace-nowrap leading-none">
                            {priceText} <PriceBadge />
                        </div>

                        {variantLabel ? (
                            <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap mt-2 bg-gray-50 text-gray-600 border-gray-300">
                                {variantLabel}
                            </span>
                        ) : null}
                    </div>

                    {/* ✅ Button exists for single-unit buckets as well */}
                    {viewAllLabel && onViewAllClick ? (
                        <Button
                            variant="primary"
                            size="md"
                            fullWidth={true}
                            className="mb-2.5"
                            onClick={(e: any) => {
                                e.stopPropagation(); // prevent card click (which navigates)
                                onViewAllClick();
                            }}
                        >
                            {viewAllLabel}
                        </Button>
                    ) : null}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                            <MapPinIcon className="h-3.5 w-3.5 mr-1" />
                            <span>
                                {item.inventory?.city}, {item.inventory?.country}
                            </span>
                        </div>
                        <QRShare vehicleUrl={`/vehicles/${item.inventory?.id}`} btnCls="h-auto" iconCls="w-4 h-4 text-brand-blue" />
                    </div>

                    <div className="text-sm text-gray-500 mt-1">
                        By{" "}
                        <Link
                            href={`/seller-details/${item.inventory?.userId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-brand-blue hover:underline font-medium"
                        >
                            {item.user?.roleMetaData?.companyName || item.user?.roleMetaData?.dealershipName}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
