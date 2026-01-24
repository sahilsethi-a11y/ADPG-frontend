"use client";

import { useSyncExternalStore } from "react";
import { vehicleStore } from "@/lib/vehicleStore";

const EMPTY_STATE: string[] = [];

export function useVehicle() {
    const vehicles = useSyncExternalStore(vehicleStore.subscribe, vehicleStore.getSnapshot, () => EMPTY_STATE);
    return {
        vehicles,
        addVehicle: vehicleStore.addVehicle,
        updateVehicles: vehicleStore.updateVehicles,
        clearVehicles: vehicleStore.clearVehicles,
        totalItems: vehicles.length,
    };
}
