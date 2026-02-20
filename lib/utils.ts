import { type ClassValue, clsx } from "clsx";
import { type SearchParams } from "next/dist/server/request/search-params";
import { twMerge } from "tailwind-merge";

const currencyLocaleMap: Record<string, string> = {
    CNY: "zh-CN", // Chinese Yuan
    EUR: "de-DE", // Euro (Germany format)
    USD: "en-US", // US Dollar
    AED: "ar-AE", // UAE Dirham
};

const usdPerCurrency: Record<string, number> = {
    USD: 1,
    AED: 0.272294,
    CNY: 0.139,
    EUR: 1.08,
};

const getCurrencyFromCookie = (cookieText?: string) => {
    if (!cookieText) return undefined;
    const match = cookieText.match(/(?:^|;\s*)currencyCookie=([^;]+)/);
    if (!match?.[1]) return undefined;
    return decodeURIComponent(match[1]);
};

export const normalizeCurrency = (currency?: string, fallback = "USD") => {
    const safeCurrency =
        typeof currency === "string" && currency.trim().length === 3 ? currency.trim().toUpperCase() : fallback;
    return usdPerCurrency[safeCurrency] ? safeCurrency : fallback;
};

export const convertCurrency = (amount: number | string, fromCurrency: string, toCurrency: string) => {
    const from = normalizeCurrency(fromCurrency);
    const to = normalizeCurrency(toCurrency);
    const numericAmount = Number(amount) || 0;
    if (from === to) return numericAmount;
    const amountInUsd = numericAmount * usdPerCurrency[from];
    return amountInUsd / usdPerCurrency[to];
};

const resolvePreferredCurrency = () => {
    if (typeof window === "undefined") return undefined;
    try {
        const fromLocal = window.localStorage.getItem("selectedCurrency");
        if (fromLocal) {
            const normalized = normalizeCurrency(fromLocal);
            if (usdPerCurrency[normalized]) return normalized;
        }
    } catch {}
    const fromCookie = getCurrencyFromCookie(document.cookie);
    if (fromCookie) {
        const normalized = normalizeCurrency(fromCookie);
        if (usdPerCurrency[normalized]) return normalized;
    }
    return undefined;
};

export const formatConvertedPrice = (
    amount: number | string,
    fromCurrency: string = "USD",
    toCurrency: string = fromCurrency,
    options?: Intl.NumberFormatOptions
) => {
    const normalizedToCurrency = normalizeCurrency(toCurrency, normalizeCurrency(fromCurrency));
    const converted = convertCurrency(amount, fromCurrency, normalizedToCurrency);
    try {
        return new Intl.NumberFormat(currencyLocaleMap[normalizedToCurrency] || "en-US", {
            style: "currency",
            currency: normalizedToCurrency,
            ...options,
        }).format(converted);
    } catch {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            ...options,
        }).format(converted);
    }
};

export const queryStringify = (params: Record<string, string | string[]>): string => {
    const query = Object.entries(params)
        .filter(([, value]) => value !== "" || value.length !== 0)
        .map(([key, value]) => {
            if (Array.isArray(value)) {
                return value.map((val) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
            }
            return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        })
        .join("&");
    return query ? `?${query}` : "";
};

export const downloadFile = (url?: string) => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.download = url.split("/").pop() || "document";
    document.body.appendChild(link);
    link.click();
    link.remove();
};

export const scrollToField = (field: string) => {
    // try by name=
    let el = document.querySelector(`[name="${field}"]`);

    // fallback: try by data-field=
    el ??= document.querySelector(`[data-field="${field}"]`);

    if (el && typeof el.scrollIntoView === "function") {
        el.scrollIntoView({ behavior: "smooth", block: "center" });

        // Optional: focus the field
        if ("focus" in el) {
            setTimeout(() => {
                (el as HTMLElement)?.focus?.();
            }, 200);
        }
    }
};

export const cn = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs));
};

export const cleanQueryParams = (obj: SearchParams) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
            if (value.length === 0) continue;
            for (const v of value) {
                query.append(key, v);
            }
        } else {
            if (!value) continue;
            query.set(key, value);
        }
    }
    return query.toString();
};

export const getDaysBetween = (date1: string | Date, date2: string | Date): number => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);

    const diffMs = d2.getTime() - d1.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

export const formatPrice = (price: number | string, sourceCurrency: string = "USD", targetCurrency?: string) =>
    formatConvertedPrice(price, sourceCurrency, targetCurrency ?? resolvePreferredCurrency() ?? sourceCurrency);
