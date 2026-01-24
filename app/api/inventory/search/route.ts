import { config } from "@/lib/config";

export async function GET(request: Request) {
    const incomingUrl = new URL(request.url);
    const upstreamUrl = new URL("/inventory/api/v1/inventory/search", config.apiDomain);
    upstreamUrl.search = incomingUrl.searchParams.toString();

    const res = await fetch(upstreamUrl.toString(), {
        method: "GET",
        headers: {
            Cookie: request.headers.get("cookie") ?? "",
            "Content-Type": "application/json",
        },
    });

    const contentType = res.headers.get("content-type") ?? "";
    const isJson = contentType.includes("json");
    const body = isJson ? await res.json() : await res.text();

    if (isJson) {
        return new Response(JSON.stringify(body), {
            status: res.status,
            headers: { "content-type": "application/json" },
        });
    }

    return new Response(typeof body === "string" ? body : JSON.stringify(body), {
        status: res.status,
        headers: { "content-type": contentType || "text/plain" },
    });
}
