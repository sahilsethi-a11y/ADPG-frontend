"use client";

import { useState } from "react";
import { DiscIcon } from "../Icons";
type propsT = {
    data: string[];
};

const COUNT = 6;

export default function FeaturesTable({ data }: Readonly<propsT>) {
    const [filteredItem, setFilteredItem] = useState(data.slice(0, COUNT));

    return (
        <div className="bg-white rounded-xl border border-[rgba(36,39,44,0.1)] p-0 overflow-hidden">
            <div className="p-7.5">
                <h3 className="text-xl font-semibold text-black mb-6">
                    Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 -mx-7.5">
                    {filteredItem.map((f, index) => (
                        <div
                            key={`${f}-${index}`}
                            className="p-7.5 py-4.5 border-r border-b border-[rgba(36,39,44,0.1)] nth-[3n]:border-r-0"
                        >
                            <div className="flex items-center gap-2">
                                <DiscIcon className="h-1.5 w-4.25 text-[#32bea6]" />
                                <span className="text-4.25 text-black wrap-break-word line-clamp-4">
                                    {f}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredItem.length < data.length && (
                    <div className="pt-4.5">
                        <button
                            className="text-sm font-semibold text-[#208bc9] hover:underline"
                            onClick={() =>
                                setFilteredItem(data.slice(0, data.length))
                            }
                        >
                            View all Features
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
