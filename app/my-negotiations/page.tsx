import NegotiationList, { type Negotiation } from "@/components/negotiations/NegotiationList";
import { api } from "@/lib/api/server-request";
import { cookies } from "next/headers";
import { Suspense } from "react";
import LoadingNegotiationsPage from "./loading";

async function MyNegotiationsContent() {
    const cookieStore = await cookies();
    const tokenValue = cookieStore.get("userToken")?.value || "";
    const userData = await api.get<{ data: { roleType: string; userId: string } }>("/api/v1/auth/getUserInfoByToken", {
        isAuthRequired: false,
    });
    const resolvedUserId = userData.data?.userId || tokenValue;
    const data: Negotiation = {
        content: [],
        currentPage: 1,
        first: true,
        last: true,
        size: 10,
        totalItems: 0,
        totalPages: 1,
    };
    const roleType = userData.data?.roleType;

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl text-brand-blue mb-2">My Negotiations</h1>
                <p className="text-gray-600">Track your ongoing vehicle negotiations and agreements</p>
            </div>
            <NegotiationList data={data} userId={resolvedUserId} roleType={roleType} />
        </main>
    );
}

export default function MyNegotiations() {
    return (
        <Suspense fallback={<LoadingNegotiationsPage />}>
            <MyNegotiationsContent />
        </Suspense>
    );
}
