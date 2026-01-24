"use client";
import { HeartIcon } from "@/components/Icons";
import { api } from "@/lib/api/client-request";
import { useRouter } from "next/navigation";
import { useState } from "react";
type PropsT = {
    inventoryId?: string;
    onlyHeart?: boolean;
    cls?: string;
    isLike: boolean;
    iconCls?: string;
};

export default function ShortList({
    onlyHeart = false,
    cls,
    iconCls = "w-5 h-5",
    inventoryId,
    isLike: initialIsLike = false,
}: Readonly<PropsT>) {
    const router = useRouter();
    const [isLike, setIsLike] = useState(initialIsLike);
    const handleShortList = async () => {
        if (isLike) {
            try {
                await api.post<{ status: string }>(
                    "/inventory/api/v1/inventory/remove-favourites",
                    { body: { inventoryIds: [inventoryId] } }
                );
                setIsLike(false);
            } catch (err) {
                console.log(err);
            }
        } else {
            try {
                const res = await api.post<{ status: string }>(
                    "/inventory/api/v1/inventory/add-favourites",
                    { body: { inventoryIds: [inventoryId] } }
                );
                console.log(res, "shortlist");
                if (res.status !== "OK")
                    throw new Error("Something went wrong");
                setIsLike(true);
            } catch (err) {
                console.log(err);
                router.push("/login");
            }
        }
    };
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                handleShortList();
            }}
            className={`flex items-center gap-2  ${
                isLike ? "text-brand-blue" : "text-[#8f9193]"
            } ${cls}`}
        >
            <HeartIcon
                className={`${iconCls} ${isLike ? "fill-current" : ""}`}
            />
            {!onlyHeart && <span className="text-sm">Shortlist</span>}
        </button>
    );
}
