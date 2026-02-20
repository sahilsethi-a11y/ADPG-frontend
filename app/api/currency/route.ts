import { NextResponse } from "next/server";

const ALLOWED = new Set(["AED", "USD", "CNY", "EUR"]);

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as { value?: string };
        const value = typeof body?.value === "string" ? body.value.trim().toUpperCase() : "";
        const selected = ALLOWED.has(value) ? value : "USD";

        const res = NextResponse.json({ ok: true, value: selected });
        res.cookies.set("currencyCookie", selected, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
            sameSite: "lax",
        });
        return res;
    } catch {
        return NextResponse.json({ ok: false }, { status: 400 });
    }
}
