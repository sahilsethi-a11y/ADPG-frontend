"use client";
import Link from "next/link";
import { CartIcon, MessageSquareIcon, SearchIcon } from "@/components/Icons";
import { JSX } from "react";

type Menu = {
    type: string;
    action?: () => void;
    label: string;
    active?: boolean;
    icon: JSX.Element;
    href?: string;
};

export default function QuickActions({
    variant = "horizontal",
}: Readonly<{ variant?: "horizontal" | "vertical" }>) {
    const actionMenu: Menu[] = [
        {
            type: "Link",
            href: "/vehicles",
            label: "Browse Vehicles",
            active: true,
            icon: <SearchIcon className="w-4 h-4 mr-2" />,
        },
        {
            type: "button",
            href: "#",
            label: "View Cart",
            icon: <CartIcon className="w-4 h-4 mr-2" />,
        },
        {
            type: "link",
            href: "/my-negotiations",
            label: "Manage Negotiations",
            icon: <MessageSquareIcon className="w-4 h-4" />,
        },
    ];
    const getClassName = (i: Menu) => {
        const base =
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors";
        if (i.active)
            return base + " bg-brand-blue text-white hover:bg-primary-hover";
        return base + " text-gray-700 hover:bg-gray-50 border border-gray-300";
    };
    return (
        <div>
            <div
                className={`gap-3 flex ${
                    variant === "vertical" ? "flex-col" : ""
                }`}
            >
                {actionMenu.map((i) =>
                    i.type === "button" ? (
                        <button
                            key={i.label}
                            type="button"
                            onClick={i.action}
                            disabled={i.label === "View Cart"}
                            className={getClassName(i)}
                        >
                            {i.icon}
                            {i.label}
                        </button>
                    ) : (
                        <Link
                            key={i.label}
                            href={i.href!}
                            className={getClassName(i)}
                        >
                            {i.icon}
                            {i.label}
                        </Link>
                    )
                )}
            </div>
        </div>
    );
}
