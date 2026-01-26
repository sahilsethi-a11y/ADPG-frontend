import { buildURL, FetchError, RequestOptions } from "@/lib/api/shared";

async function clientRequest<T>(path: string, options: RequestOptions): Promise<T> {
    const { params, cacheRevalidate, ...rest } = options;
    const url = buildURL(path, params);

    const finalHeaders = new Headers(rest.headers);
    let body = options.body;

    if (body && typeof body === "object" && !(body instanceof FormData) && !(body instanceof Blob)) {
        body = JSON.stringify(body);
        finalHeaders.set("Content-Type", "application/json");
    }

    // support Next.js caching
    if (cacheRevalidate && typeof cacheRevalidate === "number") {
        rest.next = { revalidate: cacheRevalidate };
    }

    try {
        const res = await fetch(url, {
            ...rest,
            body,
            credentials: "include",
            headers: finalHeaders,
        });

        const contentType = res.headers.get("content-type");
        const data = contentType?.includes("json") ? await res.json() : await res.text();

        if (!res.ok) {
            const error: FetchError<typeof data> = {
                name: "FetchError",
                message: (typeof data === "string" && data) || `Request failed with status ${res.status}`,
                isFetchError: true,
                config: options,
                response: {
                    data,
                    status: res.status,
                    statusText: res.statusText,
                    headers: res.headers,
                    config: options,
                },
            };
            throw error;
        }

        return data as T;
    } catch (err) {
        // If it's a network error, the error doesn't have a response, so we handle it differently
        if (err instanceof Error && !(err as FetchError).isFetchError) {
            const networkError: FetchError = {
                name: err.name,
                message: err.message || "Network error or request blocked",
                isFetchError: true,
                config: options,
            };
            throw networkError;
        }
        throw err;
    }
}

export const api = {
    get: <T>(path: string, options?: RequestOptions) => clientRequest<T>(path, { method: "GET", ...options }),

    post: <T>(path: string, options?: RequestOptions) => clientRequest<T>(path, { method: "POST", ...options }),

    put: <T>(path: string, options?: RequestOptions) => clientRequest<T>(path, { method: "PUT", ...options }),

    patch: <T>(path: string, options?: RequestOptions) => clientRequest<T>(path, { method: "PATCH", ...options }),

    delete: <T>(path: string, options?: RequestOptions) => clientRequest<T>(path, { method: "DELETE", ...options }),
};
