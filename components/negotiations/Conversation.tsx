"use client";

import { ChangeEvent, JSX, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import Input from "@/elements/Input";
import { AlertCircleIcon, CheckCircleIcon, DollerIcon, SendIcon, Shield } from "@/components/Icons";
import Button from "@/elements/Button";
import Modal from "@/elements/Modal";
import { Client } from "@stomp/stompjs";
import { config } from "@/lib/config";
import { api } from "@/lib/api/client-request";
import { FetchError } from "@/lib/api/shared";
import { useRouter } from "next/navigation";
import AddToCartButton from "@/components/buyer/AddToCardButton";

type PropsT = {
    statusBadge: JSX.Element;
    conversationId: string;
    userId: string;
    initialChats?: Message[];
    negotiationInfo: NegotiationInfo;
    currency: string;
    role: string;
};

export type Message = {
    senderId: string;
    content: string;
    id: string;
    conversationId: string;
    createdAt?: string;
    sentAt?: string;
    name: string;
    contentType: "chat" | "price" | "info";
};

export type NegotiationInfo = {
    started: string;
    lastActivity: string;
    status: string;
    agreedPrice: string;
    agreedPriceLocked: boolean;
    userPrice: string;
    userPriceLocked: boolean;
    roleType: string;
};

export default function Conversation(props: Readonly<PropsT>) {
    const { userId: senderId, conversationId, statusBadge, initialChats, currency, negotiationInfo: initialNegotiationInfo, role } = props;
    const [currentUser, chattingWith, vehicleId] = conversationId.split("_");

    const router = useRouter();

    const [input, setInput] = useState("");
    const [typing, setTyping] = useState("");
    const [agreeAmount, setAgreeAmount] = useState("");
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [negotiationInfo, setNegotiationInfo] = useState<NegotiationInfo>(initialNegotiationInfo);
    const [messages, setMessages] = useState<Message[]>(initialChats ?? []);
    const [otpError, setOtpError] = useState("");

    const scrollRef = useRef<HTMLDivElement | null>(null);
    const shouldAutoScrollRef = useRef(true);
    const lastTypingSentRef = useRef(0);
    const clientRef = useRef<Client>(null);

    const handleMessageSubcriptions = useCallback((message: string) => {
        let payload;
        try {
            payload = JSON.parse(message);
        } catch {
            payload = { content: message };
        }
        if (payload?.negotiationInfo) {
            setNegotiationInfo(payload.negotiationInfo);
        }
        shouldAutoScrollRef.current = true;
        setMessages((prev) => [...prev, payload].slice(-500));
    }, []);

    const handleTypingSubcriptions = useCallback(
        (body: string) => {
            let payload;
            try {
                payload = JSON.parse(body);
            } catch {
                payload = { content: body };
            }

            if (payload.userId === senderId) return;
            // ignore self typing
            setTyping(payload.name);
            setTimeout(() => setTyping(""), 2000);
        },
        [senderId]
    );

    const connectClient = useCallback(() => {
        const client = new Client({
            brokerURL: config.wsDomain,
            reconnectDelay: 2000,
            debug: () => {},
            onConnect: () => {
                // Subscribe to messages
                client.subscribe(`/topic/direct/${conversationId}`, (msg) => {
                    handleMessageSubcriptions(msg.body);
                });
                // Subscribe to typing indicators
                client.subscribe(`/topic/direct/${conversationId}/typing`, (msg) => {
                    handleTypingSubcriptions(msg.body);
                });
            },
        });
        client.activate();
        clientRef.current = client;
    }, [conversationId, handleTypingSubcriptions, handleMessageSubcriptions]);

    useEffect(() => {
        connectClient();

        return () => {
            if (clientRef.current) clientRef.current.deactivate();
        };
    }, [connectClient, currentUser]);

    useEffect(() => {
        // auto-scroll to bottom when new message arrives
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, typing]);

    const handleTyping = (value: string) => {
        setInput(value);
        if (!clientRef.current) return;
        const now = Date.now();
        if (now - lastTypingSentRef.current < 800) return;
        lastTypingSentRef.current = now;
        clientRef.current.publish({ destination: `/app/direct/${conversationId}/typing`, body: senderId });
    };

    const sendMessage = () => {
        const text = (input || "").trim();
        if (!clientRef.current || text === "") return;

        const payload = {
            content: text,
            senderId,
        };

        clientRef.current.publish({
            destination: `/app/direct/${currentUser}/${chattingWith}/${vehicleId}/${conversationId}/send`,
            body: JSON.stringify(payload),
        });
        setInput("");
    };

    const handleKeyboardEvent = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleAgreedAmount = async () => {
        // trigger otp
        const resp = await api.post<{ status: string }>("/chat/api/conversations/send-negotiation-otp");
        if (resp.status === "OK") {
            setOtpError("");
            setShowOtpModal(true);
        }
    };

    const verifyOtp = async (formData: FormData) => {
        const otp = formData.get("otp");
        const payload = { otp, conversationId, peerId: chattingWith, senderId: currentUser, price: agreeAmount, itemId: vehicleId };
        try {
            const resp = await api.post<{ data: NegotiationInfo }>("/chat/api/conversations/verify-negotiation-otp", { body: payload });
            setNegotiationInfo(resp.data);
            setShowOtpModal(false);
        } catch (error) {
            if ((error as FetchError).isFetchError) {
                setOtpError((error as FetchError<{ message: string }>)?.response?.data?.message || "Something went wrong. Please try again later.");
            } else {
                setOtpError("Something went wrong. Please try again later.");
            }
        }
    };

    const getPriceDisplay = () => {
        if (negotiationInfo?.agreedPriceLocked) {
            return (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        <span className="text-green-800 font-medium">Agreement Reached!</span>
                    </div>
                    <p className="text-green-700 text-sm mb-2">Both parties agreed on USD {negotiationInfo.agreedPrice}</p>
                    {role?.toLocaleLowerCase() === "buyer" ? <AddToCartButton vehicleId={vehicleId} isNegotiated={true} /> : <Button className="w-full mt-2">View Sale details</Button>}
                </div>
            );
        }
        if (negotiationInfo?.userPriceLocked)
            return (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-700 text-sm mb-2">You have agreed on USD {negotiationInfo.userPrice}</p>
                    <p className="text-green-600 text-sm">Waiting for other party to confirm</p>
                </div>
            );

        return (
            <form action={handleAgreedAmount} className="flex gap-2 items-end">
                <Input
                    label={`Your Proposed Amount USD`}
                    name="conversation"
                    type="number"
                    placeholder="Auto-calculated"
                    parentClassName="grow"
                    value={agreeAmount}
                    readOnly
                />
                <Button disabled={!agreeAmount} type="submit" className="p-3">
                    Submit
                </Button>
            </form>
        );
    };

    useEffect(() => {
        if (typeof window === "undefined") return;
        const readOffer = () => {
            try {
                const raw = window.localStorage.getItem("quoteBuilderOfferAmount");
                if (raw) setAgreeAmount(raw);
            } catch {}
        };
        readOffer();
        const onOfferUpdate = () => readOffer();
        window.addEventListener("quoteOfferUpdated", onOfferUpdate);
        return () => window.removeEventListener("quoteOfferUpdated", onOfferUpdate);
    }, []);

    return (
        <section>
            <div className="grid md:grid-cols-[1fr_300px] gap-6">
                <div className="border rounded-xl border-stroke-light self-start">
                    <h2 className="mb-3 p-4 text-brand-blue">Conversation</h2>
                    <div ref={scrollRef} className="h-64 p-4 overflow-y-auto mb-2 border-b border-stroke-light space-y-3">
                        <div className="flex justify-center">
                            <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm max-w-xs text-center">
                                <AlertCircleIcon className="h-4 w-4 inline mr-1 -mt-1" />
                                Negotiation started for this vehicle. Feel free to discuss price and terms.
                            </div>
                        </div>
                        {messages.map((msg) => (
                            <MessageContent senderId={senderId} key={msg.id} message={msg} />
                        ))}
                        {typing && <div className="italic text-sm text-gray-500">{typing} is typing...</div>}
                    </div>

                    <form action={sendMessage} className="p-4 flex gap-2">
                        <Input
                            name="conversation"
                            type="textarea"
                            placeholder="Type your message..."
                            rows={2}
                            parentClassName="grow"
                            value={input}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleTyping(e.target.value)}
                            onKeyDown={handleKeyboardEvent}
                        />
                        <Button disabled={!input} type="submit" className="p-3" leftIcon={<SendIcon className="w-3.5 h-3.5" />} />
                    </form>
                </div>
                <div className="space-y-6">
                    <div className="border p-6 text-brand-blue rounded-xl border-stroke-light">
                        <h4 className="flex gap-2 mb-6">
                            <DollerIcon className="w-4 h-6" />
                            Agreed Amount
                        </h4>
                        {getPriceDisplay()}
                    </div>
                </div>
            </div>
            <Modal isOpen={showOtpModal} onClose={() => setShowOtpModal(false)}>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-xs">
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-yellow-600" />
                        <span className="text-yellow-800 font-medium">OTP Verification Required</span>
                    </div>
                    <p className="text-yellow-700 text-sm mb-3">OTP sent to both buyer and seller. Enter your code below to confirm the negotiation.</p>
                    <form action={verifyOtp} className="space-y-3">
                        <Input
                            autoFocus
                            name="otp"
                            errors={[otpError]}
                            minLength={6}
                            autoComplete="one-time-code webauthn"
                            placeholder="Enter 6 digit otp"
                            label="Buyer OTP"
                            maxLength={6}
                            type="text"
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter the 6-digit code sent to your phone number</p>
                        <Button type="submit" className="w-full">
                            Verify &amp; Confirm
                        </Button>
                    </form>
                </div>
            </Modal>
        </section>
    );
}

