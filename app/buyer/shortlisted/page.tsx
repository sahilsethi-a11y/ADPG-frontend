import { EyeIcon, HeartIcon, SearchIcon } from "@/components/Icons";
import ShortList from "@/components/vehicle-details/ShortList";
import { api } from "@/lib/api/server-request";
import Link from "next/link";
import Image from "@/elements/Image";

type Data = {
    data: {
        content: {
            id: string;
            inventory: {
                id: string;
                year: string;
                brand: string;
                model: string;
                city: string;
                country: string;
                currency: string;
                price: string;
                status: string;
                mainImageUrl: string;
            };
        }[];
        totalItems: number;
    };
};

export default async function Shortlisted() {
    const res = await api.get<Data>(
        "/inventory/api/v1/inventory/getFavouriteListForUser",
        { params: { size: 100 } }
    );
    const data = res.data;

    return (
        <div className="bg-white text-foreground flex flex-col gap-6 rounded-xl border border-stroke-light p-6">
            <div className="flex items-center justify-between">
                <h4 className="leading-none text-brand-blue">
                    Shortlisted Vehicles
                </h4>
                <div className="flex items-center gap-2">
                    <HeartIcon className="w-5 h-5 text-brand-blue" />
                    <span className="text-brand-blue">
                        {data.totalItems} vehicle
                    </span>
                </div>
            </div>
            {data.totalItems === 0 ? (
                <div className="text-center py-12">
                    <HeartIcon className="h-16 w-16 text-gray-300 mb-4 mx-auto" />
                    <h3 className="text-lg text-gray-600 mb-2">
                        No vehicles shortlisted yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                        Start browsing and shortlist vehicles you&apos;re
                        interested in
                    </p>
                    <Link
                        href={"/vehicles"}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all bg-brand-blue text-white hover:bg-brand-blue/90 h-8 px-3 text-xs"
                    >
                        <SearchIcon className="w-4 h-4 mr-2" />
                        Browse Vehicles
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-6 lg:gap-x-5 xl:gap-x-6">
                    {data.content.map((item) => (
                        <div
                            key={item.id}
                            className="p-4 border border-stroke-light rounded-lg hover:shadow-md transition-shadow space-y-3"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <Image
                                    src={item?.inventory?.mainImageUrl}
                                    alt="car-img"
                                    width={90}
                                    height={70}
                                    className="object-cover rounded-md w-21"
                                />
                                <div className="flex-1">
                                    <h4 className="text-brand-blue font-medium mb-1">
                                        {item?.inventory?.year}{" "}
                                        {item?.inventory?.brand}{" "}
                                        {item?.inventory?.model}
                                    </h4>
                                    <p className="text-lg text-brand-blue font-semibold mb-1">
                                        {item?.inventory?.currency}{" "}
                                        {item.inventory.price}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {[
                                            item?.inventory?.city,
                                            item?.inventory?.country,
                                        ]
                                            .filter(Boolean)
                                            .join(" , ")}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span
                                            className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 gap-1 overflow-hidden border-transparent text-xs ${
                                                item?.inventory?.status ===
                                                "LIVE"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {item?.inventory?.status === "LIVE"
                                                ? "available"
                                                : "sold"}
                                        </span>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <EyeIcon className="h-3 w-3" />0
                                            viewing
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all bg-brand-blue text-white hover:bg-brand-blue/90 h-8 px-3 text-xs"
                                    href={`/vehicles/${item?.inventory?.id}`}
                                >
                                    View Details
                                </Link>
                                <ShortList
                                    iconCls="w-4 h-4"
                                    isLike={true}
                                    inventoryId={item?.id}
                                    onlyHeart={true}
                                    cls="justify-center bg-white h-8 rounded-md px-3 hover:bg-accent transition-all border border-brand-blue text-brand-blue"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
