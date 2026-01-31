import { NextResponse } from "next/server";

const baseUrl = process.env.NEXT_PUBLIC_JSONBIN_BASE_URL || "https://api.jsonbin.io/v3";
const masterKey = process.env.JSONBIN_MASTER_KEY || process.env.NEXT_PUBLIC_JSONBIN_MASTER_KEY;
const binId = process.env.JSONBIN_BIN_ID;

type RecordShape = {
    proposalsByConversation?: Record<string, unknown>;
    negotiationsByConversation?: Record<string, unknown>;
};

async function readBin(): Promise<RecordShape> {
    if (!masterKey || !binId) {
        throw new Error("Missing JSONBIN_MASTER_KEY (or NEXT_PUBLIC_JSONBIN_MASTER_KEY) or JSONBIN_BIN_ID");
    }
    const res = await fetch(`${baseUrl}/b/${binId}/latest`, {
        headers: {
            "X-Master-Key": masterKey,
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`JSONBin read failed: ${res.status} ${res.statusText} ${text}`);
    }

    const data = await res.json();
    return data?.record ?? {};
}

async function writeBin(record: RecordShape) {
    if (!masterKey || !binId) {
        throw new Error("Missing JSONBIN_MASTER_KEY (or NEXT_PUBLIC_JSONBIN_MASTER_KEY) or JSONBIN_BIN_ID");
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
        throw new Error(`JSONBin write failed: ${res.status} ${res.statusText} ${text}`);
    }
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as {
            items?: Array<Record<string, unknown>>;
            item?: Record<string, unknown>;
        };

        const items = body?.items ?? (body?.item ? [body.item] : []);
        if (!items.length) {
            return NextResponse.json({ error: "items is required" }, { status: 400 });
        }

        const record = await readBin();
        const existing = record?.negotiationsByConversation ?? {};
        const next = { ...existing };

        for (const item of items) {
            const conversationId = item?.conversationId as string | undefined;
            if (!conversationId) continue;
            next[conversationId] = {
                ...(next as Record<string, unknown>)[conversationId],
                ...item,
                startedAt: (next as Record<string, any>)[conversationId]?.startedAt ?? new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
        }

        await writeBin({
            ...record,
            negotiationsByConversation: next,
        });

        return NextResponse.json({ status: "OK" });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const role = searchParams.get("role") || "buyer";
        if (!userId) return NextResponse.json({ items: [] });

        const record = await readBin();
        const items = Object.values(record?.negotiationsByConversation ?? {}) as any[];
        const filtered = items.filter((i) => {
            if (role === "seller") return i?.sellerId === userId;
            return i?.buyerId === userId;
        });

        return NextResponse.json({ items: filtered });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
