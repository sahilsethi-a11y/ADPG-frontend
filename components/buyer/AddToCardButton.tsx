"use client";

import { useEffect, useState } from "react";
import Button from "@/elements/Button";
import { api } from "@/lib/api/client-request";
import message from "@/elements/message";
import { usePathname, useRouter } from "next/navigation";
import { useVehicle } from "@/hooks/useVehicle";

type PropsT = {
    vehicleId: string;
    isNegotiated?: boolean;
    label?: string;
    quantityOverride?: number;
    fullWidth?: boolean;
    size?: "sm" | "md" | "lg";
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    className?: string;
    isInQuoteBuilder?: boolean;
    onAdded?: () => void;
    sellerId?: string;
    sellerCompany?: string;
    storageItem?: {
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
    };
};

export type paymentOption = {
    currency: string;
    price: string;
    discountPercentage: number;
    remainingVehiclePayment: number | null;
    text: string | null;
    dynamictext: string | null;
};

export type Data = {
    vehicle: {
        name: string;
        price: {
            currency: string;
            price: string;
        };
        mainImageUrl: string;
    };
    paymentOption: {
        tokenPayment: paymentOption;
        fullPayment: paymentOption;
    };
    isBulkAvailable: boolean;
    destinationPort: string[];
    portOfLoading: string[];
    logisticServices: {
        price: number;
        services: string[];
    };
};

