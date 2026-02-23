"use client";

import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import Input from "@/elements/Input";
import { AlertCircleIcon, CheckCircleIcon, SendIcon, Shield } from "@/components/Icons";
import Button from "@/elements/Button";
import Modal from "@/elements/Modal";
import { Client } from "@stomp/stompjs";
import { config } from "@/lib/config";
import { api } from "@/lib/api/client-request";
import { FetchError } from "@/lib/api/shared";

type PropsT = {
    conversationId: string;
    userId: string;
    initialChats?: Message[];
    negotiationInfo: NegotiationInfo;
    currency: string;
    role: string;
    sellerName?: string;
    sellerId?: string;
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

const getMessageTimestamp = (message: Message) => {
    const ts = Date.parse(message.createdAt || message.sentAt || "");
    return Number.isFinite(ts) ? ts : 0;
};

const mergeMessages = (current: Message[], incoming: Message[]) => {
    const byId = new Map<string, Message>();

    for (const msg of current) {
        if (!msg?.id) continue;
        byId.set(msg.id, msg);
    }

    for (const msg of incoming) {
        if (!msg?.id || byId.has(msg.id)) continue;
        byId.set(msg.id, msg);
    }

    return Array.from(byId.values())
        .sort((a, b) => getMessageTimestamp(a) - getMessageTimestamp(b))
        .slice(-500);
};

export default function Conversation(props: Readonly<PropsT>) {
    const { userId: senderId, conversationId, initialChats, negotiationInfo: initialNegotiationInfo } = props;
    const [currentUser, chattingWith, vehicleId] = conversationId.split("_");

    const [input, setInput] = useState("");
    const [typing, setTyping] = useState("");
    const [agreeAmount, setAgreeAmount] = useState("");
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [, setNegotiationInfo] = useState<NegotiationInfo>(initialNegotiationInfo);
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

    const loadPersistedProposalMessages = useCallback(async () => {
        try {
            const res = await fetch(`/api/negotiation-proposals?conversationId=${encodeURIComponent(conversationId)}`, {
                cache: "no-store",
            });
            if (!res.ok) return;

            const payload = await res.json();
            const raw = Array.isArray(payload?.messages) ? payload.messages : [];

            const parsed: Message[] = raw
                .map((item: unknown) => {
                    if (!item || typeof item !== "object") return null;
                    const record = item as Record<string, unknown>;
                    const id = typeof record.id === "string" ? record.id : "";
                    const content = typeof record.content === "string" ? record.content : "";
                    const msgConversationId = typeof record.conversationId === "string" ? record.conversationId : conversationId;
                    const sender = typeof record.senderId === "string" ? record.senderId : "system";
                    const name = typeof record.name === "string" ? record.name : "System";
                    const contentType = record.contentType === "price" || record.contentType === "chat" ? record.contentType : "info";
                    const createdAt = typeof record.createdAt === "string" ? record.createdAt : new Date().toISOString();
                    const sentAt = typeof record.sentAt === "string" ? record.sentAt : createdAt;

                    if (!id || !content) return null;
                    return {
                        id,
                        content,
                        senderId: sender,
                        conversationId: msgConversationId,
                        name,
                        contentType,
                        createdAt,
                        sentAt,
                    } as Message;
                })
                .filter((msg: Message | null): msg is Message => Boolean(msg));

            if (!parsed.length) return;
            shouldAutoScrollRef.current = true;
            setMessages((prev) => mergeMessages(prev, parsed));
        } catch {}
    }, [conversationId]);

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

    useEffect(() => {
        const initial = window.setTimeout(() => {
            loadPersistedProposalMessages();
        }, 0);
        const interval = window.setInterval(loadPersistedProposalMessages, 5000);
        return () => {
            window.clearTimeout(initial);
            window.clearInterval(interval);
        };
    }, [loadPersistedProposalMessages]);

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

    useEffect(() => {
        if (typeof window === "undefined") return;

        const handleProposalSubmitted = () => {
            loadPersistedProposalMessages();
        };

        window.addEventListener("proposalSubmitted", handleProposalSubmitted);
        return () => window.removeEventListener("proposalSubmitted", handleProposalSubmitted);
    }, [loadPersistedProposalMessages]);

    return (
        <section className="border border-stroke-light rounded-lg bg-white overflow-hidden flex flex-col h-full min-h-96">
            {/* Message History Header */}
            <div className="px-5 py-4 border-b border-stroke-light bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">Message History</h3>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
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

            {/* Chat Input */}
            <form action={sendMessage} className="p-4 border-t border-stroke-light flex gap-2">
                <Input
                    name="conversation"
                    type="textarea"
                    placeholder="Type a message..."
                    rows={2}
                    parentClassName="grow"
                    value={input}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleTyping(e.target.value)}
                    onKeyDown={handleKeyboardEvent}
                />
                <Button disabled={!input} type="submit" className="p-3" leftIcon={<SendIcon className="w-3.5 h-3.5" />} />
            </form>

            {/* OTP Modal */}
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
