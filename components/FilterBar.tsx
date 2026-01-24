"use client";

import { use, useEffect, useState } from "react";
import Select, { Option } from "@/elements/Select";
import { FilterIcon, SearchIcon } from "@/components/Icons";
import { useRouter } from "next/navigation";
import { cleanQueryParams } from "@/lib/utils";
import { api } from "@/lib/api/client-request";
import type { SearchParams } from "next/dist/server/request/search-params";
import dynamic from "next/dynamic";

const FilterSidebar = dynamic(() => import("@/components/FilterSideBar"), { ssr: false });

type FilterBarProps = {
    title?: string;
    subTitle?: string;
    parentCls?: string;
    selectCls?: string;
    isLabel?: boolean;
    isClear?: boolean;
    initialFilters?: SearchParams;
    brandRes: Promise<{ data: Brand[] }>;
    filterRes: Promise<{ data: Record<string, unknown> }>;
};

export type FilterItem = {
    id: string;
    filterName: string;
    filterKey: string;
    values: { label: string; value: string; hex?: string }[];
    countryCode: string | null;
};

type Brand = {
    id: string;
    name: string;
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
    searchText: "",
    userType: "",
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

export default function FilterBar({ isLabel = true, brandRes, filterRes, isClear = false, initialFilters, ...props }: Readonly<FilterBarProps>) {
    const router = useRouter();
    const [filters, setFilters] = useState(initialFilters || defaultInitialFilters);
    const [modelList, setModelList] = useState<Model[]>();
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const brandsData = use(brandRes);
    const filterResponse = use(filterRes);

    const brandList = brandsData.data;
    const filterData = filterResponse.data;

    const handleSearch = () => {
        const query = cleanQueryParams(filters);
        router.push(`/vehicles?${query}`);
    };

    const handleApply = () => {
        setShowAdvancedFilters(false);
        handleSearch();
    };

    const clearAllFilter = () => {
        setShowAdvancedFilters(false);
        setFilters(defaultInitialFilters);
        router.push("/vehicles");
    };

    const getModelList = async (brandId: string) => {
        try {
            const res = await api.get<{ data: Model[] }>(`/masters/api/v1/mtoc/brands/models`, { params: { ref: brandId } });
            if (!res.data) throw new Error("Something went wrong");
            setModelList(res.data);
        } catch {
            console.log("error");
        }
    };
    useEffect(() => {
        if (filters?.brand) {
            getModelList(filters?.brand as string);
        } else setModelList([]);
    }, [filters?.brand]);

    const toggleSidebar = () => {
        setShowAdvancedFilters((prev) => !prev);
    };
    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <>
            <div className={`${props.parentCls} bg-white/95 p-6 rounded-lg`}>
                <div className="flex flex-col gap-8">
                    {props.title && (
                        <div className="flex flex-col gap-2 text-center">
                            {props.title && <h2 className="text-2xl/7 font-bold text-black">{props.title}</h2>}

                            {props.subTitle && <p className="text-base/5.25 font-normal text-black/70">{props.subTitle}</p>}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-4 mb-6">
                        <div className="flex flex-col gap-2">
                            <Select
                                label={isLabel && "Country"}
                                options={[{ label: "All Country", value: "" }, ...((filterData?.country as Option[]) ?? [])]}
                                value={filters.country}
                                onChange={(value) => handleFilterChange("country", value as string)}
                                placeholder="Select Country"
                                border={props.selectCls}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Select
                                label={isLabel && "Body Type"}
                                options={[{ label: "All Body Type", value: "" }, ...((filterData?.bodyType as Option[]) ?? [])]}
                                value={filters.bodyType}
                                onChange={(value) => handleFilterChange("bodyType", value as string)}
                                placeholder="Body Type"
                                border={props.selectCls}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Select
                                label={isLabel && "Brand"}
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
                                border={props.selectCls}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Select
                                label={isLabel && "Model"}
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
                                border={props.selectCls}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Select
                                label={isLabel && "Price Range"}
                                options={[{ label: "All Price Range", value: "" }, ...((filterData?.priceRange as Option[]) ?? [])]}
                                value={filters.priceRange}
                                onChange={(value) => handleFilterChange("priceRange", value as string)}
                                placeholder="Price Range"
                                border={props.selectCls}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className={`flex justify-center items-center gap-2 lg:gap-4 ${isClear ? "" : "flex-1"}`}>
                        <button
                            type="button"
                            onClick={() => setShowAdvancedFilters(true)}
                            className="inline-flex items-center justify-center gap-1.2 text-brand-blue border border-brand-blue hover:bg-brand-blue hover:text-white h-10 px-4 rounded-lg whitespace-nowrap">
                            <FilterIcon className="h-4 w-4 mr-1 lg:mr-2" />
                            <span className="text-xs/4.25 font-medium">Advanced Filters</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleSearch}
                            className="inline-flex items-center justify-center gap-1.2 bg-brand-blue h-10 px-4 rounded-lg text-white hover:bg-primary-hover whitespace-nowrap">
                            <SearchIcon className="h-3.5 w-3.5 mr-1 lg:mr-2" />
                            <span className="text-xs/4.25 font-medium">Search Vehicles</span>
                        </button>
                    </div>
                    {isClear && (
                        <button
                            onClick={() => {
                                router.push("/vehicles");
                                setFilters(defaultInitialFilters);
                            }}
                            className="px-6 text-gray-600 py-2 border border-stroke-light hover:bg-accent hover:text-accent-foreground rounded-md font-medium transition-all text-sm">
                            Clear All
                        </button>
                    )}
                </div>
            </div>
            {filterData && (
                <FilterSidebar
                    data={filterData}
                    isOpen={showAdvancedFilters}
                    closeFilters={toggleSidebar}
                    filterState={filters}
                    clearAllFilter={clearAllFilter}
                    handleApply={handleApply}
                    setFilterState={setFilters}
                />
            )}
        </>
    );
}
