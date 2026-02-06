"use client";

import Button from "@/elements/Button";
import { MessageSquareIcon } from "@/components/Icons";
import { api } from "@/lib/api/client-request";
import message from "@/elements/message";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type User = {
    name: string;
    username: string;
    email: string;
    roleType: string;
    userId: string;
    otpVerified: boolean;
};

export default function NegotiatePriceButton({ vehicleId, peerId }: Readonly<{ vehicleId: string; peerId: string }>) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const pathname = usePathname();

    const createConversationId = (buyerId: string) => {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
            return `${buyerId}_${peerId}_${vehicleId}_${crypto.randomUUID()}`;
        }
        return `${buyerId}_${peerId}_${vehicleId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    };

    const handleNegotiatePrice = async () => {
        try {
            setLoading(true);
            const userData = await api.get<{ data: User }>("/api/v1/auth/getUserInfoByToken");

            if (userData.data?.roleType?.toLocaleLowerCase() === "buyer") {
                const conversationId = createConversationId(userData.data.userId);
                fetch("/api/negotiation-index", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        item: {
                            conversationId,
                            buyerId: userData.data.userId,
                            sellerId: peerId,
                            itemId: vehicleId,
                            roleType: "buyer",
                        },
                    }),
                }).catch(() => {});
                router.push(`/my-negotiations/${conversationId}`);
            } else {
                message.info("Only buyers can negotiate the price.");
                setDisabled(true);
            }
        } catch {
            message.info("Please login to negotiate the price.");
            router.push("/login?redirectUrl=" + encodeURIComponent(pathname));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button variant="outline" disabled={disabled} className="w-full" loading={loading} onClick={() => handleNegotiatePrice()}>
            <MessageSquareIcon className="w-4 h-4 mr-2" />
            Start quotation
        </Button>
    );
}
