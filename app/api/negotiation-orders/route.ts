import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const baseUrl = process.env.NEXT_PUBLIC_JSONBIN_BASE_URL || "https://api.jsonbin.io/v3";
const masterKey = process.env.JSONBIN_MASTER_KEY || process.env.NEXT_PUBLIC_JSONBIN_MASTER_KEY;
const binId = process.env.JSONBIN_BIN_ID;

type RecordShape = {
    cartsByConversation?: Record<string, unknown>;
    ordersByConversation?: Record<string, unknown>;
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

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get("role") || "buyer";
        const userId = (await cookies()).get("userToken")?.value || "";
        const record = await readBin();
        const orders = record?.ordersByConversation ?? {};

        const list = Object.values(orders).filter((o: any) => {
            if (!userId) return false;
            if (role === "seller") return o?.sellerId === userId;
            return o?.buyerId === userId;
        });

        return NextResponse.json({ orders: list });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as {
            conversationId?: string;
        };
        if (!body?.conversationId) {
            return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
        }

        const record = await readBin();
        const carts = record?.cartsByConversation ?? {};
        const cart = (carts as Record<string, any>)[body.conversationId];
        if (!cart) {
            return NextResponse.json({ error: "Cart not found" }, { status: 404 });
        }

        const orders = record?.ordersByConversation ?? {};
        const nextOrders = {
            ...orders,
            [body.conversationId]: {
                ...cart,
                status: "placed",
                createdAt: new Date().toISOString(),
            },
        };

        const nextCarts = { ...carts };
        delete (nextCarts as Record<string, unknown>)[body.conversationId];

        await writeBin({
            ...record,
            cartsByConversation: nextCarts,
            ordersByConversation: nextOrders,
        });

        return NextResponse.json({ status: "OK" });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
