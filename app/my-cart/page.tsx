import CartPageClient from "@/components/buyer/CartPageClient";
import { type Cart } from "@/components/buyer/CartList";
import { api } from "@/lib/api/server-request";

export default async function MyCart() {
    const res = await api.get<{ data: Cart[] }>("/inventory/api/v1/inventory/getUserCart");

    return (
        <main className="container mx-auto px-4 lg:px-6 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl text-brand-blue">My Cart</h1>
            </div>
            <CartPageClient list={res.data ?? []} />
        </main>
    );
}
