"use client";

import type { Content } from "@/app/vehicles/page";
import VehicleCardListing from "@/components/inventory-listing/VehicleCardListing";
import type { SearchParams } from "next/dist/server/request/search-params";

type PropsT = {
    initialData: Content[];
    currentPage: number;
    totalItems: number;
    totalPages: number;
    pageSize: number;
    last: boolean;
    userId: string;
    selectedCurrency?: string;
    brandRes?: Promise<unknown>;
    filterRes?: Promise<unknown>;
};

export default function VehicleList({ initialData, currentPage, totalItems, totalPages, pageSize, last, userId, selectedCurrency }: Readonly<PropsT>) {
    const sellerListingParams: SearchParams = {
        sortBy: "price",
        sortOrder: "asc",
    };

    return (
        <VehicleCardListing
            initialData={initialData}
            last={last}
            currentPage={currentPage}
            querySearchParams={sellerListingParams}
            totalItems={totalItems}
            totalPages={totalPages}
            pageSize={pageSize}
            sellerId={userId}
            selectedCurrency={selectedCurrency}
        />
    );
}
