"use client";

import Select from "@/elements/Select";
import { cn } from "@/lib/utils";

const sortOptions = [
    {
        value: "sortBy=price&sortOrder=asc",
        label: "Price: Low to High",
    },
    { value: "sortBy=price&sortOrder=desc", label: "Price: High to Low" },
    { value: "sortBy=mileage&sortOrder=asc", label: "Mileage: Low to High" },
    { value: "sortBy=mileage&sortOrder=desc", label: "Mileage: High to Low" },
    {
        value: "sortBy=year&sortOrder=desc",
        label: "Year: Newest First",
    },
    { value: "sortBy=year&sortOrder=asc", label: "Year: Oldest First" },
];

type PropsT = {
    count: number;
    handleSortChange: (value: string) => void;
    sortBy: string;
    className?: string;
};

export default function SortedBy({ count, sortBy, handleSortChange, className }: Readonly<PropsT>) {
    return (
        <div className={cn("flex justify-between items-center mb-6 mt-8", className)}>
           <h2 className="text-lg font-medium text-[#2d3648]"></h2>
            <div className="w-52">
                <Select options={sortOptions} value={sortBy} onChange={handleSortChange} placeholder="Sort by" border="bg-input-background" cls="w-full" />
            </div>
        </div>
    );
}
