import { NextResponse } from "next/server";

const baseUrl = process.env.NEXT_PUBLIC_JSONBIN_BASE_URL || "https://api.jsonbin.io/v3";
const masterKey = process.env.JSONBIN_MASTER_KEY || process.env.NEXT_PUBLIC_JSONBIN_MASTER_KEY;
const binId = process.env.JSONBIN_BIN_ID;

type ProposalRecord = {
    proposalsByConversation?: Record<string, unknown>;
    negotiationsByConversation?: Record<string, unknown>;
};

const parseConversationId = (conversationId: string) => {
    const parts = conversationId.split("_");
    if (parts.length < 4) {
        return { buyerId: "", sellerId: "", itemId: "" };
    }
    return {
        buyerId: parts[0] || "",
        sellerId: parts[1] || "",
        itemId: parts[2] || "",
    };
};

async function readBin(): Promise<ProposalRecord> {
    if (!masterKey || !binId) {
        throw new Error("Missing JSONBIN_MASTER_KEY or JSONBIN_BIN_ID");
    }
    const res = await fetch(`${baseUrl}/b/${binId}/latest`, {
        headers: {
            "X-Master-Key": masterKey,
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("JSONBin read error:", res.status, res.statusText, text);
        throw new Error(`JSONBin read failed: ${res.status} ${res.statusText} ${text}`);
    }

    const data = await res.json();
    return data?.record ?? {};
}

async function writeBin(record: ProposalRecord) {
    if (!masterKey || !binId) {
        throw new Error("Missing JSONBIN_MASTER_KEY or JSONBIN_BIN_ID");
    }
    const res = await fetch(`${baseUrl}/b/${binId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-Master-Key": masterKey,
        },
        body: JSON.stringify(record),
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("JSONBin write error:", res.status, res.statusText, text);
        throw new Error(`JSONBin write failed: ${res.status} ${res.statusText} ${text}`);
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get("conversationId");
        const idsParam = searchParams.get("ids");
        const ids = idsParam
            ? idsParam
                  .split(",")
                  .map((id) => id.trim())
                  .filter(Boolean)
            : [];

        if (ids.length > 0) {
            const record = await readBin();
            const proposalsByConversation = record?.proposalsByConversation ?? {};
            const result: Record<string, unknown> = {};
            for (const id of ids) {
                if ((proposalsByConversation as Record<string, unknown>)[id]) {
                    result[id] = (proposalsByConversation as Record<string, unknown>)[id];
                }
            }
            return NextResponse.json({ proposals: result });
        }
        if (!conversationId) {
            return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
        }

        const record = await readBin();
        const proposalsByConversation = record?.proposalsByConversation ?? {};
        const proposal = (proposalsByConversation as Record<string, unknown>)[conversationId] ?? null;
        const negotiationsByConversation = record?.negotiationsByConversation ?? {};
        const negotiationEntry = (negotiationsByConversation as Record<string, unknown>)[conversationId];
        const negotiationStatus =
            typeof negotiationEntry === "object" && negotiationEntry !== null && typeof (negotiationEntry as Record<string, unknown>).status === "string"
                ? ((negotiationEntry as Record<string, unknown>).status as string)
                : null;

        return NextResponse.json({ proposal, negotiationStatus });
    } catch (err) {
        console.error("Negotiation proposals GET error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as {
            conversationId?: string;
            proposal?: Record<string, unknown> & { status?: string };
        };

        if (!body?.conversationId || !body?.proposal) {
            return NextResponse.json({ error: "conversationId and proposal are required" }, { status: 400 });
        }

        const record = await readBin();
        const proposalsByConversation = {
            ...(record?.proposalsByConversation ?? {}),
            [body.conversationId]: body.proposal,
        };

        const existingNegotiationEntryRaw = (record?.negotiationsByConversation ?? {})[body.conversationId];
        const existingNegotiationEntry =
            typeof existingNegotiationEntryRaw === "object" && existingNegotiationEntryRaw !== null
                ? (existingNegotiationEntryRaw as Record<string, unknown>)
                : {};
        const parsed = parseConversationId(body.conversationId);
        const now = new Date().toISOString();
        const proposalStatus = typeof body.proposal.status === "string" ? body.proposal.status : undefined;
        const existingStatus = typeof existingNegotiationEntry["status"] === "string" ? existingNegotiationEntry["status"] : undefined;
        const existingStartedAt = typeof existingNegotiationEntry["startedAt"] === "string" ? existingNegotiationEntry["startedAt"] : undefined;
        const existingBuyerId = typeof existingNegotiationEntry["buyerId"] === "string" ? existingNegotiationEntry["buyerId"] : "";
        const existingSellerId = typeof existingNegotiationEntry["sellerId"] === "string" ? existingNegotiationEntry["sellerId"] : "";
        const existingItemId = typeof existingNegotiationEntry["itemId"] === "string" ? existingNegotiationEntry["itemId"] : "";
        const buyerId = existingBuyerId || parsed.buyerId;
        const sellerId = existingSellerId || parsed.sellerId;
        const itemId = existingItemId || parsed.itemId;
        const existingUserId = typeof existingNegotiationEntry["userId"] === "string" ? existingNegotiationEntry["userId"] : "";
        const existingPeerId = typeof existingNegotiationEntry["peerId"] === "string" ? existingNegotiationEntry["peerId"] : "";
        const existingRoleType = typeof existingNegotiationEntry["roleType"] === "string" ? existingNegotiationEntry["roleType"] : "";
        const inferredRoleType =
            proposalStatus === "seller_countered" || proposalStatus === "seller_accepted" ? "seller" : "buyer";
        const userId = existingUserId || (inferredRoleType === "buyer" ? buyerId : sellerId);
        const peerId = existingPeerId || (inferredRoleType === "buyer" ? sellerId : buyerId);
        const negotiationsByConversation = {
            ...(record?.negotiationsByConversation ?? {}),
            [body.conversationId]: {
                ...existingNegotiationEntry,
                conversationId: body.conversationId,
                buyerId,
                sellerId,
                itemId,
                userId,
                peerId,
                roleType: existingRoleType || inferredRoleType,
                status: proposalStatus || existingStatus || "ongoing",
                startedAt: existingStartedAt || now,
                updatedAt: now,
            },
        };

        const latestRecord = await readBin();
        const latestProposals = latestRecord?.proposalsByConversation ?? {};
        const latestNegotiations = latestRecord?.negotiationsByConversation ?? {};

        await writeBin({
            ...latestRecord,
            proposalsByConversation: {
                ...latestProposals,
                ...proposalsByConversation,
            },
            negotiationsByConversation: {
                ...latestNegotiations,
                ...negotiationsByConversation,
            },
        });

        return NextResponse.json({ status: "OK", proposalStatus: proposalStatus || "ongoing" });
    } catch (err) {
        console.error("Negotiation proposals POST error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
