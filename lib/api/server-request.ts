import { cookies } from "next/headers";
import { buildURL, RequestOptions } from "@/lib/api/shared";
import { redirect } from "next/navigation";

async function getServerCookieHeader() {
    const cookieStore = await cookies();
    const allCookie = cookieStore.getAll();
    return allCookie.map(({ name, value }) => `${name}=${value}`).join("; ");
}

async function serverRequest<T>(path: string, options: RequestOptions): Promise<T> {
    const { params, isAuthRequired = true, cacheRevalidate, ...rest } = options;

    const url = buildURL(path, params);
    const finalHeaders = new Headers(rest.headers);

    // forward browser cookies to backend
    finalHeaders.set("Cookie", await getServerCookieHeader());

    // always JSON on server
    finalHeaders.set("Content-Type", "application/json");

    const body = rest.body && typeof rest.body === "object" ? JSON.stringify(rest.body) : rest.body;

    // support Next.js caching
    if (cacheRevalidate && typeof cacheRevalidate === "number") {
        rest.next = { revalidate: cacheRevalidate };
    }
    console.log("FETCHING URL:", url);
    const res = await fetch(url, {
        ...rest,
        headers: finalHeaders,
        body,
    });

    const contentType = res.headers.get("content-type");
    const data = contentType?.includes("json") ? await res.json() : await res.text();

    if (!res.ok) {
        //if user not authorized redirect it to login page
        if (isAuthRequired && res.status === 401) {
            redirect("/login");
        }
    }

    return data as T;
}

export const api = {
    get: <T>(path: string, options?: RequestOptions) => serverRequest<T>(path, { method: "GET", ...options }),

    post: <T>(path: string, options?: RequestOptions) => serverRequest<T>(path, { method: "POST", ...options }),
};
