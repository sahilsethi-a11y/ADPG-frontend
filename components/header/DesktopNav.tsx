"use client";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowDownIcon } from "@/components/Icons";

const moreMenus = [
    { name: "Home", path: "/" },
    { name: "Partner Networks", path: "/partner-network" },
    { name: "About Us", path: "/about-us" },
    { name: "FAQ", path: "/faq" },
    { name: "Contact Us", path: "/contact-us" },
];

export default function DesktopNav({ isLoggedIn }: Readonly<{ isLoggedIn?: string }>) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);
    useOutsideClick(ref, () => setOpen(false));

    return (
        <nav className="hidden md:flex items-center space-x-8 grow justify-center" aria-label="Primary">
            <Link href="/vehicles" title="Vehicles" className="inline-block py-2 text-brand-blue text-base">
                Vehicles
            </Link>
            {!isLoggedIn && (
                <Link href="/signup" title="Get Started" className="inline-block py-2 text-brand-blue text-base">
                    Get Started
                </Link>
            )}
            <div className="relative" ref={ref}>
                <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    onClick={() => setOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-brand-blue hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary-600">
                    More <ArrowDownIcon className={`h-4 w-4 transition-transform ${open ? "-rotate-180" : ""}`} />
                </button>

                {open && (
                    <div className="absolute right-0 mt-2 p-1 w-40 border-black/10 bg-white rounded-md border shadow-md overflow-hidden z-1">
                        {moreMenus.map((i) => (
                            <Link
                                onClick={() => setOpen(false)}
                                key={i.name}
                                href={i.path}
                                title={i.name}
                                className="flex items-center text-brand-blue justify-between gap-2 px-2 py-1.5 text-left text-sm rounded-sm hover:bg-accent">
                                {i.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
}
