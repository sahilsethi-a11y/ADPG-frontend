import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "@/app/globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/header/Header";
import { GoogleTagManager } from "@next/third-parties/google";
import { config } from "@/lib/config";
import GTMPageView from "@/components/GtmPageView";

const outfit = Outfit({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-outfit",
});

export const metadata: Metadata = {
    title: "Automarketplace - Your premier destination for buying and selling vehicles.",
    description: "Automarketplace - Your premier destination for buying and selling vehicles. Browse thousands of cars, trucks, and specialty vehicles from verified dealers and private sellers.",
    manifest: "/manifest.json",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
            <GoogleTagManager gtmId={config.gtmId} />
            <body className={`${outfit.variable} antialiased text-brand-blue`}>
                <GTMPageView />
                <Header />
                {children}
                <Footer />
            </body>
        </html>
    );
}
