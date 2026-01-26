"use client";

import { useState, use } from "react";
import Pagination from "@/components/Pagination";
import { FilterIcon, CheckCircleIcon, UserIcon, LocationIcon, CalendarIcon, EyeIcon, BanIcon, TrendingUpIcon } from "@/components/Icons";
import Input from "@/elements/Input";
import Select, { type Option } from "@/elements/Select";
import Modal from "@/elements/Modal";
import NoList from "@/components/NoList";
import SuspendListingModal from "@/components/admin/SuspendListingModal";
import Image from "@/elements/Image";
import { formatPrice, getDaysBetween } from "@/lib/utils";
import { api } from "@/lib/api/client-request";
import { useRouter } from "next/navigation";
import Button from "@/elements/Button";
import message from "@/elements/message";

const tableHeaders = ["Listing", "Seller/Dealer", "Price", "Location", "Listed", "Sessions", "Views", "Status", "Actions"];

// Seller Type options
const sellerTypeOptions = [
    { label: "All Sellers", value: "" },
    { label: "Individual", value: "Individual" },
    { label: "Dealer", value: "Dealer" },
    { label: "Agency", value: "Agency" },
];

const sortOptions = [
    {
        value: "sortBy=price&sortOrder=asc",
        label: "Price: Low to High",
    },
    { value: "sortBy=price&sortOrder=desc", label: "Price: High to Low" },
    {
        value: "sortBy=year&sortOrder=desc",
        label: "Year: Newest First",
    },
    { value: "sortBy=year&sortOrder=asc", label: "Year: Oldest First" },
];

// Status options for filter
const statusOptions = [
    { label: "All", value: "" },
    { label: "Active", value: "LIVE" },
    { label: "Suspended", value: "SUSPENDED" },
];
const baseBadgeCls = "px-1.5 py-1 rounded-sm text-xs font-medium";
const getStatus = (status: string) => {
    switch (status) {
        case "LIVE":
            return <span className={`bg-green-100 text-green-800 ${baseBadgeCls}`}>Active</span>;
        case "SUSPENDED":
            return <span className={`bg-red-100 text-red-800 ${baseBadgeCls}`}>Suspended</span>;
        default:
            return <></>;
    }
};

type Brand = {
    id: string;
    name: string;
};
type Model = {
    id: string;
    modelName: string;
};

export type Content = {
    id: string;
    inventory: {
        id: string;
        brand: string;
        model: string;
        variant: string;
        year: number;
        regionalSpecs: string;
        bodyType: string;
        price: number;
        currency: string;
        status: string;
        createTime: string;
        mainImageUrl: string;
        views: string;
        suspensionDetails: {
            suspensionDate: string;
            suspensionReason: string;
        };
        city: string;
        country: string;
    };
    user: {
        name: string;
        roleType: string;
        userId: string;
        organisationName: string;
        locationAttribute: {
            countryCode: string;
            country: string;
            city: string;
            district: string;
        };
        profileSetting: {
            businessCompanyName: string;
        };
    };
};

export type Data = {
    totalItems: number;
    last: boolean;
    content: Content[];
    currentPage: number;
    size: number;
    totalPages: number;
};
type PropsT = {
    brandRes: Promise<{ data: Brand[] }>;
    filterRes: Promise<{ data: Record<string, unknown> }>;
    data: Data;
};

