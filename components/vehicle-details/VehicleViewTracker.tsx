"use client";
import { useEffect } from "react";
import { api } from "@/lib/api/client-request";

interface PropsT {
    vehicleId: string;
}

export default function VehicleViewTracker({ vehicleId }: PropsT) {
    useEffect(() => {
        if (!vehicleId) return;

        const STORAGE_KEY = "last_viewed_vehicle_id";

        try {
            const lastId = sessionStorage.getItem(STORAGE_KEY);

            if (lastId === vehicleId) return;

            sessionStorage.setItem(STORAGE_KEY, vehicleId);

            api.put(`/inventory/api/v1/inventory/increment-views?vehicleId=${vehicleId}`)
                .then(() => {
                    // console.log("View incremented");
                })
                .catch((err) => {
                    console.error("Error incrementing view:", err);
                });

        } catch (error) {
            console.error("Error accessing sessionStorage:", error);
        }

    }, [vehicleId]);

    return null;
}