export default function AddToCartButton({
    vehicleId,
    isNegotiated,
    label = "Add to Cart",
    quantityOverride,
    fullWidth = true,
    size = "md",
    variant = "primary",
    className,
    isInQuoteBuilder = false,
    onAdded,
    sellerId,
    sellerCompany,
    storageItem,
}: Readonly<PropsT>) {
    const pathname = usePathname();
    const router = useRouter();
    const { totalItems } = useVehicle();
    const quantity = typeof quantityOverride === "number" ? quantityOverride : totalItems;

    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [isBuyer, setIsBuyer] = useState<boolean | null>(null);
    const [localInQuote, setLocalInQuote] = useState(false);
    const quoteStorageKey = "quoteBuilderIds";
    const quoteSellerStorageKey = "quoteBuilderSellerByVehicle";
    const quoteSellerCompanyStorageKey = "quoteBuilderSellerByCompany";
    const quoteVehicleCompanyStorageKey = "quoteBuilderVehicleByCompany";
    const quoteItemsStorageKey = "quoteBuilderItems";

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
        const refresh = () => {
            try {
                const raw = window.localStorage.getItem(quoteStorageKey);
                const parsed = raw ? (JSON.parse(raw) as string[]) : [];
                setLocalInQuote(parsed.includes(vehicleId));
            } catch {
                setLocalInQuote(false);
            }
        };
        refresh();
        window.addEventListener("storage", refresh);
        window.addEventListener("quoteBuilderUpdated", refresh);
        return () => {
            window.removeEventListener("storage", refresh);
            window.removeEventListener("quoteBuilderUpdated", refresh);
        };
    }, [quoteStorageKey, vehicleId]);

    const persistQuoteLocal = () => {
        if (typeof window === "undefined") return;
        try {
            const rawItems = window.localStorage.getItem(quoteItemsStorageKey);
            const parsedItems = rawItems ? (JSON.parse(rawItems) as any[]) : [];
            if (storageItem) {
                const filtered = parsedItems.filter((i) => i?.id !== storageItem.id);
                filtered.push({
                    ...storageItem,
                    sellerId: storageItem.sellerId ?? sellerId,
                    sellerCompany: storageItem.sellerCompany ?? sellerCompany ?? "Unknown Seller",
                    isSelected: storageItem.isSelected ?? true,
                });
                window.localStorage.setItem(quoteItemsStorageKey, JSON.stringify(filtered));
            }

            const raw = window.localStorage.getItem(quoteStorageKey);
            const parsed = raw ? (JSON.parse(raw) as string[]) : [];
            const merged = Array.from(new Set([...parsed, vehicleId]));
            window.localStorage.setItem(quoteStorageKey, JSON.stringify(merged));

            if (sellerId) {
                const rawMap = window.localStorage.getItem(quoteSellerStorageKey);
                const parsedMap = rawMap ? (JSON.parse(rawMap) as Record<string, string>) : {};
                parsedMap[vehicleId] = sellerId;
                window.localStorage.setItem(quoteSellerStorageKey, JSON.stringify(parsedMap));
            }

            if (sellerCompany && sellerId) {
                const rawCompanyMap = window.localStorage.getItem(quoteSellerCompanyStorageKey);
                const parsedCompanyMap = rawCompanyMap ? (JSON.parse(rawCompanyMap) as Record<string, string>) : {};
                parsedCompanyMap[sellerCompany] = sellerId;
                window.localStorage.setItem(quoteSellerCompanyStorageKey, JSON.stringify(parsedCompanyMap));
            }

            if (sellerCompany) {
                const rawVehicleCompanyMap = window.localStorage.getItem(quoteVehicleCompanyStorageKey);
                const parsedVehicleCompanyMap = rawVehicleCompanyMap ? (JSON.parse(rawVehicleCompanyMap) as Record<string, string>) : {};
                parsedVehicleCompanyMap[sellerCompany] = vehicleId;
                window.localStorage.setItem(quoteVehicleCompanyStorageKey, JSON.stringify(parsedVehicleCompanyMap));
            }
            window.dispatchEvent(new Event("quoteBuilderUpdated"));
        } catch {}
    };

    const removeQuoteLocal = () => {
        if (typeof window === "undefined") return;
        try {
            const rawItems = window.localStorage.getItem(quoteItemsStorageKey);
            const parsedItems = rawItems ? (JSON.parse(rawItems) as any[]) : [];
            window.localStorage.setItem(
                quoteItemsStorageKey,
                JSON.stringify(parsedItems.filter((i) => i?.id !== vehicleId))
            );

            const raw = window.localStorage.getItem(quoteStorageKey);
            const parsed = raw ? (JSON.parse(raw) as string[]) : [];
            window.localStorage.setItem(
                quoteStorageKey,
                JSON.stringify(parsed.filter((id) => id !== vehicleId))
            );

            const rawMap = window.localStorage.getItem(quoteSellerStorageKey);
            const parsedMap = rawMap ? (JSON.parse(rawMap) as Record<string, string>) : {};
            delete parsedMap[vehicleId];
            window.localStorage.setItem(quoteSellerStorageKey, JSON.stringify(parsedMap));

            if (sellerCompany) {
                const rawCompanyMap = window.localStorage.getItem(quoteSellerCompanyStorageKey);
                const parsedCompanyMap = rawCompanyMap ? (JSON.parse(rawCompanyMap) as Record<string, string>) : {};
                delete parsedCompanyMap[sellerCompany];
                window.localStorage.setItem(quoteSellerCompanyStorageKey, JSON.stringify(parsedCompanyMap));
            }

            if (sellerCompany) {
                const rawVehicleCompanyMap = window.localStorage.getItem(quoteVehicleCompanyStorageKey);
                const parsedVehicleCompanyMap = rawVehicleCompanyMap ? (JSON.parse(rawVehicleCompanyMap) as Record<string, string>) : {};
                delete parsedVehicleCompanyMap[sellerCompany];
                window.localStorage.setItem(quoteVehicleCompanyStorageKey, JSON.stringify(parsedVehicleCompanyMap));
            }

            window.dispatchEvent(new Event("quoteBuilderUpdated"));
        } catch {}
    };

    const handleAddTocart = async () => {
        try {
            if (quantity < 1 && !isNegotiated) {
                message.info("Please select at least one vehicle instance from the Vehicle Details table below");
                return;
            }
            setLoading(true);
            const userData = await api.get<{ data: { roleType: string } }>("/api/v1/auth/getUserInfoByToken");

            if (userData.data?.roleType?.toLocaleLowerCase() === "buyer") {
                persistQuoteLocal();
                message.success("Added to quote builder");
                onAdded?.();
            } else {
                message.info("Only buyers can add vehicle to quote builder");
                setDisabled(true);
            }
        } catch {
            message.error("Unable to verify login right now. Saved locally to Quote Builder.");
        } finally {
            setLoading(false);
        }
    };

    if (isBuyer === false) return null;
    if (isBuyer === null) return null;
    const inQuote = isInQuoteBuilder || localInQuote;

    const handleClick = () => {
        if (inQuote) {
            removeQuoteLocal();
            message.success("Removed from quote builder");
            return;
        }
        handleAddTocart();
    };

    return (
        <>
            <Button
                type="button"
                disabled={disabled}
                loading={loading}
                onClick={handleClick}
                fullWidth={fullWidth}
                variant={variant}
                size={size}
                className={className}
            >
                {inQuote ? "Remove" : label}
            </Button>

        </>
    );
}
