import { ArrowLeftIcon } from "@/components/Icons";
import Conversation, { NegotiationInfo, type Message } from "@/components/negotiations/Conversation";
import NegotiationQuotePanelLocal from "@/components/negotiations/NegotiationQuotePanelLocal";
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
    searchParams?: { seller?: string };
}) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userToken")?.value || "";

    const userPromise = api.get<{ data: { roleType: string } }>("/api/v1/auth/getUserInfoByToken", { isAuthRequired: false });

    const { conversationId } = await params;
    const respPromise = api.get<{ data: Data }>(`/chat/api/conversations/messages/${conversationId}`, {
        params: { userId, page: 0, size: 100 },
    });

    const [resp, userData] = await Promise.all([respPromise, userPromise]);

    const vehicle = resp.data?.vehicle;
    const sellerQuery = typeof searchParams?.seller === "string" ? decodeURIComponent(searchParams.seller) : "";
    const sellerId = conversationId.split("_")[1] ?? "";
    return (
        <main className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex md:items-center md:flex-row space-x-4 flex-col gap-4 items-start mb-6">
                <Link
                    title="Back to negotiations"
                    href="/my-negotiations"
                    className="rounded-lg hover:bg-accent md:px-2 hover:text-brand-blue flex items-center justify-center gap-2 text-xs py-2 text-brand-blue">
                    <ArrowLeftIcon className="h-3.5 w-3.5" /> Back to Conversations
                </Link>
            </div>
            <div className="flex items-center justify-between mb-4">
                <div className="text-brand-blue text-lg font-semibold">Negotiation</div>
                <StatusBadge status={resp.data?.negotiationInfo?.status} />
            </div>
            {sellerQuery || sellerId ? <NegotiationQuotePanelLocal sellerName={sellerQuery} sellerId={sellerId} /> : null}
            <Conversation
                negotiationInfo={resp.data?.negotiationInfo}
                initialChats={resp.data?.conversation?.chats ?? []}
                userId={userId}
                role={userData.data?.roleType}
                conversationId={conversationId}
                statusBadge={<StatusBadge status={resp.data?.negotiationInfo?.status} />}
                currency={vehicle.currency}
            />
        </main>
    );
}

const StatusBadge = ({ status }: Readonly<{ status: string }>) => {
    if (status?.toLocaleLowerCase() === "ongoing")
        return (
            <div className="flex gap-2 items-center text-blue-800">
                <div className="text-xs py-0.5 px-2 rounded-md bg-blue-100">Ongoing</div>
            </div>
        );

    if (status?.toLocaleLowerCase() === "otpPending")
        return (
            <div className="flex gap-2 items-center text-yellow-600">
                <div className="text-xs py-0.5 px-2 rounded-md bg-yellow-100">OTP Pending</div>
            </div>
        );
    if (status?.toLocaleLowerCase() === "agreed")
        return (
            <div className="flex gap-2 items-center text-green-800">
                <div className="text-xs py-0.5 px-2 rounded-md bg-green-100">Agreed</div>
            </div>
        );

    return <></>;
};
