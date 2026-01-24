import InventoryTab, { Data } from "@/components/seller/InventoryTab";
import { api } from "@/lib/api/server-request";
import { getBrands, getFilters } from "@/lib/data";

export default async function Inventory() {
    const data = api.get<{ data: Data }>("/inventory/api/v1/inventory/getAllInventoryListForUser", { params: { size: 10 } });
    const brandRes = getBrands();
    const filterRes = getFilters();
    const [brandData, filterData, res] = await Promise.all([brandRes, filterRes, data]);

    return (
        <main>
            <InventoryTab data={res.data} filterData={filterData.data} brands={brandData.data} />
        </main>
    );
}
