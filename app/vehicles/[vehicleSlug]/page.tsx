import { ArrowLeftIcon, FileIcon } from "@/components/Icons";
import Link from "next/link";
import ImageCarousel from "@/components/vehicle-details/ImageCarousel";
import ShortList from "@/components/vehicle-details/ShortList";
import QRShare from "@/components/vehicle-details/QRShare";
import FeaturesTable from "@/components/vehicle-details/FeaturesTable";
import VehicleSpecs from "@/components/vehicle-details/VehicleSpecs";
import VehicleViewTracker from "@/components/vehicle-details/VehicleViewTracker";
import VehicleDetails, { type VehicleDetailsData } from "@/components/vehicle-details/VehicleDetails";
import { api } from "@/lib/api/server-request";
import type { Specification } from "@/components/vehicle-details/VehicleSpecs";
import AddToCartButton from "@/components/buyer/AddToCardButton";
import PriceBadge from "@/elements/PriceBadge";
import Button from "@/elements/Button";
import { formatPrice } from "@/lib/utils";

type Data = {
    id: string;
    imageUrls: string[];
    name: string;
    price: string;
    description: string;
    currency: string;
    condition: string;
    features: string[];
    sellerInformation: {
        id: string;
        name: string;
        address: string;
    };
    vehicleDetails: VehicleDetailsData[];
    specificationIcons: Specification[];
    isFavourite: boolean;
};

export default async function page({ params }: { params: Promise<{ vehicleSlug: string }> }) {
    const { vehicleSlug } = await params;

    const res = await api.get<{ data: Data }>("/inventory/api/v1/inventory/getInventoryDetails", { params: { id: vehicleSlug } });
    const data = res.data;
    const storageItem = {
        id: data.id,
        name: data.name,
        year: 0,
        location: data.sellerInformation?.address || "",
        quantity: 1,
        price: Number(data.price) || 0,
        currency: data.currency || "USD",
        mainImageUrl: data.imageUrls?.[0] || "",
        sellerCompany: data.sellerInformation?.name || "Unknown Seller",
        sellerId: data.sellerInformation?.id,
        bucketKey: [data.name, data.price, data.currency].join("|"),
        isSelected: true,
    };

    const vin =
        (data as any)?.vehicleDetails?.[0]?.vin ??
        (data as any)?.vin ??
        (data as any)?.VIN ??
        (data as any)?.inventory?.vin ??
        (data as any)?.inventory?.VIN ??
        "";

    return (
        <main className="container mx-auto px-4 lg:px-6">
            <VehicleViewTracker vehicleId={vehicleSlug} />
            <div className="min-h-screen bg-white">
                <div className="bg-white border-b py-4 border-gray-100">
                    <Link
                        href={"/vehicles"}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white px-6 h-9 py-2 border bg-white">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back to Vehicle Listings
                    </Link>
                </div>
                {data && (
                    <div className="py-15">
                        <div className="lg:grid lg:grid-cols-[5fr_2fr] gap-15 items-start">
                            <div className="">
                                <div className="space-y-[21px]">
                                    <ImageCarousel images={data.imageUrls} />
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {data?.condition && (
                                            <span className="font-medium w-fit whitespace-nowrap bg-white text-gray-700 border border-gray-300 text-sm px-3 py-1.5 rounded-md shadow-sm">
                                                {data.condition}
                                            </span>
                                        )}
                                        <span
                                            className={`font-medium w-fit whitespace-nowrap border  text-sm px-3 py-1.5 rounded-md ${
                                                data.vehicleDetails.length > 1 ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-50 text-gray-600 border-gray-300"
                                            }`}>
                                            {data.vehicleDetails.length > 1 ? "Bulk Purchase available" : "Bulk Purchase unavailable"}
                                        </span>
                                        <span className="font-medium w-fit whitespace-nowrap border border-transparent bg-brand-blue text-white text-sm px-3 py-1.5 rounded-md">Verified Dealer</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-6">
                                        <ShortList inventoryId={vehicleSlug} isLike={data?.isFavourite} />
                                        <QRShare vehicleUrl={`/vehicles/${vehicleSlug}`} />
                                    </div>
                                    <div className="space-y-6">
                                        <VehicleSpecs data={data.specificationIcons} />
                                        <div className="bg-white rounded-xl border border-[rgba(36,39,44,0.1)] p-4 md:p-7.5">
                                            <h3 className="text-xl font-semibold text-black mb-4">Description</h3>
                                            <p className="text-[15px] text-[#4d4f53] leading-5.5">{data.description}</p>
                                        </div>
                                        <VehicleDetails data={data.vehicleDetails} />
                                        {data.features.length > 0 && <FeaturesTable data={data.features} />}
                                    </div>
                                </div>
                            </div>
                            <div className="w-full  space-y-6">
                                <div className="bg-white rounded-xl border border-stroke-light p-7.5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-right flex gap-1 items-center">
                                            <div className="text-[30px] font-bold text-brand-blue">{formatPrice(data.price, data.currency)}</div>
                                            <PriceBadge />
                                        </div>
                                    </div>
                                    <div className="text-[16px] text-[#4d4f53] mb-6">{data.name}</div>
                                    <div className="mb-6 flex flex-col gap-3">
                                        <AddToCartButton vehicleId={vehicleSlug} storageItem={storageItem} sellerId={data.sellerInformation.id} sellerCompany={data.sellerInformation.name} />
                                        {vin ? (
                                            <a
                                                href={`https://report.adpgauto.com/${encodeURIComponent(vin)}`}
                                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all shrink-0 outline-none h-9 px-4 py-2 w-full border border-brand-blue text-gray-800 hover:bg-brand-blue hover:text-white"
                                                rel="noopener noreferrer">
                                                <FileIcon className="w-4 h-4" />
                                                View Inspection Report
                                            </a>
                                        ) : (
                                            <Button variant="outline" className="w-full" disabled>
                                                <FileIcon className="w-4 h-4 mr-2" />
                                                View Inspection Report
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <SellerCard sellerInfo={data.sellerInformation} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

const SellerCard = ({
    sellerInfo,
}: Readonly<{
    sellerInfo: {
        name: string;
        address: string;
        id: string;
    };
}>) => {
    return (
        <div className="bg-white rounded-xl border border-stroke-light p-7.5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-brand-blue">Seller Information</h3>
                <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1  text-brand-blue border-brand-blue">
                    Verified
                </span>
            </div>
            <div className="space-y-3">
                <div>
                    <div className="text-base font-semibold text-black">{sellerInfo.name}</div>
                    <div className="text-xs text-[#4d4f53]">{sellerInfo.address}</div>
                </div>
                <Link
                    href={`/seller-details/${sellerInfo.id}`}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all shrink-0 outline-none h-9 px-4 py-2 w-full mt-4 border border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white">
                    View Seller Profile
                </Link>
            </div>
        </div>
    );
};
