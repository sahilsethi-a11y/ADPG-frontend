/* eslint-disable no-restricted-globals */
import { toBucketMeta } from "@/lib/bucketing";

type Msg =
    | { type: "BUCKET"; vehicles: Array<{ id: string; inventory: any; user?: any }> }
    | { type: "PING" };

self.onmessage = (event: MessageEvent<Msg>) => {
    const msg = event.data;
    if (msg.type === "PING") {
        self.postMessage({ type: "PONG" });
        return;
    }
    if (msg.type === "BUCKET") {
        const buckets = toBucketMeta(msg.vehicles, 30);
        self.postMessage({ type: "BUCKET_RESULT", buckets });
    }
};
