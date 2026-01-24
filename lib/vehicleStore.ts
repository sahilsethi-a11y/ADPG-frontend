let vehicles: string[] = [];
const listeners = new Set<() => void>();

function notify() {
    for (const l of listeners) {
        l();
    }
}

export const vehicleStore = {
    // React reads this on each update
    getSnapshot: () => vehicles,

    subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },

    addVehicle: (id: string) => {
        const existing = vehicles.includes(id);

        if (existing) {
            vehicles = vehicles.filter((i) => i != id);
        } else {
            vehicles = [...vehicles, id];
        }

        notify();
    },

    updateVehicles: (newVehicles: string[]) => {
        vehicles = newVehicles;
        notify();
    },

    clearVehicles: () => {
        vehicles = [];
        notify();
    },
};
