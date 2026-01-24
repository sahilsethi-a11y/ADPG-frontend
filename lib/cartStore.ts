let count = 0;
const listeners = new Set<() => void>();

function notify() {
    for (const l of listeners) {
        l();
    }
}

export const cartStore = {
    // React reads this on each update
    getSnapshot: () => count,

    subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },

    // increase count
    addToCart: () => {
        count++;
        notify();
    },

    // reduce count
    removeFromCart: () => {
        count--;
        notify();
    },

    // set cart count
    setCart: (qty: number) => {
        count = qty;
        notify();
    },
};
