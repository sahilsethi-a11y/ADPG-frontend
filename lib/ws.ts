import { config } from "@/lib/config";

let ws: WebSocket | null = null;

export const getWS = () => {
    if (!ws || ws.readyState === WebSocket.CLOSED) {
        ws = new WebSocket(config.wsDomain);
    }
    return ws;
};
