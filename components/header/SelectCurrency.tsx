"use client";
import { useRef, useState } from "react";
import { ArrowDownIcon } from "@/components/Icons";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api/client-request";

type Currency = {
    label: string;
    value: string;
    symbol: string;
};

const PATH_WITHOUT_CURRENCY = [
    "/about-us",
    "/signup",
    "/login",
    "/reset-password",
    "/terms-and-conditions",
    "/privacy-policy",
    "/cookie-policy",
    "/disclaimer",
    "/contact-us",
    "/faq",
    "/partner-network",
];

export default function CurrencySelector({ filters, selectedCurrency }: Readonly<{ filters: Record<string, unknown>; selectedCurrency: string }>) {
    const currencies = (filters?.currency ?? []) as Currency[];

    const pathname = usePathname();
    const isNotShowCurrencySelection = PATH_WITHOUT_CURRENCY.some((p) => pathname.startsWith(p));
    if (isNotShowCurrencySelection || pathname === "/" || !currencies?.length) return <></>;
    return <SelectCurrency currencies={currencies} selectedCurrency={selectedCurrency} />;
}

const SelectCurrency = ({ currencies, selectedCurrency }: { currencies: Currency[]; selectedCurrency: string }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useOutsideClick(ref, () => setOpen(false));

    const select = async (opt: Currency) => {
        await api.get("/api/v1/auth/setCurrency", { params: { value: opt.value } });
        globalThis.window.location.reload();
        setOpen(false);
    };

    const selected = currencies.find((o) => o.value === selectedCurrency) || currencies[0];

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary-600">
                <span className="text-sm">
                    {selected.symbol} {selected.value}
                </span>
                <ArrowDownIcon className={`h-4 w-4 transition-transform ${open ? "-rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 p-1 w-40 border-black/10 bg-white rounded-md border shadow-md overflow-hidden z-1">
                    {currencies.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            title={opt.label}
                            onClick={() => select(opt)}
                            className={`w-full flex items-center text-brand-blue justify-between gap-2 px-2 py-1.5 text-left text-sm rounded-sm ${
                                opt.value === selected.value ? "bg-accent" : "hover:bg-accent"
                            }`}>
                            <span className="text-sm">
                                {opt.symbol} {opt.value}
                            </span>
                            {opt.value === selected.value && <span className="h-2 w-2 rounded-full bg-brand-blue" aria-hidden="true" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
