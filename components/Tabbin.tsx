"use client";
import { useState, ReactNode } from "react";

type TabProps = {
    label: string;
    panel: ReactNode;
};

type TabsProps = {
    items: TabProps[];
};

export default function Tabbin({ items }: Readonly<TabsProps>) {
    const tabs = Array.isArray(items) ? items : [items];
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <>
            <div className="bg-muted text-muted-foreground h-9 overflow-x-auto items-center rounded-xl p-1 w-full flex gap-2">
                {tabs?.map((tab: TabProps, index) => (
                    <button
                        key={tab?.label}
                        onClick={() => setActiveIndex(index)}
                        className={`text-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow]  ${
                            activeIndex === index && "bg-white"
                        }`}>
                        {tab?.label}
                    </button>
                ))}
            </div>
            {tabs[activeIndex].panel}
        </>
    );
}
