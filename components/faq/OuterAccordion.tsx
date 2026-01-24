"use client";

import { ArrowDownIcon } from "@/components/Icons";

type PropsT = {
    title: string;
    icon: string;
    description: string
    isOpen: boolean;
    onClick: () => void;
    children: React.ReactNode;
};

export default function OuterAccordion({
    title,
    icon,
    description,
    isOpen,
    onClick,
    children,
}: Readonly<PropsT>) {
    return (
        <div className="border border-gray-200 rounded-lg mb-5">
            <button
                className="bg-white w-full text-foreground rounded-xl cursor-pointer hover:shadow-md transition-shadow border-0"
                onClick={onClick}
            >
                <div className="px-6 pt-6 pb-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start">
                            <div className="text-2xl mr-3 h-6 w-6">{icon}</div>
                            <div className="text-left">
                                <h4 className="leading-none text-brand-blue mb-1">
                                    {title}
                                </h4>
                                <p className="text-muted-foreground text-sm">
                                    {description}
                                </p>
                            </div>
                        </div>
                        <ArrowDownIcon
                            className={`h-5 w-5 text-brand-blue transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                                }`}
                        />
                    </div>
                </div>
            </button>
            {isOpen && <div className="pb-4">{children}</div>}
        </div>
    );
}
