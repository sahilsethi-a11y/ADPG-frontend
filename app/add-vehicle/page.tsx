import VehicleForm, { FormState } from "@/components/add-vehicle/VehicleForm";
import { ArrowLeftIcon } from "@/components/Icons";
import Link from "next/link";
import { getBrands, getFilters } from "@/lib/data";
import { api } from "@/lib/api/server-request";

const data = {
    title: "Add New Vehicle",
    subtitle: "Create a new vehicle listing for the marketplace",
};

export default async function AddVehicle({ searchParams }: Readonly<{ searchParams: Promise<{ id: string; step: string }> }>) {
    const { id, step } = await searchParams;

    const res = api.get<{ data: FormState }>("/inventory/api/v1/inventory/getInventoryById", {
        params: {
            vehicleId: id,
        },
    });

    const brandRes = getBrands();
    const filterRes = getFilters();
    const resArr = await Promise.allSettled([brandRes, filterRes, ...(id ? [res] : [])]);
    const brandData = resArr[0].status === "fulfilled" ? resArr[0].value : null;
    const filterData = resArr[1].status === "fulfilled" ? resArr[1].value : null;
    const data = resArr[2]?.status === "fulfilled" ? resArr[2].value : null;

    return (
        <main>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <VehicleForm step={step} topSection={<TopSection />} filterData={filterData?.data} intialData={data?.data} brands={brandData?.data} />
            </div>
        </main>
    );
}

const TopSection = () => (
    <div className="flex md:items-center md:flex-row space-x-4 flex-col gap-4 items-start">
        <Link title="Back to Login" href="/seller/dashboard" className="rounded-lg hover:bg-accent md:px-2 hover:text-brand-blue flex items-center justify-center gap-2 text-xs py-2 text-brand-blue">
            <ArrowLeftIcon className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
        <div>
            <h1 className="text-xl text-brand-blue ">{data.title}</h1>
            <p className="text-muted-foreground text-sm">{data.subtitle}</p>
        </div>
    </div>
);
