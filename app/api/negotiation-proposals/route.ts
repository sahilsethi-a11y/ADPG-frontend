import { NextResponse } from "next/server";

const baseUrl = process.env.NEXT_PUBLIC_JSONBIN_BASE_URL || "https://api.jsonbin.io/v3";
const masterKey = process.env.JSONBIN_MASTER_KEY || process.env.NEXT_PUBLIC_JSONBIN_MASTER_KEY;
const binId = process.env.JSONBIN_BIN_ID;

type ProposalRecord = {
    proposalsByConversation?: Record<string, unknown>;
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

        return NextResponse.json({ proposal });
    } catch (err) {
        console.error("Negotiation proposals GET error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as {
            conversationId?: string;
            proposal?: Record<string, unknown>;
        };

        if (!body?.conversationId || !body?.proposal) {
            return NextResponse.json({ error: "conversationId and proposal are required" }, { status: 400 });
        }

        const record = await readBin();
        const proposalsByConversation = {
            ...(record?.proposalsByConversation ?? {}),
            [body.conversationId]: body.proposal,
        };

        await writeBin({
            ...record,
            proposalsByConversation,
        });

        return NextResponse.json({ status: "OK" });
    } catch (err) {
        console.error("Negotiation proposals POST error:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