export default function ListingModerationTab({ data: initialData, brandRes, filterRes }: Readonly<PropsT>) {
    const router = useRouter();
    const [data, setData] = useState<Data>(initialData);
    const [isBanModalOpen, setIsBanModalOpen] = useState(false);
    const [modelList, setModelList] = useState<Model[]>();
    const [selectedVehicle, setSelectedVehicle] = useState<Content>();

    const [formState, setFormState] = useState({
        query: "",
        brand: "",
        model: "",
        country: "",
        status: "",
        userType: "",
        sortBy: "",
    });

    const applyFilter = async (formStateParam: Record<string, string>, page = initialData.currentPage, size = initialData.size) => {
        try {
            const params = {
                ...formStateParam,
                sortBy: formStateParam.sortBy?.split("&")[0]?.split("=")[1],
                sortOrder: formStateParam.sortBy?.split("&")[1]?.split("=")[1],
                page,
                size,
            } as Record<string, unknown>;

            const res = await api.get<{ data: Data }>("/inventory/api/v1/inventory/adminList", { params });
            const payload = res?.data;
            setData(payload);
        } catch (err) {
            console.log("Failed to fetch listings", err);
        }
    };

    const brandsData = use(brandRes);
    const filterResponse = use(filterRes);

    const brandList = brandsData.data;
    const filterData = filterResponse.data;

    const getModelList = async (brandId: string) => {
        try {
            const res = await api.get<{ data: Model[] }>(`/masters/api/v1/mtoc/brands/models`, { params: { ref: brandId } });
            if (!res.data) throw new Error("Something went wrong");
            setModelList(res.data);
        } catch {
            console.log("error");
        }
    };
    const handleStatusChange = async (item: Content) => {
        setSelectedVehicle(item);
        if (item.inventory?.status === "LIVE") {
            setIsBanModalOpen(true);
        } else {
            try {
                await api.post("/inventory/api/v1/inventory/unsuspend-vehicle", {
                    params: {
                        vehicleId: item.id,
                    },
                });
                setTimeout(() => {
                    applyFilter(formState, data.currentPage, data.size);
                    message.success("Listing unsuspended successfully");
                }, 500);
            } catch {
                console.log("error");
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const updateFormField = (name: string, value: string) => {
        setFormState((prev) => {
            const newState = {
                ...prev,
                [name]: value,
            };
            // fetch page 1 with new filters
            applyFilter(newState, initialData.currentPage, data.size);
            return newState;
        });
    };

    return (
        <>
            <div>
                <div className="mb-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[16px] font-medium text-brand-blue leading-[22px] mb-1">Listings Moderation</h2>
                        <p className="text-sm text-[#6c757d]">{data.totalItems} listings</p>
                    </div>
                    <p className="text-sm text-[#6c757d]">Monitor and manage all vehicle listings on the platform</p>
                </div>
                <div className="mb-6 p-4 rounded-lg border border-stroke-light">
                    <div className="flex items-center gap-2 mb-4">
                        <FilterIcon className="w-3.5 h-3.5" />
                        Filters
                    </div>
                    <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        <Input placeholder="Search vehicles..." parentClassName="lg:col-span-2" name="query" label="Search" value={formState.query} onChange={handleInputChange} />

                        <Select
                            label="Brand"
                            options={[
                                { label: "All Brand", value: "" },
                                ...(brandList?.map((brand) => ({
                                    label: brand.name,
                                    value: brand.name,
                                })) ?? []),
                            ]}
                            value={formState.brand}
                            onChange={(value) => {
                                updateFormField("brand", value);
                                getModelList(value);
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
                            value={formState.model}
                            onChange={(value) => updateFormField("model", value)}
                            placeholder="Select Model"
                            noDataMessage="Select brand first"
                            border="bg-input-background"
                        />

                        <Select
                            label="Country"
                            options={[{ label: "All Country", value: "" }, ...((filterData?.country as Option[]) ?? [])]}
                            value={formState.country}
                            onChange={(value) => updateFormField("country", value)}
                            placeholder="Select Country"
                            border="bg-input-background"
                        />

                        <Select
                            label="Status"
                            name="status"
                            options={statusOptions}
                            value={formState.status}
                            onChange={(value) => updateFormField("status", value.toLocaleUpperCase())}
                            placeholder="Select Status"
                            border="bg-input-background"
                            labelCls="text-sm font-medium"
                        />
                        <Select
                            label="Seller Type"
                            name="sellerType"
                            options={sellerTypeOptions}
                            value={formState.userType}
                            onChange={(value) => updateFormField("userType", value)}
                            placeholder="Select Seller Type"
                            border="bg-input-background"
                            labelCls="text-sm font-medium"
                        />
                        <Select
                            label="Sort By"
                            name="sortBy"
                            options={sortOptions}
                            value={formState.sortBy}
                            onChange={(value) => updateFormField("sortBy", value)}
                            border="bg-input-background"
                            labelCls="text-sm font-medium"
                            placeholder="Select Sort Option"
                        />
                    </form>
                </div>

                <div className="mb-6 p-4 rounded-lg border border-stroke-light">
                    <h2 className="text-[16px] font-medium text-brand-blue leading-[22px] mb-4">All Listings</h2>

                    {data.totalItems === 0 ? (
                        <NoList />
                    ) : (
                        <div className="bg-white border border-stroke-light rounded-lg overflow-auto">
                            <div className="relative w-full">
                                <table className="w-full caption-bottom text-sm">
                                    <thead>
                                        <tr className="transition-colors bg-muted border-b border-black/10 h-12">
                                            {tableHeaders.map((item) => (
                                                <th key={item} className="text-left align-middle whitespace-nowrap text-sm font-medium text-brand-blue px-4 py-3">
                                                    {item}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.content?.map((item) => (
                                            <tr key={item.id} className="transition-colors border-b border-black/10 hover:bg-accent/30">
                                                <td className="font-medium align-middle text-sm text-brand-blue p-2 min-w-65">
                                                    <div className="flex items-center gap-2">
                                                        <Image width={48} height={32} src={item.inventory?.mainImageUrl} alt="car-image" className="w-12 h-8 object-cover rounded-md grow-0" />

                                                        <div>
                                                            <p className="font-medium">
                                                                {item.inventory?.year} {item.inventory?.brand} {item.inventory?.model}
                                                            </p>
                                                            <p className="text-xs text-gray-500">ID: {item.inventory?.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="align-middle whitespace-nowrap text-sm text-brand-blue p-4">
                                                    <div className="flex items-center gap-1">
                                                        <UserIcon className="h-4 w-4 mr-2" />
                                                        <div>
                                                            <span className="font-medium block">{item.user?.organisationName || item?.user?.profileSetting?.businessCompanyName}</span>
                                                            <span className="inline-flex leading-none items-center justify-center text-xs px-1 py-0.5 rounded-md border w-10 font-medium">
                                                                {item.user?.roleType}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle whitespace-nowrap text-sm text-brand-blue font-medium">
                                                    {formatPrice(item.inventory?.price, item.inventory?.currency)}
                                                </td>
                                                <td className="p-4 align-middle whitespace-nowrap text-sm text-brand-blue">
                                                    <div className="flex items-center justify-start">
                                                        <LocationIcon className="h-4 w-4 text-gray-500 mr-2" />
                                                        <p className="text-sm">{[item?.inventory?.city, item?.inventory?.country].filter(Boolean).join(" , ")}</p>
                                                    </div>
                                                </td>

                                                <td className="p-4 align-middle whitespace-nowrap text-sm text-brand-blue font-medium">
                                                    <div className="flex items-center justify-start">
                                                        <CalendarIcon className="h-4 w-4 text-gray-500 mr-2" />
                                                        <div>
                                                            <span className="font-medium block">{new Date(item.inventory?.createTime).toLocaleDateString("en-GB")}</span>
                                                            <span className="text-xs text-muted-foreground">{getDaysBetween(new Date(item.inventory?.createTime), new Date())} days</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="p-4 align-middle whitespace-nowrap text-sm text-brand-blue">
                                                    <div className="flex items-center justify-start">
                                                        <TrendingUpIcon className="h-4 w-4 text-blue-400 mr-2" />
                                                        <p>0</p>
                                                    </div>
                                                </td>
                                                <td className="p-2 align-middle whitespace-nowrap  ">
                                                    <div className="flex items-center justify-start">
                                                        <EyeIcon className="h-5 w-5 text-purple-400 mr-2" />
                                                        <p>{item.inventory?.views}</p>
                                                    </div>
                                                </td>
                                                <td className="p-2 align-middle whitespace-nowrap">
                                                    {getStatus(item.inventory?.status)}
                                                    {item.inventory?.suspensionDetails && (
                                                        <div className="mt-1">
                                                            <p className="text-xs text-gray-500">
                                                                Suspended {"  "}
                                                                {new Date(item.inventory?.suspensionDetails?.suspensionDate).toLocaleDateString("en-GB")}
                                                            </p>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-2 align-middle whitespace-nowrap  [&amp;&gt;[role=checkbox]]:translate-y-[2px]">
                                                    <div className=" flex items-center gap-2">
                                                        <Button
                                                            onClick={() => router.push(`/vehicles/${item.inventory?.id}`)}
                                                            leftIcon={<EyeIcon className="h-3.5 w-3.5 text-gray-500 " />}
                                                            size="sm"
                                                            variant="ghost"
                                                            className="p-2"
                                                            disabled={item.inventory?.status !== "LIVE"}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            className={`bg-white border p-2 ${
                                                                item.inventory?.status === "LIVE" ? "border-red-600 text-red-600 hover:bg-red-50" : "border-green-600 text-hreen-600 hover:bg-green-50"
                                                            } `}
                                                            variant="danger"
                                                            leftIcon={
                                                                item.inventory?.status === "LIVE" ? (
                                                                    <BanIcon className="h-3.5 w-3.5 text-red-600 " />
                                                                ) : (
                                                                    <CheckCircleIcon className="h-3.5 w-3.5 text-green-500 " />
                                                                )
                                                            }
                                                            onClick={() => handleStatusChange(item)}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Pagination controls */}

            <Pagination
                currentPage={data.currentPage}
                totalPages={data.totalPages}
                onPageChange={(p) => {
                    applyFilter(formState, p, data.size);
                }}
                pageSize={data.size}
                pageSizeOptions={[10, 25, 50, 100]}
                onPageSizeChange={(s) => {
                    applyFilter(formState, initialData.currentPage, s);
                }}
                showQuickJump
                totalItems={data.totalItems}
                currentCount={data.content?.length ?? 0}
            />

            {selectedVehicle && (
                <Modal showCloseButton={true} isOpen={isBanModalOpen} onClose={() => setIsBanModalOpen(false)}>
                    <SuspendListingModal
                        item={selectedVehicle}
                        handleClose={(isRefresh) => {
                            setIsBanModalOpen(false);
                            if (isRefresh) {
                                applyFilter(formState);
                            }
                        }}
                        isOpen={isBanModalOpen}
                    />
                </Modal>
            )}
        </>
    );
}
