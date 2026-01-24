"use client";

import { FilterIcon } from "@/components/Icons";
import Button from "@/elements/Button";
import type { Content } from "@/app/vehicles/page";
import { use, useState } from "react";
import FilterSidebar from "@/components/FilterSideBar";
import Select, { type Option } from "@/elements/Select";
import { Brand } from "@/lib/data";
import { api } from "@/lib/api/client-request";
import SortedBy from "@/components/SortedBy";
import { Data as VehicleData } from "@/app/vehicles/page";
import NoList from "@/components/NoList";
import VehicleCard from "@/components/VehicleCard";
import { SearchParams } from "next/dist/server/request/search-params";

type PropsT = {
    initialData: Content[];
    currentPage: number;
    totalItems: number;
    userId: string;
    brandRes: Promise<{ data: Brand[] }>;
    filterRes: Promise<{ data: Record<string, unknown> }>;
};
type Model = {
    id: string;
    modelName: string;
};
const defaultInitialFilters = {
    country: "",
    bodyType: "",
    priceRange: "",
    brand: "",
    model: "",
    searchQuery: "",
    sellerType: "",
    condition: "",
    color: "",
    fuelType: [],
    drivetrain: [],
    regionalSpecs: "",
    transmission: "",
    minMileage: "",
    maxMileage: "",
    yearFrom: "",
    yearTo: "",
};

export default function VehicleList({ initialData, totalItems, brandRes, filterRes, userId }: Readonly<PropsT>) {
    const [items, setItems] = useState(initialData);
    const [filters, setFilters] = useState<SearchParams>(defaultInitialFilters);
    const [modelList, setModelList] = useState<Model[]>();
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [sortBy, setSortBy] = useState("sortBy=year&sortOrder=desc");
    const [totalCount, setTotalCount] = useState(totalItems);

    const brandsData = use(brandRes);
    const filterResponse = use(filterRes);

    const brandList = brandsData.data;
    const filterData = filterResponse.data;

    const toggleSidebar = () => {
        setShowAdvancedFilters((prev) => !prev);
    };
    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };
    const handleSearch = async (filter: SearchParams = filters) => {
        try {
            const vehicleData = await api.get<{ data: VehicleData }>("/inventory/api/v1/inventory/inventoryListForUser", {
                params: {
                    userId: userId,
                    ...filter,
                    sortBy: sortBy.split("&")[0]?.split("=")[1],
                    sortOrder: sortBy.split("&")[1]?.split("=")[1],
                },
            });
            setItems(vehicleData.data.content);
            setTotalCount(vehicleData.data.totalElements);
        } catch (error) {
            console.log("Error -: ", error);
        }
    };

    const handleApply = () => {
        setShowAdvancedFilters(false);
        handleSearch();
    };

    const clearAllFilter = () => {
        setShowAdvancedFilters(false);
        handleSearch(defaultInitialFilters);
    };

    const getModelList = async (brandId: string) => {
        if (!brandId) {
            setModelList([]);
            return;
        }
        try {
            const res = await api.get<{ data: Model[] }>(`/masters/api/v1/mtoc/brands/models`, { params: { ref: brandId } });
            if (!res.data) throw new Error("Something went wrong");
            setModelList(res.data);
        } catch {
            console.log("error");
        }
    };

    return (
        <div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-stroke-light mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-4 mb-6">
                    <Select
                        label="Brand"
                        options={[
                            { label: "All Brand", value: "" },
                            ...(brandList?.map((brand) => ({
                                label: brand.name,
                                value: brand.name,
                            })) ?? []),
                        ]}
                        value={filters.brand}
                        onChange={(value) => {
                            handleFilterChange("brand", value as string);
                            getModelList(value as string);
                        }}
                        placeholder="Select Brand"
                        border="bg-input-background"
                    />
                    <Select
                        label="Model"
                        options={[
                            { label: "All Model", value: "" },
                            ...(modelList?.map((model) => ({
                                label: model.modelName,
                                value: model.modelName,
                            })) ?? []),
                        ]}
                        value={filters.model}
                        onChange={(value) => handleFilterChange("model", value as string)}
                        placeholder="Select Model"
                        noDataMessage="Select brand first"
                        border="bg-input-background"
                    />
                    <Select
                        label="Body Type"
                        options={[{ label: "All Body Type", value: "" }, ...((filterData?.bodyType as Option[]) ?? [])]}
                        value={filters.bodyType}
                        onChange={(value) => handleFilterChange("bodyType", value as string)}
                        placeholder="Body Type"
                        border="bg-input-background"
                    />

                    <Select
                        label="Price Range"
                        options={[{ label: "All Price Range", value: "" }, ...((filterData?.priceRange as Option[]) ?? [])]}
                        value={filters.priceRange}
                        onChange={(value) => handleFilterChange("priceRange", value as string)}
                        placeholder="Price Range"
                        border="bg-input-background"
                    />
                </div>
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className={`flex justify-center items-center gap-2 lg:gap-4`}>
                        <button
                            type="button"
                            onClick={() => setShowAdvancedFilters(true)}
                            className="inline-flex items-center justify-center gap-1.2 text-brand-blue border border-brand-blue hover:bg-brand-blue hover:text-white h-10 px-4 rounded-lg whitespace-nowrap">
                            <FilterIcon className="h-4 w-4 mr-1 lg:mr-2" />
                            <span className="text-xs/4.25 font-medium">Advanced Filters</span>
                        </button>

                        <Button type="button" variant="primary" onClick={() => handleSearch()}>
                            Apply Filter
                        </Button>
                    </div>
                    <button
                        onClick={() => {
                            handleSearch(defaultInitialFilters);
                            setFilters(defaultInitialFilters);
                        }}
                        className="px-6 text-gray-600 py-2 border border-stroke-light hover:bg-accent hover:text-accent-foreground rounded-md font-medium transition-all text-sm">
                        Clear All
                    </button>
                </div>
                <div className="border-t border-stroke-light my-4" />
                <SortedBy className="m-0" count={totalCount} handleSortChange={(value: string) => setSortBy(value)} sortBy={sortBy} />
            </div>
            {totalCount === 0 ? (
                <NoList />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <VehicleCard key={item.id} item={item} />
                    ))}
                </div>
            )}
            {filterData && (
                <FilterSidebar
                    data={filterData}
                    isOpen={showAdvancedFilters}
                    closeFilters={toggleSidebar}
                    filterState={filters}
                    handleApply={handleApply}
                    clearAllFilter={clearAllFilter}
                    setFilterState={setFilters}
                />
            )}
        </div>
    );
}
