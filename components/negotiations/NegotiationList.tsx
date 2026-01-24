"use client";

import { useState } from "react";
import { AlertCircleIcon, CheckCircleIcon, ClockIcon, MessageSquareIcon, SearchIcon, UserIcon } from "@/components/Icons";
import Input from "@/elements/Input";
import Button from "@/elements/Button";
import Image from "@/elements/Image";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";
import { api } from "@/lib/api/client-request";
import PriceBadge from "@/elements/PriceBadge";
import { formatPrice } from "@/lib/utils";

export type Content = {
    conversationId: string;
    userId: string;
    peerId: string;
    itemId: number;
    updatedAt: string;
    roleType: string;
    name: string;
    lastActivity: string;
    status: string;
    startedAt: string;
    message: string;
    agreedPrice?: string;
    vehicle: {
        id: string;
        brand: string;
        model: string;
        variant: string;
        year: number;
        price: number;
        currency: string;
        allowPriceNegotiations: true;
        mainImageUrl: string;
        createTime: string;
        imageUrls: string[];
    };
};

export type Negotiation = {
    content: Content[];
    currentPage: number;
    first: boolean;
    last: boolean;
    size: number;
    totalItems: number;
    totalPages: number;
};

type PropsT = {
    data: Negotiation;
    userId: string;
};

const filters = [
    {
        label: "All",
        value: "",
    },
    {
        label: "Ongoing",
        value: "ongoing",
    },
    {
        label: "Agreed",
        value: "agreed",
    },
    {
        label: "OTP Pending",
        value: "otpPending",
    },
];

export default function NegotiationList({ data: initialData, userId }: Readonly<PropsT>) {
    const [data, setData] = useState<Negotiation>(initialData);

    const [query, setQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState(filters[0].value);
    const router = useRouter();

    const applyFilter = async (page = initialData.currentPage, size = initialData.size) => {
        try {
            const params = {
                userId,
                status: activeFilter,
                query,
                page,
                size,
            };

            const res = await api.get<{ data: Negotiation }>("/chat/api/negotiations", { params });
            const payload = res?.data;
            setData(payload);
        } catch (err) {
            console.log("Failed to fetch more negotiations", err);
        }
    };

    const navigateToDetail = (i: Content) => {
        const url = "/vehicles/" + i.itemId;
        router.push(url);
    };

    const navigateToConversation = (i: Content) => {
        router.push("/my-negotiations/" + i.conversationId);
    };

    return (
        <div>
            <div className="flex gap-4 p-4 rounded-xl border flex-wrap border-stroke-light mb-6">
                <div className="relative grow">
                    <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input type="text" className="pl-10 py-1.5" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by vehicle or buyer name..." />
                </div>
                <div className="flex gap-2">
                    {filters.map((i) => (
                        <Button onClick={() => setActiveFilter(i.value)} size="sm" variant={activeFilter === i.value ? "primary" : "outline"} key={i.label}>
                            {i.label}
                        </Button>
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-6">
                {data?.content.map((i) => (
                    <div
                        key={i.conversationId}
                        className="grid grid-cols-[80px_1fr] md:grid-cols-[80px_1fr_250px] gap-2 md:gap-4 rounded-xl p-4 border-stroke-light border hover:shadow-md transition-shadow">
                        <div className="w-20 h-16 relative">
                            <Image src={i.vehicle.mainImageUrl || i.vehicle.imageUrls?.[0]} alt={i.vehicle.brand} fill height={70} width={56} className="rounded-lg" />
                        </div>
                        <div>
                            <h3 className="text-lg text-brand-blue truncate">
                                {i.vehicle.brand} {i.vehicle.model} {i.vehicle.variant}
                            </h3>
                            <div className="flex flex-col items-center gap-2 text-sm text-gray-600 mb-1 md:flex-row">
                                <span className="flex items-center gap-1">
                                    <UserIcon className="h-3 w-3" />
                                    {i.roleType}: {i.name}
                                </span>
                                <span className="flex items-center gap-1">
                                    <ClockIcon className="h-3 w-3" />
                                    {i.lastActivity}
                                </span>
                            </div>
                            {i.message && <p className="text-gray-700 text-sm mb-3">{i.message}</p>}
                            <div className="flex flex-col md:flex-row gap-2 mb-2">
                                <div className="text-gray-600">
                                    Listed: {formatPrice(i.vehicle.price, i.vehicle.currency)} <PriceBadge />
                                </div>
                                {i.agreedPrice && (
                                    <div className="text-green-600">
                                        Agreed: {formatPrice(i.agreedPrice, i.vehicle.currency)} <PriceBadge />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2 justify-between md:flex-col md:items-end">
                            <StatusBadge status={i.status} />
                            <div className="flex gap-2">
                                <Button onClick={() => navigateToDetail(i)} variant="outline" size="sm">
                                    View Details
                                </Button>
                                <Button onClick={() => navigateToConversation(i)} size="sm">
                                    Continue Chat
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <Pagination
                className="mt-8"
                currentPage={data.currentPage}
                totalPages={data.totalPages}
                onPageChange={(p) => {
                    applyFilter(p, data.size);
                }}
                pageSize={data.size}
                pageSizeOptions={[10, 25, 50, 100]}
                onPageSizeChange={(s) => {
                    applyFilter(initialData.currentPage, s);
                }}
                showQuickJump
                totalItems={data.totalItems}
                currentCount={data.content?.length ?? 0}
            />
            <div className="border-stroke-light flex flex-col gap-6 p-6 rounded-xl border mt-8">
                <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5">
                    <h4 className="leading-none text-brand-blue">Summary</h4>
                </div>
                <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-2xl text-brand-blue">0</div>
                            <div className="text-sm text-gray-600">Ongoing</div>
                        </div>
                        <div>
                            <div className="text-2xl text-green-600">0</div>
                            <div className="text-sm text-gray-600">Agreed</div>
                        </div>
                        <div>
                            <div className="text-2xl text-yellow-600">0</div>
                            <div className="text-sm text-gray-600">OTP Pending</div>
                        </div>
                        <div>
                            <div className="text-2xl text-red-600">0</div>
                            <div className="text-sm text-gray-600">Expired</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const StatusBadge = ({ status }: Readonly<{ status: string }>) => {
    if (status?.toLocaleLowerCase() === "ongoing")
        return (
            <div className="flex gap-2 items-center text-blue-800">
                <MessageSquareIcon />
                <div className="text-xs py-0.5 px-2 rounded-md bg-blue-100">Ongoing</div>
            </div>
        );

    if (status?.toLocaleLowerCase() === "otpPending")
        return (
            <div className="flex gap-2 items-center text-yellow-600">
                <AlertCircleIcon className="h-4 w-4" />
                <div className="text-xs py-0.5 px-2 rounded-md bg-yellow-100">OTP Pending</div>
            </div>
        );
    if (status?.toLocaleLowerCase() === "agreed")
        return (
            <div className="flex gap-2 items-center text-green-800">
                <CheckCircleIcon className="h-4 w-4" />
                <div className="text-xs py-0.5 px-2 rounded-md bg-green-100">Agreed</div>
            </div>
        );

    return <></>;
};
