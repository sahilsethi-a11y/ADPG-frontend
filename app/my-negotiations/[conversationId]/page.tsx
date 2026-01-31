import { ArrowLeftIcon } from "@/components/Icons";
import { NegotiationInfo, type Message } from "@/components/negotiations/Conversation";
import NegotiationClientWrapper from "@/components/negotiations/NegotiationClientWrapper";
import Link from "next/link";
import { cookies } from "next/headers";
import { api } from "@/lib/api/server-request";

type Vehicle = {
    id: string;
    brand: string;
    model: string;
    variant: string;
    currency: string;
    mainImageUrl: string;
    imageUrls: string[];
    price: number;
    status: string;
    year: string;
};

type Data = {
    vehicle: Vehicle;
    conversation: {
        chats: Message[];
    };
    user: {
        organisationName: string;
    };
    negotiationInfo: NegotiationInfo;
};

export default async function MyConversation({
    params,
    searchParams,
}: {
    params: Promise<{ conversationId: string }>;
    searchParams?: Promise<{ seller?: string }>;
}) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userToken")?.value || "";

    const userPromise = api.get<{ data: { roleType: string } }>("/api/v1/auth/getUserInfoByToken", { isAuthRequired: false });

    const { conversationId } = await params;
    const searchParamsResolved = await searchParams;
    const respPromise = api.get<{ data: Data }>(`/chat/api/conversations/messages/${conversationId}`, {
        params: { userId, page: 0, size: 100 },
    });

    const [resp, userData] = await Promise.all([respPromise, userPromise]);

    const vehicle = resp.data?.vehicle;
    const sellerQuery = typeof searchParamsResolved?.seller === "string" ? decodeURIComponent(searchParamsResolved.seller) : "";
    const sellerId = conversationId.split("_")[1] ?? "";

    return (
        <main className="container mx-auto px-4 py-8 max-w-7xl min-h-screen flex flex-col pb-32">
            <div className="flex md:items-center md:flex-row space-x-4 flex-col gap-4 items-start mb-8">
                <Link
                    title="Back to negotiations"
                    href="/my-negotiations"
                    className="rounded-lg hover:bg-accent md:px-2 hover:text-brand-blue flex items-center justify-center gap-2 text-xs py-2 text-brand-blue">
                    <ArrowLeftIcon className="h-3.5 w-3.5" /> Back to Conversations
                </Link>
            </div>

            {/* Main layout: Left column (items + conversation) + Right column (status + proposal) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                {/* Client Wrapper - Manages shared discount state */}
                <NegotiationClientWrapper
                    negotiationStatus={resp.data?.negotiationInfo?.status}
                    negotiationInfo={resp.data?.negotiationInfo}
                    initialChats={resp.data?.conversation?.chats ?? []}
                    currency={vehicle?.currency || "USD"}
                    sellerName={sellerQuery}
                    sellerId={sellerId}
                    userId={userId}
                    role={userData.data?.roleType}
                    conversationId={conversationId}
                    vehicleId={vehicle?.id}
                />
            </div>
        </main>
    );
}
