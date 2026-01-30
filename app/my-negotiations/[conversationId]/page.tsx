import { ArrowLeftIcon } from "@/components/Icons";
import { NegotiationInfo, type Message } from "@/components/negotiations/Conversation";
import NegotiationClientWrapper from "@/components/negotiations/NegotiationClientWrapper";
import SellerProposalReview from "@/components/negotiations/SellerProposalReview";
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
    searchParams?: Promise<{ seller?: string; view?: string }>;
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

    // Check if this is a seller view (toggle with query param for now)
    const isSellerView = searchParamsResolved?.view === "seller";

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

            {/* SELLER VIEW */}
            {isSellerView ? (
                <SellerProposalReviewWrapper
                    sellerId={sellerId}
                    sellerName={sellerQuery}
                    currency={vehicle.currency}
                    negotiationInfo={resp.data?.negotiationInfo}
                />
            ) : (
                <>
                    {/* BUYER VIEW - Main layout: Left column (items + conversation) + Right column (status + proposal) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                        {/* Status Card - Above Right Column */}
                        <div className="lg:col-span-3">
                            <div className="border border-stroke-light rounded-lg p-5 bg-white shadow-sm mb-6 lg:mb-0 lg:col-span-1">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-gray-900">Status</h3>
                                    <StatusBadge status={resp.data?.negotiationInfo?.status} />
                                </div>
                                <p className="text-sm text-gray-600">
                                    {getStatusMessage(resp.data?.negotiationInfo?.status)}
                                </p>
                            </div>
                        </div>

                        {/* Client Wrapper - Manages shared discount state */}
                        <NegotiationClientWrapper
                            negotiationStatus={resp.data?.negotiationInfo?.status}
                            negotiationInfo={resp.data?.negotiationInfo}
                            initialChats={resp.data?.conversation?.chats ?? []}
                            currency={vehicle.currency}
                            sellerName={sellerQuery}
                            sellerId={sellerId}
                            userId={userId}
                            role={userData.data?.roleType}
                            conversationId={conversationId}
                        />
                    </div>
                </>
            )}
        </main>
    );
}

const getStatusMessage = (status?: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "ongoing") return "Waiting for a proposal to be submitted.";
    if (statusLower === "otppending") return "OTP verification pending. Check your email.";
    if (statusLower === "agreed") return "Negotiation completed successfully!";
    return "Negotiation in progress...";
};

const StatusBadge = ({ status }: Readonly<{ status: string }>) => {
    if (status?.toLocaleLowerCase() === "ongoing")
        return (
            <div className="flex gap-2 items-center">
                <span className="text-xs py-1 px-2.5 rounded-full bg-blue-100 text-blue-700 font-medium">Idle</span>
            </div>
        );

    if (status?.toLocaleLowerCase() === "otpPending")
        return (
            <div className="flex gap-2 items-center">
                <span className="text-xs py-1 px-2.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">Pending</span>
            </div>
        );
    if (status?.toLocaleLowerCase() === "agreed")
        return (
            <div className="flex gap-2 items-center">
                <span className="text-xs py-1 px-2.5 rounded-full bg-green-100 text-green-700 font-medium">Accepted</span>
            </div>
        );

    return <></>;
};

// Seller View Wrapper - Client Component
function SellerProposalReviewWrapper({
    sellerId,
    sellerName,
    currency,
    negotiationInfo,
}: {
    sellerId: string;
    sellerName: string;
    currency: string;
    negotiationInfo?: NegotiationInfo;
}) {
    // Mock buckets data - in real scenario, fetch from API
    const mockBuckets = [
        {
            key: "toyota-land-cruiser",
            brand: "2022",
            model: "Toyota",
            variant: "Land Cruiser",
            color: "White",
            year: 2022,
            condition: "Good",
            bodyType: "SUV",
            sellerCompany: "Desert Motors",
            sellerId,
            unitCount: 3,
            unitPrice: 77850,
            currency,
            bucketTotal: 233550,
            mainImageUrl: "https://images.unsplash.com/photo-1606611013016-969c19d14444?w=400&h=300&fit=crop",
            location: "Dubai",
            items: [],
        },
        {
            key: "nissan-patrol",
            brand: "2023",
            model: "Nissan",
            variant: "Patrol Platinum",
            color: "White",
            year: 2023,
            condition: "Excellent",
            bodyType: "SUV",
            sellerCompany: "Desert Motors",
            sellerId,
            unitCount: 1,
            unitPrice: 72000,
            currency,
            bucketTotal: 72000,
            mainImageUrl: "https://images.unsplash.com/photo-1606611013016-969c19d14444?w=400&h=300&fit=crop",
            location: "Dubai",
            items: [],
        },
    ];

    // Mock proposal data
    const mockProposalData = {
        discountPercent: 0,
        originalTotal: 305550,
        finalPrice: 305550,
        downpaymentPercent: 10,
        downpaymentAmount: 30555,
        remainingBalance: 274995,
        buyerName: "JOHN BUYER",
        timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        }),
    };

    return (
        <SellerProposalReview buckets={mockBuckets} proposalData={mockProposalData} currency={currency} />
    );
}