const MessageContent = ({ message, senderId }: { message: Message; senderId: string }) => {
    const isPriceMessage = message.contentType === "price";
    const isInfoMessage = message.contentType === "info";
    const isChatMessage = message.contentType === "chat";

    const formatTime = (ts: string) => {
        const d = new Date(ts);
        if (Number.isNaN(d.getTime())) return "";

        return d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    if (isChatMessage) {
        return (
            <div className={`flex flex-col ${message.senderId === senderId ? "items-end" : "items-start"}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.senderId === senderId ? "bg-brand-blue text-white" : "bg-gray-100 text-gray-800"}`}>
                    <div className="text-xs opacity-80 mb-1">{message.name}</div>
                    <p>{message.content}</p>
                    <div className="text-[10px] opacity-70 mt-1">{formatTime(message.createdAt || message.sentAt || "")}</div>
                </div>
            </div>
        );
    }

    if (isInfoMessage) {
        return (
            <div className="flex justify-center">
                <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm max-w-xs text-center">
                    <AlertCircleIcon className="h-4 w-4 inline mr-1 -mt-1" />
                    {message.content}
                </div>
            </div>
        );
    }

    if (isPriceMessage) {
        return (
            <div className="flex justify-center">
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm max-w-xs text-center">
                    <CheckCircleIcon className="h-4 w-4 inline mr-1 -mt-1" />
                    {message.content}
                </div>
            </div>
        );
    }

    return <></>;
};
