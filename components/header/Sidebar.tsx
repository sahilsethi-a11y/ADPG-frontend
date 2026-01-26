"use client";

import { useState } from "react";
import { MenuIcon, CloseIcon } from "@/components/Icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
    { name: "Home", path: "/" },
    { name: "Vehicles", path: "/vehicles" },
    { name: "Get Started", path: "/signup" },
    { name: "Partner Networks", path: "/partner-network" },
    { name: "About Us", path: "/about-us" },
    { name: "FAQ", path: "/faq" },
    { name: "Contact Us", path: "/contact-us" },
];

export default function Sidebar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2"
                aria-label="Open menu"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu-panel"
                onClick={() => setIsMenuOpen((s) => !s)}>
                <MenuIcon className="h-4 w-4" />
            </button>

            {isMenuOpen && <button type="button" className="fixed z-2 inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />}
            <div
                className={`fixed right-0 top-0 z-10 h-full w-64 pt-6 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
                <button className="absolute right-2 top-3 bg-transparent border-none p-2 text-black" onClick={() => setIsMenuOpen(false)}>
                    <CloseIcon className="h-4 w-4" />
                </button>
                <aside id="mobile-menu-panel">
                    <nav className="px-2 py-3" aria-label="Mobile">
                        <ul className="space-y-1">
                            {menuItems.map((item) => (
                                <li key={item.name} className={pathname === item.path ? "bg-brand-blue text-white rounded-lg" : "text-brand-blue"}>
                                    <Link href={item.path} title={item.name} className="block rounded p-3 text-sm font-medium hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>
            </div>
        </>
    );
}
