import NegotiationList, { type Negotiation } from "@/components/negotiations/NegotiationList";
import { api } from "@/lib/api/server-request";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function MyNegotiations() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userToken")?.value || "";
    const resp = await api.get<{ data: Negotiation }>("/chat/api/negotiations", { params: { userId, size: 10 } });
    const data = resp.data;

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl text-brand-blue mb-2">My Negotiations</h1>
                <p className="text-gray-600">Track your ongoing vehicle negotiations and agreements</p>
            </div>
            {data?.content?.length > 0 ? (
                <NegotiationList data={data} userId={userId} />
            ) : (
                <div className="text-center text-gray-600 mt-20 p-8 rounded-lg border border-dashed border-gray-300">
                    <p className="mb-4">You have no negotiations at the moment.</p>
                    <p>
                        Browse{" "}
                        <Link className="text-brand-blue underline" href="/vehicles">
                            vehicles
                        </Link>{" "}
                        and start negotiating today!
                    </p>
                </div>
            )}
        </main>
    );
}
