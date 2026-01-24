import { config } from "@/lib/config";

export const BASE_URL = config.apiDomain;

export interface RequestOptions extends Omit<RequestInit, "body"> {
    params?: Record<string, unknown>;
    isFormData?: boolean;
    cacheRevalidate?: number | false; // false = no-store
    isAuthRequired?: boolean;
    body?: BodyInit | Record<string, unknown> | null;
}

export interface FetchResponse<T = unknown> {
    data: T;
    status: number;
    statusText: string;
    headers: Headers;
    config: RequestOptions;
    errors?: [];
    message?: string;
}

export interface FetchError<T = unknown> extends Error {
    isFetchError: true;
    response?: FetchResponse<T>;
    config: RequestOptions;
}

export function buildURL(path: string, params?: RequestOptions["params"]) {
    // const isDev = process.env.NODE_ENV === "development";
    const isDev = false; // only for ssl issue in dev env

    const baseUrl = isDev ? "http://localhost:3000/cors/" : BASE_URL;
    path = isDev ? path.slice(1) : path;

    let url = new URL(path, baseUrl);

    if (params) {
        url = cleanSearchParams(
            url,
            params as Record<string, string | string[]>
        );
    }
    return url.toString();
}

const cleanSearchParams = (
    url: URL,
    params: Record<string, string | string[]>
) => {
    for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
            if (value.length === 0) continue;
            for (const v of value) {
                url.searchParams.append(key, v);
            }
        } else {
            if (!value) continue;
            url.searchParams.set(key, value);
        }
    }
    return url;
};
