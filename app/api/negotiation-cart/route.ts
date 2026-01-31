import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const baseUrl = process.env.NEXT_PUBLIC_JSONBIN_BASE_URL || "https://api.jsonbin.io/v3";
const masterKey = process.env.JSONBIN_MASTER_KEY || process.env.NEXT_PUBLIC_JSONBIN_MASTER_KEY;
const binId = process.env.JSONBIN_BIN_ID;

type RecordShape = {
    cartsByConversation?: Record<string, unknown>;
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

export async function GET() {
    try {
        const userId = (await cookies()).get("userToken")?.value || "";
        const record = await readBin();
        const carts = record?.cartsByConversation ?? {};
        if (!userId) return NextResponse.json({ carts: [] });

        const list = Object.values(carts).filter((c: any) => c?.buyerId === userId);
        return NextResponse.json({ carts: list });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as Record<string, unknown>;
        const conversationId = body?.conversationId as string | undefined;
        if (!conversationId) {
            return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
        }

        const record = await readBin();
        const next = {
            ...(record?.cartsByConversation ?? {}),
            [conversationId]: {
                ...body,
                updatedAt: new Date().toISOString(),
            },
        };

        await writeBin({
            ...record,
            cartsByConversation: next,
        });

        return NextResponse.json({ status: "OK" });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get("conversationId");
        if (!conversationId) {
            return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
        }

        const record = await readBin();
        const carts = { ...(record?.cartsByConversation ?? {}) };
        delete (carts as Record<string, unknown>)[conversationId];

        await writeBin({
            ...record,
            cartsByConversation: carts,
        });

        return NextResponse.json({ status: "OK" });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
