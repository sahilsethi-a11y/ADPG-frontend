"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type PropsT = {
    tabs: { label: string; href: string }[];
    fullWidth?: boolean;
};

export default function Tabs({ tabs, fullWidth = false }: Readonly<PropsT>) {
    const pathname = usePathname();

    return (
        <nav className={cn("bg-muted text-foreground flex items-center w-fit rounded-full p-1 mb-8 overflow-auto whitespace-nowrap no-scrollbar", fullWidth && "w-full")}>
            {tabs.map((tab) => {
                const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn("flex items-center justify-center bg-transparent px-2 py-1 text-xs font-semibold rounded-full", fullWidth && "flex-1", isActive && "bg-background")}>
                        {tab.label}
                    </Link>
                );
            })}
        </nav>
    );
}
