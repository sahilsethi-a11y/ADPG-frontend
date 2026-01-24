import type { NextConfig } from "next";
import { config } from "@/lib/config";

const nextConfig: NextConfig = {
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "preprodblobadp.blob.core.windows.net",
            },
            {
                protocol: "https",
                hostname: "example.com",
            },
        ],
    },
    // async rewrites() {
    //     return [
    //         {
    //             source: "/cors/:path*",
    //             destination: config.apiDomain + "/:path*",
    //         },
    //     ];
    // },
};

export default nextConfig;
