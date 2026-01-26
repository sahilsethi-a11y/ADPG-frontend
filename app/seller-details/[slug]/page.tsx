import { ArrowLeftIcon, MapPinIcon, Shield } from "@/components/Icons";
import Image from "@/elements/Image";
import Link from "next/link";
import Tabbin from "@/components/Tabbin";
import VehicleList from "@/components/single-seller/VehicleList";
import About, { type AboutData } from "@/components/single-seller/About";
import { api } from "@/lib/api/server-request";
import { Data as VehicleData } from "@/app/vehicles/page";
import { getBrands, getFilters } from "@/lib/data";

type Data = {
    userInformation: {
        totalInventory: string;
        locationAttribute: {
            countryCode: string;
            country: string;
            city: string;
            district: string;
        };
        organizationName: string;
    };
    about: AboutData;
};

export default async function page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const res = await api.get<{ data: Data }>("/inventory/api/v1/inventory/getInventorySellerDealerInfo", {
        params: {
            userId: slug,
        },
        isAuthRequired: false,
    });

    const vehicleData = api.get<{ data: VehicleData }>("/inventory/api/v1/inventory/inventoryListForUser", {
        params: {
            userId: slug,
            sortBy: "year",
            sortOrder: "desc",
        },
    });

    const [userInfo, vehicles] = await Promise.all([res, vehicleData]);
    const data = userInfo.data;
    const brandRes = getBrands();
    const filterRes = getFilters();

    const tabs = [
        {
            label: "vehicles",
            panel: (
                <VehicleList
                    userId={slug}
                    brandRes={brandRes}
                    filterRes={filterRes}
                    initialData={vehicles.data.content}
                    currentPage={vehicles.data.currentPage}
                    totalItems={vehicles.data.totalElements}
                />
            ),
        },
        {
            label: "About",
            panel: <About data={data.about} />,
        },
    ];

    return (
        <main>
            <div className="min-h-screen bg-gray-50">
                <div className="relative h-64 bg-brand-blue">
                    <Image width={1440} height={224} alt="banner-img" src={data.about.bannerImage} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30"></div>
                    <Link
                        href={"/vehicles"}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all shrink-0 h-9 px-4 py-2 absolute top-4 left-4 text-white hover:bg-white/10">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back to All Vehicles
                    </Link>
                </div>
                <div className="bg-white border-b">
                    <div className="container mx-auto px-4 py-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            <div className="flex items-center gap-4 flex-col md:flex-row">
                                <span className="relative flex size-10 shrink-0 overflow-hidden rounded-full w-20 h-20 border-4 border-white shadow-lg">
                                    <Image width={62} height={62} alt="Luxury Motors UAE" src={data.about?.bannerImage} className="aspect-square size-full" />
                                </span>
                                <div>
                                    <div className="md:flex md:items-center gap-2 mb-4 md:mb-2">
                                        <h1 className="text-2xl font-bold text-brand-blue inline md:block">{data?.about?.businessCompanyName}</h1>
                                        <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 transition-all overflow-hidden border-transparent bg-green-100 text-green-800">
                                            <Shield className="h-3 w-3 mr-1" />
                                            Verified
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 border-brand-blue text-brand-blue">
                                            Authorized Dealer
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <MapPinIcon className="h-4 w-4" />
                                            {[data?.userInformation?.locationAttribute?.district, data?.userInformation?.locationAttribute?.city, data?.userInformation?.locationAttribute?.country]
                                                .filter(Boolean)
                                                .join(" , ")}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-6 md:ml-auto">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-brand-blue">{data.userInformation.totalInventory}</div>
                                    <div className="text-sm text-gray-600">Vehicles</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col gap-2 space-y-6">
                        <Tabbin items={tabs} />
                    </div>
                </div>
            </div>
        </main>
    );
}
