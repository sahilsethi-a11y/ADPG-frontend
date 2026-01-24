import FilterBar from "@/components/FilterBar";
import VehicleCardListing from "@/components/inventory-listing/VehicleCardListing";
import { api } from "@/lib/api/server-request";
import { getBrands, getFilters } from "@/lib/data";
import type { Cart } from "@/components/buyer/CartList";

export type Content = {
    id: string;
    inventory: Inventory;
    user: userData;
    isFavourite: boolean;
};
export type Data = {
    content: Content[];
    totalItems: number;
    totalElements: number;
    totalPages: number;
    size: number;
    last: boolean;
    currentPage: number;
};

type userData = {
    roleMetaData: {
        companyName?: string;
        dealershipName?: string;
    };
};

export type Inventory = {
    id: string;
    brand: string;
    model: string;
    condition: string;
    year: number;
    bodyType: string;
    city: string;
    country: string;
    fuelType: string;
    transmission: string;
    mainImageUrl: string;
    bulkPurchaseAvailable: boolean;
    vehicleUrl: string;
    price: string;
    userId: string;
    inventoryList: string[];
    views: string;
    currency: string;
};

export default async function VehicleListing({ searchParams }: Readonly<PageProps<"/vehicles">>) {
    const querySearchParams = await searchParams;

    querySearchParams.fuelType = querySearchParams.fuelType ?? [];
    querySearchParams.drivetrain = querySearchParams.drivetrain ?? [];
    const newQuery = { ...querySearchParams };
    newQuery.sortBy = "price";
    newQuery.sortOrder = "asc";

    const res = await api.get<{ data: Data }>("/inventory/api/v1/inventory/search", { params: newQuery });
    const data = res.data;
    let allContent = data.content;

    if (data.totalPages && data.totalPages > 1) {
        const seen = new Set<string>();
        for (const item of allContent) {
            const id = item?.inventory?.id ?? item?.id;
            if (id) seen.add(id);
        }

        const pages = Array.from({ length: data.totalPages - 1 }, (_, i) => i + 2);
        const batchSize = 6;
        for (let i = 0; i < pages.length; i += batchSize) {
            const batch = pages.slice(i, i + batchSize);
            const results = await Promise.all(
                batch.map((page) =>
                    api.get<{ data: Data }>("/inventory/api/v1/inventory/search", {
                        params: { ...newQuery, page },
                    }),
                ),
            );

            for (const r of results) {
                const list = r.data.content ?? [];
                for (const item of list) {
                    const id = item?.inventory?.id ?? item?.id;
                    if (!id || seen.has(id)) continue;
                    seen.add(id);
                    allContent.push(item);
                }
            }
        }
    }
    let cartInventoryIds: string[] = [];
    try {
        const cartRes = await api.get<{ data: Cart[] }>("/inventory/api/v1/inventory/getUserCart", { isAuthRequired: false });
        const ids = (cartRes?.data ?? [])
            .map((item: any) => item.inventoryId ?? item.vehicleId ?? item.id)
            .filter((id: unknown) => typeof id === "string" && id.length > 0);
        cartInventoryIds = Array.from(new Set(ids));
    } catch {
        cartInventoryIds = [];
    }

    const brandRes = getBrands();
    const filterRes = getFilters();

    return (
        <main className="text-[#4a5565] container mx-auto px-4 lg:px-6 py-8">
            <FilterBar
                brandRes={brandRes}
                filterRes={filterRes}
                parentCls="border border-stroke-light"
                selectCls="bg-input-background"
                isLabel={false}
                isClear={true}
                initialFilters={querySearchParams}
            />
            <VehicleCardListing
                key={JSON.stringify(querySearchParams)}
                initialData={allContent}
                last={true}
                currentPage={data.totalPages || data.currentPage}
                querySearchParams={newQuery}
                totalItems={data.totalItems}
                totalPages={data.totalPages}
                pageSize={data.size}
                cartInventoryIds={cartInventoryIds}
            />
        </main>
    );
}
