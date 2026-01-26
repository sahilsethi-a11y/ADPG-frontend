"use client";

import { CheckCircleIcon, CloseCircleIcon, DeleteIcon, EditIcon, EyeOffIcon, FilterIcon, KebabIcon } from "@/components/Icons";
import Button from "@/elements/Button";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { api } from "@/lib/api/client-request";
import Link from "next/link";
import { ChangeEvent, useRef, useState } from "react";
import message from "@/elements/message";
import { useRouter } from "next/navigation";
import Input from "@/elements/Input";
import { Brand } from "@/lib/data";
import Select, { type Option } from "@/elements/Select";
import NoList from "@/components/NoList";
import Pagination from "@/components/Pagination";
import { formatPrice } from "@/lib/utils";

const tableHeaders = ["Id", "Vehicle Details", "Year", "Price", "Currency", " Regional Specs", "Inventory Status", "Negotiable", "Actions"];

export type Data = {
    content: {
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
            allowPriceNegotiations: boolean;
            status: string;
        };
    }[];
    first: boolean;
    last: boolean;
    number: boolean;
    size: number;
    totalPages: number;
    currentPage: number;
    totalItems: number;
};

type PropsT = {
    data: Data;
    brands: Brand[];
    filterData: Record<string, unknown>;
};

const statusOptions = [
    { label: "All Status", value: "" },
    { label: "Live", value: "LIVE" },
    { label: "Draft", value: "DRAFT" },
    { label: "Suspended", value: "SUSPENDED" },
    { label: "Sold", value: "SOLD" },
];

const negotiableOptions = [
    { label: "All", value: "" },
    { label: "Negotiable", value: "true" },
    { label: "Fixed Price", value: "false" },
];

const baseBadgeCls = "px-1.5 py-1 rounded-sm text-xs font-medium";
const getStatus = (status: string) => {
    switch (status) {
        case "LIVE":
            return <span className={`bg-[#e7f7e7] text-[#2d5a2d] ${baseBadgeCls}`}>Live</span>;
        case "SOLD":
            return <span className={`bg-[#f3e8ff] text-[#6b2c91] ${baseBadgeCls}`}>Sold</span>;
        case "SUSPENDED":
            return <span className={`bg-red-100 text-red-800 ${baseBadgeCls}`}>Suspended</span>;
        case "DRAFT":
            return <span className={`bg-[#fff4e6] text-[#b45309] ${baseBadgeCls}`}>Draft</span>;
        default:
            return <></>;
    }
};

const initialFormState = {
    query: "",
    brand: "",
    status: "",
    year: "",
    regionalSpecs: "",
    allowPriceNegotiations: "",
};

const currentYear = new Date().getFullYear();

const years = Array.from({ length: 30 }, (_, i) => {
    const year = currentYear - i;
    return {
        label: String(year),
        value: String(year),
    };
});

const yearOptions = [{ label: "All Years", value: "" }, ...years];

