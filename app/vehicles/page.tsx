import FilterBar from "@/components/FilterBar";
import VehicleCardListing from "@/components/inventory-listing/VehicleCardListing";
import { getBrands, getFilters } from "@/lib/data";

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

    const data: Data = {
        content: [],
        totalItems: 0,
        totalElements: 0,
        totalPages: 0,
        size: 0,
        last: true,
        currentPage: 1,
    };
    const allContent = data.content;
    const cartInventoryIds: string[] = [];

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
                currentPage={data.currentPage}
                querySearchParams={newQuery}
                totalItems={data.totalItems}
                totalPages={data.totalPages}
                pageSize={data.size}
                cartInventoryIds={cartInventoryIds}
            />
        </main>
    );
}
