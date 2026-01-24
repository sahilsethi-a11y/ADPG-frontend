"use client";

import { useState } from "react";
import Image from "@/elements/Image";

export type Specification = {
    key: string;
    value: string;
    icon: string;
};

const COUNT = 6;

export default function VehicleSpecs({
    data,
}: Readonly<{ data: Specification[] }>) {
    const [filteredItem, setFilteredItem] = useState(data.slice(0, COUNT));

    return (
        <div className="bg-white rounded-xl border border-[rgba(36,39,44,0.1)] p-4 md:p-7.5">
            <h3 className="text-xl font-semibold text-black mb-6">
                Vehicle Specification
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-15.5 gap-y-4.5">
                {filteredItem.map((s) => (
                    <div
                        key={s.key}
                        className="flex items-center justify-between w-full"
                    >
                        <div className="flex items-center gap-3">   
                            <Image
                                width={20}
                                height={20}
                                src={s.icon}
                                alt={s.key}
                            />
                            <span className="text-3.25 text-black opacity-50">
                                {s.key}
                            </span>
                        </div>
                        <span className="text-3.23 text-black">{s.value}</span>
                    </div>
                ))}
            </div>
            {filteredItem.length < data.length && (
                <div className="pt-4.5">
                    <button
                        className="text-sm font-semibold text-brand-blue hover:underline"
                        onClick={() =>
                            setFilteredItem(data.slice(0, data.length))
                        }
                    >
                        Show More Specifications
                    </button>
                </div>
            )}
        </div>
    );
}