export default function InventoryTab({ data: initialData, brands, filterData }: Readonly<PropsT>) {
    const [formState, setFormState] = useState(initialFormState);
    const [data, setData] = useState(initialData);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState((prev) => {
            const filters = { ...prev, [name]: value };
            // applyFilter(filters);
            return filters;
        });
    };

    const updateFormField = (name: string, value: string | number) => {
        setFormState((prev) => {
            const filters = { ...prev, [name]: value };
            applyFilter(filters);
            return filters;
        });
    };

    const applyFilter = async (filter: Record<string, string>, page = initialData.currentPage, size = initialData.size) => {
        try {
            const res = await api.get<{ data: Data }>("/inventory/api/v1/inventory/getAllInventoryListForUser", { params: { ...filter, page, size } });
            setData(res.data);
        } catch {
            console.log("Something went wrong");
        }
    };

    return (
        <div>
            <div className="mb-4">
                <h2 className="text-[16px] font-medium text-brand-blue leading-[22px] mb-1">All Vehicles</h2>
                <p className="text-sm text-[#6c757d]">
                    {data.content?.length ?? 0} of {data.totalItems}
                </p>
            </div>
            <div className="mb-6 p-4 bg-[#f8f9fa] rounded-lg border border-stroke-light">
                <div className="flex items-center gap-2 mb-4">
                    <FilterIcon className="w-3.5 h-3.5" />
                    Filters
                </div>
                <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    <Input placeholder="Search vehicles..." parentClassName="lg:col-span-2" name="query" label="Search" value={formState.query} onChange={handleInputChange} />
                    <Select
                        label="Brand"
                        name="brand"
                        options={[
                            { label: "All Brand", value: "" },
                            ...brands.map((brand) => ({
                                value: brand.name,
                                label: brand.name,
                            })),
                        ]}
                        value={formState.brand}
                        onChange={(value) => updateFormField("brand", value)}
                        placeholder="Select Make"
                        border="bg-input-background"
                        labelCls="text-sm font-medium"
                    />
                    <Select
                        label="Status"
                        name="status"
                        options={statusOptions}
                        value={formState.status}
                        onChange={(value) => updateFormField("status", value)}
                        placeholder="Select Status"
                        border="bg-input-background"
                        labelCls="text-sm font-medium"
                    />
                    <Select
                        label="Year"
                        name="year"
                        options={yearOptions}
                        value={formState.year}
                        onChange={(value) => updateFormField("year", value)}
                        placeholder="Select year"
                        border="bg-input-background"
                        labelCls="text-sm font-medium"
                    />
                    <Select
                        label="Regional Specs"
                        name="regionalSpecs"
                        options={[{ label: "All Specs", value: "" }, ...((filterData.regionalSpecsOptions as Option[]) ?? [])]}
                        value={formState.regionalSpecs}
                        onChange={(value) => updateFormField("regionalSpecs", value)}
                        placeholder="Select regional specs"
                        border="bg-input-background"
                        labelCls="text-sm font-medium"
                    />
                    <Select
                        label="Negotiable"
                        name="allowPriceNegotiations"
                        options={negotiableOptions}
                        value={formState.allowPriceNegotiations}
                        onChange={(value) => updateFormField("allowPriceNegotiations", value)}
                        placeholder="Select negotiable status"
                        border="bg-input-background"
                        labelCls="text-sm font-medium"
                    />
                </form>
            </div>
            {data?.content.length > 0 ? (
                <div className="bg-white border border-stroke-light rounded-lg">
                    <div className="relative w-full overflow-x-auto">
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
                                {data?.content?.map((item) => (
                                    <tr key={item.id} className="transition-colors border-b border-black/10 hover:bg-accent/30">
                                        <td className="font-medium align-middle whitespace-nowrap text-sm text-brand-blue p-4">{item.inventory?.id}</td>
                                        <td className="align-middle whitespace-nowrap text-sm text-brand-blue p-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {item.inventory?.brand} {item.inventory?.model}
                                                </span>
                                                <span className="text-xs text-muted-foreground">{item.inventory?.variant}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle whitespace-nowrap text-sm text-brand-blue">{item.inventory?.year}</td>
                                        <td className="p-4 align-middle whitespace-nowrap text-sm text-brand-blue font-medium">{formatPrice(item.inventory?.price, item.inventory?.currency)}</td>
                                        <td className="p-4 align-middle whitespace-nowrap text-sm text-brand-blue font-medium">{item.inventory?.currency}</td>
                                        <td className="p-4 align-middle whitespace-nowrap text-sm text-brand-blue">
                                            <span className="inline-flex border-stroke-light items-center justify-center rounded-md border px-2 py-0.5 w-fit whitespace-nowrap shrink-0 gap-1 text-foreground text-xs">
                                                {item.inventory?.regionalSpecs}
                                            </span>
                                        </td>
                                        <td className="p-2 align-middle whitespace-nowrap">{getStatus(item.inventory?.status)}</td>
                                        <td className="p-2 align-middle whitespace-nowrap  ">
                                            <div className="flex items-center justify-center">
                                                {item.inventory.allowPriceNegotiations ? <CheckCircleIcon className="h-5 w-5 text-green-500" /> : <CloseCircleIcon className="h-5 w-5 text-red-500" />}
                                            </div>
                                        </td>
                                        <td className="p-2 align-middle whitespace-nowrap  [&amp;&gt;[role=checkbox]]:translate-y-[2px]">
                                            <Actions id={item.id} status={item.inventory?.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <NoList />
            )}

            <Pagination
                className="mt-8"
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
        </div>
    );
}

const Actions = ({ status, id }: { status: string; id: string }) => {
    const [isShowMenu, setIsShowMenu] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);
    const router = useRouter();

    useOutsideClick(ref, () => setIsShowMenu(false));
    if (status === "SOLD") return <></>;

    const handleDelete = async () => {
        setIsShowMenu(false);
        try {
            const res = await api.put<{ status: string; message: string }>("/inventory/api/v1/inventory/disable", { params: { id } });
            if (res.status === "OK") {
                message.success(res.message);
                router.refresh();
            }
        } catch {
            message.error("Something went wrong. Unable to disable inventory");
        }
    };
    const handleUnpublish = async () => {
        setIsShowMenu(false);
        try {
            const res = await api.put<{ status: string; message: string }>("/inventory/api/v1/inventory/unpublish", { params: { vehicleId: id } });
            if (res.status === "OK") {
                message.success(res.message);
                router.refresh();
            }
        } catch {
            message.error("Something went wrong. Unable to unpublish");
        }
    };

    return (
        <div className="flex justify-center">
            <div className="relative" ref={ref}>
                <Button variant="secondary" className="px-1 bg-transparent" onClick={() => setIsShowMenu((prev) => !prev)} type="button">
                    <KebabIcon className="h-6 w-6" />
                </Button>

                {isShowMenu && (
                    <div className="absolute z-1 right-0 flex flex-col bg-white top-10 border border-stroke-light shadow-sm rounded-md p-1 w-45">
                        <Link
                            className="inline-flex items-center px-2 py-1.5 gap-2 whitespace-nowrap rounded-md transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none hover:bg-gray-300 text-black font-normal"
                            href={"/add-vehicle/?id=" + id}>
                            <EditIcon /> Edit Listing
                        </Link>
                        {status === "LIVE" && (
                            <Button
                                onClick={handleUnpublish}
                                variant="secondary"
                                leftIcon={<EyeOffIcon className="h-4 w-4 text-[#f59e0b]" />}
                                className="px-2 bg-transparent text-black font-normal justify-start py-1.5">
                                Unpublish
                            </Button>
                        )}
                        <Button
                            onClick={handleDelete}
                            variant="secondary"
                            leftIcon={<DeleteIcon className="h-4 w-4 text-black/60" />}
                            className="px-2 bg-transparent text-destructive font-normal justify-start py-1.5">
                            Delete Listing
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
