import ListingModerationTab from "@/components/admin/ListingModerationTab";
import { api } from "@/lib/api/server-request";
import { getBrands, getFilters } from "@/lib/data";
import { type Data } from "@/components/admin/ListingModerationTab";

export default async function Listings() {
    const res = await api.get<{ data: Data }>("/inventory/api/v1/inventory/adminList", {
        params: { size: 10 },
    });

    const brandRes = getBrands();
    const filterRes = getFilters();
    return (
        <main>
            <ListingModerationTab data={res.data} brandRes={brandRes} filterRes={filterRes} />
        </main>
    );
}
