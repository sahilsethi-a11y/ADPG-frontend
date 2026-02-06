"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVehicleBuckets } from "@/hooks/useVehicleBuckets";

export default function VehiclesPrefetchOnMount() {
    const router = useRouter();
    useVehicleBuckets({ sortBy: "price", sortOrder: "asc", page: 1 }, { refreshOnMount: true });
    useEffect(() => {
        router.prefetch("/vehicles");
    }, []);

    return null;
}
