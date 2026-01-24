"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function GTMPageView() {
    const pathname = usePathname();

    useEffect(() => {
        const url = globalThis.window.location.href;
        globalThis.window.dataLayer?.push({
            event: "page_view",
            page_location: url,
        });
    }, [pathname]);

    return null;
}
